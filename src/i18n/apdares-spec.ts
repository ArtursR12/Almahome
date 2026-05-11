// Apdares page specification data per locale.
// Localised separately from the page-copy JSON dictionaries because the spec
// is large and benefits from typed structure.

import type { Locale } from './utils';

export interface SpecRow {
  name?: string;
  description: string;
  provider?: string;
  notes?: string;
  image?: string;
  imageAlt?: string;
}

export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

const lv: SpecGroup[] = [
  {
    title: 'Sienas',
    rows: [
      { name: 'Pamati un cokols', description: 'Lentveida betona pamati, uz kuriem novietotas no keramzītbetona blokiem būvējamas sienas.', provider: 'Jā' },
      { name: 'Ārējās sienas', description: 'Keramzītbetona bloki 300 mm 1. stāvā un 250 mm 2. un 3. stāvos, siltināti ar akmens vati 150 mm un apmesti ar dekoratīvo apmetumu.', provider: 'Jā' },
      { name: 'Koplietošanas telpu un starpdzīvokļu sienas, starpsienas', description: 'Keramzītbetona bloki 250/200 mm ar apmetumu no abām pusēm.', provider: 'Jā' },
      { name: 'Dzīvokļa starpsienas', description: 'Starpsienas no ģipškartona ar diviem ģipškartona slāņiem no abām pusēm (125 mm) un akmens vates skaņas izolācijas pildījumu 75 mm.', provider: 'Jā' },
      { name: 'Sanitārā mezgla starpsienas', description: 'Starp sanitāro mezglu un citām telpām starpsienas no ģipškartona ar diviem ģipškartona slāņiem (125 mm) un akmens vates skaņas izolācijas pildījumu 75 mm. No sanitārā mezgla puses — mitrumizturīgs ģipškartons.', provider: 'Jā' },
    ],
  },
  {
    title: 'Grīdas',
    rows: [
      { name: 'Pārseguma konstrukcija', description: 'Saliekami dzelzbetona paneļi. 2. un 3. stāvos izolēti ar akmens vates skaņas un siltuma izolācijas plātnēm 50 mm; 1. stāvā betona grīda siltināta ar putupolistirolu 150 mm.', provider: 'Jā' },
      { name: 'Dzīvojamās zonas', description: 'Lamināts 10 mm KronoOriginal ATL10-K405P, 33. klase, ar substrātu („peldošā grīda"). Grīdlīstes — MDF finierētas, mitrumizturīgas, 16×70 mm XSR 164.', provider: 'Jā', image: '/images/finishes/apdares__gridas001.jpg', imageAlt: 'Lamināta paraugs — KronoOriginal' },
    ],
  },
  {
    title: 'Kāpņu telpas',
    rows: [
      { name: 'Koridori un laukumi', description: 'Koridoros un laukumos starp stāviem flīžu segums; saliekamie dzelzbetona kāpņu laidumi ar epoksīdu pārklājumu.', provider: 'Jā' },
    ],
  },
  {
    title: 'Jumts',
    rows: [
      { name: 'Konstrukcija', description: 'Saliekamie dzelzsbetona paneļi, slīpums izveidots ar putupolistirola plāksnēm, trīskārša akmens vates siltumizolācija, virsū ruļļveida jumta membrāna divās kārtās.', provider: 'Jā' },
    ],
  },
  {
    title: 'Griesti',
    rows: [
      { name: 'Dzīvojamās telpas', description: 'Dzelzsbetona pārsegumi, špaktelēti un krāsoti, redzamas savienojuma vietas. Griestu augstums 2,7 m.', provider: 'Jā' },
      { name: 'Sanitārie mezgli un koridori', description: 'Piekaramie ģipškartona griesti. Augstums 2,40 m.', provider: 'Jā' },
    ],
  },
  {
    title: 'Sienu apdare',
    rows: [
      { name: 'Dzīvokļi', description: 'Sienas apmestas un nokrāsotas. Katrā telpā divi toņi: NCS S 0804-G90Y — visas pamatsienas; NCS S 1505-Y50R — akcenta siena.', provider: 'Jā', image: '/images/finishes/apdares__image003.jpg', imageAlt: 'NCS toņu paraugi — pamatsiena un akcenta siena' },
      { name: 'Sanitārie mezgli', description: 'Sienas hidroizolētas, apdare — akmens masas flīzes Italgraniti / Travertini Beige Vein Cut / Terre Bianco, izmērs 30×60 cm.', provider: 'Jā', image: '/images/finishes/apdares__image004.jpg', imageAlt: 'Sienas flīžu paraugs — Travertini Beige Vein Cut' },
    ],
  },
  {
    title: 'Griestu apdare',
    rows: [
      { name: 'Visas telpas', description: 'Nokrāsoti ar ūdens emulsiju. Sanitārajos mezglos — ūdensizturīga emulsijas krāsa. Krāsas tonis — balts.', provider: 'Jā' },
    ],
  },
  {
    title: 'Durvis un logi',
    rows: [
      { name: 'Dzīvokļa ārdurvis', description: 'Koka ugunsizturīgas ārdurvis, skaņas izolācija līdz 38 dBW.', provider: 'Jā' },
      { name: 'Iekšdurvis', description: 'Durvis dzīvokļos starp istabām — šponētas PRODEX Torino PRO bez slēdzenēm. Sanitāro mezglu durvīm paredzēta santehniskā slēdzene. Rokturis L.AL43A110-MSN (PRODEX).', provider: 'Jā', image: '/images/finishes/apdares__durvi.jpg', imageAlt: 'Iekšdurvju paraugs — PRODEX Torino PRO' },
      { name: 'Logi un balkona durvis', description: 'Tumši pelēkas / baltas krāsas PVH rāmji (REHAU). 7 kameru rāmja profili, 6 kameru vērtnes profili. Trīskārša (2 kameru) stikla pakete, Ug = 0.5 W/m²K. Iekļautas palodzes.', provider: 'Jā', image: '/images/finishes/apdares__durvi2.jpg', imageAlt: 'REHAU PVH loga profila šķērsgriezums' },
    ],
  },
  {
    title: 'Ārdurvis (kāpņu telpa)',
    rows: [
      { name: 'Ieejas durvis', description: 'Alumīnija profils ar koda slēdzeni, savienots ar domofona iekārtu.', provider: 'Jā' },
    ],
  },
  {
    title: 'Balkoni un terases',
    rows: [
      { name: 'Balkoni', description: 'Balkonu grīdu konstrukcija — betons. Cinkotas un rūpnieciski krāsotas metāla margas ar krāsotām perforēta metāla plāksnēm no ārpuses.', provider: 'Jā' },
      { name: 'Terases', description: '1. stāva dzīvokļiem — ārējās terases ar bruģakmens segumu. Pieeja no dzīvojamās istabas.', provider: 'Jā' },
    ],
  },
  {
    title: 'Ūdensapgāde un kanalizācija',
    rows: [
      { name: 'Vispārīgi', description: 'Ūdensapgāde un kanalizācija paredzētas sanitārajos mezglos un virtuves zonā. Paredzēti pieslēgumi veļas mašīnām.', provider: 'Jā' },
      { name: 'Virtuve', description: 'Virtuves zonā ir pieslēgumi ūdensvadam un kanalizācijai.', provider: 'Jā' },
      { name: 'Skaitītāji', description: 'Aukstā un karstā ūdens skaitītāji atrodas koplietošanas koridorī.', provider: 'Jā' },
      { name: 'Izlietne', description: 'CONNECT AIR CUBE 600×460 mm, white. Maisītājs CERAFINE ar pop-up, chrome. Sifons DESIGN izlietnei, chrome / Ideal Standard.', provider: 'Jā', image: '/images/finishes/apdares__santeh1.jpg', imageAlt: 'Izlietne, maisītājs un sifons — Ideal Standard' },
      { name: 'WC', description: 'Iebūvējamais WC rāmis PROSYS ar skalošanas kasti un stiprinājumiem. Poga OLEAS M1, black matt. Pods TESI AQUABLADE, piekarams, white. Vāks TESI ar softclose, white / Ideal Standard.', provider: 'Jā', image: '/images/finishes/apdares__santeh2.jpg', imageAlt: 'WC rāmis PROSYS, pods TESI AQUABLADE un poga OLEAS M1' },
      { name: 'Dušas kabīne', description: 'Akmensmasas dušas paliktnis PAA 900×900, sifons paliktnim. Dušas kabīne CONNECT2 900×900×H1950 mm, R550, bīdāmās durvis. Dušas sistēma CERATHERM T25+ ar termostatu, rokas dušu un augšējo dušu D260 mm, chrome / Ideal Standard.', provider: 'Jā', image: '/images/finishes/apdares__santeh3.jpg', imageAlt: 'Dušas paliktnis, sistēma CERATHERM un sifons' },
    ],
  },
  {
    title: 'Apkure',
    rows: [
      { name: 'Sistēma', description: 'Apkuri nodrošina centralizēta siltuma padeves sistēma no mājas siltummezgla ar uzstādītiem gāzes apkures katliem.', provider: 'Jā' },
      { name: 'Radiatori', description: 'Dzīvokļos paredzēti termoregulējami sienu radiatori PURMO FCV (gludie).', provider: 'Jā' },
      { name: 'Siltās grīdas', description: 'Sanitārajos mezglos — regulējamas apsildāmas grīdas.', provider: 'Jā' },
      { name: 'Skaitītāji', description: 'Katram dzīvoklim individuāls apkures skaitītājs koplietošanas koridorī, skaitītāju skapītī.', provider: 'Jā' },
    ],
  },
  {
    title: 'Ventilācija',
    rows: [
      { name: 'Sanitārie mezgli un virtuve', description: 'Sanitārajos mezglos — izslēdzamie ventilatori ar taimeriem. Virtuves zonā — dabiskā ventilācija.', provider: 'Jā' },
      { name: 'Stāvvadi', description: 'Katram dzīvoklim individuālie ventilācijas stāvvadi.', provider: 'Jā' },
      { name: 'Rekuperācija', description: 'Sienas rekuperatori katrā dzīvoklī.', provider: 'Jā' },
    ],
  },
  {
    title: 'Elektroapgāde',
    rows: [
      { name: 'Pieslēgums', description: 'Katram dzīvoklim paredzēts 3 fāžu pieslēgums, 20 A.', provider: 'Jā' },
    ],
  },
  {
    title: 'Dzīvokļa elektroapgāde un apgaismojums',
    rows: [
      { name: 'Skaitītāji', description: 'Katram dzīvoklim individuāls elektrības skaitītājs koplietošanas koridorī, skaitītāju skapītī.', provider: 'Jā' },
      { name: 'Sadales skapis', description: 'Elektrības padeve dzīvokļos notiek caur sadales skapi.', provider: 'Jā' },
      { name: 'Zemstrāvas tīkls', description: 'Zemās strāvas tīkla sadales skapis.', provider: 'Jā' },
      { name: 'Kontaktligzdas', description: 'Elektriskie kontakti katrā dzīvoklī saskaņā ar projektu / EPAFEL.', provider: 'Jā', image: '/images/finishes/apdares__rozet1.jpg', imageAlt: 'Kontaktligzda — EPAFEL' },
      { name: 'Slēdži', description: 'Elektriskie slēdži katrā dzīvoklī saskaņā ar projektu / EPAFEL.', provider: 'Jā', image: '/images/finishes/apdares__rozet2.jpg', imageAlt: 'Slēdzis — EPAFEL' },
      { name: 'Pieslēgumi', description: 'Pieslēgumi elektriskai plītij un apgaismojuma lampām katrā dzīvoklī saskaņā ar projektu.', provider: 'Jā' },
      { name: 'Dvieļu žāvētājs', description: 'Elektriskais kontakts dvieļu žāvētājam.', provider: 'Jā' },
      { name: 'Veļas mašīna', description: 'Elektriskais kontakts veļas mašīnai.', provider: 'Jā' },
      { name: 'TV un internets', description: 'TV un interneta tīklu pieslēgumi katrā dzīvoklī saskaņā ar projektu. Operators SIA Balticom (pircējs slēdz pieslēguma līgumu atsevišķi).', provider: 'Jā', notes: 'Līgums atsevišķi' },
      { name: 'Piekļuves sistēma', description: 'Uz ieejas durvīm kāpņu telpā un izejas vārtiem — kodu un čipu sistēma.', provider: 'Jā' },
      { name: 'Domofons un drošība', description: 'Domofona iekārta. Ugunsgrēka detektors — 1 gab.', provider: 'Jā' },
    ],
  },
  {
    title: 'Virtuves mēbeles un aprīkojums',
    rows: [
      { name: 'Materiāli un toņi', description: 'Augšējie skapīši — H3433 ST22, 18 mm, Polar Aland Pine (EGGER). Apakšējie skapīši — U211 ST9, 18 mm, Almond Beige (EGGER). Darba virsma — Basaltino Terra F352 ST76 (EGGER).', provider: 'Jā', image: '/images/finishes/apdares__kuhnja_0002.jpg', imageAlt: 'EGGER materiālu paraugi virtuvei' },
      { name: 'Vizualizācija', description: 'Tipiska virtuves komplektācija ar iebūvēto tehniku, akmens darba virsmu un noslēptiem rokturiem.', provider: 'Jā', image: '/images/finishes/apdares__kuhnja_003333i.jpg', imageAlt: 'Virtuves vizualizācija' },
    ],
  },
];

