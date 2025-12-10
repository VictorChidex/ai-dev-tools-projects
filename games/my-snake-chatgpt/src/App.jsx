// React + Tailwind CSS Snake Game
// Save this file as src/SnakeGame.jsx and import into your App.jsx
// Works with Vite + React + Tailwind (tailwind optional — plain CSS classes used are Tailwind-style)

import React, { useEffect, useRef, useState } from 'react';

// Configuration
const GRID_SIZE = 20; // number of cells per row/column
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_SPEED = 150; // ms per move

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const dirRef = useRef(direction);
  const [food, setFood] = useState(randomFood(INITIAL_SNAKE));
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Keep refs in sync for interval
  useEffect(() => { dirRef.current = direction; }, [direction]);

  // Game loop
  useEffect(() => {
    if (!running || gameOver) return;
    const id = setInterval(() => moveSnake(), speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, speed, snake, gameOver]);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e) {
      const key = e.key;
      if (key === 'ArrowUp' || key === 'w' || key === 'W') tryChangeDir({ x: 0, y: -1 });
      if (key === 'ArrowDown' || key === 's' || key === 'S') tryChangeDir({ x: 0, y: 1 });
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') tryChangeDir({ x: -1, y: 0 });
      if (key === 'ArrowRight' || key === 'd' || key === 'D') tryChangeDir({ x: 1, y: 0 });
      if (key === ' ' || key === 'Spacebar') setRunning(r => !r); // space to pause/resume
      if ((key === 'r' || key === 'R') && gameOver) resetGame();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  function tryChangeDir(newDir) {
    // prevent reversing
    const cur = dirRef.current;
    if (cur.x + newDir.x === 0 && cur.y + newDir.y === 0) return;
    setDirection(newDir);
  }

  function moveSnake() {
    setSnake(prev => {
      const head = prev[0];
      const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

      // wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        endGame();
        return prev;
      }

      // self collision
      if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        endGame();
        return prev;
      }

      const ateFood = newHead.x === food.x && newHead.y === food.y;
      const newSnake = [newHead, ...prev];
      if (!ateFood) newSnake.pop();
      else {
        // grew
        setScore(s => s + 1);
        setFood(randomFood(newSnake));
        // optionally speed up
        setSpeed(s => Math.max(45, Math.round(s * 0.95)));
      }

      return newSnake;
    });
  }

  function endGame() {
    setGameOver(true);
    setRunning(false);
  }

  function resetGame() {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    dirRef.current = INITIAL_DIRECTION;
    setFood(randomFood(INITIAL_SNAKE));
    setSpeed(INITIAL_SPEED);
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }

  function handleCellClick(x, y) {
    // optional: start game by clicking board
    if (!running && !gameOver) setRunning(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">React Snake</h1>
          <div className="text-white">Score: <span className="font-mono">{score}</span></div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-shrink-0">
              <Board
                snake={snake}
                food={food}
                gridSize={GRID_SIZE}
                onCellClick={handleCellClick}
              />
            </div>

            <div className="flex-1 text-gray-200">
              <div className="mb-3">
                <p className="text-sm">Controls: Arrow keys or WASD. Space to pause / resume. R to restart after game over.</p>
              </div>
              <div className="space-y-2">
                <button
                  className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold"
                  onClick={() => { if (gameOver) resetGame(); else setRunning(r => !r); }}
                >
                  {gameOver ? 'Restart' : (running ? 'Pause' : 'Start')}
                </button>

                <button
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={() => setSpeed(s => Math.max(45, Math.round(s * 0.9)))}
                >
                  Speed Up
                </button>

                <button
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                  onClick={() => { setSpeed(INITIAL_SPEED); }}
                >
                  Reset Speed
                </button>

                <div className="pt-4">
                  <p className="text-sm">Status: <span className="font-mono">{gameOver ? 'Game over' : (running ? 'Running' : 'Paused')}</span></p>
                  <p className="text-sm">Speed (ms per move): <span className="font-mono">{speed}</span></p>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                <p>Tip: Click the board and use keyboard to control. Food increases length and slightly increases speed.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-right text-xs text-gray-400">Press R to restart when game over.</div>
      </div>
    </div>
  );
}

function Board({ snake, food, gridSize, onCellClick }) {
  const cellSize = 18; // for inline style size (px) -- grid will scale with wrapper

  // Build a quick set for snake positions for O(1) lookup
  const snakeSet = new Set(snake.map(s => `${s.x},${s.y}`));
  const rows = [];
  for (let y = 0; y < gridSize; y++) {
    const cells = [];
    for (let x = 0; x < gridSize; x++) {
      const key = `${x},${y}`;
      const isHead = snake[0].x === x && snake[0].y === y;
      const isSnake = snakeSet.has(key);
      const isFood = food.x === x && food.y === y;
      const className = isHead ? 'bg-green-400' : (isSnake ? 'bg-green-600' : (isFood ? 'bg-red-500' : 'bg-gray-200/5'));

      cells.push(
        <div
          key={key}
          onClick={() => onCellClick(x, y)}
          className={`border border-gray-800 ${className} rounded-sm`}
          style={{ width: cellSize, height: cellSize }}
          title={isFood ? 'Food' : isHead ? 'Head' : isSnake ? 'Body' : ''}
        />
      );
    }
    rows.push(
      <div key={y} className="flex">
        {cells}
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-900 rounded" style={{ width: gridSize * (cellSize + 2), height: gridSize * (cellSize + 2) }}>
      <div className="bg-black/60 p-1 rounded">
        <div className="grid" style={{ display: 'inline-block' }}>
          {rows}
        </div>
      </div>
    </div>
  );
}

function randomFood(snake) {
  // produce a food position not on the snake
  const taken = new Set(snake.map(s => `${s.x},${s.y}`));
  const max = GRID_SIZE * GRID_SIZE;
  if (taken.size >= max) return { x: 0, y: 0 };

  while (true) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const key = `${x},${y}`;
    if (!taken.has(key)) return { x, y };
  }
}
