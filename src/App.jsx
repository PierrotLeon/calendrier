/**
 * @component App
 * @description Root component of the Calendrier application.
 *
 * Composes the calendar header, grid, sidebar, event modal, and settings
 * panel into a cohesive, responsive layout. Owns the top-level state by
 * delegating to custom hooks (`useCalendar`, `useEvents`, `useModal`,
 * `useSettings`).
 */

import { useState } from 'react';
import {
  CalendarHeader,
  CalendarGrid,
  Sidebar,
  EventModal,
  SettingsPanel,
} from './components';
import { useCalendar } from './hooks/useCalendar';
import { useEvents } from './hooks/useEvents';
import { useModal } from './hooks/useModal';
import { useSettings } from './hooks/useSettings';

export default function App() {
  /* ---- State ---- */
  const calendar = useCalendar();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const modal = useModal();
  const settingsModal = useModal();
  const settings = useSettings();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false); // closed by default on mobile

  /* ---- Handlers ---- */

  /** When a day cell is clicked, select it. */
  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  /** Open the modal for creating a new event on the selected day. */
  const handleNewEvent = () => {
    modal.open(null); // null → creation mode
  };

  /** Open the modal pre-filled with an existing event for editing. */
  const handleEventClick = (event) => {
    modal.open(event);
  };

  /** Save handler called by the modal for both create and update. */
  const handleSaveEvent = (eventData, existingId) => {
    if (existingId) {
      updateEvent(existingId, eventData);
    } else {
      addEvent(eventData);
    }
  };

  /** Toggle sidebar visibility (mostly useful on mobile). */
  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app">
      {/* ---- Top bar ---- */}
      <CalendarHeader
        currentDate={calendar.currentDate}
        viewMode={calendar.viewMode}
        onPrev={calendar.goPrev}
        onNext={calendar.goNext}
        onToday={calendar.goToday}
        onViewChange={calendar.setViewMode}
        onToggleSidebar={handleToggleSidebar}
        onOpenSettings={() => settingsModal.open(null)}
        isSidebarOpen={sidebarOpen}
      />

      {/* ---- Body: sidebar + grid ---- */}
      <div className="app__body">
        <Sidebar
          selectedDate={selectedDate}
          events={events}
          onNewEvent={handleNewEvent}
          onEventClick={handleEventClick}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="app__main">
          <CalendarGrid
            days={calendar.days}
            currentDate={calendar.currentDate}
            selectedDate={selectedDate}
            events={events}
            onDayClick={handleDayClick}
            viewMode={calendar.viewMode}
          />
        </main>
      </div>

      {/* ---- Event modal (create / edit) ---- */}
      <EventModal
        isOpen={modal.isOpen}
        initialData={modal.data}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={deleteEvent}
        onClose={modal.close}
        getAutoSuggestion={settings.getAutoSuggestion}
      />

      {/* ---- Settings panel ---- */}
      <SettingsPanel
        isOpen={settingsModal.isOpen}
        rules={settings.rules}
        onAddRule={settings.addRule}
        onUpdateRule={settings.updateRule}
        onDeleteRule={settings.deleteRule}
        onResetDefaults={settings.resetToDefaults}
        onClose={settingsModal.close}
      />
    </div>
  );
}
