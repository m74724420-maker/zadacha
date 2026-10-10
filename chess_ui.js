/* =============================================================
   Шахматы: доска, ходы, задачи и игра с ботом.
   Правила и проверка ходов — chess.js.
   ============================================================= */

const UI = window.UI || (window.UI = {});

/* спрятать все игровые блоки, кроме нужного */
function hideAllGameAreas() {
  var ids = ['answerArea', 'sudokuArea', 'minesArea', 'matchArea', 'chessArea',
    'chessScore', 'chessBtns', 'chessStyles'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.hidden = true;
  }
}

/* ---------------- СТИЛИ ДОСКИ И ФИГУР ---------------- */
/* Стили выбирает сам человек — в профиле и прямо в игре */
const CH_BOARDS = {
  light:  { name: 'Светлая',   light: '#f3e9d2', dark: '#c9a227', line: '#8a6d1f' },
  green:  { name: 'Зелёная',   light: '#eeeed2', dark: '#769656', line: '#4a5d34' },
  wood:   { name: 'Деревянная', light: '#e8c99a', dark: '#a97f4f', line: '#7a5630' },
  dark:   { name: 'Тёмная',    light: '#8f9aa8', dark: '#4c5866', line: '#2b333d' },
  blue:   { name: 'Синяя',     light: '#dbe7f5', dark: '#7fa3cd', line: '#4a6b91' }
};

/* два набора фигур: заливка и контур */
const CH_PIECES = {
  solid:   { name: 'Классические', white: '♔♕♖♗♘♙', black: '♚♛♜♝♞♟' },
  outline: { name: 'Контур', white: '♔♕♖♗♘♙', black: '♚♛♜♝♞♟', outline: true }
};

function chBoardTheme() { return CH_BOARDS[state.chessBoard] || CH_BOARDS.green; }
function chPieceTheme() { return CH_PIECES[state.chessPieces] || CH_PIECES.solid; }

/* фигура может прийти буквой или объектом — приводим к общему виду */
function chPieceInfo(p) {
  if (!p) return null;
  if (typeof p === 'string') {
    return { type: p.toLowerCase(), color: p === p.toUpperCase() ? 'w' : 'b' };
  }
  var t = String(p.type);
  return { type: t.toLowerCase(), color: p.color || (t === t.toUpperCase() ? 'w' : 'b') };
}

const PIECE_ORDER = ['k', 'q', 'r', 'b', 'n', 'p'];

/* ---------------- ДОСКА ---------------- */
/* Размер доски держим в переменной chessFitSize: сама доска
   пересоздаётся при каждом ходе, и если задавать размер только
   после перерисовки, она на кадр успевает «моргнуть» — это и было
   видно как отдаление и приближение при каждом ходе. */
let chessFitSize = 0;

function renderChessBoard(game, stateObj) {
  const area = document.getElementById('chessArea');
  const bt = chBoardTheme();
  const pt = chPieceTheme();

  const board = document.createElement('div');
  board.className = 'chessboard';
  board.style.setProperty('--sq-light', bt.light);
  board.style.setProperty('--sq-dark', bt.dark);
  /* сразу ставим уже измеренный размер — доска не прыгает */
  if (chessFitSize) board.style.width = chessFitSize + 'px';

  const squares = game.board();          /* squares[0] — 8-я горизонталь */
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = 'csq ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
      const piece = squares[row][col];
      const sqName = String.fromCharCode(97 + col) + (8 - row);
      cell.dataset.sq = sqName;

      if (piece) {
        const info = chPieceInfo(piece);
        const span = document.createElement('span');
        span.className = 'cpiece ' + (info.color === 'w' ? 'white' : 'black') +
          (pt.outline ? ' outline' : '');
        const idx = PIECE_ORDER.indexOf(info.type);
        span.textContent = info.color === 'w' ? pt.white.charAt(idx) : pt.black.charAt(idx);
        cell.appendChild(span);
      }

      /* подсветка выбранной фигуры и возможных ходов */
      if (stateObj.sel === sqName) cell.classList.add('sel');
      if (stateObj.moves && stateObj.moves[sqName]) {
        cell.classList.add('target');
        if (stateObj.capture[sqName]) cell.classList.add('capture');
      }
      if (stateObj.last && stateObj.last.indexOf(sqName) >= 0) cell.classList.add('lastmove');

      cell.addEventListener('click', () => onSquareClick(sqName));
      board.appendChild(cell);
    }
  }

  /* Подписи полей и файлов — помогают пенсионеру ориентироваться.
     Раньше они жили отдельным блоком своей ширины и не совпадали
     с доской: буквы уезжали вбок, а невидимые цифры занимали место и
     наезжали на нижний ряд фигур. Теперь подписи живут в одной
     обёртке с доской и растягиваются ровно на её ширину. */
  const wrap = document.createElement('div');
  wrap.className = 'chess-wrap';
  wrap.appendChild(board);

  /* Буквы — строкой под доской, цифры — колонкой слева. Раньше всё
     лежало в одной сетке, и цифры оказывались ВЫШЕ своих рядов:
     доска уезжала вниз, а номера оставались наверху. */
  const top = document.createElement('div');
  top.className = 'chesslabels';
  let html = '';
  for (let col = 0; col < 8; col++) html += '<span class="clet">' + 'abcdefgh'[col] + '</span>';
  top.innerHTML = html;

  const side = document.createElement('div');
  side.className = 'chessnums';
  html = '';
  for (let row = 0; row < 8; row++) html += '<span class="cnum">' + (8 - row) + '</span>';
  side.innerHTML = html;

  wrap.appendChild(top);
  wrap.appendChild(side);
  wrap.appendChild(board);

  area.innerHTML = '';
  area.appendChild(wrap);
}

