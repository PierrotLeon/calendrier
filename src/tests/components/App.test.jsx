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
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Dim')).toBeInTheDocument();
  });

  it('renders the sidebar with "+ Nouvel événement" button', () => {
    render(<App />);
    expect(screen.getByText('+ Nouvel événement')).toBeInTheDocument();
  });

  it('opens the event modal when "+ Nouvel événement" is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('+ Nouvel événement'));
    expect(screen.getByText('Nouvel événement')).toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toBeInTheDocument();
  });

  it('creates an event and shows it in the sidebar', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('+ Nouvel événement'));

    const titleInput = screen.getByLabelText('Titre');
    await userEvent.type(titleInput, 'Integration Test Event');
    await userEvent.click(screen.getByText('Créer'));

    // The event should now appear in the sidebar event list and the grid
    const matches = screen.getAllByText('Integration Test Event');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('can navigate months with prev/next buttons', async () => {
    render(<App />);
    const headerText = () =>
      screen.getByText(/\w+ \d{4}/, { selector: '.header__month-year' });

    const initialText = headerText().textContent;
    await userEvent.click(screen.getByLabelText('Suivant'));
    expect(headerText().textContent).not.toBe(initialText);
  });

  it('toggles between month and week view via menu', async () => {
    render(<App />);
    // Default is month view — should have many day cells
    const daysBefore = document.querySelectorAll('.day-cell').length;
    expect(daysBefore).toBeGreaterThanOrEqual(28);

    // Open the menu and click Semaine
    await userEvent.click(screen.getByLabelText('Menu'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Semaine' }));

    // In week view there should be a week-grid instead of day-cells
    expect(document.querySelector('.week-grid')).toBeInTheDocument();
  });

  it('opens the settings panel via the menu', async () => {
    render(<App />);
    await userEvent.click(screen.getByLabelText('Menu'));
    await userEvent.click(screen.getByRole('menuitem', { name: /Modèles d'événements/ }));
    expect(screen.getByText("Modèles d'événements")).toBeInTheDocument();
  });

  it('closes the settings panel when close button is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByLabelText('Menu'));
    await userEvent.click(screen.getByRole('menuitem', { name: /Modèles d'événements/ }));
    expect(screen.getByText("Modèles d'événements")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Fermer les modèles'));
    // The heading inside the settings panel should be gone
    expect(screen.queryByLabelText('Fermer les modèles')).not.toBeInTheDocument();
  });

  it('toggles sidebar visibility', async () => {
    render(<App />);
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).toHaveClass('sidebar--closed');

    await userEvent.click(screen.getByLabelText('Ouvrir le panneau'));
    expect(sidebar).toHaveClass('sidebar--open');
  });

  it('highlights the clicked day with day-cell--selected', async () => {
    render(<App />);
    // Click a day cell that is not already today (pick the first .day-cell)
    const cells = document.querySelectorAll('.day-cell');
    expect(cells.length).toBeGreaterThan(0);

    // Before clicking, at most one cell (today) may be selected (initial state)
    await userEvent.click(cells[2]);
    expect(cells[2]).toHaveClass('day-cell--selected');
  });
});
