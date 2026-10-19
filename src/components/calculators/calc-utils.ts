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

export function showResults(panel: HTMLElement | null, visible: boolean): void {
  if (!panel) return;
  if (visible) panel.removeAttribute('hidden');
  else panel.setAttribute('hidden', '');
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
  const w = parseNum(getFieldValue(form, weightKey));
  if (w == null || w <= 0) return null;
  return toKg(w, unit);
}
