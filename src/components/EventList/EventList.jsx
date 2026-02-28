/**
 * @component EventList
 * @description Renders a vertical list of event cards for a given date.
 *
 * Each card shows the event colour bar, title, and time range.
 * Multi-day events display their date span.
 * Clicking a card opens the edit modal (delegated to the parent via `onEventClick`).
 */

import { isMultiDay } from '../../utils/eventModel';
import { exportEvent } from '../../utils/icsExporter';

export default function EventList({ events, onEventClick }) {
  if (events.length === 0) {
    return <p className="event-list__empty">Aucun événement ce jour.</p>;
  }

  return (
    <div className="event-list" role="list">
      {events.map((ev) => {
        const multi = isMultiDay(ev);
        return (
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
              {multi && (
                <div className="event-card__dates">
                  {ev.startDate} → {ev.endDate}
                </div>
              )}
              {(ev.startTime || ev.endTime) && (
                <div className="event-card__time">
                  {ev.startTime || '—'} – {ev.endTime || '—'}
                </div>
              )}
            </div>
            <button
              className="btn btn--icon btn--sm event-card__export"
              title="Exporter en .ics"
              aria-label={`Exporter ${ev.title} en .ics`}
              onClick={(e) => {
                e.stopPropagation();
                exportEvent(ev);
              }}
            >
              ⬇
            </button>
          </div>
        );
      })}
    </div>
  );
}
