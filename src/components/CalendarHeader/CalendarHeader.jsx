/**
 * @component CalendarHeader
 * @description Top navigation bar for the calendar.
 *
 * Displays the current month/year, navigation arrows, and an "Aujourd'hui"
 * button. A dropdown menu on the right gives access to the view toggle
 * (Mois / Semaine) and the event templates panel.
 */

import { useState, useRef, useEffect } from 'react';
import { VIEW_MODES } from '../../constants';
import { formatMonthYear } from '../../utils/dateUtils';

export default function CalendarHeader({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onToggleSidebar,
  onOpenSettings,
  isSidebarOpen,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* Close the dropdown when clicking outside */
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="header" role="banner">
      {/* ---- Left: sidebar toggle (mobile) + brand ---- */}
      <div className="header__left">
        {onToggleSidebar && (
          <button
            className="btn btn--icon header__sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'Fermer le panneau' : 'Ouvrir le panneau'}
          >
            {isSidebarOpen ? '✕' : '☰'}
          </button>
        )}
        <div className="header__title">
          <span role="img" aria-label="calendrier">📅</span>
          <span className="header__title-text">Calendrier</span>
        </div>
      </div>

      {/* ---- Centre: navigation ---- */}
      <nav className="header__nav" aria-label="Navigation du calendrier">
        <button className="btn btn--icon" onClick={onPrev} aria-label="Précédent">
          ◀
        </button>
        <span className="header__month-year">{formatMonthYear(currentDate)}</span>
        <button className="btn btn--icon" onClick={onNext} aria-label="Suivant">
          ▶
        </button>
        <button className="btn header__today-btn" onClick={onToday}>
          Aujourd'hui
        </button>
      </nav>

      {/* ---- Right: dropdown menu ---- */}
      <div className="header__right" ref={menuRef}>
        <button
          className="btn btn--icon header__menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="header-menu" role="menu">
            {/* View mode */}
            <div className="header-menu__section">
              <span className="header-menu__label">Affichage</span>
              <button
                className={`header-menu__item ${viewMode === VIEW_MODES.MONTH ? 'header-menu__item--active' : ''}`}
                role="menuitem"
                onClick={() => { onViewChange(VIEW_MODES.MONTH); setMenuOpen(false); }}
              >
                Mois
              </button>
              <button
                className={`header-menu__item ${viewMode === VIEW_MODES.WEEK ? 'header-menu__item--active' : ''}`}
                role="menuitem"
                onClick={() => { onViewChange(VIEW_MODES.WEEK); setMenuOpen(false); }}
              >
                Semaine
              </button>
            </div>

            <div className="header-menu__divider" />

            {/* Templates / Settings */}
            {onOpenSettings && (
              <button
                className="header-menu__item"
                role="menuitem"
                onClick={() => { onOpenSettings(); setMenuOpen(false); }}
              >
                ⚙ Modèles d'événements
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
