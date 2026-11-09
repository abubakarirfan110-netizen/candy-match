export function pointsForMatch(matchSize, cascade = 0) {
  const base = matchSize * 60;
  const bonus = matchSize >= 5 ? 300 : matchSize === 4 ? 120 : 0;
  return (base + bonus) * (cascade + 1);
}

export function starsForScore(score, target) {
  const ratio = score / target;
  if (ratio >= 1.8) return 3;
  if (ratio >= 1.3) return 2;
  return 1;
}

export function formatScore(score) {
  return new Intl.NumberFormat().format(score);
}
