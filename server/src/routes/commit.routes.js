const express = require('express');
const commitController = require('../controllers/commit.controller');
const { validateCommitParams } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * Route: GET /repositories/:owner/:repository/commits/:oid
 * Retrieves commit metadata.
 */
router.get(
  '/repositories/:owner/:repository/commits/:oid',
  validateCommitParams,
  commitController.getCommit
);

/**
 * Route: GET /repositories/:owner/:repository/commits/:oid/diff
 * Retrieves file-level diff hunks for the commit.
 */
router.get(
  '/repositories/:owner/:repository/commits/:oid/diff',
  validateCommitParams,
  commitController.getCommitDiff
);

module.exports = router;
