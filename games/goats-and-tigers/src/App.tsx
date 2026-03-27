import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { getPointPositions, getEdges, TOTAL_GOATS, GOATS_TO_WIN } from './utils/game';

const POINTS = getPointPositions();
const EDGES = getEdges();

const BOARD_W = 320;
const BOARD_H = 400;
const PAD = 30;
const INNER_W = BOARD_W - PAD * 2;
const INNER_H = BOARD_H - PAD * 2;

function pxX(frac: number) {
  return PAD + frac * INNER_W;
}
function pxY(frac: number) {
  return PAD + frac * INNER_H;
}

export default function App() {
  const {
    state, playerRole, wins, validDestinations,
    newGame, switchRole, handlePointClick, isHumanTurn,
  } = useGame();

  const { board, goatsPlaced, goatsCaptured, turn, phase, selectedPoint, gameOver, winner } = state;

  const goatsRemaining = TOTAL_GOATS - goatsPlaced;
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="game-app">
      <div className="game-header">
        <a href="/" className="back-link">← Games</a>
        <h1>Aadu Puli Aattam</h1>
        <button className="rules-btn" onClick={() => setShowRules(true)}>?</button>
        <button className="btn btn-secondary" onClick={newGame}>New</button>
      </div>

      <div className="score-bar">
        <div className="score-box">
          <span className="label">🐐 To Place</span>
          <span className="value">{goatsRemaining}</span>
        </div>
        <div className="score-box">
          <span className="label">🐅 Captured</span>
          <span className="value">{goatsCaptured}/{GOATS_TO_WIN}</span>
        </div>
        <div className="score-box">
          <span className="label">Wins</span>
          <span className="value">🐐{wins.goat} 🐅{wins.tiger}</span>
        </div>
      </div>

      <div className="gat-board-container">
        <svg
          viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
          className="gat-board"
          width={BOARD_W}
          height={BOARD_H}
        >
          {/* Grid lines */}
          {EDGES.map(([a, b], idx) => (
            <line
              key={idx}
              x1={pxX(POINTS[a].x)}
              y1={pxY(POINTS[a].y)}
              x2={pxX(POINTS[b].x)}
              y2={pxY(POINTS[b].y)}
              className="gat-edge"
            />
          ))}

          {/* Points */}
          {POINTS.map((pt, i) => {
            const cx = pxX(pt.x);
            const cy = pxY(pt.y);
            const piece = board[i];
            const isSelected = selectedPoint === i;
            const isValidDest = validDestinations.includes(i);

            return (
              <g key={i} onClick={() => handlePointClick(i)} style={{ cursor: 'pointer' }}>
                {/* Hit area */}
                <circle cx={cx} cy={cy} r={18} fill="transparent" />

                {/* Valid destination indicator */}
                {isValidDest && !piece && (
                  <circle cx={cx} cy={cy} r={12} className="gat-valid-dest" />
                )}

                {/* Empty point */}
                {!piece && !isValidDest && (
                  <circle cx={cx} cy={cy} r={5} className="gat-empty-point" />
                )}

                {/* Tiger */}
                {piece === 'tiger' && (
                  <>
                    <circle
                      cx={cx} cy={cy} r={14}
                      className={`gat-tiger ${isSelected ? 'selected' : ''}`}
                    />
                    <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize="14">
                      🐅
                    </text>
                  </>
                )}

                {/* Goat */}
                {piece === 'goat' && (
                  <>
                    <circle
                      cx={cx} cy={cy} r={14}
                      className={`gat-goat ${isSelected ? 'selected' : ''}`}
                    />
                    <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize="14">
                      🐐
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="controls-row">
        <p className="hint-text">
          {isHumanTurn
            ? turn === 'goat' && phase === 'placing'
              ? 'Place a goat on an empty point'
              : selectedPoint !== null
                ? 'Click a highlighted point to move'
                : `Select a ${turn} to move`
            : 'AI thinking…'}
          {' · You: '}
          {playerRole === 'goat' ? '🐐' : '🐅'}
        </p>
        <button className="btn btn-text" onClick={switchRole}>
          Play as {playerRole === 'goat' ? '🐅' : '🐐'}
        </button>
      </div>

      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div className="rules-card" onClick={e => e.stopPropagation()}>
            <h2>How to Play Aadu Puli Aattam</h2>
            <h3>About</h3>
            <p>Aadu Puli Aattam is a classic South Indian strategy game, also known as Goats & Tigers or Pulijudam. It's an asymmetric game between 3 tigers and 15 goats on a triangle-and-square board.</p>
            <h3>Goats (🐐)</h3>
            <ul>
              <li><strong>Phase 1 — Placing:</strong> Place goats one at a time on any empty point.</li>
              <li><strong>Phase 2 — Moving:</strong> After all 15 goats are placed, move them to adjacent connected points.</li>
              <li>Goats <strong>win</strong> by trapping all 3 tigers so they can’t move.</li>
            </ul>
            <h3>Tigers (🐅)</h3>
            <ul>
              <li>Tigers move to adjacent connected points.</li>
              <li>Tigers <strong>capture</strong> a goat by jumping over it to an empty point (like checkers).</li>
              <li>Tigers <strong>win</strong> by capturing 5 goats.</li>
            </ul>
            <h3>Controls</h3>
            <p>Click to place/select, then click a highlighted point to move. Use the button below to switch roles.</p>
            <div className="rules-close">
              <button className="btn btn-primary" onClick={() => setShowRules(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <h2>
              {winner === 'goat'
                ? playerRole === 'goat' ? '🎉 Goats Win!' : 'Goats Win!'
                : playerRole === 'tiger' ? '🎉 Tigers Win!' : 'Tigers Win!'}
            </h2>
            <p>
              {winner === 'tiger'
                ? `Tigers captured ${goatsCaptured} goats`
                : 'All tigers are trapped!'}
            </p>
            <div className="actions">
              <button className="btn btn-primary" onClick={newGame}>Play Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
