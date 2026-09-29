const { ValidationError } = require('../utils/errors');

const COMMIT_SHA_REGEX = /^[0-9a-f]{40}$/;
const OWNER_REPO_REGEX = /^[a-zA-Z0-9_.-]+$/;

/**
 * Middleware to validate owner, repository, and oid path parameters.
 */
function validateCommitParams(req, res, next) {
  const { owner, repository, oid } = req.params;

  if (!owner || !repository) {
    return next(new ValidationError('Owner and repository parameters are required.', 'INVALID_PARAMETERS'));
  }

  if (!OWNER_REPO_REGEX.test(owner) || !OWNER_REPO_REGEX.test(repository)) {
    return next(
      new ValidationError(
        'Owner and repository must contain only valid characters (alphanumeric, dash, underscore, dot).',
        'INVALID_PARAMETERS'
      )
    );
  }

  if (!oid) {
    return next(new ValidationError('Commit SHA (oid) parameter is required.', 'INVALID_COMMIT_SHA'));
  }

  if (!COMMIT_SHA_REGEX.test(oid)) {
    return next(
      new ValidationError(
        'Commit SHA must be a 40-character hexadecimal value.',
        'INVALID_COMMIT_SHA'
      )
    );
  }

  next();
}

module.exports = {
  validateCommitParams,
  COMMIT_SHA_REGEX
};
