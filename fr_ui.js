/* ---------------- ПРЕДУПРЕЖДЕНИЕ О ГОЛОСЕ ----------------
   Если в телефоне нет французского голоса, раздел будет молчать.
   Говорим об этом прямо и объясняем, что сделать. Молча нельзя:
   человек подумает, что сайт сломан. */
function frVoiceNotice() {
  if (typeof speechSynthesis === 'undefined') {
    return '<div class="fr-nowarn" id="frNoVoice"><b>Слова показаны текстом</b>'
         + 'Этот телефон не умеет читать вслух. Всё можно читать с экрана — '
         + 'а французскую речь послушайте в видеоуроках.</div>';
  }
  const v = frFindVoice();
  if (v) return '';

  /* Здесь раньше было наставление: «установите в телефон французский
     язык». Убираем его намеренно.

     Почему: человек (чаще всего пожилой) читает это и пугается. Он
     боится, что телефон перейдёт на французский, — и закрывает раздел
     и больше не возвращается. Просьба «чтобы работало, надо что-то
     поменять в настройках» пугает сильнее, чем помогает.

     На самом деле язык в телефон ставить НЕ нужно: он ничего не
     переключает в системе, только добавляет голос для чтения. Но
     просить об этом нельзя.

     Что делаем вместо: не давим, показываем, что звук есть в
     видеоуроках, и оставляем выбор за человеком. Захочет голос —
     добавит сам, когда будет спокойнее. */
  const all = frListVoices();
  const nFr = all.filter(function (x) { return /^fr([-_]|$)/i.test(x.lang || ''); }).length;
  return '<div class="fr-nowarn" id="frNoVoice">'
       + '<b>Звук: послушайте видеоуроки</b>'
       + 'Слова и фразы нажимаются — телефон прочитает их своим голосом, '
       + 'если умеет по-французски (умеет: ' + nFr + '). '
       + 'Если читает молча, ничего страшного: настоящая французская речь '
       + 'в разделе «Смотрим и слушаем», там 66 уроков с живым голосом. '
       + 'Менять настройки телефона для этого не нужно.'
       + '</div>';
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

/* Состояние тренажёров: перевод, числа. Объявлены здесь, чтобы не
   плодить безымянные переменные в окне. */
let frPractice = null;   /* {all, order, pos, good, total, locked} */
let frNumState = null;   /* {q, n, good, locked} */
let frQuery = '';        /* что набрано в поиске словарика */

const FRS = {                       /* состояние французского */
  place: null,       /* индекс текущего места */
  lesson: 0,         /* номер урока внутри места */
  word: 0,           /* номер слова в уроке */
  stage: 'words',    /* words | scene | done */
  gram: 0,           /* номер открытой темы грамматики */
  phrase: 0,         /* номер открытой ситуации разговорника */
  micro: 0,          /* номер открытой темы-слова */
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

  /* Разделяем список на части: чем сложнее, тем ниже. Одной сплошной
     лентой тридцать тем не прочитать — да и незачем. */
  const all = FR.grammar || [];
  const groups = [
    { title: 'Сначала это',
      note: 'Без этого не сказать ни слова. По одной теме в день.',
      list: all.filter(function (g) { return !g.level; }) },
    { title: 'Сложнее — когда основное освоите',
      note: 'Здесь согласование, местоимения и предлоги. Это то, чем французца отличают от туриста.',
      list: all.filter(function (g) { return g.level === 2; }) },
    { title: 'Времена — сердце языка',
      note: 'Прошедшее, будущее, вежливость и «чтобы». Читайте подряд, по одной теме в день.',
      list: all.filter(function (g) { return g.level === 3; }) },
    { title: 'Самый трудный угол',
      note: 'Это уже для тех, кто прошёл всё остальное. Не торопитесь.',
      list: all.filter(function (g) { return g.level === 4; }) }
  ];

  function group(title, note, list) {
    if (!list.length) return '';
    let out = '';
    out += '<h2 class="fr-gram-head">' + title + '</h2>';
    out += '<p class="fr-gram-note">' + note + '</p>';
    list.forEach(function (g) {
      const done = !!s.done['gram-' + g.id];
      const n = all.indexOf(g);
      out += '<button class="fr-gramcard' + (done ? ' done' : '') + '" data-gram="' + n + '">';
      out += '  <span class="fr-gram-emoji">' + g.emoji + '</span>';
      out += '  <span class="fr-gram-text">';
      out += '    <b>' + escFr(g.title) + '</b>';
      out += '    <span>' + g.rows.length + ' фраз' + (g.tip ? ' · есть правило' : '') + '</span>';
      out += '  </span>';
      out += '  <span class="fr-stamp">' + (done ? '★' : '') + '</span>';
      out += '</button>';
    });
    return out;
  }

  html += '<div class="fr-gramlist">';
  groups.forEach(function (g) { html += group(g.title, g.note, g.list); });
  html += '</div>';

  html += '<button class="big-btn fr-next" data-gram-back="1">← В паспорт</button>';
  return html;
}

/* =============================================================
   ДЕРЕВО — РИСУЕМ И СЧИТАЕМ

   Дерево живёт по данным из frLoad(): полоска дней (streak) говорит,
   насколько оно выросло, а дата последнего занятия — не завяло ли оно.

   Всё рисуется обычным SVG без картинок: так быстрее, ничего не
   грузится и работает даже на слабом телефоне. Листья, цветы и плоды
   рисуются по списку координат — сколько их, столько и видно.
   ============================================================= */

/* Сколько прошло дней с последнего занятия. 0 — сегодня. */
function frDaysSince(s) {
  if (!s || !s.last) return 999;
  const diff = Date.now() - Number(s.last);
  const days = Math.floor(diff / 86400000);
  return days < 0 ? 0 : days;
}

/* Состояние дерева: стадия, вянет ли, что сказать бабушке */
function frTreeState() {
  const s = frLoad();
  const streak = Math.max(0, Number(s.streak) || 0);
  const dry = frDaysSince(s);
  const watered = dry === 0 && streak > 0;

  /* стадия по полоске: чем длиннее, тем выше */
  let stage = 0;
  const need = FR.treeStageNeed || [1, 1, 3, 7, 14, 30];
  for (let i = 0; i < need.length; i++) {
    if (streak >= need[i]) stage = i;
  }

  const info = (FR.treeStages && FR.treeStages[stage]) || { name: 'семечко', word: 'graine', hint: '' };
  /* сколько дней осталось до следующей стадии */
  const nextNeed = (stage + 1 < need.length) ? need[stage + 1] : null;
  const toNext = nextNeed === null ? 0 : Math.max(0, nextNeed - streak);

  return {
    streak: streak,
    dry: dry,
    watered: watered,
    stage: stage,
    stageName: info.name,
    stageWord: info.word,
    hint: info.hint,
    nextNeed: nextNeed,
    toNext: toNext,
    isMax: nextNeed === null
  };
}

/* Листья: координаты снизу вверх, чтобы дерево нарастало по-настоящему */
const FR_LEAVES = [
  [50, 62], [38, 68], [62, 68], [44, 56], [56, 56], [50, 48],
  [34, 58], [66, 58], [42, 42], [58, 42], [50, 34], [38, 48],
  [62, 48], [46, 28], [54, 28]
];
const FR_FLOWERS = [[42, 44], [58, 44], [50, 36]];
const FR_FRUITS = [[40, 60], [60, 60], [50, 52], [46, 68], [56, 66]];

/* Сколько листьев показываем на текущей стадии */
function frLeafCount(stage) {
  return [0, 2, 5, 9, 12, 15][stage] || 0;
}

/* Цвет листа: чем дольше без занятий, тем желтее и тусклее */
function frLeafColor(dry, i) {
  if (dry >= 3) return ['#a9743f', '#8c5a2c', '#b5813f'][i % 3];
  if (dry === 2 && i % 2 === 0) return '#c8a13c';
  if (dry === 1) return '#7c9a52';
  return ['#4e8b3a', '#5f9c46', '#437c33'][i % 3];
}

/* Рисуем дерево */
function frTreeSvg(t) {
  let svg = '<svg class="fr-tree-svg" viewBox="0 0 100 110" aria-hidden="true">';

  /* земля */
  svg += '<ellipse class="fr-tree-soil" cx="50" cy="100" rx="34" ry="7"/>';

  /* семечко, если дерево ещё не проросло */
  if (t.stage === 0) {
    svg += '<ellipse class="fr-tree-seed" cx="50" cy="92" rx="5" ry="7"/>';
    svg += '</svg>';
    return svg;
  }

  /* ствол: чем выше стадия, тем длиннее */
  const h = [0, 8, 18, 30, 38, 44][t.stage];
  svg += '<path class="fr-tree-trunk" d="M47 97 L47 ' + (97 - h) + ' L53 ' + (97 - h) + ' L53 97 Z"/>';

  /* ветви — появляются со второй стадии */
  if (t.stage >= 2) {
    const y = 97 - h + 6;
    svg += '<path class="fr-tree-branch" d="M50 ' + y + ' L36 ' + (y - 7) + '"/>';
    svg += '<path class="fr-tree-branch" d="M50 ' + (y + 3) + ' L64 ' + (y - 4) + '"/>';
  }
  if (t.stage >= 3) {
    const y = 97 - h + 1;
    svg += '<path class="fr-tree-branch" d="M50 ' + y + ' L38 ' + (y - 6) + '"/>';
    svg += '<path class="fr-tree-branch" d="M50 ' + (y + 2) + ' L62 ' + (y - 5) + '"/>';
  }

  /* листья. Когда дерево сохнет, часть осыпается — это видно сразу */
  let leaves = frLeafCount(t.stage);
  if (t.dry >= 5) leaves = Math.min(leaves, 2);
  if (t.dry >= 3) leaves = Math.min(leaves, Math.ceil(frLeafCount(t.stage) * 0.4));

  for (let i = 0; i < leaves && i < FR_LEAVES.length; i++) {
    const p = FR_LEAVES[i];
    /* при увядании листок повисает */
    const rot = t.dry >= 2 ? ((i % 3) * 12 - 12) : ((i % 2) ? 8 : -8);
    svg += '<ellipse class="fr-tree-leaf" cx="' + p[0] + '" cy="' + p[1] + '" rx="7" ry="5.5"'
         + ' fill="' + frLeafColor(t.dry, i) + '"'
         + ' transform="rotate(' + rot + ' ' + p[0] + ' ' + p[1] + ')"/>';
  }

  /* цветы — на четвёртой стадии */
  if (t.stage >= 4 && t.dry < 3) {
    for (let i = 0; i < FR_FLOWERS.length; i++) {
      const p = FR_FLOWERS[i];
      svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.4" fill="#e5708c"/>';
      svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.3" fill="#ffd9e0"/>';
    }
  }

  /* плоды — на пятой стадии */
  if (t.stage >= 5 && t.dry < 3) {
    for (let i = 0; i < FR_FRUITS.length; i++) {
      const p = FR_FRUITS[i];
      svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#c0392b"/>';
    }
  }

  svg += '</svg>';
  return svg;
}

/* Блок с деревом для паспорта */
function frTreeCard() {
  const t = frTreeState();
  let html = '';

  let state, title, note;
  if (t.watered) {
    state = 'watered';
    title = 'Сегодня дерево полито ✓';
    note = 'День подряд: <b>' + t.streak + '</b>. ' + escFr(t.hint);
  } else if (t.stage === 0) {
    state = 'dry';
    title = 'Дерево ещё не выросло';
    note = 'Пройдите любой урок французского — и появится росток.';
  } else if (t.dry === 1) {
    state = 'dry';
    title = 'Дерево чуть завяло';
    note = 'Вчера занимались, сегодня нет. Одно занятие — и всё живо.';
  } else if (t.dry >= 7) {
    state = 'dead';
    title = 'Дерево засохло';
    note = 'Несколько дней без занятий. Дерево ждёт: сделайте один урок — и листья вернутся.';
  } else if (t.dry >= 2) {
    state = 'dead';
    title = 'Листья опадают';
    note = 'Не занимались ' + t.dry + ' дн. Один урок — и дерево снова зелёное.';
  } else {
    state = 'ok';
    title = 'Дерево ждёт занятия';
    note = 'Сегодня ещё не занимались.';
  }

  html += '<div class="fr-tree fr-tree-' + state + '">';
  html += '  <div class="fr-tree-pic">' + frTreeSvg(t) + '</div>';
  html += '  <div class="fr-tree-info">';
  html += '    <div class="fr-tree-name">' + title + '</div>';
  html += '    <div class="fr-tree-sub">' + note + '</div>';

  /* сколько до следующей стадии */
  if (!t.isMax && t.streak > 0 && t.dry < 2) {
    html += '    <div class="fr-tree-next">До «' + escFr(t.stageName) + '» '
         + (t.toNext > 0
              ? 'ещё ' + t.toNext + ' ' + frWord(t.toNext, 'день', 'дня', 'дней')
              : 'уже почти — ещё сегодня!')
         + '</div>';
  }
  html += '  </div>';
  html += '</div>';

  return html;
}

/* ---------- ДЕРЕВО НА ГЛАВНОМ ЭКРАНЕ ----------
   На паспорте дерево большое и с подробностями. На главном экране
   места мало, поэтому тут маленькая копия и одна строка: полито
   сегодня или ждёт. Главное — чтобы человек, открывший сайт,
   сразу увидел, что дерево сохнет. Это и есть смысл дерева. */
function frTreeMini() {
  const t = frTreeState();
  if (t.stage === 0) {
    return '<svg class="fr-mini-svg" viewBox="0 0 100 110" aria-hidden="true">'
         + '<ellipse class="fr-tree-soil" cx="50" cy="100" rx="34" ry="7"/>'
         + '<ellipse class="fr-tree-seed" cx="50" cy="92" rx="5" ry="7"/>'
         + '</svg>';
  }
  /* берём ту же картинку, но без земли — подписью она и так есть */
  let svg = frTreeSvg(t);
  svg = svg.replace('<ellipse class="fr-tree-soil" cx="50" cy="100" rx="34" ry="7"/>', '');
  return svg.replace('class="fr-tree-svg"', 'class="fr-mini-svg"');
}

/* Строка под карточкой французского на главном экране */
function frTreeStrip() {
  if (typeof frTreeState !== 'function') return '';
  const t = frTreeState();
  let cls, text;
  if (t.streak === 0) {
    cls = 'fresh';
    text = 'Пройдите урок — и вырастет дерево';
  } else if (t.watered) {
    cls = 'good';
    text = 'Дерево полито сегодня ✓ · ' + t.streak + ' ' + frWord(t.streak, 'день', 'дня', 'дней') + ' подряд';
  } else if (t.dry === 1) {
    cls = 'warn';
    text = 'Вчера занимались, сегодня нет. Дерево ждёт';
  } else {
    cls = 'bad';
    text = 'Дерево сохнет: ' + t.dry + ' ' + frWord(t.dry, 'день', 'дня', 'дней')
         + ' без занятия. Один урок — и всё зеленеет';
  }
  return '<div class="fr-mini fr-mini-' + cls + '">'
       + '<span class="fr-mini-pic">' + frTreeMini() + '</span>'
       + '<span class="fr-mini-text">' + text + '</span>'
       + '</div>';
}

/* Русские окончания: 1 день, 2 дня, 5 дней */
function frWord(n, one, few, many) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

/* =============================================================
   НОВЫЕ РАЗДЕЛЫ ФРАНЦУЗСКОГО
   Часть 1: разговорник, микро-темы, словарик, практика перевода.

   Здесь только показ — как и в грамматике. Сами тексты лежат
   в файлах fr_extra1.js (разговорник) и fr_extra2.js (микро-темы).
   ============================================================= */

/* Все слова темы-строки разом: словарь, практика и всё остальное */
function frAllRows() {
  const out = [];
  (FR.phrases || []).forEach(function (sec) {
    sec.rows.forEach(function (r) { out.push({ fr: r.fr, ru: r.ru, from: sec.title }); });
  });
  (FR.micro || []).forEach(function (sec) {
    sec.rows.forEach(function (r) { out.push({ fr: r.fr, ru: r.ru, from: sec.title }); });
  });
  return out;
}

/* ---------------- РАЗГОВОРНИК ---------------- */
function frPhrasesScreen() {
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>💬 Разговорник</h1>';
  html += '  <p class="fr-sub">Готовые фразы по ситуациям. Коснитесь — услышите. ' +
          'Это то, что нужно в дороге.</p>';
  html += '</div>';
  html += '<div class="fr-gramlist">';
  (FR.phrases || []).forEach(function (sec, i) {
    html += '<button class="fr-gramcard" data-phrase="' + i + '">';
    html += '  <span class="fr-gram-emoji">' + sec.emoji + '</span>';
    html += '  <span class="fr-gram-text">';
    html += '    <b>' + escFr(sec.title) + '</b>';
    html += '    <span>' + sec.rows.length + ' фраз</span>';
    html += '  </span>';
    html += '  <span class="fr-stamp"></span>';
    html += '</button>';
  });
  html += '</div>';
  html += '<button class="big-btn fr-next" data-gram-back="1">← В паспорт</button>';
  return html;
}

function frPhraseScreen(i) {
  const sec = (FR.phrases || [])[i];
  if (!sec) return frPhrasesScreen();
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>' + sec.emoji + ' ' + escFr(sec.title) + '</h1>';
  html += '</div>';
  if (sec.note) html += '<div class="fr-tip">' + escFr(sec.note) + '</div>';
  html += frRowsHtml(sec.rows);
  html += '<button class="big-btn fr-next" data-gram-back="1">← Разговорник</button>';
  return html;
}

/* Общий кусок: список фраз, каждая говорится касанием */
function frRowsHtml(rows) {
  let html = '<div class="fr-gramrows">';
  rows.forEach(function (row) {
    html += '<button class="fr-gramrow" data-say="' + escFr(row.fr) + '">';
    html += '  <span class="fr-gramrow-fr">' + escFr(row.fr) + '</span>';
    html += '  <span class="fr-gramrow-ru">' + escFr(row.ru) + '</span>';
    html += '  <span class="fr-gramrow-ic">🔊</span>';
    html += '</button>';
  });
  html += '</div>';
  return html;
}

/* ---------------- МИКРО-ТЕМЫ ---------------- */
function frMicroScreen() {
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🗂 Слова по темам</h1>';
  html += '  <p class="fr-sub">Дни недели, месяцы, цвета, мебель, профессии. ' +
          'Такие слова приходят пачками — и учить их по одному в уроке бессмысленно.</p>';
  html += '</div>';
  html += '<div class="fr-gramlist">';
  (FR.micro || []).forEach(function (sec, i) {
    html += '<button class="fr-gramcard" data-micro="' + i + '">';
    html += '  <span class="fr-gram-emoji">' + sec.emoji + '</span>';
    html += '  <span class="fr-gram-text">';
    html += '    <b>' + escFr(sec.title) + '</b>';
    html += '    <span>' + sec.rows.length + ' слов</span>';
    html += '  </span>';
    html += '  <span class="fr-stamp"></span>';
    html += '</button>';
  });
  html += '</div>';
  html += '<button class="big-btn fr-next" data-gram-back="1">← В паспорт</button>';
  return html;
}

function frMicroTopicScreen(i) {
  const sec = (FR.micro || [])[i];
  if (!sec) return frMicroScreen();
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>' + sec.emoji + ' ' + escFr(sec.title) + '</h1>';
  html += '</div>';
  if (sec.note) html += '<div class="fr-tip">⚠ ' + escFr(sec.note) + '</div>';
  html += frRowsHtml(sec.rows);
  html += '<button class="big-btn fr-next" id="frNext">Я сказала вслух →</button>';
  html += '<button class="big-btn fr-next" data-gram-back="1">← Все темы</button>';
  return html;
}

/* Все слова словаря: из уроков, разговорника и тем. Вынесено отдельно,
   потому что нужно и при отрисовке, и при каждом нажатии в поиске. */
function frWordbookWords() {
  let words = Object.keys(FR.words || {}).map(function (k) {
    return { key: k, fr: frSpell(k), ru: FR.words[k].ru, from: 'Уроки' };
  });
  (FR.phrases || []).forEach(function (sec) {
    sec.rows.forEach(function (r) {
      words.push({ key: r.fr, fr: r.fr, ru: r.ru, from: sec.title });
    });
  });
  (FR.micro || []).forEach(function (sec) {
    sec.rows.forEach(function (r) {
      words.push({ key: r.fr, fr: r.fr, ru: r.ru, from: sec.title });
    });
  });
  return words;
}

/* ---------------- СЛОВАРИК ----------------
   Все слова: из уроков, разговорника и микро-тем, одним списком.
   С поиском — иначе в трёхстах словах ничего не найти. */
function frWordbookScreen() {
  const words = frWordbookWords();
  const q = (frQuery || '').toLowerCase().trim();
  const shown = q ? words.filter(function (w) {
    return w.fr.toLowerCase().indexOf(q) >= 0 || String(w.ru).toLowerCase().indexOf(q) >= 0;
  }) : words;

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>📖 Словарик</h1>';
  html += '  <p class="fr-sub">Все ' + words.length + ' слов. Знаете: ' +
          (frLoad().known.length) + '. Нажмите на поиск и начните печатать.</p>';
  html += '</div>';

  html += '<input class="fr-search" id="frSearch" type="text" placeholder="Поиск: слово или перевод" value="'
       + escFr(frQuery || '') + '" autocomplete="off">';

  html += '<p class="fr-gram-note" id="frWbCount">' + (q ? 'Найдено: ' + shown.length : 'Показаны все') + '</p>';

  /* Список в отдельном блоке с номером: при вводе мы обновляем только
     его, а не перерисовываем весь экран. Иначе поле поиска каждый раз
     пропадало бы и теряло фокус — печатать было бы невозможно. */
  html += '<div class="fr-gramrows" id="frWbRows">' + frWbRowsHtml(shown) + '</div>';
  if (shown.length > 400) {
    html += '<p class="fr-note">Показаны первые 400. Уточните поиск, чтобы найти нужное.</p>';
  }
  html += '<button class="big-btn fr-next" data-gram-back="1">← В паспорт</button>';
  return html;
}

/* Только строки словаря — для обновления на ходу ввода */
function frWbRowsHtml(shown) {
  const s = frLoad();
  let html = '';
  shown.slice(0, 400).forEach(function (w) {
    const known = s.known.indexOf(w.key) >= 0;
    html += '<button class="fr-gramrow' + (known ? ' known' : '') + '" data-say="' + escFr(w.fr) + '">';
    html += '  <span class="fr-gramrow-fr">' + escFr(w.fr) + '</span>';
    html += '  <span class="fr-gramrow-ru">' + escFr(w.ru) + '</span>';
    html += '  <span class="fr-gramrow-ic">🔊</span>';
    html += '</button>';
  });
  if (!shown.length) {
    html += '<p class="fr-note">Ничего не нашлось. Попробуйте другое слово.</p>';
  }
  return html;
}

/* ---------------- ПРАКТИКА ПЕРЕВОДА ----------------
   Русский → французский. Три варианта, один верный.
   Без оценки «неправильно» — это не экзамен, а повторение.
   Ошибка не сбивает: просто показываем верный ответ. */
function frPracticeState() {
  const s = frLoad();
  if (!frPractice) {
    const all = frAllRows();
    if (!all.length) return null;
    frPractice = { all: all, i: 0, good: 0, total: 0, order: frShuffle(all.map((_, k) => k)), pos: 0 };
  }
  return frPractice;
}

function frShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function frPracticeScreen() {
  const p = frPracticeState();
  if (!p) return '<div class="fr-hello"><h1>Практика</h1></div>';
  /* Как и в числах: отвеченный вопрос при возврате заменяем новым,
     иначе экран встретит пустой проверкой и заблокированной кнопкой. */
  if (p.locked) { p.locked = false; p.pos++; }
  if (p.pos >= 12) {
    /* один заход — двенадцать вопросов, потом результат */
    let html = '';
    html += '<div class="fr-hello">';
    html += '  <h1>' + (p.good >= 9 ? '🎉 Отлично!' : (p.good >= 6 ? '👍 Хорошо!' : '💪 Ещё потренируем?')) + '</h1>';
    html += '  <p class="fr-sub">Правильно: ' + p.good + ' из ' + p.total + '</p>';
    html += '</div>';
    html += '<p class="fr-idea">Ответили не на все — это нормально. ' +
            'Ошибки показывают, какие слова стоит повторить ещё раз.</p>';
    html += '<button class="big-btn fr-next" id="frAgain">Ещё раз →</button>';
    html += '<button class="big-btn fr-next" data-gram-back="1">← В паспорт</button>';
    return html;
  }
  const answer = p.all[p.order[p.pos]];
  /* три варианта: верный и два случайных */
  const others = frShuffle(p.all.filter(function (x) { return x.fr !== answer.fr; })).slice(0, 2);
  const opts = frShuffle([answer].concat(others));

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🔁 Как это по-французски?</h1>';
  html += '  <p class="fr-sub">Вопрос ' + (p.pos + 1) + ' из 12</p>';
  html += '</div>';
  html += '<div class="fr-card"><p class="fr-idea">' + escFr(answer.ru) + '</p></div>';
  html += '<div class="fr-prac-opts">';
  opts.forEach(function (o) {
    html += '<button class="big-btn fr-prac-opt" data-prac="' + escFr(o.fr) + '">' +
            escFr(o.fr) + '</button>';
  });
  html += '</div>';
  html += '<div class="fr-prac-verdict" id="frPracVerdict"></div>';
  html += '<button class="big-btn fr-next" id="frNext" disabled>Дальше →</button>';
  return html;
}

/* Слова, где ошибались: помогаем на них остановиться */
function frPracticeMark(good, fr) {
  const s = frLoad();
  const bad = s.pracBad || [];
  const i = bad.indexOf(fr);
  if (!good && i < 0) bad.push(fr);
  if (good && i >= 0) bad.splice(i, 1);
  s.pracBad = bad;
  frSave(s);
}

/* =============================================================
   НОВЫЕ РАЗДЕЛЫ ФРАНЦУЗСКОГО
   Часть 2: числа и время, дневник достижений.

   Числа и время — тренажёр. Считаем и говорим вслух, проверяем
   выбором из трёх. Ошибка не обижает: показываем верный ответ.
   ============================================================= */

/* ---------------- ЧИСЛА И ВРЕМЯ ---------------- */
const FR_NUM_UNITS = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const FR_NUM_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante',
  'soixante', 'quatre-vingt', 'quatre-vingt'];

