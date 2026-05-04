import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CheckboxTree } from '../components/CheckboxTree/CheckboxTree';
import type { ReasonNode } from '../types';

const tree: ReasonNode[] = [
  {
    id: 'fit',
    label: 'Fit',
    children: [
      {
        id: 'too-large',
        label: 'Too large',
        children: [
          { id: 'too-large-collar', label: 'Collar' },
          { id: 'too-large-sleeves', label: 'Sleeves' },
        ],
      },
      { id: 'too-small', label: 'Too small' },
    ],
  },
];

describe('CheckboxTree', () => {
  it('renders all node labels', () => {
    render(<CheckboxTree nodes={tree} checked={new Set()} onChange={() => {}} />);
    expect(screen.getByText('Fit')).toBeInTheDocument();
    expect(screen.getByText('Too large')).toBeInTheDocument();
    expect(screen.getByText('Collar')).toBeInTheDocument();
    expect(screen.getByText('Sleeves')).toBeInTheDocument();
    expect(screen.getByText('Too small')).toBeInTheDocument();
  });

  it('clicking a leaf calls onChange with that leaf added', async () => {
    const onChange = vi.fn();
    render(<CheckboxTree nodes={tree} checked={new Set()} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Collar'));
    expect(onChange).toHaveBeenCalledWith(new Set(['too-large-collar']));
  });

  it('clicking a parent (unchecked) checks all descendants', async () => {
    const onChange = vi.fn();
    render(<CheckboxTree nodes={tree} checked={new Set()} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Fit'));
    expect(onChange).toHaveBeenCalledWith(
      new Set(['too-large-collar', 'too-large-sleeves', 'too-small']),
    );
  });

  it('clicking a parent when all its leaves are checked unchecks all', async () => {
    const onChange = vi.fn();
    const allChecked = new Set(['too-large-collar', 'too-large-sleeves', 'too-small']);
    render(<CheckboxTree nodes={tree} checked={allChecked} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Fit'));
    expect(onChange).toHaveBeenCalledWith(new Set());
  });

  it('parent is indeterminate when some but not all children are checked', () => {
    render(
      <CheckboxTree nodes={tree} checked={new Set(['too-large-collar'])} onChange={() => {}} />,
    );
    const tooLargeCheckbox = screen.getByLabelText('Too large');
    expect((tooLargeCheckbox as HTMLInputElement).indeterminate).toBe(true);
  });

  it('grandparent is indeterminate when one deep leaf is checked', () => {
    render(
      <CheckboxTree nodes={tree} checked={new Set(['too-large-collar'])} onChange={() => {}} />,
    );
    const fitCheckbox = screen.getByLabelText('Fit');
    expect((fitCheckbox as HTMLInputElement).indeterminate).toBe(true);
  });

  it('sibling leaf is not indeterminate when unrelated leaf is checked', () => {
    render(
      <CheckboxTree nodes={tree} checked={new Set(['too-large-collar'])} onChange={() => {}} />,
    );
    const tooSmall = screen.getByLabelText('Too small') as HTMLInputElement;
    expect(tooSmall.checked).toBe(false);
    expect(tooSmall.indeterminate).toBe(false);
  });

  it('clicking an indeterminate parent checks all its descendants', async () => {
    const onChange = vi.fn();
    // only collar checked → too-large is indeterminate
    render(
      <CheckboxTree
        nodes={tree}
        checked={new Set(['too-large-collar'])}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByLabelText('Too large'));
    expect(onChange).toHaveBeenCalledWith(
      new Set(['too-large-collar', 'too-large-sleeves']),
    );
  });

  it('clicking a fully-checked parent unchecks its descendants only', async () => {
    const onChange = vi.fn();
    // too-large fully checked, too-small not checked
    render(
      <CheckboxTree
        nodes={tree}
        checked={new Set(['too-large-collar', 'too-large-sleeves'])}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByLabelText('Too large'));
    expect(onChange).toHaveBeenCalledWith(new Set([]));
  });
});
