import { Routes, Route} from "react-router-dom";

import MainPage from "./pages/MainPage";
import QuizPage from "./pages/QuizPage";
import Submit from "./pages/Login";

function App() {
  return (
    <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/submit" elemmnet={<Submit />} />
    </Routes>
  );
}

export default App;