import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'Night writing, made for fingers', fa: 'نوشتنِ شبانه، ساخته برای سرانگشت' },
  dek: {
    en: 'A teenage student cut an artillery officer’s twelve-dot code down to the six-dot cell that millions of people read today.',
    fa: 'دانش‌آموزی نوجوان کدِ دوازده‌نقطه‌ایِ یک افسر توپخانه را به خانهٔ شش‌نقطه‌ای کاهش داد که امروز میلیون‌ها نفر می‌خوانند.',
  },
  body: {
    en: [
      'Louis Braille lost his sight as a small child after an accident in his father’s harness workshop in Coupvray, east of Paris. At the Royal Institute for Blind Youth he met the system of Charles Barbier, an artillery officer who had proposed *night writing* — raised dots that could be read in the dark. Barbier’s cells were up to twelve dots tall and stood for sounds: too large to feel at once, and unable to spell.',
      'Braille, then about fifteen, reduced the cell to six dots in two columns of three, small enough to sit under a fingertip, and assigned the patterns to letters, numbers, punctuation and music. He published the system in 1829 as a *Method of Writing Words, Music, and Plain Song by Means of Dots*. His own institute did not formally adopt it until 1854, two years after his death.',
      'Six dots give 63 patterns, enough for an alphabet and its signs. Eleet writes uncontracted English braille — one cell per letter, with the capital and number signs — using the Unicode Braille Patterns block.',
    ],
    fa: [
      'لویی بریل در کودکی، پس از حادثه‌ای در کارگاه زین‌سازیِ پدرش در کوپوره، در شرق پاریس، بینایی‌اش را از دست داد. در مؤسسهٔ سلطنتیِ جوانان نابینا با نظامِ شارل باربیه آشنا شد، افسرِ توپخانه‌ای که *نوشتنِ شبانه* را پیشنهاد کرده بود: نقطه‌هایی برجسته که در تاریکی خوانده می‌شدند. خانه‌های باربیه تا دوازده نقطه بلندی داشتند و نمایندهٔ صداها بودند؛ بزرگ‌تر از آنکه یکجا لمس شوند و ناتوان از هجی کردن.',
      'بریل، که آن زمان حدود پانزده سال داشت، خانه را به شش نقطه در دو ستونِ سه‌تایی کاهش داد، آن‌قدر کوچک که زیر یک سرانگشت جا شود، و الگوها را به حروف، اعداد، نشانه‌های نگارشی و موسیقی اختصاص داد. او این نظام را در ۱۸۲۹ با عنوانِ *روشِ نوشتنِ واژه‌ها، موسیقی و آواز ساده با نقطه* منتشر کرد. مؤسسهٔ خودش تا ۱۸۵۴، دو سال پس از مرگ او، آن را رسماً نپذیرفت.',
      'شش نقطه ۶۳ الگو می‌سازد، به اندازهٔ یک الفبا و نشانه‌هایش. Eleet بریلِ انگلیسیِ غیرفشرده را می‌نویسد — برای هر حرف یک خانه، با نشانه‌های حرف بزرگ و عدد — و از بلوکِ الگوهای بریلِ یونیکد بهره می‌گیرد.',
    ],
  },
  figures: [
    {
      image: 'braille',
      caption: { en: 'Louis Braille (1809–1852).', fa: 'لویی بریل (۱۸۰۹–۱۸۵۲).' },
    },
  ],
  dispatches: [
    {
      date: { en: '1829', fa: '۱۸۲۹' },
      title: { en: 'His own name', fa: 'نامِ خودش' },
      body: {
        en: 'Louis Braille, written in his own system: note the capital sign before each capital letter.',
        fa: 'لویی بریل، نوشته‌شده با نظامِ خودش: به نشانهٔ حرف بزرگ پیش از هر حرف بزرگ دقت کنید.',
      },
      load: { direction: 'encode', input: 'Louis Braille' },
    },
  ],
};