function frNumber(n) {
  if (n < 20) return FR_NUM_UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7) return u === 0 ? 'soixante-dix' : (u === 1 ? 'soixante et onze' : 'soixante-' + FR_NUM_UNITS[u]);
  if (t === 9) return u === 0 ? 'quatre-vingt-dix' : (u === 1 ? 'quatre-vingt-onze' : 'quatre-vingt-' + FR_NUM_UNITS[u]);
  if (t === 8) return u === 0 ? 'quatre-vingts' : 'quatre-vingt-' + FR_NUM_UNITS[u];
  if (u === 0) return FR_NUM_TENS[t];
  if (u === 1 && t !== 8) return FR_NUM_TENS[t] + ' et un';
  return FR_NUM_TENS[t] + '-' + FR_NUM_UNITS[u];
}

function frTime(h, m) {
  if (m === 0) return 'à ' + frNumber(h) + ' heures';
  if (m === 15) return 'à ' + frNumber(h) + ' heures et quart';
  if (m === 30) return 'à ' + frNumber(h) + ' heures et demie';
  if (m === 45) return 'à ' + frNumber(h) + ' heures moins le quart';
  return 'à ' + frNumber(h) + ' heures ' + frNumber(m);
}

/* Загадываем вопрос: либо сложение, либо время */
function frNumNext() {
  const kind = Math.random() < 0.5 ? 'sum' : 'time';
  let q, right, speak;
  if (kind === 'sum') {
    const a = 10 + Math.floor(Math.random() * 40);
    const b = 10 + Math.floor(Math.random() * 40);
    q = a + ' + ' + b + ' = ?';
    right = a + b;
    speak = frNumber(right);
  } else {
    const h = 1 + Math.floor(Math.random() * 12);
    const m = [0, 15, 30, 45, 5, 10, 20, 40][Math.floor(Math.random() * 8)];
    q = 'Который час? ' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    right = frTime(h, m);
    speak = right;
  }
  /* три варианта: верный и два других */
  const others = [];
  if (kind === 'sum') {
    while (others.length < 2) {
      const d = right + (Math.floor(Math.random() * 11) - 5) * (1 + Math.floor(Math.random() * 3));
      if (d > 0 && d !== right && others.indexOf(d) < 0) others.push(d);
    }
  } else {
    const h2 = 1 + Math.floor(Math.random() * 12);
    const m2 = [0, 20, 45][Math.floor(Math.random() * 3)];
    const alt = frTime(h2, m2);
    if (alt !== right) others.push(alt);
    else others.push(frTime(h2 === 12 ? 1 : h2 + 1, 0));
    others.push(frNumber(50 + Math.floor(Math.random() * 40)));
  }
  const opts = frShuffle([String(right)].concat(others.map(String)));
  return { kind: kind, q: q, right: String(right), speak: speak, opts: opts };
}

