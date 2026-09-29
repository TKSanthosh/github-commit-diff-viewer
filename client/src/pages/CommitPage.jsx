import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCommitDetails } from '../services/api';
import CommitHeader from '../components/CommitHeader';
import FileDiff from '../components/FileDiff';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyDiffState from '../components/EmptyDiffState';

export default function CommitPage() {
  const { owner, repository, commitSHA } = useParams();

  const [commit, setCommit] = useState(null);
  const [diff, setDiff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCommitData = useCallback(async () => {
    if (!owner || !repository || !commitSHA) {
      setError({
        status: 400,
        code: 'MISSING_PARAMS',
        message: 'Owner, repository, and commit SHA parameters are required.'
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCommitDetails(owner, repository, commitSHA);
      setCommit(data.commit);
      setDiff(data.diff || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [owner, repository, commitSHA]);

  useEffect(() => {
    loadCommitData();
  }, [loadCommitData]);

  return (
    <main className="commit-page-container">
      <div className="commit-page-content">
        {loading && <LoadingState />}

        {!loading && error && (
          <ErrorState error={error} onRetry={loadCommitData} />
        )}

        {!loading && !error && commit && (
          <>
            <CommitHeader
              commit={commit}
              owner={owner}
              repository={repository}
            />

            <section className="files-changed-section">
              {diff.length === 0 ? (
                <EmptyDiffState />
              ) : (
                <div className="files-diff-list">
                  {diff.map((item, index) => {
                    const key =
                      item.headFile?.path ||
                      item.baseFile?.path ||
                      `file-${index}`;
                    return <FileDiff key={key} diffItem={item} />;
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
