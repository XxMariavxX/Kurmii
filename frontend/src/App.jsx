import { Routes, Route} from "react-router-dom";
import "./css/App.css";

import MainPage from "./pages/MainPage";
import QuizPage from "./pages/QuizPage";

function App() {
  return (
    <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        
    </Routes>
  );
}

export default App;
