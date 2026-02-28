/**
 * @component CalendarGrid
 * @description Renders the weekday headers and the grid of `DayCell` components.
 *
 * Receives the list of days to display (which can be a full month or a single
 * week depending on the current view mode) and delegates rendering to `DayCell`.
 */

import { WEEKDAYS } from '../../constants';
import DayCell from '../DayCell';

export default function CalendarGrid({ days, currentDate, events, onDayClick }) {
  return (
    <div className="calendar-grid" role="grid" aria-label="Calendar">
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
            events={events}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}