function frNumScreen() {
  if (!frNumState) frNumState = { n: 0, good: 0, locked: false, q: null };
  const st = frNumState;
  /* Залипание: если вопрос уже отвечен, а человек вышел и вернулся,
     экран покажет пустую проверку и заблокированную кнопку — тупик.
     Поэтому при возврате начинаем новый вопрос. Ответ уже засчитан,
     счётчик его не потеряет. */
  if (st.locked) { st.locked = false; st.q = null; }

  if (st.n >= 10) {
    let html = '';
    html += '<div class="fr-hello">';
    html += '  <h1>' + (st.good >= 8 ? '🎉 Отлично!' : '💪 Ещё потренируем?') + '</h1>';
    html += '  <p class="fr-sub">Правильно: ' + st.good + ' из ' + st.n + '</p>';
    html += '</div>';
    html += '<button class="big-btn fr-next" id="frNumAgain">Ещё раз →</button>';
    html += '<button class="big-btn fr-next" data-gram-back="1">← В паспорт</button>';
    return html;
  }

  if (!st.q) st.q = frNumNext();
  const q = st.q;

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🔢 Числа и время</h1>';
  html += '  <p class="fr-sub">Задача ' + (st.n + 1) + ' из 10</p>';
  html += '</div>';

  html += '<div class="fr-card"><p class="fr-idea">' + escFr(q.q) + '</p></div>';

  html += '<button class="big-btn fr-say" data-say="' + escFr(q.speak) + '">🔊 Как это по-французски</button>';

  html += '<div class="fr-prac-opts">';
  q.opts.forEach(function (o) {
    html += '<button class="big-btn fr-prac-opt" data-num="' + escFr(o) + '">' + escFr(o) + '</button>';
  });
  html += '</div>';

  html += '<div class="fr-prac-verdict" id="frPracVerdict"></div>';
  html += '<button class="big-btn fr-next" id="frNext" disabled>Дальше →</button>';
  return html;
}

