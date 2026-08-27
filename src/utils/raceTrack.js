export const TRACK_POINTS = [
  { x: 16, y: 65 },
  { x: 12, y: 43 },
  { x: 23, y: 20 },
  { x: 47, y: 14 },
  { x: 72, y: 17 },
  { x: 88, y: 31 },
  { x: 91, y: 55 },
  { x: 76, y: 72 },
  { x: 54, y: 78 },
  { x: 39, y: 67 },
  { x: 27, y: 73 },
];

export function getTrackPosition(progress) {
  const normalized = ((progress % 100) + 100) % 100;
  const scaled = (normalized / 100) * TRACK_POINTS.length;
  const index = Math.floor(scaled) % TRACK_POINTS.length;
  const nextIndex = (index + 1) % TRACK_POINTS.length;
  const fraction = scaled - Math.floor(scaled);
  const start = TRACK_POINTS[index];
  const end = TRACK_POINTS[nextIndex];

  return {
    x: start.x + (end.x - start.x) * fraction,
    y: start.y + (end.y - start.y) * fraction,
  };
}
