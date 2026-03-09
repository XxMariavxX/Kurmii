import { useNavigate } from "react-router-dom";
import ico from "../assets/favicon.ico";
import "../css/MainHome.css";

function MainHome() {
  const navigate = useNavigate();

  return (
    <main>
      <section className="section1">
        <div className="block1">
          <img className="ico" src={ico} alt="icoKurmi" />
        </div>

        <div className="line">
          <button onClick={() => navigate("/quiz")} className="quiz-daily-word">
            Daily word
          </button>
          <button onClick={() => navigate("/quiz")} className="random-word">
            Random
          </button>
        </div>
      </section>
    </main>
  );
}

export default MainHome;
