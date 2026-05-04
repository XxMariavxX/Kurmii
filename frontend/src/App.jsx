import { Routes, Route} from "react-router-dom";

import MainPage from "./pages/MainPage";
import QuizPage from "./pages/QuizPage";
import Submit from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;