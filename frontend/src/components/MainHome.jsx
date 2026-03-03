import { useNavigate } from 'react-router-dom';
import '../css/MainHome.css';

function MainHome() {
  const navigate = useNavigate();

  return (
    <div>
      <main>
        <section className='section1'>
          <div className='line'>
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

export default MainHome;
