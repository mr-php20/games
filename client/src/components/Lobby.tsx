import { useGame } from '../context/GameContext';
import { useCallback } from 'react';

export default function Lobby() {
  const { state, setSeries, startGame, goHome } = useGame();
  const { roomCode, players, bestOf, isHost } = state;

  const handleShare = useCallback(async () => {
    const shareText = `Join my Bingo game! Code: ${roomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Bingo Game', text: shareText });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(roomCode ?? '');
    }
  }, [roomCode]);

  const handleCopy = useCallback(async () => {
    if (roomCode) {
      await navigator.clipboard.writeText(roomCode);
    }
  }, [roomCode]);

  const seriesOptions = [3, 5, 7, 9];

  return (
    <div className="screen lobby-screen">
      <h2>Game Lobby</h2>

      <div className="room-code-section">
        <p className="label">Room Code</p>
        <div className="room-code" onClick={handleCopy} title="Click to copy">
          {roomCode}
        </div>
        <div className="room-code-actions">
          <button className="btn btn-small" onClick={handleCopy}>
            📋 Copy
          </button>
          <button className="btn btn-small" onClick={handleShare}>
            📤 Share
          </button>
        </div>
      </div>

      <div className="players-section">
        <p className="label">Players ({players.length}/2)</p>
        {players.map(p => (
          <div key={p.id} className="player-tag">
            {p.name} {p.id === state.playerId ? '(You)' : ''}
          </div>
        ))}
        {players.length < 2 && (
          <div className="player-tag waiting">Waiting for opponent...</div>
        )}
      </div>

      {isHost && (
        <div className="series-section">
          <p className="label">Series Format</p>
          <div className="series-options">
            {seriesOptions.map(n => (
              <button
                key={n}
                className={`btn btn-series ${bestOf === n ? 'active' : ''}`}
                onClick={() => setSeries(n)}
              >
                Best of {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isHost && (
        <div className="series-section">
          <p className="label">Series: Best of {bestOf}</p>
        </div>
      )}

      {isHost && (
        <button
          className="btn btn-primary btn-start"
          onClick={startGame}
          disabled={players.length < 2}
        >
          {players.length < 2 ? 'Waiting for Player...' : 'Start Game'}
        </button>
      )}

      {!isHost && (
        <p className="info-text">Waiting for host to start the game...</p>
      )}

      <button className="btn btn-text" onClick={goHome}>
        Leave Room
      </button>
    </div>
  );
}
