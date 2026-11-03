import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'Elite, spelled sideways', fa: 'نخبه، کج‌نوشته' },
  dek: {
    en: 'On the bulletin boards of the 1980s, swapping letters for look-alikes was a badge of membership — and a way past the filters.',
    fa: 'در بی‌بی‌اس‌های دههٔ ۱۹۸۰، جایگزین کردنِ حروف با همشکل‌هایشان نشانِ عضویت بود — و راهی برای گذشتن از فیلترها.',
  },
  body: {
    en: [
      '*Leet* is a corruption of *elite*. On dial-up bulletin board systems, the elite were the users trusted with access to restricted areas, and the spelling became a marker of belonging. Writing 3 for E, 4 for A or |-| for H also slipped past simple keyword filters and inattentive system operators, so it spread through the warez and hacking scenes and on into online gaming, where *pwned* and *n00b* still live.',
      'The number 31337 — *eleet* — turned up wherever hackers wanted to sign their work. It was, for example, the default port of Back Orifice, the remote-administration tool released by the Cult of the Dead Cow in 1998.',
      'As a cipher, leet is a substitution with several glyphs per letter and no secret key — closer to Atbash than to Enigma, which is why it sits among them in this catalogue. Eleet treats it with the same rigour as its elders. Every built-in preset is collision-free: no two letters ever share a glyph, so *i* becomes 1 while *l* stays *l*. And decoding is a beam search scored by an English language model, not a lookup table.',
    ],
    fa: [
      '*لیت* شکلِ دگرگون‌شدهٔ *elite* (نخبه) است. در بی‌بی‌اس‌های تلفنی، نخبگان کاربرانی بودند که به بخش‌های محدود دسترسی داشتند و این املا نشانِ تعلق شد. نوشتنِ 3 به‌جای E، 4 به‌جای A یا |-| به‌جای H از فیلترهای سادهٔ کلیدواژه و چشمِ مدیرانِ کم‌دقت هم می‌گذشت؛ پس در محافلِ وارز و هک پخش شد و به بازی‌های آنلاین رسید، جایی که *pwned* و *n00b* هنوز زنده‌اند.',
      'عدد 31337 — یعنی *eleet* — هر جا هکرها می‌خواستند پای کارشان امضا بگذارند پیدا می‌شد. برای نمونه، درگاهِ پیش‌فرضِ Back Orifice بود، ابزارِ مدیریتِ از راه دوری که گروهِ Cult of the Dead Cow در ۱۹۹۸ منتشر کرد.',
      'لیت به‌عنوان رمز، جانشینی‌ای است با چند نماد برای هر حرف و بی‌هیچ کلیدِ پنهان — به اتباش نزدیک‌تر است تا انیگما، و از همین رو در این فهرست کنارِ آن‌هاست. Eleet با آن به همان دقتی رفتار می‌کند که با پیشینیانش. همهٔ پیش‌تنظیم‌ها بی‌برخوردند: هیچ دو حرفی نمادِ مشترک ندارند؛ پس *i* به 1 بدل می‌شود و *l* همان *l* می‌ماند. و رمزگشایی جست‌وجویی پرتویی است که با مدلِ زبانِ انگلیسی امتیاز می‌گیرد، نه جدولی برای نگاه کردن.',
    ],
  },
  figures: [
    {
      diagram: 'leet',
      caption: {
        en: 'The classic preset, letter by letter. Every glyph belongs to exactly one letter; letters without a safe glyph — l among them — are left as they are.',
        fa: 'پیش‌تنظیمِ کلاسیک، حرف به حرف. هر نماد دقیقاً از آنِ یک حرف است؛ حروفی که نمادِ بی‌خطری ندارند — از جمله l — دست‌نخورده می‌مانند.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: 'c. 1985', fa: 'حدود ۱۹۸۵' },
      title: { en: 'Elite hackers', fa: 'هکرهای نخبه' },
      body: {
        en: 'The phrase that named the dialect, in the default preset. Swap and decode to read it back.',
        fa: 'عبارتی که نامِ این گویش را داد، با پیش‌تنظیمِ پیش‌فرض. جابه‌جا و رمزگشایی کنید تا دوباره خوانده شود.',
      },
      load: { direction: 'encode', input: 'elite hackers' },
    },
  ],
};
