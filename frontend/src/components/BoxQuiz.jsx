import Tiles from '../css/Tiles.css'

function Line({ guess }) {
  const tiles =[];

  for(let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i];
    tiles.push(<div className='tile'>{char}</div>)
  }

  return (
    <div className='line'>{tiles}</div>
  )
}