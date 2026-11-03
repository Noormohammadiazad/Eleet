import type { Dossier } from '../types';

const DICKENS_DEGREY =
  'Lx crw rki hvwr rj zzqcv, mz neq wlk nspvx uw xgpiy, zx udw zyi yji uw agvhud, mr zey klc dkk fj drsrzwfqiyj, mr zey klc htutl mi fkcmci, mz neq wlk vtmfl uw mlfvkuyjlxe, zx udw zyi qheyfr mi Poxlr, lx crw rki yveqrr uw Hyuotvwq, lx crw rki ygvgqk uw lmsi, ok ayv xnv agqxki sd giygegu.';

export const dossier: Dossier = {
  headline: {
    en: 'The telegram that brought America into the war',
    fa: 'تلگرافی که آمریکا را به جنگ کشاند',
  },
  dek: {
    en: 'In January 1917 Britain’s codebreakers read a German offer to Mexico — and then had to use it without revealing that they could.',
    fa: 'در ژانویهٔ ۱۹۱۷ رمزشکنان بریتانیا پیشنهادِ آلمان به مکزیک را خواندند و سپس ناچار بودند از آن بهره ببرند بی‌آنکه فاش کنند توانِ خواندنش را دارند.',
  },
  body: {
    en: [
      'On 16 January 1917 the German foreign minister Arthur Zimmermann sent his ambassador in Washington a coded telegram to forward to Mexico City. If the United States entered the war, Germany proposed an alliance with Mexico and promised it the return of Texas, New Mexico and Arizona. Britain had cut Germany’s transatlantic cables in 1914, so the message travelled partly over American diplomatic channels — and through British hands.',
      'In the Admiralty’s Room 40, Nigel de Grey and the Reverend William Montgomery recovered most of it from partially reconstructed codebooks. To protect their source, the British obtained the copy that had been retransmitted by commercial telegraph from Washington to Mexico — the sheet in Fig. 1 — so that the leak could be blamed on Mexico. Published in the American press on 1 March 1917, the telegram turned opinion; the United States declared war on 6 April.',
      'The Zimmermann telegram was a codebook, and no statistics alone could have read it. The classical ciphers in this cabinet are different: their keys are small enough to search, or they leave statistical fingerprints. The Cracker tries every Caesar and affine key, estimates a Vigenère key length with William Friedman’s index of coincidence (1922), recovers each key letter by chi-squared, and ranks every candidate by how much it reads like English.',
    ],
    fa: [
      'در ۱۶ ژانویهٔ ۱۹۱۷ آرتور زیمرمان، وزیر خارجهٔ آلمان، تلگرافی رمزی برای سفیرش در واشنگتن فرستاد تا به مکزیکوسیتی برساند. اگر ایالات متحده وارد جنگ می‌شد، آلمان پیشنهادِ اتحاد با مکزیک را می‌داد و بازگرداندنِ تگزاس، نیومکزیکو و آریزونا را وعده می‌کرد. بریتانیا در ۱۹۱۴ کابل‌های فراآتلانتیکِ آلمان را بریده بود، پس پیام بخشی از راه را از مجاری دیپلماتیکِ آمریکا پیمود؛ و از دستِ بریتانیایی‌ها گذشت.',
      'در اتاق ۴۰ دریاداری، نایجل دو گری و کشیش ویلیام مونتگومری بیشترِ آن را با کتاب‌کدهایی که تا حدی بازسازی کرده بودند گشودند. بریتانیایی‌ها برای حفظِ منبعشان نسخه‌ای را به دست آوردند که با تلگراف تجاری از واشنگتن به مکزیک بازفرستاده شده بود — برگهٔ تصویر ۱ — تا درز را به گردنِ مکزیک بیندازند. انتشارِ تلگراف در مطبوعات آمریکا در ۱ مارس ۱۹۱۷ افکار را دگرگون کرد و ایالات متحده در ۶ آوریل اعلام جنگ کرد.',
      'تلگراف زیمرمان کتاب‌کد بود و هیچ آماری به‌تنهایی نمی‌توانست آن را بخواند. رمزهای کلاسیکِ این گنجینه فرق دارند: کلیدهایشان آن‌قدر کوچک است که بتوان همه را آزمود، یا اثرانگشتی آماری بر جا می‌گذارند. رمزشکن همهٔ کلیدهای سزار و آفین را می‌آزماید، طولِ کلیدِ ویژنر را با شاخصِ هم‌آیندیِ ویلیام فریدمن (۱۹۲۲) تخمین می‌زند، هر حرفِ کلید را با آمارهٔ خی‌دو بازمی‌یابد و هر نامزد را بر پایهٔ شباهتش به انگلیسی رتبه می‌دهد.',
    ],
  },
  figures: [
    {
      image: 'zimmermann',
      caption: {
        en: 'The telegram as retransmitted by Western Union from Washington to the German Legation in Mexico City, 19 January 1917. Each group of digits stands for a word or syllable in the German codebook.',
        fa: 'تلگراف، آن‌گونه که وسترن یونیون آن را از واشنگتن به سفارتِ آلمان در مکزیکوسیتی بازفرستاد، ۱۹ ژانویهٔ ۱۹۱۷. هر گروهِ رقم نمایندهٔ یک واژه یا هجا در کتاب‌کدِ آلمانی است.',
      },
    },
    {
      image: 'zimmermann-decoded',
      caption: {
        en: 'The decrypted and translated text, as passed from London to the U.S. State Department.',
        fa: 'متنِ رمزگشایی و ترجمه‌شده، آن‌گونه که از لندن به وزارت خارجهٔ آمریکا رسید.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: '19 January 1917', fa: '۱۹ ژانویهٔ ۱۹۱۷' },
      title: { en: 'Western Union, via Galveston', fa: 'وسترن یونیون، از راهِ گالوستون' },
      body: {
        en: 'The retransmitted copy opens with these code groups. Each stands for a word or syllable in a codebook, which is why no cipher-breaking statistics apply.',
        fa: 'نسخهٔ بازفرستاده با این گروه‌های کد آغاز می‌شود. هر یک نمایندهٔ واژه یا هجایی در یک کتاب‌کد است و از همین رو آمارِ رمزشکنی بر آن کارگر نیست.',
      },
      quote: '130 13042 13401 8501 115 3528 416 17214 6491 11310',
    },
    {
      date: { en: 'A test for the Cracker', fa: 'آزمونی برای رمزشکن' },
      title: { en: 'A key it has never seen', fa: 'کلیدی که هرگز ندیده است' },
      body: {
        en: 'The opening of *A Tale of Two Cities*, enciphered with Vigenère under a six-letter keyword. Run the Cracker and watch the key fall out — a nod to Room 40.',
        fa: 'آغازِ *داستان دو شهر*، رمزشده با ویژنر و کلیدواژه‌ای شش‌حرفی. رمزشکن را اجرا کنید تا کلید بیرون بیفتد — اشاره‌ای به اتاق ۴۰.',
      },
      illustrative: true,
      load: { direction: 'encode', input: DICKENS_DEGREY },
    },
  ],
  reading: [
    { author: 'Barbara W. Tuchman', title: 'The Zimmermann Telegram', year: 1958 },
    {
      author: 'William F. Friedman',
      title: 'The Index of Coincidence and Its Applications in Cryptography',
      year: 1922,
    },
  ],
};
