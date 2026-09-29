const { validateCommitParams } = require('../src/middleware/validation.middleware');
const { ValidationError } = require('../src/utils/errors');

describe('validation.middleware.js', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {} };
    res = {};
    next = jest.fn();
  });

  test('calls next() for valid owner, repository, and 40-character hex SHA', () => {
    req.params = {
      owner: 'golemfactory',
      repository: 'clay',
      oid: 'a1bf367b3af680b1182cc52bb77ba095764a11f9'
    };

    validateCommitParams(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('returns ValidationError when owner is missing', () => {
    req.params = {
      repository: 'clay',
      oid: 'a1bf367b3af680b1182cc52bb77ba095764a11f9'
    };

    validateCommitParams(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('INVALID_PARAMETERS');
  });

  test('returns ValidationError when oid is not 40 characters', () => {
    req.params = {
      owner: 'golemfactory',
      repository: 'clay',
      oid: 'a1bf367b' // only 8 chars
    };

    validateCommitParams(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('INVALID_COMMIT_SHA');
    expect(error.statusCode).toBe(400);
  });

  test('returns ValidationError when oid contains uppercase or invalid characters', () => {
    req.params = {
      owner: 'golemfactory',
      repository: 'clay',
      oid: 'A1BF367B3AF680B1182CC52BB77BA095764A11F9' // uppercase not allowed by ^[0-9a-f]{40}$
    };

    validateCommitParams(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('INVALID_COMMIT_SHA');
  });
});
