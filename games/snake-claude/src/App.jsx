import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [[10, 10]];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(generateFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  function generateFood(currentSnake) {
    let newFood;
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (currentSnake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
    return newFood;
  }

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = [head[0] + direction.x, head[1] + direction.y];

      // Check wall collision
      if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [direction, food, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setDirection(prev => prev.y !== 1 ? { x: 0, y: -1 } : prev);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setDirection(prev => prev.y !== -1 ? { x: 0, y: 1 } : prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setDirection(prev => prev.x !== 1 ? { x: -1, y: 0 } : prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setDirection(prev => prev.x !== -1 ? { x: 1, y: 0 } : prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-green-800">Snake Game</h1>
          <div className="text-2xl font-bold text-green-600">Score: {score}</div>
        </div>

        <div 
          className="relative bg-gray-900 border-4 border-green-600 rounded-lg"
          style={{ 
            width: GRID_SIZE * CELL_SIZE, 
            height: GRID_SIZE * CELL_SIZE 
          }}
        >
          {snake.map((segment, i) => (
            <div
              key={i}
              className={`absolute ${i === 0 ? 'bg-green-400' : 'bg-green-500'} rounded-sm`}
              style={{
                left: segment[0] * CELL_SIZE,
                top: segment[1] * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2
              }}
            />
          ))}
          
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              left: food[0] * CELL_SIZE,
              top: food[1] * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2
            }}
          />

          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
                <p className="text-2xl text-white mb-6">Final Score: {score}</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h2 className="text-4xl font-bold text-white">PAUSED</h2>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-gray-700">
          <p className="mb-2">Use arrow keys to control the snake</p>
          <p className="text-sm">Press SPACE to pause/resume</p>
        </div>
      </div>
    </div>
  );
}