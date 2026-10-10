/* =============================================================
   Шахматные задачи — своя база.

   Каждая позиция проверена движком правил chess.js при
   подготовке базы: все ходы решения законны, в конце мат,
   и короткого мата за один ход нет.

   mate1 — мат за 1 ход (уровень «Легко»).
   mate2 — комбинация из двух ходов белых (уровни «Средне»
   и «Сложно»): первый ход белых, ответ чёрных, затем мат.
   Ответ за чёрных делает сам сайт — бабушке остаётся только
   поставить мат.

   База построена генератором chess_gen.js и проверена поиском
   chWhiteMate (ищет линию, где мат ставит именно белый цвет).
   ============================================================= */

const CHESS_BANK = {
  mate1: [
    ["2k5/3R4/8/8/7K/8/1Q6/8 w - - 0 1", "Qb7#"],
    ["2k5/3R4/8/8/8/6K1/4Q3/8 w - - 0 1", "Qe8#"],
    ["7k/2K5/8/1R6/8/8/8/6Q1 w - - 0 1", "Rh5#"],
    ["7k/4Q3/2R5/2K5/8/8/8/8 w - - 0 1", "Rc8#"],
    ["k7/8/3K4/8/8/6Q1/8/1R6 w - - 0 1", "Qa3#"],
    ["3k4/5R2/8/7K/8/6Q1/8/8 w - - 0 1", "Qb8#"],
    ["7k/8/7K/8/8/1QR5/8/8 w - - 0 1", "Qb8#"],
    ["6k1/1R6/8/8/8/8/8/1K2Q3 w - - 0 1", "Qe8#"],
    ["3k4/1R6/4K3/8/2Q5/8/8/8 w - - 0 1", "Rb8#"],
    ["k7/3Q4/4R3/2K5/8/8/8/8 w - - 0 1", "Re8#"],
    ["k7/3K4/8/1Q6/8/8/4R3/8 w - - 0 1", "Ra2#"],
    ["7k/3K1Q2/8/8/8/6R1/8/8 w - - 0 1", "Qg8#"],
    ["4k3/2R5/8/8/K5Q1/8/8/8 w - - 0 1", "Qc8#"],
    ["3K2k1/2R5/8/8/8/2Q5/8/8 w - - 0 1", "Qg7#"],
    ["k7/1R6/8/8/3Q2K1/8/8/8 w - - 0 1", "Qa7#"],
    ["3k4/5Q2/1K5R/8/8/8/8/8 w - - 0 1", "Rh8#"],
    ["6k1/8/6K1/8/8/8/3Q4/6R1 w - - 0 1", "Qd8#"],
    ["k7/8/7Q/8/1R6/8/1K6/8 w - - 0 1", "Qa6#"],
    ["1k6/3Q4/8/8/2K5/8/8/7R w - - 0 1", "Rh8#"],
    ["6k1/8/6K1/8/1R5Q/8/8/8 w - - 0 1", "Rb8#"],
    ["1k6/8/1K6/6Q1/8/4R3/8/8 w - - 0 1", "Qd8#"],
    ["7k/4R3/4Q3/8/8/8/6K1/8 w - - 0 1", "Qc8#"],
    ["3k4/8/3K4/8/8/8/7R/3Q4 w - - 0 1", "Rh8#"],
    ["1k6/6RQ/7K/8/8/8/8/8 w - - 0 1", "Rg8#"]
  ],
  mate2: [
    ["8/8/8/4n3/3pK1Q1/7k/6p1/8 w - - 0 1", "Qxh3 Nc6 Qg4#"],
    ["6kQ/8/6p1/8/6K1/p7/p7/8 w - - 0 1", "Qxg8 g5 Qh8#"],
    ["8/R7/p7/8/3k2Q1/8/8/3K4 w - - 0 1", "Rb7+ Kd3 Rb3#"],
    ["8/6Q1/2p1p3/6k1/8/8/7p/2K5 w - - 0 1", "Qxg5 c5 Qf6#"],
    ["8/3Qk3/6p1/1K6/8/8/8/3B4 w - - 0 1", "Qxe7 g5 Qd8#"],
    ["1B2K3/8/6p1/7k/6p1/8/3p1Q2/8 w - - 0 1", "Be5 Kh6 Qh4#"],
    ["3k4/p7/1p6/8/p7/8/3Q2K1/8 w - - 0 1", "Qxd8 a6 Qe8#"],
    ["8/7K/1Bp5/2Q5/4k3/1p6/4R3/8 w - - 0 1", "Bc7+ Kf3 Qh5#"],
    ["8/1p6/8/p7/5p2/2k5/8/4QnK1 w - - 0 1", "Qxc3 b6 Qc4#"],
    ["1K6/6p1/8/6pk/3pQ3/8/8/8 w - - 0 1", "Qe6 g6 Qh3#"],
    ["3K4/6p1/3p4/8/8/k7/Q5p1/8 w - - 0 1", "Qxa3 g6 Qa4#"],
    ["3Q4/2R5/8/4p3/K7/7k/8/8 w - - 0 1", "Qg8 e4 Rh7#"],
    ["8/4p3/5R2/8/7k/5Kpp/8/Q7 w - - 0 1", "Rg6 e6 Qh8#"],
    ["5Q2/8/5K2/3B4/p7/1p6/R7/1k6 w - - 0 1", "Qg8 Kc1 Qg1#"],
    ["8/pk5p/Q7/8/8/8/7K/8 w - - 0 1", "Qxb7 a6 Qa8#"],
    ["8/8/8/1Q4K1/4p1n1/7p/8/7k w - - 0 1", "Qa6 h2 Qf1#"],
    ["8/3p3K/5k2/8/B7/8/1Q6/8 w - - 0 1", "Bxd7+ Kf7 Qg7#"],
    ["8/4R3/3k4/4p3/p7/3Q4/6K1/8 w - - 0 1", "Rf7+ Ke6 Qd7#"],
    ["2R3K1/8/8/3pk3/7B/8/4Q3/8 w - - 0 1", "Rd8+ Kf4 Rf8#"],
    ["2k3Q1/3p4/4R3/8/8/4Bp2/8/3K4 w - - 0 1", "Qh7 d6 Re8#"],
    ["8/8/8/KpB5/1p3p2/1Q6/8/3k4 w - - 0 1", "Bd6+ Kc1 Bxf4#"],
    ["8/3K4/3p4/8/1p2n3/8/pk2Q3/R7 w - - 0 1", "Kc8+ Ka3 Qxa2#"],
    ["8/8/4Qn2/8/p4K2/8/7k/8 w - - 0 1", "Qg8 Kh3 Qg3#"],
    ["3kQ3/8/K3pp2/8/8/6n1/8/8 w - - 0 1", "Qxd8 e5 Qe8#"],
    ["8/8/8/6p1/2R1K2k/6Q1/8/8 w - - 0 1", "Rc5+ Kh5 Qxg5#"]
  ]
};