/* какие ходы возможны из выбранной клетки */
function legalMovesFrom(game, sq) {
  const out = {};
  const capture = {};
  const game2 = new Chess(game.fen());
  const moves = game2.moves({ verbose: true });
  for (const m of moves) {
    if (m.from !== sq) continue;
    out[m.to] = true;
    if (m.captured) capture[m.to] = true;
  }
  return { moves: out, capture: capture };
}

/* ---------------- ХОД ЩЕЛЧКОМ ПО ЩЕЛЧКУ ---------------- */
function onSquareClick(sq) {
  const g = state.game;
  if (!g || g.mode !== 'chess') return;
  if (g.busy || g.over) return;
  if (g.turn !== g.human) return;

  const game = new Chess(g.fen);

  /* выбрали свою фигуру */
  if (g.sel && g.moves && g.moves[sq]) {
    const san = makeMove(game, g.sel, sq);
    if (san) {
      g.history.push(g.fen);                 /* запоминаем, куда вернуться */
      g.fen = game.fen();
      g.lastSan = san.san || san;
      g.last = [g.sel, sq];              /* запоминаем, куда пошли */
      g.sel = null; g.moves = null; g.capture = {};
      renderChess();
      afterChessMove();
      return;
    }
  }

  const pieceOn = pieceAt(game, sq);
  if (pieceOn && pieceOn.color === g.turn) {
    g.sel = sq;
    const lm = legalMovesFrom(game, sq);
    g.moves = lm.moves;
    g.capture = lm.capture;
    renderChessBoard(game, g);
  } else {
    g.sel = null; g.moves = null;
    renderChessBoard(game, g);
  }
}

function pieceAt(game, sq) {
  const b = game.board();
  const col = sq.charCodeAt(0) - 97;
  const rank = sq.charCodeAt(1) - 49;
  const row = 8 - rank - 1;
  const p = b[row] && b[row][col];
  if (!p) return null;
  const info = chPieceInfo(p);
  return info ? { color: info.color, type: info.type } : null;
}

/* ход по двум клеткам; возвращает SAN или null */
function makeMove(game, from, to) {
  const moves = game.moves({ verbose: true });
  for (const m of moves) {
    if (m.from === from && m.to === to) {
      return game.move(m);
    }
  }
  return null;
}

/* ---------------- СОСТОЯНИЕ ИГРЫ ---------------- */
function startChessPuzzle(task) {
  state.game = {
    mode: 'chess',
    fen: task.data.fen,
    turn: 'w',
    human: 'w',
    sel: null, moves: null, capture: {}, last: [],
    history: [],
    over: false, won: false, busy: false,
    moveCount: 0,
    solution: task.solution.slice(),
    task: task
  };
  renderChess();
  fitChessBoardLater();
  chessStatus('Найдите ход, который даёт мат.');
}

function startChessGame(level) {
  state.game = {
    mode: 'chess',
    fen: new Chess().fen(),
    turn: 'w',
    human: 'w',
    sel: null, moves: null, capture: {}, last: [],
    history: [],
    over: false, won: false, busy: false,
    moveCount: 0,
    level: level,
    botLevel: level
  };
  renderChess();
  fitChessBoardLater();
  chessStatus('Игра с ботом «' + CH.botName(level) + '». Вы ходите белыми.');
}

