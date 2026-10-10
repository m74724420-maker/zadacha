/* =============================================================
   Логические задачки — логика сайта
   ============================================================= */

/* ---------------- ХРАНИЛИЩЕ ---------------- */
function storeGet(k, def) {
  try { const v = localStorage.getItem('lz_' + k); return v === null ? def : JSON.parse(v); }
  catch (e) { return def; }
}
function storeSet(k, v) {
  try { localStorage.setItem('lz_' + k, JSON.stringify(v)); } catch (e) { }
}

/* Повышение шрифта кнопкой «Увеличить» живёт только до конца сеанса:
   закроете вкладку — вернётся обычный размер. */
function sessGet(k, def) {
  try { const v = sessionStorage.getItem('lz_' + k); return v === null ? def : Number(v); }
  catch (e) { return def; }
}
function sessSet(k, v) {
  try { sessionStorage.setItem('lz_' + k, String(v)); } catch (e) { }
}

/* Если раньше была голубая тема (её убрали) — переходим на оранжевую */
const savedTheme = storeGet('theme', 'yellow');
if (savedTheme === 'blue') {
  storeSet('theme', 'orange');
  storeSet('themeWasBlue', 1);
}

const state = {
  theme: savedTheme === 'blue' ? 'orange' : savedTheme,
  fontSize: storeGet('fontSize', 20),
  /* прибавка к шрифту от кнопки «Увеличить» — только на эту сессию */
  fsBoost: sessGet('fsBoost', 0),
  chessBoard: storeGet('chessBoard', 'green'),
  chessPieces: storeGet('chessPieces', 'solid'),
  profile: storeGet('profile', null),
  profiles: storeGet('profiles', []),
  visits: storeGet('visits', 0),
  task: null,
  /* состояние текущей игры */
  game: null
};

/* общий рейтинг и статистика из базы (заполняются при входе) */
let dbRanked = null;
let dbStats = null;

/* ---------------- ТЕМЫ ---------------- */
const THEMES = [
  { id: 'yellow', name: 'Жёлтая (для глаз)' },
  { id: 'orange', name: 'Оранжевая (тёплая)' },
  { id: 'light', name: 'Светлая (белая)' },
  { id: 'dark', name: 'Тёмная (блокнот)' }
];

function applyTheme() {
  document.body.dataset.theme = state.theme;
  document.documentElement.style.setProperty('--fs', realFontSize() + 'px');
  const v = document.getElementById('fsVal'); if (v) v.textContent = realFontSize();
  const r = document.getElementById('fsRange'); if (r) r.value = state.fontSize;
  updateSoundButton();
  updateMelodyName();
  updateFontPlusBtn();
  /* Размер шахматной доски здесь НЕ пересчитываем. Он считается один
     раз при открытии задачи. Если пересчитывать при смене шрифта,
     доска то увеличивалась, то оставалась прежней, а страница меняла
     высоту — от этого «увеличить» и «уменьшить» работали рывками. */
}

/* Размер шрифта, который видит человек: обычный плюс прибавка
   от кнопки «Увеличить» на панели задач. */
function realFontSize() {
  return state.fontSize + (state.fsBoost || 0);
}

/* Кнопки «Увеличить» и «Уменьшить» в шапке задачи. Прибавка живёт
   только до конца сессии: ползунок в настройках меняет размер навсегда,
   а эти кнопки — «на сейчас, чтобы прочитать или увидеть всё целиком».
   Уменьшить можно до −4 от обычного размера: мельче текст становится
   нечитаемым, а на телефоне ещё и не попасть пальцем. */
const FS_STEP = 2, FS_BOOST_MAX = 8, FS_SHRINK_MIN = -4;

function updateFontPlusBtn() {
  const plus = document.getElementById('fontPlusBtn');
  const minus = document.getElementById('fontMinusBtn');
  const boost = state.fsBoost || 0;
  if (plus) {
    plus.textContent = '🔍 Увеличить' + (boost > 0 ? ' (+' + boost + ')' : '');
    plus.disabled = boost >= FS_BOOST_MAX;
    plus.title = plus.disabled
      ? 'Больше увеличить нельзя'
      : 'В этой сессии шрифт станет на ' + (boost + FS_STEP) + ' больше';
  }
  if (minus) {
    minus.textContent = '🔎 Уменьшить' + (boost < 0 ? ' (' + boost + ')' : '');
    minus.disabled = boost <= FS_SHRINK_MIN;
    minus.title = minus.disabled
      ? 'Мельче уже некуда — текст станет нечитаемым'
      : 'В этой сессии шрифт станет на ' + (boost - FS_STEP) + ' меньше';
  }
}

document.getElementById('fontPlusBtn').addEventListener('click', function () {
  const boost = state.fsBoost || 0;
  if (boost >= FS_BOOST_MAX) {
    toast('Больше увеличить нельзя. Настройте шрифт в профиле — там он сохранится.');
    return;
  }
  state.fsBoost = boost + FS_STEP;
  sessSet('fsBoost', state.fsBoost);
  applyTheme();
  toast('Шрифт увеличен. Это держится, пока открыта вкладка.');
});

document.getElementById('fontMinusBtn').addEventListener('click', function () {
  const boost = state.fsBoost || 0;
  if (boost <= FS_SHRINK_MIN) {
    toast('Мельче уже некуда. Настройте шрифт в профиле — там он сохранится.');
    return;
  }
  state.fsBoost = Math.max(FS_SHRINK_MIN, boost - FS_STEP);
  sessSet('fsBoost', state.fsBoost);
  applyTheme();
  toast('Шрифт уменьшен. Это держится, пока открыта вкладка.');
});

/* ---------------- ПРИВЕТСТВИЕ, НАДПИСИ, ПЕЙЗАЖИ ---------------- */
const GREETINGS = ['Здравствуйте!', 'Приветствую!', 'Здравствуйте, дорогие друзья!'];

const CAPTIONS = [
  'Мозг любит трудности. Каждая задачка — маленькая тренировка для него.',
  'Решённая задача — это как утренняя зарядка для ума.',
  'Не торопитесь. Мозг любит думать без спешки.',
  'Даже самая лёгкая задачка заставляет мозг работать, а это полезно в любом возрасте.',
  'Умение думать — это мышца. Тренируйте её каждой задачкой.'
];

/* природные места (статьи Википедии с фотографией) */
const PLACES = [
  'Байкал', 'Камчатка', 'Карелия', 'Ладожское озеро',
  'Кольский полуостров', 'Сочи', 'Валдай', 'Алтай'
];

/* Пейзаж на стартовом экране.
   Картинка приходит из Википедии — это внешний сервер. Раньше мы ждали
   его ответа и делали три попытки подряд, из-за чего на телефоне
   надпись «Рисую пейзаж…» могла висеть минуту, а экран выглядел пустым.

   Теперь:
   - ждём не больше 4 секунд, и всё. Дальше — просто свой пейзаж;
   - повторных попыток нет: одна попытка, чтобы не задерживать;
   - если Википедия недоступна (или её блокируют, как бывает у
     некоторых операторов), показываем нарисованный нами осенний фон.
   На кнопку «Начать» это не влияет: она работает в любом случае,
   пейзаж лишь украшение. */

/* Запасной пейзаж: осенние деревья, нарисованные прямо в CSS.
   Нужен на случай, когда картинка из интернета не дошла. */
const PLACE_STYLE = 'linear-gradient(180deg,#bfe3f2 0%,#e8f2f7 45%,#f7e6b8 100%)';

async function loadPlace() {
  const place = document.getElementById('startPlace');
  const box = document.getElementById('startPhoto');
  if (!place || !box) return;

  /* сразу показываем свой фон, чтобы экран никогда не был пустым */
  box.style.backgroundImage = PLACE_STYLE;

  const title = pickArr(PLACES);
  place.textContent = 'Рисую пейзаж…';

  try {
    /* ждём Википедию не дольше 4 секунд: медленный интернет не должен
       задерживать сайт. Если времени не хватило — останется свой фон. */
    const timer = new Promise((_, reject) => setTimeout(() => reject(new Error('долго')), 4000));
    const url = 'https://ru.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
    const res = await Promise.race([fetch(url), timer]);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const src = (data.originalimage && data.originalimage.source) ||
      (data.thumbnail && data.thumbnail.source);
    if (!src) throw new Error('нет картинки');
    box.style.backgroundImage = 'url("' + src + '")';
    place.textContent = (data.description ? data.description + ' · ' : '') + title;
  } catch (e) {
    /* не беда: свой фон уже нарисован, экран выглядит хорошо.
       Пишем только то, что по-русски и понятно. */
    place.textContent = 'осенний пейзаж · ' + title;
  }
}

function pickArr(a) { return a[Math.floor(Math.random() * a.length)]; }

/* ---------------- ОСЕННИЕ ДЕРЕВЬЯ НА ФОНЕ ГЛАВНОГО ЭКРАНА ---------------- */
/* Несколько осенних фото из Википедии (со всего мира) меняются по
   очереди. Подписи нет — просто картинка. Если интернет недоступен,
   остаётся мягкий градиент темы, ничего не ломается. */
const AUTUMN_PHOTOS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Tofukuji-autumn-foliage-2017-Luka-Peternel.jpg/1280px-Tofukuji-autumn-foliage-2017-Luka-Peternel.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Fagus_sylvatica_with_autumn_leaf_color_in_Biosph%C3%A4renreservat_Rh%C3%B6n_-_Still.jpg/1280px-Fagus_sylvatica_with_autumn_leaf_color_in_Biosph%C3%A4renreservat_Rh%C3%B6n_-_Still.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Autumn_trees_along_a_park_road%2C_Quebec_City.png/1280px-Autumn_trees_along_a_park_road%2C_Quebec_City.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Autumn_afternoon_in_Wittelsbacher_Park%2C_Augsburg_%282015%29.jpg/1280px-Autumn_afternoon_in_Wittelsbacher_Park%2C_Augsburg_%282015%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/C%C4%93sis%2C_rudens._Autumn_-_panoramio.jpg/1280px-C%C4%93sis%2C_rudens._Autumn_-_panoramio.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Forest_path_through_yellow_autumn_leaves_in_Tuntorp_1.jpg/1280px-Forest_path_through_yellow_autumn_leaves_in_Tuntorp_1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Fall_foliage_Autumn_Newton_Massachusetts.jpg/1280px-Fall_foliage_Autumn_Newton_Massachusetts.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/2025_Platanus_x_hispanica_._Alameda_de_Santiago_de_Compostela_1.jpg/1280px-2025_Platanus_x_hispanica_._Alameda_de_Santiago_de_Compostela_1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Row_of_Trees_in_Autumn.jpg/1280px-Row_of_Trees_in_Autumn.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Tree_in_golden_autumn_colour%2C_Quebec_City.jpg/1280px-Tree_in_golden_autumn_colour%2C_Quebec_City.jpg'
];

let autumnTimer = null;
let autumnIndex = -1;

function loadAutumnPhoto() {
  const box = document.getElementById('mainBg');
  if (!box) return;
  /* показываем следующую по кругу, не повторяя предыдущую */
  let next = Math.floor(Math.random() * AUTUMN_PHOTOS.length);
  if (next === autumnIndex) next = (next + 1) % AUTUMN_PHOTOS.length;
  autumnIndex = next;
  const url = AUTUMN_PHOTOS[next];
  /* сначала убеждаемся, что картинка грузится: иначе остаётся
     старая, а не пустое место */
  const img = new Image();
  img.onload = function () {
    box.style.setProperty('--autumn', 'url("' + url + '")');
    box.classList.add('ready');
  };
  img.onerror = function () { /* не загрузилась — тихо пропускаем */ };
  img.src = url;
}

function startAutumnPhotos() {
  if (autumnTimer) return;
  loadAutumnPhoto();
  autumnTimer = setInterval(loadAutumnPhoto, 16000);
}

/* Пейзаж на фоне экрана задачи: картинка из Википедии, а если она не
   загрузилась — остаётся мягкий градиент. Затемнение зависит от темы,
   чтобы текст и бумага всегда читались. */
let gamePhotoLoaded = false;