/* сколько фигур на доске — по этому выбираем более сложные задачи */
function chPieceCount(fen) {
  return fen.replace(/[0-9]/g, '').length;
}

/* Задача из базы. level: 1 — мат за 1 ход, 2 и 3 — мат за 2 хода
   (уровень «Сложно» берёт самые насыщенные позиции). */
function chBankPuzzle(level) {
  const lv = Math.min(3, Math.max(1, level || 1));
  let list, whiteMoves;
  if (lv === 1) { list = CHESS_BANK.mate1; whiteMoves = 1; }
  else { list = CHESS_BANK.mate2; whiteMoves = 2; }

  if (!list || !list.length) return null;
  let pool = list;
  if (lv === 3 && list.length > 4) {
    const counts = list.map(function (e) { return chPieceCount(e[0]); })
      .sort(function (a, b) { return a - b; });
    const middle = counts[Math.floor(counts.length / 2)];
    const rich = list.filter(function (e) { return chPieceCount(e[0]) >= middle; });
    if (rich.length) pool = rich;
  }
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const solution = entry[1].split(' ');

  /* перепроверяем движком: все ходы законны, в конце мат белых */
  try {
    const g = new Chess(entry[0]);
    if (!g.moves().length) return null;
    for (const san of solution) {
      if (g.moves().indexOf(san) < 0) return null;
      g.move(san);
    }
    if (g.turn() !== 'b' || !chIsMate(g)) return null;
    return chPuzzle(entry[0], solution, lv, whiteMoves);
  } catch (e) {
    return null;
  }
}
