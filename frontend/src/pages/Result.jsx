import { useNavigate } from 'react-router-dom';

function Result() {
  const navigate = useNavigate();

  return (
  <main>
    <div>
      <h1>Results</h1>
      <p>Test</p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate('/')} 
          className='navigate-button'
          style={{ marginRight: '10px' }}
        >
          Back to Home
        </button>
        <button 
          onClick={() => navigate('/quiz')} 
          className='navigate-button'
        >
          Restart Quiz
        </button>
      </div>
    </div>
  </main>)
}

export default Result;