const ru: SpecGroup[] = [
  {
    title: 'Стены',
    rows: [
      { name: 'Фундамент и цоколь', description: 'Ленточный бетонный фундамент, на котором возводятся стены из керамзитобетонных блоков.', provider: 'Да' },
      { name: 'Наружные стены', description: 'Керамзитобетонные блоки 300 мм на 1 этаже и 250 мм на 2 и 3 этажах, утеплены каменной ватой 150 мм и оштукатурены декоративной штукатуркой.', provider: 'Да' },
      { name: 'Стены общих помещений и межквартирные', description: 'Керамзитобетонные блоки 250/200 мм с штукатуркой с обеих сторон.', provider: 'Да' },
      { name: 'Перегородки в квартире', description: 'Перегородки из гипсокартона: по два слоя гипсокартона с обеих сторон (125 мм) и звукоизоляция из каменной ваты 75 мм.', provider: 'Да' },
      { name: 'Перегородки санузла', description: 'Между санузлом и другими помещениями — перегородки из гипсокартона: два слоя гипсокартона с обеих сторон (125 мм) и звукоизоляция из каменной ваты 75 мм. Со стороны санузла — влагостойкий гипсокартон.', provider: 'Да' },
    ],
  },
  {
    title: 'Полы',
    rows: [
      { name: 'Конструкция перекрытия', description: 'Сборные железобетонные панели. На 2 и 3 этажах — звуко- и теплоизоляция из каменной ваты 50 мм; на 1 этаже бетонный пол утеплён пенополистиролом 150 мм.', provider: 'Да' },
      { name: 'Жилые зоны', description: 'Ламинат 10 мм KronoOriginal ATL10-K405P, 33 класс, с подложкой («плавающий пол»). Плинтус — МДФ шпонированный, влагостойкий, 16×70 мм XSR 164.', provider: 'Да', image: '/images/finishes/apdares__gridas001.jpg', imageAlt: 'Образец ламината — KronoOriginal' },
    ],
  },
  {
    title: 'Лестничные клетки',
    rows: [
      { name: 'Коридоры и площадки', description: 'В коридорах и на межэтажных площадках — плитка; сборные железобетонные лестничные марши с эпоксидным покрытием.', provider: 'Да' },
    ],
  },
  {
    title: 'Кровля',
    rows: [
      { name: 'Конструкция', description: 'Сборные железобетонные панели, уклон создан плитами пенополистирола, трёхслойная теплоизоляция из каменной ваты, сверху — рулонная мембрана в два слоя.', provider: 'Да' },
    ],
  },
  {
    title: 'Потолки',
    rows: [
      { name: 'Жилые помещения', description: 'Железобетонные перекрытия, шпатлёванные и окрашенные, видны стыки. Высота потолка 2,7 м.', provider: 'Да' },
      { name: 'Санузлы и коридоры', description: 'Подвесные потолки из гипсокартона. Высота 2,40 м.', provider: 'Да' },
    ],
  },
  {
    title: 'Отделка стен',
    rows: [
      { name: 'Квартиры', description: 'Стены оштукатурены и окрашены. В каждом помещении — два тона: NCS S 0804-G90Y — все основные стены; NCS S 1505-Y50R — акцентная стена.', provider: 'Да', image: '/images/finishes/apdares__image003.jpg', imageAlt: 'Образцы тонов NCS — основная и акцентная стены' },
      { name: 'Санузлы', description: 'Стены гидроизолированы, отделка — керамогранит Italgraniti / Travertini Beige Vein Cut / Terre Bianco, размер 30×60 см.', provider: 'Да', image: '/images/finishes/apdares__image004.jpg', imageAlt: 'Образец настенной плитки — Travertini Beige Vein Cut' },
    ],
  },
  {
    title: 'Отделка потолков',
    rows: [
      { name: 'Все помещения', description: 'Окрашены водоэмульсионной краской. В санузлах — влагостойкая эмульсионная краска. Цвет — белый.', provider: 'Да' },
    ],
  },
  {
    title: 'Двери и окна',
    rows: [
      { name: 'Входная дверь квартиры', description: 'Деревянная огнестойкая входная дверь, звукоизоляция до 38 дБВ.', provider: 'Да' },
      { name: 'Внутренние двери', description: 'Двери между комнатами — шпонированные PRODEX Torino PRO без замков. Для дверей санузла предусмотрен сантехнический замок. Ручка L.AL43A110-MSN (PRODEX).', provider: 'Да', image: '/images/finishes/apdares__durvi.jpg', imageAlt: 'Образец межкомнатной двери — PRODEX Torino PRO' },
      { name: 'Окна и балконные двери', description: 'Тёмно-серые / белые ПВХ профили (REHAU). Профиль рамы — 7 камер, профиль створки — 6 камер. Тройной (2-камерный) стеклопакет, Ug = 0.5 Вт/м²К. Подоконники включены.', provider: 'Да', image: '/images/finishes/apdares__durvi2.jpg', imageAlt: 'Сечение профиля окна REHAU PVH' },
    ],
  },
  {
    title: 'Входная дверь (подъезд)',
    rows: [
      { name: 'Входная дверь', description: 'Алюминиевый профиль с кодовым замком, подключённый к домофонной системе.', provider: 'Да' },
    ],
  },
  {
    title: 'Балконы и террасы',
    rows: [
      { name: 'Балконы', description: 'Конструкция пола балкона — бетон. Оцинкованные и заводски окрашенные металлические перила с окрашенными перфорированными металлическими панелями снаружи.', provider: 'Да' },
      { name: 'Террасы', description: 'Для квартир 1 этажа — наружные террасы с покрытием из брусчатки. Выход из жилой комнаты.', provider: 'Да' },
    ],
  },
  {
    title: 'Водоснабжение и канализация',
    rows: [
      { name: 'Общее', description: 'Водоснабжение и канализация подведены в санузлы и кухонную зону. Предусмотрены подключения для стиральных машин.', provider: 'Да' },
      { name: 'Кухня', description: 'В кухонной зоне — подключения к водопроводу и канализации.', provider: 'Да' },
      { name: 'Счётчики', description: 'Счётчики холодной и горячей воды — в общем коридоре.', provider: 'Да' },
      { name: 'Раковина', description: 'CONNECT AIR CUBE 600×460 мм, белая. Смеситель CERAFINE с pop-up, chrome. Сифон DESIGN для раковины, chrome / Ideal Standard.', provider: 'Да', image: '/images/finishes/apdares__santeh1.jpg', imageAlt: 'Раковина, смеситель и сифон — Ideal Standard' },
      { name: 'Унитаз', description: 'Встроенная инсталляция WC PROSYS со сливным бачком и креплениями. Кнопка OLEAS M1, black matt. Унитаз TESI AQUABLADE, подвесной, белый. Сиденье TESI с softclose, белое / Ideal Standard.', provider: 'Да', image: '/images/finishes/apdares__santeh2.jpg', imageAlt: 'Инсталляция WC PROSYS, унитаз TESI AQUABLADE и кнопка OLEAS M1' },
      { name: 'Душевая кабина', description: 'Поддон из искусственного камня PAA 900×900, сифон. Душевая кабина CONNECT2 900×900×H1950 мм, R550, раздвижные двери. Душевая система CERATHERM T25+ с термостатом, ручной лейкой и верхним душем D260 мм, chrome / Ideal Standard.', provider: 'Да', image: '/images/finishes/apdares__santeh3.jpg', imageAlt: 'Поддон, система CERATHERM и сифон' },
    ],
  },
  {
    title: 'Отопление',
    rows: [
      { name: 'Система', description: 'Отопление обеспечивается централизованной системой подачи тепла от дома с установленными газовыми котлами.', provider: 'Да' },
      { name: 'Радиаторы', description: 'В квартирах — терморегулируемые настенные радиаторы PURMO FCV (гладкие).', provider: 'Да' },
      { name: 'Тёплые полы', description: 'В санузлах — регулируемые тёплые полы.', provider: 'Да' },
      { name: 'Счётчики', description: 'У каждой квартиры индивидуальный счётчик отопления — в общем коридоре, в шкафу счётчиков.', provider: 'Да' },
    ],
  },
  {
    title: 'Вентиляция',
    rows: [
      { name: 'Санузлы и кухня', description: 'В санузлах — отключаемые вентиляторы с таймерами. В кухонной зоне — естественная вентиляция.', provider: 'Да' },
      { name: 'Стояки', description: 'Каждой квартире — индивидуальные вентиляционные стояки.', provider: 'Да' },
      { name: 'Рекуперация', description: 'Настенные рекуператоры в каждой квартире.', provider: 'Да' },
    ],
  },
  {
    title: 'Электроснабжение',
    rows: [
      { name: 'Подключение', description: 'Каждой квартире — 3-фазное подключение, 20 A.', provider: 'Да' },
    ],
  },
  {
    title: 'Электроснабжение и освещение квартиры',
    rows: [
      { name: 'Счётчики', description: 'У каждой квартиры — индивидуальный счётчик электроэнергии в общем коридоре, в шкафу счётчиков.', provider: 'Да' },
      { name: 'Распределительный шкаф', description: 'Подача электроэнергии в квартиры — через распределительный шкаф.', provider: 'Да' },
      { name: 'Слаботочная сеть', description: 'Распределительный шкаф слаботочной сети.', provider: 'Да' },
      { name: 'Розетки', description: 'Электрические розетки в каждой квартире — по проекту / EPAFEL.', provider: 'Да', image: '/images/finishes/apdares__rozet1.jpg', imageAlt: 'Розетка — EPAFEL' },
      { name: 'Выключатели', description: 'Электрические выключатели в каждой квартире — по проекту / EPAFEL.', provider: 'Да', image: '/images/finishes/apdares__rozet2.jpg', imageAlt: 'Выключатель — EPAFEL' },
      { name: 'Подключения', description: 'Подключения для электроплиты и осветительных приборов в каждой квартире — по проекту.', provider: 'Да' },
      { name: 'Полотенцесушитель', description: 'Электрическое подключение для полотенцесушителя.', provider: 'Да' },
      { name: 'Стиральная машина', description: 'Электрическое подключение для стиральной машины.', provider: 'Да' },
      { name: 'ТВ и интернет', description: 'Подключения ТВ и интернета в каждой квартире — по проекту. Оператор SIA Balticom (договор подключения покупатель заключает отдельно).', provider: 'Да', notes: 'Договор отдельно' },
      { name: 'Система доступа', description: 'На входной двери подъезда и въездных воротах — система кодов и чипов.', provider: 'Да' },
      { name: 'Домофон и безопасность', description: 'Домофонная система. Пожарный извещатель — 1 шт.', provider: 'Да' },
    ],
  },
  {
    title: 'Кухонная мебель и оборудование',
    rows: [
      { name: 'Материалы и тона', description: 'Верхние шкафы — H3433 ST22, 18 мм, Polar Aland Pine (EGGER). Нижние шкафы — U211 ST9, 18 мм, Almond Beige (EGGER). Столешница — Basaltino Terra F352 ST76 (EGGER).', provider: 'Да', image: '/images/finishes/apdares__kuhnja_0002.jpg', imageAlt: 'Образцы материалов EGGER для кухни' },
      { name: 'Визуализация', description: 'Типичная комплектация кухни со встроенной техникой, каменной столешницей и скрытыми ручками.', provider: 'Да', image: '/images/finishes/apdares__kuhnja_003333i.jpg', imageAlt: 'Визуализация кухни' },
    ],
  },
];

