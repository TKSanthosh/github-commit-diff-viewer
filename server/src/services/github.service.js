const {
  NotFoundError,
  RateLimitError,
  UpstreamError
} = require('../utils/errors');

class GitHubService {
  constructor(baseUrl = 'https://api.github.com', token = process.env.GITHUB_TOKEN) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Fetches full commit details (including files and patches) from GitHub REST API.
   *
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} sha - 40-character commit SHA
   * @returns {Promise<Object>} GitHub commit object
   */
  async getCommit(owner, repo, sha) {
    const url = `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`;

    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'FleetStudio-GitDiffViewer/1.0'
    };

    if (this.token && this.token.trim() !== '') {
      headers.Authorization = `Bearer ${this.token.trim()}`;
    }

    let response;
    try {
      response = await fetch(url, { method: 'GET', headers });
    } catch (networkError) {
      throw new UpstreamError(`Failed to reach GitHub API: ${networkError.message}`);
    }

    if (!response.ok) {
      const status = response.status;
      let errorBody = {};
      try {
        errorBody = await response.json();
      } catch (e) {
        errorBody = { message: response.statusText };
      }

      if (status === 404) {
        throw new NotFoundError(
          `Repository "${owner}/${repo}" or commit "${sha}" was not found on GitHub.`,
          'NOT_FOUND'
        );
      }

      if (status === 403 || status === 429) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        if (rateLimitRemaining === '0' || (errorBody.message && errorBody.message.includes('rate limit'))) {
          throw new RateLimitError(
            'GitHub API rate limit exceeded. Please configure a GITHUB_TOKEN or try again later.'
          );
        }
        throw new NotFoundError(
          `Access to repository "${owner}/${repo}" is forbidden. Repository may be private.`,
          'FORBIDDEN'
        );
      }

      throw new UpstreamError(
        errorBody.message || `GitHub API responded with status ${status}.`
      );
    }

    return await response.json();
  }
}

// Export singleton instance using environment configuration, while exposing class for test mocking
module.exports = new GitHubService();
module.exports.GitHubService = GitHubService;
