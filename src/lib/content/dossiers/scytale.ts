import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: { en: 'A message wound on a staff', fa: 'پیامی پیچیده بر چوبدستی' },
  dek: {
    en: 'Sparta’s magistrates kept one staff at home and gave its twin to their commanders. A strip wound around the first could be read only on the second.',
    fa: 'فرمانروایان اسپارت یک چوبدستی را نزد خود نگه می‌داشتند و همتای آن را به فرماندهانشان می‌دادند. نواری که دور یکی پیچیده می‌شد، تنها روی دیگری خوانده می‌شد.',
  },
  body: {
    en: [
      'The fullest description comes from Plutarch’s *Life of Lysander*, written around 100 CE. When the ephors sent a commander abroad they made two round staffs of exactly the same length and thickness, kept one and gave him the other. To send an order they wound a long, narrow strip of parchment around their staff, edge to edge with no gaps, wrote along it, then unwound it and sent the strip alone. Off the staff the letters were a jumble; wound on its twin, the message reappeared.',
      'Plutarch tells the story in connection with Lysander’s recall to Sparta at the end of the Peloponnesian War. Older Greek writers mention the *skytalē* too, and some modern historians, notably Thomas Kelly, argue that it may have served to authenticate a message as much as to hide it. Either way it is the oldest transposition device on record: it changes the order of the letters, never the letters themselves.',
      'In Eleet the key is the number of letters that fit in one turn of the strip — the thickness of the staff. The rod above the workbench shows the grid written along it and the strip as the messenger carried it.',
    ],
    fa: [
      'کامل‌ترین شرح را پلوتارک در *زندگی لوساندر* آورده است که حدود سال ۱۰۰ میلادی نوشته شد. هنگامی که اِفورها فرماندهی را به سفر می‌فرستادند، دو چوبدستیِ گردِ هم‌اندازه و هم‌قطر می‌ساختند؛ یکی را نگه می‌داشتند و دیگری را به او می‌سپردند. برای فرستادن فرمان، نواری بلند و باریک از پوست را لبه به لبه و بی‌فاصله دور چوبدستیِ خود می‌پیچیدند، پیام را در طول آن می‌نوشتند، سپس نوار را باز می‌کردند و تنها آن را می‌فرستادند. بیرون از چوبدستی حروف درهم بودند؛ پیچیده بر همتای آن، پیام دوباره پدیدار می‌شد.',
      'پلوتارک این داستان را در پیوند با فراخواندنِ لوساندر به اسپارت در پایان جنگ پلوپونزی روایت می‌کند. نویسندگان یونانیِ کهن‌تر نیز از *اسکیتاله* نام برده‌اند و برخی تاریخ‌نگاران امروزی، به‌ویژه توماس کلی، بر این باورند که شاید بیش از پنهان کردنِ پیام، برای اثبات اصالت آن به کار می‌رفت. در هر حال، این کهن‌ترین ابزار رمزِ جابه‌جایی است که می‌شناسیم: ترتیب حروف را عوض می‌کند و هرگز خودِ حروف را.',
      'در Eleet کلید، شمار حروفی است که در یک دورِ نوار جا می‌گیرد؛ یعنی ضخامت چوبدستی. چوبدستیِ بالای میز کار، جدولِ نوشته‌شده در طول آن و نوار را، آن‌گونه که پیک می‌برد، نشان می‌دهد.',
    ],
  },
  figures: [
    {
      diagram: 'scytale',
      caption: {
        en: 'A strip wound edge to edge around a staff. Read along the staff, the letters form the message; unwound, they travel in a different order.',
        fa: 'نواری که لبه به لبه دور چوبدستی پیچیده شده است. در طول چوبدستی حروف پیام را می‌سازند؛ باز شده، با ترتیبی دیگر سفر می‌کنند.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: 'c. 404 BCE', fa: 'حدود ۴۰۴ پ.م.' },
      title: { en: 'The ephors recall Lysander', fa: 'اِفورها لوساندر را فرامی‌خوانند' },
      body: {
        en: 'Plutarch does not preserve the words of the recall. This stand-in is wound on a staff four letters round.',
        fa: 'پلوتارک متنِ فرمانِ بازگشت را نیاورده است. این متنِ جایگزین روی چوبدستی‌ای با چهار حرف در هر دور پیچیده شده است.',
      },
      illustrative: true,
      load: { direction: 'encode', input: 'RETURN TO SPARTA AT ONCE', options: { diameter: 4 } },
    },
    {
      date: { en: 'Textbook', fa: 'نمونهٔ درسی' },
      title: { en: '“I am hurt very badly, help”', fa: '«به‌سختی زخمی شده‌ام، کمک»' },
      body: {
        en: 'The classic classroom demonstration, four letters to a turn. Decode it to unwind the strip.',
        fa: 'نمونهٔ کلاسیکِ کلاس درس، با چهار حرف در هر دور. رمزگشایی کنید تا نوار باز شود.',
      },
      illustrative: true,
      load: { direction: 'decode', input: 'Iryyatbhmvaehedlurlp', options: { diameter: 4 } },
    },
  ],
  reading: [
    { author: 'Plutarch', title: 'Life of Lysander', year: 100 },
    { author: 'Thomas Kelly', title: 'The Myth of the Skytale (Cryptologia)', year: 1998 },
  ],
};
