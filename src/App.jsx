import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ReactionGame from "./pages/ReactionGame";
import TypingGame from "./pages/TypingGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reaction" element={<ReactionGame />} />
        <Route path="/typing" element={<TypingGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;