function loadGamePhoto() {
  if (gamePhotoLoaded) return;
  gamePhotoLoaded = true;
  const box = document.getElementById('gameBg');
  if (!box) return;
  const title = pickArr(PLACES);
  fetch('https://ru.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title))
    .then(r => { if (!r.ok) throw new Error('нет картинки'); return r.json(); })
    .then(data => {
      const src = (data.originalimage && data.originalimage.source) ||
        (data.thumbnail && data.thumbnail.source);
      if (src) box.style.setProperty('--photo', 'url("' + src + '")');
    })
    .catch(function () { /* остаётся градиент — это не беда */ });
}

/* ---------------- ПРОФИЛИ ---------------- */
/* Имя придумывается отдельно — по цветам или по машинам с рыбалкой,
   см. randomNick ниже. Старые списки оставлены для уже созданных
   профилей, у которых имени может не быть. */
const NICK_ADJ = ['Умный', 'Любознательный', 'Внимательный', 'Спокойный', 'Находчивый',
  'Упорный', 'Добрый', 'Ясный', 'Увлечённый', 'Весёлый'];
const NICK_NOUN = ['Ёж', 'Сова', 'Дуб', 'Кедр', 'Орёл', 'Компас', 'Фонарь', 'Ключ',
  'Бобр', 'Голубь', 'Дельфин', 'Барсук', 'Пингвин', 'Орех'];

function saveProfile(p) {
  state.profile = p;
  state.profiles = state.profiles.filter(x => x.id !== p.id);
  state.profiles.push(p);
  storeSet('profile', p);
  storeSet('profiles', state.profiles);
  /* отправляем в общую базу (если она доступна) */
  if (typeof db !== 'undefined' && db.ok) db.saveProfile(p);
}

function solvedCount(p) { return (p.solved || []).length; }

/* рейтинг: места по числу решённых задач (пока только на этом устройстве) */
function ratingList() {
  return state.profiles.slice().sort((a, b) => solvedCount(b) - solvedCount(a)).slice(0, 50);
}
function myPlace() {
  if (!state.profile) return null;
  const list = ratingList();
  const i = list.findIndex(p => p.id === state.profile.id);
  return i < 0 ? null : i + 1;
}

/* ---------------- ЭКРАНЫ ---------------- */
function show(id) {
  ['screenStart', 'screenAgree', 'screenNew', 'screenMain', 'screenGame',
    'screenProfile', 'screenTasks']
    .forEach(s => { document.getElementById(s).hidden = s !== id; });
  const nav = document.getElementById('bottomNav');
  nav.hidden = !(id === 'screenMain' || id === 'screenGame' || id === 'screenTasks');
  window.scrollTo(0, 0);
}

/* ---------------- ВХОД НА САЙТ ----------------
   Отдельного стартового экрана с кнопкой «Начать» больше нет: на
   телефонах он не открывался — экран появлялся, а кнопка не работала.
   Теперь человек сразу попадает на экран согласия, где рядом стоят
   приветствие, пейзаж и кнопка «Начать решать». Ничего лишнего между
   ними нет, а значит, и ломаться нечему.

   Вернувшийся посетитель, у которого профиль есть и политика принята,
   сразу видит задачи. */
function enterSite() {
  const g = document.getElementById('startGreeting');
  if (g) g.textContent = pickArr(GREETINGS);
  const cap = document.getElementById('startCaption');
  if (cap) cap.textContent = pickArr(CAPTIONS);
  state.visits = storeGet('visits', 0) + 1;
  storeSet('visits', state.visits);
  loadPlace();

  if (state.profile && storeGet('policyAccepted', 0)) greetMain();
  else agreeScreen();
}

/* ---------------- СОГЛАСИЕ С ПОЛИТИКОЙ ---------------- */
/* Показывается только при самом первом заходе. Текст политики целиком
   написан прямо на этом экране, поэтому отдельной ссылки не нужно.
   Нажатие на «Начать решать» — согласие: дальше сразу создаётся
   профиль, а не открывается пустой главный экран. */
function agreeScreen() {
  show('screenAgree');
}

function acceptPolicy() {
  storeSet('policyAccepted', 1);
  /* новый человек — сразу к выбору картинки и возраста;
     вернувшийся — сразу к задачам */
  if (state.profile) greetMain();
  else newProfileScreen();
}

document.getElementById('agreeBtn').addEventListener('click', acceptPolicy);

/* ---------------- КАРТИНКИ И ДОБРЫЕ ИМЕНА ---------------- */
/* Фотографии нет — только рисованные картинки: два человека, звери,
   дерево и еда. Это не личные данные, поэтому их не жалко держать
   в общем рейтинге. */
const AVATARS = [
  { id: 'babushka', emoji: '👵', name: 'Бабушка' },
  { id: 'gruzd',    emoji: '👴', name: 'Дед' },
  { id: 'cat',      emoji: '🐱', name: 'Кот' },
  { id: 'dog',      emoji: '🐶', name: 'Собака' },
  { id: 'bird',     emoji: '🐦', name: 'Птичка' },
  { id: 'tree',     emoji: '🌳', name: 'Дерево' },
  { id: 'apple',    emoji: '🍎', name: 'Яблоко' }
];

/* имена придумываются по полу, и разница должна быть сразу видна:
   женщинам — прилагательное и слово про цветы или ягоды, часто с
   ласкательным окончанием (Розочка, Сиренька); мужчинам — прилагательное
   и слово про машины, рыбалку, лес или погоду, без уменьшительных
   (Рыбак, Катерок). Словари раздельные и не пересекаются: «Гроза»
   женского рода в мужские попасть не может, иначе вышло бы «Бодрый Гроза».
   Настоящих имён здесь нет намеренно: человек, которого зовут Олег,
   не должен видеть на сайте «Митя». */
const NICK_F_ADJ = ['Нежная', 'Добрая', 'Тихая', 'Мягкая', 'Ласковая', 'Светлая',
  'Уютная', 'Весёлая', 'Тёплая', 'Спокойная', 'Милая', 'Родная', 'Внимательная',
  'Умная', 'Терпеливая', 'Радостная', 'Бережная', 'Верная', 'Кроткая', 'Чуткая'];
/* женского рода: цветы, ягоды, плоды, травы — 50 слов */
const NICK_F_FLOWER = [
  'Розочка', 'Ромашка', 'Календула', 'Сиренька', 'Маковка', 'Гвоздичка',
  'Ириска', 'Одуванчик', 'Незабудка', 'Яблонька', 'Фиалка', 'Ландыш',
  'Лилия', 'Черёмуха', 'Георгина', 'Герани', 'Тюльпан', 'Пион',
  'Астра', 'Гладиолус', 'Настурция', 'Петуния', 'Лаванда', 'Вереск',
  'Брусника', 'Клюква', 'Морошка', 'Голубика', 'Малина', 'Смородина',
  'Клубника', 'Земляника', 'Рябина', 'Калина', 'Крыжовник', 'Слива',
  'Вишня', 'Груша', 'Хурма', 'Айва', 'Сирень', 'Берёза',
  'Липа', 'Осина', 'Полынь', 'Мята', 'Мать-и-мачеха', 'Кувшинка',
  'Подсолнух', 'Зверобой'
];
const NICK_M_ADJ = ['Крепкий', 'Бодрый', 'Спокойный', 'Умелый', 'Вольный', 'Добрый',
  'Верный', 'Упрямый', 'Смелый', 'Тихий', 'Дальний', 'Хмурый',
  'Весёлый', 'Терпеливый', 'Радостный', 'Надёжный', 'Ловкий',
  'Вдумчивый', 'Старый', 'Славный'];
/* только мужского или среднего рода, без уменьшительных: рыбалка,
   техника, лес, погода — 50 слов. Женского рода здесь нет намеренно:
   «Гроза», «Буря» дали бы «Бодрый Гроза». */
const NICK_M_NOUN = [
  'Рыбак', 'Компас', 'Якорь', 'Парус', 'Корвет', 'Катерок', 'Мотор', 'Винт',
  'Рычаг', 'Клин', 'Кедр', 'Кипарис', 'Можжевельник', 'Бамбук', 'Камыш',
  'Тростник', 'Клён', 'Дуб', 'Ёж', 'Волк', 'Орёл', 'Сокол', 'Ястреб',
  'Бобр', 'Олень', 'Лосось', 'Вепрь', 'Гром', 'Мёд', 'Хлеб', 'Чай',
  'Мост', 'Корабль', 'Закат', 'Рассвет', 'Туман', 'Ветер', 'Дождь', 'Град',
  'Снег', 'Лёд', 'Магнит', 'Фонарь', 'Ключ', 'Орех', 'Путь', 'Очаг',
  'Плуг', 'Бур', 'Рожок'
];

function avatarById(id) {
  return AVATARS.find(a => a.id === id) || null;
}

function avatarEmoji(id) {
  const a = avatarById(id);
  return a ? a.emoji : '🌸';
}

function defaultAvatar(gender) {
  return gender === 'm' ? 'gruzd' : 'babushka';
}

/* доброе случайное имя: раздельные словари для женщин и мужчин.
   Пол передаём всегда явно: если забыть, а пол мужской — придумается
   женское имя вроде «Нежная Розочка», и человек увидит не своё. */
function randomNick(gender) {
  if (gender !== 'f' && gender !== 'm') gender = state.profile ? state.profile.gender : 'f';
  if (gender === 'm') return pickArr(NICK_M_ADJ) + ' ' + pickArr(NICK_M_NOUN);
  return pickArr(NICK_F_ADJ) + ' ' + pickArr(NICK_F_FLOWER);
}

const AGE_RANGES = {
  50: '50–59 лет', 60: '60–69 лет', 70: '70–79 лет', 80: '80 лет и старше'
};

/* ---------------- СОЗДАНИЕ И ПРАВКА ПРОФИЛЯ ---------------- */
let draftAvatar = 'babushka';
let draftGender = 'f';
let draftAge = '70';
let profileEdit = false;

function newProfileScreen(edit) {
  profileEdit = !!edit;
  const p = state.profile;
  document.getElementById('newTitle').textContent = edit ? 'Изменить профиль' : 'Придумайте себе имя';
  document.getElementById('newLead').textContent = edit
    ? 'Можно поменять картинку, имя, пол и возраст. Все решённые задачи останутся на месте.'
    : 'Выберите картинку, скажите, кто вы, — и при желании напишите своё имя.';
  document.getElementById('saveProfileBtn').textContent = edit ? 'Сохранить' : 'Начать заниматься';
  document.getElementById('newCancelBtn').hidden = !edit;

  if (edit && p) {
    draftAvatar = avatarById(p.avatar) ? p.avatar : defaultAvatar(p.gender);
    draftGender = p.gender === 'm' ? 'm' : 'f';
    draftAge = AGE_RANGES[p.age] ? String(p.age) : '70';
    /* показываем то имя, которое уже есть, — не выдумываем новое */
    document.getElementById('avatarNamePreview').textContent = p.name || randomNick(draftGender);
  } else {
    draftGender = 'f';
    draftAge = '70';
    draftAvatar = defaultAvatar('f');
  }

  renderProfilePickers(true);
  show('screenNew');
}

function renderProfilePickers(regenerateName) {
  /* картинка в кружке */
  document.getElementById('avatarPreview').textContent = avatarEmoji(draftAvatar);
  /* имя-пример меняем только когда сменился пол или нажата кнопка
     «придумать другое» — от выбора возраста имя не зависит */
  if (regenerateName) {
    document.getElementById('avatarNamePreview').textContent = randomNick(draftGender);
  }

  document.querySelectorAll('#genderRow .pick-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.gender === draftGender);
  });
  document.querySelectorAll('#ageRow .pick-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.age === draftAge);
  });
  const row = document.getElementById('avatarRow');
  row.innerHTML = '';
  AVATARS.forEach(a => {
    const b = document.createElement('button');
    b.className = 'pick-cell' + (a.id === draftAvatar ? ' active' : '');
    b.title = a.name;
    b.textContent = a.emoji;
    b.setAttribute('aria-label', a.name);
    b.dataset.avatar = a.id;          /* чтобы картинку можно было найти и по тестам, и для доступности */
    b.addEventListener('click', function () {
      /* картинка человека сама подсказывает пол: бабушка — женщина,
         дед — мужчина. Поэтому выбор работает с первого раза. */
      let genderChanged = false;
      if (a.id === 'babushka' && draftGender !== 'f') { draftGender = 'f'; genderChanged = true; }
      if (a.id === 'gruzd' && draftGender !== 'm') { draftGender = 'm'; genderChanged = true; }
      draftAvatar = a.id;
      renderProfilePickers(genderChanged);
    });
    row.appendChild(b);
  });
}

document.getElementById('genderRow').addEventListener('click', function (e) {
  const b = e.target.closest('.pick-btn');
  if (!b) return;
  const genderChanged = b.dataset.gender !== draftGender;
  draftGender = b.dataset.gender;
  /* если выбран «человек» другого пола — меняем картинку на подходящую */
  if (draftAvatar === 'gruzd' || draftAvatar === 'babushka') {
    draftAvatar = defaultAvatar(draftGender);
  }
  renderProfilePickers(genderChanged);
});

document.getElementById('ageRow').addEventListener('click', function (e) {
  const b = e.target.closest('.pick-btn');
  if (!b) return;
  draftAge = b.dataset.age;
  renderProfilePickers(false);      /* имя не трогаем */
});

document.getElementById('avatarRandom').addEventListener('click', function () {
  document.getElementById('avatarNamePreview').textContent = randomNick(draftGender);
});

document.getElementById('editProfileBtn').addEventListener('click', function () {
  newProfileScreen(true);
});
document.getElementById('newCancelBtn').addEventListener('click', function () {
  profileEdit = false;
  showProfile();
});

document.getElementById('saveProfileBtn').addEventListener('click', () => {
  /* имени своего написать нельзя — только придуманное сайтом */
  const name = document.getElementById('avatarNamePreview').textContent.trim() || randomNick(draftGender);

  if (profileEdit && state.profile) {
    /* правим существующий профиль: история задач и статистика сохраняются */
    const p = state.profile;
    p.name = name;
    p.gender = draftGender;
    p.age = draftAge;
    p.avatar = draftAvatar;
    p.edited = Date.now();
    saveProfile(p);
    profileEdit = false;
    showProfile();
    return;
  }

  saveProfile({
    id: 'p' + Date.now().toString(36),
    name: name,
    gender: draftGender,
    age: draftAge,
    avatar: draftAvatar,
    created: Date.now(),
    solved: [],
    misses: []
  });
  greetMain();
});
/* ---------------- ГЛАВНЫЙ ЭКРАН ---------------- */
const KINDS = [
  { id: 'matchsticks', emoji: '🪵', name: 'Со спичками', hint: 'Переложите спички, чтобы равенство стало верным' },
  { id: 'sequence', emoji: '🔢', name: 'Закономерность', hint: 'Найдите правило и впишите следующее число' },
  { id: 'sudoku', emoji: '🔲', name: 'Судоку', hint: 'Цифры 1–9, в строке и квадрате не повторяются' },
  { id: 'mines', emoji: '💣', name: 'Сапёр', hint: 'Откройте все клетки, где нет мин' },
  { id: 'chess', emoji: '♟', name: 'Шахматные задачи', hint: 'Найдите ход, который даёт мат чёрным' },
  { id: 'chessbot', emoji: '🤖', name: 'Игра с ботом', hint: 'Сыграйте партию: вы белые, ходит компьютер' }
];

