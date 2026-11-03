import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'The indecipherable cipher', fa: 'رمزِ ناگشودنی' },
  dek: {
    en: 'For three centuries a repeating keyword defeated the codebreakers of Europe. Then two men broke it, independently, within a decade.',
    fa: 'سه سده یک کلیدواژهٔ تکرارشونده رمزشکنان اروپا را ناکام گذاشت. سپس دو نفر، جدا از هم و در کمتر از یک دهه، آن را شکستند.',
  },
  body: {
    en: [
      'In 1553 Giovan Battista Bellaso published a cipher that shifts each letter by a different amount, set by an easily remembered keyword repeated along the message. Blaise de Vigenère described a stronger relative — the autokey, in which the message itself extends the key — in his *Traicté des chiffres* of 1586, and posterity attached his name to Bellaso’s simpler system.',
      'Because the same plaintext letter is enciphered differently from one position to the next, counting letters no longer gives it away, and the cipher earned the name *le chiffre indéchiffrable*. Charles Babbage broke it around 1854 but never published; the Prussian officer Friedrich Kasiski did, in 1863, after noticing that repeated fragments of ciphertext sit a multiple of the key length apart.',
      'In the American Civil War the Confederacy relied on Vigenère, with brass cipher disks and a handful of keywords such as MANCHESTER BLUFF, COMPLETE VICTORY and, near the end, COME RETRIBUTION. Union telegraphers read much of the traffic. Eleet’s Cipher Cracker recovers Vigenère keys the modern way, with William Friedman’s index of coincidence and chi-squared statistics.',
    ],
    fa: [
      'در ۱۵۵۳ جووان باتیستا بلاسو رمزی منتشر کرد که هر حرف را به اندازه‌ای متفاوت جابه‌جا می‌کند و این اندازه را کلیدواژه‌ای به‌یادماندنی تعیین می‌کند که در طول پیام تکرار می‌شود. بلز دو ویژنر خویشاوندِ نیرومندترِ آن را، یعنی خودکلید که در آن خودِ پیام کلید را ادامه می‌دهد، در *رساله‌ای دربارهٔ رمزها* (۱۵۸۶) شرح داد و آیندگان نام او را بر نظامِ ساده‌ترِ بلاسو گذاشتند.',
      'چون یک حرفِ متن ساده در هر جایگاه به شکلی دیگر رمز می‌شود، شمارش حروف دیگر چیزی را لو نمی‌دهد و این رمز به *رمزِ ناگشودنی* شهرت یافت. چارلز بابیج حدود ۱۸۵۴ آن را شکست اما هرگز منتشر نکرد؛ افسر پروسی، فریدریش کاسیسکی، در ۱۸۶۳ چنین کرد، پس از آنکه دید پاره‌های تکراریِ متن رمز به فاصله‌ای برابر با مضربی از طول کلید از هم قرار دارند.',
      'در جنگ داخلی آمریکا، کنفدراسیون به ویژنر با دیسک‌های رمز برنجی و چند کلیدواژه مانند MANCHESTER BLUFF، COMPLETE VICTORY و در روزهای پایانی COME RETRIBUTION تکیه داشت. تلگرافچیان اتحادیه بخش بزرگی از این پیام‌ها را می‌خواندند. رمزشکنِ Eleet کلید ویژنر را به شیوهٔ امروزی، با شاخص هم‌آیندیِ ویلیام فریدمن و آمارهٔ خی‌دو، بازمی‌یابد.',
    ],
  },
  figures: [
    {
      image: 'vigenere',
      caption: {
        en: 'Blaise de Vigenère (1523–1596), engraved by Thomas de Leu.',
        fa: 'بلز دو ویژنر (۱۵۲۳–۱۵۹۶)، گراوور اثر توما دو لو.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: 'Textbook', fa: 'نمونهٔ درسی' },
      title: { en: 'Attack at dawn', fa: 'حمله در سپیده‌دم' },
      body: {
        en: 'The standard example: ATTACKATDAWN under the key LEMON becomes LXFOPVEFRNHR. Notice the two As of ATTACK coming out as L and O.',
        fa: 'نمونهٔ استاندارد: ATTACKATDAWN با کلید LEMON به LXFOPVEFRNHR بدل می‌شود. ببینید دو Aِ واژهٔ ATTACK چگونه به L و O تبدیل می‌شوند.',
      },
      illustrative: true,
      load: {
        direction: 'encode',
        input: 'ATTACKATDAWN',
        options: { variant: 'vigenere', key: 'LEMON' },
      },
    },
    {
      date: { en: '1864', fa: '۱۸۶۴' },
      title: { en: 'COMPLETE VICTORY', fa: 'COMPLETE VICTORY' },
      body: {
        en: 'One of the Confederacy’s keywords. Enciphered with it, any order looks like the dispatches Union telegraphers intercepted.',
        fa: 'یکی از کلیدواژه‌های کنفدراسیون. هر فرمانی که با آن رمز شود به پیام‌هایی می‌ماند که تلگرافچیان اتحادیه رهگیری می‌کردند.',
      },
      illustrative: true,
      load: {
        direction: 'encode',
        input: 'REINFORCEMENTS WILL ARRIVE BY THE NIGHT TRAIN',
        options: { variant: 'vigenere', key: 'COMPLETE VICTORY' },
      },
    },
  ],
  reading: [
    {
      author: 'Blaise de Vigenère',
      title: 'Traicté des chiffres, ou secrètes manières d’escrire',
      year: 1586,
    },
    { author: 'Simon Singh', title: 'The Code Book', year: 1999 },
  ],
};
