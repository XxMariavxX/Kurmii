import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BoxQuiz from "./BoxQuiz.jsx";
import KeyBoard from "./Keyboard.jsx";
import { fetchDailyWordMeta, checkWordStream, fetchDaylyHints, logout, getAuthToken } from "../api";
import { useGameStorage } from "../hooks/useGameStorage.js";
import { recordGame } from "../hooks/useProfile.js";
import carrot from "../assets/carrot-before-hovers.png";
import "../css/MainQuiz.css";
import "../css/Header.css";

const MAX_ROWS = 6;
const WORD_LENGTH = 5;

const getNextMidnightDelay = () => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
};

function MainQuiz() {
  const navigate = useNavigate();
  const todayId = new Date().toLocaleDateString("sv-SE");
  const { state, update, reset } = useGameStorage(todayId);

  const {
    guesses, results, currentRow,
    hintCount, hintedLetters,
    isHintModalOpen, hintText, showCarrotTitle,
    isChecking, loading, error, finished,
  } = state;

  const isCheckingRef = useRef(false);

  const redirectIfUnauthorized = (err) => {
    if (/unauthorized|401/i.test(err?.message)) {
      navigate("/submit");
      return true;
    }
    return false;
  };

  const openHintModal = (text, withCarrotTitle = true) => {
    update({ isHintModalOpen: true, hintText: text, showCarrotTitle: withCarrotTitle });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/submit");
  };

  useEffect(() => {
    if (!getAuthToken()) { navigate("/submit"); return; }
    const loadGameMeta = async () => {
      try {
        await fetchDailyWordMeta();
        update({ loading: false, error: null });
      } catch (err) {
        update({ loading: false, error: err.message });
      }
    };
    if (loading) loadGameMeta();
  }, []);

  useEffect(() => {
    let timeoutId;
    const scheduleReset = () => {
      timeoutId = setTimeout(() => {
        reset();
        scheduleReset();
      }, getNextMidnightDelay());
    };
    scheduleReset();
    return () => clearTimeout(timeoutId);
  }, []);

  const countHint = async () => {
    if (hintCount >= 2) {
      openHintModal("Your hints are already used 🥕");
      return;
    }
    try {
      const guessedFromRows = guesses
        .join("").toUpperCase().split("")
        .filter((c) => /^[A-Z]$/.test(c));
      const uniqueGuessed = [...new Set([...guessedFromRows, ...hintedLetters])];
      const data = await fetchDaylyHints(uniqueGuessed.join(","));
      const newCount = hintCount + 1;
      if (data?.hint) {
        update({ hintCount: newCount, hintedLetters: [...new Set([...hintedLetters, data.hint])] });
        openHintModal(`Hint: ${data.hint}`);
      } else {
        update({ hintCount: newCount });
        openHintModal(data?.message || "No more hints available");
      }
    } catch (err) {
      if (!redirectIfUnauthorized(err))
        openHintModal(err.message || "Failed to load hint");
    }
  };

  const addLetter = (letter) => {
    if (loading || error || currentRow >= MAX_ROWS || finished) return;
    const row = guesses[currentRow];
    if (row.length >= WORD_LENGTH) return;
    const next = [...guesses];
    next[currentRow] = `${row}${letter}`;
    update({ guesses: next });
  };

  const removeLetter = () => {
    if (loading || error || currentRow >= MAX_ROWS || finished) return;
    const row = guesses[currentRow];
    if (row.length === 0) return;
    const next = [...guesses];
    next[currentRow] = row.slice(0, -1);
    update({ guesses: next });
  };

  const submitRow = async () => {
    if (loading || error || currentRow >= MAX_ROWS || isCheckingRef.current || finished) return;
    const guess = guesses[currentRow];
    if (guess.length !== WORD_LENGTH) return;

    isCheckingRef.current = true;
    update({ isChecking: true });

    try {
      const rowResult = Array(WORD_LENGTH).fill(null);

      await checkWordStream(guess, (data) => {
        if (data?.type === "letter") {
          rowResult[data.index] = data.status;
          const nextResults = [...results];
          nextResults[currentRow] = [...rowResult];
          update({ results: nextResults });
        }
        if (data?.type === "result") {
          const nextRow = currentRow + 1;
          const nextResults = [...results];
          nextResults[currentRow] = [...rowResult];
          update({ currentRow: nextRow, results: nextResults, finished: true });
          recordGame({ gameId: todayId, guesses, results: nextResults, won: true, hintsUsed: hintCount });
          setTimeout(() => openHintModal("You win 🎉"), 200);
        }
      });

      const nextRow = currentRow + 1;
      update({ currentRow: nextRow });

      if (nextRow >= MAX_ROWS && !finished) {
        update({ finished: true });
        recordGame({ gameId: todayId, guesses, results, won: false, hintsUsed: hintCount });
      }
    } catch (err) {
      if (!redirectIfUnauthorized(err))
        openHintModal(err.message || "Check failed", false);
    } finally {
      isCheckingRef.current = false;
      update({ isChecking: false });
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const { key } = event;
      if (/^[a-zA-Z]$/.test(key)) { event.preventDefault(); addLetter(key.toUpperCase()); return; }
      if (key === "Backspace") { event.preventDefault(); removeLetter(); return; }
      if (key === "Enter") { event.preventDefault(); submitRow(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentRow, guesses, loading, error, finished]);

  if (loading) return <div className="loading-screen">Loading game...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  return (
    <div>
      <main>
        <section className="section2">
          <header className="block">
            <p className="game-id">Game ID: {todayId}</p>
            <div className="header-actions">
              <button type="button" className="help-carrot quiz-help-carrot" aria-label="Help" onClick={countHint} disabled={hintCount >= 2}>
                <img src={carrot} title="help" alt="help-carrot" />
              </button>
              <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </header>

          {isHintModalOpen && (
            <div className="hint-modal-overlay" onClick={() => update({ isHintModalOpen: false })}>
              <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="hint-modal-close" aria-label="Close hint" onClick={() => update({ isHintModalOpen: false })}>×</button>
                {showCarrotTitle && <h3 className="hint-modal-title">Carrot hint</h3>}
                <p className="hint-modal-text">{hintText}</p>
              </div>
            </div>
          )}

          <div className="quiz">
            {Array.from({ length: MAX_ROWS }).map((_, index) => (
              <BoxQuiz key={index} guess={guesses[index]} result={results[index]} />
            ))}
          </div>
          <KeyBoard onKeyPress={addLetter} onBackspace={removeLetter} onEnter={submitRow} />
        </section>
      </main>
    </div>
  );
}

export default MainQuiz;
