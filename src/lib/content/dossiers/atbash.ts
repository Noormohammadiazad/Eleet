import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'The prophet’s mirror alphabet', fa: 'الفبای آینه‌ایِ پیامبر' },
  dek: {
    en: 'Twice in the Book of Jeremiah, a name is hidden by folding the Hebrew alphabet in half.',
    fa: 'در کتاب ارمیا دو بار نامی با تا کردنِ الفبای عبری از وسط پنهان شده است.',
  },
  body: {
    en: [
      'Atbash takes its name from the letters it pairs: *alef* with *tav*, *bet* with *shin* — the first with the last, the second with the second-to-last. It needs no key at all; anyone who knows the trick can read it, which is why it is better understood as a scribal device than as a true secret.',
      'In Jeremiah 25:26 and 51:41 the text reads “Sheshach” (ששך) where the sense demands Babel (בבל): *shin-shin-kaf* mirrors *bet-bet-lamed*. In Jeremiah 51:1, “Leb Kamai” (לב קמי), “the heart of those who rise against me”, stands for Kasdim (כשדים), the Chaldeans. Whether the disguise protected anyone or was a literary flourish is still debated.',
      'Medieval Kabbalists made much of such letter games, and the same mirror works for any alphabet. Eleet folds the Latin, Hebrew and Persian alphabets.',
    ],
    fa: [
      'نام اَتباش از حروفی گرفته شده که با هم جفت می‌کند: *الف* با *تاو*، *بت* با *شین*؛ حرف نخست با آخرین، دومی با یکی مانده به آخر. هیچ کلیدی لازم ندارد؛ هر کس ترفند را بداند می‌تواند آن را بخواند و از همین رو بهتر است آن را شگردی کاتبانه دانست تا رازی واقعی.',
      'در ارمیا ۲۵:۲۶ و ۵۱:۴۱ متن «ششک» (ששך) آمده است، جایی که معنا «بابل» (בבל) را می‌طلبد: *شین-شین-کاف* آینهٔ *بت-بت-لامد* است. در ارمیا ۵۱:۱، «لِب‌کامای» (לב קמי)، «دلِ آنان که بر من برمی‌خیزند»، به‌جای «کَسدیم» (כשדים)، یعنی کلدانیان، نشسته است. هنوز بحث است که آیا این پوشش از کسی محافظت می‌کرد یا آرایه‌ای ادبی بود.',
      'قبالائیان سده‌های میانه به این بازی‌های حرفی دلبستگی بسیار داشتند و همین آینه برای هر الفبایی کار می‌کند. Eleet الفباهای لاتین، عبری و فارسی را تا می‌کند.',
    ],
  },
  figures: [
    {
      image: 'jeremiah',
      caption: {
        en: 'The prophet Jeremiah, painted by Michelangelo on the ceiling of the Sistine Chapel in 1511.',
        fa: 'ارمیای نبی، اثر میکل‌آنژ بر سقف کلیسای سیستین، ۱۵۱۱.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: 'Jeremiah 25:26', fa: 'ارمیا ۲۵:۲۶' },
      title: { en: 'Sheshach', fa: 'ششک' },
      body: {
        en: 'Mirror בבל (Babel) and you get the prophet’s ששך. Eleet writes the last letter in its medial form, כ.',
        fa: 'בבל (بابل) را در آینه ببینید تا ששךِ پیامبر به دست آید. Eleet حرف آخر را به شکل میانی‌اش، כ، می‌نویسد.',
      },
      load: { direction: 'encode', input: 'בבל', options: { alphabet: 'hebrew' } },
    },
    {
      date: { en: 'Jeremiah 51:1', fa: 'ارمیا ۵۱:۱' },
      title: { en: 'Leb Kamai', fa: 'لِب‌کامای' },
      body: {
        en: 'Kasdim, the Chaldeans, read in the mirror.',
        fa: 'کَسدیم، کلدانیان، در آینه.',
      },
      load: { direction: 'encode', input: 'כשדים', options: { alphabet: 'hebrew' } },
    },
  ],
};
