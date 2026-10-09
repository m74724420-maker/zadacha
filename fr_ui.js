/* ---------------- ПРЕДУПРЕЖДЕНИЕ О ГОЛОСЕ ----------------
   Если в телефоне нет французского голоса, раздел будет молчать.
   Говорим об этом прямо и объясняем, что сделать. Молча нельзя:
   человек подумает, что сайт сломан. */
function frVoiceNotice() {
  if (typeof speechSynthesis === 'undefined') {
    return '<div class="fr-nowarn" id="frNoVoice"><b>Звук в этом телефоне не поддерживается</b>'
         + 'Слова и переводы показаны текстом, но произнести их браузер не сможет. '
         + 'На телефоне звук работает.</div>';
  }
  /* голоса могли загрузиться не сразу — пробуем ещё раз */
  const v = frFindVoice();
  if (v) return '';
  /* Считаем, сколько голосов браузер знает: это сразу покажет, в чём
     дело — их нет совсем (список ещё грузится) или нет только
     французского (нужно доставить язык в настройках). */
  const all = frListVoices();
  const nFr = all.filter(function (x) { return /^fr([-_]|$)/i.test(x.lang || ''); }).length;
  const why = all.length === 0
    ? 'Браузер пока не загрузил ни одного голоса. Подождите пару секунд и ' +
      'нажмите «Послушать» ещё раз.'
    : 'Браузер знает голосов: ' + all.length + ', из них французских: ' + nFr + '. ' +
      'Если французского нет, его нужно доставить: Настройки → Время и язык → ' +
      'Язык → добавить «Français (France)», затем в этом же разделе нажать ' +
      '«Параметры» → «Речь» → «Загрузить», и только потом полностью закрыть ' +
      'и снова открыть браузер.';
  return '<div class="fr-nowarn" id="frNoVoice"><b>Звук пока не включается</b>'
       + why + ' А пока всё можно читать с экрана — учиться это не мешает.</div>';
}

/* =============================================================
   ФРАНЦУЗСКИЙ — интерфейс и логика

   Как всё устроено:
   - Паспорт: шесть точек Франции, у каждой пять уроков.
     Пройденная неделя ставит штамп.
   - Урок: три-четыре новых слова с озвучкой, сценка и упражнение.
   - Прогресс хранится на устройстве (localStorage), отдельно от задач.

   Про звук:
   - если для слова нашёлся файл fr/СЛОВО.ogg — играет запись человека;
   - иначе и всегда для фраз — голос телефона (fr-FR);
   - если французского голоса нет, честно пишем об этом и просим
     установить голос в настройках телефона.
   ============================================================= */

const FRS = {                       /* состояние французского */
  place: null,       /* индекс текущего места */
  lesson: 0,         /* номер урока внутри места */
  word: 0,           /* номер слова в уроке */
  stage: 'words',    /* words | scene | done */
  gram: 0,           /* номер открытой темы грамматики */
  total: 0,          /* сколько всего слов выучено */
  voice: null,       /* найденный французский голос */
  voiceChecked: false
};

/* ---------------- ГРАММАТИКА ----------------
   Отдельный пункт в паспорте. Он всегда открыт: грамматику не надо
   «проходить по порядку», к ней возвращаются, когда что-то забыли.
   Порядок тем внутри — тот, в котором проще учить. */

/* Список тем */
function frGrammarScreen() {
  const s = frLoad();
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>📐 Грамматика</h1>';
  html += '  <p class="fr-sub">Не учебник, а то, что нужно, чтобы заговорить. ' +
          'Коснитесь любой строки — услышите, как она звучит.</p>';
  html += '</div>';

  html += '<div class="fr-gramlist">';
  (FR.grammar || []).forEach(function (g, i) {
    const done = !!s.done['gram-' + g.id];
    html += '<button class="fr-gramcard' + (done ? ' done' : '') + '" data-gram="' + i + '">';
    html += '  <span class="fr-gram-emoji">' + g.emoji + '</span>';
    html += '  <span class="fr-gram-text">';
    html += '    <b>' + g.title + '</b>';
    html += '    <span>' + g.rows.length + ' фраз</span>';
    html += '  </span>';
    html += '  <span class="fr-stamp">' + (done ? '★' : '') + '</span>';
    html += '</button>';
  });
  html += '</div>';

  html += '<button class="big-btn fr-next" data-gram-back="1">← В паспорт</button>';
  return html;
}

/* Одна тема */
function frGrammarTopicScreen(i) {
  const g = (FR.grammar || [])[i];
  if (!g) return frGrammarScreen();
  const s = frLoad();
  const key = 'gram-' + g.id;

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>' + g.emoji + ' ' + g.title + '</h1>';
  html += '</div>';

  html += '<div class="fr-card">';
  html += '  <p class="fr-idea">' + g.idea + '</p>';
  html += '</div>';

  /* таблица примеров: каждая строка говорит */
  html += '<div class="fr-gramrows">';
  g.rows.forEach(function (row) {
    html += '<button class="fr-gramrow" data-say="' + escFr(row.fr) + '">';
    html += '  <span class="fr-gramrow-fr">' + escFr(row.fr) + '</span>';
    html += '  <span class="fr-gramrow-ru">' + escFr(row.ru) + '</span>';
    html += '  <span class="fr-gramrow-ic">🔊</span>';
    html += '</button>';
  });
  html += '</div>';

  if (g.tip) {
    html += '<div class="fr-tip">⚠ ' + escFr(g.tip) + '</div>';
  }

  /* напоминание о зеркале — то, о котором просили */
  html += '<button class="big-btn fr-next" id="frNext">' +
          (s.done[key] ? 'Ещё разок →' : 'Я сказала вслух →') + '</button>';
  html += '<button class="big-btn fr-next" data-gram-back="1">← Все темы</button>';

  return html;
}

/* Отметка «прочитала»: тема остаётся доступной, просто ставится звезда */
function frMarkGrammar(id) {
  const s = frLoad();
  const key = 'gram-' + id;
  if (!s.done[key]) {
    s.done[key] = true;
    frSave(frStampDay(s));
  }
}

/* ---------------- ПРОГРЕСС ---------------- */
const FR_KEY = 'fr_progress';

