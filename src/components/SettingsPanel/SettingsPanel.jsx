/**
 * @component SettingsPanel
 * @description Slide-over panel for managing event templates.
 *
 * Each template defines a regex pattern, a colour, and optional default times.
 * When a new event's title matches a template's pattern, the modal will
 * softly suggest the template's colour and time.
 *
 * Users can add, edit, delete, toggle, and reset templates from this panel.
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

  /* ---- Begin editing a template inline ---- */
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

  /* ---- Add a blank template and start editing it ---- */
  const handleAdd = () => {
    const ruleData = {
      name: 'Nouveau modèle',
      pattern: '\\b(mot-clé)\\b',
      color: EVENT_COLORS[0].value,
      startTime: '',
      endTime: '',
      enabled: true,
    };
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
          <h2 className="modal__title">Modèles d'événements</h2>
          <button className="btn btn--icon" onClick={onClose} aria-label="Fermer les modèles">
            ✕
          </button>
        </div>

        {/* ---- Description ---- */}
        <div className="settings-panel__body">
          <p className="settings-panel__desc">
            Définissez des modèles pour suggérer automatiquement une couleur et
            un horaire lors de la création d'événements. Les motifs sont des
            <strong> expressions régulières</strong> insensibles à la casse,
            testées sur le titre et la description.
          </p>

          {/* ---- Template list ---- */}
          <div className="settings-panel__rules" role="list">
            {rules.map((rule) => (
              <div key={rule.id} className="rule-card" role="listitem">
                {editingId === rule.id ? (
                  /* ---- Inline edit form ---- */
                  <div className="rule-card__edit">
                    <div className="form-field">
                      <label className="form-field__label" htmlFor={`rule-name-${rule.id}`}>
                        Nom
                      </label>
                      <input
                        id={`rule-name-${rule.id}`}
                        className="form-field__input"
                        type="text"
                        value={draft.name || ''}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="Nom du modèle"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-field__label" htmlFor={`rule-pattern-${rule.id}`}>
                        Expression régulière
                      </label>
                      <input
                        id={`rule-pattern-${rule.id}`}
                        className="form-field__input"
                        type="text"
                        value={draft.pattern || ''}
                        onChange={(e) => setDraft({ ...draft, pattern: e.target.value })}
                        placeholder="\\b(mot-clé)\\b"
                      />
                    </div>

                    <div className="form-field">
                      <span className="form-field__label">Couleur</span>
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
                          Début par défaut
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
                          Fin par défaut
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
                        Enregistrer
                      </button>
                      <button className="btn btn--sm" onClick={cancelEdit}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ---- Read-only template display ---- */
                  <div className="rule-card__display">
                    <div className="rule-card__header">
                      <div
                        className="rule-card__color-dot"
                        style={{ backgroundColor: rule.color }}
                      />
                      <span className="rule-card__name">{rule.name}</span>
                      <label className="rule-card__toggle" title={rule.enabled ? 'Activé' : 'Désactivé'}>
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => onUpdateRule(rule.id, { enabled: e.target.checked })}
                          aria-label={`Activer ${rule.name}`}
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
                        Modifier
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        onClick={() => onDeleteRule(rule.id)}
                      >
                        Supprimer
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
            Réinitialiser
          </button>
          <button className="btn btn--primary" onClick={handleAdd}>
            + Ajouter un modèle
          </button>
        </div>
      </div>
    </div>
  );
}
