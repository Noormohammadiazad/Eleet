import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'The general’s shift', fa: 'جابه‌جاییِ سردار' },
  dek: {
    en: 'Julius Caesar moved every letter three places along the alphabet — the simplest cipher in history, and still the first one everybody learns.',
    fa: 'ژولیوس سزار هر حرف را سه خانه در الفبا جلو می‌برد؛ ساده‌ترین رمز تاریخ، و هنوز نخستین رمزی که همه یاد می‌گیرند.',
  },
  body: {
    en: [
      'Our source is the biographer Suetonius, writing around 120 CE. When Caesar had anything confidential to say, he wrote it in cipher, “that is, by so changing the order of the letters of the alphabet that not a word could be made out.” Whoever wished to read it, Suetonius explains, had to substitute the fourth letter, D, for A, and so on through the alphabet.',
      'His heir Augustus used a lazier version, according to the same author: B for A, C for B, and — rather than wrapping around — AA for the last letter. Caesar himself, in his account of the war in Gaul, describes sending a message to the besieged Quintus Cicero written *in Greek letters*, so that the enemy could not read it if it were intercepted.',
      'With only twenty-five possible keys a shift cipher offers no real secrecy: try every shift and one of them reads, which is exactly what the panel under the workbench does. That has not stopped people trusting it. In 1915 the Russian army is reported to have fallen back on it because its troops struggled with anything harder, and German and Austrian cryptanalysts read the messages with ease. As late as 2006, the Sicilian Mafia boss Bernardo Provenzano was caught partly because notes he wrote in a numerical variant (A = 4, B = 5…) were broken by investigators.',
    ],
    fa: [
      'منبع ما زندگی‌نامه‌نویس رومی، سوئتونیوس، است که حدود سال ۱۲۰ میلادی می‌نوشت. به گفتهٔ او سزار هرگاه سخنی محرمانه داشت آن را به رمز می‌نوشت، «یعنی ترتیب حروف الفبا را چنان تغییر می‌داد که هیچ واژه‌ای خوانده نشود». سوئتونیوس توضیح می‌دهد که خواننده باید به‌جای A حرف چهارم، یعنی D، را بگذارد و همین‌طور تا پایان الفبا.',
      'به روایت همین نویسنده، جانشین او آگوستوس نسخه‌ای تنبل‌تر به کار می‌برد: B به‌جای A، C به‌جای B و برای حرف آخر، به‌جای چرخیدن به آغاز الفبا، AA. خودِ سزار در گزارش جنگ گل از پیامی می‌گوید که برای کوئینتوس سیسرونِ محاصره‌شده فرستاد و آن را *با حروف یونانی* نوشت تا اگر به دست دشمن افتاد خوانده نشود.',
      'رمزی با تنها بیست‌وپنج کلید عملاً پنهان‌کاری‌ای فراهم نمی‌کند: همهٔ جابه‌جایی‌ها را بیازمایید تا یکی خوانا شود؛ همان کاری که صفحهٔ زیر میز کار انجام می‌دهد. با این همه، مردم همچنان به آن اعتماد کرده‌اند. گزارش شده است که ارتش روسیه در ۱۹۱۵ به آن روی آورد چون سربازانش از رمزهای دشوارتر سر درنمی‌آوردند، و رمزشکنان آلمانی و اتریشی پیام‌ها را به‌آسانی می‌خواندند. حتی در ۲۰۰۶ برناردو پروونتسانو، سرکردهٔ مافیای سیسیل، تا حدی به این دلیل دستگیر شد که یادداشت‌هایش را با گونه‌ای عددی از همین رمز (A = 4، B = 5…) نوشته بود و بازجویان آن را گشودند.',
    ],
  },
  figures: [
    {
      diagram: 'caesar',
      caption: {
        en: 'The shift of three. Each letter of the plain alphabet (outer ring) is written as the letter three places on (inner ring).',
        fa: 'جابه‌جاییِ سه‌تایی. هر حرف الفبای ساده (حلقهٔ بیرونی) به صورت حرفی نوشته می‌شود که سه خانه جلوتر است (حلقهٔ درونی).',
      },
    },
  ],
  dispatches: [
    {
      date: { en: '47 BCE', fa: '۴۷ پ.م.' },
      title: { en: 'Veni, vidi, vici', fa: 'آمدم، دیدم، پیروز شدم' },
      body: {
        en: 'Caesar’s report of his lightning victory at Zela, enciphered the way Suetonius describes. Swap it back and decode, or let the panel below try every key.',
        fa: 'گزارش سزار از پیروزیِ برق‌آسایش در زلا، به همان شیوه‌ای که سوئتونیوس شرح می‌دهد رمز شده است. آن را برگردانید و رمزگشایی کنید، یا بگذارید صفحهٔ پایین همهٔ کلیدها را بیازماید.',
      },
      illustrative: true,
      load: { direction: 'encode', input: 'VENI VIDI VICI', options: { shift: 3 } },
    },
    {
      date: { en: '27 BCE – 14 CE', fa: '۲۷ پ.م. تا ۱۴ م.' },
      title: { en: 'Augustus: one step', fa: 'آگوستوس: یک گام' },
      body: {
        en: 'Augustus shifted by a single letter. Eleet’s wheel wraps around, so Z becomes A rather than his AA.',
        fa: 'آگوستوس تنها یک حرف جابه‌جا می‌کرد. چرخِ Eleet دور می‌زند، پس Z به A تبدیل می‌شود، نه به AAِ او.',
      },
      illustrative: true,
      load: { direction: 'encode', input: 'AUGUSTUS CAESAR', options: { shift: 1 } },
    },
  ],
  reading: [
    { author: 'Suetonius', title: 'The Lives of the Twelve Caesars', year: 121 },
    { author: 'David Kahn', title: 'The Codebreakers', year: 1967 },
  ],
};
