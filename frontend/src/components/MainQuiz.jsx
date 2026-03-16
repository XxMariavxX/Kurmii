import "../css/MainQuiz.css";
import "../components/BoxQuiz.jsx";

function MainQuiz() {
  return (
    <div>
      <main>
        <section className="section2">
          <p className="title">Kurmi</p>
          <div className="quiz">
            <BoxQuiz/>
          </div>

          <div className="entrance">
            <button
              onClick={() => {
                "/";
              }}
              className="navigate-button"
            >
              Start Quiz
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}

export default MainQuiz;
