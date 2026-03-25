import { useNavigate } from "react-router-dom";
import ico from "../assets/favicon.ico";
import "../css/MainHome.css";
import Header from "../components/Header";

function MainHome() {
  const navigate = useNavigate();
  const now = new Date();

  const formattedDate = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleStartDaily = () => {
    navigate("/quiz");
  };

  return (
    <>
      <main>
        <section className="section1">
          <Header />
          <div className="block1">
            <img className="ico" src={ico} title="help" alt="icoKurmi" />
          </div>

          <div className="home-actions">
            <button
              onClick={handleStartDaily}
              className="quiz-daily-word"
            >
              Daily word
            </button>
            <p className="today">{formattedDate}</p>
          </div>
        </section>
      </main>
    </>
  );
}

export default MainHome;
