import type { Dossier } from '../types';

const POSTSCRIPT =
  'I would be glad to know the names and qualities of the six gentlemen which are to accomplish the designment; for it may be that I shall be able, upon knowledge of the parties, to give you some further advice necessary to be followed therein.';

export const dossier: Dossier = {
  headline: { en: 'The scholar who counted letters', fa: 'دانشمندی که حروف را شمرد' },
  dek: {
    en: 'In ninth-century Baghdad, al-Kindi wrote down the method that would break every simple substitution cipher for the next thousand years.',
    fa: 'الکندی در بغدادِ سدهٔ نهم میلادی روشی را نوشت که تا هزار سال پس از آن هر رمزِ جانشینیِ ساده‌ای را می‌شکست.',
  },
  body: {
    en: [
      'Abu Yusuf Yaʿqub ibn Ishaq al-Kindi, the “philosopher of the Arabs”, worked in Baghdad in the age of the House of Wisdom and wrote on everything from optics to music. One of his treatises, *Risāla fī istikhrāj al-muʿammā* — “On extracting obscured correspondence” — was rediscovered in an Istanbul library in 1987. It contains the oldest known description of frequency analysis.',
      'His method is the one this tool performs. Take a long enough sample of the language and count how often each letter occurs; then count the symbols of the cipher text and match the most frequent symbol to the most frequent letter, the next to the next, until words begin to appear. A substitution cipher changes the letters’ shapes, but it cannot change how often they occur.',
      'Europe learned the lesson slowly and at great cost. In 1586 Thomas Phelippes, decipherer to Elizabeth I’s spymaster Francis Walsingham, broke the cipher in which Mary, Queen of Scots was corresponding with Anthony Babington about a plot to assassinate the queen — and then forged a postscript in the same cipher asking for the conspirators’ names. The letters sent Mary to the block in February 1587.',
    ],
    fa: [
      'ابویوسف یعقوب بن اسحاق الکندی، «فیلسوفِ عرب»، در روزگارِ بیت‌الحکمه در بغداد می‌زیست و از نورشناسی تا موسیقی دربارهٔ همه‌چیز نوشت. یکی از رساله‌هایش، *رسالة فی استخراج المعمّی* — «دربارهٔ بیرون کشیدنِ نامه‌های پوشیده» — در ۱۹۸۷ در کتابخانه‌ای در استانبول بازیافته شد. این رساله کهن‌ترین شرحِ شناخته‌شده از تحلیلِ بسامد را در بر دارد.',
      'روش او همانی است که این ابزار انجام می‌دهد. نمونه‌ای به اندازهٔ کافی بلند از زبان برگیرید و بشمارید هر حرف چند بار آمده است؛ سپس نمادهای متنِ رمز را بشمارید و پرتکرارترین نماد را با پرتکرارترین حرف جفت کنید، دومی را با دومی، تا واژه‌ها پدیدار شوند. رمزِ جانشینی شکلِ حروف را عوض می‌کند، اما نمی‌تواند تعدادِ تکرارشان را عوض کند.',
      'اروپا این درس را آهسته و به بهایی گزاف آموخت. در ۱۵۸۶ توماس فلیپس، رمزگشای فرانسیس والسینگام، رئیس جاسوسانِ الیزابت یکم، رمزی را شکست که مری، ملکهٔ اسکاتلند، با آن دربارهٔ توطئهٔ ترورِ ملکه با آنتونی بابینگتون نامه‌نگاری می‌کرد؛ و سپس با همان رمز پی‌نوشتی جعل کرد که نامِ توطئه‌گران را می‌پرسید. این نامه‌ها مری را در فوریهٔ ۱۵۸۷ به پای چوبهٔ اعدام بردند.',
    ],
  },
  figures: [
    {
      image: 'alkindi',
      caption: {
        en: 'A page of al-Kindi’s treatise on cryptanalysis, in the manuscript preserved at the Süleymaniye Library, Istanbul.',
        fa: 'صفحه‌ای از رسالهٔ الکندی در رمزشکنی، در نسخهٔ خطیِ محفوظ در کتابخانهٔ سلیمانیهٔ استانبول.',
      },
    },
    {
      image: 'babington',
      caption: {
        en: 'Above, the postscript Phelippes forged in Mary’s cipher; below, Babington’s record of the cipher key, signed by him. 1586.',
        fa: 'بالا، پی‌نوشتی که فلیپس با رمزِ مری جعل کرد؛ پایین، یادداشتِ بابینگتون از کلیدِ رمز با امضای خودش. ۱۵۸۶.',
      },
    },
    {
      image: 'mary-stuart',
      caption: {
        en: 'Mary, Queen of Scots, after François Clouet, c. 1559.',
        fa: 'مری، ملکهٔ اسکاتلند، برگرفته از فرانسوا کلوئه، حدود ۱۵۵۹.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: 'July 1586', fa: 'ژوئیهٔ ۱۵۸۶' },
      title: { en: 'The forged postscript', fa: 'پی‌نوشتِ جعلی' },
      body: {
        en: 'Phelippes asked, in Mary’s own cipher, for the names of the six gentlemen who were to kill the queen. Load its plain English here: its letter counts are the fingerprint every decipherer matches.',
        fa: 'فلیپس با رمزِ خودِ مری نامِ شش نجیب‌زاده‌ای را پرسید که قرار بود ملکه را بکشند. متنِ انگلیسیِ آن را اینجا بارگذاری کنید: شمارشِ حروفش همان اثرانگشتی است که هر رمزگشایی با آن تطبیق می‌دهد.',
      },
      quote: POSTSCRIPT,
      load: { direction: 'encode', input: POSTSCRIPT },
    },
    {
      date: { en: '1843', fa: '۱۸۴۳' },
      title: { en: 'The Gold-Bug', fa: 'سوسکِ طلایی' },
      body: {
        en: 'Edgar Allan Poe’s story taught a generation of readers frequency analysis: in its pirate’s cipher the symbol 8 occurs most often, so it must stand for e.',
        fa: 'داستانِ ادگار آلن پو به نسلی از خوانندگان تحلیلِ بسامد را آموخت: در رمزِ دزد دریاییِ آن، نماد 8 از همه پرتکرارتر است، پس باید e باشد.',
      },
    },
  ],
  reading: [
    { author: 'Simon Singh', title: 'The Code Book', year: 1999 },
    { author: 'Edgar Allan Poe', title: 'The Gold-Bug', year: 1843 },
  ],
};
