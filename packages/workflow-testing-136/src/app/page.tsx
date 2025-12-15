'use client';

import { useEffect, useRef, useState } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const pacmanRef = useRef<Position>({ x: 10, y: 10 });
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const dotsRef = useRef<boolean[][]>([]);
  const ghostsRef = useRef<Position[]>([
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 5, y: 15 },
    { x: 15, y: 15 }
  ]);

  // Initialize dots
  useEffect(() => {
    const dots: boolean[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      dots[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        dots[y][x] = true;
      }
    }
    dotsRef.current = dots;
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        setGameStarted(true);
      }
      
      switch (e.key) {
        case 'ArrowUp':
          nextDirectionRef.current = 'UP';
          break;
        case 'ArrowDown':
          nextDirectionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
          nextDirectionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
          nextDirectionRef.current = 'RIGHT';
          break;
        case ' ':
          if (gameOver) {
            resetGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, gameStarted]);

  const resetGame = () => {
    pacmanRef.current = { x: 10, y: 10 };
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    ghostsRef.current = [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 5, y: 15 },
      { x: 15, y: 15 }
    ];
    const dots: boolean[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      dots[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        dots[y][x] = true;
      }
    }
    dotsRef.current = dots;
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update direction
      directionRef.current = nextDirectionRef.current;

      // Move Pac-Man
      const newPos = { ...pacmanRef.current };
      switch (directionRef.current) {
        case 'UP':
          newPos.y = (newPos.y - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'DOWN':
          newPos.y = (newPos.y + 1) % GRID_SIZE;
          break;
        case 'LEFT':
          newPos.x = (newPos.x - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'RIGHT':
          newPos.x = (newPos.x + 1) % GRID_SIZE;
          break;
      }
      pacmanRef.current = newPos;

      // Check for dot collision
      if (dotsRef.current[newPos.y]?.[newPos.x]) {
        dotsRef.current[newPos.y][newPos.x] = false;
        setScore(s => s + 10);
      }

      // Move ghosts towards Pac-Man
      ghostsRef.current = ghostsRef.current.map(ghost => {
        const newGhost = { ...ghost };
        if (Math.random() > 0.3) {
          if (Math.abs(pacmanRef.current.x - ghost.x) > Math.abs(pacmanRef.current.y - ghost.y)) {
            if (pacmanRef.current.x > ghost.x) newGhost.x++;
            else if (pacmanRef.current.x < ghost.x) newGhost.x--;
          } else {
            if (pacmanRef.current.y > ghost.y) newGhost.y++;
            else if (pacmanRef.current.y < ghost.y) newGhost.y--;
          }
        }
        newGhost.x = (newGhost.x + GRID_SIZE) % GRID_SIZE;
        newGhost.y = (newGhost.y + GRID_SIZE) % GRID_SIZE;
        return newGhost;
      });

      // Check for ghost collision
      for (const ghost of ghostsRef.current) {
        if (ghost.x === pacmanRef.current.x && ghost.y === pacmanRef.current.y) {
          setGameOver(true);
          break;
        }
      }

      // Draw game
      draw();
    }, INITIAL_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dots
    ctx.fillStyle = '#fff';
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (dotsRef.current[y]?.[x]) {
          ctx.beginPath();
          ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Draw Pac-Man
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    const mouthAngle = 0.2 * Math.PI;
    let startAngle = mouthAngle;
    let endAngle = 2 * Math.PI - mouthAngle;
    
    switch (directionRef.current) {
      case 'RIGHT':
        startAngle = mouthAngle;
        endAngle = 2 * Math.PI - mouthAngle;
        break;
      case 'LEFT':
        startAngle = Math.PI + mouthAngle;
        endAngle = Math.PI - mouthAngle;
        break;
      case 'UP':
        startAngle = Math.PI * 1.5 + mouthAngle;
        endAngle = Math.PI * 1.5 - mouthAngle;
        break;
      case 'DOWN':
        startAngle = Math.PI * 0.5 + mouthAngle;
        endAngle = Math.PI * 0.5 - mouthAngle;
        break;
    }
    
    ctx.arc(
      pacmanRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      pacmanRef.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      startAngle,
      endAngle
    );
    ctx.lineTo(
      pacmanRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      pacmanRef.current.y * CELL_SIZE + CELL_SIZE / 2
    );
    ctx.fill();

    // Draw ghosts
    const ghostColors = ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852'];
    ghostsRef.current.forEach((ghost, i) => {
      ctx.fillStyle = ghostColors[i];
      ctx.beginPath();
      ctx.arc(
        ghost.x * CELL_SIZE + CELL_SIZE / 2,
        ghost.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Ghost eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ghost.x * CELL_SIZE + CELL_SIZE / 2 - 3, ghost.y * CELL_SIZE + CELL_SIZE / 2 - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ghost.x * CELL_SIZE + CELL_SIZE / 2 + 3, ghost.y * CELL_SIZE + CELL_SIZE / 2 - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Initial draw
  useEffect(() => {
    draw();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">PAC-MAN</h1>
      <div className="mb-4 text-2xl">Score: {score}</div>
      
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border-4 border-blue-500 bg-black"
      />
      
      {!gameStarted && !gameOver && (
        <div className="mt-4 text-center">
          <p className="text-xl">Press arrow keys to start!</p>
        </div>
      )}
      
      {gameOver && (
        <div className="mt-4 text-center">
          <p className="text-2xl text-red-500 mb-2">Game Over!</p>
          <p className="text-xl mb-2">Final Score: {score}</p>
          <p className="text-lg">Press SPACE to restart</p>
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Use arrow keys to move</p>
        <p>Eat all dots and avoid the ghosts!</p>
      </div>
    </div>
  );
}

