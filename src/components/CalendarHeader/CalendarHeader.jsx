/**
 * @component CalendarHeader
 * @description Top navigation bar for the calendar.
 *
 * Displays the current month/year, navigation arrows, a "Today" button,
 * a view-mode toggle (Month / Week), and a settings gear icon.
 * On mobile, the layout stacks / collapses gracefully via CSS.
 */

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
  return (
    <header className="header" role="banner">
      {/* ---- Left: brand + sidebar toggle (mobile) ---- */}
      <div className="header__left">
        {onToggleSidebar && (
          <button
            className="btn btn--icon header__sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? '✕' : '☰'}
          </button>
        )}
        <div className="header__title">
          <span role="img" aria-label="calendar">📅</span>
          <span className="header__title-text">Calendrier</span>
        </div>
      </div>

      {/* ---- Centre: navigation ---- */}
      <nav className="header__nav" aria-label="Calendar navigation">
        <button className="btn btn--icon" onClick={onPrev} aria-label="Previous">
          ◀
        </button>
        <span className="header__month-year">{formatMonthYear(currentDate)}</span>
        <button className="btn btn--icon" onClick={onNext} aria-label="Next">
          ▶
        </button>
        <button className="btn header__today-btn" onClick={onToday}>
          Today
        </button>
      </nav>

      {/* ---- Right: view toggle + settings ---- */}
      <div className="header__right">
        <div className="view-toggle" role="group" aria-label="View mode">
          <button
            className={`view-toggle__btn ${viewMode === VIEW_MODES.MONTH ? 'view-toggle__btn--active' : ''}`}
            onClick={() => onViewChange(VIEW_MODES.MONTH)}
          >
            Month
          </button>
          <button
            className={`view-toggle__btn ${viewMode === VIEW_MODES.WEEK ? 'view-toggle__btn--active' : ''}`}
            onClick={() => onViewChange(VIEW_MODES.WEEK)}
          >
            Week
          </button>
        </div>
        {onOpenSettings && (
          <button
            className="btn btn--icon"
            onClick={onOpenSettings}
            aria-label="Open settings"
            title="Event type rules"
          >
            ⚙
          </button>
        )}
      </div>
    </header>
  );
}