/* ---------------- ЗАДАЧА ДНЯ ---------------- */
/* Одна задача на день: она запоминается, поэтому при повторном заходе
   в тот же день вы увидите ту же самую задачу. */
function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

function dailyTask() {
  const p = state.profile;
  if (!p) return null;
  if (p.daily && p.daily.day === todayKey() && p.daily.task) return p.daily.task;
  /* каждый день — новая задача, выбор по кругу, чтобы было разнообразие */
  const order = ['sequence', 'matchsticks', 'sudoku', 'chess', 'sequence', 'mines'];
  const now = new Date();
  const dayNum = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
  const kind = order[dayNum % order.length];
  const level = 1 + (dayNum % 3);
  let task = null;
  try { task = LZ[kind] ? LZ[kind](level) : (kind === 'chess' ? CH.matePuzzle(level) : null); }
  catch (e) { task = null; }
  if (!task) return null;
  task.daily = true;
  p.daily = { day: todayKey(), kind: kind, level: level, task: task, when: Date.now() };
  saveProfile(p);
  return task;
}

function dailyCard() {
  const card = document.createElement('div');
  card.className = 'task-card card-daily';
  const t = dailyTask();
  if (!t) {
    card.innerHTML = '<h3>📅 Задача дня</h3><p class="task-hint">Сегодня задача не готовилась, выберите любую.</p>';
    return card;
  }
  const k = KINDS.find(x => x.id === t.kind) || { emoji: '⭐' };
  const done = (state.profile.solved || []).some(x => x.id === t.id);
  card.innerHTML = '<h3>📅 Задача дня</h3>' +
    '<p class="task-hint">' + k.emoji + ' ' + t.title + ' · ' + LZ.levelName(t.level) + '</p>' +
    '<div class="level-row"><button class="level-btn wide" id="dailyBtn">' +
    (done ? 'Пройти заново' : 'Начать') + '</button></div>';
  card.querySelector('#dailyBtn').addEventListener('click', () => openTask(t.kind, t.level, t));
  return card;
}

/* ---------------- ВОЗВРАТ К ОШИБКАМ ---------------- */
/* Запоминаем задачи, которые не получились: пользователь посмотрел
   разбор или ушёл к другой задаче, не решив эту. */
function markMiss() {
  const p = state.profile, t = state.task;
  if (!p || !t || t.daily) return;
  p.misses = p.misses || [];
  if (p.misses.some(x => x.kind === t.kind && x.level === t.level)) return;
  p.misses.push({ kind: t.kind, level: t.level, title: t.title, when: Date.now() });
  if (p.misses.length > 20) p.misses = p.misses.slice(-20);
  saveProfile(p);
}

function clearMiss(kind, level) {
  const p = state.profile;
  if (!p || !p.misses) return;
  p.misses = p.misses.filter(x => !(x.kind === kind && x.level === level));
  saveProfile(p);
}

function missesCard() {
  const card = document.createElement('div');
  card.className = 'task-card card-misses';
  const p = state.profile;
  const list = (p && p.misses) || [];
  if (!list.length) { card.hidden = true; return card; }
  const last = list[list.length - 1];
  const k = KINDS.find(x => x.id === last.kind) || { emoji: '⭐', name: last.kind };
  card.innerHTML = '<h3>🔁 Вернуться к ошибкам</h3>' +
    '<p class="task-hint">Не получилось: ' + k.emoji + ' ' + k.name + ' · ' + LZ.levelName(last.level) +
    ' — всего таких: ' + list.length + '</p>' +
    '<div class="level-row"><button class="level-btn wide" id="missBtn">Попробовать снова</button></div>';
  card.querySelector('#missBtn').addEventListener('click', () => openTask(last.kind, last.level));
  return card;
}

/* ---------------- ПАПКА «МОИ ЗАДАЧИ» ---------------- */
let tasksFilter = 'all';

function showMyTasks() {
  const p = state.profile;
  if (!p) { newProfileScreen(); return; }

  /* фильтр по игре */
  const filter = document.getElementById('tasksFilter');
  filter.innerHTML = '';
  const kinds = ['all'].concat(KINDS.map(k => k.id).filter(id => id !== 'chessbot'));
  kinds.forEach(id => {
    const b = document.createElement('button');
    b.className = 'level-btn' + (tasksFilter === id ? ' active' : '');
    const k = KINDS.find(x => x.id === id);
    b.textContent = id === 'all' ? 'Все' : (k ? k.emoji + ' ' + k.name : id);
    b.addEventListener('click', function () { tasksFilter = id; showMyTasks(); });
    filter.appendChild(b);
  });

  const list = document.getElementById('tasksList');
  list.innerHTML = '';
  const solved = (p.solved || []).slice().sort((a, b) => b.when - a.when)
    .filter(s => tasksFilter === 'all' || s.kind === tasksFilter);

  document.getElementById('tasksLead').textContent = solved.length
    ? 'Решено задач: ' + solved.length + '. Любую можно открыть и пройти заново.'
    : 'Здесь появятся все решённые задачи. Решите что-нибудь — и запись останется здесь.';

  if (!solved.length) {
    list.innerHTML = '<p class="small-note">Пока пусто. Начните с любой задачки на главном экране.</p>';
    show('screenTasks');
    return;
  }

  let lastDay = '';
  solved.forEach(s => {
    const d = new Date(s.when);
    const day = d.toLocaleDateString('ru-RU');
    if (day !== lastDay) {
      lastDay = day;
      const h = document.createElement('p');
      h.className = 'small-note';
      h.style.margin = '.8rem 0 .2rem';
      h.textContent = day;
      list.appendChild(h);
    }
    const k = KINDS.find(x => x.id === s.kind);
    const div = document.createElement('div');
    div.className = 'solved-item';
    /* у «закономерности» сами числа хранятся отдельно от вопроса —
       покажем их, чтобы задача была понятна без открытия */
    const extra = (s.kind === 'sequence' && s.data && s.data.seq)
      ? '<div class="si-title">' + s.data.seq.join(' · ') + ' · ?</div>' : '';
    div.innerHTML =
      '<div class="si-head"><span>' + (k ? k.emoji + ' ' + esc(s.title) : esc(s.title)) + '</span><span>' +
      LZ.levelName(s.level) + '</span></div>' +
      extra +
      '<div class="si-title">' + esc(s.question) + '</div>' +
      '<div class="si-answer">Ответ: ' + esc(s.answer) + '</div>';
    const row = document.createElement('p');
    row.className = 'si-actions';
    const again = document.createElement('button');
    again.className = 'link-btn';
    again.textContent = 'Пройти заново';
    again.addEventListener('click', function () { openSavedTask(s); });
    const sol = document.createElement('button');
    sol.className = 'link-btn';
    sol.textContent = 'Показать разбор';
    sol.addEventListener('click', function () {
      document.getElementById('solutionBox').hidden = false;
      const ol = document.getElementById('solutionSteps');
      ol.innerHTML = '';
      (s.steps || []).forEach(x => {
        const li = document.createElement('li'); li.textContent = x; ol.appendChild(li);
      });
      document.getElementById('solutionAnswer').textContent = s.answer;
      show('screenGame');
      document.getElementById('gameTitle').textContent = s.title;
    });
    row.appendChild(again);
    row.appendChild(sol);
    div.appendChild(row);
    list.appendChild(div);
  });
  show('screenTasks');
}

/* открыть сохранённую задачу заново */
function openSavedTask(rec) {
  const data = rec.data || {};
  const task = {
    id: 're' + Date.now().toString(36),
    kind: rec.kind,
    level: rec.level,
    title: rec.title,
    question: rec.question,
    data: data,
    answer: rec.answer,
    answerText: rec.answer,
    steps: rec.steps || []
  };
  if (rec.kind === 'chess') { task.solution = (rec.solution || []).slice(); }
  if (rec.kind === 'matchsticks') { task.solution = null; }
  if (rec.kind === 'sequence') { task.solution = null; }
  openTask(rec.kind, rec.level, task);
}

document.getElementById('navMyTasks').addEventListener('click', showMyTasks);
document.getElementById('tasksBack').addEventListener('click', greetMain);

/* ---------------- ЗВУКИ ---------------- */
/* Тихий «щёлк» при ходе и приятный сигнал при успехе. Звук выключается
   в профиле. Браузеры не дают играть звук, пока пользователь не нажал
   на страницу, поэтому «разблокируем» звук самым первым касанием. */
let audioCtx = null;
/* все звуки, которые сейчас звучат: чтобы новый не наложился на старый */
let activeNodes = [];

function silenceSounds() {
  for (const n of activeNodes) {
    try { n.stop(); } catch (e) { /* уже остановился */ }
  }
  activeNodes = [];
}

function audioUnlock() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { /* звук не доступен — работаем молча */ }
}
document.addEventListener('pointerdown', audioUnlock, { once: true });
document.addEventListener('keydown', audioUnlock, { once: true });

function sfx(kind) {
  if (!storeGet('sound', true)) return;
  audioUnlock();
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); return; }
    silenceSounds();                  /* новый звук всегда начинается с чистого места */
    const now = audioCtx.currentTime;
    if (kind === 'win' || kind === 'mate') {
      /* три мягкие ноты вместо одного короткого писка */
      const base = kind === 'mate' ? 523.25 : 392;
      const melody = [[base, 0], [base * 1.26, 0.13], [base * 1.5, 0.26]];
      melody.forEach(pair => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.value = pair[0];
        g.gain.setValueAtTime(0.0001, now + pair[1]);
        g.gain.linearRampToValueAtTime(0.2, now + pair[1] + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + pair[1] + 0.5);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(now + pair[1]);
        o.stop(now + pair[1] + 0.55);
        activeNodes.push(o);
      });
      return;
    }
    const notes = {
      click: [520, 0.06, 'triangle', 0.12],
      place: [360, 0.08, 'triangle', 0.14],
      good: [660, 0.14, 'sine', 0.16]
    };
    const cfg = notes[kind] || notes.click;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = cfg[2];
    o.frequency.value = cfg[0];
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(cfg[3], now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + cfg[1] + 0.1);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(now);
    o.stop(now + cfg[1] + 0.15);
    activeNodes.push(o);
  } catch (e) { /* звук не получился — молча работаем дальше */ }
}

function updateSoundButton() {
  const b = document.getElementById('soundToggleBtn');
  if (b) b.textContent = 'Звуки: ' + (storeGet('sound', true) ? 'включены' : 'выключены');
}

/* Короткие общедоменные мелодии, собранные прямо звуком браузера:
   ничего не качаем из интернета, поэтому музыка играет всегда и
   не занимает память телефона. */
const MELODIES = {
  moroz: {                       /* «Ой, мороз, мороз» — народная */
    name: 'Ой, мороз',
    notes: ['E5', 'E5', '', 'E5', '', 'C5', 'E5', '', 'G5', '', '', '', 'C4', '', '', '',
      'G4', '', '', '', 'C4', '', '', '', 'E4', '', '', 'A4', '', 'B4', '', 'A#4', 'A4', '']
  },
  kalinka: {                     /* «Ой, цветели калинка» — народная */
    name: 'Калинка',
    notes: ['E5', 'F5', 'G5', 'A5', 'G5', 'E5', 'D5', 'E5', 'F5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', '']
  },
  tweedle: {                     /* «Мы ели медведя» / Twinkle — народная */
    name: 'Мы ели медведя',
    notes: ['C5', 'C5', 'G4', 'G4', 'A4', 'A4', 'G4', '', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4', '']
  },
  chime: {                       /* короткий перезвон */
    name: 'Перезвон',
    notes: ['C5', 'E5', 'G5', 'C6', 'G5', 'C6', '']
  }
};

const MELODY_TONES = {
  piano: { name: 'Фортепиано' },
  violin: { name: 'Скрипка' },
  soft: { name: 'Тихая колокольная' }
};

const NOTE_HZ = { C4: 261.6, 'C#4': 277.2, D4: 293.7, 'D#4': 311.1, E4: 329.6, F4: 349.2,
  'F#4': 370.0, G4: 392.0, 'G#4': 415.3, A4: 440.0, 'A#4': 466.2, B4: 493.9,
  C5: 523.3, 'C#5': 554.4, D5: 587.3, 'D#5': 622.3, E5: 659.3, F5: 698.5,
  'F#5': 740.0, G5: 784.0, G6: 1568.0, C6: 1046.5 };

/* одна нота выбранным тембром */
function playNote(hz, start, dur, tone) {
  const ctx = audioCtx;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = tone === 'violin' ? 2600 : (tone === 'soft' ? 1400 : 2200);

  if (tone === 'piano') {
    /* фортепиано: основной тон + тихий второй обертон */
    o.type = 'triangle';
    o.frequency.value = hz;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(0.22, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.06, start + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(filter);
  } else if (tone === 'violin') {
    /* скрипка: мягкое нарастание и лёгкое вибрато */
    o.type = 'sawtooth';
    o.frequency.value = hz;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 5.5;
    lfoGain.gain.value = hz * 0.006;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(0.16, start + Math.min(0.14, dur * 0.3));
    g.gain.setValueAtTime(0.16, start + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(filter);
    lfo.start(start);
    lfo.stop(start + dur + 0.05);
  } else {
    /* колокольная: чистый синус */
    o.type = 'sine';
    o.frequency.value = hz;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(0.18, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur * 1.1);
    o.connect(filter);
  }
  filter.connect(g);
  g.connect(ctx.destination);
  o.start(start);
  o.stop(start + dur + 0.1);
  activeNodes.push(o);
}

function playMelody(kind) {
  const tone = storeGet('melody_tone', 'piano');
  const ids = Object.keys(MELODIES);
  const id = (kind === 'mate') ? 'chime' : ids[Math.floor(Math.random() * ids.length)];
  const mel = MELODIES[id];
  if (!mel) return;
  audioUnlock();
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); return; }
    /* если уже играет мелодия или щелчок — замолкаем, чтобы не наложились */
    silenceSounds();
    let t = audioCtx.currentTime + 0.05;
    const step = 0.26;
    for (const n of mel.notes) {
      if (!n) { t += step; continue; }
      const hz = NOTE_HZ[n] || NOTE_HZ.C5;
      playNote(hz, t, tone === 'soft' ? step * 1.6 : step * 0.95, tone);
      t += step;
    }
  } catch (e) { /* музыка не получилась — молча */ }
}

