import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import F1Loader from "./components/ui/F1Loader";
import Home from "./pages/Home";
import ReactionGame from "./pages/ReactionGame";
import TypingGame from "./pages/TypingGame";

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <F1Loader loading={initialLoading} fullScreen={true} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reaction" element={<ReactionGame />} />
          <Route path="/typing" element={<TypingGame />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;