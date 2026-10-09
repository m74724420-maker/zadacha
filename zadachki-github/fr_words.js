/* =============================================================
   ФРАНЦУЗСКИЙ ДЛЯ БАБУШКИ — содержание
   Путешествие по Франции: словарь, диалоги, фразы.

   Устройство:
   - каждая неделя — новая точка Франции, в паспорте появляется штамп;
   - в уроке три-четыре НОВЫХ слова (не больше: память не резиновая);
   - у слова, для которого нашлась запись человека, она и звучит
     (файл fr/СЛОВО.ogg). Если файла нет, произносит голос телефона;
   - фразы и диалоги произносит голос телефона: он умеет ставить
     интонацию целой фразы, а отдельные записи есть только у слов.
   ============================================================= */

const FR = {

  /* ---------------- ПАСПОРТ: точки путешествия ---------------- */
  places: [
    { code: 'paris',     nameRu: 'Париж',         nameFr: 'Paris',        emoji: '🗼', days: 5 },
    { code: 'normandie', nameRu: 'Нормандия',     nameFr: 'Normandie',    emoji: '⛵', days: 5 },
    { code: 'bretagne',  nameRu: 'Бретань',       nameFr: 'Bretagne',     emoji: '🥐', days: 5 },
    { code: 'loire',     nameRu: 'Долина Луары',  nameFr: 'Loire',        emoji: '🏰', days: 5 },
    { code: 'provence',  nameRu: 'Прованс',       nameFr: 'Provence',     emoji: '🌿', days: 5 },
    { code: 'cotedazur', nameRu: 'Лазурный берег', nameFr: 'Côte d’Azur', emoji: '🌊', days: 5 }
  ],

  /* ---------------- СЛОВАРЬ ----------------
     Ключ — слово по-французски, без пробелов и диакритики.
     Если для ключа есть файл fr/СЛОВО.ogg, оно читает голос человека. */
  words: {
    /* неделя 1 — Париж */
    bonjour:   { ru: 'здравствуйте',          emoji: '👋' },
    merci:     { ru: 'спасибо',               emoji: '🙏' },
    bonsoir:   { ru: 'добрый вечер',          emoji: '🌆' },
    salut:     { ru: 'привет',                emoji: '😄' },
    oui:       { ru: 'да',                    emoji: '✅' },
    non:       { ru: 'нет',                   emoji: '❌' },
    pardon:    { ru: 'извините',              emoji: '🙇' },
    eau:       { ru: 'вода',                  emoji: '💧' },
    pain:      { ru: 'хлеб',                  emoji: '🍞' },
    the:       { ru: 'чай',                   emoji: '🍵' },
    cafe:      { ru: 'кофе',                  emoji: '☕' },
    vin:       { ru: 'вино',                  emoji: '🍷' },
    chat:      { ru: 'кот',                   emoji: '🐱' },
    chien:     { ru: 'собака',                emoji: '🐶' },
    cheval:    { ru: 'лошадь',                emoji: '🐴' },

    /* неделя 2 — Нормандия */
    mer:       { ru: 'море',                  emoji: '🌊' },
    plage:     { ru: 'пляж',                  emoji: '🏖️' },
    soleil:    { ru: 'солнце',                emoji: '☀️' },
    bateau:    { ru: 'лодка',                 emoji: '⛵' },
    ville:     { ru: 'город',                 emoji: '🏙️' },
    rue:       { ru: 'улица',                 emoji: '🛣️' },
    maison:    { ru: 'дом',                   emoji: '🏠' },
    chambre:   { ru: 'комната',               emoji: '🛏️' },
    cle:       { ru: 'ключ',                  emoji: '🔑' },

    /* неделя 3 — Бретань */
    croissant:  { ru: 'круассан',              emoji: '🥐' },
    fromage:   { ru: 'сыр',                   emoji: '🧀' },
    pomme:     { ru: 'яблоко',                emoji: '🍎' },
    poisson:   { ru: 'рыба',                  emoji: '🐟' },
    mairie:    { ru: 'ратуша',                emoji: '🏛️' },
    festival:  { ru: 'праздник',              emoji: '🎉' },
    musique:   { ru: 'музыка',                emoji: '🎵' },
    dire:      { ru: 'сказать',               emoji: '💬' },
    fromage_c: { ru: 'сырная тарелка',        emoji: '🧀' },

    /* неделя 4 — Долина Луары */
    chateau:   { ru: 'замок',                 emoji: '🏰' },
    jardin:    { ru: 'сад',                   emoji: '🌷' },
    fleur:     { ru: 'цветок',                emoji: '🌹' },
    livre:     { ru: 'книга',                 emoji: '📖' },
    table:     { ru: 'стол',                  emoji: '🪑' },
    chaise:    { ru: 'стул',                  emoji: '💺' },
    fire:      { ru: 'огонь',                 emoji: '🔥' },
    nuit:      { ru: 'ночь',                  emoji: '🌙' },
    petit:     { ru: 'маленький',             emoji: '🐜' },
    grand:     { ru: 'большой',               emoji: '🐘' },

    /* неделя 5 — Прованс */
    lavande:   { ru: 'лаванда',               emoji: '💜' },
    olive:     { ru: 'олива',                 emoji: '🫒' },
    tomate:    { ru: 'помидор',               emoji: '🍅' },
    marche:    { ru: 'рынок',                 emoji: '🧺' },
    bouteille: { ru: 'бутылка',               emoji: '🍾' },
    parapluie: { ru: 'зонт',                  emoji: '☂️' },
    chaud:     { ru: 'жарко',                 emoji: '🥵' },
    froid:     { ru: 'холодно',               emoji: '🥶' },
    semaine:   { ru: 'неделя',                emoji: '📅' },
    aubergine: { ru: 'баклажан',              emoji: '🍆' },

    /* неделя 6 — Лазурный берег */
    bleu:      { ru: 'синий',                 emoji: '🔵' },
    blanc:     { ru: 'белый',                 emoji: '⚪' },
    rouge:     { ru: 'красный',               emoji: '🔴' },
    train:     { ru: 'поезд',                 emoji: '🚆' },
    gare:      { ru: 'вокзал',                emoji: '🚉' },
    billet:    { ru: 'билет',                 emoji: '🎫' },
    argent:    { ru: 'деньги',                emoji: '💰' },
    travail:   { ru: 'работа',                emoji: '🛠️' },
    promenade: { ru: 'прогулка',              emoji: '🚶' },
    souvenir:  { ru: 'сувенир',               emoji: '🎁' }
  },

  /* ---------------- ФРАЗЫ ----------------
     Их произносит голос телефона — он умеет интонацию целой фразы. */
  phrases: {
    salut_oui:    { fr: 'Salut !',                    ru: 'Привет!' },
    merci_beau:   { fr: 'Merci beaucoup',             ru: 'Большое спасибо' },
    svp:          { fr: 'S’il vous plaît',            ru: 'Пожалуйста' },
    comment:      { fr: 'Comment ça va ?',            ru: 'Как дела?' },
    tres_bien:    { fr: 'Très bien, merci',           ru: 'Очень хорошо, спасибо' },
    je_suis:      { fr: 'Je suis russe',              ru: 'Я из России' },
    parler_fr:    { fr: 'Je parle un peu français',   ru: 'Я немного говорю по-французски' },
    pas_compris:  { fr: 'Je ne comprends pas',        ru: 'Я не понимаю' },
    repetez:      { fr: 'Répétez, s’il vous plaît',    ru: 'Повторите, пожалуйста' },
    how_much:     { fr: 'Combien ça coûte ?',         ru: 'Сколько это стоит?' },
    une_table:    { fr: 'Une table pour deux',        ru: 'Стол на двоих' },
    laddition:    { fr: 'L’addition, s’il vous plaît', ru: 'Счёт, пожалуйста' },
    ou_est:       { fr: 'Où est la gare ?',           ru: 'Где вокзал?' },
    a_bientot:    { fr: 'À bientôt !',                ru: 'До свидания!' },
    monsieur:     { fr: 'Monsieur, s’il vous plaît',   ru: 'Мужчина, пожалуйста' }
  },

  /* ---------------- СЦЕНКИ ----------------
     Маленькие диалоги для практики: их читает голос телефона. */
  scenes: [
    { place: 'paris', emoji: '☕',
      title: 'В кафе',
      lines: [
        { fr: 'Bonjour, madame !',      ru: 'Здравствуйте, мадам!' },
        { fr: 'Bonjour !',              ru: 'Здравствуйте!' },
        { fr: 'Un café, s’il vous plaît.', ru: 'Один кофе, пожалуйста.' },
        { fr: 'Très bien. Combien ça coûte ?', ru: 'Очень хорошо. Сколько это стоит?' },
        { fr: 'Trois euros.',            ru: 'Три евро.' },
        { fr: 'Merci beaucoup !',        ru: 'Большое спасибо!' }
      ] },
    { place: 'paris', emoji: '🚉',
      title: 'На вокзале',
      lines: [
        { fr: 'Excusez-moi, où est la gare ?', ru: 'Извините, где вокзал?' },
        { fr: 'Allez tout droit.',             ru: 'Идите прямо.' },
        { fr: 'Et un billet pour Nice, s’il vous plaît.', ru: 'И билет до Ниццы, пожалуйста.' },
        { fr: 'C’est vingt euros.',             ru: 'Это двадцать евро.' },
        { fr: 'Merci. Au revoir !',            ru: 'Спасибо. До свидания!' }
      ] },
    { place: 'normandie', emoji: '🏨',
      title: 'В гостинице',
      lines: [
        { fr: 'Bonsoir. J’ai une chambre.', ru: 'Добрый вечер. У меня есть комната.' },
        { fr: 'Une chambre pour deux nuits ?', ru: 'Комната на две ночи?' },
        { fr: 'Oui, avec la vue sur la mer.', ru: 'Да, с видом на море.' },
        { fr: 'Très bien. Et le petit déjeuner ?', ru: 'Очень хорошо. А завтрак?' },
        { fr: 'À huit heures.',              ru: 'В восемь часов.' }
      ] },
    { place: 'bretagne', emoji: '🧺',
      title: 'На рынке',
      lines: [
        { fr: 'Bonjour ! Vous avez du fromage ?', ru: 'Здравствуйте! У вас есть сыр?' },
        { fr: 'Oui, bien sûr. Moutarde ou des fruits.', ru: 'Да, конечно. Горчица или зерно.' },
        { fr: 'Je voudrais du fromage.',         ru: 'Я хотел бы сыр.' },
        { fr: 'Combien ça coûte ?',             ru: 'Сколько это стоит?' },
        { fr: 'Douze euros le kilo.',           ru: 'Двенадцать евро за килограмм.' }
      ] },
    { place: 'loire', emoji: '🏰',
      title: 'В замке',
      lines: [
        { fr: 'Bonjour, je voudrais visiter le château.', ru: 'Здравствуйте, я хотел бы посмотреть замок.' },
        { fr: 'C’est possible. Voici le billet.',       ru: 'Это возможно. Вот билет.' },
        { fr: 'Merci. Le château est très ancien ?',   ru: 'Спасибо. Замок очень старый?' },
        { fr: 'Oui, quatre cents ans.',                 ru: 'Да, четыреста лет.' },
        { fr: 'Incroyable !',                           ru: 'Невероятно!' }
      ] },
    { place: 'provence', emoji: '☂️',
      title: 'В жару',
      lines: [
        { fr: 'Il fait très chaud aujourd’hui.', ru: 'Сегодня очень жарко.' },
        { fr: 'Oui, il fait trente-cinq degrés.', ru: 'Да, тридцать пять градусов.' },
        { fr: 'Je voudrais un verre d’eau.',   ru: 'Я хотел бы стакан воды.' },
        { fr: 'Bien sûr. Vous avez un parapluie ?', ru: 'Конечно. У вас есть зонт?' },
        { fr: 'Non, merci. Au revoir !',       ru: 'Нет, спасибо. До свидания!' }
      ] },
    { place: 'cotedazur', emoji: '🌊',
      title: 'На море',
      lines: [
        { fr: 'Bonjour ! La mer est belle aujourd’hui.', ru: 'Здравствуйте! Сегодня море красивое.' },
        { fr: 'Oui, très bleue.',                        ru: 'Да, очень синее.' },
        { fr: 'On peut nager ici ?',                     ru: 'Здесь можно плавать?' },
        { fr: 'Oui, mais attention aux vagues.',          ru: 'Да, но осторожно с волнами.' }
      ] }
  ]
};
/* =============================================================
   ФРАНЦУЗСКИЙ АЛФАВИТ

   Без букв начинать нельзя: бабушка не сможет ни прочитать,
   ни записать ни одного слова. Поэтому алфавит стоит первым
   пунктом — «Перед дорогой».

   Как устроено:
   - 26 букв, по 13 на урок (два урока всего);
   - у каждой буквы — слово-пример, где её слышно сразу:
     вслух произносится ИМЕННО ОНО, а не буква. Это надёжнее,
     чем читать букву: голоса на разных устройствах читают
     одинокие буквы по-разному, а слово звучит одинаково везде;
   - как букву называют по-русски — подсказка рядом.

   1. A / a — «а»        — все французские слова на A
   2. B / b — «бэ»       — «боб»
   3. C / c — «сэ»       — «сыр» (fromage)
   4. D / d — «дэ»       — «друг» (ami)
   5. E / e — «у»        — «вода» (eau)
   6. F / f — «эф»       — «семья» (famille)
   7. G / g — «жэ»       — «собака» (chien)
   8. H / h — «аш»       — «роза» (rose)
   9. I / i — «и»        — «улица» (rue)
  10. J / j — «ж»        — «яйцо» (œuf)
  11. K / k — «ка»       — «корова» (vache)
  12. L / l — «эль»      — «молоко» (lait)
  13. M / m — «эм»       — «мама» (maman)

  14. N / n — «эн»       — «нос» (nez)
  15. O / o — «о»        — «вода» (eau)
  16. P / p — «пэ»       — «папа» (papa)
  17. Q / q — «ку»       — «кот» (chat)
  18. R / r — «эр»       — «улица» (rue)
  19. S / s — «эс»       — «вода» (eau)
  20. T / t — «тэ»       — «чай» (thé)
  21. U / u — «ю»        — «дождь» (pluie)
  22. V / v — «вэ»       — «виноград» (raisin)
  23. W / w — «даблвэ»   — «вода» (eau)
  24. X / x — «икс»      — «десять» (dix)
  25. Y / y — «игрек»    — «сыр» (fromage)
  26. Z / z — «зэд»      — «зима» (hiver)
*/

