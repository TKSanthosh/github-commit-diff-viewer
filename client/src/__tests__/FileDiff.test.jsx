import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileDiff from '../components/FileDiff';

describe('FileDiff component', () => {
  const diffItem = {
    changeKind: 'MODIFIED',
    baseFile: { path: 'internal/service.go' },
    headFile: { path: 'internal/service.go' },
    hunks: [
      {
        header: '@@ -10,3 +10,4 @@ func Run() {',
        lines: [
          { baseLineNumber: 10, headLineNumber: 10, content: '   fmt.Println("start")' },
          { baseLineNumber: null, headLineNumber: 11, content: '+  fmt.Println("step")' },
          { baseLineNumber: 11, headLineNumber: 12, content: '   fmt.Println("end")' }
        ]
      }
    ]
  };

  it('renders file path, hunk header, and collapsible state', () => {
    render(<FileDiff diffItem={diffItem} />);

    expect(screen.getByText('internal/service.go')).toBeInTheDocument();
    expect(screen.getByText('@@ -10,3 +10,4 @@ func Run() {')).toBeInTheDocument();

    // Verify collapsible behavior
    const header = screen.getByRole('button', { name: /internal\/service\.go/i });
    fireEvent.click(header);

    // Diff table should now be hidden
    expect(screen.queryByText('@@ -10,3 +10,4 @@ func Run() {')).toBeNull();

    // Click again to expand
    fireEvent.click(header);
    expect(screen.getByText('@@ -10,3 +10,4 @@ func Run() {')).toBeInTheDocument();
  });

  it('renders binary/non-text placeholder when file has no hunks', () => {
    const binaryItem = {
      changeKind: 'ADDED',
      baseFile: null,
      headFile: { path: 'assets/hero.png' },
      hunks: []
    };

    render(<FileDiff diffItem={binaryItem} />);

    expect(screen.getByText('assets/hero.png')).toBeInTheDocument();
    expect(
      screen.getByText(/Binary or non-text change — no textual diff available to display./i)
    ).toBeInTheDocument();
  });
});
