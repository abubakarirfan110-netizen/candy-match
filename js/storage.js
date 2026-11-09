const STORAGE_KEY = "candy-match-progress-v1";

function freshProgress() {
  return { unlockedLevel: 1, completed: [], bestScores: {}, soundOn: true };
}

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return freshProgress();
    return {
      unlockedLevel: Math.min(10, Math.max(1, Number(saved.unlockedLevel) || 1)),
      completed: Array.isArray(saved.completed)
        ? [...new Set(saved.completed.filter(level => Number.isInteger(level) && level >= 1 && level <= 10))]
        : [],
      bestScores: saved.bestScores && typeof saved.bestScores === "object" ? saved.bestScores : {},
      soundOn: saved.soundOn !== false
    };
  } catch (error) {
    console.warn("Could not load saved Candy Match progress.", error);
    return freshProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("Could not save Candy Match progress.", error);
  }
}

export function completeLevel(progress, level, score) {
  if (!progress.completed.includes(level)) progress.completed.push(level);
  progress.unlockedLevel = Math.min(10, Math.max(progress.unlockedLevel, level + 1));
  progress.bestScores[level] = Math.max(progress.bestScores[level] || 0, score);
  saveProgress(progress);
}
