/**
 * @file SettingsPanel.test.jsx
 * @description Unit tests for the SettingsPanel component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPanel from '../../components/SettingsPanel';

const sampleRules = [
  { id: '1', name: 'Meeting', pattern: 'meeting|sync', color: '#4F46E5', startTime: '09:00', endTime: '10:00', enabled: true },
  { id: '2', name: 'Sport', pattern: 'gym|run', color: '#059669', startTime: '07:00', endTime: '08:00', enabled: false },
];

const defaultProps = {
  isOpen: true,
  rules: sampleRules,
  onAddRule: vi.fn(),
  onUpdateRule: vi.fn(),
  onDeleteRule: vi.fn(),
  onResetDefaults: vi.fn(),
  onClose: vi.fn(),
};

describe('SettingsPanel', () => {
  it('does not render when closed', () => {
    const { container } = render(<SettingsPanel {...defaultProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the panel title when open', () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText('Event Type Rules')).toBeInTheDocument();
  });

  it('displays all provided rules', () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText('Meeting')).toBeInTheDocument();
    expect(screen.getByText('Sport')).toBeInTheDocument();
  });

  it('displays regex patterns', () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText(/meeting\|sync/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<SettingsPanel {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText('Close settings'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when clicking the overlay', async () => {
    const onClose = vi.fn();
    render(<SettingsPanel {...defaultProps} onClose={onClose} />);
    // The modal-overlay div itself has the onClick handler.
    // We need to click the overlay, not the inner panel.
    // Use fireEvent since userEvent may bubble into children.
    const { fireEvent } = await import('@testing-library/react');
    const overlay = document.querySelector('.modal-overlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onDeleteRule when Delete button is clicked', async () => {
    const onDeleteRule = vi.fn();
    render(<SettingsPanel {...defaultProps} onDeleteRule={onDeleteRule} />);
    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]);
    expect(onDeleteRule).toHaveBeenCalledWith('1');
  });

  it('enters edit mode when Edit button is clicked', async () => {
    render(<SettingsPanel {...defaultProps} />);
    const editButtons = screen.getAllByText('Edit');
    await userEvent.click(editButtons[0]);
    // Should now show Save button and a Cancel button within the edit form
    expect(screen.getByText('Save')).toBeInTheDocument();
    // Multiple "Cancel" elements exist — check that at least one is in the edit form
    const cancelButtons = screen.getAllByText('Cancel');
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onResetDefaults when "Reset to Defaults" is clicked', async () => {
    const onResetDefaults = vi.fn();
    render(<SettingsPanel {...defaultProps} onResetDefaults={onResetDefaults} />);
    await userEvent.click(screen.getByText('Reset to Defaults'));
    expect(onResetDefaults).toHaveBeenCalledOnce();
  });

  it('calls onAddRule when "+ Add Rule" is clicked', async () => {
    const onAddRule = vi.fn();
    render(<SettingsPanel {...defaultProps} onAddRule={onAddRule} />);
    await userEvent.click(screen.getByText('+ Add Rule'));
    expect(onAddRule).toHaveBeenCalledOnce();
  });

  it('calls onUpdateRule with toggled enabled when toggle is clicked', async () => {
    const onUpdateRule = vi.fn();
    render(<SettingsPanel {...defaultProps} onUpdateRule={onUpdateRule} />);
    // First toggle should be checked (Meeting is enabled)
    const toggles = screen.getAllByRole('checkbox');
    await userEvent.click(toggles[0]);
    expect(onUpdateRule).toHaveBeenCalledWith('1', { enabled: false });
  });
});
