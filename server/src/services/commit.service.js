const githubService = require('./github.service');
const { mapToCommit } = require('../mappers/commit.mapper');
const { mapToCombinedFileDifferences } = require('../mappers/diff.mapper');

class CommitService {
  constructor(service = githubService) {
    this.githubService = service;
  }

  /**
   * Fetches and maps commit metadata.
   *
   * @param {string} owner - Repository owner
   * @param {string} repository - Repository name
   * @param {string} oid - Commit SHA
   * @returns {Promise<Object>} Commit object
   */
  async getCommitMetadata(owner, repository, oid) {
    const rawCommit = await this.githubService.getCommit(owner, repository, oid);
    return mapToCommit(rawCommit);
  }

  /**
   * Fetches and maps commit file differences.
   *
   * @param {string} owner - Repository owner
   * @param {string} repository - Repository name
   * @param {string} oid - Commit SHA
   * @returns {Promise<Array<Object>>} Array of CombinedFileDifference
   */
  async getCommitDiff(owner, repository, oid) {
    const rawCommit = await this.githubService.getCommit(owner, repository, oid);
    return mapToCombinedFileDifferences(rawCommit.files);
  }
}

module.exports = new CommitService();
module.exports.CommitService = CommitService;