function frLoad() {
  let p = null;
  try { p = JSON.parse(localStorage.getItem(FR_KEY)); } catch (e) { }
  if (!p || typeof p !== 'object') p = {};
  return {
    done: p.done || {},        /* { 'paris-0': true, ... } — пройденные уроки */
    known: p.known || [],      /* список выученных слов */
    day: p.day || null,        /* последний день занятий */
    streak: p.streak || 0,     /* сколько дней подряд */
    last: p.last || 0          /* сколько слов всего */
  };
}
function frSave(s) {
  try { localStorage.setItem(FR_KEY, JSON.stringify(s)); } catch (e) { }
}
function frStampDay(s) {
  const today = new Date();
  const d = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  if (s.day === d) return s;                  /* уже сегодня отмечали */
  const y = new Date(today.getTime() - 86400000);
  const yd = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
  /* пропуск дня не обнуляет серию, а просто оставляет её в покое */
  s.streak = (s.day === yd) ? s.streak + 1 : 1;
  s.day = d;
  return s;
}

/* ---------------- СКолько слов в неделе ---------------- */
/* Слова делятся по местам: сначала идут все слова Парижа и т.д.
   Порядок берём из FR.words, а распределяем по списку — по очереди. */
function frPlaceWords(placeIndex) {
  const keys = Object.keys(FR.words);
  const perPlace = Math.ceil(keys.length / FR.places.length);
  const from = placeIndex * perPlace;
  return keys.slice(from, from + perPlace);
}

/* Слова нового урока: делим неделю на 5 дней, по 3-4 слова */
function frLessonWords(placeIndex, lesson) {
  const all = frPlaceWords(placeIndex);
  const n = all.length;
  const perLesson = Math.ceil(n / FR.places[placeIndex].days);
  const from = lesson * perLesson;
  return all.slice(from, from + perLesson);
}

/* ---------------- ЗВУК ---------------- */
/* Голос телефона: ищем французский. Если нет — скажем об этом честно. */
function frListVoices() {
  if (typeof speechSynthesis === 'undefined') return [];
  try { return speechSynthesis.getVoices() || []; } catch (e) { return []; }
}

/* Выбираем лучший французский голос из всех, что браузер знает:
   сначала французский из Франции, потом женский, потом любой. */
function frPickVoice(voices) {
  const fr = voices.filter(v => /^fr([-_]|$)/i.test(v.lang || ''));
  if (!fr.length) return null;
  return fr.find(v => /fr[-_]FR/i.test(v.lang || '')) ||
         fr.find(v => /femme|female|amélie|audrey|marie|virginie/i.test(v.name || '')) ||
         fr[0];
}

/* ПОЧЕМУ ЗДЕСЬ ВОЗНИ: браузер отдаёт список голосов НЕ СРАЗУ. При самом
   первом обращении список обычно пуст, а голоса приходят через пол-
   секунды (особенно Chrome). Раньше код запоминал «проверено» ДО того,
   как узнавал результат, — и голос не находился уже никогда, даже если
   французский стоял и появлялся через мигту. Теперь запоминаем только
   УДАЧУ; неудачу проверяем заново. */
function frFindVoice() {
  if (FRS.voice) return FRS.voice;                 /* уже нашли — готово */
  if (typeof speechSynthesis === 'undefined') return null;
  const v = frPickVoice(frListVoices());
  if (!v) return null;                             /* не нашли — попробуем позже */
  FRS.voice = v;
  FRS.voiceChecked = true;
  const n = document.getElementById('frNoVoice');
  if (n) n.hidden = true;                          /* убрать жёлтую подсказку */
  return v;
}

/* Пробуем несколько раз: первый пустой список — это нормально,
   он просто ещё подгружается. */
function frWatchVoices() {
  [0, 300, 900, 2000, 4000].forEach(function (ms) {
    setTimeout(function () {
      if (FRS.voice) return;
      frFindVoice();
    }, ms);
  });
}

/* Браузер сам сообщил, что голоса обновились */
if (typeof speechSynthesis !== 'undefined') {
  try {
    speechSynthesis.addEventListener('voiceschanged', function () {
      FRS.voice = null; FRS.voiceChecked = false;
      frFindVoice();
    });
  } catch (e) {
    try { speechSynthesis.onvoiceschanged = function () { FRS.voice = null; frFindVoice(); }; } catch (e2) { }
  }
}

/* Произнести фразу голосом телефона */
function frSpeak(text) {
  if (typeof speechSynthesis === 'undefined') return false;
  const v = frFindVoice();
  if (!v) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v;
    u.lang = v.lang || 'fr-FR';
    u.rate = 0.85;              /* медленнее — так лучше слышно */
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}

/* Произнести слово: сначала запись человека, иначе голос телефона */
function frSayWord(fr, ru) {
  const src = 'fr/' + fr + '.ogg';
  if (FRS.played !== src) {
    try {
      const a = new Audio(src);
      a.addEventListener('canplaythrough', function () { a.play(); FRS.played = src; });
      a.addEventListener('error', function () { frSpeak(fr); });
      a.load();
      /* если файл совсем не пошёл — читает телефон */
      setTimeout(function () {
        if (FRS.played !== src) frSpeak(fr);
      }, 1200);
      return;
    } catch (e) { }
  }
  frSpeak(fr);
}/* =============================================================
   ЭКРАН АЛФАВИТА

   Стоит первым пунктом в паспорте: без букв начинать нельзя.
   Урок: сначала смотрим буквы по одной и слушаем слово-пример,
   потом — проверка, где букву надо узнать на слух или по виду.

   Важная деталь: вслух произносится слово-пример, а не сама буква.
   Одинокая буква разными голосами читается по-разному, а слово
   звучит одинаково на любом устройстве.
   ============================================================= */

function frLettersOf(lesson) {
  const per = FR.lettersPerLesson;
  return FR.letters.slice(lesson * per, lesson * per + per);
}

/* ---------------- Буквы ---------------- */
/* Слово с диакритикой для показа: «ile» → «île», «zabre» → «zèbre».
   Ключи в словаре без диакритики (чтобы имя файла fr/СЛОВО.ogg было
   простым), а на экране бабушка видит правильную французскую запись. */
function frSpell(key) {
  const w = FR.words[key];
  return (w && w.fr) ? w.fr : key;
}

/* ---------------- ЭКРАН БУКВЫ ----------------
   Показываем обе вещи, потому что бабушка просила и то и другое:
   как называется сама буква и как звучит слово на неё. Раньше было
   только слово — и было непонятно, как же произносится буква. */
