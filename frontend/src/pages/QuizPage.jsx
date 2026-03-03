import { useNavigate } from 'react-router-dom';

function QuizPage() {
  const navigate = useNavigate();

  return (
  <main>
    <div>
      <h1>Quiz Page</h1>
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
          onClick={() => navigate('/result')} 
          className='navigate-button'
        >
          Go to Results
        </button>
      </div>
    </div>
  </main>
  )
}

export default QuizPage;
