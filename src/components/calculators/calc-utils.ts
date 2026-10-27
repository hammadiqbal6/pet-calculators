import { fromKg, round, toKg, type WeightUnit } from '../../lib/units';

export type { WeightUnit };
export type LengthUnit = 'cm' | 'in';

export function readQuery(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function writeQuery(updates: Record<string, string | number | boolean | null | undefined>): void {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  window.history.replaceState(null, '', url);
}

/** Primary display in chosen unit with secondary kg/lb in parentheses. */
export function formatKgLb(kg: number, unit: WeightUnit, digits = 1): string {
  const primary = round(fromKg(kg, unit), digits);
  const other: WeightUnit = unit === 'kg' ? 'lb' : 'kg';
  const secondary = round(fromKg(kg, other), digits);
  return `${primary} ${unit} (${secondary} ${other})`;
}

export function formatGramsOz(g: number, digits = 0): string {
  const oz = g / 28.349523125;
  return `${round(g, digits)} g (${round(oz, digits)} oz)`;
}

export function cmToIn(cm: number): number {
  return cm / 2.54;
}

export function inToCm(inches: number): number {
  return inches * 2.54;
}

export function formatCmIn(cm: number, unit: LengthUnit, digits = 1): string {
  const primary = unit === 'cm' ? round(cm, digits) : round(cmToIn(cm), digits);
  const other: LengthUnit = unit === 'cm' ? 'in' : 'cm';
  const secondary = other === 'cm' ? round(cm, digits) : round(cmToIn(cm), digits);
  return `${primary} ${unit} (${secondary} ${other})`;
}

export function parseNum(value: string | null | undefined): number | null {
  if (value == null || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getNamedInput(form: HTMLFormElement, key: string): HTMLInputElement | null {
  const el = form.elements.namedItem(key);
  return el instanceof HTMLInputElement ? el : null;
}

/** Show or clear an accessible inline error under a field. */
export function setInputError(input: HTMLInputElement | null, message: string | null): void {
  if (!input) return;
  const field = input.closest('.field') ?? input.parentElement;
  const errId = `${input.id || input.name || 'field'}-error`;
  let err = field?.querySelector<HTMLElement>('[data-field-error]');

  if (!message) {
    input.removeAttribute('aria-invalid');
    const described = (input.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== errId);
    if (described.length) input.setAttribute('aria-describedby', described.join(' '));
    else input.removeAttribute('aria-describedby');
    if (err) {
      err.hidden = true;
      err.textContent = '';
    }
    return;
  }

  input.setAttribute('aria-invalid', 'true');
  if (!err && field) {
    err = document.createElement('p');
    err.className = 'field-error';
    err.dataset.fieldError = '';
    err.setAttribute('role', 'alert');
    field.appendChild(err);
  }
  if (!err) return;
  err.id = errId;
  err.hidden = false;
  err.textContent = message;
  const described = new Set(
    (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean),
  );
  described.add(errId);
  input.setAttribute('aria-describedby', [...described].join(' '));
}

export type NumberFieldOptions = {
  /** Inclusive minimum (defaults to the input's min attribute when present). */
  min?: number;
  /** Inclusive maximum (defaults to the input's max attribute when present). */
  max?: number;
  /** Require n > gt (e.g. gt: 0 rejects zero and negatives). */
  gt?: number;
  label?: string;
};

/**
 * Parse and validate a numeric form field. Sets aria-invalid + an inline error
 * when invalid; clears them when valid. Returns null when the value must not
 * be used for a result.
 */
export function readValidNumber(
  form: HTMLFormElement,
  key: string,
  options: NumberFieldOptions = {},
): number | null {
  const input = getNamedInput(form, key);
  const raw = input?.value ?? getFieldValue(form, key);
  const n = parseNum(raw);
  const label = options.label || 'Value';

  if (n == null) {
    setInputError(input, `Enter a valid ${label.toLowerCase()}.`);
    return null;
  }

  const minAttr = input && input.min !== '' ? Number(input.min) : undefined;
  const maxAttr = input && input.max !== '' ? Number(input.max) : undefined;
  const min = options.min ?? (Number.isFinite(minAttr) ? minAttr : undefined);
  const max = options.max ?? (Number.isFinite(maxAttr) ? maxAttr : undefined);
  const gt = options.gt;

  if (gt != null && !(n > gt)) {
    setInputError(input, `${label} must be greater than ${gt}.`);
    return null;
  }
  if (min != null && n < min) {
    setInputError(input, `${label} must be at least ${min}.`);
    return null;
  }
  if (max != null && n > max) {
    setInputError(input, `${label} must be at most ${max}.`);
    return null;
  }

  setInputError(input, null);
  return n;
}

export function getFieldValue(form: HTMLFormElement, key: string): string {
  const el = form.elements.namedItem(key);
  if (el instanceof RadioNodeList) {
    const checked = [...el].find((r) => r instanceof HTMLInputElement && r.checked);
    return checked instanceof HTMLInputElement ? checked.value : '';
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    return el.value;
  }
  return '';
}

export function setFieldValue(form: HTMLFormElement, key: string, value: string): void {
  const el = form.elements.namedItem(key);
  if (el instanceof RadioNodeList) {
    for (const r of el) {
      if (r instanceof HTMLInputElement) r.checked = r.value === value;
    }
    return;
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    el.value = value;
  }
}

export function applyQueryToForm(form: HTMLFormElement, keys: string[], defaults: Record<string, string> = {}): void {
  const q = readQuery();
  for (const key of keys) {
    const v = q.get(key) ?? defaults[key];
    if (v != null) setFieldValue(form, key, v);
  }
}

export function syncFormToQuery(form: HTMLFormElement, keys: string[]): void {
  const updates: Record<string, string> = {};
  for (const key of keys) {
    updates[key] = getFieldValue(form, key);
  }
  writeQuery(updates);
}

export function bindFormInputs(form: HTMLFormElement, keys: string[], onUpdate: () => void): void {
  for (const key of keys) {
    const el = form.elements.namedItem(key);
    if (el instanceof RadioNodeList) {
      for (const r of el) {
        if (r instanceof HTMLInputElement) r.addEventListener('change', onUpdate);
      }
    } else if (el instanceof HTMLElement) {
      el.addEventListener('input', onUpdate);
      el.addEventListener('change', onUpdate);
    }
  }
}

/** Fire a GA-friendly custom event when a calculation produces visible results. */
export function trackCalculation(toolSlug: string): void {
  try {
    document.dispatchEvent(
      new CustomEvent('petcalc:calculate', { detail: { tool: toolSlug } }),
    );
  } catch {
    /* ignore */
  }
}

export function showResults(panel: HTMLElement | null, visible: boolean): void {
  if (!panel) return;
  if (visible) {
    panel.removeAttribute('hidden');
    const form = panel.closest('form');
    const slug =
      form?.id?.replace(/-calc$/, '') ||
      panel.id?.replace(/-results$/, '') ||
      'unknown';
    trackCalculation(slug);
  } else {
    panel.setAttribute('hidden', '');
  }
}

type UnitToggleOptions<U extends string> = {
  root: ParentNode;
  selector: string;
  paramKey?: string;
  initial: U;
  onChange: (unit: U) => void;
};

function wireUnitToggle<U extends string>(options: UnitToggleOptions<U>): () => U {
  const { root, selector, paramKey = 'unit', initial, onChange } = options;
  const group = root.querySelector<HTMLElement>(selector);
  let unit: U = initial;

  const fromQuery = readQuery().get(paramKey);
  if (fromQuery && group?.querySelector(`button[data-unit="${fromQuery}"]`)) {
    unit = fromQuery as U;
  }

  const syncButtons = () => {
    group?.querySelectorAll<HTMLButtonElement>('button[data-unit]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.unit === unit));
    });
  };

  syncButtons();
  // Deferred so component scripts can finish declaring the elements/closures that
  // onChange reads; calling synchronously threw a TDZ ReferenceError at page load.
  queueMicrotask(() => onChange(unit));

  group?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-unit]');
    if (!btn?.dataset.unit) return;
    const next = btn.dataset.unit as U;
    if (next === unit) return;
    unit = next;
    syncButtons();
    writeQuery({ [paramKey]: unit });
    onChange(unit);
  });

  return () => unit;
}

/** Wire lb/kg toggle buttons inside `selector`. */
export function wireWeightUnitToggle(
  root: ParentNode,
  selector: string,
  initial: WeightUnit,
  onChange: (unit: WeightUnit) => void,
  paramKey = 'unit',
): () => WeightUnit {
  return wireUnitToggle({ root, selector, paramKey, initial, onChange });
}

export function wireLengthUnitToggle(
  root: ParentNode,
  selector: string,
  initial: LengthUnit,
  onChange: (unit: LengthUnit) => void,
  paramKey = 'hunit',
): () => LengthUnit {
  return wireUnitToggle({ root, selector, paramKey, initial, onChange });
}

export function weightKgFromForm(form: HTMLFormElement, weightKey: string, unit: WeightUnit): number | null {
  const w = readValidNumber(form, weightKey, { gt: 0, label: 'Weight' });
  if (w == null) return null;
  return toKg(w, unit);
}