function frLettersScreen(lesson) {
  const list = frLettersOf(lesson);
  if (!list.length) return frLetterQuizScreen(lesson);
  const L = list[FRS.word];
  const s = frLoad();

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🔤 Французский алфавит</h1>';
  html += '  <p class="fr-sub">Урок ' + (lesson + 1) + ' из 2 · буква '
       + (FRS.word + 1) + ' из ' + list.length + '</p>';
  html += '  <div class="fr-progress"><i style="width:'
       + Math.round((FRS.word / list.length) * 100) + '%"></i></div>';
  html += '</div>';

  /* большая буква */
  html += '<div class="fr-letter-card">';
  html += '  <div class="fr-letter-big">' + L.up + L.lo + '</div>';
  html += '  <div class="fr-letter-name">'
       + escFr(L.name) + ' <span>— так это звучит по-французски</span></div>';
  html += '  <div class="fr-letter-ru">по-русски называют «' + L.ru + '»</div>';
  html += '</div>';

  /* две кнопки: отдельно буква, отдельно слово */
  html += '<div class="fr-two-btns">';
  html += '  <button class="big-btn fr-listen" id="frListenLetter">🔊 Буква</button>';
  html += '  <button class="big-btn fr-listen alt" id="frListenWord">🔊 Слово</button>';
  html += '</div>';

  /* слово-пример */
  html += '<div class="fr-example">';
  html += '  <div class="fr-example-emoji">' + L.emoji + '</div>';
  html += '  <div class="fr-example-word">' + escFr(frSpell(L.word)) + '</div>';
  html += '  <div class="fr-example-ru">' + L.wordRu + '</div>';
  if (L.quiet) html += '  <div class="fr-badge quiet">тихо — не читается</div>';
  if (L.loud)  html += '  <div class="fr-badge loud">звонко — читается</div>';
  html += '</div>';

  /* важное замечание про молчащие буквы */
  if (L.note) {
    html += '<div class="fr-tip">' + L.note + '</div>';
  }

  /* все буквы урока — нажатие произносит саму букву */
  html += '<div class="fr-letterlist">';
  list.forEach(function (x, i) {
    html += '<button class="fr-lchip' + (i === FRS.word ? ' now' : '') + '" data-letter="'
         + escFr(x.name) + '" data-sayword="' + escFr(x.word) + '">' + x.up + x.lo + '</button>';
  });
  html += '</div>';

  html += '<button class="big-btn fr-next" id="frNext">'
       + (FRS.word + 1 < list.length ? 'Дальше →' : 'Проверить буквы →') + '</button>';

  return html;
}

/* ---------------- Проверка по алфавиту ---------------- */
/* Показываем слово по-русски, надо выбрать букву, с которой оно
   начинается. Три варианта — один верный. */
function frLetterQuizState(lesson) {
  const list = frLettersOf(lesson);
  if (!FRS.lquiz) {
    const right = list[Math.floor(Math.random() * list.length)];
    const others = [];
    const all = FR.letters;
    let guard = 0;
    while (others.length < 2 && guard++ < 300) {
      const x = all[Math.floor(Math.random() * all.length)];
      if (x.up !== right.up && list.indexOf(x) < 0 && others.indexOf(x) < 0) others.push(x);
    }
    const opts = [right].concat(others);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = opts[i]; opts[i] = opts[j]; opts[j] = t;
    }
    FRS.lquiz = { right: right, opts: opts, answered: false };
  }
  return FRS.lquiz;
}

function frLetterQuizScreen(lesson) {
  const q = frLetterQuizState(lesson);
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🔤 Проверка букв</h1>';
  html += '  <p class="fr-sub">С какой буквы начинается «' + q.right.wordRu + '»?</p>';
  html += '</div>';

  html += '<div class="fr-example small">';
  html += '  <div class="fr-example-emoji">' + q.right.emoji + '</div>';
  html += '  <div class="fr-example-word">' + escFr(frSpell(q.right.word)) + '</div>';
  html += '  <div class="fr-example-ru">' + q.right.wordRu + '</div>';
  html += '</div>';

  html += '<div class="fr-letters-opts">';
  q.opts.forEach(function (x) {
    html += '<button class="big-btn fr-lopt" data-lopt="' + x.up + '">' + x.up + x.lo + '</button>';
  });
  html += '</div>';

  html += '<div class="fr-verdict" id="frVerdict"></div>';
  html += '<button class="big-btn fr-next" id="frNext" disabled>Дальше →</button>';
  return html;
}

/* ---------------- Итог по алфавиту ---------------- */
function frLettersDoneScreen(lesson) {
  const s = frLoad();
  const key = 'azbuka-' + lesson;
  if (!s.done[key]) {
    s.done[key] = true;
    frSave(frStampDay(s));
  }
  const all = lesson + 1 >= 2;

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>Алфавит пройден! 🎉</h1>';
  html += '  <p class="fr-sub">' + (all ? 'Теперь можно читать. Дальше — дорога.' : 'Вторая половина — впереди.') + '</p>';
  html += '</div>';

  /* вся таблица букв перед глазами — пусть висит как памятка */
  html += '<div class="fr-card">';
  html += '  <h2>Все буквы</h2>';
  html += '  <div class="fr-letterlist">';
  FR.letters.forEach(function (x) {
    html += '    <button class="fr-lchip" data-letter="' + escFr(x.name) + '">' + x.up + x.lo + '</button>';
  });
  html += '  </div>';
  html += '</div>';

  html += '<button class="big-btn fr-next" id="frNext">'
       + (all ? 'В Париж! 🗼 →' : 'Вторая половина →') + '</button>';
  html += '<button class="link-btn fr-passport" id="frToPassport">Паспорт</button>';

  return html;
}

/* =============================================================
   ПОТРЕНИРОВАТЬ РЕЧЬ ПЕРЕД ЗЕРКАЛОМ

   Бабушка учит французский вслух, но одна она: голос не слышно,
   ошибки не замечаешь, и через неделю выговорка закрепляется.

   Что делаем:
   - после слов — короткая карточка «скажите вслух»;
   - рядом кнопка «Как это звучит», чтобы сначала услышать себя;
   - отметка «я сказала» — без оценки, просто чтобы перейти дальше;
   - и мягкое напоминание в конце урока: потренироваться перед зеркалом.

   Правило простое: не ругаем, не требуем. Пропустила — ничего
   страшного, серия дней не обнуляется. Напоминание приятное, а не
   ноющее: человек должен хотеть вернуться, а не бояться.

   Почему без «речевого тренажёра»: чтобы понимать, правильно ли
   произнесено, нужен сервер, который слушает. Звук с телефона не
   отправляется никуда — это и хорошо для приватности, но проверить
   произношение он не может. Зеркало и вслух свою работу делают.
   ============================================================= */

