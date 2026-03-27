import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { Direction } from './utils/game';

export default function App() {
  const {
    snake, food, score, highScore, gameOver, paused, started,
    gridSize, newGame, changeDirection, togglePause,
  } = useGame();
  const [showRules, setShowRules] = useState(false);

  const headKey = `${snake[0].x},${snake[0].y}`;
  const foodKey = `${food.x},${food.y}`;
  const snakeSet = new Set(snake.map(p => `${p.x},${p.y}`));

  const handleDPad = (dir: Direction) => {
    if (!started) togglePause();
    changeDirection(dir);
  };

  return (
    <div className="game-app">
      <div className="game-header">
        <a href="/" className="back-link">← Games</a>
        <h1>Snake</h1>
        <button className="rules-btn" onClick={() => setShowRules(true)}>?</button>
        <button className="btn btn-secondary" onClick={newGame}>New</button>
      </div>

      <div className="score-bar">
        <div className="score-box">
          <span className="label">Score</span>
          <span className="value">{score}</span>
        </div>
        <div className="score-box">
          <span className="label">Best</span>
          <span className="value">{highScore}</span>
        </div>
      </div>

      <div className="snake-board" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {Array.from({ length: gridSize * gridSize }, (_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const key = `${x},${y}`;
          const isHead = key === headKey;
          const isSnake = snakeSet.has(key);
          const isFood = key === foodKey;
          return (
            <div
              key={key}
              className={`snake-cell ${isHead ? 'head' : isSnake ? 'body' : ''} ${isFood ? 'food' : ''}`}
            />
          );
        })}
      </div>

      {!started && !gameOver && (
        <div className="snake-start-overlay">
          <p>Press any arrow key, swipe, or tap a direction to start</p>
          <button className="btn btn-primary" onClick={togglePause}>Start</button>
        </div>
      )}

      {paused && started && !gameOver && (
        <div className="game-over-overlay" onClick={togglePause}>
          <div className="game-over-card">
            <h2>Paused</h2>
            <p>Press Space or tap to resume</p>
          </div>
        </div>
      )}

      {/* Mobile D-pad */}
      <div className="dpad">
        <button className="dpad-btn dpad-up" onClick={() => handleDPad('up')}>▲</button>
        <div className="dpad-row">
          <button className="dpad-btn" onClick={() => handleDPad('left')}>◀</button>
          <button className="dpad-btn" onClick={() => handleDPad('right')}>▶</button>
        </div>
        <button className="dpad-btn dpad-down" onClick={() => handleDPad('down')}>▼</button>
      </div>

      <p className="hint-text">Arrow keys / WASD · Space to pause · Swipe on mobile</p>

      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div className="rules-card" onClick={e => e.stopPropagation()}>
            <h2>How to Play Snake</h2>
            <h3>Goal</h3>
            <p>Eat food to grow the snake and score points. Survive as long as possible!</p>
            <h3>Rules</h3>
            <ul>
              <li>Control the snake with <strong>arrow keys</strong>, <strong>WASD</strong>, <strong>swipe</strong>, or the <strong>D-pad</strong>.</li>
              <li>Eat the food (colored dot) to grow longer and earn points.</li>
              <li>Don't crash into the <strong>walls</strong> or your own <strong>tail</strong>.</li>
              <li>The snake speeds up as your score increases.</li>
              <li>Press <strong>Space</strong> to pause/resume.</li>
            </ul>
            <h3>Scoring</h3>
            <p>Each food eaten adds 1 point. Your high score is saved locally.</p>
            <div className="rules-close">
              <button className="btn btn-primary" onClick={() => setShowRules(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <h2>Game Over</h2>
            <p>Score: {score}</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={newGame}>Play Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