const en: SpecGroup[] = [
  {
    title: 'Walls',
    rows: [
      { name: 'Foundation and plinth', description: 'Strip concrete foundations supporting walls built from expanded-clay concrete blocks.', provider: 'Yes' },
      { name: 'External walls', description: 'Expanded-clay concrete blocks: 300 mm on the 1st floor and 250 mm on the 2nd and 3rd floors. Insulated with 150 mm stone wool and finished with decorative render.', provider: 'Yes' },
      { name: 'Common-area and inter-apartment walls', description: 'Expanded-clay concrete blocks 250/200 mm, plastered on both sides.', provider: 'Yes' },
      { name: 'Apartment internal partitions', description: 'Plasterboard partitions with two layers of plasterboard on each side (125 mm) and 75 mm stone-wool acoustic insulation.', provider: 'Yes' },
      { name: 'Bathroom partitions', description: 'Between the bathroom and other rooms: plasterboard partitions with two layers of plasterboard on each side (125 mm) and 75 mm stone-wool acoustic insulation. The bathroom side uses moisture-resistant plasterboard.', provider: 'Yes' },
    ],
  },
  {
    title: 'Floors',
    rows: [
      { name: 'Slab construction', description: 'Precast reinforced-concrete panels. Floors 2 and 3 are insulated with 50 mm stone-wool acoustic + thermal panels; the ground-floor concrete slab is insulated with 150 mm EPS.', provider: 'Yes' },
      { name: 'Living areas', description: 'Laminate 10 mm KronoOriginal ATL10-K405P, class 33, with underlay (floating floor). Skirtings — MDF veneered, moisture-resistant, 16×70 mm XSR 164.', provider: 'Yes', image: '/images/finishes/apdares__gridas001.jpg', imageAlt: 'Laminate sample — KronoOriginal' },
    ],
  },
  {
    title: 'Stairwells',
    rows: [
      { name: 'Corridors and landings', description: 'Tile finish in corridors and inter-floor landings; precast reinforced-concrete stair flights with epoxy coating.', provider: 'Yes' },
    ],
  },
  {
    title: 'Roof',
    rows: [
      { name: 'Construction', description: 'Precast reinforced-concrete panels, slope formed with EPS, triple-layer stone-wool insulation, and a two-layer rolled membrane on top.', provider: 'Yes' },
    ],
  },
  {
    title: 'Ceilings',
    rows: [
      { name: 'Living areas', description: 'Reinforced-concrete slabs, filled and painted with visible joints. Ceiling height 2.7 m.', provider: 'Yes' },
      { name: 'Bathrooms and corridors', description: 'Suspended plasterboard ceilings. Height 2.40 m.', provider: 'Yes' },
    ],
  },
  {
    title: 'Wall finishes',
    rows: [
      { name: 'Apartments', description: 'Walls plastered and painted. Each room uses two tones: NCS S 0804-G90Y for all main walls; NCS S 1505-Y50R for the accent wall.', provider: 'Yes', image: '/images/finishes/apdares__image003.jpg', imageAlt: 'NCS tone samples — main and accent walls' },
      { name: 'Bathrooms', description: 'Walls waterproofed; finish — porcelain tiles Italgraniti / Travertini Beige Vein Cut / Terre Bianco, 30×60 cm.', provider: 'Yes', image: '/images/finishes/apdares__image004.jpg', imageAlt: 'Wall tile sample — Travertini Beige Vein Cut' },
    ],
  },
  {
    title: 'Ceiling finishes',
    rows: [
      { name: 'All rooms', description: 'Painted with water-based emulsion. In bathrooms — moisture-resistant emulsion paint. Colour — white.', provider: 'Yes' },
    ],
  },
  {
    title: 'Doors and windows',
    rows: [
      { name: 'Apartment entrance door', description: 'Wooden fire-resistant entrance door with sound insulation up to 38 dBW.', provider: 'Yes' },
      { name: 'Internal doors', description: 'Inter-room doors — veneered PRODEX Torino PRO without locks. Bathroom doors are fitted with a bathroom lock. Handle L.AL43A110-MSN (PRODEX).', provider: 'Yes', image: '/images/finishes/apdares__durvi.jpg', imageAlt: 'Internal door sample — PRODEX Torino PRO' },
      { name: 'Windows and balcony doors', description: 'Dark grey / white PVC frames (REHAU). 7-chamber frame profiles, 6-chamber sash profiles. Triple (2-chamber) glazing, Ug = 0.5 W/m²K. Window sills included.', provider: 'Yes', image: '/images/finishes/apdares__durvi2.jpg', imageAlt: 'REHAU PVC window profile cross-section' },
    ],
  },
  {
    title: 'External entry door (stairwell)',
    rows: [
      { name: 'Entrance door', description: 'Aluminium profile with a code lock connected to the intercom system.', provider: 'Yes' },
    ],
  },
  {
    title: 'Balconies and terraces',
    rows: [
      { name: 'Balconies', description: 'Balcony floor structure — concrete. Galvanised, factory-painted metal railings with painted perforated metal panels on the outside.', provider: 'Yes' },
      { name: 'Terraces', description: 'Ground-floor apartments have outdoor terraces with cobblestone paving, accessible from the living room.', provider: 'Yes' },
    ],
  },
  {
    title: 'Plumbing and drainage',
    rows: [
      { name: 'General', description: 'Plumbing and drainage are provided in bathrooms and the kitchen area. Washing-machine connections are included.', provider: 'Yes' },
      { name: 'Kitchen', description: 'The kitchen area has water and drainage connections.', provider: 'Yes' },
      { name: 'Meters', description: 'Cold and hot water meters are located in the shared corridor.', provider: 'Yes' },
      { name: 'Basin', description: 'CONNECT AIR CUBE 600×460 mm, white. CERAFINE pop-up tap, chrome. DESIGN basin trap, chrome / Ideal Standard.', provider: 'Yes', image: '/images/finishes/apdares__santeh1.jpg', imageAlt: 'Basin, tap and trap — Ideal Standard' },
      { name: 'WC', description: 'Built-in WC frame PROSYS with cistern and brackets. OLEAS M1 flush plate, black matt. Wall-hung WC TESI AQUABLADE, white. TESI seat with soft-close, white / Ideal Standard.', provider: 'Yes', image: '/images/finishes/apdares__santeh2.jpg', imageAlt: 'WC frame PROSYS, TESI AQUABLADE pan and OLEAS M1 plate' },
      { name: 'Shower enclosure', description: 'Stone-resin shower tray PAA 900×900, with trap. Shower enclosure CONNECT2 900×900×H1950 mm, R550, sliding doors. Shower system CERATHERM T25+ with thermostat, hand shower, and overhead shower D260 mm, chrome / Ideal Standard.', provider: 'Yes', image: '/images/finishes/apdares__santeh3.jpg', imageAlt: 'Shower tray, CERATHERM system and trap' },
    ],
  },
  {
    title: 'Heating',
    rows: [
      { name: 'System', description: 'Heating is provided by a centralised heat distribution system from the building heat unit with installed gas boilers.', provider: 'Yes' },
      { name: 'Radiators', description: 'Apartments are fitted with thermostatic wall radiators PURMO FCV (smooth).', provider: 'Yes' },
      { name: 'Underfloor heating', description: 'Bathrooms have adjustable underfloor heating.', provider: 'Yes' },
      { name: 'Meters', description: 'Each apartment has its own heating meter located in the shared corridor meter cabinet.', provider: 'Yes' },
    ],
  },
  {
    title: 'Ventilation',
    rows: [
      { name: 'Bathrooms and kitchen', description: 'Bathrooms have switchable extract fans with timers. The kitchen area uses natural ventilation.', provider: 'Yes' },
      { name: 'Risers', description: 'Each apartment has its own ventilation risers.', provider: 'Yes' },
      { name: 'Heat recovery', description: 'Wall-mounted heat-recovery units in every apartment.', provider: 'Yes' },
    ],
  },
  {
    title: 'Electrical supply',
    rows: [
      { name: 'Connection', description: 'Each apartment has a 3-phase 20 A connection.', provider: 'Yes' },
    ],
  },
  {
    title: 'Apartment electrical supply and lighting',
    rows: [
      { name: 'Meters', description: 'Each apartment has its own electricity meter located in the shared corridor meter cabinet.', provider: 'Yes' },
      { name: 'Distribution board', description: 'Electricity is delivered to apartments via the distribution board.', provider: 'Yes' },
      { name: 'Low-voltage network', description: 'Low-voltage network distribution board.', provider: 'Yes' },
      { name: 'Sockets', description: 'Power sockets in every apartment per the project / EPAFEL.', provider: 'Yes', image: '/images/finishes/apdares__rozet1.jpg', imageAlt: 'Socket — EPAFEL' },
      { name: 'Switches', description: 'Light switches in every apartment per the project / EPAFEL.', provider: 'Yes', image: '/images/finishes/apdares__rozet2.jpg', imageAlt: 'Switch — EPAFEL' },
      { name: 'Connections', description: 'Connections for the cooker and lighting fixtures in every apartment per the project.', provider: 'Yes' },
      { name: 'Towel rail', description: 'Power outlet for the towel rail.', provider: 'Yes' },
      { name: 'Washing machine', description: 'Power outlet for the washing machine.', provider: 'Yes' },
      { name: 'TV and internet', description: 'TV and internet connections in every apartment per the project. Operator SIA Balticom (the buyer signs the connection contract separately).', provider: 'Yes', notes: 'Separate contract' },
      { name: 'Access system', description: 'Stairwell entrance door and gate use a code-and-fob system.', provider: 'Yes' },
      { name: 'Intercom and safety', description: 'Intercom system. One smoke detector per apartment.', provider: 'Yes' },
    ],
  },
  {
    title: 'Kitchen furniture and equipment',
    rows: [
      { name: 'Materials and tones', description: 'Wall units — H3433 ST22, 18 mm, Polar Aland Pine (EGGER). Base units — U211 ST9, 18 mm, Almond Beige (EGGER). Worktop — Basaltino Terra F352 ST76 (EGGER).', provider: 'Yes', image: '/images/finishes/apdares__kuhnja_0002.jpg', imageAlt: 'EGGER kitchen material samples' },
      { name: 'Visualisation', description: 'Typical kitchen configuration with built-in appliances, stone worktop, and concealed handles.', provider: 'Yes', image: '/images/finishes/apdares__kuhnja_003333i.jpg', imageAlt: 'Kitchen visualisation' },
    ],
  },
];

export function getApdaresSpec(locale: Locale): SpecGroup[] {
  if (locale === 'ru') return ru;
  if (locale === 'en') return en;
  return lv;
}
