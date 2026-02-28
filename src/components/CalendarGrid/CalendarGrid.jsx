/**
 * @component CalendarGrid
 * @description Renders the calendar in either month or week view.
 *
 * - **Month view**: weekday headers + grid of DayCell components.
 * - **Week view**: columnar timetable with hourly subdivisions (00–23),
 *   day headers showing "Lun 23" format, and events positioned by time.
 */

import { WEEKDAYS } from '../../constants';
import { formatShortDayWithNumber, formatISO } from '../../utils/dateUtils';
import { eventCoversDate } from '../../utils/eventModel';
import DayCell from '../DayCell';

/** Hours displayed in the week timetable (0–23). */
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarGrid({
  days,
  currentDate,
  selectedDate,
  events,
  onDayClick,
  viewMode,
}) {
  const isWeekView = viewMode === 'week';

  /* ================================================================ */
  /*  WEEK VIEW — columnar timetable                                   */
  /* ================================================================ */
  if (isWeekView) {
    return (
      <div className="week-grid" role="grid" aria-label="Calendrier semaine">
        {/* ---- Time gutter + day column headers ---- */}
        <div className="week-grid__header">
          <div className="week-grid__gutter-header" />
          {days.map((day) => {
            const iso = formatISO(day);
            const isSelected = selectedDate && iso === formatISO(selectedDate);
            return (
              <div
                key={iso}
                className={`week-grid__day-header ${isSelected ? 'week-grid__day-header--selected' : ''}`}
                onClick={() => onDayClick(day)}
                role="columnheader"
              >
                {formatShortDayWithNumber(day)}
              </div>
            );
          })}
        </div>

        {/* ---- Time rows ---- */}
        <div className="week-grid__body">
          <div className="week-grid__gutter">
            {HOURS.map((h) => (
              <div key={h} className="week-grid__hour-label">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {days.map((day) => {
            const iso = formatISO(day);
            const dayEvents = events.filter((ev) => eventCoversDate(ev, iso));
            return (
              <div
                key={iso}
                className="week-grid__column"
                onClick={() => onDayClick(day)}
              >
                {/* Hourly gridlines */}
                {HOURS.map((h) => (
                  <div key={h} className="week-grid__hour-slot" />
                ))}

                {/* Events positioned absolutely */}
                {dayEvents.map((ev) => {
                  const top = timeToPercent(ev.startTime);
                  const height = timeDuration(ev.startTime, ev.endTime);
                  return (
                    <div
                      key={ev.id}
                      className="week-grid__event"
                      style={{
                        backgroundColor: ev.color,
                        top: `${top}%`,
                        height: `${Math.max(height, 2)}%`,
                      }}
                      title={`${ev.startTime || ''} ${ev.title}`}
                    >
                      <span className="week-grid__event-time">{ev.startTime}</span>
                      <span className="week-grid__event-title">{ev.title}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  MONTH VIEW — classic grid (unchanged)                            */
  /* ================================================================ */
  return (
    <div className="calendar-grid" role="grid" aria-label="Calendrier">
      {/* ---- Weekday header row ---- */}
      <div className="calendar-grid__weekdays" role="row">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-grid__weekday" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {/* ---- Day cells ---- */}
      <div className="calendar-grid__days">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}

/* ---- Helpers for positioning events in the week timetable ---- */

/** Convert a "HH:mm" time string to a percentage of a 24-hour day. */
function timeToPercent(time) {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return ((h * 60 + m) / 1440) * 100;
}

/** Duration between two "HH:mm" times as a percentage of 24 hours. */
function timeDuration(start, end) {
  if (!start || !end) return 4.17; // ~1 hour default
  const s = timeToPercent(start);
  const e = timeToPercent(end);
  return e > s ? e - s : 4.17;
}
