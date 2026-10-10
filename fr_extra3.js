/* =============================================================
   МИКРО-ТЕМЫ, ЧАСТЬ ВТОРАЯ — и дополнения к первой

   Здесь 15 новых тем и продолжение трёх старых: животные (экзотика),
   дом и мебель (подробно), размеры (система XS–XL).

   Как это работает: в конце файла новые темы приклеиваются к общему
   списку, а в старые темы просто добавляются слова. Всё остальное —
   паспорт, словарик, практика перевода — подхватывается само.
   ============================================================= */

FR.microMore = [
  /* ---------------- ЕДА ---------------- */
  {
    id: 'nourriture', emoji: '🍎', title: 'Еда и напитки',
    note: 'В кафе и на рынке без этих слов никуда. Мясо во французском ' +
          'всегда женского рода: la viande, le poisson.',
    rows: [
      { fr: 'le pain',        ru: 'хлеб' },
      { fr: 'le fromage',     ru: 'сыр' },
      { fr: 'la viande',      ru: 'мясо' },
      { fr: 'le poisson',     ru: 'рыба' },
      { fr: 'le poulet',      ru: 'курица' },
      { fr: 'la salade',      ru: 'салат' },
      { fr: 'la soupe',       ru: 'суп' },
      { fr: 'le riz',         ru: 'рис' },
      { fr: 'les pâtes',      ru: 'макароны' },
      { fr: 'la pomme de terre', ru: 'картофель' },
      { fr: 'l’œuf',          ru: 'яйцо' },
      { fr: 'le gâteau',      ru: 'пирог, торт' },
      { fr: 'le petit déjeuner', ru: 'завтрак' },
      { fr: 'le déjeuner',    ru: 'обед' },
      { fr: 'le dîner',       ru: 'ужин' },
      { fr: 'le café',        ru: 'кофе' },
      { fr: 'le thé',         ru: 'чай' },
      { fr: 'l’eau',          ru: 'вода' },
      { fr: 'le jus de fruit', ru: 'сок' },
      { fr: 'le vin',         ru: 'вино' },
      { fr: 'la bière',       ru: 'пиво' },
      { fr: 'J’ai faim.',     ru: 'Я голоден.' },
      { fr: 'Je voudrais l’addition.', ru: 'Я бы хотел счёт.' }
    ]
  },
  /* ---------------- ОДЕЖДА ---------------- */
  {
    id: 'vetements', emoji: '👗', title: 'Одежда и обувь',
    note: 'Все женского рода. Примерка: «Je peux essayer ?» — можно примерить?',
    rows: [
      { fr: 'la robe',        ru: 'платье' },
      { fr: 'le manteau',     ru: 'пальто' },
      { fr: 'le pull',        ru: 'свитер' },
      { fr: 'le pantalon',    ru: 'брюки' },
      { fr: 'la jupe',        ru: 'юбка' },
      { fr: 'la chemise',     ru: 'рубашка' },
      { fr: 'le blouson',     ru: 'куртка' },
      { fr: 'le manteau de pluie', ru: 'плащ' },
      { fr: 'l’écharpe',      ru: 'шарф' },
      { fr: 'le chapeau',     ru: 'шляпа' },
      { fr: 'les lunettes',   ru: 'очки' },
      { fr: 'le sac',         ru: 'сумка' },
      { fr: 'les chaussures', ru: 'обувь' },
      { fr: 'les bottes',     ru: 'ботинки' },
      { fr: 'il fait chaud. Habitez-vous ce pull ?', ru: 'Жарко. Наденьте этот свитер?' }
    ]
  },
  /* ---------------- ДЕНЬГИ ---------------- */
  {
    id: 'argent', emoji: '💰', title: 'Деньги и покупки',
    note: 'Про цены. «C’est combien ?» — сколько стоит? Короткое и самое нужное.',
    rows: [
      { fr: 'l’argent',      ru: 'деньги' },
      { fr: 'le prix',       ru: 'цена' },
      { fr: 'c’est combien ?', ru: 'сколько стоит?' },
      { fr: 'c’est cher.',   ru: 'Это дорого.' },
      { fr: 'c’est pas cher.', ru: 'Это дёшево.' },
      { fr: 'un euro',       ru: 'один евро' },
      { fr: 'Je peux payer par carte ?', ru: 'Можно оплатить картой?' },
      { fr: 'Gardez la monnaie.', ru: 'Сдачи не надо.' },
      { fr: 'la boutique',   ru: 'магазин' },
      { fr: 'le marché',     ru: 'рынок' },
      { fr: 'Je regarde, merci.', ru: 'Я посмотрю, спасибо.' },
      { fr: 'Je prends ça.',  ru: 'Я беру это.' }
    ]
  },
  /* ---------------- ГОРОД ---------------- */
  {
    id: 'ville', emoji: '🏙', title: 'Город: улицы и места',
    note: 'Чтобы найти дорогу. «О la rue» — на улице, «à la banque» — у банка.',
    rows: [
      { fr: 'la rue',         ru: 'улица' },
      { fr: 'l’avenue',       ru: 'avenue' },
      { fr: 'la place',       ru: 'площадь' },
      { fr: 'le boulevard',   ru: 'бульвар' },
      { fr: 'la banque',      ru: 'банк' },
      { fr: 'la boulangerie', ru: 'булочная' },
      { fr: 'le café',        ru: 'кафе' },
      { fr: 'le restaurant',  ru: 'ресторан' },
      { fr: 'le musée',       ru: 'музей' },
      { fr: 'l’hôtel',        ru: 'отель' },
      { fr: 'la pharmacie',   ru: 'аптека' },
      { fr: 'le parc',        ru: 'парк' },
      { fr: 'l’église',       ru: 'церковь' },
      { fr: 'le cinéma',      ru: 'кино' },
      { fr: 'Où est la poste ?', ru: 'Где почта?' },
      { fr: 'C’est tout droit.', ru: 'Прямо.' }
    ]
  },
  /* ---------------- ВРЕМЕНА ГОДА ---------------- */
  {
    id: 'saisons', emoji: '🌤', title: 'Времена года',
    note: 'Все среднего рода: le printemps, l’été. Часто с «il fait» + погода.',
    rows: [
      { fr: 'le printemps', ru: 'весна' },
      { fr: 'l’été',        ru: 'лето' },
      { fr: 'l’automne',   ru: 'осень' },
      { fr: 'l’hiver',      ru: 'зима' },
      { fr: 'En été, je vais en vacances.', ru: 'Летом я еду в отпуск.' },
      { fr: 'What season do you prefer ?', ru: 'Какое время года вы предпочитаете?' }
    ]
  },
  /* ---------------- ВРЕМЯ СУТОК ---------------- */
  {
    id: 'moment', emoji: '⏰', title: 'Время суток',
    note: 'И сразу главный вопрос времени: «Quelle heure est-il ?»',
    rows: [
      { fr: 'le matin',       ru: 'утро' },
      { fr: 'l’après-midi',   ru: 'после обеда' },
      { fr: 'le soir',        ru: 'вечер' },
      { fr: 'la nuit',        ru: 'ночь' },
      { fr: 'minuit',         ru: 'полночь' },
      { fr: 'Quelle heure est-il ?', ru: 'Который час?' },
      { fr: 'Il est huit heures.', ru: 'Сейчас восемь часов.' },
      { fr: 'À quelle heure ?', ru: 'Во сколько?' },
      { fr: 'Tout de suite.', ru: 'Сразу же.' },
      { fr: 'Plus tard.',     ru: 'Позже.' }
    ]
  },
  /* ---------------- ТРАНСПОРТ ---------------- */
  {
    id: 'transports', emoji: '🚌', title: 'Транспорт',
    note: 'Всё мужского рода. «En train» — на поезде, «en voiture» — на машине.',
    rows: [
      { fr: 'le train',      ru: 'поезд' },
      { fr: 'l’avion',       ru: 'самолёт' },
      { fr: 'le métro',      ru: 'метро' },
      { fr: 'le bus',        ru: 'автобус' },
      { fr: 'le tramway',    ru: 'трамвай' },
      { fr: 'le taxi',       ru: 'такси' },
      { fr: 'la voiture',    ru: 'машина' },
      { fr: 'le vélo',       ru: 'велосипед' },
      { fr: 'la gare',       ru: 'вокзал' },
      { fr: 'l’arrêt',       ru: 'остановка' },
      { fr: 'le quai',       ru: 'платформа' },
      { fr: 'la valise',     ru: 'чемодан' },
      { fr: 'Quel quai ?',   ru: 'Какая платформа?' }
    ]
  },
  /* ---------------- МЕРЫ ---------------- */
  {
    id: 'mesures', emoji: '📏', title: 'Меры и вес',
    note: 'В магазине и в аптеке. «Ça fait combien ?» — сколько это стоит в объёме.',
    rows: [
      { fr: 'le mètre',        ru: 'метр' },
      { fr: 'le centimètre',   ru: 'сантиметр' },
      { fr: 'le kilogramme',   ru: 'килограмм' },
      { fr: 'le gramme',       ru: 'грамм' },
      { fr: 'le litre',        ru: 'литр' },
      { fr: 'la taille',       ru: 'размер, рост' },
      { fr: 'le poids',        ru: 'вес' },
      { fr: 'un litre de lait', ru: 'литр молока' },
      { fr: 'Je fais du 38.',  ru: 'Мой размер 38.' },
      { fr: 'Combien ça pèse ?', ru: 'Сколько это весит?' }
    ]
  },
  /* ---------------- СЕМЬЯ ---------------- */
  {
    id: 'famille', emoji: '👨‍👩‍👧', title: 'Семья и люди',
    note: 'Женского рода: la mère, la fille. Мужского: le père, le fils.',
    rows: [
      { fr: 'la mère',        ru: 'мама' },
      { fr: 'le père',        ru: 'папа' },
      { fr: 'la fille',       ru: 'дочь' },
      { fr: 'le fils',        ru: 'сын' },
      { fr: 'la sœur',        ru: 'сестра' },
      { fr: 'le frère',       ru: 'брат' },
      { fr: 'la grand-mère',  ru: 'бабушка' },
      { fr: 'le grand-père',  ru: 'дедушка' },
      { fr: 'l’ami',          ru: 'друг' },
      { fr: 'la voisine',     ru: 'соседка' },
      { fr: 'ma famille',     ru: 'моя семья' },
      { fr: 'Je suis seule avec mon frère.', ru: 'Я живу вместе с братом.' }
    ]
  },
  /* ---------------- ПРИРОДА ---------------- */
  {
    id: 'nature', emoji: '🌳', title: 'Растения и природа',
    note: 'Всё женского рода: la fleur, l’arbre.',
    rows: [
      { fr: 'l’arbre',    ru: 'дерево' },
      { fr: 'la fleur',   ru: 'цветок' },
      { fr: 'l’herbe',    ru: 'трава' },
      { fr: 'la forêt',   ru: 'лес' },
      { fr: 'la rivière', ru: 'река' },
      { fr: 'la mer',     ru: 'море' },
      { fr: 'la montagne', ru: 'горы' },
      { fr: 'la pierre',  ru: 'камень' },
      { fr: 'le sable',   ru: 'песок' },
      { fr: 'le vent',    ru: 'ветер' },
      { fr: 'la neige',   ru: 'снег' }
    ]
  },
  /* ---------------- ГЛАГОЛЫ ДВИЖЕНИЯ ---------------- */
  {
    id: 'mouvements', emoji: '🏃', title: 'Глаголы движения',
    note: 'Самые ходовые. Запомните их — они нужны в первую очередь.',
    rows: [
      { fr: 'aller',      ru: 'идти, ехать' },
      { fr: 'venir',      ru: 'приходить' },
      { fr: 'partir',     ru: 'уезжать' },
      { fr: 'arriver',    ru: 'прибывать' },
      { fr: 'entrer',     ru: 'входить' },
      { fr: 'sortir',     ru: 'выходить' },
      { fr: 'monter',     ru: 'подниматься' },
      { fr: 'descendre',  ru: 'спускаться' },
      { fr: 'marcher',    ru: 'идти пешком' },
      { fr: 'Je vais à Paris.',  ru: 'Я еду в Париж.' },
      { fr: 'Venez avec moi !',  ru: 'Пойдёмте со мной!' }
    ]
  },
  /* ---------------- СОСТОЯНИЯ ---------------- */
  {
    id: 'humeur', emoji: '😌', title: 'Состояния и настроения',
    note: 'Отвечают на «как вы?» — «Ça va ?». И пригодится, если что-то не так.',
    rows: [
      { fr: 'content',    ru: 'довольный' },
      { fr: 'heureux',    ru: 'счастливый' },
      { fr: 'triste',     ru: 'грустный' },
      { fr: 'fatigué',    ru: 'уставший' },
      { fr: 'malade',     ru: 'больной' },
      { fr: 'perdu',      ru: 'растерянный' },
      { fr: 'inquiet',    ru: 'тревожный' },
      { fr: 'calme',      ru: 'спокойный' },
      { fr: 'Ça va ?',    ru: 'Как дела?' },
      { fr: 'Ça va, merci.', ru: 'Нормально, спасибо.' },
      { fr: 'Je suis fatiguée.', ru: 'Я устала.' }
    ]
  },
  /* ---------------- ПРАЗДНИКИ ---------------- */
  {
    id: 'fetes', emoji: '🎄', title: 'Праздники и отдых',
    note: 'Noël и Nouvel An знают во Франции все. Праздники без артикля: «fête Noël» — нет.',
    rows: [
      { fr: 'Noël',          ru: 'Рождество' },
      { fr: 'le Nouvel An',  ru: 'Новый год' },
      { fr: 'la fête',       ru: 'праздник' },
      { fr: 'l’anniversaire', ru: 'день рождения' },
      { fr: 'les vacances',  ru: 'каникулы, отпуск' },
      { fr: 'la plage',      ru: 'пляж' },
      { fr: 'la campagne',    ru: 'деревня, село' },
      { fr: 'Joyeux Noël !', ru: 'С Рождеством!' },
      { fr: 'Bonne année !', ru: 'С Новым годом!' },
      { fr: 'Bon anniversaire !', ru: 'С днём рождения!' }
    ]
  },
  /* ---------------- ОВОЩИ И ФРУКТЫ ---------------- */
  {
    id: 'fruits', emoji: '🥕', title: 'Овощи, фрукты, зелень',
    note: 'Все женского рода. На рынке и в магазине.',
    rows: [
      { fr: 'la pomme',       ru: 'яблоко' },
      { fr: 'la poire',       ru: 'груша' },
      { fr: 'l’orange',       ru: 'апельсин' },
      { fr: 'la banane',      ru: 'банан' },
      { fr: 'le raisin',      ru: 'виноград' },
      { fr: 'la fraise',      ru: 'клубника' },
      { fr: 'la tomate',      ru: 'помидор' },
      { fr: 'la carotte',     ru: 'морковь' },
      { fr: 'la pomme de terre', ru: 'картофель' },
      { fr: 'le concombre',   ru: 'огурец' },
      { fr: 'l’oignon',       ru: 'лук' },
      { fr: 'l’ail',          ru: 'чеснок' },
      { fr: 'l’épinard',      ru: 'шпинат' },
      { fr: 'Je prends deux pommes, s’il vous plaît.', ru: 'Возьму два яблока, пожалуйста.' }
    ]
  }
];

