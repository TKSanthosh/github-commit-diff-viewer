import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CommitPage from '../pages/CommitPage';
import * as api from '../services/api';

vi.mock('../services/api');

describe('CommitPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially and then displays commit data', async () => {
    const mockCommit = {
      oid: 'a1bf367b3af680b1182cc52bb77ba095764a11f9',
      subject: 'Test commit subject',
      body: 'Test commit body',
      author: {
        name: 'Tester',
        email: 'tester@test.com',
        date: '2026-01-01T00:00:00Z',
        avatarUrl: ''
      },
      committer: {
        name: 'Tester',
        email: 'tester@test.com',
        date: '2026-01-01T00:00:00Z',
        avatarUrl: ''
      },
      parents: []
    };

    const mockDiff = [
      {
        changeKind: 'MODIFIED',
        baseFile: { path: 'file1.js' },
        headFile: { path: 'file1.js' },
        hunks: [
          {
            header: '@@ -1,1 +1,1 @@',
            lines: [{ baseLineNumber: 1, headLineNumber: 1, content: ' test' }]
          }
        ]
      }
    ];

    api.fetchCommitDetails.mockResolvedValueOnce({
      commit: mockCommit,
      diff: mockDiff
    });

    render(
      <MemoryRouter initialEntries={['/repositories/owner/repo/commit/a1bf367b3af680b1182cc52bb77ba095764a11f9']}>
        <Routes>
          <Route
            path="/repositories/:owner/:repository/commit/:commitSHA"
            element={<CommitPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading commit details/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test commit subject')).toBeInTheDocument();
      expect(screen.getByText('file1.js')).toBeInTheDocument();
    });
  });

  it('renders error state when API fails with 404', async () => {
    api.fetchCommitDetails.mockRejectedValueOnce({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Commit not found on GitHub'
    });

    render(
      <MemoryRouter initialEntries={['/repositories/owner/repo/commit/a1bf367b3af680b1182cc52bb77ba095764a11f9']}>
        <Routes>
          <Route
            path="/repositories/:owner/:repository/commit/:commitSHA"
            element={<CommitPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Commit or Repository Not Found/i)).toBeInTheDocument();
      expect(screen.getByText('Commit not found on GitHub')).toBeInTheDocument();
    });
  });
});
