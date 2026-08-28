// Curves defining MINI_TRACK_PATH in exact SVG Bezier order
const CURVES = [
  { p0: [30, 54], p1: [18, 43], p2: [20, 25], p3: [38, 18] },
  { p0: [38, 18], p1: [55, 11], p2: [74, 14], p3: [88, 8] },
  { p0: [88, 8], p1: [101, 2], p2: [111, 8], p3: [123, 13] },
  { p0: [123, 13], p1: [137, 19], p2: [150, 13], p3: [163, 17] },
  { p0: [163, 17], p1: [178, 21], p2: [194, 25], p3: [205, 37] },
  { p0: [205, 37], p1: [216, 49], p2: [211, 60], p3: [198, 67] },
  { p0: [198, 67], p1: [186, 74], p2: [173, 78], p3: [160, 82] },
  { p0: [160, 82], p1: [145, 87], p2: [132, 82], p3: [121, 74] },
  { p0: [121, 74], p1: [112, 67], p2: [105, 61], p3: [98, 63] },
  { p0: [98, 63], p1: [91, 65], p2: [91, 75], p3: [83, 79] },
  { p0: [83, 79], p1: [74, 84], p2: [65, 80], p3: [60, 72] },
  { p0: [60, 72], p1: [54, 63], p2: [47, 59], p3: [39, 61] },
  { p0: [39, 61], p1: [35, 62], p2: [32, 59], p3: [30, 54] },
];

function cubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0],
    mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1],
  ];
}

function cubicBezierDerivative(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return [
    3 * mt * mt * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * mt * mt * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
}

const STEPS_PER_CURVE = 80;
const finePoints = [];

for (let i = 0; i < CURVES.length; i++) {
  const c = CURVES[i];
  for (let j = 0; j < STEPS_PER_CURVE; j++) {
    const t = j / STEPS_PER_CURVE;
    const pt = cubicBezier(c.p0, c.p1, c.p2, c.p3, t);
    const d = cubicBezierDerivative(c.p0, c.p1, c.p2, c.p3, t);
    finePoints.push({ x: pt[0], y: pt[1], dx: d[0], dy: d[1] });
  }
}

let totalLen = 0;
const lengths = [0];
for (let i = 1; i < finePoints.length; i++) {
  const p1 = finePoints[i - 1];
  const p2 = finePoints[i];
  totalLen += Math.hypot(p2.x - p1.x, p2.y - p1.y);
  lengths.push(totalLen);
}

const NUM_SAMPLES = 300;
const SAMPLE_TABLE = [];

for (let s = 0; s <= NUM_SAMPLES; s++) {
  const targetDist = (s / NUM_SAMPLES) * totalLen;
  let idx = 0;
  while (idx < lengths.length - 1 && lengths[idx + 1] < targetDist) {
    idx++;
  }
  const nextIdx = Math.min(lengths.length - 1, idx + 1);
  const segLen = lengths[nextIdx] - lengths[idx];
  const frac = segLen > 0 ? (targetDist - lengths[idx]) / segLen : 0;

  const p1 = finePoints[idx];
  const p2 = finePoints[nextIdx];

  const x = p1.x + (p2.x - p1.x) * frac;
  const y = p1.y + (p2.y - p1.y) * frac;
  const dx = p1.dx + (p2.dx - p1.dx) * frac;
  const dy = p1.dy + (p2.dy - p1.dy) * frac;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  SAMPLE_TABLE.push({ x, y, angle });
}

export function getTrackPosition(progress) {
  const normProgress = Math.max(0, Math.min(100, progress || 0));
  const samplePos = (normProgress / 100) * NUM_SAMPLES;
  const baseIdx = Math.floor(samplePos);
  const nextIdx = Math.min(NUM_SAMPLES, baseIdx + 1);
  const frac = samplePos - baseIdx;

  const p1 = SAMPLE_TABLE[baseIdx];
  const p2 = SAMPLE_TABLE[nextIdx] || p1;

  const x = p1.x + (p2.x - p1.x) * frac;
  const y = p1.y + (p2.y - p1.y) * frac;

  let dAngle = p2.angle - p1.angle;
  if (dAngle > 180) dAngle -= 360;
  if (dAngle < -180) dAngle += 360;
  const angle = p1.angle + dAngle * frac;

  return { x, y, angle };
}
