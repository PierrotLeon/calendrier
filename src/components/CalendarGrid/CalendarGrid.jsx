/**
 * @component CalendarGrid
 * @description Renders the calendar in either month or week view.
 *
 * During a swipe gesture the adjacent month/week is rendered side-by-side
 * so the user sees the incoming page slide in alongside the outgoing one.
 *
 * Architecture: the outer `swipe-viewport` div is always the touch target
 * (stable ref — never conditionally mounted/unmounted). Inside it a
 * `swipe-track` translates both current and adjacent pages together.
 */

import { useRef } from 'react';
import { WEEKDAYS } from '../../constants';
import { formatShortDayWithNumber, formatISO } from '../../utils/dateUtils';
import { eventCoversDate } from '../../utils/eventModel';
import { useSwipe } from '../../hooks/useSwipe';
import DayCell from '../DayCell';

/** Hours displayed in the week timetable (0–23). */
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarGrid({
  days,
  currentDate,
  selectedDate,
  events,
  onDayClick,
  onDayDoubleClick,
  onEventClick,
  viewMode,
  holidays,
  onPrev,
  onNext,
  prevDays,
  nextDays,
  prevDate,
  nextDate,
}) {
  const isWeekView = viewMode === 'week';

  /* ---- Swipe navigation (mobile / tablet) ---- */
  const gridRef = useRef(null);
  const { offsetX, transition, direction, handlers } = useSwipe(gridRef, {
    onSwipeLeft: onNext,   // swipe left → go forward
    onSwipeRight: onPrev,  // swipe right → go back
  });

  const isSwiping = direction !== null;

  /* ---- Adjacent page (only rendered while swiping) ---- */
  const adjDays = direction === 'left' ? nextDays : prevDays;
  const adjDate = direction === 'left' ? nextDate : prevDate;

  /*
   * Layout during a swipe:
   *   swipe left  → [current | next]   — track starts at 0, moves left
   *   swipe right → [prev | current]   — track starts at -50% (of track), moves right
   *
   * The track is 200 % of the viewport.  Each page = 50 % of track = 100 % viewport.
   * CSS translateX percentages are relative to the element's own width (the track).
   * So -50 % of track = -1 viewport width → positions "current" (page 2) in view.
   *
   * IMPORTANT: The outer DOM structure (swipe-viewport → swipe-track → swipe-page)
   * must ALWAYS be present, even when not swiping. Otherwise the DOM restructure
   * during the first touchMove breaks the browser's active touch sequence and
   * subsequent touch events are lost on real devices.
   */
  const baseOffset = isSwiping && direction === 'right' ? '-50%' : '0%';

  const trackStyle = isSwiping
    ? {
        transform: `translateX(calc(${baseOffset} + ${offsetX}px))`,
        transition: transition || undefined,
        willChange: 'transform',
      }
    : undefined;

  /* ---- Render ---- */

  const currentPage = isWeekView
    ? <WeekPage days={days} selectedDate={selectedDate} events={events}
        onDayClick={onDayClick} onDayDoubleClick={onDayDoubleClick} onEventClick={onEventClick} />
    : <MonthPage days={days} currentDate={currentDate} selectedDate={selectedDate}
        events={events} onDayClick={onDayClick} onDayDoubleClick={onDayDoubleClick}
        onEventClick={onEventClick} holidays={holidays} />;

  const adjacentPage = isSwiping
    ? (isWeekView
        ? <WeekPage days={adjDays} selectedDate={null} events={events} />
        : <MonthPage days={adjDays} currentDate={adjDate} selectedDate={null}
            events={events} holidays={holidays} />)
    : null;

  /*
   * Build the page list.  When idle, only the current page is shown
   * inside a single swipe-page (track width = 100 %).
   * During a swipe, two pages are shown (track width = 200 %).
   */
  const pages = isSwiping && direction === 'right'
    ? [<div key="adj" className="swipe-page">{adjacentPage}</div>,
       <div key="cur" className="swipe-page">{currentPage}</div>]
    : isSwiping
      ? [<div key="cur" className="swipe-page">{currentPage}</div>,
         <div key="adj" className="swipe-page">{adjacentPage}</div>]
      : [<div key="cur" className="swipe-page swipe-page--idle">{currentPage}</div>];

  const ariaLabel = isWeekView ? 'Calendrier semaine' : 'Calendrier';

  return (
    <div className="swipe-viewport" ref={gridRef} role="grid" aria-label={ariaLabel} {...handlers}>
      <div className={`swipe-track${isSwiping ? '' : ' swipe-track--idle'}`} style={trackStyle}>
        {pages}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MonthPage — a single month grid (extracted for reuse)              */
/* ================================================================== */

function MonthPage({ days, currentDate, selectedDate, events, onDayClick, onDayDoubleClick, onEventClick, holidays }) {
  return (
    <div className="calendar-grid">
      <div className="calendar-grid__weekdays" role="row">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-grid__weekday" role="columnheader">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid__days">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onDayClick={onDayClick}
            onDayDoubleClick={onDayDoubleClick}
            onEventClick={onEventClick}
            holidayName={holidays?.get(formatISO(day)) || null}
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  WeekPage — a single week timetable (extracted for reuse)           */
/* ================================================================== */

function WeekPage({ days, selectedDate, events, onDayClick, onDayDoubleClick, onEventClick }) {
  return (
    <div className="week-grid">
      <div className="week-grid__header">
        <div className="week-grid__gutter-header" />
        {days.map((day) => {
          const iso = formatISO(day);
          const isSelected = selectedDate && iso === formatISO(selectedDate);
          return (
            <div
              key={iso}
              className={`week-grid__day-header ${isSelected ? 'week-grid__day-header--selected' : ''}`}
              onClick={() => onDayClick?.(day)}
              role="columnheader"
            >
              {formatShortDayWithNumber(day)}
            </div>
          );
        })}
      </div>

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
              onClick={() => onDayClick?.(day)}
              onDoubleClick={() => onDayDoubleClick?.(day)}
            >
              {HOURS.map((h) => (
                <div key={h} className="week-grid__hour-slot" />
              ))}

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
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(ev);
                    }}
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
