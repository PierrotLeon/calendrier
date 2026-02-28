/**
 * @file CalendarGrid.test.jsx
 * @description Unit tests for the CalendarGrid component.
 *
 * Tests cover:
 * - Weekday headers rendering
 * - Day cells rendering
 * - selectedDate prop is forwarded to DayCell
 * - Click delegation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarGrid from '../../components/CalendarGrid';

/** Generate 7 consecutive days starting from a given ISO date. */
function weekOf(isoStart) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(`${isoStart}T00:00:00`);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

const baseProps = {
  days: weekOf('2026-02-23'),        // Mon 23 → Sun 1 Mar
  currentDate: new Date('2026-02-01T00:00:00'),
  selectedDate: null,
  events: [],
  onDayClick: vi.fn(),
  viewMode: 'month',
};

describe('CalendarGrid', () => {
  it('renders weekday column headers in French', () => {
    render(<CalendarGrid {...baseProps} />);
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('Mer')).toBeInTheDocument();
    expect(screen.getByText('Jeu')).toBeInTheDocument();
    expect(screen.getByText('Ven')).toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
    expect(screen.getByText('Dim')).toBeInTheDocument();
  });

  it('renders one DayCell for each day in the days array', () => {
    const { container } = render(<CalendarGrid {...baseProps} />);
    const cells = container.querySelectorAll('.day-cell');
    expect(cells.length).toBe(7);
  });

  it('renders the correct day numbers', () => {
    render(<CalendarGrid {...baseProps} />);
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('passes selectedDate through so the selected cell gets the class', () => {
    const { container } = render(
      <CalendarGrid
        {...baseProps}
        selectedDate={new Date('2026-02-25T00:00:00')}
      />,
    );
    const selectedCells = container.querySelectorAll('.day-cell--selected');
    expect(selectedCells.length).toBe(1);
  });

  it('no cell is selected when selectedDate is null', () => {
    const { container } = render(
      <CalendarGrid {...baseProps} selectedDate={null} />,
    );
    const selectedCells = container.querySelectorAll('.day-cell--selected');
    expect(selectedCells.length).toBe(0);
  });

  it('calls onDayClick when a day cell is clicked', async () => {
    const onDayClick = vi.fn();
    render(<CalendarGrid {...baseProps} onDayClick={onDayClick} />);
    const dayCells = screen.getAllByRole('button');
    await userEvent.click(dayCells[0]);
    expect(onDayClick).toHaveBeenCalledOnce();
  });

  it('has the grid role for accessibility', () => {
    render(<CalendarGrid {...baseProps} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
