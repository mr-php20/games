import { useGame } from '../context/GameContext';

export default function GameOver() {
  const { state, nextRound, rematch, goHome } = useGame();
  const { roundWinner, playerId, scores, currentRound, bestOf } = state;

  const iWon = roundWinner?.id === playerId;
  const isSeriesEnd = state.screen === 'series-end';

  // Find series winner
  const seriesWinner = isSeriesEnd
    ? scores.reduce((a, b) => (a.score > b.score ? a : b), scores[0])
    : null;
  const iWonSeries = seriesWinner?.id === playerId;

  return (
    <div className="screen gameover-screen">
      {!isSeriesEnd ? (
        <>
          <h2 className={`result-title ${iWon ? 'win' : 'lose'}`}>
            {iWon ? '🎉 You Won the Round!' : '😔 You Lost the Round'}
          </h2>
          <p className="round-detail">Round {currentRound} of {bestOf}</p>
        </>
      ) : (
        <>
          <h2 className={`result-title ${iWonSeries ? 'win' : 'lose'}`}>
            {iWonSeries ? '🏆 You Won the Series!' : '😔 Series Lost'}
          </h2>
          <p className="round-detail">Best of {bestOf}</p>
        </>
      )}

      <div className="final-scores">
        {scores.map(s => (
          <div key={s.id} className={`score-card ${s.id === playerId ? 'me' : ''}`}>
            <span className="score-name">{s.id === playerId ? 'You' : s.name}</span>
            <span className="score-value">{s.score}</span>
          </div>
        ))}
      </div>

      <div className="gameover-actions">
        {!isSeriesEnd && (
          <button className="btn btn-primary" onClick={nextRound}>
            Next Round →
          </button>
        )}
        {isSeriesEnd && (
          <button className="btn btn-primary" onClick={rematch}>
            🔄 Rematch
          </button>
        )}
        <button className="btn btn-text" onClick={goHome}>
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}
