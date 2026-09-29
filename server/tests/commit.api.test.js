const request = require('supertest');
const app = require('../src/app');
const githubService = require('../src/services/github.service');
const { NotFoundError, RateLimitError } = require('../src/utils/errors');

jest.mock('../src/services/github.service');

describe('Commit and Diff API Endpoints', () => {
  const validSha = 'a1bf367b3af680b1182cc52bb77ba095764a11f9';
  const sampleGitHubResponse = {
    sha: validSha,
    commit: {
      message: 'feat: add user authentication (#42)\n\nDetailed description of JWT auth',
      author: {
        name: 'Alice Developer',
        email: 'alice@example.com',
        date: '2026-03-01T12:00:00Z'
      },
      committer: {
        name: 'GitHub Web',
        email: 'noreply@github.com',
        date: '2026-03-01T12:00:00Z'
      }
    },
    author: {
      avatar_url: 'https://avatars.githubusercontent.com/u/101?v=4',
      login: 'alice'
    },
    committer: {
      avatar_url: 'https://avatars.githubusercontent.com/u/102?v=4',
      login: 'github-web'
    },
    parents: [{ sha: '89600bf602242ef66a741589b5bf784e378e5ead' }],
    files: [
      {
        filename: 'src/auth.js',
        status: 'modified',
        patch: '@@ -1,3 +1,4 @@\n const a = 1;\n-const b = 2;\n+const b = 3;\n+const c = 4;\n const d = 5;'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /repositories/:owner/:repository/commits/:oid', () => {
    test('returns 400 when SHA does not match ^[0-9a-f]{40}$', async () => {
      const res = await request(app)
        .get('/repositories/golemfactory/clay/commits/invalid-sha-123')
        .expect(400);

      expect(res.body).toEqual({
        error: {
          code: 'INVALID_COMMIT_SHA',
          message: 'Commit SHA must be a 40-character hexadecimal value.'
        }
      });
    });

    test('returns 404 when repository or commit is not found', async () => {
      githubService.getCommit.mockRejectedValue(
        new NotFoundError('Repository or commit not found on GitHub.', 'NOT_FOUND')
      );

      const res = await request(app)
        .get(`/repositories/golemfactory/clay/commits/${validSha}`)
        .expect(404);

      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    test('returns 429 when GitHub rate limit is exceeded', async () => {
      githubService.getCommit.mockRejectedValue(
        new RateLimitError('GitHub API rate limit exceeded.')
      );

      const res = await request(app)
        .get(`/repositories/golemfactory/clay/commits/${validSha}`)
        .expect(429);

      expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('returns 200 with an array containing the Commit object', async () => {
      githubService.getCommit.mockResolvedValue(sampleGitHubResponse);

      const res = await request(app)
        .get(`/repositories/golemfactory/clay/commits/${validSha}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);

      const commit = res.body[0];
      expect(commit.oid).toBe(validSha);
      expect(commit.subject).toBe('feat: add user authentication (#42)');
      expect(commit.body).toBe('Detailed description of JWT auth');
      expect(commit.author.name).toBe('Alice Developer');
      expect(commit.committer.name).toBe('GitHub Web');
      expect(commit.parents).toEqual([{ oid: '89600bf602242ef66a741589b5bf784e378e5ead' }]);
    });
  });

  describe('GET /repositories/:owner/:repository/commits/:oid/diff', () => {
    test('returns 400 when SHA is invalid', async () => {
      const res = await request(app)
        .get('/repositories/golemfactory/clay/commits/shortsha/diff')
        .expect(400);

      expect(res.body.error.code).toBe('INVALID_COMMIT_SHA');
    });

    test('returns 200 with array of CombinedFileDifference objects', async () => {
      githubService.getCommit.mockResolvedValue(sampleGitHubResponse);

      const res = await request(app)
        .get(`/repositories/golemfactory/clay/commits/${validSha}/diff`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);

      const diff = res.body[0];
      expect(diff.changeKind).toBe('MODIFIED');
      expect(diff.baseFile).toEqual({ path: 'src/auth.js' });
      expect(diff.headFile).toEqual({ path: 'src/auth.js' });
      expect(diff.hunks).toHaveLength(1);
      expect(diff.hunks[0].lines).toHaveLength(5);
    });
  });

  describe('Health check and 404 routes', () => {
    test('GET /health returns 200 ok', async () => {
      const res = await request(app).get('/health').expect(200);
      expect(res.body.status).toBe('ok');
    });

    test('GET /undefined-route returns 404 with structured error', async () => {
      const res = await request(app).get('/unhandled').expect(404);
      expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    });
  });
});
