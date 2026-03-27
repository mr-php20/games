// Aadu Puli Aattam (Goats & Tigers)
// Board: Triangle (top) + Square grid (bottom) — the classic Pulijudam board
//
//          0                    (apex)
//        / | \
//       1--2--3                 (triangle row 1)
//      /|\ | /|\
//     4--5--6--7--8             (triangle base = square row 0)
//     |\/|\/|\/|\/|
//     9-10-11-12-13             (square row 1)
//     |/\|/\|/\|/\|
//    14-15-16-17-18             (square row 2)
//     |\/|\/|\/|\/|
//    19-20-21-22-23             (square row 3)
//
// 24 nodes total: 1 + 3 + 5×4 = 24

export type Piece = 'tiger' | 'goat' | null;
export type Player = 'tiger' | 'goat';
export type Phase = 'placing' | 'moving';

export const NUM_POINTS = 24;
export const TOTAL_GOATS = 15;
export const GOATS_TO_WIN = 5;

// Build adjacency from the board definition
function buildAdjacency(): number[][] {
  const adj: number[][] = Array.from({ length: NUM_POINTS }, () => []);

  function connect(a: number, b: number) {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  }

  // ── Triangle connections ──
  // Left edge: 0-1-4
  connect(0, 1); connect(1, 4);
  // Center vertical: 0-2-6
  connect(0, 2); connect(2, 6);
  // Right edge: 0-3-8
  connect(0, 3); connect(3, 8);
  // Row 1 horizontal: 1-2-3
  connect(1, 2); connect(2, 3);
  // Row 2 / triangle base horizontal: 4-5-6-7-8
  connect(4, 5); connect(5, 6); connect(6, 7); connect(7, 8);
  // Verticals from row 1 to row 2: 1-5, 3-7
  connect(1, 5); connect(3, 7);
  // Diagonals inside triangle: 2-5, 2-7
  connect(2, 5); connect(2, 7);

  // ── Square grid connections ──
  // Rows: 4-8 (row 0), 9-13 (row 1), 14-18 (row 2), 19-23 (row 3)
  // Horizontal, vertical, and diagonals on even (r+c) parity
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const cur = 4 + r * 5 + c;
      // Horizontal (right)
      if (c + 1 < 5) connect(cur, cur + 1);
      // Vertical (down)
      if (r + 1 < 4) {
        connect(cur, cur + 5);
      }
      // Diagonals: on even (r+c) parity nodes
      if ((r + c) % 2 === 0 && r + 1 < 4) {
        if (c + 1 < 5) connect(cur, cur + 6); // down-right
        if (c - 1 >= 0) connect(cur, cur + 4); // down-left
      }
    }
  }

  return adj.map(list => [...new Set(list)].sort((a, b) => a - b));
}

export const ADJACENCY = buildAdjacency();

function getJumpTarget(from: number, over: number): number | null {
  // Find the position of both nodes and compute the mirror
  const fromPos = POINT_POSITIONS[from];
  const overPos = POINT_POSITIONS[over];
  const toX = overPos.x * 2 - fromPos.x;
  const toY = overPos.y * 2 - fromPos.y;

  // Find the node at that position (within tolerance)
  const target = POINT_POSITIONS.findIndex(p =>
    Math.abs(p.x - toX) < 0.01 && Math.abs(p.y - toY) < 0.01
  );

  if (target < 0 || target >= NUM_POINTS) return null;
  if (!ADJACENCY[from].includes(over)) return null;
  if (!ADJACENCY[over].includes(target)) return null;
  return target;
}

export interface GameState {
  board: Piece[];
  turn: Player;
  phase: Phase;
  goatsPlaced: number;
  goatsCaptured: number;
  selectedPoint: number | null;
  gameOver: boolean;
  winner: Player | null;
}

export function createInitialState(): GameState {
  const board: Piece[] = Array(NUM_POINTS).fill(null);
  // Tigers start at apex and bottom two corners of the triangle
  board[0] = 'tiger'; // apex
  board[4] = 'tiger'; // triangle base left
  board[8] = 'tiger'; // triangle base right
  return {
    board,
    turn: 'goat', // Goat always goes first
    phase: 'placing',
    goatsPlaced: 0,
    goatsCaptured: 0,
    selectedPoint: null,
    gameOver: false,
    winner: null,
  };
}

export interface MoveInfo {
  type: 'place' | 'move' | 'jump';
  from?: number;
  to: number;
  captured?: number;
}

/** Get all valid moves for the current player */
export function getValidMoves(state: GameState): MoveInfo[] {
  const moves: MoveInfo[] = [];
  const { board, turn, phase, goatsPlaced } = state;

  if (turn === 'goat') {
    if (phase === 'placing' && goatsPlaced < TOTAL_GOATS) {
      // Place on any empty point
      for (let i = 0; i < NUM_POINTS; i++) {
        if (board[i] === null) moves.push({ type: 'place', to: i });
      }
    } else {
      // Move goats
      for (let i = 0; i < NUM_POINTS; i++) {
        if (board[i] !== 'goat') continue;
        for (const adj of ADJACENCY[i]) {
          if (board[adj] === null) {
            moves.push({ type: 'move', from: i, to: adj });
          }
        }
      }
    }
  } else {
    // Tiger: can move to adjacent empty, or jump over goat
    for (let i = 0; i < NUM_POINTS; i++) {
      if (board[i] !== 'tiger') continue;
      // Normal moves
      for (const adj of ADJACENCY[i]) {
        if (board[adj] === null) {
          moves.push({ type: 'move', from: i, to: adj });
        }
      }
      // Jumps
      for (const adj of ADJACENCY[i]) {
        if (board[adj] !== 'goat') continue;
        const target = getJumpTarget(i, adj);
        if (target !== null && board[target] === null) {
          moves.push({ type: 'jump', from: i, to: target, captured: adj });
        }
      }
    }
  }

  return moves;
}

