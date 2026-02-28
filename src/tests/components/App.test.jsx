/**
 * @file App.test.jsx
 * @description Integration tests for the App root component.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the calendar header with the brand name', () => {
    render(<App />);
    expect(screen.getByText('Calendrier')).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    render(<App />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('renders the sidebar with "+ New Event" button', () => {
    render(<App />);
    expect(screen.getByText('+ New Event')).toBeInTheDocument();
  });

  it('opens the event modal when "+ New Event" is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('+ New Event'));
    expect(screen.getByText('New Event')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('creates an event and shows it in the sidebar', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('+ New Event'));

    const titleInput = screen.getByLabelText('Title');
    await userEvent.type(titleInput, 'Integration Test Event');
    await userEvent.click(screen.getByText('Create'));

    // The event should now appear in the sidebar event list and the grid
    const matches = screen.getAllByText('Integration Test Event');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('can navigate months with prev/next buttons', async () => {
    render(<App />);
    const headerText = () =>
      screen.getByText(/\w+ \d{4}/, { selector: '.header__month-year' });

    const initialText = headerText().textContent;
    await userEvent.click(screen.getByLabelText('Next'));
    expect(headerText().textContent).not.toBe(initialText);
  });

  it('toggles between month and week view', async () => {
    render(<App />);
    // Default is month view — should have many day cells
    const daysBefore = document.querySelectorAll('.day-cell').length;
    expect(daysBefore).toBeGreaterThanOrEqual(28);

    await userEvent.click(screen.getByText('Week'));
    const daysAfter = document.querySelectorAll('.day-cell').length;
    expect(daysAfter).toBe(7);
  });

  it('opens the settings panel when the settings button is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByLabelText('Open settings'));
    expect(screen.getByText('Event Type Rules')).toBeInTheDocument();
  });

  it('closes the settings panel when close button is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByLabelText('Open settings'));
    expect(screen.getByText('Event Type Rules')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Close settings'));
    expect(screen.queryByText('Event Type Rules')).not.toBeInTheDocument();
  });

  it('toggles sidebar visibility', async () => {
    render(<App />);
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).toHaveClass('sidebar--closed');

    await userEvent.click(screen.getByLabelText('Open sidebar'));
    expect(sidebar).toHaveClass('sidebar--open');
  });
});