document.getElementById('soundToggleBtn').addEventListener('click', function () {
  storeSet('sound', !storeGet('sound', true));
  updateSoundButton();
  if (storeGet('sound', true)) sfx('win');       /* сразу даём услышать */
  else toast('Звуки выключены');
});

document.getElementById('soundTestBtn').addEventListener('click', function () {
  if (!storeGet('sound', true)) { toast('Сначала включите звуки'); return; }
  playMelody('win');
  setTimeout(function () { sfx('click'); }, 900);
  toast('Так звучит успех. Щелчок — при ходе.');
});

function updateMelodyName() {
  const t = storeGet('melody_tone', 'piano');
  const el = document.getElementById('melodyName');
  if (el) el.textContent = (MELODY_TONES[t] || MELODY_TONES.piano).name;
}

/* кнопка выбора: перебирает тембры по кругу */
document.getElementById('melodyBtn').addEventListener('click', function () {
  const ids = Object.keys(MELODY_TONES);
  const cur = storeGet('melody_tone', 'piano');
  const next = ids[(ids.indexOf(cur) + 1) % ids.length];
  storeSet('melody_tone', next);
  updateMelodyName();
  if (storeGet('sound', true)) playMelody('win');
});

function greetMain() {
  const p = state.profile;
  document.getElementById('mainHello').textContent =
    p ? (p.name + ', с возвращением!') : 'Выберите задачу, чтобы начать';
  renderMenu();
  updateNav();
  show('screenMain');
  startAutumnPhotos();      /* осенние деревья за панелью задач */
}

function renderMenu() {
  const menu = document.getElementById('taskMenu');
  menu.innerHTML = '';
  menu.appendChild(dailyCard());
  menu.appendChild(missesCard());
  KINDS.forEach(k => {
    const card = document.createElement('div');
    card.className = 'task-card';
    let btns = '';
    for (let lv = 1; lv <= 3; lv++) {
      btns += '<button class="level-btn" data-kind="' + k.id + '" data-level="' + lv + '">' +
        LZ.levelName(lv) + '</button>';
    }
    card.innerHTML = '<h3>' + k.emoji + ' ' + k.name + '</h3>' +
      '<p class="task-hint">' + k.hint + '</p>' +
      '<div class="level-row">' + btns + '</div>';
    menu.appendChild(card);
  });
  menu.querySelectorAll('.level-btn').forEach(b => {
    b.addEventListener('click', () => openTask(b.dataset.kind, Number(b.dataset.level)));
  });

  /* Французский — отдельная карточка: тут не три уровня, а
     путешествие по Франции, поэтому и кнопка одна. */
  const frCard = document.createElement('div');
  frCard.className = 'task-card task-card-fr';
  frCard.innerHTML = '<h3>🇫🇷 Французский язык</h3>' +
    '<p class="task-hint">Путешествие по Франции: новые слова, живые сценки и печать в паспорте</p>' +
    frProgressLine() +
    '<div class="level-row"><button class="level-btn fr-open-btn" data-fr="1">Продолжить</button></div>';
  menu.appendChild(frCard);
  const frBtn = frCard.querySelector('.fr-open-btn');
  if (frBtn) frBtn.addEventListener('click', function () { frOpen(); });
}

/* Подсказка о прогрессе французского — одной строкой, без давления. */
function frProgressLine() {
  if (typeof FR === 'undefined') return '';
  let done = 0, total = 0;
  try {
    const p = JSON.parse(localStorage.getItem('fr_progress')) || { done: {} };
    FR.places.forEach(function (pl) {
      total += pl.days;
      for (let l = 0; l < pl.days; l++) if (p.done && p.done[pl.code + '-' + l]) done++;
    });
  } catch (e) { }
  if (!done) return '<p class="task-hint">Ещё не начато. Один урок — десять минут.</p>';
  return '<p class="task-hint">Пройдено ' + done + ' из ' + total + ' уроков</p>';
}

function updateNav() {
  document.getElementById('navAvatar').innerHTML = avatarHtml();
  const p = state.profile;
  document.getElementById('mainHello').textContent = p
    ? (p.name + ', с возвращением!')
    : 'Выберите задачу, чтобы начать';
}

document.getElementById('navTasks').addEventListener('click', greetMain);
document.getElementById('navProfile').addEventListener('click', () => {
  if (db.ok) refreshDbData().then(showProfile);
  else showProfile();
});

/* ---------------- ЗАДАНИЕ ---------------- */
function openTask(kind, level, preset) {
  hideAllGameAreas();

  /* Убираем «тени» спичек, если бабушка сменила задачу, не отпустив
     спичку. Тень живёт в body, а поле перерисовывается, поэтому
     без этой уборки на экране оставалась клонированная спичка. */
  matchDrag = null;
  document.querySelectorAll('.match-ghost').forEach(function (g) {
    if (g.parentNode) g.parentNode.removeChild(g);
  });
  document.querySelectorAll('.seg.moving, .seg.drop-ok').forEach(function (s) {
    s.classList.remove('moving', 'drop-ok');
  });

  /* Возвращаем на место кнопки задач. Их прятал раздел французского
     (frOpen), и без этого возврата обычные задачи остались бы без
     подсказок и без «Как это решать?». */
  ['hintBtn', 'howBtn', 'solutionBtn', 'anotherBtn',
   'chessBtns', 'chessStyles', 'chessScore'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && el.dataset && el.dataset.frHidden === '1') {
      delete el.dataset.frHidden;
      el.hidden = (id === 'chessScore' || id === 'chessStyles' ||
                   id === 'chessBtns' || id === 'hintBtn');
    }
  });

  loadGamePhoto();
  /* убираем «числовую» строку от предыдущей задачи, если она была */
  const oldSeqLine = document.querySelector('.seq-line');
  if (oldSeqLine) oldSeqLine.remove();
  if (kind === 'chessbot') {
    document.getElementById('gameTitle').textContent = 'Игра с ботом';
    document.getElementById('gameLevel').textContent = 'Уровень: ' + LZ.levelName(level);
    document.getElementById('gameQuestion').textContent = 'Вы ходите белыми. Нажмите на фигуру, потом на клетку. Цель — поставить чёрным мат. Под доской можно сменить вид доски и фигур.';
    document.getElementById('solutionBox').hidden = true;
    document.getElementById('resultBox').hidden = true;
    state.task = null;
    document.getElementById('chessArea').hidden = false;
    document.getElementById('chessScore').hidden = false;
    document.getElementById('chessBtns').hidden = false;
    document.getElementById('chessStyles').hidden = false;
    document.getElementById('solutionBtn').hidden = true;
    document.getElementById('anotherBtn').hidden = true;
    startChessGame(level);
    renderChessStylePickers();
    renderChessButtons();
    show('screenGame');
    return;
  }
  let task;
  try {
    if (preset) task = preset;
    else if (kind === 'chess') task = CH.matePuzzle(level);
    else task = LZ[kind] ? LZ[kind](level) : null;
  } catch (e) {
    toast('Не получилось составить задачу: ' + e.message);
    return;
  }
  if (!task) { toast('Такой задачи пока нет'); return; }

  state.task = task;
  state.game = null;

  document.getElementById('gameTitle').textContent = task.title;
  document.getElementById('gameLevel').textContent =
    'Уровень: ' + LZ.levelName(task.level);
  document.getElementById('gameQuestion').textContent = task.question;
  document.getElementById('solutionBox').hidden = true;
  document.getElementById('resultBox').hidden = true;
  /* кнопки разбора нужны всем задачам (в игре с ботом их нет) */
  document.getElementById('solutionBtn').hidden = false;
  document.getElementById('anotherBtn').hidden = false;
  document.getElementById('howBox').hidden = true;

  const answerArea = document.getElementById('answerArea');
  const sudArea = document.getElementById('sudokuArea');
  const minArea = document.getElementById('minesArea');
  const matArea = document.getElementById('matchArea');
  const chArea = document.getElementById('chessArea');

  answerArea.hidden = true; sudArea.hidden = true;
  minArea.hidden = true; matArea.hidden = true;

  if (kind === 'sequence') {
    answerArea.hidden = false;
    const inp = document.getElementById('answerInput');
    inp.value = '';
    inp.placeholder = 'Впишите число';
    renderSequence(task);
  }
  if (kind === 'sudoku') { sudArea.hidden = false; renderSudoku(task); }
  if (kind === 'mines') { minArea.hidden = false; renderMines(task); }
  if (kind === 'matchsticks') { matArea.hidden = false; renderMatch(task); }
  /* подсказка по шагам есть только там, где она полезна */
  document.getElementById('hintBtn').hidden = !(kind === 'sudoku' || kind === 'mines');
  if (kind === 'chess') {
    chArea.hidden = false;
    document.getElementById('chessScore').hidden = false;
    document.getElementById('chessBtns').hidden = false;
    document.getElementById('chessStyles').hidden = false;
    startChessPuzzle(task);
    renderChessStylePickers();
    renderChessButtons();
  }

  show('screenGame');
}

function renderSequence(task) {
  const old = document.querySelector('.seq-line');
  if (old) old.remove();
  const holder = document.createElement('div');
  holder.className = 'seq-line';
  holder.style.cssText = "font-size:1.5rem;letter-spacing:.05em;margin:1rem 0;font-family:'Yeseva One',serif;";
  holder.textContent = task.data.seq.join('  ·  ') + '  ·  ?';
  document.getElementById('gameQuestion')
    .parentNode.insertBefore(holder, document.getElementById('answerArea'));
}

document.getElementById('checkBtn').addEventListener('click', () => {
  const task = state.task;
  if (!task) return;
  if (task.kind === 'matchsticks') { checkMatchsticks(); return; }
  if (task.kind === 'sudoku') { checkSudoku(); return; }
  const res = LZ.check(task, document.getElementById('answerInput').value);
  showResult(res.ok, res.message);
  if (res.ok) markSolved();
});

function showResult(ok, message) {
  const box = document.getElementById('resultBox');
  box.hidden = false;
  box.className = 'result ' + (ok ? 'ok' : 'no');
  box.textContent = message;
}

/* правильное окончание: 1 задача, 2 задачи, 5 задач */
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
function tasksWord(n) { return plural(n, 'задача', 'задачи', 'задач'); }

function markSolved() {
  const p = state.profile;
  if (!p) return;
  const t = state.task;
  if ((p.solved || []).some(x => x.id === t.id)) return;
  playMelody(t.kind === 'chess' ? 'mate' : 'win');
  p.solved = p.solved || [];
  p.solved.push({
    id: t.id, kind: t.kind, level: t.level, title: t.title,
    question: t.question, answer: t.answerText, steps: t.steps,
    data: t.data,
    solution: t.solution ? t.solution.slice() : null,
    when: Date.now()
  });
  saveProfile(p);
  clearMiss(t.kind, t.level);     /* задача больше не в списке ошибок */
  updateNav();
  toast('Задача засчитана! Всего решено: ' + p.solved.length + ' ' + tasksWord(p.solved.length));
  /* обновляем общий рейтинг, чтобы своё место было видно сразу */
  if (typeof db !== 'undefined' && db.ok) refreshDbData();
}

document.getElementById('anotherBtn').addEventListener('click', () => {  if (state.task) {
    if (!(state.profile.solved || []).some(x => x.id === state.task.id)) markMiss();
    openTask(state.task.kind, state.task.level);
  }
});

document.getElementById('hintBtn').addEventListener('click', giveHint);

document.getElementById('solutionBtn').addEventListener('click', () => {
  const t = state.task;
  if (!t) return;
  if (!(state.profile.solved || []).some(x => x.id === t.id)) markMiss();
  const box = document.getElementById('solutionBox');
  box.hidden = false;
  const ol = document.getElementById('solutionSteps');
  ol.innerHTML = '';
  (t.steps || []).forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    ol.appendChild(li);
  });
  document.getElementById('solutionAnswer').textContent = t.answerText;
  if (t.kind === 'mines' && state.game) showMinesSolution();
  if (t.kind === 'sudoku') showSudokuSolution();
});

