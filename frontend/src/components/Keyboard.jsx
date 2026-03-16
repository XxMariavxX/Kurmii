function KeyBoard({ onKeyPress, onEnter, onBackspace }) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  return (
    <div className="keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {rowIndex === 2 && (
            <button
              type="button"
              className="key-btn key-btn-wide"
              onClick={onEnter}
            >
              Enter
            </button>
          )}

          {row.map((letter) => (
            <button
              type="button"
              key={letter}
              className="key-btn"
              onClick={() => onKeyPress(letter)}
            >
              {letter}
            </button>
          ))}

          {rowIndex === 2 && (
            <button
              type="button"
              className="key-btn key-btn-wide"
              onClick={onBackspace}
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default KeyBoard;