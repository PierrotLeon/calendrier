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
import { eventCoversDate } from '../../utils/eventModel';
import { exportAllEvents } from '../../utils/icsExporter';
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
    .filter((ev) => eventCoversDate(ev, dateISO))
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

      <aside className={sidebarClasses} aria-label="Détail du jour">
        {/* ---- Date heading ---- */}
        <div className="sidebar__section">
          <p className="sidebar__heading">Jour sélectionné</p>
          <p className="sidebar__date">{formatFullDate(selectedDate)}</p>
          <button
            className="btn btn--primary"
            onClick={onNewEvent}
            style={{ width: '100%' }}
          >
            + Nouvel événement
          </button>
        </div>

        {/* ---- Event list ---- */}
        <div className="sidebar__section">
          <p className="sidebar__heading">
            Événements ({dayEvents.length})
          </p>
          <EventList events={dayEvents} onEventClick={onEventClick} />
        </div>

        {/* ---- Export all ---- */}
        {events.length > 0 && (
          <div className="sidebar__section">
            <button
              className="btn btn--outline"
              style={{ width: '100%' }}
              onClick={() => exportAllEvents(events)}
            >
              ⬇ Exporter tous les événements (.ics)
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
