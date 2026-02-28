/**
 * @component DayCell
 * @description Renders a single day inside the calendar grid.
 *
 * Shows the day number, up to 2 event chips, and a "+N more" indicator
 * when there are more events than can fit visually.
 */

import { formatDayNumber, isToday, isSameMonthAs, isSameDayAs, formatISO } from '../../utils/dateUtils';
import { eventCoversDate, isMultiDay } from '../../utils/eventModel';

/** Maximum number of event chips visible before the "+N more" label. */
const MAX_VISIBLE_EVENTS = 2;

export default function DayCell({ day, currentDate, selectedDate, events, onDayClick }) {
  const today = isToday(day);
  const outside = !isSameMonthAs(day, currentDate);
  const selected = selectedDate ? isSameDayAs(day, selectedDate) : false;
  const dateISO = formatISO(day);
  const dayEvents = events.filter((ev) => eventCoversDate(ev, dateISO));
  const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenCount = dayEvents.length - visibleEvents.length;

  const cellClass = [
    'day-cell',
    outside && 'day-cell--outside',
    today && 'day-cell--today',
    selected && 'day-cell--selected',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cellClass}
      onClick={() => onDayClick(day)}
      role="button"
      tabIndex={0}
      aria-label={`${formatDayNumber(day)}, ${dayEvents.length} événement${dayEvents.length !== 1 ? 's' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDayClick(day);
        }
      }}
    >
      <span className="day-cell__number">{formatDayNumber(day)}</span>

      <div className="day-cell__events">
        {visibleEvents.map((ev) => {
          const multi = isMultiDay(ev);
          const isStart = multi && ev.startDate === dateISO;
          const isEnd = multi && ev.endDate === dateISO;
          const isMid = multi && !isStart && !isEnd;

          const chipClass = [
            'event-chip',
            multi && 'event-chip--multi',
            isStart && 'event-chip--start',
            isEnd && 'event-chip--end',
            isMid && 'event-chip--mid',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={ev.id}
              className={chipClass}
              style={{ backgroundColor: ev.color }}
              title={ev.title}
            >
              {ev.startTime && isStart && `${ev.startTime} `}
              {ev.title}
            </div>
          );
        })}
        {hiddenCount > 0 && (
          <span className="day-cell__more">+{hiddenCount} more</span>
        )}
      </div>
    </div>
  );
}
