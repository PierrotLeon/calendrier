/**
 * @file EventModal.test.jsx
 * @description Unit tests for the EventModal component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventModal from '../../components/EventModal';

const baseProps = {
  isOpen: true,
  initialData: null,
  selectedDate: new Date(2026, 1, 28),
  onSave: vi.fn(),
  onDelete: vi.fn(),
  onClose: vi.fn(),
  getAutoSuggestion: undefined,
};

describe('EventModal', () => {
  it('does not render when closed', () => {
    const { container } = render(<EventModal {...baseProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders with "New Event" title when no initialData', () => {
    render(<EventModal {...baseProps} />);
    expect(screen.getByText('New Event')).toBeInTheDocument();
  });

  it('renders with "Edit Event" title when initialData has an id', () => {
    render(
      <EventModal
        {...baseProps}
        initialData={{ id: '123', title: 'Existing', date: '2026-02-28' }}
      />,
    );
    expect(screen.getByText('Edit Event')).toBeInTheDocument();
  });

  it('pre-fills the date from selectedDate for new events', () => {
    render(<EventModal {...baseProps} />);
    const dateInput = screen.getByLabelText('Date');
    expect(dateInput.value).toBe('2026-02-28');
  });

  it('shows validation error when title is empty and form is submitted', async () => {
    render(<EventModal {...baseProps} />);
    await userEvent.click(screen.getByText('Create'));
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it('calls onSave with form data on valid submission', async () => {
    const onSave = vi.fn();
    render(<EventModal {...baseProps} onSave={onSave} />);

    const titleInput = screen.getByLabelText('Title');
    await userEvent.type(titleInput, 'My Event');
    await userEvent.click(screen.getByText('Create'));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave.mock.calls[0][0].title).toBe('My Event');
    expect(onSave.mock.calls[0][0].date).toBe('2026-02-28');
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<EventModal {...baseProps} onClose={onClose} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows Delete button only in edit mode', () => {
    const { rerender } = render(<EventModal {...baseProps} />);
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();

    rerender(
      <EventModal
        {...baseProps}
        initialData={{ id: '123', title: 'X', date: '2026-02-28' }}
      />,
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onDelete when Delete is clicked in edit mode', async () => {
    const onDelete = vi.fn();
    render(
      <EventModal
        {...baseProps}
        onDelete={onDelete}
        initialData={{ id: 'abc', title: 'Kill me', date: '2026-02-28' }}
      />,
    );
    await userEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('abc');
  });
});

/* ---- Autofill / suggestion banner tests ---- */

describe('EventModal — autofill suggestions', () => {
  const mockGetAutoSuggestion = vi.fn();

  const autofillProps = {
    ...baseProps,
    getAutoSuggestion: mockGetAutoSuggestion,
  };

  it('shows a suggestion banner when getAutoSuggestion returns a match', async () => {
    mockGetAutoSuggestion.mockReturnValue({
      ruleName: 'Meeting',
      color: '#4F46E5',
      startTime: '09:00',
      endTime: '10:00',
    });

    render(<EventModal {...autofillProps} />);
    const titleInput = screen.getByLabelText('Title');
    await userEvent.type(titleInput, 'Team meeting');

    expect(screen.getByTestId('suggestion-banner')).toBeInTheDocument();
    expect(screen.getByText(/Meeting/)).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('does not show a suggestion when getAutoSuggestion returns null', async () => {
    mockGetAutoSuggestion.mockReturnValue(null);

    render(<EventModal {...autofillProps} />);
    const titleInput = screen.getByLabelText('Title');
    await userEvent.type(titleInput, 'Random event');

    expect(screen.queryByTestId('suggestion-banner')).not.toBeInTheDocument();
  });

  it('hides the suggestion when Dismiss is clicked', async () => {
    mockGetAutoSuggestion.mockReturnValue({
      ruleName: 'Sport',
      color: '#059669',
      startTime: '07:00',
      endTime: '08:00',
    });

    render(<EventModal {...autofillProps} />);
    const titleInput = screen.getByLabelText('Title');
    await userEvent.type(titleInput, 'Morning gym');

    expect(screen.getByTestId('suggestion-banner')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Dismiss'));
    expect(screen.queryByTestId('suggestion-banner')).not.toBeInTheDocument();
  });

  it('applies the suggestion when Apply is clicked', async () => {
    mockGetAutoSuggestion.mockReturnValue({
      ruleName: 'Meeting',
      color: '#4F46E5',
      startTime: '09:00',
      endTime: '10:00',
    });

    render(<EventModal {...autofillProps} />);
    const titleInput = screen.getByLabelText('Title');
    await userEvent.type(titleInput, 'standup');

    await userEvent.click(screen.getByText('Apply'));

    // Banner should be dismissed after applying
    expect(screen.queryByTestId('suggestion-banner')).not.toBeInTheDocument();

    // Start/end time should be filled
    expect(screen.getByLabelText('Start time').value).toBe('09:00');
    expect(screen.getByLabelText('End time').value).toBe('10:00');
  });

  it('does not show suggestions in edit mode', async () => {
    mockGetAutoSuggestion.mockReturnValue({
      ruleName: 'Meeting',
      color: '#4F46E5',
      startTime: '09:00',
      endTime: '10:00',
    });

    render(
      <EventModal
        {...autofillProps}
        initialData={{ id: '123', title: 'Meeting', date: '2026-02-28' }}
      />,
    );

    expect(screen.queryByTestId('suggestion-banner')).not.toBeInTheDocument();
  });

  it('does not overwrite manually set time fields when Apply is clicked', async () => {
    mockGetAutoSuggestion.mockReturnValue({
      ruleName: 'Meeting',
      color: '#4F46E5',
      startTime: '09:00',
      endTime: '10:00',
    });

    render(<EventModal {...autofillProps} />);

    // Manually set start time first
    const startInput = screen.getByLabelText('Start time');
    await userEvent.clear(startInput);
    await userEvent.type(startInput, '14:00');

    // Then type a matching title
    const titleInput = screen.getByLabelText('Title');
    await userEvent.type(titleInput, 'sync');

    await userEvent.click(screen.getByText('Apply'));

    // Start time should keep the manual value
    expect(startInput.value).toBe('14:00');
    // End time should be set from suggestion
    expect(screen.getByLabelText('End time').value).toBe('10:00');
  });
});