function renderChess() {
  const g = state.game;
  if (!g) return;
  const game = new Chess(g.fen);
  /* Запоминаем, где человек находился: подгонка доски меняет высоту
     страницы, и без этого экран прыгал назад при каждом ходе. */
  const wasY = window.scrollY;
  renderChessBoard(game, g);
  drawChessScore(game);
  /* Размер доски при ходе НЕ пересчитываем: он посчитан при
     открытии задачи, а новая доска сразу получает его из
     chessFitSize. Пересчёт на каждом ходу и был причиной рывков:
     доска то увеличивалась, то уменьшалась сама по себе. */
  if (Math.abs(window.scrollY - wasY) > 1) window.scrollTo(0, wasY);
}

/* Подгоняем доску под экран: она должна быть ровным квадратом,
   влезать и по ширине, и по высоте, а буквы и цифры остаются на полях.
   Поэтому считаем две границы — ширину и высоту — и берём меньшую. */
/* Считаем размер на следующем кадре: сразу после вставки доски
   браузер ещё не посчитал высоту, и доска вышла бы маленькой. */
function fitChessBoardLater() {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fitChessBoard);
  else setTimeout(fitChessBoard, 0);
}

function fitChessBoard() {
  const board = document.querySelector('#chessArea .chessboard');
  const labels = document.querySelector('#chessArea .chesslabels');
  const nav = document.querySelector('.bottom-nav');
  if (!board || !nav) return;
  /* Размер доски НЕЛЬЗЯ сбрасывать перед измерением: пустая строка
     мгновенно возвращала доску к 480px, а потом мы ставили обратно —
     на экране это выглядело как отдаление и приближение при каждом ходе. */
  /* Размер доски НЕЛЬЗЯ сбрасывать перед измерением: пустая строка
     мгновенно возвращала доску к 480px, а потом мы ставили обратно —
     на экране это выглядело как отдаление и приближение при каждом ходе. */

  /* ширина: свободное место в блоке шахмат минус колонка цифр.
     Считаем от #chessArea, а не от обёртки: обёртка обжимается по
     доске, и если мерить её, доска схлопывается до минимума. */
  const area = document.getElementById('chessArea');
  const room = (area ? area.clientWidth : window.innerWidth) - 30;
  const wide = Math.min(640, Math.floor(room));

  /* высота: от верха доски до панели. Считаем от верха страницы, а не
     от текущего положения: если человек прокрутил вниз, координаты
     на экране не совпадают с настоящими, и доска вырастает поверх панели. */
  const top = (area ? area : board).getBoundingClientRect().top + window.scrollY;
  const navTop = nav.getBoundingClientRect().top + window.scrollY;
  const tall = Math.floor(navTop - top - 24 - 8);

  /* Ниже 260px доска становится нечитаемой: лучше пусть страница
     прокручивается, чем фигуры слипнутся в пятно. */
  const MIN_BOARD = 260;
  const size = Math.max(MIN_BOARD, Math.min(wide, tall));
  /* Размер не трогаем без нужды: любая смена высоты страницы
     передвигает экран под человеком. */
  if (Math.abs(size - chessFitSize) < 1) return;
  chessFitSize = size;
  board.style.width = size + 'px';
  /* буквы идём вразрез рамке — их ширина равна ширине доски */
  if (labels) labels.style.width = size + 'px';
}

/* Шрифт в настройках меняют на ходу — доска должна подстроиться сразу */
window.addEventListener('resize', function () {
  if (state && state.game && state.game.kind === 'chess') fitChessBoard();
});

function drawChessScore(game) {
  const g = state.game;
  const bar = document.getElementById('chessScore');
  if (!bar) return;
  const turn = game.turn() === 'w' ? 'белые' : 'чёрные';
  let txt = 'Ход: ' + turn + ' · ходов сделано: ' + g.moveCount;
  if (chIsMate(game)) txt += ' · мат!';
  else if (chIsCheck(game)) txt += ' · шах!';
  bar.textContent = txt;
}

/* kind: 'ok' — зелёный (похвала), 'no' — красный (ошибка),
   без kind — обычное серое сообщение (например, «ход чёрных») */
