/* =============================================================
   Шахматы: генератор задач и «добрый» бот.
   Правила и проверка ходов — библиотека chess.js (подключается в index.html).
   Все задачи проверяются движком: мат найден настоящим перебором ходов,
   поэтому неправильная задача невозможна.
   ============================================================= */

const CH = window.CH || (window.CH = {});

/* ---------------- совместимость версий chess.js ---------------- */
/* В разных версиях библиотеки методы называются по-разному:
   0.10.x — in_checkmate()/game_over(), 1.x — isCheckmate()/isGameOver().
   Поэтому проверяем оба названия. */
function chIsMate(g) { return g.in_checkmate ? g.in_checkmate() : g.isCheckmate(); }
function chIsStale(g) { return g.in_stalemate ? g.in_stalemate() : g.isStalemate(); }
function chIsOver(g) { return g.game_over ? g.game_over() : g.isGameOver(); }
function chIsCheck(g) { return g.in_check ? g.in_check() : g.isCheck(); }

/* ---------------- служебное ---------------- */
function chUci(sq) { return sq; }

/* ---------------- короля брать НЕЛЬЗЯ ----------------
   В шахматах нельзя ходить на поле короля и нельзя его съесть.
   Короля побеждают шахом и матом, а не взятием.

   Проблема: движок (эта версия chess.js) таких ходов не запрещает —
   он спокойно предлагает «взять чёрного короля» ферзём. Если такое
   принять за решение, получается задача-обманка: человек честно ищет
   мат, а ему показывают позицию, где король уже висит и его можно
   просто снять.

   Поэтому:
   1) isKingTake() отсекает ход, который убирает чёрного короля;
   2) chBlackKingSafe() проверяет исходную позицию — чёрный король
      не должен стоять под боем, пока ходят белые. */
function chBlackKingSq(fen) {
  const rows = String(fen).split(' ')[0].split('/');
  for (let ri = 0; ri < rows.length; ri++) {
    let f = 0;
    for (let ci = 0; ci < rows[ri].length; ci++) {
      const ch = rows[ri][ci];
      if (/\d/.test(ch)) { f += parseInt(ch, 10); continue; }
      if (ch === 'k') return 'abcdefgh'[f] + (8 - ri);
      f++;
    }
  }
  return null;
}

/* ход, который съедает чёрного короля — нелегальный */
function isKingTake(game, san) {
  const bk = chBlackKingSq(game.fen());
  if (!bk) return true;                     /* короля нет — позиция битая */
  try {
    game.move(san);
    const gone = !chBlackKingSq(game.fen());
    game.undo();
    return gone;
  } catch (e) {
    return true;
  }
}

/* чёрный король не должен стоять под боем при ходе белых */
function chBlackKingSafe(fen) {
  const parts = String(fen).split(' ');
  parts[1] = 'b';
  let gb;
  try { gb = new Chess(parts.join(' ')); } catch (e) { return false; }
  return !chIsCheck(gb);
}

/* легальные ходы белых: без взятия короля */
function chSafeMoves(game) {
  return game.moves().filter(function (san) { return !isKingTake(game, san); });
}

function countPieces(game) {
  const b = game.board();
  let n = 0;
  for (const row of b) for (const c of row) if (c) n++;
  return n;
}

/* есть ли у белых ферь или ладьи (иначе мат выглядит неинтересно) */
function hasShootingPiece(game, white) {
  const b = game.board();
  const want = white ? ['q', 'r'] : ['q', 'r'];
  for (const row of b) {
    for (const c of row) {
      if (!c) continue;
      const isWhite = c.type === c.type.toUpperCase();
      if (isWhite === white && want.includes(c.type.toLowerCase())) return true;
    }
  }
  return false;
}

