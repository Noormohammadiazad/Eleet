/**
 * Provenance of every archival image Eleet ships.
 *
 * All images are public domain (old works, U.S. government works, or faithful
 * reproductions of public-domain two-dimensional art) or dedicated to the
 * public domain under CC0, as recorded on their Wikimedia Commons pages. The
 * renditions themselves are built by `tooling/build-archive.ts`.
 */
import type { ArchiveId } from './archive-media';
import type { Localized } from './types';

export interface ArchiveRecord {
  readonly title: Localized;
  readonly holder?: Localized;
  readonly license: 'pd' | 'cc0';
  /** The file's page on Wikimedia Commons. */
  readonly source: string;
}

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replaceAll(' ', '_'))}`;

export const ARCHIVE: Readonly<Record<ArchiveId, ArchiveRecord>> = {
  alkindi: {
    title: {
      en: 'Al-Kindi, Risāla fī istikhrāj al-muʿammā, 9th century (manuscript copy)',
      fa: 'الکندی، رسالة فی استخراج المعمّی، سدهٔ سوم هجری (نسخهٔ خطی)',
    },
    holder: { en: 'Süleymaniye Library, Istanbul', fa: 'کتابخانهٔ سلیمانیه، استانبول' },
    license: 'pd',
    source: commons('Al-kindi cryptographic 1.jpg'),
  },
  babington: {
    title: {
      en: 'Forged postscript to Mary, Queen of Scots’ letter to Anthony Babington, and Babington’s record of the cipher, 1586',
      fa: 'پی‌نوشتِ جعلیِ نامهٔ مری، ملکهٔ اسکاتلند، به آنتونی بابینگتون و یادداشتِ بابینگتون از کلید رمز، ۱۵۸۶',
    },
    holder: {
      en: 'The National Archives, Kew (SP 12/193/54; SP 53/18/55)',
      fa: 'بایگانی ملی بریتانیا، کیو',
    },
    license: 'pd',
    source: commons('Babington postscript.jpg'),
  },
  bacon: {
    title: {
      en: 'Francis Bacon, after Paul van Somer I, 1617',
      fa: 'فرانسیس بیکن، برگرفته از پاول فان سومر، ۱۶۱۷',
    },
    license: 'pd',
    source: commons('Somer Francis Bacon.jpg'),
  },
  braille: {
    title: { en: 'Louis Braille (1809–1852)', fa: 'لویی بریل (۱۸۰۹–۱۸۵۲)' },
    license: 'pd',
    source: commons('Louis Braille.jpg'),
  },
  'enigma-keylist': {
    title: {
      en: 'Luftwaffe Enigma key sheet, Maschinen-Schlüssel No. 649, c. 1944',
      fa: 'برگهٔ کلید انیگمای نیروی هوایی آلمان، شمارهٔ ۶۴۹، حدود ۱۹۴۴',
    },
    license: 'pd',
    source: commons('Enigma keylist 3 rotor.jpg'),
  },
  'enigma-machine': {
    title: {
      en: 'Enigma machine, Imperial War Museum, London (photograph by Karsten Sperling)',
      fa: 'ماشین انیگما، موزهٔ جنگ امپراتوری، لندن (عکس از کارستن اشپرلینگ)',
    },
    license: 'pd',
    source: commons('EnigmaMachineLabeled.jpg'),
  },
  'enigma-rotors': {
    title: {
      en: 'Two Enigma rotors and their spindle (photograph by Ted Coles)',
      fa: 'دو روتور انیگما و محورشان (عکس از تد کولز)',
    },
    license: 'pd',
    source: commons('Enigma rotors and spindle showing contacts rachet and notch.jpg'),
  },
  jeremiah: {
    title: {
      en: 'Michelangelo, The Prophet Jeremiah, Sistine Chapel ceiling, 1511',
      fa: 'میکل‌آنژ، ارمیای نبی، سقف کلیسای سیستین، ۱۵۱۱',
    },
    holder: { en: 'Vatican City', fa: 'واتیکان' },
    license: 'pd',
    source: commons('Michelangelo, profeti, Jeremiah 01.jpg'),
  },
  'mary-stuart': {
    title: {
      en: 'Mary, Queen of Scots, after François Clouet, c. 1559',
      fa: 'مری، ملکهٔ اسکاتلند، برگرفته از فرانسوا کلوئه، حدود ۱۵۵۹',
    },
    holder: { en: 'Victoria and Albert Museum, London', fa: 'موزهٔ ویکتوریا و آلبرت، لندن' },
    license: 'pd',
    source: commons('Mary Stuart Queen.jpg'),
  },
  trithemius: {
    title: {
      en: 'Johannes Trithemius, Steganographia, Frankfurt, 1606 — title page',
      fa: 'یوهانس تریتمیوس، استگانوگرافیا، فرانکفورت، ۱۶۰۶ — صفحهٔ عنوان',
    },
    holder: {
      en: 'Herzog August Bibliothek, Wolfenbüttel',
      fa: 'کتابخانهٔ هرتسوگ آوگوست، ولفنبوتل',
    },
    license: 'pd',
    source: commons(
      'Trithemius-Johannes-Steganographia-Johannes-Saurius,-1608.-Digitized-photographic-reproduction-provided-by-the-Herzog-August-Bibliothek.jpg',
    ),
  },
  vigenere: {
    title: {
      en: 'Blaise de Vigenère, engraving by Thomas de Leu, late 16th century',
      fa: 'بلز دو ویژنر، گراوور اثر توما دو لو، اواخر سدهٔ شانزدهم',
    },
    license: 'pd',
    source: commons('Vigenere.jpg'),
  },
  zimmermann: {
    title: {
      en: 'The Zimmermann Telegram as received by the German Legation in Mexico City, 19 January 1917',
      fa: 'تلگراف زیمرمان، آن‌گونه که سفارت آلمان در مکزیکوسیتی دریافت کرد، ۱۹ ژانویهٔ ۱۹۱۷',
    },
    holder: { en: 'U.S. National Archives (302025)', fa: 'بایگانی ملی ایالات متحده' },
    license: 'pd',
    source: commons(
      'Zimmermann Telegram as Received by the German Ambassador to Mexico - NARA - 302025.jpg',
    ),
  },
  'zimmermann-decoded': {
    title: {
      en: 'The Zimmermann Telegram, decrypted and translated, as received by the U.S. State Department, 1917',
      fa: 'تلگراف زیمرمان، رمزگشایی و ترجمه‌شده، آن‌گونه که وزارت خارجهٔ آمریکا دریافت کرد، ۱۹۱۷',
    },
    holder: { en: 'U.S. National Archives', fa: 'بایگانی ملی ایالات متحده' },
    license: 'pd',
    source: commons('Zimmermann-telegramm-offen.jpg'),
  },
};
