/**
 * @module ruleEngine
 * @description Matches event titles/descriptions against user-defined
 * regex rules to suggest colour and time defaults.
 *
 * The matching is intentionally "soft" — it returns suggestions that
 * the UI can present without forcing them onto the user.
 */

/* ------------------------------------------------------------------ */
/*  Core matching function                                            */
/* ------------------------------------------------------------------ */

/**
 * Test a single rule's regex pattern against the provided text.
 * Returns `true` if the pattern matches (case-insensitive).
 *
 * Safely handles invalid regex by catching and returning `false`.
 *
 * @param {string} pattern – regex string from the rule.
 * @param {string} text    – text to match against (title + description).
 * @returns {boolean}
 */
export function testRulePattern(pattern, text) {
  if (!pattern || !text) return false;
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
  } catch {
    // Invalid regex — skip this rule silently.
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Find first matching rule                                          */
/* ------------------------------------------------------------------ */

/**
 * Iterate through an array of rules and return the first one whose
 * pattern matches the combined `title + " " + description` text.
 *
 * Only enabled rules are considered.
 *
 * @param {Object[]} rules – array of event-type rule objects.
 * @param {string}   title – event title.
 * @param {string}   [description=''] – event description.
 * @returns {Object|null} the matched rule, or `null` if none matched.
 */
export function findMatchingRule(rules, title, description = '') {
  if (!rules || !title) return null;
  const text = `${title} ${description}`.trim();

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (testRulePattern(rule.pattern, text)) {
      return rule;
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Build suggestion object                                           */
/* ------------------------------------------------------------------ */

/**
 * Given event text, return a "suggestion" object with optional
 * `color`, `startTime`, and `endTime` fields. Returns `null` if
 * no rule matches.
 *
 * The caller decides whether to apply these — they are **suggestions**,
 * not mandatory overrides.
 *
 * @param {Object[]} rules       – array of event-type rule objects.
 * @param {string}   title       – event title.
 * @param {string}   [description=''] – event description.
 * @returns {Object|null} `{ ruleName, color, startTime, endTime }` or `null`.
 */
export function getSuggestion(rules, title, description = '') {
  const rule = findMatchingRule(rules, title, description);
  if (!rule) return null;

  return {
    ruleName: rule.name,
    color: rule.color || null,
    startTime: rule.startTime || null,
    endTime: rule.endTime || null,
  };
}
