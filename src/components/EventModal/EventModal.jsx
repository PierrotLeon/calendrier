/**
 * @component EventModal
 * @description Modal form for creating or editing a calendar event.
 *
 * When opened with an existing event (via `initialData`), the form is
 * pre-filled for editing. Otherwise it starts blank for creation.
 *
 * Supports **soft autofill**: when the user types a title, the rule engine
 * may suggest a colour and default times. The suggestion appears as a
 * dismissible banner — it never forces values on the user.
 */

import { useState, useEffect, useRef } from 'react';
import { EVENT_COLORS, DEFAULT_EVENT_COLOR } from '../../constants';
import { validateEvent } from '../../utils/eventModel';
import { formatISO } from '../../utils/dateUtils';

export default function EventModal({
  isOpen,
  initialData,
  selectedDate,
  onSave,
  onDelete,
  onClose,
  getAutoSuggestion,
  allColors,
}) {
  /* ---- Local form state ---- */
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_EVENT_COLOR);
  const [errors, setErrors] = useState([]);

  /* ---- Autofill suggestion state ---- */
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  /** Track whether a field was manually set by the user (don't overwrite). */
  const manualOverrides = useRef({ color: false, startTime: false, endTime: false });

  const isEditing = Boolean(initialData?.id);

  /* Re-initialise form when the modal opens or initialData changes. */
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      const iDate = initialData.startDate || initialData.date || '';
      setStartDate(iDate);
      setEndDate(initialData.endDate || iDate);
      setStartTime(initialData.startTime || '');
      setEndTime(initialData.endTime || '');
      setDescription(initialData.description || '');
      setColor(initialData.color || DEFAULT_EVENT_COLOR);
    } else {
      setTitle('');
      const defaultDate = selectedDate ? formatISO(selectedDate) : '';
      setStartDate(defaultDate);
      setEndDate(defaultDate);
      setStartTime('');
      setEndTime('');
      setDescription('');
      setColor(DEFAULT_EVENT_COLOR);
    }
    setErrors([]);
    setSuggestion(null);
    setSuggestionDismissed(false);
    manualOverrides.current = { color: false, startTime: false, endTime: false };
  }, [initialData, selectedDate, isOpen]);

  /* ---- Autofill: run rule engine when title changes (debounced feel) ---- */
  useEffect(() => {
    if (!getAutoSuggestion || isEditing || suggestionDismissed) {
      setSuggestion(null);
      return;
    }
    const match = getAutoSuggestion(title, description);
    setSuggestion(match);
  }, [title, description, getAutoSuggestion, isEditing, suggestionDismissed]);

  /* ---- Accept the current suggestion ---- */
  const acceptSuggestion = () => {
    if (!suggestion) return;
    if (suggestion.color && !manualOverrides.current.color) {
      setColor(suggestion.color);
    }
    if (suggestion.startTime && !manualOverrides.current.startTime) {
      setStartTime(suggestion.startTime);
    }
    if (suggestion.endTime && !manualOverrides.current.endTime) {
      setEndTime(suggestion.endTime);
    }
    setSuggestionDismissed(true);
    setSuggestion(null);
  };

  /* ---- Dismiss the suggestion ---- */
  const dismissSuggestion = () => {
    setSuggestionDismissed(true);
    setSuggestion(null);
  };

  /* ---- Handlers ---- */

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      title,
      startDate,
      endDate: endDate || startDate,
      date: startDate,      // legacy alias
      startTime,
      endTime,
      description,
      color,
    };
    const validationErrors = validateEvent(eventData);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(eventData, initialData?.id);
    onClose();
  };

  const handleDelete = () => {
    if (initialData?.id) {
      onDelete(initialData.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="modal__header">
          <h2 className="modal__title">
            {isEditing ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>
          <button
            className="btn btn--icon"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* ---- Body / Form ---- */}
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {/* Validation errors */}
            {errors.length > 0 && (
              <div role="alert">
                {errors.map((err) => (
                  <p key={err} className="form-field__error">{err}</p>
                ))}
              </div>
            )}

            {/* ---- Autofill suggestion banner ---- */}
            {suggestion && (
              <div className="suggestion-banner" data-testid="suggestion-banner">
                <div className="suggestion-banner__body">
                  <span className="suggestion-banner__icon">💡</span>
                  <span className="suggestion-banner__text">
                  Ressemble à <strong>{suggestion.ruleName}</strong> — appliquer la couleur
                    {suggestion.startTime ? ' et l\'horaire' : ''} suggérés ?
                  </span>
                </div>
                <div className="suggestion-banner__actions">
                  <button
                    type="button"
                    className="btn btn--sm btn--primary"
                    onClick={acceptSuggestion}
                  >
                    Appliquer
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={dismissSuggestion}
                  >
                    Ignorer
                  </button>
                </div>
              </div>
            )}

            {/* Titre */}
            <div className="form-field">
              <label className="form-field__label" htmlFor="event-title">
                Titre
              </label>
              <input
                id="event-title"
                className="form-field__input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'événement"
                autoFocus
              />
            </div>

            {/* Plage de dates */}
            <div className="form-field__row">
              <div className="form-field">
                <label className="form-field__label" htmlFor="event-start-date">
                  Date de début
                </label>
                <input
                  id="event-start-date"
                  className="form-field__input"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartDate(newStart);
                    // Keep end date >= start date
                    if (endDate && newStart > endDate) {
                      setEndDate(newStart);
                    }
                  }}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label" htmlFor="event-end-date">
                  Date de fin
                </label>
                <input
                  id="event-end-date"
                  className="form-field__input"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Plage horaire */}
            <div className="form-field__row">
              <div className="form-field">
                <label className="form-field__label" htmlFor="event-start">
                  Heure de début
                </label>
                <input
                  id="event-start"
                  className="form-field__input"
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    manualOverrides.current.startTime = true;
                  }}
                />
              </div>
              <div className="form-field">
                <label className="form-field__label" htmlFor="event-end">
                  Heure de fin
                </label>
                <input
                  id="event-end"
                  className="form-field__input"
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    manualOverrides.current.endTime = true;
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-field__label" htmlFor="event-desc">
                Description
              </label>
              <textarea
                id="event-desc"
                className="form-field__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description optionnelle…"
                rows={3}
              />
            </div>

            {/* Colour picker */}
            <div className="form-field">
              <span className="form-field__label">Couleur</span>
              <div className="color-picker">
                {(allColors || EVENT_COLORS).map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`color-picker__swatch ${color === c.value ? 'color-picker__swatch--selected' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => {
                      setColor(c.value);
                      manualOverrides.current.color = true;
                    }}
                    aria-label={c.label}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ---- Footer ---- */}
          <div className="modal__footer">
            {isEditing && (
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleDelete}
              >
                Supprimer
              </button>
            )}
            <button type="button" className="btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn--primary">
              {isEditing ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
