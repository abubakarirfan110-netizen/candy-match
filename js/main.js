import { LEVELS } from "./levels.js";
import { Game } from "./game.js";
import { loadProgress, saveProgress } from "./storage.js";
import { UI } from "./ui.js";

const ui = new UI();
const progress = loadProgress();
const game = new Game(ui, progress, playSound);
let audioContext = null;

ui.setSoundState(progress.soundOn);
ui.renderLevels(progress);

document.addEventListener("click", event => {
  const actionElement = event.target.closest("[data-action]");
  if (actionElement) {
    handleAction(actionElement.dataset.action);
    return;
  }

  const levelButton = event.target.closest("[data-level]");
  if (levelButton && !levelButton.disabled) {
    startLevel(Number(levelButton.dataset.level));
    return;
  }

  const cell = event.target.closest(".board-cell");
  if (cell && !ui.screens.game.classList.contains("is-hidden")) {
    game.choose(Number(cell.dataset.row), Number(cell.dataset.col));
  }
});

function handleAction(action) {
  switch (action) {
    case "play":
      startLevel(progress.unlockedLevel);
      break;
    case "levels":
      ui.renderLevels(progress);
      ui.showScreen("levels");
      break;
    case "menu":
      ui.renderLevels(progress);
      ui.showScreen("menu");
      break;
    case "pause":
      game.pause();
      break;
    case "resume":
      game.resume();
      break;
    case "restart":
      if (game.level) startLevel(game.level.number);
      break;
    case "next":
      if (game.level) startLevel(Math.min(LEVELS.length, game.level.number + 1));
      break;
    case "sound":
      progress.soundOn = !progress.soundOn;
      saveProgress(progress);
      ui.setSoundState(progress.soundOn);
      break;
    default:
      break;
  }
}

function startLevel(number) {
  if (number < 1 || number > LEVELS.length || number > progress.unlockedLevel) return;
  game.start(number);
}

function playSound(kind) {
  if (!progress.soundOn) return;
  try {
    audioContext ??= new AudioContext();
    const now = audioContext.currentTime;
    const frequencies = kind === "victory" ? [523, 659, 784] : kind === "match" ? [660, 880] : [440];
    frequencies.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = now + index * .07;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.055, start + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .16);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + .17);
    });
  } catch (error) {
    console.warn("Candy Match sound could not be played.", error);
  }
}
