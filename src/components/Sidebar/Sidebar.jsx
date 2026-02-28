/**
 * @component Sidebar
 * @description Left panel showing the selected date headline and the list
 * of events for that day. Also includes a "New event" button.
 *
 * Responsive behaviour:
 * - On mobile the sidebar is hidden by default and shown as an overlay
 *   when `isOpen` is true.
 * - On desktop `isOpen` has no visual effect (always visible).
 */

import { formatFullDate, formatISO } from '../../utils/dateUtils';
import EventList from '../EventList';

export default function Sidebar({
  selectedDate,
  events,
  onNewEvent,
  onEventClick,
  isOpen = true,
  onClose,
}) {
  const dateISO = formatISO(selectedDate);
  const dayEvents = events
    .filter((ev) => ev.date === dateISO)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const sidebarClasses = [
    'sidebar',
    isOpen ? 'sidebar--open' : 'sidebar--closed',
  ].join(' ');

  return (
    <>
      {/* Mobile backdrop — only visible when sidebar is open on small screens */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          data-testid="sidebar-backdrop"
        />
      )}

      <aside className={sidebarClasses} aria-label="Day detail">
        {/* ---- Date heading ---- */}
        <div className="sidebar__section">
          <p className="sidebar__heading">Selected Day</p>
          <p className="sidebar__date">{formatFullDate(selectedDate)}</p>
          <button
            className="btn btn--primary"
            onClick={onNewEvent}
            style={{ width: '100%' }}
          >
            + New Event
          </button>
        </div>

        {/* ---- Event list ---- */}
        <div className="sidebar__section">
          <p className="sidebar__heading">
            Events ({dayEvents.length})
          </p>
          <EventList events={dayEvents} onEventClick={onEventClick} />
        </div>
      </aside>
    </>
  );
}
