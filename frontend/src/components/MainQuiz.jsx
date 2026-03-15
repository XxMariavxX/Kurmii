import '../css/MainQuiz.css';

function MainQuiz() {

  return (
    <div>
      <main>
        <section className='section2'>
          <div className='quiz'>
            </div>
          <button 
            onClick={() => {'/'}}
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