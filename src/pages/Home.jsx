import { useNavigate } from "react-router-dom";
import { ArrowRight, Timer, Flag } from "lucide-react";
import MiniTrack from "../components/layout/MiniTrack";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="page home-page">
      <MiniTrack />

      <div className="home-content">
        <h1 className="hero-title">
          REFLEX
          <span>ARENA</span>
        </h1>

        <p className="hero-description">
          Test your reaction. Sharpen your focus. Type at race pace.
        </p>

        <div className="game-grid">
          <button
            type="button"
            className="game-card"
            onClick={() => navigate("/reaction")}
            aria-label="Open reaction test"
          >
            <div className="game-card-top">
              <span className="game-number">01</span>
              <Timer size={22} strokeWidth={1.5} />
            </div>

            <div className="game-card-content">
              <h2>REACTION TEST</h2>
              <p>Beat the lights and measure your reaction speed.</p>
            </div>

            <div className="game-card-action">
              PLAY
              <ArrowRight size={18} />
            </div>
          </button>

          <button
            type="button"
            className="game-card"
            onClick={() => navigate("/typing")}
            aria-label="Open type to race"
          >
            <div className="game-card-top">
              <span className="game-number">02</span>
              <Flag size={22} strokeWidth={1.5} />
            </div>

            <div className="game-card-content">
              <h2>TYPE TO RACE</h2>
              <p>Type fast. Hold your line. Beat the clock.</p>
            </div>

            <div className="game-card-action">
              PLAY
              <ArrowRight size={18} />
            </div>
          </button>
        </div>
      </div>

      <div className="home-footer">
        <span>FRONTEND ONLY</span>
        <span>NO ACCOUNT REQUIRED</span>
      </div>
    </main>
  );
}

export default Home;