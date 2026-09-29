const { mapToCommit } = require('../src/mappers/commit.mapper');

describe('commit.mapper.js', () => {
  const sampleGitHubCommit = {
    sha: 'a1bf367b3af680b1182cc52bb77ba095764a11f9',
    commit: {
      message: 'Initial header line\n\nDetailed explanation line 1\nDetailed explanation line 2',
      author: {
        name: 'Ryan Slade',
        email: 'ryanslade@example.com',
        date: '2020-10-22T16:45:31Z'
      },
      committer: {
        name: 'GitHub',
        email: 'noreply@github.com',
        date: '2020-10-22T16:45:31Z'
      }
    },
    author: {
      avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
      login: 'ryanslade'
    },
    committer: {
      avatar_url: 'https://avatars.githubusercontent.com/u/19864447?v=4',
      login: 'web-flow'
    },
    parents: [
      {
        sha: '89600bf602242ef66a741589b5bf784e378e5ead'
      }
    ]
  };

  test('correctly maps GitHub commit fields to Fleet Studio Commit schema', () => {
    const result = mapToCommit(sampleGitHubCommit);

    expect(result.oid).toBe('a1bf367b3af680b1182cc52bb77ba095764a11f9');
    expect(result.subject).toBe('Initial header line');
    expect(result.body).toBe('Detailed explanation line 1\nDetailed explanation line 2');

    expect(result.author).toEqual({
      name: 'Ryan Slade',
      email: 'ryanslade@example.com',
      date: '2020-10-22T16:45:31Z',
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4'
    });

    expect(result.committer).toEqual({
      name: 'GitHub',
      email: 'noreply@github.com',
      date: '2020-10-22T16:45:31Z',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19864447?v=4'
    });

    expect(result.parents).toEqual([
      { oid: '89600bf602242ef66a741589b5bf784e378e5ead' }
    ]);
  });

  test('handles single-line commit message with empty body', () => {
    const singleLineCommit = {
      sha: '1111222233334444555566667777888899990000',
      commit: {
        message: 'Simple one line commit',
        author: { name: 'Dev', email: 'dev@test.com', date: '2026-01-01T00:00:00Z' },
        committer: { name: 'Dev', email: 'dev@test.com', date: '2026-01-01T00:00:00Z' }
      },
      parents: []
    };

    const result = mapToCommit(singleLineCommit);
    expect(result.subject).toBe('Simple one line commit');
    expect(result.body).toBe('');
    expect(result.parents).toEqual([]);
    expect(result.author.avatarUrl).toContain('avatars.githubusercontent.com');
  });

  test('throws an error if ghCommit is not provided', () => {
    expect(() => mapToCommit(null)).toThrow('GitHub commit data is required for mapping.');
  });
});
