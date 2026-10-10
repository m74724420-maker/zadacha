/* Генератор шахматных задач «мат за 2 хода» (белые ставят мат).
   Нужен только при наполнении базы chess_bank.js — в самой игре не участвует. */

const CH_FILES = 'abcdefgh';

function chRandomInt(n) { return Math.floor(Math.random() * n); }
function chRandomSq() { return CH_FILES[chRandomInt(8)] + (1 + chRandomInt(8)); }
function chSquareIndex(s) { return (s.charCodeAt(1) - 49) * 8 + (s.charCodeAt(0) - 97); }
function chKingDistance(a, b) {
  return Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)),
                  Math.abs(a.charCodeAt(1) - b.charCodeAt(1)));
}

/* собираем FEN из расстановки вида { kW:{sq,type,color}, ... } */
function chFenFromPlaced(placed) {
  const board = new Array(64).fill(null);
  for (const key in placed) {
    const p = placed[key];
    /* в FEN белые фигуры — заглавными буквами, чёрные — строчными */
    board[chSquareIndex(p.sq)] = (p.color === 'w' ? p.type.toUpperCase() : p.type);
  }
  const rows = [];
  for (let r = 7; r >= 0; r--) {
    let row = '', gap = 0;
    for (let f = 0; f < 8; f++) {
      const p = board[r * 8 + f];
      if (!p) { gap++; continue; }
      if (gap) { row += gap; gap = 0; }
      row += p;
    }
    if (gap) row += gap;
    rows.push(row);
  }
  return rows.join('/') + ' w - - 0 1';
}

/* одна случайная позиция: белый король + ферзь (+ ладья/слон),
   чёрный король (+ пешки/конь) */
function chRandomPosition() {
  const used = {};
  const placed = {};
  let wKingSq = '', bKingSq = '';
  function put(type, color) {
    let sq = '';
    for (let i = 0; i < 20; i++) {
      sq = chRandomSq();
      /* пешки не могут стоять на первой и восьмой линиях */
      if (type === 'p' && (sq[1] === '1' || sq[1] === '8')) continue;
      if (!used[sq]) break;
      sq = '';
    }
    if (!sq) return false;
    used[sq] = 1;
    /* ключ должен быть уникальным, иначе фигуры затирают друг друга */
    placed['p' + Object.keys(placed).length] = { sq: sq, type: type, color: color };
    if (type === 'k') { if (color === 'w') wKingSq = sq; else bKingSq = sq; }
    return true;
  }
  if (!put('k', 'w')) return null;
  if (!put('k', 'b')) return null;
  if (!put('q', 'w')) return null;
  if (Math.random() < 0.45 && !put('r', 'w')) return null;
  if (Math.random() < 0.25 && !put('b', 'w')) return null;
  /* чёрным нужны пешки: иначе королю некуда деться и получается пат */
  const pawns = 1 + chRandomInt(3);
  for (let i = 0; i < pawns; i++) if (!put('p', 'b')) return null;
  if (Math.random() < 0.25 && !put('n', 'b')) return null;
  if (chKingDistance(wKingSq, bKingSq) < 2) return null;
  return chFenFromPlaced(placed);
}

/* ищем count задач «мат за 2 хода» за msLimit миллисекунд */
function chGenerateMate2(count, msLimit) {
  const out = [];
  const seen = {};
  const stop = Date.now() + (msLimit || 20000);
  let tries = 0, skipped = 0;
  while (out.length < count && Date.now() < stop) {
    tries++;
    const fen = chRandomPosition();
    if (!fen) { skipped++; continue; }
    if (seen[fen]) continue;
    let game;
    try { game = new Chess(fen); } catch (e) { skipped++; continue; }
    /* Чёрный король не должен стоять под боем.
       ВНИМАНИЕ: game.in_check() при ходе белых проверяет БЕЛОГО короля,
       а нам нужен чёрный. Поэтому переворачиваем очередь хода. */
    const parts = fen.split(' ');
    parts[1] = 'b';
    let bgame;
    try { bgame = new Chess(parts.join(' ')); } catch (e) { skipped++; continue; }
    if (bgame.in_check()) { skipped++; continue; }
    const verdict = game.validate_fen(game.fen());
    if (verdict && verdict.error && verdict.error !== 'No errors.') { skipped++; continue; }
    if (game.moves().length < 2) { skipped++; continue; } /* ходить почти нечем */
    seen[fen] = 1;
    /* мат за один ход — это задачи первого уровня, пропускаем */
    if (chWhiteMate(game, 1, { n: 2000, deadline: Date.now() + 100 })) { skipped++; continue; }
    const line = chWhiteMate(game, 3, { n: 30000, deadline: Date.now() + 700 });
    if (!line) { skipped++; continue; }
    /* линия должна быть из трёх полуходов: наш ход, ответ чёрных, мат */
    if (line.length !== 3) { skipped++; continue; }
    /* мат должен ставить последним ходом белых */
    const check = new Chess(fen);
    check.move(line[0]); check.move(line[1]); check.move(line[2]);
    if (!(check.turn() === 'b' && chIsMate(check))) { skipped++; continue; }
    out.push([fen, line.join(' ')]);
  }
  return { found: out, tries: tries, skipped: skipped };
}