/** Apply a move and return new state */
export function applyMove(state: GameState, move: MoveInfo): GameState {
  const board = [...state.board];
  let { goatsPlaced, goatsCaptured, phase } = state;

  if (move.type === 'place') {
    board[move.to] = 'goat';
    goatsPlaced++;
    if (goatsPlaced >= TOTAL_GOATS) phase = 'moving';
  } else if (move.type === 'move') {
    board[move.to] = board[move.from!];
    board[move.from!] = null;
  } else if (move.type === 'jump') {
    board[move.to] = board[move.from!];
    board[move.from!] = null;
    board[move.captured!] = null;
    goatsCaptured++;
  }

  const nextTurn: Player = state.turn === 'goat' ? 'tiger' : 'goat';

  const newState: GameState = {
    board,
    turn: nextTurn,
    phase,
    goatsPlaced,
    goatsCaptured,
    selectedPoint: null,
    gameOver: false,
    winner: null,
  };

  // Check win conditions
  if (goatsCaptured >= GOATS_TO_WIN) {
    newState.gameOver = true;
    newState.winner = 'tiger';
  } else {
    // Check if tigers are trapped (no valid moves for tiger)
    const tigerMoves = getValidMovesFor(newState, 'tiger');
    if (tigerMoves.length === 0 && nextTurn === 'tiger') {
      newState.gameOver = true;
      newState.winner = 'goat';
    }
    // Also check if goats have no moves in moving phase
    if (nextTurn === 'goat' && phase === 'moving') {
      const goatMoves = getValidMovesFor(newState, 'goat');
      if (goatMoves.length === 0) {
        newState.gameOver = true;
        newState.winner = 'tiger';
      }
    }
  }

  return newState;
}

function getValidMovesFor(state: GameState, player: Player): MoveInfo[] {
  const tempState = { ...state, turn: player };
  return getValidMoves(tempState);
}

/** Get moves from a specific point */
export function getMovesFrom(state: GameState, point: number): MoveInfo[] {
  return getValidMoves(state).filter(m => m.from === point);
}

/** Simple AI for tigers: prefer jumps, then greedy */
export function getAiMove(state: GameState): MoveInfo | null {
  const moves = getValidMoves(state);
  if (moves.length === 0) return null;

  // Prefer jumps (captures)
  const jumps = moves.filter(m => m.type === 'jump');
  if (jumps.length > 0) {
    return jumps[Math.floor(Math.random() * jumps.length)];
  }

  // For tigers: move to positions with more jump opportunities
  if (state.turn === 'tiger') {
    let best = moves[0];
    let bestScore = -1;

    for (const move of moves) {
      const next = applyMove(state, move);
      // Count potential future jumps
      const futureMoves = getValidMovesFor({ ...next, turn: 'tiger' }, 'tiger');
      const futureJumps = futureMoves.filter(m => m.type === 'jump').length;
      if (futureJumps > bestScore) {
        bestScore = futureJumps;
        best = move;
      }
    }
    return best;
  }

  // For goat AI (if needed): place/move to block tigers
  return moves[Math.floor(Math.random() * moves.length)];
}

/** Board point positions for rendering (normalized 0-1) */
// Triangle top (3 rows) + Square bottom (4 rows, shared top with triangle base)
// Triangle: apex at center-top, expanding to 5 columns at base
// Square: 5 columns × 4 rows below
//
// Node indices:
// 0         = apex (row 0)
// 1,2,3     = triangle row 1
// 4,5,6,7,8 = triangle base / square row 0 (row 2)
// 9-13      = square row 1 (row 3)
// 14-18     = square row 2 (row 4)
// 19-23     = square row 3 (row 5)
//
// Total rows: 6 (0-5), total height proportional
// Triangle height ~2 units, square height ~3 units → total ~6 row positions

const POINT_POSITIONS: { x: number; y: number }[] = (() => {
  const positions: { x: number; y: number }[] = [];
  const totalRows = 6; // rows 0-5

  // Row 0: apex (1 node)
  positions.push({ x: 0.5, y: 0 / (totalRows - 1) });

  // Row 1: 3 nodes (evenly spread across 5-col range: at columns 1, 2, 3)
  for (let c = 0; c < 3; c++) {
    positions.push({ x: (c + 1) / 4, y: 1 / (totalRows - 1) });
  }

  // Row 2: triangle base = square row 0 (5 nodes at columns 0-4)
  for (let c = 0; c < 5; c++) {
    positions.push({ x: c / 4, y: 2 / (totalRows - 1) });
  }

  // Row 3-5: square rows 1-3 (5 nodes each)
  for (let r = 3; r <= 5; r++) {
    for (let c = 0; c < 5; c++) {
      positions.push({ x: c / 4, y: r / (totalRows - 1) });
    }
  }

  return positions;
})();

export function getPointPositions(): { x: number; y: number }[] {
  return POINT_POSITIONS;
}

/** Get all lines (edges) for rendering */
export function getEdges(): [number, number][] {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < NUM_POINTS; i++) {
    for (const j of ADJACENCY[i]) {
      const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }
  return edges;
}
