const SWAP_DURATION = 190;
const CLEAR_DURATION = 230;
const DROP_DURATION = 270;

export const wait = duration => new Promise(resolve => window.setTimeout(resolve, duration));

export async function playSwap(boardElement, first, second, reverse = false) {
  const cells = [getCell(boardElement, first), getCell(boardElement, second)];
  cells.forEach(cell => cell?.classList.add("is-swapping"));
  const [firstCandy, secondCandy] = cells.map(cell => cell?.querySelector(".candy"));
  if (firstCandy && secondCandy) {
    const firstRect = cells[0].getBoundingClientRect();
    const secondRect = cells[1].getBoundingClientRect();
    firstCandy.style.transition = `transform ${SWAP_DURATION}ms cubic-bezier(.2,.8,.2,1)`;
    secondCandy.style.transition = firstCandy.style.transition;
    firstCandy.style.transform = reverse ? "" : `translate(${secondRect.left - firstRect.left}px, ${secondRect.top - firstRect.top}px)`;
    secondCandy.style.transform = reverse ? "" : `translate(${firstRect.left - secondRect.left}px, ${firstRect.top - secondRect.top}px)`;
  }
  await wait(SWAP_DURATION);
  if (reverse) cells.forEach(cell => cell?.classList.remove("is-swapping"));
}

export async function playClear(boardElement, matches) {
  for (const position of matches) getCell(boardElement, position)?.classList.add("is-clearing");
  await wait(CLEAR_DURATION);
}

export async function playDrop(boardElement, depth) {
  boardElement.querySelectorAll(".board-cell").forEach((cell, index) => {
    cell.classList.add("is-dropping");
    cell.style.setProperty("--drop-delay", `${(index % 8) * 12 + Math.min(depth, 4) * 10}ms`);
  });
  await wait(DROP_DURATION);
}

function getCell(boardElement, { row, col }) {
  return boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}
