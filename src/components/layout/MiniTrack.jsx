const CAR_COUNT = 20;

const TRACK_PATH =
  "M 30 54 " +
  "C 18 43, 20 25, 38 18 " +
  "C 55 11, 74 14, 88 8 " +
  "C 101 2, 111 8, 123 13 " +
  "C 137 19, 150 13, 163 17 " +
  "C 178 21, 194 25, 205 37 " +
  "C 216 49, 211 60, 198 67 " +
  "C 186 74, 173 78, 160 82 " +
  "C 145 87, 132 82, 121 74 " +
  "C 112 67, 105 61, 98 63 " +
  "C 91 65, 91 75, 83 79 " +
  "C 74 84, 65 80, 60 72 " +
  "C 54 63, 47 59, 39 61 " +
  "C 35 62, 32 59, 30 54";

const CAR_COLORS = [
  "#ff3b30",
  "#f5f5f5",
  "#ffd43b",
  "#ff3b30",
  "#f5f5f5",
  "#ff3b30",
  "#ffd43b",
  "#f5f5f5",
  "#ff3b30",
  "#f5f5f5",
];

function MiniTrack() {
  return (
    <div className="mini-track" aria-hidden="true">
      <div className="track-header">
        <span className="track-live">
          <span className="track-live-dot" />
          LIVE
        </span>

        <span>20 CARS</span>
      </div>

      <svg
        className="track-svg"
        viewBox="0 0 230 95"
        preserveAspectRatio="none"
      >
        {/* Visible outer border */}
        <path
          d={TRACK_PATH}
          className="track-outer"
        />

        {/* Dark track surface */}
        <path
          d={TRACK_PATH}
          className="track-surface"
        />

        {/* Actual racing line */}
        <path
          id="miniTrackPath"
          d={TRACK_PATH}
          className="track-center"
          fill="none"
        />

        {/* 20 animated cars */}
        {Array.from({ length: CAR_COUNT }, (_, index) => {
          const duration =
            10 + (index % 5) * 0.35;

          const delay =
            -(index * 0.11);

          const color =
            CAR_COLORS[index % CAR_COLORS.length];

          const radius =
            index === 0 ? 2.6 : 2.1;

          return (
            <circle
              key={index}
              r={radius}
              fill={color}
              className={
                index === 0
                  ? "track-car track-car-leader"
                  : "track-car"
              }
            >
              <animateMotion
                dur={`${duration}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href="#miniTrackPath" />
              </animateMotion>

              {/* Tiny brightness pulse */}
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="0.8s"
                repeatCount="indefinite"
                begin={`${index * 0.04}s`}
              />
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

export default MiniTrack;