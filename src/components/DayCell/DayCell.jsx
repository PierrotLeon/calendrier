/**
 * @component DayCell
 * @description Renders a single day inside the calendar grid.
 *
 * Shows the day number, up to 2 event chips, and a "+N more" indicator
 * when there are more events than can fit visually.
 */

import { formatDayNumber, isToday, isSameMonthAs, formatISO } from '../../utils/dateUtils';

/** Maximum number of event chips visible before the "+N more" label. */
const MAX_VISIBLE_EVENTS = 2;

export default function DayCell({ day, currentDate, events, onDayClick }) {
  const today = isToday(day);
  const outside = !isSameMonthAs(day, currentDate);
  const dateISO = formatISO(day);
  const dayEvents = events.filter((ev) => ev.date === dateISO);
  const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenCount = dayEvents.length - visibleEvents.length;

  const cellClass = [
    'day-cell',
    outside && 'day-cell--outside',
    today && 'day-cell--today',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cellClass}
      onClick={() => onDayClick(day)}
      role="button"
      tabIndex={0}
      aria-label={`${formatDayNumber(day)}, ${dayEvents.length} events`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDayClick(day);
        }
      }}
    >
      <span className="day-cell__number">{formatDayNumber(day)}</span>

      <div className="day-cell__events">
        {visibleEvents.map((ev) => (
          <div
            key={ev.id}
            className="event-chip"
            style={{ backgroundColor: ev.color }}
            title={ev.title}
          >
            {ev.startTime && `${ev.startTime} `}{ev.title}
          </div>
        ))}
        {hiddenCount > 0 && (
          <span className="day-cell__more">+{hiddenCount} more</span>
        )}
      </div>
    </div>
  );
}
