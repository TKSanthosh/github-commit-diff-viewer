/**
 * Maps a GitHub API commit response to the Fleet Studio Commit schema.
 *
 * @param {Object} ghCommit - Raw commit object from GitHub API
 * @returns {Object} Fleet Studio Commit object
 */
function mapToCommit(ghCommit) {
  if (!ghCommit) {
    throw new Error('GitHub commit data is required for mapping.');
  }

  const message = ghCommit.commit?.message || '';
  const messageLines = message.split(/\r?\n/);
  const subject = messageLines[0] || '';
  
  // Body is all remaining lines without the initial empty separator line
  let body = '';
  if (messageLines.length > 1) {
    const remaining = messageLines.slice(1);
    // Remove leading empty lines
    while (remaining.length > 0 && remaining[0].trim() === '') {
      remaining.shift();
    }
    body = remaining.join('\n');
  }

  const defaultAvatar = 'https://avatars.githubusercontent.com/u/0?v=4';

  const author = {
    name: ghCommit.commit?.author?.name || ghCommit.author?.login || 'Unknown',
    email: ghCommit.commit?.author?.email || 'noreply@github.com',
    date: ghCommit.commit?.author?.date || new Date().toISOString(),
    avatarUrl: ghCommit.author?.avatar_url || defaultAvatar
  };

  const committer = {
    name: ghCommit.commit?.committer?.name || ghCommit.committer?.login || 'Unknown',
    email: ghCommit.commit?.committer?.email || 'noreply@github.com',
    date: ghCommit.commit?.committer?.date || new Date().toISOString(),
    avatarUrl: ghCommit.committer?.avatar_url || defaultAvatar
  };

  const parents = Array.isArray(ghCommit.parents)
    ? ghCommit.parents.map((p) => ({ oid: p.sha }))
    : [];

  return {
    oid: ghCommit.sha,
    subject,
    body,
    parents,
    author,
    committer
  };
}

module.exports = {
  mapToCommit
};
