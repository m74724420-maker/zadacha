/* =============================================================
   Логические задачки — ГЕНЕРАТОРЫ ЗАДАНИЙ
   Уровни: 1 — легко, 2 — средне, 3 — сложно
   Каждая функция возвращает задачу:
     { id, kind, level, title, question, ... , answer, steps[] }
   ============================================================= */

const LZ = window.LZ || (window.LZ = {});

let _uid = 0;
function uid(p) { return p + '-' + Date.now().toString(36) + '-' + (++_uid).toString(36); }

/* случайное целое от a до b */
function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[ri(0, arr.length - 1)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ================= 1. НАЙДИ ЗАКОНОМЕРНОСТЬ ================= */
LZ.sequence = function (level) {
  const types = level === 1
    ? ['arithmetic', 'geometric', 'double']
    : level === 2
      ? ['arithmetic', 'geometric', 'double', 'fibonacci', 'squares']
      : ['geometric', 'double', 'fibonacci', 'squares', 'interleave', 'offset'];
  const type = pick(types);

  const seq = [];
  const steps = [];
  let answer;
  let rule = '';

  if (type === 'arithmetic') {
    const a = ri(2, 12);
    const d = level === 3 ? pick([ri(7, 15), -ri(3, 9)]) : ri(2, 8);
    for (let i = 0; i < 5; i++) seq.push(a + d * i);
    answer = a + d * 5;
    rule = d > 0
      ? ('Каждое следующее число больше предыдущего на ' + d)
      : ('Каждое следующее число меньше предыдущего на ' + Math.abs(d));
    steps.push(rule + '.');
    steps.push('Значит, к последнему числу прибавляем ' + Math.abs(d) + ': ' +
      seq[4] + ' ' + (d > 0 ? '+ ' : '− ') + Math.abs(d) + ' = ' + answer + '.');
  }

  if (type === 'geometric') {
    const a = ri(1, 4);
    const r = level === 3 ? ri(3, 4) : 2;
    for (let i = 0; i < 5; i++) seq.push(a * Math.pow(r, i));
    answer = a * Math.pow(r, 5);
    rule = 'Каждое следующее число в ' + r + ' раза больше предыдущего';
    steps.push(rule + '.');
    steps.push('Проверим: ' + seq[0] + ' → ' + seq[1] + ' → ' + seq[2] + '.');
    steps.push('Продолжаем: ' + seq[4] + ' × ' + r + ' = ' + answer + '.');
  }

  if (type === 'double') {
    const a = ri(1, 5);
    for (let i = 0; i < 5; i++) seq.push(a * Math.pow(2, i));
    answer = a * Math.pow(2, 5);
    rule = 'Каждое следующее число вдвое больше предыдущего';
    steps.push(rule + '.');
    steps.push(seq[4] + ' × 2 = ' + answer + '.');
  }

  if (type === 'fibonacci') {
    let a = ri(1, 6), b = ri(2, 9);
    seq.push(a, b);
    for (let i = 0; i < 3; i++) { seq.push(seq[seq.length - 1] + seq[seq.length - 2]); }
    answer = seq[seq.length - 1] + seq[seq.length - 2];
    rule = 'Каждое следующее число — сумма двух предыдущих';
    steps.push(rule + '.');
    steps.push(seq[3] + ' + ' + seq[4] + ' = ' + answer + '.');
  }

  if (type === 'squares') {
    const start = ri(1, 5);
    for (let i = 0; i < 5; i++) { const n = start + i; seq.push(n * n); }
    const next = start + 5;
    answer = next * next;
    rule = 'Это квадраты чисел подряд: ' + seq.map(v => Math.round(Math.sqrt(v))).join(', ');
    steps.push('Заметим, что стоят квадраты чисел: ' +
      seq.map(v => Math.round(Math.sqrt(v))).join(', ') + '.');
    steps.push('Следующее число в ряду — ' + next + '.');
    steps.push(next + ' в квадрате = ' + next + ' × ' + next + ' = ' + answer + '.');
  }

  if (type === 'interleave') {
    const a0 = ri(1, 8), d1 = ri(2, 6);
    const b0 = ri(2, 9), d2 = ri(3, 8);
    for (let i = 0; i < 3; i++) { seq.push(a0 + d1 * i); seq.push(b0 + d2 * i); }
    answer = a0 + d1 * 3;
    rule = 'Два ряда вперемешку: первый идёт с шагом ' + d1 + ', второй — с шагом ' + d2;
    steps.push(rule + '.');
    steps.push('Чётные позиции (2, 4, 6…): ' + seq[1] + ', ' + seq[3] + ', ' +
      seq[5] + ' — это второй ряд.');
    steps.push('Нечётные позиции: ' + seq[0] + ', ' + seq[2] + ', ' + seq[4] + ' — первый ряд.');
    steps.push('Следующее число в первом ряду: ' + seq[4] + ' + ' + d1 + ' = ' + answer + '.');
  }

  if (type === 'offset') {
    let a = ri(1, 3);
    const k = ri(1, 5);
    const m = level === 3 ? 3 : 2;
    for (let i = 0; i < 5; i++) { seq.push(a); a = a * m + k; }
    answer = a;
    rule = 'Каждое следующее число = предыдущее × ' + m + ' + ' + k;
    steps.push(rule + '.');
    steps.push('Проверим на первых числах: ' + seq[0] + ' × ' + m + ' + ' + k + ' = ' + seq[1] + '.');
    steps.push(seq[4] + ' × ' + m + ' + ' + k + ' = ' + answer + '.');
  }

  return {
    id: uid('seq'),
    kind: 'sequence',
    level: level,
    title: 'Найди закономерность',
    question: 'Продолжите ряд и впишите следующее число:',
    data: { seq: seq },
    answer: answer,
    answerText: String(answer),
    steps: steps
  };
};

/* ================= 2. СУДОКУ ================= */

/* заполняет пустую сетку случайным полным судоку (backtracking) */
function fillSudoku(g) {
  const rowMask = new Array(9).fill(0);
  const colMask = new Array(9).fill(0);
  const boxMask = new Array(9).fill(0);

  for (let i = 0; i < 81; i++) {
    const r = (i / 9) | 0, c = i % 9, b = ((r / 3) | 0) * 3 + ((c / 3) | 0);
    if (g[i]) {
      const bit = 1 << (g[i] - 1);
      rowMask[r] |= bit; colMask[c] |= bit; boxMask[b] |= bit;
    }
  }

  function solve(pos) {
    if (pos === 81) return true;
    const r = (pos / 9) | 0, c = pos % 9, b = ((r / 3) | 0) * 3 + ((c / 3) | 0);
    if (g[pos]) return solve(pos + 1);
    const used = rowMask[r] | colMask[c] | boxMask[b];
    const cands = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const v of cands) {
      const bit = 1 << (v - 1);
      if (used & bit) continue;
      g[pos] = v;
      rowMask[r] |= bit; colMask[c] |= bit; boxMask[b] |= bit;
      if (solve(pos + 1)) return true;
      g[pos] = 0;
      rowMask[r] &= ~bit; colMask[c] &= ~bit; boxMask[b] &= ~bit;
    }
    return false;
  }
  solve(0);
  return g;
}

