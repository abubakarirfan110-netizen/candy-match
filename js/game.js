import { Board } from "./board.js";
import { LEVELS } from "./levels.js";
import { pointsForMatch } from "./score.js";
import { completeLevel } from "./storage.js";
import { playClear, playDrop, playSwap, wait } from "./animations.js";

export class Game {
  constructor(ui, progress, onSound) {
    this.ui = ui;
    this.progress = progress;
    this.onSound = onSound;
    this.board = null;
    this.level = null;
    this.score = 0;
    this.moves = 0;
    this.selected = null;
    this.busy = false;
    this.paused = false;
  }

  start(levelNumber) {
    this.level = LEVELS[levelNumber - 1];
    this.board = new Board();
    this.score = 0;
    this.moves = this.level.moves;
    this.selected = null;
    this.busy = false;
    this.paused = false;
    this.ui.showScreen("game");
    this.ui.renderBoard(this.board.cells);
    this.updateStats();
  }

  async choose(row, col) {
    if (this.busy || this.paused || !this.board || !this.board.cells[row]?.[col]) return;
    const position = { row, col };
    if (!this.selected) {
      this.selected = position;
      this.ui.renderBoard(this.board.cells, this.selected);
      return;
    }
    if (this.selected.row === row && this.selected.col === col) {
      this.selected = null;
      this.ui.renderBoard(this.board.cells);
      return;
    }
    if (!this.areAdjacent(this.selected, position)) {
      this.selected = position;
      this.ui.renderBoard(this.board.cells, this.selected);
      return;
    }

    this.busy = true;
    const first = this.selected;
    this.selected = null;
    this.ui.renderBoard(this.board.cells);
    await playSwap(this.ui.board, first, position);
    this.board.swap(first, position);
    const matches = this.board.findMatches();
    if (!matches.length) {
      await playSwap(this.ui.board, first, position, true);
      this.board.swap(first, position);
      this.ui.renderBoard(this.board.cells);
      this.busy = false;
      this.ui.status("That swap didn’t make a match. Try another one!");
      return;
    }

    this.ui.renderBoard(this.board.cells);
    this.moves -= 1;
    this.onSound("swap");
    this.updateStats();
    await this.resolveMatches(matches);
    this.busy = false;
    if (this.score >= this.level.target) {
      completeLevel(this.progress, this.level.number, this.score);
      this.onSound("victory");
      this.ui.showResult(true, this.score, this.level.target, this.level.number);
    } else if (this.moves <= 0) {
      this.ui.showResult(false, this.score, this.level.target, this.level.number);
    }
  }

  async resolveMatches(initialMatches) {
    let matches = initialMatches;
    let cascade = 0;
    while (matches.length) {
      await playClear(this.ui.board, matches);
      const rowLengths = new Map();
      const columnLengths = new Map();
      for (const { row, col } of matches) {
        rowLengths.set(row, (rowLengths.get(row) || 0) + 1);
        columnLengths.set(col, (columnLengths.get(col) || 0) + 1);
      }
      const longest = Math.max(3, ...rowLengths.values(), ...columnLengths.values());
      const points = pointsForMatch(matches.length, cascade) + Math.max(0, longest - 3) * 60;
      this.score += points;
      this.board.removeMatches(matches);
      const dropDepth = this.board.dropAndRefill();
      this.ui.renderBoard(this.board.cells, null, true);
      await playDrop(this.ui.board, dropDepth);
      this.updateStats();
      this.onSound("match");
      cascade += 1;
      matches = this.board.findMatches();
    }

    if (!this.board.hasPossibleMoves()) {
      this.board.reshuffle();
      this.ui.renderBoard(this.board.cells, null, true);
      this.ui.status("A fresh board! Keep matching.");
      await wait(250);
    }
  }

  areAdjacent(first, second) {
    return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;
  }

  updateStats() {
    this.ui.updateStats(this.level, this.score, this.moves);
  }

  pause() {
    if (!this.busy && this.level) {
      this.paused = true;
      this.ui.showPause();
    }
  }

  resume() {
    this.paused = false;
    this.ui.hideModal();
  }
}
