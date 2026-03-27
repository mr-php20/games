import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { PITS_PER_SIDE } from './utils/game';

function Seeds({ count }: { count: number }) {
  if (count === 0) return null;
  return <span className="seed-count">{count}</span>;
}

export default function App() {
  const { state, wins, vsAi, newGame, toggleMode, handlePitClick, canPick } = useGame();
  const { pits, stores, currentPlayer, gameOver, winner } = state;
  const [showRules, setShowRules] = useState(false);

  // Player 2's pits: indices 13→7 (displayed left-to-right for Player 2)
  const topRow = Array.from({ length: PITS_PER_SIDE }, (_, i) => 13 - i);
  // Player 1's pits: indices 0→6
  const bottomRow = Array.from({ length: PITS_PER_SIDE }, (_, i) => i);

  return (
    <div className="game-app">
      <div className="game-header">
        <a href="/" className="back-link">← Games</a>
        <h1>Pallanguzhi</h1>
        <button className="rules-btn" onClick={() => setShowRules(true)}>?</button>
        <button className="btn btn-secondary" onClick={newGame}>New</button>
      </div>

      <div className="score-bar">
        <div className="score-box">
          <span className="label">You</span>
          <span className="value">{stores[0]}</span>
        </div>
        <div className="score-box">
          <span className="label">{vsAi ? 'AI' : 'P2'}</span>
          <span className="value">{stores[1]}</span>
        </div>
        <div className="score-box">
          <span className="label">Wins</span>
          <span className="value">{wins[0]}–{wins[1]}</span>
        </div>
      </div>

      <div className="pallanguzhi-board">
        {/* Player 2 store */}
        <div className="store store-p2">
          <Seeds count={stores[1]} />
        </div>

        {/* Pit grid */}
        <div className="pits-grid">
          {/* Top row (Player 2) */}
          <div className="pit-row">
            {topRow.map(i => (
              <button
                key={i}
                className={[
                  'pit',
                  'pit-p2',
                  canPick(i) ? 'pickable' : '',
                  state.lastSownPit === i ? 'last-sown' : '',
                ].filter(Boolean).join(' ')}
                disabled={!canPick(i)}
                onClick={() => handlePitClick(i)}
              >
                <Seeds count={pits[i]} />
                <span className="pit-seeds-visual">
                  {Array.from({ length: Math.min(pits[i], 12) }, (_, j) => (
                    <span key={j} className="seed" />
                  ))}
                </span>
              </button>
            ))}
          </div>

          {/* Bottom row (Player 1) */}
          <div className="pit-row">
            {bottomRow.map(i => (
              <button
                key={i}
                className={[
                  'pit',
                  'pit-p1',
                  canPick(i) ? 'pickable' : '',
                  state.lastSownPit === i ? 'last-sown' : '',
                ].filter(Boolean).join(' ')}
                disabled={!canPick(i)}
                onClick={() => handlePitClick(i)}
              >
                <span className="pit-seeds-visual">
                  {Array.from({ length: Math.min(pits[i], 12) }, (_, j) => (
                    <span key={j} className="seed" />
                  ))}
                </span>
                <Seeds count={pits[i]} />
              </button>
            ))}
          </div>
        </div>

        {/* Player 1 store */}
        <div className="store store-p1">
          <Seeds count={stores[0]} />
        </div>
      </div>

      <div className="controls-row">
        <p className="hint-text">
          {currentPlayer === 0 ? "Your turn" : vsAi ? "AI thinking…" : "Player 2's turn"}
          {' · '}
          {vsAi ? 'vs AI' : '2 Player'}
        </p>
        <button className="btn btn-text" onClick={toggleMode}>
          Switch to {vsAi ? '2 Player' : 'vs AI'}
        </button>
      </div>

      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div className="rules-card" onClick={e => e.stopPropagation()}>
            <h2>How to Play Pallanguzhi</h2>
            <h3>About</h3>
            <p>Pallanguzhi is a traditional South Indian mancala game played on a board with 14 pits and cowrie shells.</p>
            <h3>Setup</h3>
            <ul>
              <li>Each player has <strong>7 pits</strong> on their side with <strong>6 seeds</strong> each (84 total).</li>
            </ul>
            <h3>How to Play</h3>
            <ul>
              <li>On your turn, pick a pit on <strong>your side</strong> and sow the seeds <strong>one per pit</strong> counter-clockwise.</li>
              <li>If the last seed lands in a pit with seeds, <strong>pick them up</strong> and keep sowing.</li>
              <li>If the next pit is <strong>empty</strong> but the one after has seeds, <strong>capture</strong> those seeds into your store.</li>
              <li>Your turn ends when you can’t continue.</li>
            </ul>
            <h3>Winning</h3>
            <p>When one side is empty, remaining seeds go to the other player. The player with <strong>more seeds</strong> wins!</p>
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
              {winner === null
                ? "It's a Tie!"
                : winner === 0
                  ? '🎉 You Win!'
                  : vsAi ? 'AI Wins!' : 'Player 2 Wins!'}
            </h2>
            <p>You: {stores[0]} · {vsAi ? 'AI' : 'P2'}: {stores[1]}</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={newGame}>Play Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
