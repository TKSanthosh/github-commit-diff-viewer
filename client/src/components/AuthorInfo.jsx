import React from 'react';
import { formatRelativeTime, formatFullDate } from '../utils/date';

export default function AuthorInfo({ commit }) {
  if (!commit) return null;

  const { author, subject, body } = commit;
  const relativeDate = formatRelativeTime(author?.date);
  const fullDate = formatFullDate(author?.date);

  return (
    <div className="author-info-container">
      <div className="author-header-row">
        <img
          src={author?.avatarUrl || 'https://avatars.githubusercontent.com/u/0?v=4'}
          alt={author?.name || 'Author avatar'}
          className="author-avatar"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://avatars.githubusercontent.com/u/0?v=4';
          }}
        />
        <div className="author-title-group">
          <h1 className="commit-subject">{subject || 'No commit title'}</h1>
          <div className="authored-meta">
            <span className="authored-label">Authored by </span>
            <strong className="authored-name">{author?.name || 'Unknown'}</strong>
            {relativeDate && (
              <span className="authored-date" title={fullDate}>
                {' '}
                {relativeDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {body && <div className="commit-body">{body}</div>}
    </div>
  );
}