function chessStatus(text, kind) {
  const el = document.getElementById('resultBox');
  if (!el) return;
  el.hidden = false;
  el.className = 'result' + (kind ? ' ' + kind : '');
  el.textContent = text;
  /* Для шахмат сообщение ставим сразу под доской: ниже него идут
     настройки доски и кнопки, и победа оказывалась в самом низу —
     человек её не видел, пока не прокрутит страницу. */
  const score = document.getElementById('chessScore');
  if (score && score.parentNode && el.parentNode === document.querySelector('.game-sheet')) {
    score.parentNode.insertBefore(el, score);
  }
  /* сообщение о мате или победе важно показать сразу, а не под панелью */
  if (kind === 'ok') {
    /* Прокручиваем только если сообщение реально не видно: иначе
       страница дёргалась вверх на каждом ходе. */
    const r = el.getBoundingClientRect();
    const nav = document.querySelector('.bottom-nav');
    const bottom = nav ? nav.getBoundingClientRect().top : window.innerHeight;
    if (r.top < 0 || r.bottom > bottom) {
      try { el.scrollIntoView({ block: 'center' }); } catch (e) { /* не везде есть */ }
    }
  }
}

/* ---------------- ХОД БОТА ---------------- */
function afterChessMove() {
  const g = state.game;
  g.moveCount++;
  const game = new Chess(g.fen);

  if (chIsMate(game)) {
    g.over = true;
    const whiteWin = game.turn() === 'b';   /* ходили белые и поставили мат */
    if (g.mode === 'chess' && g.task) {
      if (whiteWin) {
        chessStatus('Поздравляем! Мат поставлен 🎉 Задача засчитана.', 'ok');
        markSolved();
      } else {
        chessStatus('Чёрные поставили мат. Посмотрите разбор и попробуйте другую задачу.', 'no');
      }
    } else {
      chessStatus(whiteWin
        ? 'Поздравляем, вы выиграли! 🎉 Партия закончилась.'
        : 'К сожалению, бот победил. Можно начать новую партию.', whiteWin ? 'ok' : 'no');
    }
    drawChessScore(game);
    return;
  }
  if (chIsStale(game)) {
    g.over = true;
    chessStatus('Ничья — пат. Начните новую партию или новую задачу.');
    return;
  }

  if (g.task) {
    /* проверяем задачу: сыграл ли человек правильный вариант */
    checkPuzzleProgress(game);
  } else {
    /* игра с ботом — пусть ходит бот */
    if (game.turn() === g.human) drawChessScore(game);
    else botTurn();
  }
}

/* ход человека совпал с началом решения — показываем это */
function checkPuzzleProgress(game) {
  const g = state.game;
  const san = g.lastSan || '';
  g.lastMove = san;

  if (!g.solution || !g.solution.length) return;
  if (san === g.solution[0]) {
    g.solution = g.solution.slice(1);
    if (g.solution.length === 2) {
      chessStatus('Правильный первый ход! Сейчас чёрные ответят, а потом поставьте мат.', 'ok');
      playBlackReply();          /* ход чёрных делает сайт */
    } else if (g.solution.length === 1) {
      chessStatus('Правильный ход! Остался последний ход — до мата.', 'ok');
    } else {
      chessStatus('Ход верный. Продолжайте по варианту.', 'ok');
    }
  } else if (chIsCheckmateSoon(game)) {
    /* человек поставил мат раньше срока — тоже отлично */
  }
}

function playBlackReply() {
  const g = state.game;
  const want = g.solution && g.solution[0];
  if (!want) return;
  setTimeout(function () {
    if (!state.game || state.game !== g) return;
    const game = new Chess(g.fen);
    let san = want;
    if (game.moves().indexOf(want) < 0) san = game.moves()[0];
    if (!san) return;
    const mv = game.moves({ verbose: true }).filter(function (x) { return x.san === san; })[0];
    game.move(san);
    g.fen = game.fen();
    if (mv) g.last = [mv.from, mv.to];
    g.solution = g.solution.slice(1);
    g.moveCount++;
    renderChess();
    chessStatus('Чёрные ответили. Теперь ваш ход — поставьте мат!');
  }, 700);
}

/* осталось ли ровно одно поле до мата */
function chIsCheckmateSoon(game) {
  const moves = game.moves();
  for (const san of moves) {
    game.move(san);
    const mate = chIsMate(game);
    game.undo();
    if (mate) return true;
  }
  return false;
}

function lastTwoSquares(fen) {
  try {
    const g = new Chess(fen);
    const moves = g.moves({ verbose: true });
    /* у новой позиции истории нет — берём из сохранённой */
    return [];
  } catch (e) { return []; }
}

