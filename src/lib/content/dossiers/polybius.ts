import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'Letters made of torches', fa: 'حروفی از مشعل' },
  dek: {
    en: 'A Greek historian’s scheme for signalling with fire became the grid behind prison tap codes and a cipher of the First World War.',
    fa: 'طرحِ یک تاریخ‌نگار یونانی برای علامت‌دادن با آتش، به جدولِ پشتِ کدهای ضربه‌ایِ زندانیان و رمزی از جنگ جهانی اول بدل شد.',
  },
  body: {
    en: [
      'In Book X of his *Histories*, written in the second century BCE, Polybius describes a way to send any message by torchlight, crediting its first form to Cleoxenus and Democleitus. The alphabet is written on five tablets of five letters. The signaller raises torches on the left to show the tablet and on the right to show the letter within it: two small numbers per letter, readable from a distant hilltop.',
      'The same coordinates work for any signal that can be counted. Political prisoners in Tsarist Russia are said to have tapped them on cell walls, and in 1965 Captain Carlyle “Smitty” Harris taught a five-by-five tap code to fellow American prisoners in Hanoi’s Hỏa Lò prison, where for years it carried news, names and morale between cells (they dropped K and used C in its place).',
      'In 1918 the German army combined a keyed Polybius square, its rows and columns labelled A D F G X, with a columnar transposition. The ADFGX cipher, soon extended to ADFGVX, was broken by the French cryptanalyst Georges Painvin during the German spring offensive. Set the coordinates to ADFGX here to see its first stage.',
    ],
    fa: [
      'پولیبیوس در کتاب دهمِ *تاریخ‌ها*، نوشته در سدهٔ دوم پیش از میلاد، روشی برای فرستادنِ هر پیامی با نور مشعل شرح می‌دهد و نخستین شکلِ آن را به کلئوکسنوس و دموکلیتوس نسبت می‌دهد. الفبا روی پنج لوح، هر یک با پنج حرف، نوشته می‌شود. علامت‌دهنده مشعل‌هایی را در سمت چپ بالا می‌برد تا لوح را نشان دهد و در سمت راست تا حرفِ درونِ آن را: برای هر حرف دو عدد کوچک، خوانا از فراز تپه‌ای دوردست.',
      'همین مختصات برای هر علامتِ شمردنی کار می‌کند. گفته می‌شود زندانیان سیاسی در روسیهٔ تزاری آن‌ها را بر دیوار سلول‌ها می‌کوبیدند و در ۱۹۶۵ سروان کارلایل «اسمیتی» هریس یک کدِ ضربه‌ایِ پنج‌در‌پنج را به هم‌بندانِ آمریکایی‌اش در زندانِ هوآ‌لوی هانوی آموخت؛ کدی که سال‌ها خبر، نام و روحیه را میان سلول‌ها جابه‌جا کرد (آن‌ها K را حذف کردند و C را به‌جایش به کار بردند).',
      'در ۱۹۱۸ ارتش آلمان مربعِ کلیددارِ پولیبیوس را، با سطرها و ستون‌هایی با برچسب A D F G X، با یک جابه‌جاییِ ستونی ترکیب کرد. رمزِ ADFGX، که به‌زودی به ADFGVX گسترش یافت، به دستِ رمزشکن فرانسوی ژرژ پنوَن در جریان حملهٔ بهاریِ آلمان شکسته شد. مختصات را در اینجا روی ADFGX بگذارید تا مرحلهٔ نخستِ آن را ببینید.',
    ],
  },
  figures: [
    {
      diagram: 'polybius',
      caption: {
        en: 'The square. Each letter is named by its row and its column, so A is 1-1 and T is 4-4; I and J share a cell.',
        fa: 'مربع. هر حرف با سطر و ستونش نامیده می‌شود؛ پس A می‌شود ۱-۱ و T می‌شود ۴-۴. I و J در یک خانه‌اند.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: 'Hỏa Lò, 1965–73', fa: 'هوآ‌لو، ۱۹۶۵–۱۹۷۳' },
      title: { en: 'GBU', fa: 'GBU' },
      body: {
        en: 'Prisoners signed off their tapped conversations with GBU — “God bless you”: two-two, one-two, four-five.',
        fa: 'زندانیان گفت‌وگوهای ضربه‌ای‌شان را با GBU («خدا نگهدارت») به پایان می‌بردند: دو-دو، یک-دو، چهار-پنج.',
      },
      load: { direction: 'encode', input: 'GBU', options: { labels: 'digits', key: '' } },
    },
    {
      date: { en: '2nd century BCE', fa: 'سدهٔ دوم پ.م.' },
      title: { en: 'Torches on the hill', fa: 'مشعل‌ها بر تپه' },
      body: {
        en: 'Any sentence becomes pairs of small numbers — the count of torches raised on the left, then on the right.',
        fa: 'هر جمله‌ای به جفت‌هایی از اعداد کوچک بدل می‌شود: شمارِ مشعل‌هایی که در چپ و سپس در راست بالا می‌روند.',
      },
      illustrative: true,
      load: {
        direction: 'encode',
        input: 'THE ENEMY IS IN SIGHT',
        options: { labels: 'digits', key: '' },
      },
    },
  ],
  reading: [{ author: 'Polybius', title: 'The Histories, Book X', year: -150 }],
};
