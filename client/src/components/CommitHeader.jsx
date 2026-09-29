import React from 'react';
import AuthorInfo from './AuthorInfo';
import CommitMetadata from './CommitMetadata';

export default function CommitHeader({ commit, owner, repository }) {
  if (!commit) return null;

  return (
    <header className="commit-header">
      <div className="commit-header-left">
        <AuthorInfo commit={commit} />
      </div>
      <div className="commit-header-right">
        <CommitMetadata commit={commit} owner={owner} repository={repository} />
      </div>
    </header>
  );
}