/* считает решения (до limit) — для проверки единственности */
function countSudokuSolutions(g, limit) {
  const rowMask = new Array(9).fill(0);
  const colMask = new Array(9).fill(0);
  const boxMask = new Array(9).fill(0);
  const board = g.slice();

  for (let i = 0; i < 81; i++) {
    if (board[i]) {
      const r = (i / 9) | 0, c = i % 9, b = ((r / 3) | 0) * 3 + ((c / 3) | 0);
      const bit = 1 << (board[i] - 1);
      rowMask[r] |= bit; colMask[c] |= bit; boxMask[b] |= bit;
    }
  }

  let count = 0;
  function solve(pos) {
    if (count >= limit) return;
    if (pos === 81) { count++; return; }
    if (board[pos]) { solve(pos + 1); return; }
    const r = (pos / 9) | 0, c = pos % 9, b = ((r / 3) | 0) * 3 + ((c / 3) | 0);
    const used = rowMask[r] | colMask[c] | boxMask[b];
    for (let v = 1; v <= 9; v++) {
      const bit = 1 << (v - 1);
      if (used & bit) continue;
      board[pos] = v;
      rowMask[r] |= bit; colMask[c] |= bit; boxMask[b] |= bit;
      solve(pos + 1);
      board[pos] = 0;
      rowMask[r] &= ~bit; colMask[c] &= ~bit; boxMask[b] &= ~bit;
      if (count >= limit) return;
    }
  }
  solve(0);
  return count;
}