document.getElementById('backBtn').addEventListener('click', greetMain);
document.getElementById('profileBack').addEventListener('click', greetMain);

/* обновить общий рейтинг и статистику */
const refreshBtn = document.getElementById('refreshStatsBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Обновляю…';
    await refreshDbData();
    showProfile();
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Обновить';
  });
}

/* ---------------- СУДОКУ ---------------- */
function renderSudoku(task) {
  const area = document.getElementById('sudokuArea');
  state.game = { kind: 'sudoku', values: task.data.puzzle.slice(), sel: null, done: false };
  area.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'sudoku';
  for (let i = 0; i < 81; i++) {
    const c = document.createElement('div');
    const r = (i / 9) | 0, col = i % 9;
    c.className = 'cell';
    if (task.data.puzzle[i]) c.classList.add('fixed');
    c.textContent = task.data.puzzle[i] || '';
    c.dataset.i = i;

    /* Линии квадратов 3×3: рисуем внутри клетки и всегда симметрично —
       толстая линия и с одной стороны, и с противоположной,
       поэтому ничего не торчит за рамку. */
    const shadows = [];
    if (col % 3 === 0 && col > 0) shadows.push('inset 3px 0 0 var(--accent)');
    if (col === 8) shadows.push('inset -3px 0 0 var(--accent)');
    if (r % 3 === 0 && r > 0) shadows.push('inset 0 3px 0 var(--accent)');
    if (r === 8) shadows.push('inset 0 -3px 0 var(--accent)');
    if (shadows.length) c.style.boxShadow = shadows.join(', ');

    c.addEventListener('click', () => {
      if (task.data.puzzle[i]) return;
      state.game.sel = i;
      paintSudoku(task);
    });
    grid.appendChild(c);
  }

  const pad = document.createElement('div');
  pad.className = 'numpad';
  for (let n = 1; n <= 9; n++) {
    const b = document.createElement('button');
    b.textContent = n;
    b.addEventListener('click', () => setSudokuValue(task, n));
    pad.appendChild(b);
  }
  const clr = document.createElement('button');
  clr.textContent = '⌫';
  clr.addEventListener('click', () => setSudokuValue(task, 0));
  pad.appendChild(clr);

  const chk = document.createElement('button');
  chk.textContent = '✔';
  chk.addEventListener('click', checkSudoku);
  pad.appendChild(chk);

  area.appendChild(grid);
  area.appendChild(pad);
  paintSudoku(task);
}

function paintSudoku(task) {
  const grid = document.querySelector('.sudoku');
  if (!grid) return;
  const cells = grid.children;
  for (let i = 0; i < 81; i++) {
    cells[i].textContent = state.game.values[i] || '';
    cells[i].classList.toggle('sel', state.game.sel === i);
  }
}

function setSudokuValue(task, n) {
  const g = state.game;
  if (!g || g.sel === null) { toast('Сначала нажмите на пустую клетку'); return; }
  g.values[g.sel] = n;
  sfx('click');
  paintSudoku(task);
}

/* ---------------- ПОДСКАЗКА ПО ШАГАМ ---------------- */
/* Кнопка «Подсказка» помогает, но не открывает всё решение сразу. */
function giveHint() {
  const g = state.game, task = state.task;
  if (!g) return;
  const grid = document.querySelector('.sudoku');
  const cells = grid ? grid.children : [];

  if (g.kind === 'sudoku') {
    /* ищем пустую клетку, где подходит ровно одно число */
    for (let i = 0; i < 81; i++) {
      if (task.data.puzzle[i]) continue;
      if (g.values[i]) continue;
      const cands = [];
      for (let n = 1; n <= 9; n++) {
        if (sudokuOk(i, n, g.values, task.data.puzzle)) cands.push(n);
      }
      if (cands.length === 1) {
        g.sel = i;
        g.values[i] = cands[0];
        sfx('good');
        paintSudoku(task);
        if (cells[i]) {
          cells[i].classList.add('sel');
          cells[i].classList.add('hint-cell');
        }
        showResult(true, 'Подсказка: в этой клетке подходит только ' + cands[0] +
          '. Посмотрите, почему остальные не подходят.');
        return;
      }
    }
    showResult(false, 'Пока не нашлось клетки с одним вариантом. Продолжайте решать — ' +
      'подсказка появится позже.');
    return;
  }

  if (g.kind === 'mines') {
    if (!g.field) { toast('Поле ещё не создано — сделайте первое нажатие'); return; }
    /* показываем одну мину: она засчитывается как найденная */
    if (!g.hintMineShown) {
      for (let i = 0; i < g.w * g.h; i++) {
        if (g.field[i] && !g.open.has(i)) {
          g.open.add(i);
          g.flags.add(i);
          g.hintMineShown = 1;
          paintMines();
          const cell = document.querySelector('.mines').children[i];
          if (cell) { cell.className = 'mcell open boom'; cell.textContent = '💣'; }
          sfx('click');
          showResult(false, 'Подсказка: вот здесь была мина. Она уже вскрыта и засчитана как найденная.');
          if (g.open.size === g.w * g.h - g.mines) winGame();
          return;
        }
      }
      showResult(false, 'Похоже, все мины уже найдены.');
    }
  }
}

/* подходит ли число n в клетку i (с учётом уже стоящих и заданных) */
function sudokuOk(i, n, values, puzzle) {
  const r = (i / 9) | 0, c = i % 9;
  const br = ((r / 3) | 0) * 3, bc = ((c / 3) | 0) * 3;
  for (let k = 0; k < 9; k++) {
    if (k !== c && (puzzle[r * 9 + k] === n || values[r * 9 + k] === n)) return false;
    if (k !== r && (puzzle[k * 9 + c] === n || values[k * 9 + c] === n)) return false;
  }
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      const j = rr * 9 + cc;
      if (j === i) continue;
      if (puzzle[j] === n || values[j] === n) return false;
    }
  }
  return true;
}

function checkSudoku() {
  const task = state.task, g = state.game;
  if (!g) return;
  const grid = document.querySelector('.sudoku');
  const cells = grid ? grid.children : [];
  let wrong = 0, filled = 0;
  for (let i = 0; i < 81; i++) {
    const v = g.values[i];
    const isWrong = v && v !== task.data.solution[i];
    cells[i].classList.toggle('wrong', !!isWrong);
    if (v) filled++;
    if (isWrong) wrong++;
  }
  const empty = 81 - filled;
  if (wrong) {
    showResult(false, 'Есть ошибки: неверных цифр — ' + wrong + '. Попробуйте ещё раз.');
  } else if (empty) {
    showResult(false, 'Пока пустых клеток: ' + empty + '. Допишите судоку.');
  } else {
    showResult(true, 'Верно! Судоку решено.');
    markSolved();
  }
}

function showSudokuSolution() {
  const task = state.task, grid = document.querySelector('.sudoku');
  if (!grid) return;
  const cells = grid.children;
  for (let i = 0; i < 81; i++) {
    if (!task.data.puzzle[i]) {
      cells[i].textContent = task.data.solution[i];
      cells[i].classList.add('wrong');
      cells[i].style.color = '';
    }
  }
}

/* ---------------- САПЁР ---------------- */
function renderMines(task) {
  const area = document.getElementById('minesArea');
  const { w, h, mines } = task.data;
  state.game = {
    kind: 'mines', w: w, h: h, mines: mines,
    field: null, open: new Set(), flags: new Set(),
    over: false, won: false, started: false, time: 0, timer: null
  };
  area.innerHTML = '';

  const stats = document.createElement('div');
  stats.className = 'mines-stats';
  stats.innerHTML = '<span id="minesLeft">💣 ' + mines + '</span><span id="minesTime">Время: 0</span>';
  area.appendChild(stats);

  /* Подсказка про широкое поле: в «сложном» режиме поле может быть
     шире экрана телефона, и его нужно сдвинуть вбок. На компьютере
     поле всегда помещается, поэтому там подсказку не показываем. */
  if (w > 9) {
    const note = document.createElement('p');
    note.className = 'mines-scroll-note';
    note.innerHTML = '↔ Поле широкое. Если края не видно — сдвиньте экран вбок: ' +
      'проведите пальцем по полю влево или вправо.';
    area.appendChild(note);
  }

  const grid = document.createElement('div');
  grid.className = 'mines';
  /* Клетка не сжимается ниже 1.55rem: на узком экране в «сложном»
     поле сжималось до 16 пикселей, и в такую клетку не попасть.
     Лучше пусть поле чуть шире экрана и его можно сдвинуть вбок —
     об этом и говорит подсказка под полем. */
  grid.style.gridTemplateColumns = 'repeat(' + w + ', minmax(1.55rem, 1fr))';
  for (let i = 0; i < w * h; i++) {
    const c = document.createElement('div');
    c.className = 'mcell';
    c.dataset.i = i;
    c.addEventListener('click', () => openCell(i));
    c.addEventListener('contextmenu', e => { e.preventDefault(); toggleFlag(i); });
    /* долгое нажатие — флажок на телефоне */
    let timer = null;
    c.addEventListener('touchstart', function () {
      timer = setTimeout(() => { toggleFlag(i); timer = null; }, 450);
    }, { passive: true });
    const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
    c.addEventListener('touchend', clear);
    c.addEventListener('touchmove', clear);
    grid.appendChild(c);
  }
  /* Поле кладём в свою прокручиваемую коробку: тогда оно может быть
     шире экрана, но вся страница остаётся на месте — тянуть вбок
     приходится только само поле, а не всю страницу. */
  const box = document.createElement('div');
  box.className = 'mines-scroll';
  box.appendChild(grid);
  area.appendChild(box);

  /* Подсказку про сдвиг вбок показываем только если поле реально
     шире экрана. На компьютере и на лёгком уровне она лишняя.
     Проверяем через setTimeout, а не через кадр: в невидимой вкладке
     кадр не наступает, и подсказка осталась бы лишней. */
  if (area.querySelector('.mines-scroll-note')) setTimeout(updateMinesNote, 60);
}

/* Прячем подсказку про сдвиг вбок, если поле помещается */
function updateMinesNote() {
  const box = document.querySelector('#minesArea .mines-scroll');
  const note = document.querySelector('#minesArea .mines-scroll-note');
  if (!box || !note) return;
  /* Подсказка нужна, когда поле НЕ помещается и его надо сдвигать. */
  note.hidden = !(box.scrollWidth > box.clientWidth + 1);
}
window.addEventListener('resize', updateMinesNote);

function startMinesTimer() {
  const g = state.game;
  if (g.timer) return;
  g.timer = setInterval(() => {
    g.time++;
    const t = document.getElementById('minesTime');
    if (t) t.textContent = 'Время: ' + g.time;
  }, 1000);
}
function stopMinesTimer() {
  const g = state.game;
  if (g.timer) { clearInterval(g.timer); g.timer = null; }
}

function makeMinesField(g, firstIdx) {
  const { w, h, mines } = g;
  const field = new Array(w * h).fill(false);
  const fr = (firstIdx / w) | 0, fc = firstIdx % w;
  let placed = 0, guard = 0;
  while (placed < mines && guard++ < 5000) {
    const i = Math.floor(Math.random() * w * h);
    if (field[i]) continue;
    const r = (i / w) | 0, c = i % w;
    /* первая клетка и её соседи — безопасные */
    if (Math.abs(r - fr) <= 1 && Math.abs(c - fc) <= 1) continue;
    field[i] = true;
    placed++;
  }
  g.field = field;
}

function neighbours(g, i) {
  const r = (i / g.w) | 0, c = i % g.w;
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= g.h || nc < 0 || nc >= g.w) continue;
      out.push(nr * g.w + nc);
    }
  }
  return out;
}

function mineCount(g, i) {
  return neighbours(g, i).filter(n => g.field[n]).length;
}

function openCell(i) {
  const g = state.game;
  if (!g || g.over) return;
  if (g.flags.has(i)) return;
  if (!g.started) {
    makeMinesField(g, i);
    g.started = true;
    startMinesTimer();
  }
  if (g.field[i]) { loseGame(i); return; }

  const stack = [i];
  while (stack.length) {
    const cur = stack.pop();
    if (g.open.has(cur) || g.field[cur]) continue;
    g.open.add(cur);
    if (mineCount(g, cur) === 0) {
      neighbours(g, cur).forEach(n => { if (!g.open.has(n) && !g.field[n]) stack.push(n); });
    }
  }
  paintMines();
  if (g.open.size === g.w * g.h - g.mines) winGame();
}

function toggleFlag(i) {
  const g = state.game;
  if (!g || g.over || g.open.has(i)) return;
  if (g.flags.has(i)) g.flags.delete(i); else g.flags.add(i);
  paintMines();
}

function paintMines() {
  const g = state.game;
  const grid = document.querySelector('.mines');
  if (!grid) return;
  const cells = grid.children;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    c.className = 'mcell';
    c.textContent = '';
    if (g.open.has(i)) {
      c.classList.add('open');
      const n = mineCount(g, i);
      if (n) { c.textContent = n; c.classList.add('m' + n); }
    } else if (g.flags.has(i)) {
      c.classList.add('flag');
      c.textContent = '🚩';
    }
  }
  const left = document.getElementById('minesLeft');
  if (left) left.textContent = '💣 ' + Math.max(0, g.mines - g.flags.size);
}

