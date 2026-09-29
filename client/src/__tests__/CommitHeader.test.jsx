import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommitHeader from '../components/CommitHeader';

describe('CommitHeader component', () => {
  const commit = {
    oid: 'a1bf367b3af680b1182cc52bb77ba095764a11f9',
    subject: 'Remove some wrappers from a previous abstraction (#14142)',
    body: 'This is body text explaining the architectural change.',
    author: {
      name: 'eseliger',
      email: 'eseliger@example.com',
      date: '2026-09-24T10:00:00Z',
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4'
    },
    committer: {
      name: 'renovate-bot',
      email: 'bot@renovateapp.com',
      date: '2026-09-25T10:00:00Z',
      avatarUrl: 'https://avatars.githubusercontent.com/u/99999?v=4'
    },
    parents: [
      { oid: 'ab003b92b05f0f517a5125a2bc78cda806329017' }
    ]
  };

  it('renders subject, author name, body text, commit SHA, and parent link', () => {
    render(
      <MemoryRouter>
        <CommitHeader commit={commit} owner="golemfactory" repository="clay" />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Remove some wrappers from a previous abstraction (#14142)')
    ).toBeInTheDocument();
    expect(screen.getByText('eseliger')).toBeInTheDocument();
    expect(
      screen.getByText('This is body text explaining the architectural change.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('a1bf367b3af680b1182cc52bb77ba095764a11f9')
    ).toBeInTheDocument();

    const parentLink = screen.getByText('ab003b92b05f0f517a5125a2bc78cda806329017');
    expect(parentLink).toBeInTheDocument();
    expect(parentLink.getAttribute('href')).toBe(
      '/repositories/golemfactory/clay/commit/ab003b92b05f0f517a5125a2bc78cda806329017'
    );
  });

  it('renders committer when different from author', () => {
    render(
      <MemoryRouter>
        <CommitHeader commit={commit} owner="golemfactory" repository="clay" />
      </MemoryRouter>
    );

    expect(screen.getByText('renovate-bot')).toBeInTheDocument();
    expect(screen.getByText(/Committed by/)).toBeInTheDocument();
  });

  it('does NOT render committer row if committer and author are identical', () => {
    const sameAuthorCommit = {
      ...commit,
      committer: {
        name: 'eseliger',
        email: 'eseliger@example.com',
        date: '2026-09-24T10:00:00Z',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4'
      }
    };

    render(
      <MemoryRouter>
        <CommitHeader commit={sameAuthorCommit} owner="golemfactory" repository="clay" />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Committed by/)).toBeNull();
  });
});
