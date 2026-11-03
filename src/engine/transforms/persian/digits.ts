/**
 * Digit systems — Western Arabic (0–9), Persian (۰–۹, U+06F0) and
 * Eastern Arabic (٠–٩, U+0660). They look alike but are different code
 * points, a classic source of bugs in form validation and search.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

const SYSTEMS = {
  latin: '0123456789',
  persian: '۰۱۲۳۴۵۶۷۸۹',
  arabic: '٠١٢٣٤٥٦٧٨٩',
} as const;
type System = keyof typeof SYSTEMS;

export function convertDigits(text: string, target: System, separators: boolean): string {
  const digits = SYSTEMS[target];
  let out = text.replace(/[0-9۰-۹٠-٩]/g, (d) => {
    for (const set of Object.values(SYSTEMS)) {
      const i = set.indexOf(d);
      if (i >= 0) return digits[i]!;
    }
    return d;
  });
  if (separators) {
    out =
      target === 'latin'
        ? out.replace(/[٫]/g, '.').replace(/[٬]/g, ',')
        : out
            .replace(/(?<=[۰-۹٠-٩])\.(?=[۰-۹٠-٩])/g, '٫')
            .replace(/(?<=[۰-۹٠-٩]),(?=[۰-۹٠-٩])/g, '٬');
  }
  return out;
}

export const digits = defineTransform({
  kind: 'transform',
  id: 'digits',
  category: 'persian',
  keywords: ['digits', 'numbers', 'persian numerals', 'arabic numerals', 'ارقام', 'اعداد'],
  sample: { encode: 'Order #2026 — ۱۴۰۵/۰۷/۰۶ — ٣٫١٤' },
  options: [
    opt.select('target', ['persian', 'arabic', 'latin'], 'persian', { control: 'segmented' }),
    opt.boolean('separators', true),
  ],
  encode: (input, o) => convertDigits(input, o.target, o.separators),
});
