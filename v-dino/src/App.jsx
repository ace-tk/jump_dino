import React, { useState, useEffect, useRef, useCallback } from 'react';

const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('dinoHighScore')) || 0;
  });

  const [isJumping, setIsJumping] = useState(false);
  const [dinoBottom, setDinoBottom] = useState(40); // In percent (%)
  const [obstacleRight, setObstacleRight] = useState(-100); // Start off-screen
  const [clouds, setClouds] = useState([]);

  const gameRunningRef = useRef(false);
  const scoreRef = useRef(0);
  const obstaclePositionRef = useRef(900);
  const dinoPositionRef = useRef(0); // Jump height
  const requestRef = useRef();
  const lastTimeRef = useRef();

  const GRAVITY = 7.5;
  const JUMP_HEIGHT = 150;
  const BASE_SPEED = 7;
  const CLOUD_SPAWN_INTERVAL = 3000;

  // Jump Logic
  const jump = useCallback(() => {
    if (isJumping || !gameRunningRef.current || gameOver) return;
    
    setIsJumping(true);
    let position = 0;
    
    const upInterval = setInterval(() => {
      if (position >= JUMP_HEIGHT) {
        clearInterval(upInterval);
        const downInterval = setInterval(() => {
          if (position <= 0) {
            clearInterval(downInterval);
            setIsJumping(false);
            position = 0;
            setDinoBottom(40);
            dinoPositionRef.current = 40;
          } else {
            position -= GRAVITY;
            if (position < 0) position = 0;
            setDinoBottom(40 + position);
            dinoPositionRef.current = 40 + position;
          }
        }, 15);
      } else {
        position += GRAVITY;
        setDinoBottom(40 + position);
        dinoPositionRef.current = 40 + position;
      }
    }, 15);
  }, [isJumping, gameOver]);

  // Start Game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    setObstacleRight(0);
    obstaclePositionRef.current = 900;
    gameRunningRef.current = true;
    
    // Initial clouds
    const initialClouds = [];
    for (let i = 0; i < 5; i++) {
      initialClouds.push(createCloudData(Math.random() * 900));
    }
    setClouds(initialClouds);
  };

  const createCloudData = (x = 900) => ({
    id: Math.random(),
    x,
    y: Math.random() * 150 + 20,
    size: Math.random() * 30 + 50,
    type: Math.floor(Math.random() * 3) + 1,
    speed: Math.random() * 2 + 1,
  });

  // End Game
  const endGame = useCallback(() => {
    gameRunningRef.current = false;
    setGameOver(true);
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('dinoHighScore', scoreRef.current);
    }
  }, [highScore]);

  // Game Loop
  const update = useCallback((time) => {
    if (gameRunningRef.current && !gameOver) {
      const speed = BASE_SPEED + Math.floor(scoreRef.current / 10) * 0.5;
      
      // Update obstacle
      obstaclePositionRef.current -= speed;
      if (obstaclePositionRef.current <= -100) {
        obstaclePositionRef.current = 900;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
      setObstacleRight(900 - obstaclePositionRef.current);

      // Collision Detection
      // Simplified: Dino is at left: 50px, width: 94px. Obstacle is at right: (900-pos), width: 77px.
      // Better to use bounding rects like the original, but we can't easily do that every frame in React without refs.
      // Actually, we SHOULD use refs for collision detection for accuracy.
      
      const dinoEl = document.getElementById('dino');
      const obstacleEl = document.getElementById('obstacle');
      
      if (dinoEl && obstacleEl) {
        const dinoRect = dinoEl.getBoundingClientRect();
        const obstacleRect = obstacleEl.getBoundingClientRect();
        
        if (
          dinoRect.right > obstacleRect.left + 10 &&
          dinoRect.left < obstacleRect.right - 10 &&
          dinoRect.bottom > obstacleRect.top + 10 &&
          dinoRect.top < obstacleRect.bottom - 10
        ) {
          endGame();
        }
      }

      // Update clouds
      setClouds(prev => prev.map(c => ({ ...c, x: c.x - c.speed }))
                             .filter(c => c.x > -200));
    }
    requestRef.current = requestAnimationFrame(update);
  }, [gameOver, endGame]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  // Cloud Spawning
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRunningRef.current && !gameOver) {
        setClouds(prev => [...prev, createCloudData()]);
      }
    }, CLOUD_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!gameStarted) {
          startGame();
        } else if (gameRunningRef.current) {
          jump();
        }
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, jump]);

  return (
    <div className="game-container" id="gameContainer">
      <div className="sky"></div>
      
      <div className="clouds-container" id="cloudsContainer">
        {clouds.map(cloud => (
          <div 
            key={cloud.id}
            className={`cloud cloud${cloud.type}`}
            style={{
              width: `${cloud.size}px`,
              height: `${cloud.size * 0.4}px`,
              left: `${cloud.x}px`,
              top: `${cloud.y}%`
            }}
          />
        ))}
      </div>
      
      <div className="ground">
        <div className="ground-texture"></div>
      </div>
      
      <div 
        className="dino" 
        id="dino" 
        style={{ bottom: `${dinoBottom}%` }}
      ></div>
      
      <div 
        className="obstacle" 
        id="obstacle" 
        style={{ right: `${obstacleRight}px` }}
      ></div>
      
      <div className="score-container">
        <p id="score">Score: {score}</p>
        <p id="highScore">High Score: {highScore}</p>
      </div>
      
      {gameOver && (
        <div className="game-over-overlay show" id="gameOverOverlay">
          <div className="game-over-content">
            <h2>Game Over!</h2>
            <p className="final-score">Final Score: <span id="finalScore">{score}</span></p>
            <p className="high-score-display">High Score: <span id="highScoreDisplay">{highScore}</span></p>
            <button className="restart-btn" id="restartBtn" onClick={startGame}>Restart Game</button>
            <p className="instructions-text">Press Space or ↑ to jump</p>
          </div>
        </div>
      )}
      
      {!gameStarted && (
        <div className="start-screen" id="startScreen">
          <div className="start-content">
            <h1>🦖 Dino Jump</h1>
            <p>Press Space or ↑ to jump</p>
            <p>Avoid the cacti!</p>
            <button className="start-btn" id="startBtn" onClick={startGame}>Start Game</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
