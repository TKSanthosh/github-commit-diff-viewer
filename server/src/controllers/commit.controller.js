const commitService = require('../services/commit.service');

/**
 * Controller handling commit metadata and diff endpoints.
 */
class CommitController {
  constructor(service = commitService) {
    this.service = service;
  }

  /**
   * GET /repositories/:owner/:repository/commits/:oid
   */
  getCommit = async (req, res, next) => {
    try {
      const { owner, repository, oid } = req.params;
      const commit = await this.service.getCommitMetadata(owner, repository, oid);
      // According to Fleet Studio OpenAPI specification, commit response is an Array containing the Commit schema:
      return res.status(200).json([commit]);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /repositories/:owner/:repository/commits/:oid/diff
   */
  getCommitDiff = async (req, res, next) => {
    try {
      const { owner, repository, oid } = req.params;
      const differences = await this.service.getCommitDiff(owner, repository, oid);
      return res.status(200).json(differences);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CommitController();
module.exports.CommitController = CommitController;