/* ---------------- ДНЕВНИК ДОСТИЖЕНИЙ ----------------
   Не «уроков пройдено», а живые вехи. Показываем только те,
   что уже случились: смотреть на недостигнутое обидно. */
function frAchievements() {
  const s = frLoad();
  let lessons = 0;
  Object.keys(s.done || {}).forEach(function (k) {
    if (k.indexOf('azbuka-') === 0 || k.indexOf('gram-') === 0) return;
    lessons++;
  });
  const gram = Object.keys(s.done || {}).filter(function (k) { return k.indexOf('gram-') === 0; }).length;
  const azbuka = Object.keys(s.done || {}).filter(function (k) { return k.indexOf('azbuka-') === 0; }).length;
  const words = (s.known || []).length;
  const streak = Math.max(0, Number(s.streak) || 0);
  const tree = frTreeState();

  const list = [];
  if (streak >= 1) list.push({ e: '💧', t: 'Первый день', d: 'Вы начали. Это самое главное.' });
  if (streak >= 3) list.push({ e: '🌱', t: 'Три дня подряд', d: 'Запомнить легче, когда это три дня, а не разово.' });
  if (streak >= 7) list.push({ e: '🌳', t: 'Неделя без пропусков', d: 'Неделя — срок, на который мозг уже считает привычкой.' });
  if (streak >= 30) list.push({ e: '🌸', t: 'Месяц', d: 'Месяц занятий. Это уже не «попробовать», а уметь.' });
  if (azbuka >= 1) list.push({ e: '🔤', t: 'Алфавит пройден', d: 'Теперь можно читать французский.' });
  if (azbuka >= 2) list.push({ e: '📖', t: 'Все 26 букв', d: 'Весь алфавит в руках.' });
  if (words >= 10) list.push({ e: '💬', t: '10 новых слов', d: 'Десять слов — уже словарь.' });
  if (words >= 30) list.push({ e: '🗂', t: '30 слов', d: 'С такими словами можно договориться.' });
  if (words >= 60) list.push({ e: '🏅', t: '60 слов', d: 'Полсотни слов — это уже разговор.' });
  if (lessons >= 1) list.push({ e: '🛤', t: 'Первый урок', d: 'Путешествие началось.' });
  if (lessons >= 5) list.push({ e: '🗼', t: '5 уроков', d: 'Первая неделя поездки.' });
  if (gram >= 1) list.push({ e: '📐', t: 'Первая тема грамматики', d: 'Правила начали оседать.' });
  if (gram >= 10) list.push({ e: '🎓', t: '10 тем грамматики', d: 'Десять тем — хорошая база.' });
  if (tree.stage >= 3) list.push({ e: '🌳', t: 'Дерево выросло', d: 'Дерево — ваша полоска дней в зелени.' });

  const next = [];
  if (streak < 1) next.push({ d: 1, t: 'Первый день' });
  else if (streak < 3) next.push({ d: 3, t: 'Три дня подряд' });
  else if (streak < 7) next.push({ d: 7, t: 'Неделя без пропусков' });
  else if (streak < 30) next.push({ d: 30, t: 'Месяц' });
  if (words < 10) next.push({ d: 10 - words, t: '10 новых слов' });
  else if (words < 30) next.push({ d: 30 - words, t: '30 слов' });

  return { list: list, next: next.slice(0, 2), words: words, lessons: lessons, gram: gram, streak: streak };
}

