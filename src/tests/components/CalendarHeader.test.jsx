/**
 * @file CalendarHeader.test.jsx
 * @description Unit tests for the CalendarHeader component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarHeader from '../../components/CalendarHeader';
import { VIEW_MODES } from '../../constants';

const defaultProps = {
  currentDate: new Date(2026, 1, 15),
  viewMode: VIEW_MODES.MONTH,
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onToday: vi.fn(),
  onViewChange: vi.fn(),
  onToggleSidebar: vi.fn(),
  onOpenSettings: vi.fn(),
  isSidebarOpen: false,
};

describe('CalendarHeader', () => {
  it('displays the current month and year', () => {
    render(<CalendarHeader {...defaultProps} />);
    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });

  it('displays the brand name', () => {
    render(<CalendarHeader {...defaultProps} />);
    expect(screen.getByText('Calendrier')).toBeInTheDocument();
  });

  it('calls onPrev when the back button is clicked', async () => {
    const onPrev = vi.fn();
    render(<CalendarHeader {...defaultProps} onPrev={onPrev} />);
    await userEvent.click(screen.getByLabelText('Previous'));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNext when the forward button is clicked', async () => {
    const onNext = vi.fn();
    render(<CalendarHeader {...defaultProps} onNext={onNext} />);
    await userEvent.click(screen.getByLabelText('Next'));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onToday when the Today button is clicked', async () => {
    const onToday = vi.fn();
    render(<CalendarHeader {...defaultProps} onToday={onToday} />);
    await userEvent.click(screen.getByText('Today'));
    expect(onToday).toHaveBeenCalledOnce();
  });

  it('calls onViewChange with WEEK when Week button is clicked', async () => {
    const onViewChange = vi.fn();
    render(<CalendarHeader {...defaultProps} onViewChange={onViewChange} />);
    await userEvent.click(screen.getByText('Week'));
    expect(onViewChange).toHaveBeenCalledWith(VIEW_MODES.WEEK);
  });

  it('highlights the active view mode', () => {
    render(<CalendarHeader {...defaultProps} viewMode={VIEW_MODES.WEEK} />);
    expect(screen.getByText('Week')).toHaveClass('view-toggle__btn--active');
    expect(screen.getByText('Month')).not.toHaveClass('view-toggle__btn--active');
  });

  it('calls onToggleSidebar when sidebar toggle is clicked', async () => {
    const onToggleSidebar = vi.fn();
    render(<CalendarHeader {...defaultProps} onToggleSidebar={onToggleSidebar} />);
    await userEvent.click(screen.getByLabelText('Open sidebar'));
    expect(onToggleSidebar).toHaveBeenCalledOnce();
  });

  it('calls onOpenSettings when settings button is clicked', async () => {
    const onOpenSettings = vi.fn();
    render(<CalendarHeader {...defaultProps} onOpenSettings={onOpenSettings} />);
    await userEvent.click(screen.getByLabelText('Open settings'));
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });

  it('shows close icon when sidebar is open', () => {
    render(<CalendarHeader {...defaultProps} isSidebarOpen={true} />);
    const toggle = screen.getByLabelText('Close sidebar');
    expect(toggle.textContent).toBe('✕');
  });

  it('shows hamburger icon when sidebar is closed', () => {
    render(<CalendarHeader {...defaultProps} isSidebarOpen={false} />);
    const toggle = screen.getByLabelText('Open sidebar');
    expect(toggle.textContent).toBe('☰');
  });
});