/* Подсказки меняются, чтобы не приедалось */
const FR_MIRROR_TIPS = [
  'Встаньте перед зеркалом и скажите слово вслух три раза. Смотрите, как двигаются губы.',
  'Сначала послушайте, потом повторите. Говорите не быстро — French ne pressed pas.',
  'Скажите слово, потом гляньте в зеркало: губы должны двигаться. Молча тренироваться нельзя.',
  'Произнесите слово и поднимите палец: сколько раз осилили, столько и раз.',
  'Говорите громко, как будто стоите с кем-то на другом конце комнаты.'
];

function frMirrorTip(n) {
  return FR_MIRROR_TIPS[n % FR_MIRROR_TIPS.length];
}

/* ---------------- Карточка «потренироваться» ---------------- */
function frMirrorScreen(placeIndex, lesson) {
  const list = frLessonWords(placeIndex, lesson);
  const s = frLoad();
  const tipN = (Object.keys(s.done).length || 0) + (frState.place || 0);

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🪞 Потренируемся вслух</h1>';
  html += '  <p class="fr-sub">' + escFr(frMirrorTip(tipN)) + '</p>';
  html += '</div>';

  /* Слова этого урока — каждое со своей кнопкой «послушать» */
  html += '<div class="fr-mirror-list">';
  list.forEach(function (w) {
    html += '<button class="fr-mirror-row" data-say="' + escFr(w) + '">';
    html += '  <span class="fr-mirror-word">' + escFr(w) + '</span>';
    html += '  <span class="fr-mirror-ru">' + escFr(FR.words[w].ru) + '</span>';
    html += '  <span class="fr-mirror-play">🔊</span>';
    html += '</button>';
  });
  html += '</div>';

  html += '<button class="big-btn fr-next" id="frNext">Я сказала вслух →</button>';
  return html;
}

/* =============================================================
/* =============================================================
   ФРАНЦУЗСКИЕ ВИДЕО

   Раздел «Смотрим и слушаем»: живая французская речь.

   КАК ДОБАВИТЬ НОВОЕ ВИДЕТО — просто допишите строчку в FR.videos:

   1) Видео с Яндекс Видео или любой страницей (открывается в новой вкладке):
      { title: 'Как я знакомлюсь',
        note: 'Короткое видео',
        link: 'https://yandex.ru/video/preview/3864746720172312793',
        words: ['bonjour', 'salut'] },

   2) Видео с RuTube (встраивается прямо в страницу):
      { title: 'В кафе',
        note: 'Заказываем кофе',
        id: '12345678',
        words: ['cafe', 'merci'] },

   Что нужно:
     title — как называется ролик;
     note  — короткое пояснение (можно не писать);
     link  — полный адрес для видео с Яндекс Видео;
     id    — только ЦИФРЫ из адреса RuTube (https://rutube.ru/video/12345678/);
     words — слова, которые звучат в ролике, необязательно.

   Почему у Яндекс Видео кнопка, а не вставка: Яндекс не даёт встраивать
   ролик в чужую страницу, по ссылке iframe отвечает отказом. Проверено.
   Зато с RuTube всё показывается прямо в нашем разделе.

   Пустой ролик на экране ничего не показывает — вместо него тёплая
   заглушка: бабушка видит, что раздел ждёт материал, а не ошибку.
   ============================================================= */

FR.videos = [
  {
    title: 'Французский язык',
    note: 'Видео для начинающих',
    link: 'https://tel.yandex.ru/video/preview/3864746720172312793',
    words: ['bonjour', 'merci', 'salut', 'oui', 'non']
  }
  /* Дальше добавляйте новые ролики по образцу выше. */
];

/* ---------------- Список роликов ---------------- */
function frVideosScreen() {
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🎬 Смотрим и слушаем</h1>';
  html += '  <p class="fr-sub">Живая французская речь. Смотрите, как человек '
       + 'произносит, и повторяйте за ним вслух.</p>';
  html += '</div>';

  if (!FR.videos.length) {
    html += '<div class="fr-card fr-videos-empty">';
    html += '  <div class="fr-empty-emoji">🎧</div>';
    html += '  <h2>Видео скоро здесь будут</h2>';
    html += '  <p>Мы собираем короткие ролики с самыми нужными фразами: '
         + 'знакомство, покупка, в кафе, дорога.</p>';
    html += '  <p class="fr-note">А пока лучшее упражнение — вслух перед зеркалом: '
         + 'это заменяет любой ролик, если произносить правильно.</p>';
    html += '</div>';
    return html;
  }

  html += '<div class="fr-videos">';
  FR.videos.forEach(function (v, i) {
    html += '<button class="fr-video-card" data-video="' + i + '">';
    html += '  <span class="fr-video-play">▶</span>';
    html += '  <span class="fr-video-text">';
    html += '    <b>' + escFr(v.title) + '</b>';
    if (v.note) html += '    <span>' + escFr(v.note) + '</span>';
    html += '  </span>';
    html += '</button>';
  });
  html += '</div>';
  return html;
}

/* ---------------- Один ролик ---------------- */
function frVideoScreen(i) {
  const v = FR.videos[i];
  if (!v) return frVideosScreen();

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🎬 ' + escFr(v.title) + '</h1>';
  if (v.note) html += '  <p class="fr-sub">' + escFr(v.note) + '</p>';
  html += '</div>';

  if (v.id) {
    /* RuTube: ролик показывается прямо здесь */
    html += '<div class="fr-video-frame">';
    html += '  <iframe src="https://rutube.ru/play/embed/' + escFr(v.id) + '/"';
    html += '    title="' + escFr(v.title) + '" frameborder="0"';
    html += '    allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>';
    html += '</div>';
  } else if (v.link) {
    /* Яндекс Видео и прочие: встраивать нельзя, открываем в новой вкладке.
       Кнопка большая — чтобы бабушка не промахнулась. */
    html += '<a class="big-btn fr-open-video" href="' + escFr(v.link) + '"';
    html += '   target="_blank" rel="noopener">▶ Смотреть видео</a>';
    html += '<p class="fr-note">Видео откроется в новой вкладке. Когда посмотрите, '
         + 'вернитесь на эту страницу кнопкой «Назад».</p>';
  }

  /* слова из ролика — удобно повторить вслух */
  if (v.words && v.words.length) {
    html += '<div class="fr-card">';
    html += '  <h2>Слова, которые понадобятся</h2>';
    html += '  <div class="fr-wordlist">';
    v.words.forEach(function (w) {
      if (!FR.words[w]) return;
      html += '    <button class="fr-chip" data-say="' + escFr(w) + '">'
           + '<b>' + escFr(w) + '</b><span>' + escFr(FR.words[w].ru) + '</span></button>';
    });
    html += '  </div>';
    html += '  <p class="fr-note">Повторите каждое слово вслух, глядя в зеркало.</p>';
    html += '</div>';
  }

  html += '<button class="big-btn fr-next" id="frBack">← К роликам</button>';
  return html;
}

