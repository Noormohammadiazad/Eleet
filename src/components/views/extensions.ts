/**
 * Tool-specific UI extensions.
 *
 * Most tools are fully served by the schema-driven workbench. A few deserve a
 * bespoke interface — an Enigma machine you can see, a Morse transmitter you
 * can hear, a leet glyph matrix you can edit. They plug in here:
 *
 *  - `options`      replaces (`replace`) or extends (`append`) the options panel
 *  - `after`        renders below the editors
 *  - `REPORTS`      render the structured results of analyzers
 */
import type { Component } from 'svelte';
import type { ToolSession } from '$lib/state/session.svelte';
import CaesarBrute from './CaesarBrute.svelte';
import CrackReport from './CrackReport.svelte';
import EnigmaPanel from './EnigmaPanel.svelte';
import FancyGallery from './FancyGallery.svelte';
import FrequencyReport from './FrequencyReport.svelte';
import HashTable from './HashTable.svelte';
import InspectorReport from './InspectorReport.svelte';
import LeetStudio from './LeetStudio.svelte';
import MagicReport from './MagicReport.svelte';
import MorsePlayer from './MorsePlayer.svelte';
import ScytalePanel from './ScytalePanel.svelte';

type SessionComponent = Component<{ session: ToolSession }>;

export interface Extension {
  readonly options?: SessionComponent;
  readonly optionsMode?: 'replace' | 'append';
  readonly after?: SessionComponent;
}

export const EXTENSIONS: Readonly<Record<string, Extension>> = {
  leet: { options: LeetStudio, optionsMode: 'append' },
  enigma: { options: EnigmaPanel, optionsMode: 'replace' },
  caesar: { after: CaesarBrute },
  scytale: { after: ScytalePanel },
  morse: { after: MorsePlayer },
  fancy: { after: FancyGallery },
  hash: { after: HashTable },
};

// Report components receive the analyzer's result as `report` (typed inside each component).
export const REPORTS: Readonly<Record<string, Component<{ report: never; session: ToolSession }>>> =
  {
    magic: MagicReport,
    crack: CrackReport,
    frequency: FrequencyReport,
    inspector: InspectorReport,
  };