FR.letters = [
  { up: 'A', lo: 'a', ru: 'а',  word: 'eau',     wordRu: 'вода',   emoji: '💧' },
  { up: 'B', lo: 'b', ru: 'бэ', word: 'bateau',  wordRu: 'лодка',  emoji: '⛵' },
  { up: 'C', lo: 'c', ru: 'сэ', word: 'chat',    wordRu: 'кот',    emoji: '🐱' },
  { up: 'D', lo: 'd', ru: 'дэ', word: 'ami',     wordRu: 'друг',   emoji: '🤝' },
  { up: 'E', lo: 'e', ru: 'у',  word: 'enfant',  wordRu: 'ребёнок',emoji: '👶' },
  { up: 'F', lo: 'f', ru: 'эф', word: 'fleur',   wordRu: 'цветок', emoji: '🌷' },
  { up: 'G', lo: 'g', ru: 'жэ', word: 'gare',    wordRu: 'вокзал', emoji: '🚉' },
  { up: 'H', lo: 'h', ru: 'аш', word: 'hôtel',   wordRu: 'гостиница', emoji: '🏨' },
  { up: 'I', lo: 'i', ru: 'и',  word: 'île',     wordRu: 'остров', emoji: '🏝️' },
  { up: 'J', lo: 'j', ru: 'ж',  word: 'jour',    wordRu: 'день',   emoji: '📅' },
  { up: 'K', lo: 'k', ru: 'ка', word: 'lait',    wordRu: 'молоко', emoji: '🥛' },
  { up: 'L', lo: 'l', ru: 'эль',word: 'lion',    wordRu: 'лев',    emoji: '🦁' },
  { up: 'M', lo: 'm', ru: 'эм', word: 'maison',  wordRu: 'дом',    emoji: '🏠' },
  { up: 'N', lo: 'n', ru: 'эн', word: 'nez',     wordRu: 'нос',    emoji: '👃' },
  { up: 'O', lo: 'o', ru: 'о',  word: 'orange',  wordRu: 'апельсин',emoji: '🍊' },
  { up: 'P', lo: 'p', ru: 'пэ', word: 'pain',    wordRu: 'хлеб',   emoji: '🍞' },
  { up: 'Q', lo: 'q', ru: 'ку', word: 'qui',     wordRu: 'кто',    emoji: '❓' },
  { up: 'R', lo: 'r', ru: 'эр', word: 'rue',     wordRu: 'улица',  emoji: '🛣️' },
  { up: 'S', lo: 's', ru: 'эс', word: 'soleil',  wordRu: 'солнце', emoji: '☀️' },
  { up: 'T', lo: 't', ru: 'тэ', word: 'thé',     wordRu: 'чай',    emoji: '🍵' },
  { up: 'U', lo: 'u', ru: 'ю',  word: 'url',     wordRu: 'ссылка', emoji: '🔗' },
  { up: 'V', lo: 'v', ru: 'вэ', word: 'vin',     wordRu: 'вино',   emoji: '🍷' },
  { up: 'W', lo: 'w', ru: 'даблвэ', word: 'wagon', wordRu: 'вагон',  emoji: '🚆' },
  { up: 'X', lo: 'x', ru: 'икс',word: 'dix',     wordRu: 'десять', emoji: '🔟' },
  { up: 'Y', lo: 'y', ru: 'игрек', word: 'yoga',  wordRu: 'йога',   emoji: '🧘' },
  { up: 'Z', lo: 'z', ru: 'зэд',word: 'zèbre',   wordRu: 'зебра',  emoji: '🦓' }
];

/* Алфавит разбит на два урока по 13 букв */
FR.lettersPerLesson = 13;

