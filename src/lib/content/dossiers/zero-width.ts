import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'Hidden in plain sight', fa: 'پنهان در برابرِ چشم' },
  dek: {
    en: 'From shaved heads and wax tablets to characters with no width at all, steganography hides the fact that there is anything to read.',
    fa: 'از سرهای تراشیده و لوح‌های موم تا نویسه‌هایی که هیچ پهنایی ندارند، پنهان‌نگاری این واقعیت را پنهان می‌کند که اصلاً چیزی برای خواندن هست.',
  },
  body: {
    en: [
      'Herodotus tells of Histiaeus, who shaved the head of a trusted slave, tattooed a message on his scalp and waited for the hair to grow back before sending him to Aristagoras; and of Demaratus, who warned Sparta of Xerxes’ coming invasion by writing on the wooden backing of a tablet and covering it with fresh wax. The tablet arrived looking blank. It took Gorgo, the wife of King Leonidas, to guess that it was not.',
      'The word itself comes from Johannes Trithemius, abbot of Sponheim, whose *Steganographia* — written around 1499 and printed in 1606 — presented its methods as the summoning of spirits. It circulated in manuscript, was placed on the Index of Prohibited Books, and kept its secret until 1996–98, when Thomas Ernst and, independently, Jim Reeds showed that its notorious third book was a cipher.',
      'Digital text offers hiding places Trithemius would have loved. Unicode includes characters that take up no space at all, such as the zero-width space and joiner; strings of them can carry bits between the letters of an ordinary sentence and survive copy and paste, and they have been used to fingerprint leaked documents. This tool hides a message that way; the Unicode Inspector finds such characters again.',
    ],
    fa: [
      'هرودوت از هیستیائوس می‌گوید که سرِ بردهٔ مورد اعتمادش را تراشید، پیامی بر پوستِ سرش خال‌کوبی کرد و صبر کرد تا مویش بروید و سپس او را نزد آریستاگوراس فرستاد؛ و از دماراتوس که اسپارت را از یورشِ در راهِ خشایارشا آگاه کرد: بر پشتِ چوبیِ یک لوح نوشت و رویش را با مومِ تازه پوشاند. لوح خالی به نظر می‌رسید. گورگو، همسرِ لئونیداس شاه، بود که حدس زد خالی نیست.',
      'خودِ این واژه از یوهانس تریتمیوس، راهب‌سالارِ اشپونهایم، آمده است؛ *استگانوگرافیا*ی او، نوشته حدود ۱۴۹۹ و چاپ‌شده در ۱۶۰۶، روش‌هایش را در جامهٔ احضارِ ارواح عرضه می‌کرد. این کتاب به‌صورت دست‌نویس دست‌به‌دست شد، در فهرستِ کتاب‌های ممنوعه قرار گرفت و رازش را تا ۱۹۹۶–۱۹۹۸ نگه داشت؛ تا آنکه توماس ارنست و، جدا از او، جیم ریدز نشان دادند کتابِ سومِ پرآوازه‌اش یک رمز است.',
      'متنِ دیجیتال پنهانگاه‌هایی دارد که تریتمیوس عاشقشان می‌شد. یونیکد نویسه‌هایی دارد که هیچ فضایی اشغال نمی‌کنند، مانند فاصلهٔ بی‌پهنا و اتصال‌دهندهٔ بی‌پهنا؛ رشته‌ای از آن‌ها می‌تواند میانِ حروفِ یک جملهٔ معمولی بیت حمل کند، از رونوشت و چسباندن جان سالم به در ببرد، و برای اثرانگشت‌گذاری بر اسنادِ درزکرده نیز به کار رفته است. این ابزار پیامی را به همین شیوه پنهان می‌کند و بازرسِ یونیکد چنین نویسه‌هایی را دوباره پیدا می‌کند.',
    ],
  },
  figures: [
    {
      image: 'trithemius',
      caption: {
        en: 'Title page of the first printed edition of Trithemius’s *Steganographia*, Frankfurt, 1606: “the art of revealing one’s mind to the absent through hidden writing”.',
        fa: 'صفحهٔ عنوانِ نخستین ویراستِ چاپیِ *استگانوگرافیا*ی تریتمیوس، فرانکفورت، ۱۶۰۶: «هنرِ آشکار کردنِ اندیشه برای غایبان از راهِ نوشتارِ پنهان».',
      },
    },
  ],
  dispatches: [
    {
      date: { en: 'c. 480 BCE', fa: 'حدود ۴۸۰ پ.م.' },
      title: { en: 'Demaratus’ blank tablet', fa: 'لوحِ خالیِ دماراتوس' },
      body: {
        en: 'A warning under the wax, written as zero-width characters inside an innocent sentence. The output looks exactly like the cover; paste it into the Unicode Inspector to see what it carries.',
        fa: 'هشداری زیرِ موم، که به شکلِ نویسه‌های بی‌پهنا درونِ جمله‌ای بی‌گناه نوشته شده است. خروجی درست شبیهِ متنِ پوششی است؛ آن را در بازرسِ یونیکد بچسبانید تا ببینید چه با خود دارد.',
      },
      illustrative: true,
      load: {
        direction: 'encode',
        input: 'Xerxes is coming',
        options: { cover: 'A blank tablet, freshly waxed, for the ephors.' },
      },
    },
  ],
  reading: [
    { author: 'Herodotus', title: 'Histories, Books V and VII', year: -430 },
    { author: 'Johannes Trithemius', title: 'Steganographia', year: 1606 },
  ],
};
