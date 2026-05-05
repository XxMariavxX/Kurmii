import { useNavigate } from "react-router-dom";
import { getProfile, getStats, clearProfile } from "../hooks/useProfile.js";
import "../css/ProfilePage.css";

const colorMap = {
  correct: "#6aaa64",
  present: "#c9b458",
  absent: "#787c7e",
};

function MiniGrid({ guesses, results }) {
  return (
    <div className="mini-grid">
      {results.map((row, ri) => (
        <div key={ri} className="mini-row">
          {Array.from({ length: 5 }).map((_, ci) => (
            <div
              key={ci}
              className="mini-tile"
              style={{ backgroundColor: colorMap[row?.[ci]] ?? "#ddd" }}
            >
              {guesses[ri]?.[ci]?.toUpperCase() ?? ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const profile = getProfile();
  const stats = getStats();

  const handleClear = () => {
    if (window.confirm("Clear all quiz history?")) {
      clearProfile();
      navigate(0);
    }
  };

  return (
    <main>
      <section className="profile-section">
        <div className="profile-header">
          <button type="button" className="profile-back-btn" onClick={() => navigate("/")}>← Back</button>
          <h1 className="profile-title">{profile.username ?? "Player"}</h1>
        </div>

        <div className="stats-bar">
          <div className="stat-item"><span className="stat-num">{stats.played}</span><span className="stat-label">Played</span></div>
          <div className="stat-item"><span className="stat-num">{stats.winRate}%</span><span className="stat-label">Win rate</span></div>
          <div className="stat-item"><span className="stat-num">{stats.streak}</span><span className="stat-label">Streak</span></div>
          <div className="stat-item"><span className="stat-num">{stats.avgAttempts}</span><span className="stat-label">Avg tries</span></div>
        </div>

        {profile.history.length === 0 ? (
          <p className="profile-empty">No games played yet. Go play!</p>
        ) : (
          <div className="history-list">
            {profile.history.map((game) => (
              <div key={game.gameId} className={`history-card ${game.won ? "won" : "lost"}`}>
                <div className="history-card-info">
                  <p className="history-date">{new Date(game.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <p className="history-result">{game.won ? `Won in ${game.attempts} ${game.attempts === 1 ? "try" : "tries"}` : "Not solved"}</p>
                  {game.hintsUsed > 0 && <p className="history-hints">Hints used: {game.hintsUsed}</p>}
                </div>
                <MiniGrid guesses={game.guesses} results={game.results} />
              </div>
            ))}
          </div>
        )}

        {profile.history.length > 0 && (
          <button type="button" className="clear-history-btn" onClick={handleClear}>Clear history</button>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