function frAchieveScreen() {
  const a = frAchievements();
  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>🏆 Достижения</h1>';
  html += '  <p class="fr-sub">' + a.list.length + ' ' + frWord(a.list.length, 'медаль', 'медали', 'медалей') +
          ' · ' + a.streak + ' ' + frWord(a.streak, 'день', 'дня', 'дней') + ' подряд</p>';
  html += '</div>';

  if (a.list.length) {
    html += '<h2 class="fr-gram-head">Ваши</h2>';
    html += '<div class="fr-achieve">';
    a.list.forEach(function (x) {
      html += '<div class="fr-ach"><span class="fr-ach-e">' + x.e + '</span>'
           + '<span class="fr-ach-t"><b>' + escFr(x.t) + '</b><span>' + escFr(x.d) + '</span></span></div>';
    });
    html += '</div>';
  } else {
    html += '<div class="fr-card"><p class="fr-idea">Пока пусто. Пройдите один урок — '
         + 'и здесь появится первая медаль.</p></div>';
  }

  if (a.next.length) {
    html += '<h2 class="fr-gram-head">Ближайшие</h2>';
    a.next.forEach(function (x) {
      html += '<div class="fr-ach fr-ach-next"><span class="fr-ach-e">🎯</span>'
           + '<span class="fr-ach-t"><b>' + escFr(x.t) + '</b><span>ещё ' + x.d + ' '
           + frWord(x.d, 'шаг', 'шага', 'шагов') + '</span></span></div>';
    });
  }

  html += '<button class="big-btn fr-next" data-gram-back="1">← В паспорт</button>';
  return html;
}

/* ---------------- ЭКРАН ТЕМЫ ----------------
   Тема теперь состоит из пяти частей:
     idea        — коротко, о чём вообще;
     rules       — правило по шагам, с французскими примерами;
     exceptions  — исключения из правила (выделены, их читают обязательно);
     mistakes    — как говорят неправильно и почему;
     rows        — фразы, которые произносятся касанием;
     tip         — что чаще всего забывают.

   Подробные части лежат не здесь, а в файлах fr_grammar_deep*.js —
   здесь только показ. Так править проще: тексты отдельно, логика отдельно.
   Если для темы подробностей нет (FR.grammarDeep[id] пуст), показывается
   только idea, фразы и подсказка — как раньше. */

/* Собираем тему целиком: берём её из FR.grammar и подмешиваем подробности. */
function frDeepOf(id) {
  return (FR.grammarDeep && FR.grammarDeep[id]) || null;
}

/* В тексте правил французские примеры стоят в русских кавычках «…».
   Эту часть делаем живой: коснёшься — голос произнесёт. */
function frSayableText(text) {
  return escFr(String(text)).replace(/«([^»]*)»/g, function (all, inner) {
    const s = inner.trim();
    if (!s) return all;
    return '<b class="fr-say" data-say="' + escFr(s) + '">' + escFr(inner) + '</b>';
  });
}

