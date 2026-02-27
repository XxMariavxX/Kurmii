import { Routes, Route} from "react-router-dom";
import "./css/App.css";

import MainPage from "./pages/MainPage";
import QuizPage from "./pages/QuizPage";
import Result from "./pages/Result";

import MainLayout from "./layout/MainLayout";
import QuizLayout from "./layout/QuizLayout";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/result" element={<Result />} />
      </Route>

      <Route element={<QuizLayout />}>
        <Route path="/quiz" element={<QuizPage />} />
      </Route>
    </Routes>
  );
}

export default App;
