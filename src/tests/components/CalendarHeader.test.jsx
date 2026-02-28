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
  onImportICS: vi.fn(),
  onOpenCustomColors: vi.fn(),
  isSidebarOpen: false,
};

describe('CalendarHeader', () => {
  it('displays the current month and year in French', () => {
    render(<CalendarHeader {...defaultProps} />);
    expect(screen.getByText('Février 2026')).toBeInTheDocument();
  });

  it('calls onPrev when the back button is clicked', async () => {
    const onPrev = vi.fn();
    render(<CalendarHeader {...defaultProps} onPrev={onPrev} />);
    await userEvent.click(screen.getByLabelText('Précédent'));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNext when the forward button is clicked', async () => {
    const onNext = vi.fn();
    render(<CalendarHeader {...defaultProps} onNext={onNext} />);
    await userEvent.click(screen.getByLabelText('Suivant'));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onToday when the Auj. button is clicked', async () => {
    const onToday = vi.fn();
    render(<CalendarHeader {...defaultProps} onToday={onToday} />);
    await userEvent.click(screen.getByText('Auj.'));
    expect(onToday).toHaveBeenCalledOnce();
  });

  it('opens the menu and switches to Semaine view', async () => {
    const onViewChange = vi.fn();
    render(<CalendarHeader {...defaultProps} onViewChange={onViewChange} />);
    await userEvent.click(screen.getByLabelText('Menu'));
    await userEvent.click(screen.getByText('Semaine'));
    expect(onViewChange).toHaveBeenCalledWith(VIEW_MODES.WEEK);
  });

  it('highlights the active view mode in the menu', async () => {
    render(<CalendarHeader {...defaultProps} viewMode={VIEW_MODES.WEEK} />);
    await userEvent.click(screen.getByLabelText('Menu'));
    expect(screen.getByText('Semaine')).toHaveClass('header-menu__item--active');
    expect(screen.getByText('Mois')).not.toHaveClass('header-menu__item--active');
  });

  it('calls onToggleSidebar when sidebar toggle is clicked', async () => {
    const onToggleSidebar = vi.fn();
    render(<CalendarHeader {...defaultProps} onToggleSidebar={onToggleSidebar} />);
    await userEvent.click(screen.getByLabelText('Ouvrir le panneau'));
    expect(onToggleSidebar).toHaveBeenCalledOnce();
  });

  it('opens settings (templates) from the menu', async () => {
    const onOpenSettings = vi.fn();
    render(<CalendarHeader {...defaultProps} onOpenSettings={onOpenSettings} />);
    await userEvent.click(screen.getByLabelText('Menu'));
    await userEvent.click(screen.getByText(/Modèles d'événements/));
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });

  it('shows close icon when sidebar is open', () => {
    render(<CalendarHeader {...defaultProps} isSidebarOpen={true} />);
    const toggle = screen.getByLabelText('Fermer le panneau');
    expect(toggle.textContent).toBe('✕');
  });

  it('shows hamburger icon when sidebar is closed', () => {
    render(<CalendarHeader {...defaultProps} isSidebarOpen={false} />);
    const toggle = screen.getByLabelText('Ouvrir le panneau');
    expect(toggle.textContent).toBe('☰');
  });

  it('shows the ICS import menu item when onImportICS is provided', async () => {
    render(<CalendarHeader {...defaultProps} />);
    await userEvent.click(screen.getByLabelText('Menu'));
    expect(screen.getByText(/Importer un fichier .ics/)).toBeInTheDocument();
  });

  it('shows the custom colours menu item when onOpenCustomColors is provided', async () => {
    render(<CalendarHeader {...defaultProps} />);
    await userEvent.click(screen.getByLabelText('Menu'));
    expect(screen.getByText(/Palette de couleurs/)).toBeInTheDocument();
  });

  it('calls onOpenCustomColors when palette menu item is clicked', async () => {
    const onOpenCustomColors = vi.fn();
    render(<CalendarHeader {...defaultProps} onOpenCustomColors={onOpenCustomColors} />);
    await userEvent.click(screen.getByLabelText('Menu'));
    await userEvent.click(screen.getByText(/Palette de couleurs/));
    expect(onOpenCustomColors).toHaveBeenCalledOnce();
  });
});
