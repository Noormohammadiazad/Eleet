import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: {
    en: 'A cipher for schoolboys, not attachés',
    fa: 'رمزی برای دانش‌آموزان، نه وابسته‌های سفارت',
  },
  dek: {
    en: 'Charles Wheatstone’s pencil-and-paper cipher was dismissed as too difficult for diplomats — and then served soldiers through three wars.',
    fa: 'رمزِ مداد و کاغذیِ چارلز ویتستون برای دیپلمات‌ها بیش از اندازه دشوار شمرده شد و سپس در سه جنگ به کار سربازان آمد.',
  },
  body: {
    en: [
      'Charles Wheatstone, better remembered for the telegraph and the concertina, devised the cipher in 1854; his friend Lyon Playfair promoted it so energetically in Whitehall that it took his name. It enciphers letters in pairs on a 5×5 square scrambled by a keyword, which flattens single-letter frequencies and forces an attacker to count 600 possible pairs instead of 26 letters.',
      'The Foreign Office was unconvinced. When Wheatstone offered to show that boys from a nearby school could learn it in a quarter of an hour, an under-secretary is said to have replied that this was very possible, “but you could never teach it to attachés.” The British Army nevertheless used it as a field cipher in the Boer War and the First World War, valued because it needed no equipment at all — only pencil, paper and a remembered keyword.',
      'Its most famous message dates from August 1943, after the American torpedo boat PT-109 was rammed and sunk in Blackett Strait in the Solomon Islands. Coastwatchers’ Playfair traffic about the boat and its missing crew — which included its commander, John F. Kennedy — has become the textbook example of the cipher in the field.',
    ],
    fa: [
      'چارلز ویتستون، که بیشتر برای تلگراف و کُنسرتینا به یاد آورده می‌شود، این رمز را در ۱۸۵۴ ابداع کرد؛ دوستش لاین پلیفر چنان پرشور در وایت‌هال از آن دفاع کرد که نام او بر آن ماند. این رمز حروف را جفت‌جفت روی مربعی ۵×۵ که با کلیدواژه درهم شده است رمز می‌کند؛ بسامد تک‌حرف‌ها را هموار می‌کند و مهاجم را وامی‌دارد به‌جای ۲۶ حرف، ۶۰۰ جفتِ ممکن را بشمارد.',
      'وزارت خارجه قانع نشد. وقتی ویتستون پیشنهاد کرد نشان دهد پسرانِ مدرسه‌ای در همان نزدیکی می‌توانند آن را در یک ربع ساعت بیاموزند، گفته‌اند معاون وزیر پاسخ داد که این بسیار ممکن است، «اما هرگز نمی‌توانید آن را به وابسته‌های سفارت یاد بدهید». با این همه ارتش بریتانیا در جنگ بوئر و جنگ جهانی اول آن را به‌عنوان رمز میدانی به کار برد، چون به هیچ ابزاری نیاز نداشت: تنها مداد، کاغذ و کلیدواژه‌ای در یاد.',
      'مشهورترین پیامش به اوت ۱۹۴۳ بازمی‌گردد، پس از آنکه قایق اژدرافکن آمریکایی PT-109 در تنگهٔ بلکت در جزایر سلیمان شکافته و غرق شد. پیام‌های پلیفرِ دیده‌بانان ساحلی دربارهٔ این قایق و خدمهٔ گمشده‌اش، که فرمانده‌اش جان اف. کندی نیز در میانشان بود، به نمونهٔ درسیِ کاربرد این رمز در میدان بدل شده است.',
    ],
  },
  figures: [
    {
      diagram: 'playfair',
      caption: {
        en: 'The square for the key ROYAL NEW ZEALAND NAVY: the keyword without repeats, then the rest of the alphabet. I and J share a cell.',
        fa: 'مربعِ کلید ROYAL NEW ZEALAND NAVY: نخست کلیدواژه بدون حروف تکراری، سپس باقی الفبا. I و J در یک خانه‌اند.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: 'August 1943', fa: 'اوت ۱۹۴۳' },
      title: { en: 'PT-109', fa: 'PT-109' },
      body: {
        en: 'The report as it is usually quoted, with its key ROYAL NEW ZEALAND NAVY. ONE OWE NINE spells out the number unambiguously, and X stands for each full stop.',
        fa: 'گزارش، آن‌گونه که معمولاً نقل می‌شود، با کلیدش ROYAL NEW ZEALAND NAVY. عبارت ONE OWE NINE عدد را بی‌ابهام هجی می‌کند و X جای هر نقطه را می‌گیرد.',
      },
      quote:
        'PT BOAT ONE OWE NINE LOST IN ACTION IN BLACKETT STRAIT TWO MILES SW MERESU COVE X CREW OF TWELVE X REQUEST ANY INFORMATION',
      load: {
        direction: 'encode',
        input:
          'PT BOAT ONE OWE NINE LOST IN ACTION IN BLACKETT STRAIT TWO MILES SW MERESU COVE X CREW OF TWELVE X REQUEST ANY INFORMATION',
        options: { key: 'ROYAL NEW ZEALAND NAVY' },
      },
    },
  ],
  reading: [{ author: 'David Kahn', title: 'The Codebreakers', year: 1967 }],
};