/* Одна тема */
function frGrammarTopicScreen(i) {
  const g = (FR.grammar || [])[i];
  if (!g) return frGrammarScreen();
  const s = frLoad();
  const key = 'gram-' + g.id;
  const deep = frDeepOf(g.id);

  let html = '';
  html += '<div class="fr-hello">';
  html += '  <h1>' + g.emoji + ' ' + escFr(g.title) + '</h1>';
  html += '</div>';

  html += '<div class="fr-card">';
  html += '  <p class="fr-idea">' + frSayableText(g.idea) + '</p>';
  html += '</div>';

  /* ---- правило по шагам ---- */
  if (deep && deep.rules && deep.rules.length) {
    html += '<h2 class="fr-gram-head">Как это устроено</h2>';
    html += '<ol class="fr-rules">';
    deep.rules.forEach(function (r) {
      html += '  <li>' + frSayableText(r) + '</li>';
    });
    html += '</ol>';
  }

  /* ---- исключения: их выделяем, это самое важное ---- */
  if (deep && deep.exceptions && deep.exceptions.length) {
    html += '<h2 class="fr-gram-head">Исключения</h2>';
    html += '<div class="fr-exc">';
    deep.exceptions.forEach(function (e) {
      html += '  <p>' + frSayableText(e) + '</p>';
    });
    html += '</div>';
  }

  /* ---- как говорят неправильно ---- */
  if (deep && deep.mistakes && deep.mistakes.length) {
    html += '<h2 class="fr-gram-head">Как говорят неправильно</h2>';
    html += '<div class="fr-mistakes">';
    deep.mistakes.forEach(function (m) {
      html += '  <div class="fr-mistake">';
      html += '    <button class="fr-mistake-bad" data-say="' + escFr(m.bad) + '">';
      html += '      <span class="fr-mistake-x">✗</span>' + escFr(m.bad) + '</button>';
      html += '    <button class="fr-mistake-good" data-say="' + escFr(m.good) + '">';
      html += '      <span class="fr-mistake-v">✓</span>' + escFr(m.good) + '</button>';
      html += '    <span class="fr-mistake-why">' + frSayableText(m.why) + '</span>';
      html += '  </div>';
    });
    html += '</div>';
  }

  /* ---- фразы для повтора ---- */
  html += '<h2 class="fr-gram-head">Фразы для повтора</h2>';
  html += '<p class="fr-gram-note">Коснитесь строки — услышите, как она звучит.</p>';
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
    html += '<div class="fr-tip">⚠ ' + frSayableText(g.tip) + '</div>';
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
  if (!s.done[key]) s.done[key] = true;
  /* День отмечаем всегда, даже если тема уже была прочитана.
     Иначе повторение не считалось бы занятием и дерево не поливалось
     бы — а ведь повторять пройденное полезнее всего. */
  frSave(frStampDay(s));
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
  const pad = function (n) { return (n < 10 ? '0' : '') + n; };
  const d = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
  /* Дата последнего занятия — это время в миллисекундах.
     Раньше сюда клали число выученных слов, и по нему нельзя было
     понять, сколько дней прошло без занятий: дерево вянет не сразу,
     а через день после последнего урока, а не после N слов. */
  s.last = Date.now();
  if (s.day === d) return s;                  /* уже сегодня отмечали */
  const y = new Date(today.getTime() - 86400000);
  const yd = y.getFullYear() + '-' + pad(y.getMonth() + 1) + '-' + pad(y.getDate());
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
  if (!s.done[key]) s.done[key] = true;
  /* День отмечаем и при повторении алфавита — это тоже занятие */
  frSave(frStampDay(s));
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

/* =============================================================
   КАК ДОБАВЛЯТЬ ВИДЕО — ПРОСТО КИДАЙТЕ ССЫЛКИ

   Ниже список FR.videoLinks. В каждой строке — просто ссылка на
   ролик, одна на строку. Больше ничего писать не надо: сайт сам
   достанет из ссылки код ролика и сам пронумерует «Видеоурок 1»,
   «Видеоурок 2» и так далее.

   Куда кидать:
   ────────────────────────────────────────────────────────────
     https://rutube.ru/video/9e859490fab074594a0398f91149fb0d/ | 54
     https://rutube.ru/video/ade6e8ddf62f1b5cf19ae546efcdbc47/ | 28
   ────────────────────────────────────────────────────────────

   Цифра после «|» — сколько минут идёт ролик. Если её написать,
   сайт покажет «⏱ 54 мин» и, если больше 20 минут, добавит
   пометку «по частям». Если не написать — значка не будет.
   Это необязательно.

   Сайт понимает три вида адресов:
     • rutube.ru/video/КОД/       — играет прямо в разделе;
     • rutube.ru/play/embed/КОД/  — тоже, код берётся из адреса;
     • любой другой (Яндекс, VK…)  — откроется в новой вкладке,
                                    потому что встраивать
                                    чужое нельзя.

   Всё. Больше ничего трогать не нужно.
   ============================================================= */

FR.videoLinks = [
  'https://rutube.ru/video/9e859490fab074594a0398f91149fb0d/ | 54',
  'https://rutube.ru/video/ade6e8ddf62f1b5cf19ae546efcdbc47/ | 28',
  'https://rutube.ru/video/808abc7fd50a4e6e4784ef1aab1d1bb7/ | 35',
  'https://rutube.ru/video/108ef2fa60ae5700c462e1ac26843cca/ | 21',
  'https://rutube.ru/video/519a9e27f8f1ff0242cb468028fc23ee/ | 23',
  'https://rutube.ru/video/49d10c8ad778a2b3b9f03c8c93319a82/ | 22',
  'https://rutube.ru/video/ed06aa61fed8bb1df80dc0b0a51d75af/ | 23',
  'https://rutube.ru/video/cb8dbea2eda5ace59e43b2daa998f86a/ | 22',
  'https://rutube.ru/video/986309b46a54c309ba2dc4b3f63e3b3f/ | 24',
  'https://rutube.ru/video/30daea706abaefda9210eb755cc847aa/ | 30',
  'https://rutube.ru/video/8a09899a2360de0e043d594c526b8277/ | 17',
  'https://rutube.ru/video/1ee98b049bfa161accda7668380d5d65/ | 25',
  'https://rutube.ru/video/c1395efeb1295289830515b1e2f35ac4/ | 18',
  'https://rutube.ru/video/82e578e23732303059fbd15101a20e88/ | 23',
  'https://rutube.ru/video/9806656f9d16b0a0013de99e6b98c858/ | 18',
  'https://rutube.ru/video/da59e455e79231c3c12d12e75033557f/ | 16',
  'https://rutube.ru/video/8a566a867e03d324faf03b0be9c436f5/ | 14',
  'https://rutube.ru/video/0f47b8ab442558716715a055e4518dcb/ | 17',
  'https://rutube.ru/video/4073856902d14bd4dd206d2d29b8a4cf/ | 16',
  'https://rutube.ru/video/8acaceee6c445136a41ad21157fbf602/ | 16'
  /* Кидайте новые ссылки ниже, по одной на строку, в нужном порядке. */
];

/* Ролики, написанные руками: у них есть название и слова для повтора.
   Их ставим в начало, а видеоуроки из ссылок — следом.

   Список называется videosManual, а не videos, потому что итоговый
   список собирает frBuildVideos() из этой основы и ссылок. Если
   переименовать обратно в videos, уроки будут дописываться в него
   же и задвоятся — такое уже случалось. */
FR.videosManual = [
  {
    title: '10 обязательных глаголов для новичков',
    note: 'Шесть минут. Первые десять глаголов, без которых дальше не пойти',
    id: '5d449888a4be5dbbb496b20952016218',
    dur: 6,
    words: []
  },
  {
    title: 'Видео для начинающих',
    note: 'С Яндекс Видео — откроется в новой вкладке',
    link: 'https://tel.yandex.ru/video/preview/3864746720172312793',
    words: ['bonjour', 'merci', 'salut', 'oui', 'non']
  }
];

/* Разбираем список ссылок в готовые ролики. Само ничего не знает
   про формат — просто вытаскивает код ролика и длительность.

   ВАЖНО, почему здесь так сложно.

   Функцию зовут несколько раз, а список FR.videos она меняет НА МЕСТЕ
   (дописывает в конец). Из-за этого при втором вызове все уроки
   задваивались: бабушка видела 134 ролика вместо 68, причём первые
   66 — это уроки 1–66, а следующие 66 — те же самые уроки 1–66
   снова, но с испорченными номерами («Видеоурок 67», «Видеоурок 68»…)
   Список не то чтобы сломался, но выглядел нелепо и занимал
   вдвое больше места.

   Поэтому здесь список каждый раз собирается заново, с нуля:
   - сперва берётся «чистая» основа (FR.videosManual — ролики,
     вписанные руками, они никуда не деваются);
   - потом один раз добавляются уроки из FR.videoLinks;
   - уже собранный результат запоминается, и при следующих вызовах
     возвращается он, а не собирается заново.

   Так список не может задвоиться ни при каком порядке вызовов. */
function frBuildVideos() {
  if (FR.videosBuilt) return FR.videos;

  const out = (FR.videosManual || []).slice();
  let n = 0;
  (FR.videoLinks || []).forEach(function (line) {
    const parts = String(line).split('|');
    const url = (parts[0] || '').trim();
    const dur = parseInt((parts[1] || '').trim(), 10) || 0;
    if (!url) return;
    n += 1;
    const id = (url.match(/rutube\.ru\/(?:video|play\/embed)\/([a-z0-9_-]+)/i) || [])[1];
    const v = { auto: true, title: 'Видеоурок ' + n, note: '', dur: dur };
    if (id) v.id = id;
    else v.link = url;
    out.push(v);
  });

  FR.videos = out;
  FR.videosBuilt = true;
  return out;
}


/* Уроки 21–66. Кидаем одной строкой в списке выше.
   Порядок важен: уроки идут по номерам, по одному в день. */
FR.videoLinks.push(
  'https://rutube.ru/video/d3f6bb7bb9f55b319a204a920218aa4d/ | 16',
  'https://rutube.ru/video/cee674b9eafce02580bd131ed7a135c5/ | 20',
  'https://rutube.ru/video/f262c6ef13df106c198d400beea28dad/ | 15',
  'https://rutube.ru/video/b337ecdc55f0624a56544127b1c794ee/ | 19',
  'https://rutube.ru/video/5b397a784b14132f900f5e6cd9d20284/ | 17',
  'https://rutube.ru/video/d9103f7f3bb266dec3b604f9e95fe569/ | 21',
  'https://rutube.ru/video/53cb1e6ae7d5c3acd81256fe6ff7bc8f/ | 18',
  'https://rutube.ru/video/1043a728d574b1c8845bc55d365980d6/ | 19',
  'https://rutube.ru/video/b5145fac509ffd856b8ac52d36c224fe/ | 14',
  'https://rutube.ru/video/c6ea5b6f0c68c7ea0d47af6c774e9d68/ | 20',
  'https://rutube.ru/video/0922b6206106a41f18aa7172c72f3c2f/ | 15',
  'https://rutube.ru/video/327fc768bfa9d99bd59e512c31a2b422/ | 17',
  'https://rutube.ru/video/c7e8030321fd0094b688a822a738af39/ | 14',
  'https://rutube.ru/video/a93f8171e772ab78151b45f870fbac57/ | 20',
  'https://rutube.ru/video/d87ada2fbb64b8aaf8f20591bb8ab85e/ | 16',
  'https://rutube.ru/video/f0896c6a538f3391d3f4dcc38c7168c8/ | 17',
  'https://rutube.ru/video/c1f3c20c7395826435133f0798bc4990/ | 15',
  'https://rutube.ru/video/90900705b76cffbc4a7efc67785fc290/ | 18',
  'https://rutube.ru/video/4a2d755767655e25e8efa899d10b1998/ | 17',
  'https://rutube.ru/video/0b31f4596369b5060a68b0fcd964124f/ | 16',
  'https://rutube.ru/video/e8369d0969f1b3880cbe33bb87e78d78/ | 16',
  'https://rutube.ru/video/08bd8062bcc4e3717a246e57168f7439/ | 16',
  'https://rutube.ru/video/e31354f77f575169d79cb78436f833df/ | 18',
  'https://rutube.ru/video/5f2d88c370958c072f8455ec697c834f/ | 18',
  'https://rutube.ru/video/19111406fc8d9ba789113fa1aa8c785a/ | 17',
  'https://rutube.ru/video/dca730e6bf0542560fa753df96bde68d/ | 16',
  'https://rutube.ru/video/6e180b70246ec3f110be1c09d97ef03a/ | 20',
  'https://rutube.ru/video/513f6b38d9707a72fcc1d223baa56bf2/ | 15',
  'https://rutube.ru/video/cddfdd2a8aa3f9f8b5f9982168106152/ | 20',
  'https://rutube.ru/video/c04140f68d9d2a3ad49740c09c3a8ce8/ | 17',
  'https://rutube.ru/video/c72417ad71aef51a19b2c984f5404c2e/ | 23',
  'https://rutube.ru/video/858a2a799df310ec111f70bb40d48b9f/ | 21',
  'https://rutube.ru/video/ffd232152b3b23b7d3a0fc2854c93922/ | 16',
  'https://rutube.ru/video/a25c4300f2a538c766a8e40562aa2d7c/ | 17',
  'https://rutube.ru/video/1a0d8d55691b4525216efc8813e6989a/ | 13',
  'https://rutube.ru/video/6520a4d33616cd0702abf2bc3a602d80/ | 17',
  'https://rutube.ru/video/8b57de91738f6f4a057aaedbc129883e/ | 18',
  'https://rutube.ru/video/1eb0d3f25b199111b41a58f368a655a8/ | 16',
  'https://rutube.ru/video/4effb2270f50845892c145038b19cbc4/ | 17',
  'https://rutube.ru/video/258474163edaf124fa2270bec43b4ce7/ | 17',
  'https://rutube.ru/video/e8b48ab86011541c2f93f960e5edc3bd/ | 15',
  'https://rutube.ru/video/26cc756532c073bbdd404ea675411040/ | 17',
  'https://rutube.ru/video/85333ed0b66ff899c7e6841005694c61/ | 15',
  'https://rutube.ru/video/9f9192e2315f678302ab0ac5c97ce57c/ | 17',
  'https://rutube.ru/video/2fb0ee2e7e97faeb6d1258bcf760487c/ | 16',
  'https://rutube.ru/video/c3f2d9c9c88642e293b787ed60d72e29/ | 15'
);

FR.videos = frBuildVideos();

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

  /* Разделяем список на части: короткие ролики — в один, длинные
     видеоуроки — в другой. Когда уроков двадцать, одна сплошная
     лента нечитаема, а заголовок сразу показывает, где что. */
  const shortOnes = FR.videos.filter(function (v) { return !v.auto; });
  const lessons = FR.videos.filter(function (v) { return v.auto; });

  function cards(list) {
    let out = '';
    list.forEach(function (v) {
      /* длинный ролик помечаем «по частям», короткий — просто минуты */
      const long = v.dur >= 20;
      out += '<button class="fr-video-card" data-video="' + FR.videos.indexOf(v) + '">';
      out += '  <span class="fr-video-play">▶</span>';
      out += '  <span class="fr-video-text">';
      out += '    <b>' + escFr(v.title) + '</b>';
      if (v.note) out += '    <span>' + escFr(v.note) + '</span>';
      out += '    <span class="fr-video-dur' + (long ? ' long' : '') + '">'
           + (v.dur ? '⏱ ' + v.dur + ' мин' + (long ? ' · по частям' : '') : '')
           + '</span>';
      out += '  </span>';
      out += '</button>';
    });
    return out;
  }

  function head(title, note) {
    return '<h2 class="fr-gram-head">' + title + '</h2>'
         + '<p class="fr-gram-note">' + note + '</p>';
  }

  html += '<div class="fr-videos">';
  if (shortOnes.length) {
    html += head('Короткое — за один присест',
                 'Поменьше десяти минут: досмотреть и повторить вслух.');
    html += cards(shortOnes);
  }
  if (lessons.length) {
    html += head('Видеоуроки по порядку',
                 'Идите по номерам, по одному в день. Урок длинный — смотрите частями.');
    /* Шестьдесят шесть уроков подряд — длинная лента, в ней легко
       потеряться. Поэтому каждые десять ставим заголовок: сразу
       видно, где вы и сколько ещё осталось. */
    for (let from = 0; from < lessons.length; from += 10) {
      const chunk = lessons.slice(from, from + 10);
      const firstNo = from + 1;
      const lastNo = from + chunk.length;
      html += '<h3 class="fr-videos-sub">Уроки ' + firstNo + '–' + lastNo + '</h3>';
      html += cards(chunk);
    }
  }
  html += '</div>';
  html += '<p class="fr-note">Длинный урок можно не досматривать за один раз. '
       + 'Посмотрели 10 минут — остановились, сказали вслух то, что '
       + 'запомнилось, и в следующий раз продолжили с того же места.</p>';
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
  if (v.dur) {
    html += '  <p class="fr-vid-dur' + (v.dur >= 20 ? ' long' : '') + '">'
         + '⏱ Ролик идёт ' + v.dur + ' минут'
         + (v.dur >= 20
              ? '. Это длинный урок — можно смотреть по частям, это нормально.'
              : '. Короткий — можно досмотреть за один раз.')
         + '</p>';
  }
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

  /* Дерево занятий: видно сразу, полито сегодня или дерево завяло.
     Ставим его первым, до списка мест, — это главный повод зайти. */
  html += frTreeCard();

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

  /* Разговорник и слова по темам — то, что нужно в дороге и в жизни.
     Стоят рядом с грамматикой: это тоже справка, а не урок. */
  const nPhr = (FR.phrases || []).length;
  const nMic = (FR.micro || []).length;
  html += '<button class="fr-place extra-card" data-phrases="1">';
  html += '  <span class="fr-place-emoji">💬</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Разговорник</b>';
  html += '    <span class="fr-place-fr">à l’aéroport · au café · à la pharmacie</span>';
  html += '    <span class="fr-place-sub">' + nPhr + ' ситуаций · готовые фразы</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp"></span>';
  html += '</button>';

  html += '<button class="fr-place extra-card" data-micro="1">';
  html += '  <span class="fr-place-emoji">🗂</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Слова по темам</b>';
  html += '    <span class="fr-place-fr">jours · mois · couleurs · meubles</span>';
  html += '    <span class="fr-place-sub">' + nMic + ' тем · дни, месяцы, цвета, мебель</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp"></span>';
  html += '</button>';

  html += '<button class="fr-place extra-card" data-num="1">';
  html += '  <span class="fr-place-emoji">🔢</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Числа и время</b>';
  html += '    <span class="fr-place-fr">soixante-dix · et quart</span>';
  html += '    <span class="fr-place-sub">тренажёр: сложение и «который час»</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp"></span>';
  html += '</button>';

  html += '<button class="fr-place extra-card" data-practice="1">';
  html += '  <span class="fr-place-emoji">🔁</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Практика перевода</b>';
  html += '    <span class="fr-place-fr">русский → français</span>';
  html += '    <span class="fr-place-sub">12 вопросов из разговорника и тем</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp"></span>';
  html += '</button>';

  html += '<button class="fr-place extra-card" data-wordbook="1">';
  html += '  <span class="fr-place-emoji">📖</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Словарик</b>';
  html += '    <span class="fr-place-fr">tous les mots</span>';
  html += '    <span class="fr-place-sub">все слова с поиском</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp"></span>';
  html += '</button>';

  html += '<button class="fr-place extra-card" data-achieve="1">';
  html += '  <span class="fr-place-emoji">🏆</span>';
  html += '  <span class="fr-place-text">';
  html += '    <b>Достижения</b>';
  html += '    <span class="fr-place-fr">vos médailles</span>';
  html += '    <span class="fr-place-sub">медали за дни, слова и уроки</span>';
  html += '  </span>';
  html += '  <span class="fr-stamp"></span>';
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
  }
  /* А день отмечаем в любом случае: повторный урок тоже занятие.
     Раньше отметка стояла внутри «если урок новый», и бабушка могла
     заниматься каждый день, а дерево всё равно показывало завялое. */
  frSave(frStampDay(s));

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
  else if (FRS.stage === 'phrases') html = frPhrasesScreen();
  else if (FRS.stage === 'phrase') html = frPhraseScreen(FRS.phrase);
  else if (FRS.stage === 'micro') html = frMicroScreen();
  else if (FRS.stage === 'mtopic') html = frMicroTopicScreen(FRS.micro);
  else if (FRS.stage === 'wordbook') html = frWordbookScreen();
  else if (FRS.stage === 'practice') html = frPracticeScreen();
  else if (FRS.stage === 'numbers') html = frNumScreen();
  else if (FRS.stage === 'achieve') html = frAchieveScreen();
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

  /* ---- пункты паспорта: разговорник, темы, числа, практика,
          словарик, достижения ---- */
  function openStage(stage) {
    FRS.stage = stage;
    frRender();
  }
  box.querySelectorAll('.fr-place.extra-card').forEach(function (b) {
    const map = {
      'data-phrases': 'phrases', 'data-micro': 'micro', 'data-num': 'numbers',
      'data-practice': 'practice', 'data-wordbook': 'wordbook', 'data-achieve': 'achieve'
    };
    b.addEventListener('click', function () {
      Object.keys(map).forEach(function (attr) {
        if (b.hasAttribute(attr)) { FRS.stage = map[attr]; frRender(); }
      });
    });
  });

  /* разговорник: выбрать ситуацию */
  box.querySelectorAll('[data-phrase]').forEach(function (b) {
    if (b.classList.contains('extra-card')) return;
    b.addEventListener('click', function () {
      FRS.stage = 'phrase';
      FRS.phrase = Number(b.dataset.phrase);
      frRender();
    });
  });

  /* слова по темам: выбрать тему */
  box.querySelectorAll('[data-micro]').forEach(function (b) {
    if (b.classList.contains('extra-card')) return;
    b.addEventListener('click', function () {
      FRS.stage = 'mtopic';
      FRS.micro = Number(b.dataset.micro);
      frRender();
    });
  });

  /* Поиск в словарике. Обновляем ТОЛЬКО список и счётчик: если
     перерисовывать весь экран, поле поиска каждый раз заново создаётся
     и теряет фокус — бабушка напечатает одну букву и всё. */
  const search = document.getElementById('frSearch');
  if (search) {
    search.addEventListener('input', function () {
      frQuery = search.value;
      const words = frWordbookWords();
      const qq = frQuery.toLowerCase().trim();
      const shown = qq ? words.filter(function (w) {
        return w.fr.toLowerCase().indexOf(qq) >= 0 || String(w.ru).toLowerCase().indexOf(qq) >= 0;
      }) : words;
      const rows = document.getElementById('frWbRows');
      if (rows) rows.innerHTML = frWbRowsHtml(shown);
      const cnt = document.getElementById('frWbCount');
      if (cnt) cnt.textContent = qq ? 'Найдено: ' + shown.length : 'Показаны все';
      frBind();
    });
  }

  /* практика перевода: выбор ответа */
  box.querySelectorAll('[data-prac]').forEach(function (b) {
    b.addEventListener('click', function () {
      const p = frPracticeState();
      if (!p || p.locked) return;
      p.locked = true;
      const answer = p.all[p.order[p.pos]];
      const good = b.dataset.prac === answer.fr;
      p.total++;
      if (good) p.good++;
      frPracticeMark(good, answer.fr);
      const v = document.getElementById('frPracVerdict');
      if (v) {
        v.innerHTML = good
          ? '✓ <b>Верно!</b> ' + escFr(answer.fr) + ' — ' + escFr(answer.ru)
          : 'Было: <b>' + escFr(answer.fr) + '</b> — ' + escFr(answer.ru);
        v.className = 'fr-prac-verdict ' + (good ? 'good' : 'bad');
      }
      b.classList.add(good ? 'prac-ok' : 'prac-no');
      const nx = document.getElementById('frNext');
      if (nx) nx.disabled = false;
    });
  });

  const againB = document.getElementById('frAgain');
  if (againB) againB.addEventListener('click', function () {
    frPractice = null;
    frRender();
  });

  /* числа и время: выбор ответа */
  box.querySelectorAll('[data-num]').forEach(function (b) {
    b.addEventListener('click', function () {
      const st = frNumState;
      if (!st || st.locked || !st.q) return;
      st.locked = true;
      const good = b.dataset.num === st.q.right;
      st.n++;
      if (good) st.good++;
      const v = document.getElementById('frPracVerdict');
      if (v) {
        v.innerHTML = good ? '✓ <b>Верно!</b> ' + escFr(st.q.speak)
                           : 'Правильно: <b>' + escFr(st.q.speak) + '</b>';
        v.className = 'fr-prac-verdict ' + (good ? 'good' : 'bad');
      }
      b.classList.add(good ? 'prac-ok' : 'prac-no');
      const nx = document.getElementById('frNext');
      if (nx) nx.disabled = false;
    });
  });

  const againN = document.getElementById('frNumAgain');
  if (againN) againN.addEventListener('click', function () {
    frNumState = null;
    frRender();
  });

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
    /* --- практика перевода: следующий вопрос --- */
    if (FRS.stage === 'practice') {
      const p = frPracticeState();
      if (!p) return;
      p.pos++;
      p.locked = false;
      frRender();
      return;
    }

    /* --- числа и время: следующий вопрос --- */
    if (FRS.stage === 'numbers') {
      const st = frNumState;
      if (!st) return;
      st.q = null;
      st.locked = false;
      frRender();
      return;
    }

    /* --- слова по темам: отмечаем прочитанное --- */
    if (FRS.stage === 'mtopic') {
      const sec = (FR.micro || [])[FRS.micro];
      if (sec) {
        const s = frLoad();
        const key = 'micro-' + sec.id;
        if (!s.done[key]) { s.done[key] = true; frSave(frStampDay(s)); }
      }
      FRS.stage = 'micro';
      frRender();
      return;
    }

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

  /* Прячем не по списку, а целиком: всё, что лежит рядом с разделом
     французского внутри общей обёртки, кроме него самого. Раньше мы
     перечисляли элементы поимённо и всё равно что-то упускали — то
     условие шахматной задачи (Белые ходят. Найдите один ход…), то
     блок ответа (Найдите ход, который даёт мат). Теперь чужая надпись
     остаться не может: новая задача в обёртку не попадёт, а значит и
     утечь не сможет.

     openTask всё возвращает на место: сначала открывает обёртку,
     потом прячет те блоки, которые задаче не нужны. */
  const area = document.getElementById('frArea');
  const sheet = area ? area.parentElement : null;
  if (sheet) {
    Array.prototype.forEach.call(sheet.children, function (el) {
      if (el === area) return;
      el.hidden = true;
      el.dataset.frSheetHidden = '1';
    });
  }
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