/* ---------------- ПРИВЯЗКА К ЭКРАНУ И КНОПКАМ ---------------- */

const frState = { place: 0, lesson: 0 };

/* =============================================================
   ФРАНЦУЗСКИЙ — экраны

   1. Паспорт — шесть мест, у пройденного штамп.
   2. Слова — новые слова урока по одному, с озвучкой.
   3. Сценка — маленький диалог, где говорит телефон.
   4. Проверка — перевести слово на русский.
   5. Готово — что выучено за день.

   Всё крупное: бабушка должна попасть пальцем.
   ============================================================= */

/* ---------------- ПАСПОРТ ---------------- */
function frPassport() {
  const s = frLoad();
  let html = '';

  html += '<div class="fr-hello">';
  html += '  <h1>Французский язык 🇫🇷</h1>';
  html += '  <p class="fr-sub">Каждое занятие — новая точка Франции. Немного, но каждый день делаем шаг.</p>';
  html += '  <div class="fr-counters">';
  html += '    <div class="fr-counter"><b>' + s.known.length + '</b><span>слов знаю</span></div>';
  html += '    <div class="fr-counter"><b>' + s.streak + '</b><span>дней подряд</span></div>';
  html += '    <div class="fr-counter"><b>' + Object.keys(s.done).length + '</b><span>уроков</span></div>';
  html += '  </div>';
  html += '</div>';

  html += frVoiceNotice();

  /* Алфавит стоит первым: без букв читать нечего */
  const azbDone = countLessonsDone(s, -1);
  const azbAll = azbDone >= 2;
  html += '<button class="fr-place alphabet' + (azbAll ? ' done' : '') + '" data-alpha="1">';
  html += '  <span class="fr-place-emoji">🔤</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Французский алфавит</b>';
  html += '    <span class="fr-place-fr">A B C D E F G…</span>';
  html += '    <span class="fr-place-sub">' + azbDone + ' из 2 уроков · 26 букв</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp">' + (azbAll ? '★' : '') + '</span>';
  html += '</button>';

  FR.places.forEach(function (p, i) {
    const doneCount = countLessonsDone(s, i);
    const allDone = doneCount >= p.days;
    const locked = i > 0 && countLessonsDone(s, i - 1) < FR.places[i - 1].days;
    const placeWords = frPlaceWords(i);

    html += '<button class="fr-place' + (allDone ? ' done' : '') + (locked ? ' locked' : '')
         + '" data-place="' + i + '"' + (locked ? ' disabled' : '') + '>';
    html += '  <span class="fr-place-emoji">' + p.emoji + '</span>';
    html += '  <span class="fr-place-text">';
    html += '    <b>' + p.nameRu + '</b>';
    html += '    <span class="fr-place-fr">' + p.nameFr + '</span>';
    html += '    <span class="fr-place-sub">' + doneCount + ' из ' + p.days
         + ' уроков · ' + placeWords.length + ' слов</span>';
    html += '  </span>';
    html += '  <span class="fr-stamp">' + (allDone ? '★' : (locked ? '🔒' : '')) + '</span>';
    html += '</button>';
  });

  html += '<p class="fr-note">Место открывается, когда пройдено предыдущее. '
       + 'За день — один урок, минут на десять.</p>';

  /* Грамматика — тоже всегда открыта: это не урок, а справка,
     к которой возвращаются, когда забыли. */
  const gDone = (FR.grammar || []).filter(function (g) { return !!s.done['gram-' + g.id]; }).length;
  html += '<button class="fr-place grammar-card" data-grammar="1">';
  html += '  <span class="fr-place-emoji">📐</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Грамматика</b>';
  html += '    <span class="fr-place-fr">le · la · être · avoir</span>';
  html += '    <span class="fr-place-sub">' + (FR.grammar || []).length + ' тем · прочитано ' + gDone + '</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp">' + (gDone >= (FR.grammar || []).length && gDone > 0 ? '★' : '') + '</span>';
  html += '</button>';

  /* Видео — отдельный пункт, он всегда открыт: это не урок,
     а возможность послушать живую речь когда захочется. */
  const nVid = (FR.videos && FR.videos.length) || 0;
  html += '<button class="fr-place videos-card" data-videos="1">';
  html += '  <span class="fr-place-emoji">🎬</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Смотрим и слушаем</b>';
  html += '    <span class="fr-place-fr">vidéos</span>';
  html += '    <span class="fr-place-sub">'
       + (nVid ? nVid + ' роликов с живой речью' : 'видео скоро появятся')
       + '</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp"></span>';
  html += '</button>';

  return html;
}

function countLessonsDone(s, placeIndex) {
  if (placeIndex === -1) {          /* алфавит */
    let n = 0;
    if (s.done['azbuka-0']) n++;
    if (s.done['azbuka-1']) n++;
    return n;
  }
  const p = FR.places[placeIndex];
  let n = 0;
  for (let l = 0; l < p.days; l++) if (s.done[p.code + '-' + l]) n++;
  return n;
}

