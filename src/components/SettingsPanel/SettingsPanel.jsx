/**
 * @component SettingsPanel
 * @description Slide-over panel for managing event-type rules.
 *
 * Each rule defines a regex pattern, a colour, and optional default times.
 * When a new event's title matches a rule's pattern, the modal will
 * softly suggest the rule's colour and time.
 *
 * Users can add, edit, delete, toggle, and reset rules from this panel.
 */

import { useState } from 'react';
import { EVENT_COLORS } from '../../constants';

export default function SettingsPanel({
  isOpen,
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onResetDefaults,
  onClose,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  /* ---- Begin editing a rule inline ---- */
  const startEditing = (rule) => {
    setEditingId(rule.id);
    setDraft({ ...rule });
  };

  /* ---- Save current inline edit ---- */
  const saveEdit = () => {
    if (editingId && draft.name && draft.pattern) {
      onUpdateRule(editingId, draft);
      setEditingId(null);
      setDraft({});
    }
  };

  /* ---- Cancel inline edit ---- */
  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  /* ---- Add a blank rule and start editing it ---- */
  const handleAdd = () => {
    const ruleData = {
      name: 'New Rule',
      pattern: '\\b(keyword)\\b',
      color: EVENT_COLORS[0].value,
      startTime: '',
      endTime: '',
      enabled: true,
    };
    // onAddRule returns the created rule (with generated id).
    // If it doesn't, we still call it and skip inline editing.
    const newRule = onAddRule(ruleData);
    if (newRule && newRule.id) {
      startEditing(newRule);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="settings-panel__header">
          <h2 className="modal__title">Event Type Rules</h2>
          <button className="btn btn--icon" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        {/* ---- Description ---- */}
        <div className="settings-panel__body">
          <p className="settings-panel__desc">
            Define rules to auto-suggest colours and times when creating events.
            Patterns are matched as <strong>case-insensitive regex</strong> against
            the event title and description.
          </p>

          {/* ---- Rule list ---- */}
          <div className="settings-panel__rules" role="list">
            {rules.map((rule) => (
              <div key={rule.id} className="rule-card" role="listitem">
                {editingId === rule.id ? (
                  /* ---- Inline edit form ---- */
                  <div className="rule-card__edit">
                    <div className="form-field">
                      <label className="form-field__label" htmlFor={`rule-name-${rule.id}`}>
                        Name
                      </label>
                      <input
                        id={`rule-name-${rule.id}`}
                        className="form-field__input"
                        type="text"
                        value={draft.name || ''}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="Rule name"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-field__label" htmlFor={`rule-pattern-${rule.id}`}>
                        Regex Pattern
                      </label>
                      <input
                        id={`rule-pattern-${rule.id}`}
                        className="form-field__input"
                        type="text"
                        value={draft.pattern || ''}
                        onChange={(e) => setDraft({ ...draft, pattern: e.target.value })}
                        placeholder="\\b(keyword)\\b"
                      />
                    </div>

                    <div className="form-field">
                      <span className="form-field__label">Colour</span>
                      <div className="color-picker">
                        {EVENT_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            className={`color-picker__swatch ${draft.color === c.value ? 'color-picker__swatch--selected' : ''}`}
                            style={{ backgroundColor: c.value }}
                            onClick={() => setDraft({ ...draft, color: c.value })}
                            aria-label={c.label}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="form-field__row">
                      <div className="form-field">
                        <label className="form-field__label" htmlFor={`rule-start-${rule.id}`}>
                          Default Start
                        </label>
                        <input
                          id={`rule-start-${rule.id}`}
                          className="form-field__input"
                          type="time"
                          value={draft.startTime || ''}
                          onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-field__label" htmlFor={`rule-end-${rule.id}`}>
                          Default End
                        </label>
                        <input
                          id={`rule-end-${rule.id}`}
                          className="form-field__input"
                          type="time"
                          value={draft.endTime || ''}
                          onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="rule-card__actions">
                      <button className="btn btn--primary btn--sm" onClick={saveEdit}>
                        Save
                      </button>
                      <button className="btn btn--sm" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ---- Read-only rule display ---- */
                  <div className="rule-card__display">
                    <div className="rule-card__header">
                      <div
                        className="rule-card__color-dot"
                        style={{ backgroundColor: rule.color }}
                      />
                      <span className="rule-card__name">{rule.name}</span>
                      <label className="rule-card__toggle" title={rule.enabled ? 'Enabled' : 'Disabled'}>
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => onUpdateRule(rule.id, { enabled: e.target.checked })}
                          aria-label={`Toggle ${rule.name}`}
                        />
                        <span className="rule-card__toggle-label">
                          {rule.enabled ? 'On' : 'Off'}
                        </span>
                      </label>
                    </div>
                    <code className="rule-card__pattern">{rule.pattern}</code>
                    {(rule.startTime || rule.endTime) && (
                      <span className="rule-card__time">
                        {rule.startTime || '—'} – {rule.endTime || '—'}
                      </span>
                    )}
                    <div className="rule-card__actions">
                      <button className="btn btn--sm" onClick={() => startEditing(rule)}>
                        Edit
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        onClick={() => onDeleteRule(rule.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="settings-panel__footer">
          <button className="btn" onClick={onResetDefaults}>
            Reset to Defaults
          </button>
          <button className="btn btn--primary" onClick={handleAdd}>
            + Add Rule
          </button>
        </div>
      </div>
    </div>
  );
}
