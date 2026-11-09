export const CANDY_TYPES = [
  { name: "berry", color: "#ff5b83", mark: "♥" },
  { name: "lemon", color: "#ffd84f", mark: "✦" },
  { name: "mint", color: "#4ed8aa", mark: "●" },
  { name: "grape", color: "#a476f4", mark: "◆" },
  { name: "orange", color: "#ff995a", mark: "✿" },
  { name: "sky", color: "#51c8f2", mark: "✧" }
];

export function makeCandy(type = Math.floor(Math.random() * CANDY_TYPES.length)) {
  return { id: `candy-${makeCandy.nextId++}`, type };
}
makeCandy.nextId = 0;

export function candyMarkup(candy) {
  const type = CANDY_TYPES[candy.type];
  return `<span class="candy candy-shape-${candy.type + 1}" style="--candy-color:${type.color}" aria-hidden="true">${type.mark}</span>`;
}