/* ---------------- СЛОВА УРОКА ---------------- */
function frWordsScreen(placeIndex, lesson) {
  const s = frLoad();
  const place = FR.places[placeIndex];
  const list = frLessonWords(placeIndex, lesson);
  if (!list.length) return frSceneScreen(placeIndex, lesson);

  const w = list[FRS.word];
  const key = FR.words[w];
  let html = '';

  html += '<div class="fr-hello">';
  html += '  <h1>' + place.emoji + ' ' + place.nameRu + '</h1>';
  html += '  <p class="fr-sub">Урок ' + (lesson + 1) + ' из ' + place.days
       + ' · слово ' + (FRS.word + 1) + ' из ' + list.length + '</p>';
  html += '  <div class="fr-progress"><i style="width:'
       + Math.round((FRS.word / list.length) * 100) + '%"></i></div>';
  html += '</div>';

  html += '<div class="fr-word-card">';
  html += '  <div class="fr-word-emoji">' + (key.emoji || '🔤') + '</div>';
  html += '  <div class="fr-word-fr">' + escFr(w) + '</div>';
  html += '  <div class="fr-word-ru">' + escFr(key.ru) + '</div>';
  html += '  <button class="big-btn fr-listen" id="frListen">🔊 Послушать</button>';
  html += '</div>';

  html += '<div class="fr-wordlist">';
  list.forEach(function (x) {
    const known = s.known.indexOf(x) >= 0;
    html += '<button class="fr-chip' + (known ? ' known' : '') + '" data-say="' + escFr(x) + '">'
         + '<b>' + escFr(x) + '</b><span>' + escFr(FR.words[x].ru) + '</span></button>';
  });
  html += '</div>';

  html += '<button class="big-btn fr-next" id="frNext">'
       + (FRS.word + 1 < list.length ? 'Дальше →' : 'К сценке →') + '</button>';

  return html;
}

/* ---------------- СЦЕНКА ---------------- */
function frSceneScreen(placeIndex, lesson) {
  const place = FR.places[placeIndex];
  const scene = FR.scenes.find(function (x) { return x.place === place.code; });
  if (!scene) return frQuizScreen(placeIndex, lesson);

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>' + scene.emoji + ' ' + scene.title + '</h1>';
  html += '  <p class="fr-sub">Послушайте, как звучит по-настоящему. Нажимайте на строчки.</p>';
  html += '</div>';

  html += '<div class="fr-scene">';
  scene.lines.forEach(function (l) {
    html += '<button class="fr-line" data-say="' + escFr(l.fr) + '">';
    html += '  <span class="fr-line-fr">' + escFr(l.fr) + '</span>';
    html += '  <span class="fr-line-ru">' + escFr(l.ru) + '</span>';
    html += '</button>';
  });
  html += '</div>';

  html += '<button class="big-btn fr-next" id="frNext">Проверить знания →</button>';
  return html;
}

/* ---------------- ПРОВЕРКА ---------------- */
/* Показываем слово по-русски, надо выбрать по-французски. Три варианта,
   один правильный. Ошибка не страшная — можно пробовать снова. */
function frQuizState(placeIndex, lesson) {
  const list = frLessonWords(placeIndex, lesson);
  if (!FRS.quiz) {
    const right = list[Math.floor(Math.random() * list.length)];
    const others = [];
    const all = Object.keys(FR.words);
    let guard = 0;
    while (others.length < 2 && guard++ < 200) {
      const w = all[Math.floor(Math.random() * all.length)];
      if (w !== right && list.indexOf(w) < 0 && others.indexOf(w) < 0) others.push(w);
    }
    const opts = [right].concat(others);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = opts[i]; opts[i] = opts[j]; opts[j] = t;
    }
    FRS.quiz = { right: right, opts: opts, answered: false };
  }
  return FRS.quiz;
}

function frQuizScreen(placeIndex, lesson) {
  const q = frQuizState(placeIndex, lesson);
  const place = FR.places[placeIndex];
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>Проверка: ' + place.emoji + '</h1>';
  html += '  <p class="fr-sub">Как по-французски будет «'
       + escFr(FR.words[q.right].ru) + '»?</p>';
  html += '</div>';

  html += '<div class="fr-opts">';
  q.opts.forEach(function (w) {
    html += '<button class="big-btn fr-opt" data-opt="' + escFr(w) + '">'
         + escFr(w) + '<span>' + escFr(FR.words[w].ru) + '</span></button>';
  });
  html += '</div>';
  html += '<div class="fr-verdict" id="frVerdict"></div>';
  /* Кнопка «Дальше» есть сразу, но пока не отвечено — не активна.
     Раньше её не было вовсе, и после ответа человек оставался
     на этом экране без пути дальше. */
  html += '<button class="big-btn fr-next" id="frNext" disabled>Дальше →</button>';
  return html;
}

/* ---------------- ГОТОВО ---------------- */
function frDoneScreen(placeIndex, lesson) {
  const s = frLoad();
  const place = FR.places[placeIndex];
  const list = frLessonWords(placeIndex, lesson);

  /* отмечаем урок пройденным */
  const key = place.code + '-' + lesson;
  if (!s.done[key]) {
    s.done[key] = true;
    list.forEach(function (w) { if (s.known.indexOf(w) < 0) s.known.push(w); });
    s.last = s.known.length;
    frSave(frStampDay(s));
  }

  const doneCount = countLessonsDone(s, placeIndex);
  const allDone = doneCount >= place.days;

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>Урок пройден! 🎉</h1>';
  html += '  <p class="fr-sub">' + place.emoji + ' ' + place.nameRu + ' · урок '
       + (lesson + 1) + ' из ' + place.days + '</p>';
  html += '</div>';

  html += '<div class="fr-card">';
  html += '  <h2>Новые слова</h2>';
  html += '  <ul class="fr-learned">';
  list.forEach(function (w) {
    html += '    <li><b>' + escFr(w) + '</b><span>' + escFr(FR.words[w].ru) + '</span></li>';
  });
  html += '  </ul>';
  html += '</div>';

  html += '<div class="fr-card">';
  html += '  <div class="fr-bigcounter"><b>' + s.known.length + '</b>'
       + '<span>французских слов вы знаете</span></div>';
  if (s.streak > 1) html += '  <p class="fr-praise">' + frPraise(s.streak) + '</p>';
  /* напоминание о зеркале — тёплое и без нравоучений */
  html += '  <p class="fr-mirror-remind">🪞 Перед зеркалом произнесите вслух '
       + 'слова сегодняшнего урока — три раза каждое. Так выговорка '
       + 'закрепится быстрее, чем от одного чтения про себя.</p>';
  html += '</div>';

  const nextPlace = Math.min(placeIndex + 1, FR.places.length - 1);
  html += '<button class="big-btn fr-next" id="frNext">'
       + (allDone ? 'Дальше: ' + FR.places[nextPlace].nameRu + ' →' : 'Следующий урок →')
       + '</button>';
  html += '<button class="link-btn fr-passport" id="frToPassport">Паспорт</button>';

  return html;
}

/* Похвала без давления: пропуск дня не обнуляет серию */
function frPraise(n) {
  if (n >= 30) return 'Целый месяц! Это уже просто часть дня.';
  if (n >= 14) return 'Две недели подряд — замечательно.';
  if (n >= 7)  return 'Неделя подряд!';
  return 'Второй день подряд — привычка начинается.';
}