function loseCell(i) {
  const g = state.game;
  const cells = document.querySelector('.mines').children;
  cells[i].className = 'mcell open boom';
  cells[i].textContent = '💣';
  for (let k = 0; k < g.w * g.h; k++) {
    if (g.field[k] && !g.open.has(k) && !g.flags.has(k)) {
      cells[k].className = 'mcell open';
      cells[k].textContent = '💣';
    }
  }
}

function loseGame(i) {
  const g = state.game;
  g.over = true;
  stopMinesTimer();
  loseCell(i);
  showResult(false, 'Мина! Попробуйте новое поле — или посмотрите решение.');
}

function winGame() {
  const g = state.game;
  g.over = true;
  g.won = true;
  stopMinesTimer();
  showResult(true, 'Поле вскрыто целиком! Время: ' + g.time + ' с.');
  markSolved();
}

function showMinesSolution() {
  const g = state.game;
  if (!g || !g.field) { toast('Поле ещё не создано — сделайте первое нажатие'); return; }
  const cells = document.querySelector('.mines').children;
  for (let i = 0; i < g.w * g.h; i++) {
    if (g.field[i]) {
      cells[i].className = 'mcell open boom';
      cells[i].textContent = '💣';
    }
  }
}

/* ---------------- СПИЧКИ ----------------
   Цифры, знак «+»/«−» и знак «=» собраны из спичек — меняется всё.
   Спичку можно перетащить в любое место или нажать на неё: ляжет/встанет.
   Никаких запретов: если человек разобрал цифру — значит, так задумано,
   задача в том и состоит, чтобы поломать голову. Проверка сравнивает
   не числа, а сами спички с верным ответом. */
const SEG_RECTS = {
  a: { x: 12, y: 4, w: 36, h: 8 },
  b: { x: 46, y: 10, w: 8, h: 36 },
  c: { x: 46, y: 54, w: 8, h: 36 },
  d: { x: 12, y: 88, w: 36, h: 8 },
  e: { x: 6, y: 54, w: 8, h: 36 },
  f: { x: 6, y: 10, w: 8, h: 36 },
  g: { x: 12, y: 46, w: 36, h: 8 }
};
const SEG_ORDER = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

/* знаки: «+» = две спички, «−» = одна, «=» = две */
const OP_SEGS = { h: { x: 12, y: 24, w: 36, h: 8 }, v: { x: 26, y: 10, w: 8, h: 36 } };
const EQ_SEGS = { t: { x: 12, y: 22, w: 36, h: 8 }, b: { x: 12, y: 70, w: 36, h: 8 } };

/* сегменты цифры (берём из games.js) */
function segMask(d) { return LZ.segMask(d); }
function segDigit(mask) { return LZ.segDigit(mask); }

function toggleMask(maskStr, seg) {
  const mask = maskStr.split('');
  const i = mask.indexOf(seg);
  if (i >= 0) mask.splice(i, 1); else mask.push(seg);
  mask.sort();
  return mask.join('');
}

/* начальное состояние: цифры из задачи + целые знаки */
function matchInitial(task) {
  const d = task.data;
  return {
    digits: { a: d.broken.a.slice(), b: d.broken.b.slice(), c: d.broken.c.slice() },
    op: d.op === '+' ? { h: 1, v: 1 } : { h: 1, v: 0 },
    eq: { t: 1, b: 1 }
  };
}

/* верный ответ: те же слоты, но с правильными цифрами */
function matchCorrect(task) {
  const d = task.data;
  return {
    digits: { a: d.trueDigits.a.split(''), b: d.trueDigits.b.split(''), c: d.trueDigits.c.split('') },
    op: d.op === '+' ? { h: 1, v: 1 } : { h: 1, v: 0 },
    eq: { t: 1, b: 1 }
  };
}

/* Цифра — это либо число ('3'), либо объект {broken: 'bcf'}, если человек
   её разобрал. Объект нужен потому, что у разорванной цифры может остаться
   и одна спичка, а такая строка не отличилась бы от числа. */
function matchMaskOfValue(v) {
  if (v && typeof v === 'object' && typeof v.broken === 'string') {
    return v.broken.split('').sort().join('');
  }
  return segMask(v);
}

function matchIsBroken(v) {
  return !!(v && typeof v === 'object' && typeof v.broken === 'string');
}

/* какие спички горят в слоте (цифра, знак или «равно») */
function matchSegsOf(g, part, pos) {
  if (part === 'op') return (g.op.h ? 'h' : '') + (g.op.v ? 'v' : '');
  if (part === 'eq') return (g.eq.t ? 't' : '') + (g.eq.b ? 'b' : '');
  return matchMaskOfValue(g.digits[part][pos]);
}

/* записать набор спичек обратно; для цифры запоминаем и число */
function matchSetSegs(g, part, pos, mask) {
  if (part === 'op') {
    g.op = { h: mask.indexOf('h') >= 0 ? 1 : 0, v: mask.indexOf('v') >= 0 ? 1 : 0 };
    return;
  }
  if (part === 'eq') {
    g.eq = { t: mask.indexOf('t') >= 0 ? 1 : 0, b: mask.indexOf('b') >= 0 ? 1 : 0 };
    return;
  }
  const digit = segDigit(mask);
  /* разорванная цифра хранится отдельным объектом, чтобы её нельзя
     было спутать с числом — даже если осталась всего одна спичка */
  g.digits[part][pos] = digit ? digit : { broken: mask.split('').sort().join('') };
}

/* слот рисуется одинаково: svg с набором спичек */
function slotSvg(mask, part, pos, segs, order) {
  let s = '<span class="digit"><svg width="34" height="56" viewBox="0 0 60 100">';
  /* Сначала невидимые площадки — полоса ВОКРУГ самой спички, а не
     вся цифра. Когда площадка была на всю цифру, все семь налезали
     друг на друга, и нажатие в любом месте переключало одну и ту же
     спичку — ту, что нарисована последней. Полоса даёт пальцу
     площадь, но соседних спичек не задевает. */
  order.forEach(seg => {
    const r = segs[seg];
    const wide = r.w > r.h;                       /* лежит ли спичка */
    const gx = wide ? 3 : 6, gy = wide ? 6 : 3;  /* насколько расширить */
    const x = Math.max(0, r.x - gx), y = Math.max(0, r.y - gy);
    const w = Math.min(60 - x, r.w + gx * 2), h = Math.min(100 - y, r.h + gy * 2);
    s += '<rect class="seghit" data-part="' + part + '" data-pos="' + pos +
      '" data-seg="' + seg + '" x="' + x + '" y="' + y +
      '" width="' + w + '" height="' + h + '" fill="transparent"></rect>';
  });
  /* Потом сами спички — они сверху, их видно. */
  order.forEach(seg => {
    const r = segs[seg];
    const on = mask.indexOf(seg) >= 0;
    s += '<rect class="seg' + (on ? ' on' : ' off') + '" data-part="' + part +
      '" data-pos="' + pos + '" data-seg="' + seg + '" x="' + r.x + '" y="' + r.y +
      '" width="' + r.w + '" height="' + r.h + '" rx="3"></rect>';
  });
  s += '</svg></span>';
  return s;
}

function digitSvg(mask, part, pos) {
  /* разорванная цифра рисуется по своим спичкам, а не по числу */
  return slotSvg(matchMaskOfValue(mask), part, pos, SEG_RECTS, SEG_ORDER);
}

function renderMatch(task) {
  const area = document.getElementById('matchArea');
  const d = task.data;
  const init = matchInitial(task);
  state.game = {
    kind: 'matchsticks',
    digits: init.digits,
    op: init.op,
    eq: init.eq
  };

  area.innerHTML = '<p class="moves-hint">Спичку можно <b>перетащить</b> на другое место. ' +
    'А если тянуть неудобно — просто нажмите на неё: она ляжет, а нажмёте ещё раз — встанет. ' +
    'Знаки «+», «−» и «=» тоже сделаны из спичек — их тоже можно менять.</p>' +
    '<div class="match-row" id="matchRow"></div>' +
    '<p class="moves-info" id="movesInfo">Переложено спичек: 0 из ' + d.moves + '</p>' +
    '<div class="moves-info"><button class="big-btn small-btn" id="matchCheck">Проверить</button></div>';

  paintMatch(task);
  document.getElementById('matchCheck').addEventListener('click', checkMatchsticks);
  setupMatchDrag();
}

/* ---------------- ПЕРЕТАСКИВАНИЕ СПИЧЕК ---------------- */
/* Работает и мышью, и пальцем. Короткое нажатие без перетаскивания
   считается обычным переключением спички.
   Слушатели цепляются один раз, а задачу берём текущую — иначе при
   переходе к новой задаче старые обработчики мешали бы друг другу. */
let matchDrag = null;
let matchFinishGlobal = false;   /* один раз настроили глобальные слушатели */
let matchDragBound = false;