/* ---------------- ДОПОЛНЕНИЯ К СТАРЫМ ТЕМАМ ----------------
   Не переписываем старые темы, а просто добавляем слова: так ничего
   не теряется и видно, что было добавлено позже. */

FR.microAdd = {
  animaux: [
    { fr: 'un lion',      ru: 'лев' },
    { fr: 'un éléphant',  ru: 'слон' },
    { fr: 'une girafe',   ru: 'жираф' },
    { fr: 'un crocodile', ru: 'крокодил' },
    { fr: 'un serpent',   ru: 'змея' },
    { fr: 'un hibou',     ru: 'сова' },
    { fr: 'un aigle',     ru: 'орёл' },
    { fr: 'un perroquet', ru: 'попугай' },
    { fr: 'un renard',    ru: 'лиса' },
    { fr: 'un loup',      ru: 'волк' },
    { fr: 'un ours',      ru: 'медведь' },
    { fr: 'un dauphin',   ru: 'дельфин' },
    { fr: 'un requin',    ru: 'акула' },
    { fr: 'un pingouin',  ru: 'пингвин' },
    { fr: 'une chouette', ru: 'сова (совушка)' },
    { fr: 'un castor',    ru: 'бобр' },
    { fr: 'un pangolin',  ru: 'панголин' }
  ],
  /* Подробно про дом: комнаты, виды домов, мебель, полки, лампы, комоды */
  meuble: [
    /* --- комнаты --- */
    { fr: 'le salon',          ru: 'гостиная' },
    { fr: 'la salle à manger', ru: 'столовая' },
    { fr: 'la salle de bains',  ru: 'ванная' },
    { fr: 'les toilettes',     ru: 'туалет' },
    { fr: 'le WC',             ru: 'туалет (разговорное)' },
    { fr: 'le garage',         ru: 'гараж' },
    { fr: 'la cave',           ru: 'подвал' },
    { fr: 'le grenier',        ru: 'чердак' },
    { fr: 'le couloir',        ru: 'коридор' },
    { fr: 'la chambre',        ru: 'комната' },
    { fr: 'la buanderie',      ru: 'прачечная' },
    { fr: 'le balcon',         ru: 'балкон' },
    /* --- виды жилья --- */
    { fr: 'un appartement',  ru: 'квартира' },
    { fr: 'un studio',       ru: 'однушка' },
    { fr: 'une villa',       ru: 'вилла' },
    { fr: 'un chalet',       ru: 'шале' },
    { fr: 'un immeuble',     ru: 'доходный дом' },
    { fr: 'un château',      ru: 'замок' },
    { fr: 'une ferme',       ru: 'ферма' },
    { fr: 'une maison de campagne', ru: 'загородный дом' },
    { fr: 'une maison de ville',   ru: 'городской дом' },
    { fr: 'un pavillon',     ru: 'павильон, дом с садом' },
    { fr: 'un duplex',       ru: 'двухэтажная квартира' },
    { fr: 'un rez-de-chaussée', ru: 'первый этаж' },
    /* --- мебель --- */
    { fr: 'un canapé',       ru: 'диван' },
    { fr: 'un fauteuil',     ru: 'кресло' },
    { fr: 'un lit double',   ru: 'двуспальная кровать' },
    { fr: 'le matelas',      ru: 'матрас' },
    { fr: 'une table de nuit', ru: 'тумбочка' },
    { fr: 'un bureau',       ru: 'письменный стол' },
    { fr: 'un buffet',       ru: 'буфет, сервант' },
    { fr: 'une bibliothèque', ru: 'книжный шкаф' },
    { fr: 'un meuble TV',    ru: 'тумба под телевизор' },
    { fr: 'un tapis',        ru: 'ковёр' },
    { fr: 'un rideau',       ru: 'занавеска' },
    { fr: 'un store',        ru: 'жалюзи, рулонная штора' },
    { fr: 'un miroir',       ru: 'зеркало' },
    /* --- полки и хранение --- */
    { fr: 'une étagère',     ru: 'полка' },
    { fr: 'une étagère murale', ru: 'настенная полка' },
    { fr: 'une tablette',    ru: 'полочка, столик' },
    { fr: 'le rayonnage',    ru: 'стеллаж' },
    { fr: 'un casier',       ru: 'шкафчик, отделение' },
    { fr: 'un placard',      ru: 'встроенный шкаф' },
    { fr: 'la malle',        ru: 'большой сундук' },
    { fr: 'le coffre',       ru: 'ларь, сундук' },
    { fr: 'le bahut',        ru: 'буфет-ларь' },
    { fr: 'une commode',     ru: 'комод с ящиками' },
    { fr: 'un meuble de rangement', ru: 'шкаф для хранения' },
    /* --- свет --- */
    { fr: 'une ampoule',     ru: 'лампочка' },
    { fr: 'un plafonnier',   ru: 'люстра' },
    { fr: 'un lampadaire',   ru: 'торшер' },
    { fr: 'un abat-jour',    ru: 'абажур' },
    { fr: 'une applique',    ru: 'настенная лампа' },
    { fr: 'un spot',         ru: 'точечная лампа' },
    { fr: 'une guirlande',   ru: 'гирлянда' },
    { fr: 'un interrupteur', ru: 'выключатель' },
    { fr: 'une prise',       ru: 'розетка' }
  ],
  taille: [
    { fr: 'XS — très petit',  ru: 'XS — очень малый' },
    { fr: 'S — petit',        ru: 'S — малый' },
    { fr: 'M — moyen',        ru: 'M — средний' },
    { fr: 'L — grand',        ru: 'L — большой' },
    { fr: 'XL — très grand',  ru: 'XL — очень большой' },
    { fr: 'XXL — énorme',     ru: 'XXL — огромный' },
    { fr: 'une taille S',     ru: 'размер S' },
    { fr: 'Vous faites quelle taille ?', ru: 'Какой у вас размер?' },
    { fr: 'Je prends la taille 40.', ru: 'Я беру размер 40.' },
    { fr: 'Ça me va très bien.', ru: 'Это мне очень подходит.' }
  ]
};

/* Приклеиваем: сначала дополнения к старым темам, потом новые темы.
   Порядок важен — дополнения идут первыми, чтобы слова оказались
   рядом со своими старыми словами, а не в конце списка. */
(function () {
  if (typeof FR === 'undefined' || !FR.micro) return;
  const add = FR.microAdd || {};
  FR.micro.forEach(function (sec) {
    const more = add[sec.id];
    if (more) Array.prototype.push.apply(sec.rows, more);
  });
  Array.prototype.push.apply(FR.micro, FR.microMore || []);
})();
