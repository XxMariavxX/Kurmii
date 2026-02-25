import { Routes, Route, Link } from "react-router-dom";
import "./css/App.css";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

import MainPage from "./pages/MainPage";
import QuizPage from "./pages/QuizPage";
import Result from "./pages/Result";

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<Result />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
