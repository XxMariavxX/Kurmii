import { Routes, Route} from "react-router-dom";

import MainPage from "./pages/MainPage";
import QuizPage from "./pages/QuizPage";
import Submit from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
          <Route path="/" element={<ErrorBoundary><MainPage /></ErrorBoundary>} />
          <Route path="/quiz" element={<ErrorBoundary><QuizPage /></ErrorBoundary>} />
          <Route path="/submit" element={<ErrorBoundary><Submit /></ErrorBoundary>} />
          <Route path="/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;