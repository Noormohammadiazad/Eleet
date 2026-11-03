/**
 * The dossier library. Each dossier is a separate module, loaded on demand
 * when its tool is opened, so the historical texts (in both languages) cost
 * nothing until someone reads them.
 */
import type { ArchiveId } from './archive-media';
import type { Dossier, Localized } from './types';

type Loader = () => Promise<{ dossier: Dossier }>;

const LOADERS: Readonly<Record<string, Loader>> = {
  atbash: () => import('./dossiers/atbash'),
  caesar: () => import('./dossiers/caesar'),
  vigenere: () => import('./dossiers/vigenere'),
  playfair: () => import('./dossiers/playfair'),
  enigma: () => import('./dossiers/enigma'),
  leet: () => import('./dossiers/leet'),
  scytale: () => import('./dossiers/scytale'),
  bacon: () => import('./dossiers/bacon'),
  'zero-width': () => import('./dossiers/zero-width'),
  polybius: () => import('./dossiers/polybius'),
  braille: () => import('./dossiers/braille'),
  morse: () => import('./dossiers/morse'),
  frequency: () => import('./dossiers/frequency'),
  crack: () => import('./dossiers/crack'),
};

export const hasDossier = (toolId: string): boolean => toolId in LOADERS;

export async function loadDossier(toolId: string): Promise<Dossier | null> {
  const load = LOADERS[toolId];
  return load ? (await load()).dossier : null;
}

/** Plates for the overview's "From the archive" shelf (kept in the main bundle: tiny). */
export interface Plate {
  readonly tool: string;
  readonly image: ArchiveId;
  readonly headline: Localized;
}

export const PLATES: readonly Plate[] = [
  {
    tool: 'enigma',
    image: 'enigma-keylist',
    headline: { en: 'A month of Enigma keys', fa: 'کلیدهای یک ماهِ انیگما' },
  },
  {
    tool: 'frequency',
    image: 'alkindi',
    headline: { en: 'The scholar who counted letters', fa: 'دانشمندی که حروف را شمرد' },
  },
  {
    tool: 'crack',
    image: 'zimmermann',
    headline: { en: 'The Zimmermann Telegram', fa: 'تلگراف زیمرمان' },
  },
  {
    tool: 'bacon',
    image: 'bacon',
    headline: { en: 'Everything through everything', fa: 'همه‌چیز در همه‌چیز' },
  },
  {
    tool: 'zero-width',
    image: 'trithemius',
    headline: { en: 'Steganographia, 1606', fa: 'استگانوگرافیا، ۱۶۰۶' },
  },
  {
    tool: 'atbash',
    image: 'jeremiah',
    headline: { en: 'The prophet’s mirror alphabet', fa: 'الفبای آینه‌ایِ پیامبر' },
  },
];
