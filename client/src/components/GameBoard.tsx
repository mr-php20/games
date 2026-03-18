import { useGame } from '../context/GameContext';
import { GRID_SIZE, BINGO_LETTERS } from '../utils/bingo';

export default function GameBoard() {
  const { state, callNumber } = useGame();
  const {
    grid, marked, playerId, currentTurn,
    calledNumbers, myCompletedLines, opponentCompletedLines,
    players, currentRound, bestOf, scores,
  } = state;

  const isMyTurn = currentTurn === playerId;
  const opponent = players.find(p => p.id !== playerId);

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) return;
    const num = grid[row][col];
    if (num === 0 || calledNumbers.includes(num)) return;
    callNumber(num);
  };

  return (
    <div className="screen game-screen">
      <div className="game-header">
        <div className="round-info">
          Round {currentRound} of {bestOf}
        </div>
        <div className={`turn-indicator ${isMyTurn ? 'my-turn' : 'opponent-turn'}`}>
          {isMyTurn ? '🟢 Your Turn' : `🔴 ${opponent?.name ?? "Opponent"}'s Turn`}
        </div>
      </div>

      <div className="bingo-progress">
        <div className="bingo-row">
          <span className="bingo-label">You: </span>
          {BINGO_LETTERS.map((letter, i) => (
            <span key={letter} className={`bingo-letter ${i < myCompletedLines ? 'lit' : ''}`}>
              {letter}
            </span>
          ))}
        </div>
        <div className="bingo-row">
          <span className="bingo-label">{opponent?.name ?? 'Opp'}: </span>
          {BINGO_LETTERS.map((letter, i) => (
            <span key={letter} className={`bingo-letter opponent ${i < opponentCompletedLines ? 'lit' : ''}`}>
              {letter}
            </span>
          ))}
        </div>
      </div>

      {scores.length > 0 && (
        <div className="mini-scoreboard">
          {scores.map(s => (
            <span key={s.id} className="mini-score">
              {s.id === playerId ? 'You' : s.name}: {s.score}
            </span>
          ))}
        </div>
      )}

      <div className="grid-container">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="grid-row">
            {Array.from({ length: GRID_SIZE }, (_, c) => {
              const num = grid[r][c];
              const isMarked = marked[r][c];
              const canCall = isMyTurn && num > 0 && !calledNumbers.includes(num);
              return (
                <button
                  key={c}
                  className={`grid-cell game-cell ${isMarked ? 'marked' : ''} ${canCall ? 'callable' : ''}`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={!canCall}
                >
                  <span className="cell-number">{num}</span>
                  {isMarked && <span className="cell-strike">✕</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="called-numbers">
        <p className="label">Called Numbers</p>
        <div className="called-list">
          {calledNumbers.length === 0 && <span className="no-calls">None yet</span>}
          {calledNumbers.map((n, i) => (
            <span key={i} className="called-num">{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