LZ.sudoku = function (level) {
  const cluesTarget = { 1: 42, 2: 33, 3: 27 }[level];

  const solution = fillSudoku(new Array(81).fill(0));
  const puzzle = solution.slice();

  /* убираем пустые клетки, пока решение остаётся единственным */
  const order = shuffle(Array.from({ length: 81 }, (_, i) => i));
  let clues = 81;
  let attempts = 0;
  for (const idx of order) {
    if (clues <= cluesTarget) break;
    if (++attempts > 600) break;
    const saved = puzzle[idx];
    puzzle[idx] = 0;
    if (countSudokuSolutions(puzzle, 2) !== 1) {
      puzzle[idx] = saved;   /* вернуть — без неё решение неоднозначно */
    } else {
      clues--;
    }
  }

  return {
    id: uid('sud'),
    kind: 'sudoku',
    level: level,
    title: 'Судоку',
    question: 'Заполните пустые клетки цифрами от 1 до 9. В каждой строке, в каждом столбце и в каждом маленьком квадрате 3×3 все цифры должны быть разными.',
    data: { puzzle: puzzle, solution: solution },
    answer: 'Судоку заполнено верно',
    answerText: 'верно',
    steps: [
      'В каждом квадрате 3×3 цифры не повторяются.',
      'Смотрим на строки, где не хватает одной цифры, — её и ставим.',
      'И так по кругу: сначала самые очевидные, потом оставшиеся.'
    ]
  };
};

/* ================= 3. САПЁР ================= */
LZ.mines = function (level) {
  const cfg = { 1: { w: 9, h: 9, mines: 10 }, 2: { w: 12, h: 12, mines: 26 }, 3: { w: 14, h: 12, mines: 42 } }[level];
  const { w, h, mines } = cfg;
  return {
    id: uid('min'),
    kind: 'mines',
    level: level,
    title: 'Сапёр',
    question: 'Откройте все клетки без мин. Цифра показывает, сколько мин рядом. Правой кнопкой мыши (или долгим нажатием) ставится флажок. Поле создаётся при первом нажатии, так что первая клетка всегда безопасна.',
    data: { w: w, h: h, mines: mines },
    answer: 'Поле вскрыто полностью, без взрыва',
    answerText: 'верно',
    steps: [
      'Начинаем с угла или с пустого места — там мин меньше всего.',
      'Цифра 1 означает: рядом ровно одна мина (по соседним клеткам, включая диагонали).',
      'Если вокруг клетки цифр уже нет, можно смело открывать всё поле вокруг неё.'
    ]
  };
};

/* ================= 4. ЗАДАЧИ СО СПИЧКАМИ ================= */

/* семь сегментов: a b c d e f g */
const SEG_ON = {
  '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg',
  '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'
};
const SEG_NAME = {
  a: 'верхнюю горизонтальную',
  b: 'правую верхнюю вертикальную',
  c: 'правую нижнюю вертикальную',
  d: 'нижнюю горизонтальную',
  e: 'левую нижнюю вертикальную',
  f: 'левую верхнюю вертикальную',
  g: 'среднюю горизонтальную'
};
function maskOf(d) { return SEG_ON[String(d)] || ''; }
function isDigit(mask) { return Object.keys(SEG_ON).some(k => mask === SEG_ON[k]); }
function digitOf(mask) { return Object.keys(SEG_ON).find(k => SEG_ON[k] === mask); }

function eqTrue(a, op, b, c) {
  return op === '+' ? a + b === c : a - b === c;
}

LZ.matchsticks = function (level) {
  const want = { 1: 2, 2: 3, 3: 4 }[level];

  /* если попытка не удалась (например, равенство случайно осталось верным),
     пробуем ещё раз */
  for (let attempt = 0; attempt < 40; attempt++) {
    const t = buildMatch(level, want);
    if (t) return t;
  }
  /* запасной вариант */
  return buildMatch(level, 1, true);
};

