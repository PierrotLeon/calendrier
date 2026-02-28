/**
 * @file EventList.test.jsx
 * @description Unit tests for the EventList component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventList from '../../components/EventList';

const mockEvents = [
  { id: '1', title: 'Morning standup', startTime: '09:00', endTime: '09:15', color: '#4F46E5' },
  { id: '2', title: 'Lunch', startTime: '12:00', endTime: '13:00', color: '#059669' },
];

describe('EventList', () => {
  it('renders an empty message when there are no events', () => {
    render(<EventList events={[]} onEventClick={vi.fn()} />);
    expect(screen.getByText(/aucun événement/i)).toBeInTheDocument();
  });

  it('renders all event cards', () => {
    render(<EventList events={mockEvents} onEventClick={vi.fn()} />);
    expect(screen.getByText('Morning standup')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  it('displays time ranges', () => {
    render(<EventList events={mockEvents} onEventClick={vi.fn()} />);
    expect(screen.getByText('09:00 – 09:15')).toBeInTheDocument();
  });

  it('calls onEventClick with the event when a card is clicked', async () => {
    const onEventClick = vi.fn();
    render(<EventList events={mockEvents} onEventClick={onEventClick} />);
    await userEvent.click(screen.getByText('Morning standup'));
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });
});