function setupMatchDrag() {
  const area = document.getElementById('matchArea');
  if (matchDragBound) return;
  matchDragBound = true;

  area.addEventListener('pointerdown', function (e) {
    let t = e.target;
    if (!t.classList) return;
    /* Можно попасть и по невидимой площадке (она большая, ради
       пальца). Дальше работаем с настоящей спичкой: у неё есть
       размер и признак «горит». */
    if (t.classList.contains('seghit')) {
      t = document.querySelector('#matchArea rect.seg[data-part="' + t.dataset.part +
        '"][data-pos="' + t.dataset.pos + '"][data-seg="' + t.dataset.seg + '"]') || t;
    }
    if (!t.classList || !t.classList.contains('seg')) return;
    const lit = t.classList.contains('on');
    matchDrag = {
      from: { part: t.dataset.part, pos: Number(t.dataset.pos), seg: t.dataset.seg },
      lit: lit,
      moved: false,
      startX: e.clientX, startY: e.clientY,   /* откуда нажали: нужно, чтобы
                                                 отличить нажатие от перетаскивания */
      ghost: null,
      over: null
    };
    if (lit) {
      /* спирака следует за пальцем */
      const r = t.getBoundingClientRect();
      const ghost = document.createElement('div');
      ghost.className = 'match-ghost';
      ghost.style.width = Math.round(r.width * 1.15) + 'px';
      ghost.style.height = Math.round(r.height * 1.15) + 'px';
      ghost.style.left = (e.clientX - r.width / 2) + 'px';
      ghost.style.top = (e.clientY - r.height / 2) + 'px';
      document.body.appendChild(ghost);
      matchDrag.ghost = ghost;
      t.classList.add('moving');
    }
    try { area.setPointerCapture(e.pointerId); } catch (err) { /* не во всех браузерах */ }
  });

  area.addEventListener('pointermove', function (e) {
    if (!matchDrag) return;
    /* Палец всегда чуть дрожит при нажатии. Раньше любой, даже самый
       крошечный сдвиг считался переносом: простое нажатие на зажжённую
       спичку ничего не делало, а тень успевала мелькнуть и иногда
       оставалась на экране клонированной спичкой. Сдвиг меньше
       7 пикселей считаем обычным нажатием. */
    if (!matchDrag.moved) {
      const dx = e.clientX - matchDrag.startX;
      const dy = e.clientY - matchDrag.startY;
      if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
      matchDrag.moved = true;
    }
    if (matchDrag.ghost) {
      matchDrag.ghost.style.left = (e.clientX - matchDrag.ghost.offsetWidth / 2) + 'px';
      matchDrag.ghost.style.top = (e.clientY - matchDrag.ghost.offsetHeight / 2) + 'px';
    }
    const under = matchSegmentUnder(e.clientX, e.clientY);
    if (matchDrag.over) matchDrag.over.classList.remove('drop-ok');
    matchDrag.over = null;
    if (under) {
      const same = under.dataset.part === matchDrag.from.part &&
        Number(under.dataset.pos) === matchDrag.from.pos &&
        under.dataset.seg === matchDrag.from.seg;
      if (!same) { under.classList.add('drop-ok'); matchDrag.over = under; }
    }
  });

  const finish = function () {
    if (!matchDrag) return;
    const d = matchDrag;
    matchDrag = null;
    /* Убираем «тень» ВСЕГДА, даже если задача уже сменилась.
       Раньше был ранний выход, и тень оставалась на экране — бабушка
       видела вторую, клонированную спичку, которую нельзя было убрать.
       Поэтому чистим здесь же, до любых проверок. */
    if (d.ghost && d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
    if (d.over) d.over.classList.remove('drop-ok');
    const srcEl = document.querySelector('.seg.moving[data-part="' + d.from.part +
      '"][data-pos="' + d.from.pos + '"][data-seg="' + d.from.seg + '"]');
    if (srcEl) srcEl.classList.remove('moving');

    const task = state.task;
    if (!task || task.kind !== 'matchsticks') return;

    /* Перенос держим: тень уже убрана выше, теперь решаем судьбу спички. */
    const target = (d.over && d.over.classList.contains('seg')) ? d.over : null;
    if (d.moved && target && d.lit) {
      const same = target.dataset.part === d.from.part &&
        Number(target.dataset.pos) === d.from.pos && target.dataset.seg === d.from.seg;
      if (!same) { moveMatch(task, d.from, target); return; }
    }
    /* нажали без перетаскивания — просто переключаем спичку */
    if (!d.moved || !d.lit) flipSegment(task, d.from.part, d.from.pos, d.from.seg);
  };
  area.addEventListener('pointerup', finish);
  area.addEventListener('pointercancel', finish);
  /* Страховка: палец мог отпустить спичку за пределами поля, и событие
     не дошло бы до обработчика (setPointerCapture есть не во всех
     браузерах). Слушаем всю страницу — тогда тень убирается всегда. */
  if (!matchFinishGlobal) {
    matchFinishGlobal = true;
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    /* и при уходе со страницы/смене задачи */
    window.addEventListener('blur', finish);
  }
}

/* какая спичка под пальцем/курсором */
function matchSegmentUnder(x, y) {
  const stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
  for (const el of stack) {
    if (el.classList && el.classList.contains('seg') && !el.classList.contains('moving')) return el;
  }
  return null;
}

/* перенос одной спички: снять с одного места, положить на другое.
   Никаких проверок — можно ломать цифры, это и есть задача. */
function moveMatch(task, from, toEl) {
  const g = state.game;
  const to = { part: toEl.dataset.part, pos: Number(toEl.dataset.pos), seg: toEl.dataset.seg };
  if (from.part === to.part && from.pos === to.pos && from.seg === to.seg) return;

  const touched = [];
  function applyToggle(part, pos, seg) {
    const key = part + '_' + pos;
    let entry = null;
    for (const t of touched) { if (t.key === key) { entry = t; break; } }
    if (!entry) {
      entry = { key: key, part: part, pos: pos, mask: matchSegsOf(g, part, pos) };
      touched.push(entry);
    }
    entry.mask = toggleMask(entry.mask, seg);
  }
  applyToggle(from.part, from.pos, from.seg);
  applyToggle(to.part, to.pos, to.seg);
  for (const t of touched) matchSetSegs(g, t.part, t.pos, t.mask);
  sfx('place');
  paintMatch(task);
}

/* как выглядит равенство сейчас: цифры, которые ещё не разобрали, —
   числами, разобранные — вопросительным знаком */
function currentEq(g) {
  function part(p) {
    return g.digits[p].map(d => (matchIsBroken(d) ? '?' : d)).join('');
  }  const op = g.op.h && g.op.v ? '+' : (g.op.h && !g.op.v ? '−' : '?');
  const eq = g.eq.t && g.eq.b ? '=' : '?';
  return part('a') + ' ' + op + ' ' + part('b') + ' ' + eq + ' ' + part('c');
}

/* сколько спичек переложено: снято столько же, сколько положено, поэтому
   берём максимум. Учитываем и цифры, и знаки. */
function matchAllSlots() {
  const g = state.game;
  const slots = [];
  ['a', 'b', 'c'].forEach(p => {
    g.digits[p].forEach((d, i) => slots.push({ part: p, pos: i, mask: matchSegsOf(g, p, i) }));
  });
  slots.push({ part: 'op', pos: 0, mask: matchSegsOf(g, 'op', 0) });
  slots.push({ part: 'eq', pos: 0, mask: matchSegsOf(g, 'eq', 0) });
  return slots;
}

function matchStartSlots(task) {
  const g0 = matchInitial(task);
  const slots = [];
  ['a', 'b', 'c'].forEach(p => {
    g0.digits[p].forEach((d, i) => slots.push({ part: p, pos: i, mask: segMask(d) }));
  });
  slots.push({ part: 'op', pos: 0, mask: (g0.op.h ? 'h' : '') + (g0.op.v ? 'v' : '') });
  slots.push({ part: 'eq', pos: 0, mask: 'tb' });
  return slots;
}

function movedCount(task) {
  const now = matchAllSlots();
  const start = matchStartSlots(task);
  let rem = 0, add = 0;
  for (let i = 0; i < now.length; i++) {
    const m0 = start[i].mask.split('');
    const m1 = now[i].mask.split('');
    m0.forEach(s => { if (m1.indexOf(s) < 0) rem++; });
    m1.forEach(s => { if (m0.indexOf(s) < 0) add++; });
  }
  return Math.max(rem, add);
}

function paintMatch(task) {
  const g = state.game;
  const row = document.getElementById('matchRow');
  if (!row) return;
  let html = '';
  g.digits.a.forEach((d, i) => { html += digitSvg(d, 'a', i); });
  html += slotSvg(matchSegsOf(g, 'op', 0), 'op', 0, OP_SEGS, ['h', 'v']);
  g.digits.b.forEach((d, i) => { html += digitSvg(d, 'b', i); });
  html += slotSvg(matchSegsOf(g, 'eq', 0), 'eq', 0, EQ_SEGS, ['t', 'b']);
  g.digits.c.forEach((d, i) => { html += digitSvg(d, 'c', i); });
  row.innerHTML = html;
  const info = document.getElementById('movesInfo');
  if (info) info.textContent = 'Переложено спичек: ' + movedCount(task) + ' из ' + task.data.moves +
    '   ·   сейчас: ' + currentEq(g);
}

function flipSegment(task, part, pos, seg) {
  const g = state.game;
  const mask = toggleMask(matchSegsOf(g, part, pos), seg);
  matchSetSegs(g, part, pos, mask);
  sfx('click');
  paintMatch(task);
}

/* Решение засчитывается, если равенство верное и переложено ровно
   столько спичек, сколько просили. Способ не важен: равенство может
   получиться совсем другим, главное, что оно верное. */
function matchCurrentOp(g) {
  if (g.op.h && g.op.v) return '+';
  if (g.op.h && !g.op.v) return '−';
  return '';
}
function matchCurrentEqSign(g) {
  return (g.eq.t && g.eq.b) ? '=' : '';
}
function matchNumbers(g) {
  /* если хоть одна цифра разобрана — посчитать равенство нечем */
  for (const p of ['a', 'b', 'c']) {
    for (const d of g.digits[p]) if (matchIsBroken(d)) return null;
  }
  return {
    a: Number(g.digits.a.join('')),
    b: Number(g.digits.b.join('')),
    c: Number(g.digits.c.join(''))
  };
}

function checkMatchsticks() {
  const task = state.task, g = state.game;
  const moved = movedCount(task);
  const eqText = currentEq(g);
  const op = matchCurrentOp(g);
  const eqSign = matchCurrentEqSign(g);

  if (!eqSign) {
    showResult(false, 'Знак «=» собран неправильно — нужны обе его спички. ' +
      'Сейчас: ' + eqText + '.');
    return;
  }
  if (!op) {
    showResult(false, 'В знаке не хватает спички: нужен «+» (две спички) или «−» (одна). ' +
      'Сейчас: ' + eqText + '.');
    return;
  }

  const n = matchNumbers(g);
  if (n) {
    const ok = op === '+' ? n.a + n.b === n.c : n.a - n.b === n.c;
    if (!ok) {
      showResult(false, 'Равенство пока неверное. Сейчас: ' + n.a + ' ' + op + ' ' +
        n.b + ' = ' + n.c + '.');
      return;
    }
    if (moved !== task.data.moves) {
      showResult(false, 'Равенство верное, но переложено спичек: ' + moved + ' из ' +
        task.data.moves + '. Нужно ровно ' + task.data.moves + '.');
      return;
    }
    showResult(true, 'Верно! Равенство ' + n.a + ' ' + op + ' ' + n.b + ' = ' + n.c + '.');
    markSolved();
    return;
  }

  /* равенство не посчитать — цифра разобрана. Сравниваем спички с ответом. */
  const correct = matchCorrect(task);
  let same = true;
  ['a', 'b', 'c'].forEach(p => {
    for (let i = 0; i < correct.digits[p].length; i++) {
      if (segMask(correct.digits[p][i]) !== matchSegsOf(g, p, i)) same = false;
    }
  });
  if (matchSegsOf(g, 'op', 0) !== ((correct.op.h ? 'h' : '') + (correct.op.v ? 'v' : ''))) same = false;

  if (same) {
    showResult(true, 'Верно! Равенство ' + eqText + '.');
    markSolved();
    return;
  }
  showResult(false, 'Пока не то. Сейчас: ' + eqText + '. Соберите равенство, чтобы оно стало верным.');
}

/* ---------------- ПРОФИЛЬ ---------------- */
function showProfile() {
  const p = state.profile;
  if (!p) { newProfileScreen(); return; }
  document.getElementById('profileName').textContent = p.name;
  /* возраст хранится промежутком, а не точным годом */
  const genderTxt = p.gender === 'm' ? 'Мужчина' : 'Женщина';
  const ageTxt = AGE_RANGES[p.age] || AGE_RANGES['70'];
  document.getElementById('profileYear').textContent = genderTxt + ' · ' + ageTxt;
  document.getElementById('profileAvatar').innerHTML = avatarHtml();

  document.getElementById('statSolved').textContent = solvedCount(p);

  const avg = (p.solved || []).length
    ? ((p.solved.reduce((s, x) => s + x.level, 0) / p.solved.length)).toFixed(1)
    : '0';
  document.getElementById('statRate').textContent = avg;

  const place = myPlace();
  document.getElementById('statPlace').textContent = place || '—';

  /* список решённых задач живёт в отдельной папке — см. showMyTasks() */

  const rl = document.getElementById('ratingList');
  rl.innerHTML = '';
  const note = document.getElementById('ratingNote');
  const ranked = db.ok ? (dbRanked || []) : ratingList();
  if (db.ok) {
    note.textContent = 'Общий рейтинг всех посетителей. Всего 50 мест.';
  } else {
    note.textContent = 'Общий рейтинг сейчас недоступен — показываем места на этом устройстве.';
  }
  if (!ranked.length) {
    rl.innerHTML = '<p class="small-note">Пока никто не записал результаты. ' +
      'Задайте первую задачу и возглавьте таблицу 🙂</p>';
  }
  ranked.forEach((pr, i) => {
    const row = document.createElement('div');
    const isMe = db.ok ? pr.me : (pr.id === state.profile.id);
    row.className = 'rating-row' + (isMe ? ' me' : '');
    const cnt = db.ok ? pr.solved : solvedCount(pr);
    const av = '<span class="ava-emoji small">' + avatarEmoji(pr.avatar) + '</span>';
    row.innerHTML = '<span class="rating-pos">' + (i + 1) + '</span>' + av +
      '<span>' + esc(pr.name) + '</span>' +
      '<span style="margin-left:auto">' + cnt + '</span>';
    rl.appendChild(row);
  });

  /* статистика посещений — из общей базы */
  if (db.ok) {
    const s = dbStats;
    if (s) {
      document.getElementById('statDay').textContent = s.day;
      document.getElementById('statWeek').textContent = s.week;
      document.getElementById('statMonth').textContent = s.month;
    }
    document.getElementById('dbNote').textContent =
      'В общей базе видны только придуманное имя, картинка и число решённых ' +
      'задач. История занятий и настройки хранятся на этом устройстве.';
  } else {
    document.getElementById('dbNote').textContent =
      'Общая база сейчас недоступна, поэтому прогресс хранится только на этом устройстве.';
  }

  show('screenProfile');
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

document.getElementById('resetProfileBtn').addEventListener('click', () => {
  askConfirm('Сменить пользователя?', 'Ваши задачи сохранятся — их можно будет вернуть.', () => {
    newProfileScreen();
  });
});

/* ---------------- ОКНО ПОДТВЕРЖДЕНИЯ ---------------- */
/* Свое окно вместо системного вопроса: на телефоне системный выглядит
   мелко и путается. */
let askAction = null;

function askConfirm(title, text, onYes) {
  document.getElementById('askTitle').textContent = title;
  document.getElementById('askText').textContent = text;
  document.getElementById('askBox').hidden = false;
  askAction = onYes;
}

function closeAsk() {
  document.getElementById('askBox').hidden = true;
  askAction = null;
}

document.getElementById('askNo').addEventListener('click', closeAsk);
document.getElementById('askYes').addEventListener('click', function () {
  const fn = askAction;
  closeAsk();
  if (fn) fn();
});

/* ---------------- УДАЛЕНИЕ ПРОФИЛЯ ---------------- */
/* Стираем всё: профиль на этом телефоне, папку задач, настройки и
   запись в общем рейтинге. Спрашиваем два раза, чтобы не промахнуться. */
function clearLocalData() {
  try {
    Object.keys(localStorage)
      .filter(k => k.indexOf('lz_') === 0)
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* память недоступна — перезагрузка всё равно очистит экран */ }
}

async function deleteEverything() {
  /* 1. сначала стираем то, что на телефоне: это быстро и это главное */
  clearLocalData();
  toast('Профиль удалён. Открываем сайт заново…');

  /* 2. потом убираем запись из общего рейтинга, но не дольше трёх секунд:
        если интернет медленный, ждать не нужно */
  let inRating = false;
  try {
    if (typeof db !== 'undefined' && db.ok) {
      const limit = new Promise(res => setTimeout(() => res(false), 3000));
      inRating = await Promise.race([db.deleteMyData(), limit]);
    }
  } catch (e) { inRating = false; }

  if (!inRating) {
    /* честно говорим: с телефона стёрто, а запись в общем рейтинге
       пока осталась — её уберут вручную */
    toast('С телефона всё стёрто. Запись в рейтинге попросим убрать отдельно.');
  } else {
    toast('Профиль удалён. Открываем сайт заново…');
  }

  /* 3. начисто: сайт перезагрузится и спросит имя заново */
  setTimeout(function () { location.reload(); }, inRating ? 600 : 1600);
}

document.getElementById('deleteProfileBtn').addEventListener('click', function () {
  askConfirm('Удалить профиль?', 'Будут стёрты ваши задачи, история и настройки.', function () {
    askConfirm('Точно удалить?',
      'Все данные будут удалены без возможности восстановить.', deleteEverything);
  });
});

/* ---------------- НАСТРОЙКИ ---------------- */
function renderThemes() {
  const row = document.getElementById('themeRow');
  if (!row) return;
  row.innerHTML = '';
  THEMES.forEach(t => {
    const b = document.createElement('button');
    b.className = 'theme-swatch' + (t.id === state.theme ? ' active' : '');
    b.textContent = t.name;
    b.addEventListener('click', () => {
      state.theme = t.id;
      storeSet('theme', t.id);
      applyTheme();
      renderThemes();
    });
    row.appendChild(b);
  });
}
document.getElementById('fsRange').addEventListener('input', function () {
  state.fontSize = Number(this.value);
  storeSet('fontSize', state.fontSize);
  applyTheme();
});

/* ---------------- УВЕДОМЛЕНИЕ ---------------- */
let toastTimer = null;
function toast(text) {
  const t = document.getElementById('toast');
  t.textContent = text;
  t.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------------- ИНСТРУКЦИЯ ---------------- */
const HOW_TO = {
  sequence:
    '<p><b>Что нужно сделать.</b> Посмотрите на числа и найдите правило, по которому они идут.</p>' +
    '<p><b>Подсказка.</b> Попробуйте соседние числа: они могут всё время увеличиваться на одно и то же ' +
    'число, или каждое следующее может быть в несколько раз больше предыдущего.</p>' +
    '<p><b>Запишите</b> следующее число в поле ответа и нажмите «Проверить».</p>' +
    '<p><b>Если ошиблись</b> — ничего страшного. Нажмите «Показать решение», там объясняют правило по шагам.</p>',
  matchsticks:
    '<p><b>Что нужно сделать.</b> Переложить спички так, чтобы равенство стало верным.</p>' +
    '<p><b>Как перекладывать.</b> Спичку можно <b>перетащить</b> мышкой или пальцем ' +
    'на другое место — где она станет зелёной. Если тянуть неудобно, просто ' +
    '<b>нажмите</b> на спичку: она ляжет, а ещё одно нажатие — встанет.</p>' +
    '<p><b>Важно:</b> переложить нужно <b>ровно столько спичек</b>, сколько написано в задании — ' +
    'и ни одной больше. Счётчик «Переложено спичек» показывает, сколько уже сдвинуто.</p>' +
    '<p>Цифры набраны из семи спичек. Например, у цифры <b>8</b> горят все семь, ' +
    'а у цифры <b>1</b> — только две справа.</p>' +
    '<p><b>Проверка</b> — кнопкой «Проверить». Сначала добейтесь верного равенства, ' +
    'потом проверьте, сколько спичек переложено.</p>',
  sudoku:
    '<p><b>Что нужно сделать.</b> Заполнить пустые клетки цифрами от 1 до 9.</p>' +
    '<p><b>Главное правило:</b> в каждой строке, в каждом столбце и в каждом маленьком квадрате 3×3 ' +
    'все цифры должны быть разными и встретиться там ровно по одному разу.</p>' +
    '<p><b>Как вводить.</b> Нажмите на пустую клетку — она обведётся — потом нажмите цифру внизу. ' +
    'Чтобы стереть, нажмите ⌫.</p>' +
    '<p>Серым выделены цифры из задания, их менять нельзя.</p>' +
    '<p><b>Подсказка.</b> Начните с квадратов, где не хватает всего одной цифры. ' +
    'Потом идите по кругу: вписанная цифра сама подсказывает следующую.</p>',
  mines:
    '<p><b>Что нужно сделать.</b> Открыть все клетки, где нет мин, и не наступить на мину.</p>' +
    '<p><b>Как открывать.</b> Нажмите на клетку. Первое нажатие всегда безопасное — поле создаётся в этот момент.</p>' +
    '<p><b>Что значат цифры.</b> Цифра показывает, сколько мин рядом — считаются и соседи по стороне, ' +
    'и по диагонали.</p>' +
    '<p><b>Флажок.</b> На компьютере — нажмите правой кнопкой мыши. На телефоне — зажмите клетку пальцем.</p>' +
    '<p><b>Пустые места.</b> Если вокруг клетки нет цифр, значит рядом мин нет — можно смело ' +
    'открывать всё поле вокруг неё.</p>' +
    '<p>Победа — когда открыты все клетки без мин.</p>',
  chess:
    '<p><b>Что нужно сделать.</b> Вы играете белыми. Найдите ход, который приводит к мату.</p>' +
    '<p><b>Уровень «Легко»</b> — мат ставится сразу, одним ходом.</p>' +
    '<p><b>Уровни «Средне» и «Сложно»</b> — нужен первый ход, который готовит мат. ' +
    'После вашего хода чёрные ответят (это сделает сайт), а вам останется поставить мат.</p>' +
    '<p><b>Как ходить.</b> Нажмите на свою фигуру — она поднимется, а клетки, куда можно пойти, ' +
    'подсветятся. Потом нажмите на одну из них. На телефоне точно так же, двумя нажатиями.</p>' +
    '<p><b>Если ошиблись</b> — можно нажать «Отменить ход».</p>' +
    '<p><b>Маты нет.</b> Можно нажать «Показать решение» — там вариант объясняют по шагам.</p>' +
    '<p>Под доской можно поменять цвет доски и набор фигур — выбирается любой понравившийся, ' +
    'выбор сохраняется.</p>',
  chessbot:
    '<p><b>Что нужно сделать.</b> Сыграть партию с компьютером. Вы — белые, ходит компьютер.</p>' +
    '<p>Бот добрый: играет не очень сильно, чтобы его можно было победить. ' +
    'Сила выбирается при входе в игру.</p>' +
    '<p><b>Как ходить.</b> Нажмите на фигуру, потом на клетку, куда её поставить.</p>' +
    '<p><b>Кнопки под доской.</b> «Отменить ход» возвращает последний ход, ' +
    '«Новая партия» начинает игру заново.</p>' +
    '<p>Цвет доски и набор фигур можно менять — выбранное сохраняется.</p>'
};

const HELP_ITEMS = [
  ['Как начать заниматься?',
    'Нажмите «Начать» на первом экране. При первом заходе сайт спросит имя — можно взять ' +
    'придуманное системой или написать своё. Дальше выберите задачу и уровень.'],
  ['Что такое задача дня?',
    'Вверху главного экрана есть карточка «Задача дня» — одна задача на день. ' +
    'Она не меняется, пока вы снова не зайдёте завтра.'],
  ['Я не смогла решить. Что делать?',
    'Нажмите «Показать решение» — там объясняют по шагам. Такая задача попадёт в карточку ' +
    '«Вернуться к ошибкам», и её можно будет попробовать снова.'],
  ['Где мои задачи?',
    'Внизу экрана есть папка «Мои задачи». Там собраны все решённые задачи: можно посмотреть ' +
    'разбор, пройти заново или отфильтровать по играм.'],
  ['Как поменять имя или фото?',
    'В профиле (кружок с лицом внизу) есть кнопка «Изменить имя, фото или год рождения». ' +
    'Все решённые задачи при этом останутся на месте.'],
  ['Как выбрать удобный вид?',
    'В профиле, раздел «Настройки»: четыре темы (жёлтая, голубая, белая, тёмная), ' +
    'там же ползунок увеличивает буквы. Ещё там включаются и выключаются звуки ' +
    'и выбирается мелодия при успехе.'],
  ['Что означает рейтинг?',
    'Места выдаются тем, кто решил больше задач, всего 50 мест. Рейтинг общий: ' +
    'видно, сколько задач решил каждый, и ваше место среди них.'],
  ['Когда отдых для глаз?',
    'Примерно через 15–20 минут занятий сайт сам предложит отдохнуть две минуты. ' +
    'Если не хочется — нажмите «Продолжить».'],
  ['Нужно ли вводить пароль?',
    'Нет. Сайт запоминает вас на этом телефоне, регистрация не нужна. ' +
    'Интернет нужен только для пейзажа и общего рейтинга — сами задачи работают и без него.'],
  ['Нужно ли что-то платить?',
    'Нет, сайт бесплатный и без рекламы.'],
  ['Что будет зимой?',
    'Оформление сейчас осеннее — через пару месяцев поставим зимнее: снежинки вместо пуговиц ' +
    'и холодные оттенки.']
];

document.getElementById('howBtn').addEventListener('click', () => {
  const box = document.getElementById('howBox');
  const text = document.getElementById('howText');
  /* В игре с ботом задачи нет — показываем правила шахмат, а не текст
     от предыдущей задачи (раньше подставлялся чужой разбор). */
  const kind = state.task ? state.task.kind : 'chessbot';
  text.innerHTML = HOW_TO[kind] || '';
  box.hidden = !box.hidden;
});

function renderHelp() {
  const box = document.getElementById('helpList');
  if (!box) return;
  box.innerHTML = '';
  HELP_ITEMS.forEach(pair => {
    const d = document.createElement('div');
    d.className = 'help-item';
    d.innerHTML = '<div class="help-q">' + esc(pair[0]) + '</div>' +
      '<div class="help-a">' + esc(pair[1]) + '</div>';
    box.appendChild(d);
  });
}

/* ---------------- ОТДЫХ ДЛЯ ГЛАЗ ---------------- */
/* Обратного отсчёта нет намеренно: он зависал, когда вкладка уходила в фон.
   Окно живёт, пока человек не нажмёт кнопку. */
const REST = {
  soonMin: 15,     /* раньше этого не напоминаем */
  soonMax: 20,     /* и не позже */
  due: 0,
  shown: false,
  paused: 0
};

function scheduleRest(minMinutes) {
  const min = minMinutes || (REST.soonMin + Math.random() * (REST.soonMax - REST.soonMin));
  REST.due = Date.now() + min * 60000;
}

/* пока вкладка закрыта, время не идёт — отсчёт откладываем */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    REST.paused = Date.now();
  } else if (REST.paused) {
    if (REST.due && !REST.shown) REST.due += Date.now() - REST.paused;
    REST.paused = 0;
  }
});

