import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ReasonPicker } from '../components/ReasonPicker/ReasonPicker';
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
  {
    id: 'item-damaged',
    label: 'Item damaged',
    children: [{ id: 'ripped', label: 'Ripped' }],
  },
];

describe('ReasonPicker', () => {
  it('is closed by default — tree not visible', () => {
    render(<ReasonPicker reasons={tree} selectedLeafIds={[]} onChange={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the tree on trigger click', async () => {
    render(<ReasonPicker reasons={tree} selectedLeafIds={[]} onChange={() => {}} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Fit')).toBeInTheDocument();
  });

  it('shows "Fit > All" chip when all Fit leaves are selected', () => {
    render(
      <ReasonPicker
        reasons={tree}
        selectedLeafIds={['too-large-collar', 'too-large-sleeves', 'too-small']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Fit > All')).toBeInTheDocument();
  });

  it('shows partial chip label when only one leaf selected', () => {
    render(
      <ReasonPicker
        reasons={tree}
        selectedLeafIds={['too-large-collar']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Fit > Too large > Collar')).toBeInTheDocument();
  });

  it('calls onChange when a leaf is selected in the tree', async () => {
    const onChange = vi.fn();
    render(<ReasonPicker reasons={tree} selectedLeafIds={[]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByLabelText('Ripped'));
    expect(onChange).toHaveBeenCalledWith(['ripped']);
  });

  it('closes when clicking outside', async () => {
    render(
      <div>
        <ReasonPicker reasons={tree} selectedLeafIds={[]} onChange={() => {}} />
        <button>Outside</button>
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: /select reasons/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
