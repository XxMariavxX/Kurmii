import { useEffect, useState } from "react";
import BoxQuiz from "./BoxQuiz.jsx";
import KeyBoard from "./Keyboard.jsx";
import { fetchDailyWordMeta, checkWord } from "../api";
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
            <button type="button" className="help-carrot quiz-help-carrot" aria-label="Help">
              <img src={carrot} title="help" alt="help-carrot" />
            </button>
          </header>

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
