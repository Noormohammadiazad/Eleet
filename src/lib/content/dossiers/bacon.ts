import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'Everything through everything', fa: 'همه‌چیز در همه‌چیز' },
  dek: {
    en: 'Francis Bacon’s two-letter alphabet could hide any message inside any other — and three centuries later convinced believers that it hid him inside Shakespeare.',
    fa: 'الفبای دوحرفیِ فرانسیس بیکن می‌توانست هر پیامی را در دل هر پیام دیگری پنهان کند؛ و سه سده بعد، باورمندانی را قانع کرد که خودِ او را در دل آثار شکسپیر پنهان کرده است.',
  },
  body: {
    en: [
      'In *De Augmentis Scientiarum* (1623), the expanded Latin edition of *The Advancement of Learning*, Francis Bacon described a cipher he said he had devised as a young man in Paris. Every letter becomes a group of five symbols drawn from only two, *a* and *b*: A is aaaaa, B is aaaab, and so on through his 24-letter alphabet.',
      'The power of the idea, Bacon saw, is that the two symbols can be anything that comes in two forms: two typefaces, two letter sizes, two kinds of bell or light. A secret “interior letter” can therefore ride inside any innocent “exterior letter” five times its length — *omnia per omnia*, everything through everything. It is steganography rather than cryptography, and an ancestor of binary code.',
      'The idea had a strange afterlife. From the 1890s, Baconians such as Elizabeth Wells Gallup claimed to find biliteral messages in the italic typefaces of Shakespeare’s First Folio, proving that Bacon wrote the plays. The cryptologists William and Elizebeth Friedman, who had worked on Gallup’s project at Riverbank Laboratories in their youth, examined the claims rigorously and rejected them in *The Shakespearean Ciphers Examined* (1957).',
    ],
    fa: [
      'فرانسیس بیکن در *دربارهٔ شأن و پیشرفت دانش‌ها* (۱۶۲۳)، ویراستِ لاتینِ گسترش‌یافتهٔ *پیشرفت دانش*، رمزی را شرح داد که به گفتهٔ خودش در جوانی در پاریس ابداع کرده بود. هر حرف به گروهی پنج‌تایی از تنها دو نماد، *a* و *b*، بدل می‌شود: A می‌شود aaaaa، B می‌شود aaaab و همین‌طور تا پایانِ الفبای ۲۴حرفی‌اش.',
      'بیکن دریافته بود که نیروی این ایده در آن است که دو نماد می‌توانند هر چیزی باشند که دو شکل دارد: دو حروف‌نما، دو اندازهٔ حرف، دو گونه زنگ یا چراغ. پس «نامهٔ درونیِ» پنهان می‌تواند سوار بر هر «نامهٔ بیرونیِ» بی‌گناهی سفر کند که پنج برابر آن درازا داشته باشد — *omnia per omnia*، همه‌چیز در همه‌چیز. این پنهان‌نگاری است نه رمزنگاری، و نیای کدِ دودویی.',
      'این ایده زندگیِ پس از مرگِ عجیبی داشت. از دههٔ ۱۸۹۰ بیکنی‌هایی چون الیزابت ولز گالوپ مدعی شدند پیام‌هایی دوحرفی در حروفِ ایتالیکِ نخستین مجموعهٔ آثار شکسپیر یافته‌اند که ثابت می‌کند بیکن نمایشنامه‌ها را نوشته است. رمزشناسان ویلیام و الیزبت فریدمن، که در جوانی در آزمایشگاه‌های ریوربنک روی پروژهٔ گالوپ کار کرده بودند، این ادعاها را دقیق بررسی کردند و در کتاب *رمزهای شکسپیری زیر ذره‌بین* (۱۹۵۷) رد کردند.',
    ],
  },
  figures: [
    {
      image: 'bacon',
      caption: {
        en: 'Francis Bacon (1561–1626), after the 1617 portrait by Paul van Somer.',
        fa: 'فرانسیس بیکن (۱۵۶۱–۱۶۲۶)، برگرفته از چهرهٔ ۱۶۱۷ اثر پاول فان سومر.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: '1623', fa: '۱۶۲۳' },
      title: { en: 'Fuge', fa: 'Fuge' },
      body: {
        en: 'Bacon’s own example hid FUGE (“flee”) in the exterior letter “Manere te volo donec venero” (“I want you to stay until I come”). Eleet uses capital and small letters as the two forms and Bacon’s 24-letter alphabet; decode the result to recover the warning.',
        fa: 'نمونهٔ خودِ بیکن واژهٔ FUGE («بگریز») را در نامهٔ بیرونیِ «Manere te volo donec venero» («می‌خواهم بمانی تا من بیایم») پنهان می‌کرد. Eleet حروف بزرگ و کوچک را دو شکلِ نماد می‌گیرد و الفبای ۲۴حرفیِ بیکن را به کار می‌برد؛ نتیجه را رمزگشایی کنید تا هشدار بازیابی شود.',
      },
      load: {
        direction: 'encode',
        input: 'FUGE',
        options: { mode: 'case', variant: 'classic', cover: 'Manere te volo donec venero' },
      },
    },
  ],
  reading: [
    { author: 'Francis Bacon', title: 'De Augmentis Scientiarum', year: 1623 },
    {
      author: 'William F. Friedman & Elizebeth S. Friedman',
      title: 'The Shakespearean Ciphers Examined',
      year: 1957,
    },
  ],
};
