import React from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeTime, formatFullDate } from '../utils/date';

export default function CommitMetadata({ commit, owner, repository }) {
  if (!commit) return null;

  const { oid, author, committer, parents } = commit;

  // Check if committer is different from author or author date
  const isCommitterDifferent =
    committer &&
    (committer.name !== author?.name || committer.date !== author?.date);

  const committerRelativeDate = formatRelativeTime(committer?.date);
  const committerFullDate = formatFullDate(committer?.date);

  return (
    <div className="commit-metadata-container">
      {isCommitterDifferent && (
        <div className="committer-row">
          <span className="committer-label">Committed by </span>
          <strong className="committer-name">{committer.name}</strong>
          {committerRelativeDate && (
            <span className="committer-date" title={committerFullDate}>
              {' '}
              {committerRelativeDate}
            </span>
          )}
        </div>
      )}

      <div className="meta-row">
        <span className="meta-label">Commit </span>
        <span className="meta-oid">{oid}</span>
      </div>

      {parents && parents.length > 0 && (
        <div className="meta-row parent-row">
          <span className="meta-label">Parent </span>
          <div className="parent-links-group">
            {parents.map((p, idx) => (
              <span key={p.oid || idx} className="parent-item">
                <Link
                  to={`/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commit/${p.oid}`}
                  className="parent-link"
                >
                  {p.oid}
                </Link>
                {idx < parents.length - 1 && ' '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
