import '../css/Tiles.css';

const WORD_LENGTH = 5;

function Line({ guess }) {
  const tiles = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess ? guess[i] : '';
    tiles.push(<div key={i} className='tile'>{char}</div>);
  }

  return (
    <div className='line'>{tiles}</div>
  );
}

export default Line;
