import type { Dossier } from '../types';

export const dossier: Dossier = {
  headline: {
    en: 'The machine that never wrote a letter as itself',
    fa: 'ماشینی که هیچ حرفی را خودش نمی‌نوشت',
  },
  dek: {
    en: 'A rotor machine the size of a typewriter offered some 159 million million million daily settings — and one fatal symmetry.',
    fa: 'ماشینی روتوردار به اندازهٔ یک ماشین تحریر، حدود ۱۵۹ میلیون میلیون میلیون تنظیمِ روزانه داشت؛ و یک تقارنِ مرگبار.',
  },
  body: {
    en: [
      'Arthur Scherbius patented his rotor cipher machine in 1918 and sold it commercially from 1923; the German navy adopted it in 1926 and the army in 1928, and the Enigma I became the standard machine of the Wehrmacht. Each key press sent current through a plugboard, three wired rotors and a reflector, then back through the rotors to light a lamp. The right-hand rotor stepped with every key, so the substitution changed with every letter.',
      'The reflector made the machine its own inverse — the same settings encrypted and decrypted — but it also meant that no letter could ever become itself. Polish mathematicians led by Marian Rejewski reconstructed the rotor wiring at the end of 1932 and read Enigma traffic for years before the war; in July 1939 they handed their methods and replica machines to the French and the British. At Bletchley Park, Alan Turing and Gordon Welchman designed the electromechanical bombes that searched for each day’s settings, using probable words — *cribs* — and the fact that a letter never encrypts to itself.',
      'The settings were distributed on printed key sheets, one line per day: rotor order, ring settings and plugboard pairs. The Luftwaffe sheet in Fig. 3 orders its holder, at the top, to destroy it “thoroughly and early” in case of danger.',
    ],
    fa: [
      'آرتور شربیوس ماشینِ رمزِ روتوردارش را در ۱۹۱۸ ثبت کرد و از ۱۹۲۳ آن را به بازار عرضه کرد؛ نیروی دریایی آلمان در ۱۹۲۶ و ارتش در ۱۹۲۸ آن را پذیرفتند و انیگما I ماشینِ استانداردِ ورماخت شد. هر فشار کلید جریان را از تخته‌دوشاخه، سه روتورِ سیم‌کشی‌شده و یک بازتابنده می‌گذراند و سپس از راه روتورها بازمی‌گرداند تا لامپی روشن شود. روتورِ سمت راست با هر کلید یک گام می‌چرخید، پس جانشینی با هر حرف تغییر می‌کرد.',
      'بازتابنده ماشین را وارونِ خودش می‌کرد، یعنی همان تنظیمات هم رمز می‌کرد و هم رمز می‌گشود؛ اما معنایش این هم بود که هیچ حرفی هرگز به خودش بدل نمی‌شد. ریاضی‌دانان لهستانی به رهبری ماریان ریەفسکی در پایان ۱۹۳۲ سیم‌کشیِ روتورها را بازسازی کردند و سال‌ها پیش از جنگ پیام‌های انیگما را خواندند؛ در ژوئیهٔ ۱۹۳۹ روش‌ها و ماشین‌های بدلی‌شان را به فرانسوی‌ها و بریتانیایی‌ها سپردند. در بلچلی پارک، آلن تورینگ و گوردون ولچمن «بمب»های الکترومکانیکی را طراحی کردند که تنظیمات هر روز را با کمک واژه‌های محتمل، یا *کریب*ها، و این واقعیت که هیچ حرفی به خودش رمز نمی‌شود، جست‌وجو می‌کردند.',
      'تنظیمات روی برگه‌های کلیدِ چاپی پخش می‌شد، هر روز یک سطر: ترتیب روتورها، تنظیم حلقه‌ها و جفت‌های تخته‌دوشاخه. برگهٔ نیروی هوایی در تصویر ۳ در بالای صفحه به دارنده‌اش فرمان می‌دهد که در صورت خطر آن را «کامل و به‌موقع» نابود کند.',
    ],
  },
  figures: [
    {
      image: 'enigma-machine',
      caption: {
        en: 'An Enigma machine at the Imperial War Museum, London, with its rotors, lampboard, keyboard and plugboard labelled.',
        fa: 'ماشین انیگما در موزهٔ جنگ امپراتوری لندن، با برچسبِ روتورها، صفحهٔ لامپ‌ها، صفحه‌کلید و تخته‌دوشاخه.',
      },
    },
    {
      image: 'enigma-rotors',
      caption: {
        en: 'Two rotors on their spindle: the toothed ratchet that steps a rotor, and the brass contacts that connect it to its neighbour.',
        fa: 'دو روتور بر محورشان: چرخ‌دندهٔ ضامن‌دار که روتور را یک گام می‌چرخاند و اتصال‌های برنجی که آن را به روتورِ کناری وصل می‌کنند.',
      },
    },
    {
      image: 'enigma-keylist',
      caption: {
        en: 'A Luftwaffe key sheet (Maschinen-Schlüssel No. 649). One line per day — rotor order (Walzenlage), ring settings (Ringstellung), plugboard pairs — running from the 31st down to the 1st, so each day’s line could be cut off and destroyed once used.',
        fa: 'برگهٔ کلید نیروی هوایی آلمان (شمارهٔ ۶۴۹). برای هر روز یک سطر — ترتیب روتورها، تنظیم حلقه‌ها و جفت‌های تخته‌دوشاخه — از روزِ ۳۱ تا روزِ ۱ به ترتیب نزولی، تا سطرِ هر روز پس از مصرف بریده و نابود شود.',
      },
    },
  ],
  dispatches: [
    {
      date: { en: '1930', fa: '۱۹۳۰' },
      title: { en: 'The manual’s worked example', fa: 'نمونهٔ حل‌شدهٔ دستورالعمل' },
      body: {
        en: 'A German army instruction manual of 1930 demonstrated the procedure with this message. Settings: reflector A, rotors II I III, rings 24 13 22 (X M V), plugboard AM FI NV PS TU WZ, message key ABL. It reads “Feindliche Infanteriekolonne beobachtet. Anfang Südausgang Bärwalde. Ende 3 km ostwärts Neustadt” — an enemy infantry column observed from the southern exit of Bärwalde to 3 km east of Neustadt. Note Q for CH and X for the full stop.',
        fa: 'یک دستورالعملِ ارتش آلمان در ۱۹۳۰ روش کار را با همین پیام نشان می‌داد. تنظیمات: بازتابندهٔ A، روتورهای II I III، حلقه‌ها ۲۴ ۱۳ ۲۲ (X M V)، تخته‌دوشاخه AM FI NV PS TU WZ و کلید پیام ABL. متن چنین است: «ستونِ پیادهٔ دشمن دیده شد؛ از خروجیِ جنوبیِ بِروالده تا ۳ کیلومتریِ شرقِ نویشتات». به Q به‌جای CH و X به‌جای نقطه دقت کنید.',
      },
      quote:
        'GCDSE AHUGW TQGRK VLFGX UCALX VYMIG MMNMF DXTGN VHVRM MEVOU YFZSL RHDRR XFJWC FHUHM UNZEF RDISI KBGPM YVXUZ',
      load: {
        direction: 'decode',
        input:
          'GCDSE AHUGW TQGRK VLFGX UCALX VYMIG MMNMF DXTGN VHVRM MEVOU YFZSL RHDRR XFJWC FHUHM UNZEF RDISI KBGPM YVXUZ',
        options: {
          reflector: 'A',
          rotor1: 'II',
          rotor2: 'I',
          rotor3: 'III',
          ring1: 'X',
          ring2: 'M',
          ring3: 'V',
          pos1: 'A',
          pos2: 'B',
          pos3: 'L',
          plugboard: 'AM FI NV PS TU WZ',
          format: 'groups',
        },
      },
    },
    {
      date: { en: '1940–45', fa: '۱۹۴۰–۱۹۴۵' },
      title: { en: 'Never itself', fa: 'هرگز خودش' },
      body: {
        en: 'Type a long run of a single letter: every letter of the alphabet turns up in the output except the one you typed. Bletchley used this to rule out positions for a crib.',
        fa: 'رشته‌ای بلند از یک حرف تایپ کنید: همهٔ حروف الفبا در خروجی پیدا می‌شوند جز همان که تایپ کرده‌اید. بلچلی از همین برای کنار گذاشتنِ جایگاه‌های نادرستِ یک کریب استفاده می‌کرد.',
      },
      illustrative: true,
      load: { direction: 'encode', input: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    },
  ],
  reading: [
    { author: 'Simon Singh', title: 'The Code Book', year: 1999 },
    { author: 'Hugh Sebag-Montefiore', title: 'Enigma: The Battle for the Code', year: 2000 },
  ],
};