function escFr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function frRender() {
  const box = document.getElementById('frArea');
  if (!box) return;
  let html;
  if (FRS.stage === 'passport') html = frPassport();
  else if (FRS.stage === 'grammar') html = frGrammarScreen();
  else if (FRS.stage === 'gtopic') html = frGrammarTopicScreen(FRS.gram);
  else if (FRS.stage === 'letters')  html = frLettersScreen(frState.lesson);
  else if (FRS.stage === 'lquiz')   html = frLetterQuizScreen(frState.lesson);
  else if (FRS.stage === 'ldone')   html = frLettersDoneScreen(frState.lesson);
  else if (FRS.stage === 'mirror')  html = frMirrorScreen(frState.place, frState.lesson);
  else if (FRS.stage === 'videos')  html = frVideosScreen();
  else if (FRS.stage === 'video')   html = frVideoScreen(FRS.video);
  else if (FRS.stage === 'words')   html = frWordsScreen(frState.place, frState.lesson);
  else if (FRS.stage === 'scene')   html = frSceneScreen(frState.place, frState.lesson);
  else if (FRS.stage === 'quiz')    html = frQuizScreen(frState.place, frState.lesson);
  else                              html = frDoneScreen(frState.place, frState.lesson);
  box.innerHTML = html;
  frBind();
}

function frBind() {
  const box = document.getElementById('frArea');
  if (!box) return;

  /* пункт «Грамматика» в паспорте */
  box.querySelectorAll('.fr-place.grammar-card').forEach(function (b) {
    b.addEventListener('click', function () {
      FRS.stage = 'grammar';
      frRender();
    });
  });

  /* выбрать тему грамматики */
  box.querySelectorAll('[data-gram]').forEach(function (b) {
    b.addEventListener('click', function () {
      FRS.stage = 'gtopic';
      FRS.gram = Number(b.dataset.gram);
      frRender();
    });
  });

  /* назад из грамматики в паспорт */
  box.querySelectorAll('[data-gram-back]').forEach(function (b) {
    b.addEventListener('click', function () {
      FRS.stage = 'passport';
      frRender();
    });
  });

  /* пункт «Смотрим и слушаем» в паспорте */
  box.querySelectorAll('.fr-place.videos-card').forEach(function (b) {
    b.addEventListener('click', function () {
      FRS.stage = 'videos';
      frRender();
    });
  });

  /* выбрать ролик */
  box.querySelectorAll('.fr-video-card').forEach(function (b) {
    b.addEventListener('click', function () {
      FRS.video = parseInt(b.dataset.video, 10);
      FRS.stage = 'video';
      frRender();
    });
  });

  /* назад к списку роликов */
  const backV = document.getElementById('frBack');
  if (backV) backV.addEventListener('click', function () {
    FRS.stage = 'videos';
    frRender();
  });

  /* карточка алфавита в паспорте */
  box.querySelectorAll('.fr-place.alphabet').forEach(function (b) {
    b.addEventListener('click', function () {
      frState.place = -1;
      frState.lesson = 0;
      FRS.word = 0;
      FRS.lquiz = null;
      frFindVoice();
      frWatchVoices();
      const s = frLoad();
      if (s.done['azbuka-0']) frState.lesson = 1;
      FRS.stage = 'letters';
      frRender();
    });
  });

  /* место в паспорте */
  /* Только настоящие места. Карточки алфавита и видео тоже имеют
     класс .fr-place, но у них нет data-place — раньше они попадали
     сюда же, и обращение к FR.places[-1] роняло страницу. */
  box.querySelectorAll('.fr-place[data-place]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.hasAttribute('disabled')) return;
      frState.place = parseInt(b.dataset.place, 10);
      frState.lesson = 0;
      FRS.word = 0;
      FRS.quiz = null;
      frFindVoice();
      frWatchVoices();
      const s = frLoad();
      const p = FR.places[frState.place];
      for (let l = 0; l < p.days; l++) {
        if (!s.done[p.code + '-' + l]) { frState.lesson = l; break; }
      }
      FRS.stage = 'words';
      frRender();
    });
  });

  /* послушать слово (обычный урок слов) */
  const listen = document.getElementById('frListen');
  if (listen) listen.addEventListener('click', function () {
    const list = frLessonWords(frState.place, frState.lesson);
    const w = list[FRS.word];
    if (w) frSayWord(w, FR.words[w].ru);
  });

  /* Послушать БУКВУ (алфавит). Говорим не саму букву латиницей —
     разные программы читают «A» по-разному, а «bé», «ache», «èle»
     любой французский голос произносит одинаково и правильно. */
  const listenL = document.getElementById('frListenLetter');
  if (listenL) listenL.addEventListener('click', function () {
    const list = frLettersOf(frState.lesson);
    const x = list[FRS.word];
    if (x) frSpeak(x.name);
  });

  /* Послушать СЛОВО на эту букву */
  const listenW = document.getElementById('frListenWord');
  if (listenW) listenW.addEventListener('click', function () {
    const list = frLettersOf(frState.lesson);
    const x = list[FRS.word];
    if (x) frSayWord(frSpell(x.word), x.wordRu);
  });

  /* любой кусочек с фразой — говорит */
  box.querySelectorAll('[data-say]').forEach(function (b) {
    b.addEventListener('click', function () { frSpeak(b.dataset.say); });
  });

  /* буква в списке: короткое нажатие — сама буква, долгое — слово.
     Бабушке проще, если не надо запоминать два разных нажатия:
     долгое нажатие трудно сделать случайно. */
  box.querySelectorAll('[data-letter]').forEach(function (b) {
    let timer = null;
    let saidLong = false;
    const stop = function () {
      if (timer) { clearTimeout(timer); timer = null; }
    };
    b.addEventListener('pointerdown', function () {
      saidLong = false;
      timer = setTimeout(function () {
        saidLong = true;
        frSayWord(frSpell(b.dataset.sayword), '');
      }, 600);
    });
    b.addEventListener('pointerup', stop);
    b.addEventListener('pointercancel', function () { saidLong = true; stop(); });
    b.addEventListener('pointerleave', stop);
    b.addEventListener('click', function () {
      if (saidLong) return;          /* долгое нажатие уже сказало слово */
      frSpeak(b.dataset.letter);
    });
  });

  /* вперёд */
  const next = document.getElementById('frNext');
  if (next) next.addEventListener('click', function () {
    /* --- грамматика: отмечаем прочитанное и возвращаемся к списку --- */
    if (FRS.stage === 'gtopic') {
      const g = (FR.grammar || [])[FRS.gram];
      if (g) frMarkGrammar(g.id);
      FRS.stage = 'grammar';
      frRender();
      return;
    }

    /* --- алфавит --- */
    if (FRS.stage === 'letters') {
      const list = frLettersOf(frState.lesson);
      if (FRS.word + 1 < list.length) { FRS.word++; }
      else FRS.stage = 'lquiz';
      frRender(); return;
    }
    if (FRS.stage === 'lquiz') { FRS.stage = 'ldone'; frRender(); return; }
    if (FRS.stage === 'ldone') {
      /* второй урок алфавита — если он ещё не пройден */
      if (frState.lesson < 1) {
        frState.lesson = 1; FRS.word = 0; FRS.lquiz = null;
        FRS.stage = 'letters';
        frRender(); return;
      }
      /* алфавит закончен — сразу в Париж, к первому непройденному уроку.
         Ниже идёт обычная ветка мест, поэтому место должно быть настоящим. */
      if (frState.place < 0) frState.place = 0;
      frState.lesson = 0; FRS.word = 0; FRS.quiz = null;
      const s2 = frLoad();
      for (let l = 0; l < FR.places[0].days; l++) {
        if (!s2.done[FR.places[0].code + '-' + l]) { frState.lesson = l; break; }
      }
      FRS.stage = 'words';
      frRender(); return;
    }

    /* --- обычный урок слов --- */
    if (FRS.stage === 'words') {
      const list = frLessonWords(frState.place, frState.lesson);
      if (FRS.word + 1 < list.length) { FRS.word++; frRender(); }
      else FRS.stage = 'mirror';
    } else if (FRS.stage === 'mirror') {
      /* сказали вслух — идём к живой сценке */
      FRS.stage = 'scene';
    } else if (FRS.stage === 'scene') {
      FRS.stage = 'quiz';
      FRS.quiz = null;
    } else if (FRS.stage === 'quiz') {
      FRS.stage = 'done';
    } else if (frState.place < 0) {
      /* алфавит не должен попадать в ветку мест */
      FRS.stage = 'passport'; frRender(); return;
    } else {
      const s = frLoad();
      const p = FR.places[frState.place];
      if (countLessonsDone(s, frState.place) >= p.days) {
        if (frState.place + 1 < FR.places.length) {
          frState.place++;
          frState.lesson = 0;
        }
      } else {
        frState.lesson = Math.min(frState.lesson + 1, p.days - 1);
      }
      FRS.word = 0;
      FRS.quiz = null;
      const s2 = frLoad();
      const p2 = FR.places[frState.place];
      for (let l = 0; l < p2.days; l++) {
        if (!s2.done[p2.code + '-' + l]) { frState.lesson = l; break; }
      }
      FRS.stage = 'words';
    }
    frRender();
  });

  /* в паспорт */
  const toPass = document.getElementById('frToPassport');
  if (toPass) toPass.addEventListener('click', function () {
    FRS.stage = 'passport';
    frRender();
  });

  /* ответы в проверке букв */
  box.querySelectorAll('.fr-lopt').forEach(function (b) {
    b.addEventListener('click', function () {
      const v = document.getElementById('frVerdict');
      const q = FRS.lquiz;
      if (!v || !q || q.answered) return;
      if (b.dataset.lopt === q.right.up) {
        q.answered = true;
        b.classList.add('right');
        v.className = 'fr-verdict ok';
        v.textContent = 'Верно! ' + q.right.word + ' — «' + q.right.ru + '»';
        frSpeak(frSpell(q.right.word));
        const nx = document.getElementById('frNext');
        if (nx) nx.disabled = false;
      } else {
        b.classList.add('wrong');
        v.className = 'fr-verdict no';
        v.textContent = 'Это «' + b.dataset.lopt + '». Послушайте слово ещё раз и попробуйте другую.';
        frSpeak(frSpell(q.right.word));
      }
    });
  });

  /* ответы в проверке */
  box.querySelectorAll('.fr-opt').forEach(function (b) {
    b.addEventListener('click', function () {
      const v = document.getElementById('frVerdict');
      const q = FRS.quiz;
      if (!v || !q || q.answered) return;
      if (b.dataset.opt === q.right) {
        q.answered = true;
        b.classList.add('right');
        v.className = 'fr-verdict ok';
        v.textContent = 'Верно! ' + q.right + ' — ' + FR.words[q.right].ru;
        frSpeak(q.right);
        /* отпускаем кнопку «Дальше» — иначе после ответа некуда идти */
        const nx = document.getElementById('frNext');
        if (nx) nx.disabled = false;
      } else {
        b.classList.add('wrong');
        v.className = 'fr-verdict no';
        v.textContent = 'Это «' + b.dataset.opt + '». Попробуйте другую.';
        frSpeak(b.dataset.opt);
      }
    });
  });
}

