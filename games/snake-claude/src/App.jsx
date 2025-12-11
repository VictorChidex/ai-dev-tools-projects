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
  const [wallMode, setWallMode] = useState(true);

  // Utility function: Generate food
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

  // Utility function: Handle wall collision
  function handleWallCollision(newHead) {
    if (wallMode) {
      // Wall mode: Game over on collision
      if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
        return { collision: true, head: newHead };
      }
    } else {
      // Pass-through mode: Wrap around edges
      if (newHead[0] < 0) newHead[0] = GRID_SIZE - 1;
      if (newHead[0] >= GRID_SIZE) newHead[0] = 0;
      if (newHead[1] < 0) newHead[1] = GRID_SIZE - 1;
      if (newHead[1] >= GRID_SIZE) newHead[1] = 0;
    }
    return { collision: false, head: newHead };
  }

  // Utility function: Check self collision
  function checkSelfCollision(newHead, snakeBody) {
    return snakeBody.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1]);
  }

  // Utility function: Check food collision
  function checkFoodCollision(newHead, foodPos) {
    return newHead[0] === foodPos[0] && newHead[1] === foodPos[1];
  }

  // Game logic: Reset game
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  }, []);

  // Game logic: Move snake
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead = [head[0] + direction.x, head[1] + direction.y];

      // Handle wall collision
      const { collision: wallCollision, head: adjustedHead } = handleWallCollision(newHead);
      newHead = adjustedHead;

      if (wallCollision) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (checkSelfCollision(newHead, prevSnake)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (checkFoodCollision(newHead, food)) {
        setScore(prev => prev + 5);
        setFood(generateFood(newSnake));
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, wallMode]);

  // Event handlers: Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (gameOver || isPaused) return;

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          e.preventDefault();
          setDirection(prev => prev.y !== 1 ? { x: 0, y: -1 } : prev);
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          setDirection(prev => prev.y !== -1 ? { x: 0, y: 1 } : prev);
          break;
        case 'arrowleft':
        case 'a':
          e.preventDefault();
          setDirection(prev => prev.x !== 1 ? { x: -1, y: 0 } : prev);
          break;
        case 'arrowright':
        case 'd':
          e.preventDefault();
          setDirection(prev => prev.x !== -1 ? { x: 1, y: 0 } : prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused]);

  // Effect: Game loop
  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  // Render
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-green-800">Snake Game</h1>
          <div className="text-2xl font-bold text-green-600">Score: {score}</div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-4">
          <span className="font-semibold text-gray-700">Mode:</span>
          <button
            onClick={() => setWallMode(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              wallMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Walls
          </button>
          <button
            onClick={() => setWallMode(false)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !wallMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pass-Through
          </button>
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
          <p className="mb-2">Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to control the snake</p>
          <p className="text-sm">Press <strong>SPACE</strong> to pause/resume</p>
          <p className="text-sm mt-2">
            <strong>Walls:</strong> Game ends at borders | <strong>Pass-Through:</strong> Wrap around edges
          </p>
        </div>
      </div>
    </div>
  );
}