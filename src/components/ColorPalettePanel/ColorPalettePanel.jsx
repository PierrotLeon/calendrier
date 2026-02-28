/**
 * @component ColorPalettePanel
 * @description Modal panel for managing the custom colour palette.
 *
 * Displays built-in colours (read-only) and custom colours (deletable).
 * Users can add new colours via a colour picker input.
 */

import { useState } from 'react';
import { EVENT_COLORS } from '../../constants';

/** Check that a string is a valid 3- or 6-digit hex colour. */
function isValidHex(value) {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(value);
}

/** Normalise shorthand (#ABC → #AABBCC). */
function normaliseHex(hex) {
  const h = hex.trim();
  if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
    return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`.toUpperCase();
  }
  return h.toUpperCase();
}

export default function ColorPalettePanel({
  isOpen,
  customColors,
  onAddColor,
  onRemoveColor,
  onClose,
}) {
  const [hexInput, setHexInput] = useState('#FF6B6B');
  const [pickerColor, setPickerColor] = useState('#FF6B6B');
  const [hexError, setHexError] = useState('');

  /** Keep picker and text input in sync when the picker changes. */
  const handlePickerChange = (e) => {
    const val = e.target.value;
    setPickerColor(val);
    setHexInput(val.toUpperCase());
    setHexError('');
  };

  /** Validate hex text input on the fly. */
  const handleHexChange = (e) => {
    let val = e.target.value;
    // Auto-prepend # if the user forgot it
    if (val && !val.startsWith('#')) val = `#${val}`;
    setHexInput(val);

    if (isValidHex(val)) {
      setPickerColor(normaliseHex(val));
      setHexError('');
    } else {
      setHexError(val.length > 1 ? 'Format attendu : #RGB ou #RRGGBB' : '');
    }
  };

  const handleAdd = () => {
    if (!isValidHex(hexInput)) {
      setHexError('Code hexadécimal invalide');
      return;
    }
    onAddColor(normaliseHex(hexInput));
    setHexError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-panel__header">
          <h2 className="modal__title">Palette de couleurs</h2>
          <button className="btn btn--icon" onClick={onClose} aria-label="Fermer la palette">
            ✕
          </button>
        </div>

        <div className="settings-panel__body">
          {/* Built-in colours */}
          <p className="settings-panel__desc">
            Couleurs par défaut (non modifiables) :
          </p>
          <div className="color-palette-grid">
            {EVENT_COLORS.map((c) => (
              <div key={c.value} className="color-palette-item">
                <span
                  className="color-palette-item__swatch"
                  style={{ backgroundColor: c.value }}
                />
                <span className="color-palette-item__label">{c.label}</span>
              </div>
            ))}
          </div>

          {/* Custom colours */}
          {customColors.length > 0 && (
            <>
              <p className="settings-panel__desc" style={{ marginTop: 'var(--space-4)' }}>
                Couleurs personnalisées :
              </p>
              <div className="color-palette-grid">
                {customColors.map((c) => (
                  <div key={c.value} className="color-palette-item">
                    <span
                      className="color-palette-item__swatch"
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="color-palette-item__label">{c.value}</span>
                    <button
                      className="btn btn--sm btn--danger"
                      onClick={() => onRemoveColor(c.value)}
                      aria-label={`Supprimer ${c.value}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Add new colour */}
          <div className="color-palette-add">
            <label className="form-field__label" htmlFor="new-color-hex">
              Ajouter une couleur
            </label>

            <div className="color-palette-add__row">
              {/* Small native picker as visual aid (optional on mobile) */}
              <input
                type="color"
                value={pickerColor}
                onChange={handlePickerChange}
                className="color-palette-add__picker"
                aria-label="Choisir une couleur"
                tabIndex={-1}
              />

              {/* Hex text input — primary input method */}
              <input
                id="new-color-hex"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck="false"
                maxLength={7}
                placeholder="#RRGGBB"
                value={hexInput}
                onChange={handleHexChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
                className="form-field__input color-palette-add__hex-input"
              />

              {/* Preview swatch */}
              <span
                className="color-palette-add__preview"
                style={{ backgroundColor: isValidHex(hexInput) ? normaliseHex(hexInput) : 'transparent' }}
              />

              <button
                className="btn btn--primary btn--sm"
                onClick={handleAdd}
              >
                Ajouter
              </button>
            </div>

            {hexError && (
              <p className="form-field__error">{hexError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
