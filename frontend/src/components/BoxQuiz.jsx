import '../css/BoxQuiz.css';

const WORD_LENGTH = 5;

function BoxQuiz({ guess, result }) {
  const tiles = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess ? guess[i] : '';
    const status = result ? result[i] : null;
    const className = `tile ${status || ''}`;
    tiles.push(<div key={i} className={className}>{char}</div>);
  }

  return (
    <div className='line'>{tiles}</div>
  );
}

export default BoxQuiz;
