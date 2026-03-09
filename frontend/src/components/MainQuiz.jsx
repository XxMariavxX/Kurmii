import { useNavigate } from 'react-router-dom';
import '../css/MainQuiz.css';

function MainQuiz() {
  const navigate= useNavigate();

  return (
    <div>
      <main>
        <section className='section2'>
          <div className='quiz'>
            </div>
          <button 
            onClick={() => navigate('/quiz')} 
            className='navigate-button'
          >
            Start Quiz
          </button>
        </section>
      </main>
    </div>
  );
}

export default MainQuiz;