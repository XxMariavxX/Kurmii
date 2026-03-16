import { useEffect, useState } from "react";
import "../css/MainQuiz.css";
import BoxQuiz from "./BoxQuiz.jsx";
import KeyBoard from "./Keyboard.jsx";

const MAX_ROWS = 6;
const WORD_LENGTH = 5;

function MainQuiz() {
  const [guesses, setGuesses] = useState(Array(MAX_ROWS).fill(""));
  const [currentRow, setCurrentRow] = useState(0);

  const addLetter = (letter) => {
    setGuesses((prev) => {
      const row = prev[currentRow];
      if (!row || row.length >= WORD_LENGTH) {
        return prev;
      }

      const next = [...prev];
      next[currentRow] = `${row}${letter}`;
      return next;
    });
  };

  const removeLetter = () => {
    setGuesses((prev) => {
      const row = prev[currentRow] ?? "";
      if (row.length === 0) {
        return prev;
      }

      const next = [...prev];
      next[currentRow] = row.slice(0, -1);
      return next;
    });
  };

  const submitRow = () => {
    if (guesses[currentRow]?.length !== WORD_LENGTH) {
      return;
    }

    setCurrentRow((prev) => (prev < MAX_ROWS - 1 ? prev + 1 : prev));
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
  }, [currentRow, guesses]);

  return (
    <div>
      <main>
        <section className="section2">
          <h1 className="title">Kurmi</h1>

          <div className="quiz">
            {Array.from({ length: MAX_ROWS }).map((_, index) => (
              <BoxQuiz key={index} guess={guesses[index]} />
            ))}
          </div>
          <KeyBoard
            onKeyPress={addLetter}
            onBackspace={removeLetter}
            onEnter={submitRow}
          />

        </section>
          <div className="entrance">

          </div>
      </main>
    </div>
  );
}

export default MainQuiz;