/* Кнопка «Французский» в главном меню.
   Открываем обычный игровой экран, но внутри него — наш раздел,
   поэтому вёрстка и кнопка «Назад» остаются те же самые. */
function frOpen() {
  FRS.stage = 'passport';
  FRS.played = null;
  FRS.word = 0;
  FRS.quiz = null;
  frState.place = 0;
  frState.lesson = 0;
  frFindVoice();
  frWatchVoices();

  /* Открываем тот же игровой экран, но наш раздел занимает всю ширину.
     openTask здесь не нужен: он создаёт задачу со своим оформлением,
     а у нас своё. */
  if (typeof hideAllGameAreas === 'function') hideAllGameAreas();
  const area = document.getElementById('frArea');
  if (area) area.hidden = false;

  /* Прячем кнопки обычных задач: подсказку, «Как это решать?»,
     «Показать решение», «Другая задача» и шахматные кнопки. Раньше
     они оставались на экране, и в разделе французского бабушка
     видела «Как это решать?», будто задача ей непонятна.
     Вернуть их на место — в openTask, когда она снова понадобится. */
  ['hintBtn', 'howBtn', 'solutionBtn', 'anotherBtn',
   'chessBtns', 'chessStyles', 'chessScore'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) { el.hidden = true; el.dataset.frHidden = '1'; }
  });
  const title = document.getElementById('gameTitle');
  const level = document.getElementById('gameLevel');
  if (title) title.textContent = 'Французский язык';
  if (level) level.textContent = 'Путешествие по Франции';

  if (typeof show === 'function') show('screenGame');
  frRender();
}
