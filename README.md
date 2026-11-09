# Candy Match

A polished, responsive 8×8 match-three puzzle game built with vanilla JavaScript, HTML, and CSS. It includes 10 levels, animated matches and cascades, synthesized sound effects, and saved level progress.

## Run the game

Open this folder with a small local web server, then visit its `index.html`. ES modules are used, so opening the HTML directly with a `file://` URL may be blocked by browser security.

For example, if Python is installed:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

## How to play

- Choose an unlocked level and tap or click a candy, then an adjacent candy.
- Only swaps that make a match are accepted; invalid swaps are returned without using a move.
- Match three or more candies horizontally or vertically. Four- and five-candy matches earn bonus points.
- Reach the target before you run out of moves. Completing a level unlocks the next one.
- Use Pause, Restart, and Main Menu to manage a game. Progress and sound preference are saved in local storage.

## Project layout

```text
index.html
assets/
  images/
    candies/
    backgrounds/
    icons/
  sounds/
  fonts/
css/
  style.css
  game.css
  responsive.css
js/
  main.js
  game.js
  board.js
  candy.js
  levels.js
  score.js
  animations.js
  storage.js
  ui.js
```

Candy artwork is rendered with CSS shapes. Sound effects are generated with the Web Audio API, so no binary sound files or third-party game libraries are required.