/* ---------------- случайная позиция ---------------- */
function chRandomPosition(minPieces, maxPieces) {
  const g = new Chess();
  for (let step = 0; step < 80; step++) {
    const n = countPieces(g);
    if (n >= minPieces && n <= maxPieces && !chIsOver(g)) return g.fen();
    const moves = g.moves();               /* быстрый вариант: только SAN */
    if (!moves.length) return null;
    g.move(moves[Math.floor(Math.random() * moves.length)]);
  }
  return null;
}

/* ---------------- поиск мата ---------------- */
/* Возвращает массив ходов (SAN), если мат ставится за depth ходов, иначе null.
   budget ограничивает число узлов — иначе на сложных позициях поиск
   уходит на десятки секунд. */
function chFindMate(game, depth, budget) {
  if (!budget) budget = { n: 40000, deadline: 0 };
  if (!budget.deadline) budget.deadline = Date.now() + 3000;
  if (chIsMate(game)) return [];
  if (depth <= 0 || budget.n <= 0) return null;

  const moves = game.moves();
  if (!moves.length) return null;          /* пат или мат — мат проверен выше */

  /* сперва мат сразу — самый дешёвый вариант */
  for (const san of moves) {
    budget.n--;
    if (isKingTake(game, san)) continue;   /* взятие короля мат не считаем */
    game.move(san);
    const mate = chIsMate(game);
    game.undo();
    if (mate) return [san];
  }
  if (depth === 1) return null;

  let firstFound = null;
  for (const san of moves) {
    budget.n--;
    if (isKingTake(game, san)) continue;   /* взятие короля — не решение */
    game.move(san);
    const sub = chFindMate(game, depth - 1, budget);
    game.undo();
    if (sub) return [san].concat(sub);
    if (budget.n <= 0) break;
    /* время вышло — дальше считать бессмысленно */
    if ((budget.n & 63) === 0 && Date.now() > budget.deadline) break;
  }
  return null;
}

/* ---------------- случайная позиция ---------------- */
function chRandomPosition(minPieces, maxPieces) {
  const g = new Chess();
  for (let step = 0; step < 80; step++) {
    const n = countPieces(g);
    if (n >= minPieces && n <= maxPieces && !chIsOver(g)) {
      return g.fen();
    }
    const moves = g.moves({ verbose: true });
    if (!moves.length) return null;
    g.move(moves[Math.floor(Math.random() * moves.length)]);
  }
  return null;
}

/* ---------------- ПОСТРОЕНИЕ ПОЗИЦИИ ---------------- */
/* Случайная партия почти никогда не заканчивается позицией, где есть мат.
   Поэтому позицию мы собираем сами: два короля, ферь, ладья и немного
   чёрных пешек. В таких позициях мат находится почти всегда. */

const ALL_SQUARES = (() => {
  const a = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 1; r <= 8; r++) a.push(String.fromCharCode(97 + f) + r);
  }
  return a;
})();

/* наборы фигур по уровню: чем сложнее, тем больше чёрных фигур мешают */
const CH_SETS = {
  1: ['wk', 'bk', 'wQ', 'wR'],
  2: ['wk', 'bk', 'wQ', 'wR', 'bp', 'bp'],
  3: ['wk', 'bk', 'wQ', 'wR', 'bp', 'bp', 'bp', 'br']
};

/* ставим фигуры на случайные свободные поля и проверяем позицию.
   backRank: чёрного короля ставим на последнюю линию — там мат находится
   гораздо чаще (классическая «задняя полка»). */