function buildMatch(level, want, allowSingle) {
  /* 1. берём верное равенство */
  let op, a, b, c, guard = 0;
  do {
    op = pick(['+', '−']);
    a = ri(2, 9);
    b = ri(1, 9);
    c = op === '+' ? a + b : a - b;
    guard++;
  } while ((c < 0 || c > 99) && guard < 300);
  if (c < 0 || c > 99) return null;

  const trueDigits = { a: String(a), b: String(b), c: String(c) };
  const trueEq = a + ' ' + op + ' ' + b + ' = ' + c;

  const broken = {
    a: String(a).split(''),
    b: String(b).split(''),
    c: String(c).split('')
  };

  /* 2. ломаем: меняем цифры так, чтобы снять одну спичку и положить другую */
  const positions = [];
  ['a', 'b', 'c'].forEach(part => {
    String(trueDigits[part]).split('').forEach((d, i) => positions.push({ part: part, pos: i }));
  });

  const changed = [];
  const usedPos = {};
  for (const p of shuffle(positions)) {
    if (changed.length >= want) break;
    const key = p.part + '_' + p.pos;
    if (usedPos[key]) continue;          /* каждую цифру меняем только один раз */
    const trueDigit = broken[p.part][p.pos];
    const trueM = maskOf(trueDigit).split('');

    const cands = [];
    for (let nd = 0; nd <= 9; nd++) {
      const ndS = String(nd);
      if (ndS === trueDigit) continue;
      if (ndS === '0' && p.pos === 0) continue;      /* без ведущих нулей */
      const m = maskOf(ndS).split('');
      const rem = trueM.filter(s => m.indexOf(s) < 0);   /* есть в верной, нет в сломанной */
      const add = m.filter(s => trueM.indexOf(s) < 0);   /* есть в сломанной, нет в верной */
      if (rem.length === 1 && add.length === 1) {
        cands.push({ d: ndS, rem: rem[0], add: add[0] });
      }
    }
    if (!cands.length) continue;

    const ch = pick(cands);
    broken[p.part][p.pos] = ch.d;
    usedPos[key] = true;
    changed.push({
      part: p.part, pos: p.pos,
      brokenDigit: ch.d, trueDigit: trueDigit,
      takeOff: ch.add,   /* эту спичку снимаем */
      putOn: ch.rem      /* эту спичку кладём */
    });
  }

  const isBrokenTrue = () => eqTrue(
    Number(broken.a.join('')), op, Number(broken.b.join('')), Number(broken.c.join('')));

  /* равенство не должно быть верным изначально: откатываем изменения
     в случайном порядке, пока оно перестанет быть верным */
  if (isBrokenTrue()) {
    for (const ch of shuffle(changed.slice())) {
      broken[ch.part][ch.pos] = ch.trueDigit;
      changed.splice(changed.indexOf(ch), 1);
      if (!isBrokenTrue()) break;
    }
  }

  const moves = changed.length;
  if (moves < 1) return null;                       /* не вышло — пробуем заново */
  if (isBrokenTrue()) return null;
  if (!allowSingle && moves < Math.max(1, want - 1)) return null;

  const brokenEq = broken.a.join('') + ' ' + op + ' ' + broken.b.join('') + ' = ' + broken.c.join('');

  /* 3. пошаговое объяснение: как починить */
  const steps = ['Правильное равенство: ' + trueEq + '.'];
  const partName = { a: 'первом числе', b: 'втором числе', c: 'ответе' };
  changed.forEach((ch, idx) => {
    steps.push('Шаг ' + (idx + 1) + '. В ' + partName[ch.part] + ' цифру ' +
      ch.brokenDigit + ' меняем на ' + ch.trueDigit + ': снимите ' + SEG_NAME[ch.takeOff] +
      ' и положите ' + SEG_NAME[ch.putOn] + '.');
  });

  return {
    id: uid('match'),
    kind: 'matchsticks',
    level: level,
    title: 'Задачи со спичками',
    question: 'Переложите ровно ' + moves + ' ' + movesWord(moves) +
      ' так, чтобы равенство стало верным. Нажимайте на спичку — она встанет или ляжет.',
    data: {
      moves: moves,
      op: op,
      broken: { a: broken.a, b: broken.b, c: broken.c },
      trueDigits: trueDigits,
      brokenEq: brokenEq
    },
    answer: trueEq,
    answerText: trueEq,
    steps: steps
  };
};

function movesWord(n) {
  if (n === 1) return 'спичку';
  if (n >= 2 && n <= 4) return 'спички';
  return 'спичек';
}

/* ================= ПРОВЕРКА ОТВЕТА ================= */
LZ.check = function (task, userAnswer) {
  const txt = String(userAnswer == null ? '' : userAnswer).trim();
  if (!txt) return { ok: false, message: 'Впишите ответ, пожалуйста.' };
  const norm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/[\s,.–—-]/g, '').replace(/\u2212/g, '-');
  if (norm(txt) === norm(task.answerText)) {
    return { ok: true, message: 'Правильно! Отличная работа.' };
  }
  return { ok: false, message: 'Пока не то. Попробуйте ещё раз или посмотрите решение.' };
};

/* ================= ПРОГРЕСС ================= */
LZ.levelName = function (lv) {
  return { 1: 'Легко', 2: 'Средне', 3: 'Сложно' }[lv] || 'Легко';
};

/* помощники для спичек — их использует app.js */
LZ.segMask = maskOf;      /* цифра -> набор включённых сегментов */
LZ.segDigit = digitOf;    /* набор сегментов -> цифра (или undefined) */
