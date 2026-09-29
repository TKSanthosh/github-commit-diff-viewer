import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DiffLine from '../components/DiffLine';

describe('DiffLine component', () => {
  it('renders an added line with green highlight and correct line numbers', () => {
    const line = {
      baseLineNumber: null,
      headLineNumber: 42,
      content: '+const added = true;'
    };

    const { container } = render(
      <table>
        <tbody>
          <DiffLine line={line} language="javascript" />
        </tbody>
      </table>
    );

    const row = container.querySelector('tr');
    expect(row).toHaveClass('diff-line-add');

    const cells = container.querySelectorAll('td');
    expect(cells[0].textContent).toBe(''); // baseLineNumber is null
    expect(cells[1].textContent).toBe('42'); // headLineNumber is 42
    expect(cells[2].textContent).toContain('+const added = true;');
  });

  it('renders a deleted line with red highlight and base line number', () => {
    const line = {
      baseLineNumber: 15,
      headLineNumber: null,
      content: '-const removed = false;'
    };

    const { container } = render(
      <table>
        <tbody>
          <DiffLine line={line} language="javascript" />
        </tbody>
      </table>
    );

    const row = container.querySelector('tr');
    expect(row).toHaveClass('diff-line-del');

    const cells = container.querySelectorAll('td');
    expect(cells[0].textContent).toBe('15');
    expect(cells[1].textContent).toBe('');
    expect(cells[2].textContent).toContain('-const removed = false;');
  });

  it('renders a context line with both line numbers', () => {
    const line = {
      baseLineNumber: 10,
      headLineNumber: 10,
      content: ' console.log("hello");'
    };

    const { container } = render(
      <table>
        <tbody>
          <DiffLine line={line} language="javascript" />
        </tbody>
      </table>
    );

    const row = container.querySelector('tr');
    expect(row).toHaveClass('diff-line-context');

    const cells = container.querySelectorAll('td');
    expect(cells[0].textContent).toBe('10');
    expect(cells[1].textContent).toBe('10');
    expect(cells[2].textContent).toContain('console.log("hello");');
  });
});
