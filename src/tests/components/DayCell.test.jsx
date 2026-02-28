/**
 * @file DayCell.test.jsx
 * @description Unit tests for the DayCell component.
 *
 * Tests cover:
 * - Basic rendering (day number, event chips)
 * - Today highlight
 * - Selected-date highlight (ring / class)
 * - Combined today + selected state
 * - Outside-month styling
 * - Click and keyboard interaction
 * - Multi-day event chip variants
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DayCell from '../../components/DayCell';

/** Helper: create a Date at midnight on a given ISO string. */
const d = (iso) => new Date(`${iso}T00:00:00`);

/** Minimal event factory for testing. */
const makeEvent = (overrides) => ({
  id: 'evt-1',
  title: 'Test Event',
  startDate: '2026-02-28',
  endDate: '2026-02-28',
  date: '2026-02-28',
  startTime: '09:00',
  endTime: '10:00',
  color: '#4F46E5',
  ...overrides,
});

const baseProps = {
  day: d('2026-02-15'),
  currentDate: d('2026-02-01'),
  selectedDate: null,
  events: [],
  onDayClick: vi.fn(),
};

describe('DayCell', () => {
  /* ---------------------------------------------------------------- */
  /*  Basic rendering                                                  */
  /* ---------------------------------------------------------------- */

  it('renders the day number', () => {
    render(<DayCell {...baseProps} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders event chips for matching events', () => {
    const events = [makeEvent({ startDate: '2026-02-15', endDate: '2026-02-15', date: '2026-02-15' })];
    render(<DayCell {...baseProps} events={events} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders "+N more" when there are more than 2 events', () => {
    const events = [
      makeEvent({ id: '1', title: 'A', startDate: '2026-02-15', endDate: '2026-02-15', date: '2026-02-15' }),
      makeEvent({ id: '2', title: 'B', startDate: '2026-02-15', endDate: '2026-02-15', date: '2026-02-15' }),
      makeEvent({ id: '3', title: 'C', startDate: '2026-02-15', endDate: '2026-02-15', date: '2026-02-15' }),
    ];
    render(<DayCell {...baseProps} events={events} />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  /* ---------------------------------------------------------------- */
  /*  Today / Selected / Outside states                                */
  /* ---------------------------------------------------------------- */

  it('applies day-cell--today class when the day is today', () => {
    const today = new Date();
    const { container } = render(
      <DayCell {...baseProps} day={today} currentDate={today} />,
    );
    expect(container.firstChild).toHaveClass('day-cell--today');
  });

  it('does NOT apply day-cell--selected when selectedDate is null', () => {
    const { container } = render(
      <DayCell {...baseProps} selectedDate={null} />,
    );
    expect(container.firstChild).not.toHaveClass('day-cell--selected');
  });

  it('applies day-cell--selected when selectedDate matches the day', () => {
    const { container } = render(
      <DayCell {...baseProps} selectedDate={d('2026-02-15')} />,
    );
    expect(container.firstChild).toHaveClass('day-cell--selected');
  });

  it('does NOT apply day-cell--selected when selectedDate is a different day', () => {
    const { container } = render(
      <DayCell {...baseProps} selectedDate={d('2026-02-20')} />,
    );
    expect(container.firstChild).not.toHaveClass('day-cell--selected');
  });

  it('applies both day-cell--today and day-cell--selected simultaneously', () => {
    const today = new Date();
    const { container } = render(
      <DayCell {...baseProps} day={today} currentDate={today} selectedDate={today} />,
    );
    expect(container.firstChild).toHaveClass('day-cell--today');
    expect(container.firstChild).toHaveClass('day-cell--selected');
  });

  it('applies day-cell--outside when the day is not in the current month', () => {
    const { container } = render(
      <DayCell {...baseProps} day={d('2026-03-01')} currentDate={d('2026-02-01')} />,
    );
    expect(container.firstChild).toHaveClass('day-cell--outside');
  });

  /* ---------------------------------------------------------------- */
  /*  Interaction                                                      */
  /* ---------------------------------------------------------------- */

  it('calls onDayClick when clicked', async () => {
    const onDayClick = vi.fn();
    render(<DayCell {...baseProps} onDayClick={onDayClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onDayClick).toHaveBeenCalledWith(baseProps.day);
  });

  it('calls onDayClick on Enter key', async () => {
    const onDayClick = vi.fn();
    render(<DayCell {...baseProps} onDayClick={onDayClick} />);
    const cell = screen.getByRole('button');
    cell.focus();
    await userEvent.keyboard('{Enter}');
    expect(onDayClick).toHaveBeenCalledWith(baseProps.day);
  });

  it('calls onDayDoubleClick when double-clicked', async () => {
    const onDayDoubleClick = vi.fn();
    render(<DayCell {...baseProps} onDayDoubleClick={onDayDoubleClick} />);
    await userEvent.dblClick(screen.getByRole('button'));
    expect(onDayDoubleClick).toHaveBeenCalledWith(baseProps.day);
  });

  it('calls onEventClick when an event chip is double-clicked', async () => {
    const onEventClick = vi.fn();
    const ev = makeEvent({ startDate: '2026-02-15', endDate: '2026-02-15', date: '2026-02-15' });
    render(<DayCell {...baseProps} events={[ev]} onEventClick={onEventClick} />);
    await userEvent.dblClick(screen.getByText('Test Event'));
    expect(onEventClick).toHaveBeenCalledWith(ev);
  });

  it('does not bubble double-click from event chip to day cell', async () => {
    const onDayDoubleClick = vi.fn();
    const onEventClick = vi.fn();
    const ev = makeEvent({ startDate: '2026-02-15', endDate: '2026-02-15', date: '2026-02-15' });
    render(
      <DayCell {...baseProps} events={[ev]} onDayDoubleClick={onDayDoubleClick} onEventClick={onEventClick} />,
    );
    await userEvent.dblClick(screen.getByText('Test Event'));
    expect(onEventClick).toHaveBeenCalledOnce();
    expect(onDayDoubleClick).not.toHaveBeenCalled();
  });

  /* ---------------------------------------------------------------- */
  /*  Multi-day event chip classes                                     */
  /* ---------------------------------------------------------------- */

  it('applies event-chip--start class on the start day of a multi-day event', () => {
    const events = [
      makeEvent({ startDate: '2026-02-15', endDate: '2026-02-17', date: '2026-02-15' }),
    ];
    const { container } = render(
      <DayCell {...baseProps} day={d('2026-02-15')} events={events} />,
    );
    const chip = container.querySelector('.event-chip');
    expect(chip).toHaveClass('event-chip--start');
    expect(chip).toHaveClass('event-chip--multi');
  });

  it('applies event-chip--end class on the end day of a multi-day event', () => {
    const events = [
      makeEvent({ startDate: '2026-02-15', endDate: '2026-02-17', date: '2026-02-15' }),
    ];
    const { container } = render(
      <DayCell {...baseProps} day={d('2026-02-17')} events={events} />,
    );
    const chip = container.querySelector('.event-chip');
    expect(chip).toHaveClass('event-chip--end');
  });

  it('applies event-chip--mid class on a middle day of a multi-day event', () => {
    const events = [
      makeEvent({ startDate: '2026-02-15', endDate: '2026-02-17', date: '2026-02-15' }),
    ];
    const { container } = render(
      <DayCell {...baseProps} day={d('2026-02-16')} events={events} />,
    );
    const chip = container.querySelector('.event-chip');
    expect(chip).toHaveClass('event-chip--mid');
  });

  /* ---------------------------------------------------------------- */
  /*  Aria label                                                       */
  /* ---------------------------------------------------------------- */

  it('has an accessible aria-label with day number and event count', () => {
    const events = [makeEvent({ startDate: '2026-02-15', endDate: '2026-02-15', date: '2026-02-15' })];
    render(<DayCell {...baseProps} events={events} />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      '15, 1 événement',
    );
  });

  /* ---------------------------------------------------------------- */
  /*  Weekend / Holiday styling                                        */
  /* ---------------------------------------------------------------- */

  it('applies day-cell--weekend class on a Saturday', () => {
    // 2026-02-14 is a Saturday
    const { container } = render(
      <DayCell {...baseProps} day={d('2026-02-14')} />,
    );
    expect(container.firstChild).toHaveClass('day-cell--weekend');
  });

  it('applies day-cell--weekend class on a Sunday', () => {
    // 2026-02-15 is a Sunday
    const { container } = render(
      <DayCell {...baseProps} day={d('2026-02-15')} />,
    );
    expect(container.firstChild).toHaveClass('day-cell--weekend');
  });

  it('does NOT apply day-cell--weekend on a weekday without holiday', () => {
    // 2026-02-16 is a Monday
    const { container } = render(
      <DayCell {...baseProps} day={d('2026-02-16')} />,
    );
    expect(container.firstChild).not.toHaveClass('day-cell--weekend');
  });

  it('applies day-cell--weekend class when holidayName is provided on a weekday', () => {
    // 2026-02-16 is a Monday, but treat as holiday
    const { container } = render(
      <DayCell {...baseProps} day={d('2026-02-16')} holidayName="Jour férié test" />,
    );
    expect(container.firstChild).toHaveClass('day-cell--weekend');
  });

  it('displays the holiday name label', () => {
    render(
      <DayCell {...baseProps} day={d('2026-02-16')} holidayName="Lundi de Pâques" />,
    );
    expect(screen.getByText('Lundi de Pâques')).toBeInTheDocument();
  });

  it('includes holiday name in the aria-label', () => {
    render(
      <DayCell {...baseProps} day={d('2026-02-16')} holidayName="Ascension" />,
    );
    const label = screen.getByRole('button').getAttribute('aria-label');
    expect(label).toContain('Ascension');
  });

  /* ---------------------------------------------------------------- */
  /*  Event chip time display                                          */
  /* ---------------------------------------------------------------- */

  it('shows the start time on event chips', () => {
    const events = [makeEvent({
      startDate: '2026-02-15',
      endDate: '2026-02-15',
      date: '2026-02-15',
      startTime: '14:30',
    })];
    const { container } = render(<DayCell {...baseProps} events={events} />);
    expect(container.querySelector('.event-chip__time')).toHaveTextContent('14:30');
  });

  it('does NOT show time when the event has no startTime', () => {
    const events = [makeEvent({
      startDate: '2026-02-15',
      endDate: '2026-02-15',
      date: '2026-02-15',
      startTime: '',
    })];
    const { container } = render(<DayCell {...baseProps} events={events} />);
    expect(container.querySelector('.event-chip__time')).toBeNull();
  });
});
