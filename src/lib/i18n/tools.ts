/**
 * Translation helpers for tool metadata. Tool definitions in the engine are
 * language-neutral; these functions map ids, option keys and choice values to
 * catalog entries with sensible fallbacks (tool-specific → common → literal).
 */
import type { SerializedError } from '$engine/core/errors';
import type { Choice, Direction, OptionSpec } from '$engine/core/types';
import { i18n } from './index.svelte';

export const toolName = (id: string) => i18n.tr(`tools.${id}.name`);
export const toolSummary = (id: string) => i18n.tr(`tools.${id}.summary`);
export const toolDescription = (id: string) => i18n.tr(`tools.${id}.description`);
export const categoryName = (id: string) => i18n.tr(`categories.${id}`);

export function actionLabel(toolId: string, direction: Direction): string {
  const key = `tools.${toolId}.actions.${direction}`;
  return i18n.has(key) ? i18n.tr(key) : i18n.tr(`workbench.${direction}`);
}

export function optionLabel(toolId: string, spec: Pick<OptionSpec, 'key'>): string {
  const own = `tools.${toolId}.options.${spec.key}`;
  if (i18n.has(own)) return i18n.tr(own);
  const common = `common.options.${spec.key}`;
  return i18n.has(common) ? i18n.tr(common) : spec.key;
}

export function choiceLabel(toolId: string, spec: Pick<OptionSpec, 'key'>, choice: Choice): string {
  if (choice.label) return choice.label;
  const own = `tools.${toolId}.choices.${spec.key}.${choice.value}`;
  if (i18n.has(own)) return i18n.tr(own);
  const common = `common.choices.${spec.key}.${choice.value}`;
  return i18n.has(common) ? i18n.tr(common) : choice.value;
}

export function errorMessage(error: SerializedError): string {
  return i18n.tr(`errors.${error.code}`, error.params ?? {}).trim();
}

export const categoryNote = (id: string) => i18n.tr(`categoryNotes.${id}`);

/** "c. 600 BCE", "1854", «حدود ۴۰۰ پ.م.» — or an empty string when no date is recorded. */
export function eraLabel(
  era: { readonly year: number; readonly circa?: boolean } | undefined,
): string {
  if (!era) return '';
  const year = i18n.number(Math.abs(era.year), { useGrouping: false });
  const date = i18n.tr(era.year < 0 ? 'era.bce' : 'era.ce', { year });
  return era.circa ? i18n.tr('era.circa', { date }) : date;
}