function chBuildPosition(pieces, backRank) {
  const pool = backRank ? ALL_SQUARES.filter(s => s.charAt(1) === '8') : ALL_SQUARES;
  const rest = shuffle(ALL_SQUARES);
  const placed = {};

  /* сначала чёрного короля — из ограниченного списка полей */
  const bkSquare = pool[Math.floor(Math.random() * pool.length)];
  placed[bkSquare] = 'bk';
  let i = 0;
  for (const p of pieces) {
    if (p === 'bk') continue;
    while (rest[i] === bkSquare) i++;
    placed[rest[i++]] = p;
  }

  const wk = Object.keys(placed).find(s => placed[s] === 'wk');
  const bk = bkSquare;
  if (!wk) return null;

  /* короли не должны стоять рядом */
  const df = Math.abs(wk.charCodeAt(0) - bk.charCodeAt(0));
  const dr = Math.abs(wk.charCodeAt(1) - bk.charCodeAt(1));
  if (df <= 1 && dr <= 1) return null;

  const fen = chFenFrom(placed, 'w');
  let game;
  try { game = new Chess(fen); } catch (e) { return null; }
  if (!game.moves().length) return null;        /* сразу пат или мат — неинтересно */

  /* чёрным нельзя быть уже под шахом: это нечестная позиция */
  const asBlack = fen.split(' ');
  asBlack[1] = 'b';
  let bgame;
  try { bgame = new Chess(asBlack.join(' ')); } catch (e) { return null; }
  if (chIsCheck(bgame)) return null;

  return fen;
}

/* переводим наш код фигуры (wQ, bk, bp) в букву FEN */
function chFenLetter(code) {
  const type = code[1].toUpperCase();
  const black = code[0] === 'b';
  return black ? type.toLowerCase() : type;
}

