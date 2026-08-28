import { MINI_TRACK_PATH } from "../components/layout/MiniTrack";

let cachedPath = null;
let cachedTotalLength = 0;
const SAMPLE_COUNT = 300;
let pointsCache = null;

function initPathCache() {
  if (typeof document === "undefined") return;
  if (!cachedPath) {
    try {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", MINI_TRACK_PATH);
      cachedPath = path;
      cachedTotalLength = path.getTotalLength();

      pointsCache = [];
      for (let i = 0; i <= SAMPLE_COUNT; i++) {
        const dist = (i / SAMPLE_COUNT) * cachedTotalLength;
        const pt = path.getPointAtLength(dist);

        const delta = 0.5;
        const nextDist = (dist + delta) % cachedTotalLength;
        const ptNext = path.getPointAtLength(nextDist);

        const dx = ptNext.x - pt.x;
        const dy = ptNext.y - pt.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        pointsCache.push({ x: pt.x, y: pt.y, angle });
      }
    } catch {
      pointsCache = null;
    }
  }
}

export function getTrackPosition(progress) {
  const normProgress = Math.max(0, Math.min(100, progress || 0));

  if (typeof document !== "undefined") {
    initPathCache();
    if (pointsCache && pointsCache.length > 0) {
      const samplePos = (normProgress / 100) * SAMPLE_COUNT;
      const baseIdx = Math.floor(samplePos);
      const nextIdx = Math.min(SAMPLE_COUNT, baseIdx + 1);
      const frac = samplePos - baseIdx;

      const p1 = pointsCache[baseIdx];
      const p2 = pointsCache[nextIdx] || p1;

      const x = p1.x + (p2.x - p1.x) * frac;
      const y = p1.y + (p2.y - p1.y) * frac;

      let dAngle = p2.angle - p1.angle;
      if (dAngle > 180) dAngle -= 360;
      if (dAngle < -180) dAngle += 360;
      const angle = p1.angle + dAngle * frac;

      return { x, y, angle };
    }
  }

  return { x: 30, y: 54, angle: 0 };
}
