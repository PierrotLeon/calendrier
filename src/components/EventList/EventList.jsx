/**
 * @component EventList
 * @description Renders a vertical list of event cards for a given date.
 *
 * Each card shows the event colour bar, title, and time range.
 * Clicking a card opens the edit modal (delegated to the parent via `onEventClick`).
 */

export default function EventList({ events, onEventClick }) {
  if (events.length === 0) {
    return <p className="event-list__empty">No events for this day.</p>;
  }

  return (
    <div className="event-list" role="list">
      {events.map((ev) => (
        <div
          key={ev.id}
          className="event-card"
          role="listitem"
          onClick={() => onEventClick(ev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEventClick(ev);
            }
          }}
          tabIndex={0}
        >
          <div
            className="event-card__color-bar"
            style={{ backgroundColor: ev.color }}
          />
          <div className="event-card__body">
            <div className="event-card__title">{ev.title}</div>
            {(ev.startTime || ev.endTime) && (
              <div className="event-card__time">
                {ev.startTime || '—'} – {ev.endTime || '—'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