function botTurn() {
  const g = state.game;
  g.busy = true;
  chessStatus('Бот думает…');
  const game = new Chess(g.fen);
  /* небольшая задержка, чтобы человек увидел, что бот «думает» */
  setTimeout(() => {
    if (!state.game || state.game !== g) return;
    const g2 = new Chess(g.fen);
    /* бот помнит свой собственный прошлый ход: на лёгком уровне он
       иногда возвращает фигуру назад, а на любом уровне не дёргает
       одной фигурой дважды подряд */
    const lastMove = (g.botLast && g.botLast.length >= 2)
      ? { from: g.botLast[0], to: g.botLast[1] } : null;
    const san = CH.botMove(g2.fen(), g.botLevel, lastMove);
    if (san) {
      const mv = g2.moves({ verbose: true }).filter(function (x) { return x.san === san; })[0];
      g.history.push(g.fen);
      g2.move(san);
      g.fen = g2.fen();
      if (mv) { g.last = [mv.from, mv.to]; g.botLast = [mv.from, mv.to]; }
      g.moveCount++;
      g.busy = false;
      renderChess();
      const after = new Chess(g.fen);
      if (chIsMate(after)) {
        g.over = true;
        chessStatus(after.turn() === 'w'
          ? 'К сожалению, бот поставил вам мат. Попробуйте уровень полегче.'
          : 'Победа! Бот попал под мат 🎉', after.turn() === 'w' ? 'no' : 'ok');
      } else if (chIsStale(after)) {
        g.over = true;
        chessStatus('Ничья.');
      } else {
        chessStatus('Ход бота сделан. Ваш ход.');
      }
      drawChessScore(after);
    } else {
      g.busy = false;
    }
  }, 450);
}

/* ---------------- КНОПКИ ПОД ДОСКОЙ ---------------- */
function renderChessButtons() {
  const box = document.getElementById('chessBtns');
  if (!box) return;
  const g = state.game;
  box.innerHTML = '';
  const mk = (txt, fn, cls) => {
    const b = document.createElement('button');
    b.className = 'link-btn' + (cls ? ' ' + cls : '');
    b.textContent = txt;
    b.addEventListener('click', fn);
    box.appendChild(b);
  };
  mk('↩ Отменить ход', () => {
    /* отменять нечего, если история пуста — новая доска, созданная из
       FEN, своей истории не помнит */
    if (!g.history || !g.history.length) { toast('Отменять пока нечего'); return; }
    g.fen = g.history.pop();
    g.moveCount = Math.max(0, g.moveCount - 1);
    g.sel = null; g.moves = null; g.over = false; g.busy = false;
    g.lastSan = ''; g.lastMove = '';
    renderChess();
    chessStatus('Ход отменён.');
  });
  if (g.task) {
    mk('Показать решение', () => {
      document.getElementById('solutionBtn').click();
    });
    mk('Другая задача этого уровня', () => openTask('chess', g.task.level));
  } else {
    mk('Новая партия', () => startChessGame(g.botLevel));
  }
}

/* ---------------- ВЫБОР СТИЛЯ (прямо в игре) ---------------- */
function renderChessStylePickers() {
  const box = document.getElementById('chessStyles');
  if (!box) return;
  box.innerHTML = '';

  const mkGroup = (title, options, current, onPick) => {
    const row = document.createElement('div');
    row.className = 'style-row';
    const lab = document.createElement('span');
    lab.className = 'style-label';
    lab.textContent = title;
    row.appendChild(lab);
    options.forEach(o => {
      const b = document.createElement('button');
      b.className = 'style-btn' + (o.id === current ? ' active' : '');
      b.textContent = o.name;
      if (o.color) {
        b.style.background = o.color;
        b.style.color = o.color2 || '#000';
      }
      b.addEventListener('click', () => {
        onPick(o.id);
        renderChessStylePickers();
        if (state.game) renderChess();
      });
      row.appendChild(b);
    });
    box.appendChild(row);
  };

  mkGroup('Доска:',
    Object.keys(CH_BOARDS).map(k => ({ id: k, name: CH_BOARDS[k].name,
      color: CH_BOARDS[k].light, color2: CH_BOARDS[k].line })),
    state.chessBoard,
    id => { state.chessBoard = id; storeSet('chessBoard', id); });

  mkGroup('Фигуры:',
    Object.keys(CH_PIECES).map(k => ({ id: k, name: CH_PIECES[k].name })),
    state.chessPieces,
    id => { state.chessPieces = id; storeSet('chessPieces', id); });
}