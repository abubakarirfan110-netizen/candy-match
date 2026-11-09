import { makeCandy, CANDY_TYPES } from "./candy.js";

export const BOARD_SIZE = 8;

export class Board {
  constructor(size = BOARD_SIZE) {
    this.size = size;
    this.cells = [];
    this.create();
  }

  create() {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      this.cells = Array.from({ length: this.size }, () => Array(this.size).fill(null));
      for (let row = 0; row < this.size; row += 1) {
        for (let col = 0; col < this.size; col += 1) {
          let type;
          do {
            type = Math.floor(Math.random() * CANDY_TYPES.length);
          } while (
            (col >= 2 && this.cells[row][col - 1].type === type && this.cells[row][col - 2].type === type) ||
            (row >= 2 && this.cells[row - 1][col].type === type && this.cells[row - 2][col].type === type)
          );
          this.cells[row][col] = makeCandy(type);
        }
      }
      if (this.hasPossibleMoves()) return;
    }
    this.cells = Array.from({ length: this.size }, (_, row) =>
      Array.from({ length: this.size }, (_, col) => makeCandy((row + col * 2) % CANDY_TYPES.length))
    );
    this.cells[0][1].type = 1;
    this.cells[0][2].type = 0;
    this.cells[1][1].type = 0;
  }

  swap(first, second) {
    [this.cells[first.row][first.col], this.cells[second.row][second.col]] =
      [this.cells[second.row][second.col], this.cells[first.row][first.col]];
  }

  findMatches() {
    const matched = new Map();
    const add = (row, col) => matched.set(`${row},${col}`, { row, col });

    for (let row = 0; row < this.size; row += 1) {
      let start = 0;
      while (start < this.size) {
        const type = this.cells[row][start]?.type;
        let end = start + 1;
        while (type !== undefined && end < this.size && this.cells[row][end]?.type === type) end += 1;
        if (type !== undefined && end - start >= 3) {
          for (let col = start; col < end; col += 1) add(row, col);
        }
        start = end;
      }
    }

    for (let col = 0; col < this.size; col += 1) {
      let start = 0;
      while (start < this.size) {
        const type = this.cells[start][col]?.type;
        let end = start + 1;
        while (type !== undefined && end < this.size && this.cells[end][col]?.type === type) end += 1;
        if (type !== undefined && end - start >= 3) {
          for (let row = start; row < end; row += 1) add(row, col);
        }
        start = end;
      }
    }
    return [...matched.values()];
  }

  hasPossibleMoves() {
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        for (const [nextRow, nextCol] of [[row, col + 1], [row + 1, col]]) {
          if (nextRow >= this.size || nextCol >= this.size) continue;
          this.swap({ row, col }, { row: nextRow, col: nextCol });
          const possible = this.findMatches().length > 0;
          this.swap({ row, col }, { row: nextRow, col: nextCol });
          if (possible) return true;
        }
      }
    }
    return false;
  }

  removeMatches(matches) {
    for (const { row, col } of matches) this.cells[row][col] = null;
  }

  dropAndRefill() {
    let maxDrop = 0;
    for (let col = 0; col < this.size; col += 1) {
      const survivors = [];
      for (let row = this.size - 1; row >= 0; row -= 1) {
        if (this.cells[row][col]) survivors.push(this.cells[row][col]);
      }
      const missing = this.size - survivors.length;
      maxDrop = Math.max(maxDrop, missing);
      for (let row = this.size - 1; row >= 0; row -= 1) {
        const survivorIndex = this.size - 1 - row;
        this.cells[row][col] = survivorIndex < survivors.length
          ? survivors[survivorIndex]
          : makeCandy();
      }
    }
    return maxDrop;
  }

  reshuffle() {
    const candies = this.cells.flat().map(candy => candy.type);
    for (let attempt = 0; attempt < 100; attempt += 1) {
      for (let i = candies.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [candies[i], candies[j]] = [candies[j], candies[i]];
      }
      this.cells = Array.from({ length: this.size }, (_, row) =>
        Array.from({ length: this.size }, (_, col) => makeCandy(candies[row * this.size + col]))
      );
      if (!this.findMatches().length && this.hasPossibleMoves()) return;
    }
    this.create();
  }
}
