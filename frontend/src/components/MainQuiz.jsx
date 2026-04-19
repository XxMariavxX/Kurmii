import { useEffect, useState } from "react";
import BoxQuiz from "./BoxQuiz.jsx";
import KeyBoard from "./Keyboard.jsx";
import { fetchDailyWordMeta, checkWord, fetchDaylyHints } from "../api";
import carrot from "../assets/carrot-before-hovers.png";
import "../css/MainQuiz.css";
import "../css/Header.css";


const MAX_ROWS = 6;
const WORD_LENGTH = 5;

function MainQuiz() {
  const [gameMeta, setGameMeta] = useState(null);
  const [guesses, setGuesses] = useState(Array(MAX_ROWS).fill(""));
  const [results, setResults] = useState(Array(MAX_ROWS).fill(null));
  const [currentRow, setCurrentRow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [hintText, setHintText] = useState("");
  const [hintedLetters, setHintedLetters] = useState([]);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);

  useEffect(() => {
    const loadGameMeta = async () => {
      try {
        const meta = await fetchDailyWordMeta();
        setGameMeta(meta);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadGameMeta();
  }, []);

  const countHint = async () => {
    if (count >= 2) {
      return alert("You have already spent all hints 🥕");
    }

    try {
      const guessedFromRows = guesses
        .join("")
        .toUpperCase()
        .split("")
        .filter((char) => /^[A-Z]$/.test(char));

      const uniqueGuessed = [...new Set([...guessedFromRows, ...hintedLetters])];
      const guessedParam = uniqueGuessed.join(",");

      const data = await fetchDaylyHints(guessedParam);

      setCount((prev) => prev + 1);

      if (data?.hint) {
        setHintedLetters((prev) => [...new Set([...prev, data.hint])]);
        setHintText(`Hint: ${data.hint}`);
      } else {
        setHintText(data?.message || "No more hints available");
      }

      setIsHintModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const addLetter = (letter) => {
    if (loading || error || currentRow >= MAX_ROWS) return;

    setGuesses((prev) => {
      const row = prev[currentRow];
      if (row.length >= WORD_LENGTH) return prev;

      const next = [...prev];
      next[currentRow] = `${row}${letter}`;
      return next;
    });
  };

  const removeLetter = () => {
    if (loading || error || currentRow >= MAX_ROWS) return;

    setGuesses((prev) => {
      const row = prev[currentRow];
      if (row.length === 0) return prev;

      const next = [...prev];
      next[currentRow] = row.slice(0, -1);
      return next;
    });
  };

  const submitRow = async () => {
    if (loading || error || currentRow >= MAX_ROWS) return;

    const guess = guesses[currentRow];
    if (guess.length !== WORD_LENGTH) return;

    try {
      const checkResult = await checkWord(guess);
      setResults((prev) => {
        const next = [...prev];
        next[currentRow] = checkResult.result;
        return next;
      });
      setCurrentRow((prev) => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const { key } = event;

      if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        addLetter(key.toUpperCase());
        return;
      }

      if (key === "Backspace") {
        event.preventDefault();
        removeLetter();
        return;
      }

      if (key === "Enter") {
        event.preventDefault();
        submitRow();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentRow, guesses, loading, error]);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <main>
        <section className="section2">
          <header className="block">
            <p className="game-id">Game ID: {gameMeta?.gameId}</p>
            <button type="button" className="help-carrot quiz-help-carrot" aria-label="Help" onClick = {countHint} disabled={count >= 2}>
              <img src={carrot} title="help" alt="help-carrot" />
            </button>
          </header>

          {isHintModalOpen ? (
            <div className="hint-modal-overlay" onClick={() => setIsHintModalOpen(false)}>
              <div className="hint-modal" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="hint-modal-close"
                  aria-label="Close hint"
                  onClick={() => setIsHintModalOpen(false)}
                >
                  ×
                </button>
                <h3 className="hint-modal-title">Carrot hint</h3>
                <p className="hint-modal-text">{hintText}</p>
              </div>
            </div>
          ) : null}

          <div className="quiz">
            {Array.from({ length: MAX_ROWS }).map((_, index) => (
              <BoxQuiz
                key={index}
                guess={guesses[index]}
                result={results[index]}
              />
            ))}
          </div>
          <KeyBoard
            onKeyPress={addLetter}
            onBackspace={removeLetter}
            onEnter={submitRow}
          />

        </section>
        <div className="entrance"></div>
      </main>
    </div>
  );
}

export default MainQuiz;