function openRest() {
  const overlay = document.getElementById('restOverlay');
  if (!overlay || REST.shown) return;
  REST.shown = true;
  overlay.hidden = false;
  const btn = document.getElementById('restSkip');
  if (btn) btn.focus();
}

function closeRest(nextInMinutes) {
  const overlay = document.getElementById('restOverlay');
  if (overlay) overlay.hidden = true;
  REST.shown = false;
  scheduleRest(nextInMinutes);
}

document.getElementById('restSkip').addEventListener('click', () => {
  closeRest();
  toast('Хорошо, продолжаем');
});
document.getElementById('restLater').addEventListener('click', () => {
  closeRest(REST.soonMax);   /* человек отдохнул — спросим чуть позже */
  toast('Хорошо отдохнули! Продолжайте 🙂');
});
/* Esc тоже закрывает — на случай, если окно перекрыло что-то важное */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && REST.shown) closeRest();
});

setInterval(() => {
  if (REST.due && Date.now() >= REST.due && !REST.shown) openRest();
}, 5000);

scheduleRest();

/* ---------------- АВАТАР ПО УМОЛЧАНИЮ ---------------- */
/* классический силуэт: круглая голова и полукруг-тело */
/* Аватар — рисованный значок, а не фотография */
function avatarHtml() {
  const p = state.profile;
  return '<span class="ava-emoji">' + avatarEmoji(p && p.avatar) + '</span>';
}
/* ---------------- СТАРТ ---------------- */
applyTheme();
renderThemes();
renderHelp();
updateFontPlusBtn();
/* Вход: сразу экран согласия с приветствием и пейзажем, без отдельного
   стартового экрана. Вернувшийся с профилем видит сразу задачи. */
enterSite();

/* Подключаем общую базу. Она не обязательна: нужна только для рейтинга
   и статистики посещений. Поэтому подключаем её ПОСЛЕ того, как сайт
   уже показан, и ничем не ждём.

   Раньше это делалось сразу при загрузке, и на слабой сети телефон
   показывал «загрузку» по несколько секунд: страница была готова,
   но ждала ответа базы. Теперь сайт открывается сразу, а база
   подключается через полсекунды — к тому моменту посетитель уже видит
   первый экран. Если база не ответит за DB_TIMEOUT (4 секунды), сайт
   продолжит работать без неё. */
function connectDbLater() {
  setTimeout(function () {
    (async function () {
      if (typeof db === 'undefined') return;
      const ok = await db.init();
      if (!ok) return;
      await db.countVisit();
      /* Сначала ждём, пока профиль запишется, и только потом читаем
         рейтинг. Раньше обе операции запускались подряд, не дожидаясь
         друг друга, и рейтинг приходил пустым. */
      if (state.profile) await db.saveProfile(state.profile);
      await refreshDbData();
      /* если посетитель уже открыл профиль — обновить его на экране */
      const scr = document.getElementById('screenProfile');
      if (scr && !scr.hidden && typeof showProfile === 'function') showProfile();
    })();
  }, 700);
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connectDbLater);
  } else {
    connectDbLater();
  }
}

async function refreshDbData() {
  if (typeof db === 'undefined' || !db.ok) return;
  const list = await db.rating();
  if (list) dbRanked = list;
  const s = await db.visitStats();
  if (s) dbStats = s;
}
