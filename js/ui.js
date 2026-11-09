import { LEVELS } from "./levels.js";
import { candyMarkup } from "./candy.js";
import { formatScore, starsForScore } from "./score.js";

export class UI {
  constructor() {
    this.screens = {
      menu: document.querySelector("#menu-screen"),
      levels: document.querySelector("#levels-screen"),
      game: document.querySelector("#game-screen")
    };
    this.board = document.querySelector("#game-board");
    this.modalLayer = document.querySelector("#modal-layer");
  }

  showScreen(name) {
    Object.entries(this.screens).forEach(([screen, element]) => element.classList.toggle("is-hidden", screen !== name));
    this.hideModal();
  }

  renderLevels(progress) {
    const grid = document.querySelector("#level-grid");
    grid.innerHTML = LEVELS.map(({ number }) => {
      const unlocked = number <= progress.unlockedLevel;
      const completed = progress.completed.includes(number);
      const best = progress.bestScores[number] || 0;
      const stars = completed ? starsForScore(best, LEVELS[number - 1].target) : 0;
      return `<button class="level-tile${completed ? " is-complete" : ""}" type="button" data-level="${number}" ${unlocked ? "" : "disabled"} aria-label="Level ${number}${unlocked ? "" : ", locked"}${completed ? `, completed with ${stars} stars` : ""}">
        <span class="level-lock" aria-hidden="true">${unlocked ? (completed ? "✓" : "✦") : "🔒"}</span>
        <span class="level-number">${number}</span><span class="level-stars" aria-hidden="true">${completed ? "★".repeat(stars) : "&nbsp;"}</span>
      </button>`;
    }).join("");
  }

  renderBoard(cells, selected = null, animate = false) {
    const fragment = document.createDocumentFragment();
    cells.forEach((row, rowIndex) => row.forEach((candy, colIndex) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "board-cell";
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Row ${rowIndex + 1}, column ${colIndex + 1}`);
      if (selected?.row === rowIndex && selected?.col === colIndex) cell.classList.add("is-selected");
      cell.innerHTML = candyMarkup(candy);
      if (animate) {
        cell.classList.add("is-dropping");
        cell.style.setProperty("--drop-delay", `${colIndex * 12}ms`);
      }
      fragment.append(cell);
    }));
    this.board.replaceChildren(fragment);
  }

  updateStats(level, score, moves) {
    document.querySelector("#current-level").textContent = `Level ${level.number}`;
    document.querySelector("#score-value").textContent = formatScore(score);
    document.querySelector("#target-value").textContent = formatScore(level.target);
    document.querySelector("#moves-value").textContent = moves;
    document.querySelector("#score-progress").style.width = `${Math.min(100, score / level.target * 100)}%`;
  }

  status(message) {
    document.querySelector("#board-status").textContent = message;
  }

  setSoundState(soundOn) {
    const soundButton = document.querySelector("#sound-toggle");
    const icon = soundOn ? "♫" : "♪";
    soundButton.textContent = icon;
    soundButton.setAttribute("aria-label", soundOn ? "Turn sound off" : "Turn sound on");
    document.querySelector("#game-sound-icon").textContent = icon;
  }

  showPause() {
    this.showModal("pause-modal");
  }

  showResult(won, score, target, levelNumber) {
    const modal = document.querySelector("#result-modal");
    const primary = document.querySelector("#result-primary");
    const stars = document.querySelector("#star-rating");
    modal.classList.remove("is-hidden");
    document.querySelector("#result-icon").textContent = won ? "🍬" : "💫";
    document.querySelector("#result-eyebrow").textContent = won ? "Sweet success!" : "So close!";
    document.querySelector("#result-title").textContent = won ? "Level complete!" : "Out of moves!";
    document.querySelector("#result-copy").textContent = won
      ? `You scored ${formatScore(score)} points. What a treat!`
      : `You scored ${formatScore(score)} of ${formatScore(target)} points. Give it another try!`;
    stars.textContent = won ? "★".repeat(starsForScore(score, target)) : "☆ ☆ ☆";
    stars.dataset.stars = won ? String(starsForScore(score, target)) : "0";
    stars.setAttribute("aria-label", won ? `${stars.dataset.stars} stars` : "No stars");
    primary.dataset.action = won ? (levelNumber === 10 ? "menu" : "next") : "restart";
    primary.innerHTML = won
      ? (levelNumber === 10 ? "Adventure complete! <span aria-hidden=\"true\">✦</span>" : "Next level <span aria-hidden=\"true\">→</span>")
      : "Try again <span aria-hidden=\"true\">↻</span>";
    document.querySelector("#modal-layer").classList.remove("is-hidden");
  }

  showModal(modalId) {
    this.modalLayer.classList.remove("is-hidden");
    this.modalLayer.querySelectorAll(".modal-card").forEach(modal => modal.classList.toggle("is-hidden", modal.id !== modalId));
  }

  hideModal() {
    this.modalLayer.classList.add("is-hidden");
    this.modalLayer.querySelectorAll(".modal-card").forEach(modal => modal.classList.add("is-hidden"));
  }
}
