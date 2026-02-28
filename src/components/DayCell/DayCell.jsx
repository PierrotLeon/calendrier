/**
 * @component DayCell
 * @description Renders a single day inside the calendar grid.
 *
 * Shows the day number, up to 2 event chips, and a "+N more" indicator
 * when there are more events than can fit visually.
 * Weekend and holiday cells get a subtle background tint.
 */

import { formatDayNumber, isToday, isSameMonthAs, isSameDayAs, formatISO, isWeekend } from '../../utils/dateUtils';
import { eventCoversDate, isMultiDay } from '../../utils/eventModel';

/** Maximum number of event chips visible before the "+N more" label. */
const MAX_VISIBLE_EVENTS = 2;

export default function DayCell({ day, currentDate, selectedDate, events, onDayClick, onDayDoubleClick, onEventClick, holidayName }) {
  const today = isToday(day);
  const outside = !isSameMonthAs(day, currentDate);
  const selected = selectedDate ? isSameDayAs(day, selectedDate) : false;
  const weekend = isWeekend(day);
  const holiday = Boolean(holidayName);
  const dateISO = formatISO(day);
  const dayEvents = events.filter((ev) => eventCoversDate(ev, dateISO));
  const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenCount = dayEvents.length - visibleEvents.length;

  const cellClass = [
    'day-cell',
    outside && 'day-cell--outside',
    today && 'day-cell--today',
    selected && 'day-cell--selected',
    (weekend || holiday) && 'day-cell--weekend',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cellClass}
      onClick={() => onDayClick(day)}
      onDoubleClick={() => onDayDoubleClick?.(day)}
      role="button"
      tabIndex={0}
      aria-label={`${formatDayNumber(day)}, ${dayEvents.length} événement${dayEvents.length !== 1 ? 's' : ''}${holidayName ? `, ${holidayName}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDayClick(day);
        }
      }}
    >
      <span className="day-cell__number">{formatDayNumber(day)}</span>

      {/* Holiday label */}
      {holidayName && (
        <span className="day-cell__holiday">{holidayName}</span>
      )}

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

          // Show start time on the first visible day (single-day or start of multi)
          const showTime = ev.startTime && (!multi || isStart);

          return (
            <div
              key={ev.id}
              className={chipClass}
              style={{ backgroundColor: ev.color }}
              title={ev.title}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onEventClick?.(ev);
              }}
            >
              <span className="event-chip__title">{ev.title}</span>
              {showTime && <span className="event-chip__time">{ev.startTime}</span>}
            </div>
          );
        })}
        {hiddenCount > 0 && (
          <span className="day-cell__more">+{hiddenCount}</span>
        )}
      </div>
    </div>
  );
}
