import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'What hath God wrought', fa: 'خدا چه آفرید' },
  dek: {
    en: 'Samuel Morse and Alfred Vail turned the alphabet into rhythm — and gave the commonest letter the shortest signal.',
    fa: 'ساموئل مورس و آلفرد ویل الفبا را به ریتم بدل کردند و کوتاه‌ترین علامت را به پرکاربردترین حرف دادند.',
  },
  body: {
    en: [
      'On 24 May 1844 Samuel Morse sat in the Supreme Court chamber of the Capitol in Washington and tapped out a verse from the Book of Numbers chosen by Annie Ellsworth: “What hath God wrought.” Alfred Vail received it some forty miles away in Baltimore and sent it back. The age of electric communication had begun.',
      'Vail, Morse’s partner, is usually credited with the code’s most elegant idea: signals were assigned by frequency, and to estimate frequencies he is said to have counted the type in a printer’s cases. E, the commonest letter in English, became a single dot and T a single dash, while rare letters such as Q and Z got long patterns. The International code, standardised in 1865, refined the American original and is the one still heard today.',
      'SOS was adopted as the distress call in 1906 because ··· ––– ··· is unmistakable, not because it stands for anything. Ships kept Morse until the Global Maritime Distress and Safety System replaced it in 1999. When the French Navy gave it up in 1997, its last transmission read: “Calling all. This is our last cry before our eternal silence.”',
    ],
    fa: [
      'در ۲۴ مه ۱۸۴۴ ساموئل مورس در تالار دیوان عالی در ساختمان کنگره در واشنگتن نشست و آیه‌ای از سِفر اعداد را که آنی السورث برگزیده بود مخابره کرد: «خدا چه آفرید». آلفرد ویل آن را در بالتیمور، حدود چهل مایل دورتر، دریافت کرد و بازفرستاد. عصر ارتباطات الکتریکی آغاز شده بود.',
      'معمولاً زیباترین ایدهٔ این کد را به ویل، شریک مورس، نسبت می‌دهند: علامت‌ها بر پایهٔ بسامد تخصیص یافتند و گفته‌اند برای تخمین بسامدها، حروفِ سربیِ جعبه‌های یک چاپخانه را شمرد. E، پرکاربردترین حرف انگلیسی، یک نقطه شد و T یک خط، و حروف کمیاب‌تری چون Q و Z الگوهای بلند گرفتند. کد بین‌المللی، که در ۱۸۶۵ استاندارد شد، نسخهٔ آمریکایی را پیراست و همانی است که هنوز شنیده می‌شود.',
      'SOS در ۱۹۰۶ به‌عنوان علامت اضطرار پذیرفته شد، چون ··· ––– ··· اشتباه‌ناپذیر است، نه چون کوتاه‌نوشتِ چیزی است. کشتی‌ها تا ۱۹۹۹، که سامانهٔ جهانی اضطرار و ایمنی دریایی جایش را گرفت، مورس را نگه داشتند. هنگامی که نیروی دریایی فرانسه در ۱۹۹۷ آن را کنار گذاشت، آخرین پیامش این بود: «همگان را فرامی‌خوانیم. این واپسین فریاد ما پیش از سکوتِ ابدی‌مان است.»',
    ],
  },
  figures: [
    {
      diagram: 'morse',
      caption: {
        en: 'Vail’s principle. Letters in order of their frequency in English, with their International Morse signals: the commonest get the shortest.',
        fa: 'اصلِ ویل. حروف به ترتیبِ بسامدشان در انگلیسی، همراه با علامتِ مورسِ بین‌المللی‌شان: پرکاربردترین‌ها کوتاه‌ترین را می‌گیرند.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: '24 May 1844', fa: '۲۴ مه ۱۸۴۴' },
      title: { en: 'What hath God wrought', fa: 'خدا چه آفرید' },
      body: {
        en: 'The first public message on the Washington–Baltimore line (Numbers 23:23). Press play to hear it at your chosen speed.',
        fa: 'نخستین پیامِ عمومی روی خط واشنگتن–بالتیمور (اعداد ۲۳:۲۳). دکمهٔ پخش را بزنید تا آن را با سرعت دلخواه بشنوید.',
      },
      load: { direction: 'encode', input: 'WHAT HATH GOD WROUGHT' },
    },
    {
      date: { en: '1906', fa: '۱۹۰۶' },
      title: { en: 'SOS', fa: 'SOS' },
      body: {
        en: 'Three dots, three dashes, three dots — sent as one continuous signal, without the gaps between letters.',
        fa: 'سه نقطه، سه خط، سه نقطه — به‌صورت یک علامتِ پیوسته و بی‌فاصله میان حروف فرستاده می‌شود.',
      },
      load: { direction: 'encode', input: 'SOS' },
    },
    {
      date: { en: '31 January 1997', fa: '۳۱ ژانویهٔ ۱۹۹۷' },
      title: { en: 'Our last cry', fa: 'واپسین فریاد' },
      body: {
        en: 'The French Navy’s farewell to Morse, in English translation.',
        fa: 'بدرودِ نیروی دریایی فرانسه با مورس، در ترجمهٔ انگلیسی.',
      },
      quote: 'Appel à tous. Ceci est notre dernier cri avant notre silence éternel.',
      load: {
        direction: 'encode',
        input: 'CALLING ALL. THIS IS OUR LAST CRY BEFORE OUR ETERNAL SILENCE.',
      },
    },
  ],
};