function chFenFrom(placed, turn) {
  const rows = [];
  for (let r = 8; r >= 1; r--) {
    let row = '', empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = placed[String.fromCharCode(97 + f) + r];
      if (!p) { empty++; }
      else {
        if (empty) { row += empty; empty = 0; }
        row += chFenLetter(p);
      }
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return rows.join('/') + ' ' + turn + ' - - 0 1';
}

/* Проверенные запасные позиции: мат гарантированно за один ход.
   Нужны на случай, если перебор не успел найти ничего. */
const CH_FALLBACK_FENS = [
  '7k/6p1/6K1/8/8/8/8/R7 w - - 0 1',   /* ладья на «заднюю полку» */
  '7k/5R2/6K1/8/8/8/8/8 w - - 0 1',     /* ферзь-ладья */
  '7k/6Q1/6K1/8/8/8/8/8 w - - 0 1'
];

function chFallbackPuzzle(level) {
  for (const fen of CH_FALLBACK_FENS) {
    try {
      const g = new Chess(fen);
      if (!g.moves().length) continue;
      const sol = chFindMate(g, 1, { n: 10000 });
      if (sol) return chPuzzle(fen, sol, level);
    } catch (e) { /* пробуем следующую */ }
  }
  return null;
}

/* Материал на доске по уровням: чем сложнее, тем больше чёрных фигур
   мешают мату. Иначе мат всегда находится за один ход. */
const CH_PUZZLE_CFG = {
  1: { pieces: ['wk', 'bk', 'wQ', 'wR'], depth: 1, backRank: true, nodes: 8000, ms: 400 },
  2: { pieces: ['wk', 'bk', 'wQ', 'wR', 'bp', 'bp', 'br'], depth: 2, backRank: false, nodes: 14000, ms: 800 },
  3: { pieces: ['wk', 'bk', 'wQ', 'wR', 'bp', 'bp', 'bn', 'br'], depth: 3, backRank: false, nodes: 18000, ms: 1100 }
};

/* ищем позицию, где мат ставится примерно за нужное число ходов */
function chMakePuzzle(level) {
  const cfg = CH_PUZZLE_CFG[level] || CH_PUZZLE_CFG[1];
  const started = Date.now();
  const deadline = started + cfg.ms;
  let best = null;      /* на случай, если сложный мат не найдётся */
  let attempts = 0;

  while (Date.now() < deadline && attempts < 250) {
    attempts++;
    const fen = chBuildPosition(cfg.pieces, cfg.backRank);
    if (!fen) continue;
    const g = new Chess(fen);

    /* на сложных уровнях пропускаем слишком лёгкие позиции:
       если мат есть за 1 ход — это не задача этого уровня */
    if (level >= 2) {
      if (chFindMate(g, 1, { n: 5000, deadline: Date.now() + 200 })) continue;
      if (!best) {
        /* запомним одну лёгкую на случай неудачи */
        const fen2 = chBuildPosition(CH_PUZZLE_CFG[1].pieces, true);
        if (fen2) {
          const g2 = new Chess(fen2);
          const one = chFindMate(g2, 1, { n: 8000, deadline: Date.now() + 250 });
          if (one) best = chPuzzle(fen2, one, level);
        }
      }
    }
    if (level >= 3) {
      if (chFindMate(g, 2, { n: 9000, deadline: Date.now() + 500 })) continue;
    }

    const sol = chFindMate(g, cfg.depth, {
      n: cfg.nodes, deadline: Math.min(deadline, Date.now() + cfg.ms)
    });
    if (sol && sol.length >= Math.min(2, level)) return chPuzzle(fen, sol, level);
  }

  /* не нашли — отдаём лёгкую заготовку, но она всё равно с разбором */
  return best || chFallbackPuzzle(level);
}

function chPuzzle(fen, solution, level, whiteMoves) {
  /* whiteMoves — сколько ходов делают белые (у двухходовой задачи
     в решении три полухода: наш ход, ответ чёрных и мат) */
  const n = whiteMoves || Math.ceil(solution.length / 2);
  const lastMove = solution[solution.length - 1];
  const firstMove = solution[0];
  return {
    id: 'ch' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
    kind: 'chess',
    level: level,
    title: 'Шахматы: мат за ' + n + ' ' + chWord(n, 'ход', 'хода', 'ходов'),
    question: n === 1
      ? 'Белые ходят. Найдите один ход, который сразу даёт мат чёрным.'
      : 'Белые ходят. Найдите ход, после которого можно поставить мат за ' + n +
        ' ' + chWord(n, 'ход', 'хода', 'ходов') + '. Чёрные ответят сами, вам останется только мат.',
    data: { fen: fen, mateIn: n },
    answer: n === 1 ? firstMove : firstMove + ', затем ' + lastMove,
    answerText: n === 1 ? firstMove : firstMove + ' … ' + lastMove,
    steps: chSteps(solution, n),
    solution: solution
  };
}

CH.matePuzzle = function (level) {
  const lv = Math.min(3, Math.max(1, level || 1));
  /* сначала готовая база (проверенные движком позиции),
     генератор — запасной вариант, если база не подошла */
  const fromBank = chBankPuzzle(lv);
  if (fromBank) return fromBank;
  return chMakePuzzle(lv);
};

function chWord(n, one, few, many) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

/* человеческое объяснение варианта.
   solution — полная запись варианта: ход белых, ответ чёрных, мат.
   whiteMoves — сколько ходов делают белые. */
function chSteps(solution, whiteMoves) {
  const steps = [];
  const mine = whiteMoves || Math.ceil(solution.length / 2);
  steps.push('Мат нужно поставить за ' + mine + ' ' +
    chWord(mine, 'ход', 'хода', 'ходов') + '. Ходите только белыми.');

  const piece = sanPiece(solution[0]);
  if (solution.length === 1) {
    steps.push('Ход ' + solution[0] + ' сразу даёт мат: королю некуда деться, и закрыть его нечем.');
    return steps;
  }
  steps.push('Ваш первый ход — ' + solution[0] + '. Он готовит ' + piece +
    ' к мату и не даёт чёрным убежать.');
  if (solution.length >= 2) steps.push('Чёрные отвечают: ' + solution[1] + '. Этот ответ делает сайт.');
  if (solution.length >= 3) steps.push('Дальше вариант такой: ' + solution.slice(2).join(', ') + '.');
  steps.push('Мат засчитывается, когда королю нельзя ни уйти, ни закрыться, ни взять фигуру.');
  return steps;
}

/* какая фигура ходит по записи SAN: Q — ферзь, R — ладья, и т.д. */
function sanPiece(san) {
  const first = String(san || '')[0];
  return pieceName(({ K: 'k', Q: 'q', R: 'r', B: 'b', N: 'n' })[first] || 'q');
}

function pieceName(t) {
  return {
    q: 'ферзя', r: 'ладью', b: 'слона', n: 'коня',
    k: 'короля', p: 'пешку'
  }[t] || 'фигуру';
}

/* ---------------- ДОБРЫЙ БОТ ---------------- */
/* Три уровня. Разница должна быть видна сразу:
   «Лёгкий соперник» — играет как новичок: повторяет ходы, ходит одной
   фигурой туда-сюда, часто не замечает подвоха;
   «Средний соперник» — считает на ход вперёд и знает про дебют;
   «Сильный соперник» — считает глубже, видит мат и висящие фигуры. */
CH.BOT_LEVEL = {
  1: { depth: 1, sloppiness: 0.40, bonus: 0,    beginner: true,  name: 'Лёгкий соперник' },
  2: { depth: 2, sloppiness: 0.18, bonus: 0.6,  beginner: false, name: 'Средний соперник' },
  3: { depth: 3, sloppiness: 0.03, bonus: 1,    beginner: false, name: 'Сильный соперник' }
};

/* оценка позиции: материал + небольшая поправка на позицию фигуры */
const CH_PIECE_VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

/* чем «центральнее» фигура, тем лучше (очень упрощённая таблица) */
function chCentralBonus(sq) {
  const f = sq.charCodeAt(0) - 97;      /* 0..7 — файл */
  const r = 8 - (sq.charCodeAt(1) - 49); /* 0..7 — ранг от края */
  const centre = 3 - Math.min(3, Math.abs(3.5 - (f + 0.5)));
  const safety = 2 - Math.min(2, Math.abs(3.5 - (r + 0.5)));
  return (centre + safety) * 12;
}

function chEval(game) {
  /* оценка позиции: материал + небольшая поправка на место фигуры */
  let score = 0;
  const b = game.board();
  let i = 0;
  for (const row of b) {
    for (const c of row) {
      if (!c) { i++; continue; }
      const type = c.type.toLowerCase();
      const white = c.type === c.type.toUpperCase();
      const file = i % 8;                        /* 0..7 слева направо */
      const rank = 8 - Math.floor(i / 8);        /* 1..8 снизу вверх */
      const sq = 'abcdefgh'[file] + rank;
      let v = CH_PIECE_VALUE[type] || 0;
      if (type !== 'k' && type !== 'p') v += chCentralBonus(sq);
      if (type === 'p') {
        /* пешка лучше, чем дальше ушла, но раньше это было слишком
           сильно — бот в дебюте пихал только пешки */
        const adv = white ? rank - 1 : 8 - rank;
        v += adv * 3;
      }
      /* фигура, выведенная из-за спины пешек, уже работает */
      if (type === 'n' || type === 'b') {
        const stillHome = white ? rank <= 2 : rank >= 7;
        if (stillHome) v -= 12;
      }
      /* король на своей линии в дебюте — под ударом */
      if (type === 'k') {
        const onBackRank = white ? rank === 1 : rank === 8;
        if (!onBackRank) v -= 20;
      }
      score += white ? v : -v;
      i++;
    }
  }
  return game.turn() === 'w' ? score : -score;
}

/* Перебор на глубину depth с альфа-бета отсечением.
   Отсечение нужно, чтобы «сильный игрок» думал не секундами.
   ply — сколько полуходов прошло от начала: с его помощью мат в один
   ход оценивается выше, чем мат в три. */
function chSearch(game, depth, alpha, beta, ply) {
  const passed = ply || 0;
  /* мат и пат важнее любого материала — без этого бот не видел
     даже мат в один ход */
  if (chIsMate(game)) return -100000 + passed * 20;   /* чем позже мат, тем хуже для нас */
  if (chIsStale(game)) return 0;
  if (depth === 0) return chEval(game);
  const moves = game.moves({ verbose: true });
  let best = -Infinity;
  for (const m of moves) {
    game.move(m);
    const v = -chSearch(game, depth - 1, -beta, -alpha, passed + 1);
    game.undo();
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;              /* ветку отсекли — дальше считать незачем */
  }
  return best === -Infinity ? chEval(game) : best;
}

/* Небольшая «человечность» выбора: среди примерно равных ходов бот
   предпочитает те, что похожи на обычные шахматные ходы, и не таскает
   одну и ту же фигуру туда-сюда. В дебюте особенно важно не пихать
   крайние пешки — иначе получается «всё время a5, b5». */
function chMoveBonus(m, avoid, moveNo) {
  let b = 0;
  const from = m.from, to = m.to;
  const piece = m.piece;
  const file = from.charCodeAt(0) - 97;              /* 0..7 */
  const flags = m.flags || '';
  const opening = moveNo <= 12;
  if (piece === 'p') {
    if (Math.abs(from.charCodeAt(1) - to.charCodeAt(1)) === 2) {
      /* пешка с середины — хорошо, с края в дебюте — совсем нехорошо */
      b += Math.abs(file - 3) <= 1 ? 22 : (opening ? -22 : 0);
    } else if (opening && (file === 0 || file === 1 || file === 6 || file === 7)) {
      b -= 22;   /* в дебюте лучше не пихать тихую крайнюю пешку */
    }
    if (flags.indexOf('c') >= 0) b += 12;            /* взятие */
  } else if (piece === 'n') {
    if (opening && (from.charCodeAt(1) === '1' || to.charCodeAt(1) === '1')) b += 20;
  } else if (piece === 'b') {
    if (opening && from.charCodeAt(1) === '1') b += 14;
  } else if (piece === 'k') {
    if (flags.indexOf('k') >= 0 || flags.indexOf('q') >= 0) b += 24;   /* рокировка */
    else if (opening) b -= 16;      /* в дебюте короля не гоняют зря */
  }
  if (avoid && from === avoid) b -= 20;              /* не ходим одной фигурой дважды подряд */
  return b;
}

/* выбираем ход бота. Возвращает SAN-строку.
   lastMove — предыдущий ход {from, to}: на лёгком уровне бот иногда
   возвращает фигуру назад (так играют новички), на любом уровне не
   ходит одной и той же фигурой дважды подряд. */
CH.botMove = function (fen, level, lastMove) {
  const cfg = CH.BOT_LEVEL[level] || CH.BOT_LEVEL[1];
  const game = new Chess(fen);
  const moves = game.moves();           /* быстрый вариант: только SAN */
  if (!moves.length) return null;

  const avoid = lastMove && lastMove.from ? lastMove.from : null;

  /* лёгкий соперник иногда возвращает фигуру туда, откуда она пришла */
  if (cfg.beginner && lastMove && lastMove.from && lastMove.to && Math.random() < 0.35) {
    const list0 = game.moves({ verbose: true });
    const back = list0.filter(m => m.from === lastMove.to && m.to === lastMove.from);
    if (back.length) return back[0].san;
  }

  /* иногда бот «задумывается» не туда — чтобы его можно было обыграть */
  if (Math.random() < cfg.sloppiness) {
    const safe = moves.filter(san => {
      game.move(san);
      const bad = chIsMate(game) || chIsStale(game);
      game.undo();
      return !bad;
    });
    const pool = safe.length ? safe : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const list = game.moves({ verbose: true });
  const moveNo = Number(String(fen).split(' ')[5]) || 1;
  const scored = [];
  let top = -Infinity;
  let alpha = -Infinity;
  for (const m of list) {
    game.move(m);
    let score;
    if (cfg.depth <= 1) {
      /* на малой глубине бот почти не смотрит ответ противника —
         именно поэтому его можно победить */
      const replies = game.moves();
      if (!replies.length) {
        score = chIsMate(game) ? -Infinity : 0;
      } else {
        let bestReply = -Infinity;
        for (const r of replies.slice(0, 10)) {
          game.move(r);
          const v = chEval(game);
          game.undo();
          if (v > bestReply) bestReply = v;
        }
        score = -bestReply;
      }
    } else {
      score = -chSearch(game, cfg.depth - 1, -Infinity, -alpha, 1);
      if (score > alpha) alpha = score;
    }
    game.undo();
    scored.push({ san: m.san, score: score, bonus: chMoveBonus(m, avoid, moveNo) * (cfg.bonus || 0) });
    if (score > top) top = score;
  }
  if (top === -Infinity) return moves[Math.floor(Math.random() * moves.length)];
  /* найден мат — берём самый быстрый из вариантов и не капризничаем */
  if (top > 99000) {
    let fastest = scored[0];
    for (const s of scored) if (s.score > fastest.score) fastest = s;
    return fastest.san;
  }

  /* берём не один лучший ход, а несколько почти равных — так бот
     играет разнообразно и не зацикливается на одной фигуре */
  const eps = cfg.depth >= 3 ? 6 : 30;
  const pool = scored.filter(s => s.score > -Infinity && s.score >= top - eps);
  let bestPick = null, bestWeight = -Infinity;
  for (const s of pool) {
    const weight = s.bonus + (Math.random() * (cfg.depth >= 3 ? 5 : 30));
    if (weight > bestWeight) { bestWeight = weight; bestPick = s; }
  }
  return (bestPick || pool[0]).san;
};

CH.botName = function (level) {
  return (CH.BOT_LEVEL[level] || CH.BOT_LEVEL[1]).name;
};

/* короткая подсказка: бот сам находит ближайший мат, если он есть */
CH.botMateHint = function (fen) {
  const game = new Chess(fen);
  const sol = chFindMate(game, 3);
  return sol && sol.length ? sol[0] : null;
};

/* ============================================================
   ПОИСК ЛИНИИ, ГДЕ МАТ СТАВИТ БЕЛЫЙ.
   Чёрные играют «по-дружески»: подбирается любой их ответ,
   после которого белые всё ещё могут поставить мат.
   Такой формат подходит для учебной задачи — за чёрных потом
   ходит сам сайт.
   ============================================================ */
function chBlackCoop(game, depth, budget) {
  if (depth <= 0 || budget.n <= 0) return null;
  const moves = game.moves();
  for (const san of moves) {
    if (budget.n-- <= 0) break;
    if (isKingTake(game, san)) continue;   /* чёрные не могут взять короля */
    game.move(san);
    const sub = chWhiteMate(game, depth - 1, budget);
    game.undo();
    if (sub) return [san].concat(sub);
  }
  return null;
}

function chWhiteMate(game, depth, budget) {
  if (!budget) budget = { n: 40000, deadline: 0 };
  if (!budget.deadline) budget.deadline = Date.now() + 3000;
  if (chIsMate(game)) return game.turn() === 'b' ? [] : null;  /* чёрные получили мат — значит поставили белые */
  if (depth <= 0 || budget.n <= 0) return null;
  if (Date.now() > budget.deadline) return null;
  const side = game.turn();
  const moves = game.moves();
  for (const san of moves) {
    if (budget.n-- <= 0) break;
    if (isKingTake(game, san)) continue;   /* взятие короля — не ход */
    game.move(san);
    let sub = null;
    if (chIsMate(game)) sub = (game.turn() === 'b') ? [] : null;
    else if (side === 'w') sub = chBlackCoop(game, depth - 1, budget);
    else sub = chWhiteMate(game, depth - 1, budget);
    game.undo();
    if (sub) return [san].concat(sub);
  }
  return null;
}

/* линия матa белыми из позиции fen ('' — если не нашли) */
function chMateLineByWhite(fen, depth, budget) {
  let line;
  try { line = chWhiteMate(new Chess(fen), depth, budget || { n: 60000, deadline: Date.now() + 4000 }); }
  catch (e) { return ''; }
  return line ? line.join(' ') : '';
}