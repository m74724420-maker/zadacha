/* =============================================================
   МИКРО-ТЕМЫ — слова по темам

   Не грамматика, а просто слова, которые всегда нужны и которые
   нигде больше не встречаются: дни недели, месяцы, цвета, месяцы,
   мебель, профессии. Учить их по одному в уроке бессмысленно —
   они приходят пачками.

   Формат:
     rows — {fr, ru}; каждая говорится касанием;
     extra — то, что важно знать про тему (произношение, исключение).

   Как добавить тему: допишите объект в этот массив.
   ============================================================= */

FR.micro = [
  {
    id: 'jours', emoji: '📅', title: 'Дни недели',
    note: 'Дни недели во французском всегда мужского рода: le lundi. '
        + 'Все они кончаются на -di, и это легко запоминается.',
    rows: [
      { fr: 'lundi',    ru: 'понедельник' },
      { fr: 'mardi',    ru: 'вторник' },
      { fr: 'mercredi', ru: 'среда' },
      { fr: 'jeudi',    ru: 'четверг' },
      { fr: 'vendredi', ru: 'пятница' },
      { fr: 'samedi',   ru: 'суббота' },
      { fr: 'dimanche', ru: 'воскресенье' },
      { fr: 'le week-end', ru: 'выходные' }
    ]
  },
  {
    id: 'mois', emoji: '🗓', title: 'Месяцы',
    note: 'Все месяцы — мужского рода, без артикля в датах: '
        + 'le 5 mars. Произношение местами не по правилам — слушайте.',
    rows: [
      { fr: 'janvier',   ru: 'январь' },
      { fr: 'février',   ru: 'февраль' },
      { fr: 'mars',      ru: 'март' },
      { fr: 'avril',     ru: 'апрель' },
      { fr: 'mai',       ru: 'май' },
      { fr: 'juin',      ru: 'июнь' },
      { fr: 'juillet',   ru: 'июль' },
      { fr: 'août',      ru: 'август' },
      { fr: 'septembre', ru: 'сентябрь' },
      { fr: 'octobre',   ru: 'октябрь' },
      { fr: 'novembre',  ru: 'ноябрь' },
      { fr: 'décembre',  ru: 'декабрь' }
    ]
  },
  {
    id: 'couleurs', emoji: '🎨', title: 'Цвета',
    note: 'Женского рода: la couleur. Прилагательное-цвет тоже женского: '
        + 'une robe bleue.',
    rows: [
      { fr: 'rouge',     ru: 'красный' },
      { fr: 'bleu',      ru: 'синий' },
      { fr: 'blanc',     ru: 'белый' },
      { fr: 'noir',      ru: 'чёрный' },
      { fr: 'vert',      ru: 'зелёный' },
      { fr: 'jaune',     ru: 'жёлтый' },
      { fr: 'orange',    ru: 'оранжевый' },
      { fr: 'violet',    ru: 'фиолетовый' },
      { fr: 'rose',      ru: 'розовый' },
      { fr: 'marron',    ru: 'коричневый' },
      { fr: 'gris',      ru: 'серый' },
      { fr: 'beige',     ru: 'бежевый' }
    ]
  },
  {
    id: 'animaux', emoji: '🐾', title: 'Животные',
    note: 'Женского рода, если самка: le chat / la chatte. '
        + 'Самое частое: un chien, un chat, un cheval.',
    rows: [
      { fr: 'un chien',   ru: 'собака' },
      { fr: 'un chat',    ru: 'кот' },
      { fr: 'un cheval',  ru: 'лошадь' },
      { fr: 'un oiseau',  ru: 'птица' },
      { fr: 'un poisson', ru: 'рыба' },
      { fr: 'une souris', ru: 'мышь' },
      { fr: 'un lapin',   ru: 'заяц' },
      { fr: 'une vache',  ru: 'корова' },
      { fr: 'un mouton',  ru: 'овца' },
      { fr: 'une abeille', ru: 'пчела' }
    ]
  },
  {
    id: 'appareils', emoji: '📱', title: 'Телефон и техника',
    note: 'Всё мужского рода. Телефон во французском — masculine, '
        + 'хотя слово общего рода в русском.',
    rows: [
      { fr: 'un téléphone',    ru: 'телефон' },
      { fr: 'un ordinateur',   ru: 'компьютер' },
      { fr: 'une tablette',    ru: 'планшет' },
      { fr: 'un chargeur',     ru: 'зарядка' },
      { fr: 'un casque',       ru: 'наушники' },
      { fr: 'une caméra',      ru: 'камера' },
      { fr: 'une machine à laver', ru: 'стиральная машина' },
      { fr: 'un réfrigérateur', ru: 'холодильник' },
      { fr: 'un micro-ondes',  ru: 'микроволновка' },
      { fr: 'un bouilloire',    ru: 'чайник' }
    ]
  },
  {
    id: 'criminels', emoji: '🚓', title: 'Что сделали',
    note: 'Глаголы в прошедшем времени. Мужского рода — действие, '
        + 'женского — человек: «le vol» (кража), «la voleuse» (воровка).',
    rows: [
      { fr: 'le vol',         ru: 'кража' },
      { fr: 'le cambriolage', ru: 'взлом' },
      { fr: 'l’arnaque',      ru: 'мошенничество' },
      { fr: 'la fraude',      ru: 'подделка' },
      { fr: 'l’escroquerie',  ru: 'обман, развод' },
      { fr: 'le vandalisme',  ru: 'вандализм' },
      { fr: 'la contrebande', ru: 'контрабанда' },
      { fr: 'l’assassinat',    ru: 'убийство' },
      { fr: 'le vol de voiture', ru: 'угон автомобиля' }
    ]
  },
  {
    id: 'meuble', emoji: '🛋', title: 'Дом и мебель',
    note: 'Собирается из «une pièce» (комната) и мебели. '
        + 'Le rez-de-chaussée — первый этаж.',
    rows: [
      { fr: 'une maison',    ru: 'дом' },
      { fr: 'un appartement', ru: 'квартира' },
      { fr: 'une pièce',     ru: 'комната' },
      { fr: 'une cuisine',   ru: 'кухня' },
      { fr: 'une salle de bains', ru: 'ванная' },
      { fr: 'une chambre',   ru: 'спальня' },
      { fr: 'un lit',        ru: 'кровать' },
      { fr: 'une table',     ru: 'стол' },
      { fr: 'une chaise',    ru: 'стул' },
      { fr: 'un armoire',    ru: 'шкаф' },
      { fr: 'un canapé',     ru: 'диван' },
      { fr: 'une fenêtre',   ru: 'окно' },
      { fr: 'une porte',     ru: 'дверь' },
      { fr: 'l’ascenseur',   ru: 'лифт' }
    ]
  },
  {
    id: 'professions', emoji: '👩‍⚕️', title: 'Профессии',
    note: 'Все женского рода на -e: la médecin, la professeur. '
        + 'Говорят «Je suis…», без артикля.',
    rows: [
      { fr: 'un médecin',     ru: 'врач' },
      { fr: 'un professeur',  ru: 'учитель' },
      { fr: 'un ingénieur',   ru: 'инженер' },
      { fr: 'une infirmière', ru: 'медсестра' },
      { fr: 'un avocat',      ru: 'адвокат' },
      { fr: 'une vendeuse',   ru: 'продавщица' },
      { fr: 'une cuisinière', ru: 'повариха' },
      { fr: 'un coiffeur',    ru: 'парикмахер' },
      { fr: 'une pharmacienne', ru: 'фармацевт' },
      { fr: 'un jardinier',  ru: 'садовник' },
      { fr: 'un électricien', ru: 'электрик' }
    ]
  },
  {
    id: 'ecole', emoji: '🎒', title: 'Школа: уроки и принадлежности',
    note: 'Школа — l’école, урок — le cours (он же «курс»). '
        + 'Перед уроком: «le cours de français».',
    rows: [
      { fr: 'l’école',      ru: 'школа' },
      { fr: 'le cours',      ru: 'урок, курс' },
      { fr: 'la classe',     ru: 'класс' },
      { fr: 'le professeur',  ru: 'учитель' },
      { fr: 'l’élève',       ru: 'ученик' },
      { fr: 'le cours de français', ru: 'урок французского' },
      { fr: 'le cahier',     ru: 'тетрадь' },
      { fr: 'le stylo',      ru: 'ручка' },
      { fr: 'la règle',      ru: 'линейка' },
      { fr: 'la gomme',      ru: 'ластик' },
      { fr: 'le crayon',     ru: 'карандаш' },
      { fr: 'le cartable',   ru: 'портфель' },
      { fr: 'le sac à dos',  ru: 'рюкзак' },
      { fr: 'le tableau',    ru: 'доска' }
    ]
  },
  {
    id: 'apparence', emoji: '🧑', title: 'Внешность',
    note: 'Прилагательные согласуются с человеком. '
        + '«Elle est belle» — «Она красивая».',
    rows: [
      { fr: 'grand',     ru: 'высокий, большой' },
      { fr: 'petit',     ru: 'маленький' },
      { fr: 'jeune',     ru: 'молодой' },
      { fr: 'vieux',     ru: 'старый' },
      { fr: 'mince',     ru: 'худой' },
      { fr: 'fort',      ru: 'полный, крепкий' },
      { fr: 'joli',      ru: 'красивый' },
      { fr: 'beau',      ru: 'красивый (он)' },
      { fr: 'belle',     ru: 'красивая (она)' },
      { fr: 'cheveux gris', ru: 'седые волосы' },
      { fr: 'les yeux bleus', ru: 'голубые глаза' }
    ]
  },
  {
    id: 'corps', emoji: '🖐', title: 'Тело',
    note: 'Часто говорят «j’ai mal à…» — у меня болит. '
        + 'Часть тела женского рода, но «à la» звучит одинаково.',
    rows: [
      { fr: 'la tête',      ru: 'голова' },
      { fr: 'le visage',    ru: 'лицо' },
      { fr: 'les yeux',     ru: 'глаза' },
      { fr: 'le nez',       ru: 'нос' },
      { fr: 'la bouche',    ru: 'рот' },
      { fr: 'les oreilles', ru: 'уши' },
      { fr: 'le cou',       ru: 'шея' },
      { fr: 'l’épaule',     ru: 'плечо' },
      { fr: 'le bras',      ru: 'рука' },
      { fr: 'la main',      ru: 'кисть' },
      { fr: 'le ventre',    ru: 'живот' },
      { fr: 'la jambe',     ru: 'нога' },
      { fr: 'le pied',      ru: 'нога (ступня)' },
      { fr: 'J’ai mal à la gorge.', ru: 'У меня болит горло.' }
    ]
  },
  {
    id: 'materiau', emoji: '🧱', title: 'Материалы',
    note: 'Все мужского рода, кроме «la pierre» и «la terre» (камень, земля). '
        + '«en» + материал: «en bois» — деревянный.',
    rows: [
      { fr: 'le bois',      ru: 'дерево' },
      { fr: 'le métal',     ru: 'металл' },
      { fr: 'le plastique', ru: 'пластик' },
      { fr: 'le verre',     ru: 'стекло' },
      { fr: 'le papier',    ru: 'бумага' },
      { fr: 'la pierre',    ru: 'камень' },
      { fr: 'le coton',     ru: 'хлопок' },
      { fr: 'la laine',     ru: 'шерсть' },
      { fr: 'le cuir',      ru: 'кожа' },
      { fr: 'la terre',     ru: 'земля, глина' }
    ]
  },
  {
    id: 'taille', emoji: '📏', title: 'Размеры',
    note: 'Одежду меряют по росту во французском — точнее, чем в русском. '
        + '«Je fais du 38» — мой размер 38.',
    rows: [
      { fr: 'petit',   ru: 'малый' },
      { fr: 'moyen',   ru: 'средний' },
      { fr: 'grand',   ru: 'большой' },
      { fr: 'Je fais du 38.',  ru: 'Мой размер 38.' },
      { fr: 'Je fais du 40, j’ai besoin du 41.', ru: 'Носю 40, мне нужен 41.' },
      { fr: 'C’est trop grand pour moi.', ru: 'Это слишком велико для меня.' },
      { fr: 'C’est trop petit.', ru: 'Это слишком мало.' },
      { fr: 'Ça me va.', ru: 'Это мне подходит.' }
    ]
  }
];
