import React, { useState, useEffect, useRef } from "react";
import Board from "./Board";
import "./App.css";
import Confetti from "react-confetti";

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [gameActive, setGameActive] = useState(true);
  const [message, setMessage] = useState("Player X's turn");
  const [difficulty, setDifficulty] = useState("medium"); // Default to medium
  const [showConfetti, setShowConfetti] = useState(false);
  const boardRef = useRef(null);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [winner, setWinner] = useState(null);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Helper functions
  const checkWin = (currentBoard) => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      // Check if any of the cells are null OR if the values don't match
      if (
        !currentBoard[a] ||
        !currentBoard[b] ||
        !currentBoard[c] ||
        currentBoard[a].value !== currentBoard[b].value ||
        currentBoard[a].value !== currentBoard[c].value
      ) {
        continue; // Skip this combination
      }
      return currentBoard[a].value; // Return the winner (X or O)
    }
    return null; // No winner
  };

  const isDraw = (currentBoard) => {
    return (
      currentBoard.every((cell) => cell !== null) && !checkWin(currentBoard)
    );
  };

  const isGameOver = (currentBoard) => {
    return checkWin(currentBoard) || isDraw(currentBoard);
  };

  // Minimax Algorithm
  const minimax = (currentBoard, depth, isMaximizing) => {
    const winner = checkWin(currentBoard);

    if (winner) {
      return winner === "O" ? 1 : -1; // O (AI) wins: +1, X (Player) wins: -1
    }
    if (isDraw(currentBoard)) {
      return 0; // Draw: 0
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = { value: "O" };
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null; // Undo the move
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = { value: "X" };
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null; // Undo the move
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // AI Move using Minimax
  const makeAIMove = () => {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let bestMove;
    let moves = [];

    // Easy mode: Random moves
    if (difficulty === "easy") {
      const emptyCells = board.reduce((acc, cell, index) => {
        if (cell === null) {
          acc.push(index);
        }
        return acc;
      }, []);
      bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      handleClick(bestMove, "ai");
      return;
    }

    //Hard and medium mode: Minimax or sometimes random
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = { value: "O" };
        const score = minimax(board, 0, false);
        board[i] = null; // Undo the move
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
        if (difficulty === "medium") {
          moves.push({ index: i, score: score });
        }
      }
    }

    //Medium mode: sometimes do random moves
    if (difficulty === "medium" && Math.random() < 0.3) {
      const emptyCells = board.reduce((acc, cell, index) => {
        if (cell === null) {
          acc.push(index);
        }
        return acc;
      }, []);
      bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    handleClick(bestMove, "ai");
  };

  // Effect to trigger AI move after player's move
  useEffect(() => {
    if (gameActive && currentPlayer === "O") {
      // Delay the AI's move for a more natural feel
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500); // 0.5 second delay
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameActive, difficulty]);

  useEffect(() => {
    if (boardRef.current) {
      setBoardSize({
        width: boardRef.current.offsetWidth,
        height: boardRef.current.offsetHeight,
      });
    }
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (index, cellType) => {
    if (board[index] || !gameActive) return;

    const newBoard = [...board];
    newBoard[index] = { value: currentPlayer, cellType: cellType };
    setBoard(newBoard);

    const winner = checkWin(newBoard);
    if (winner) {
      setMessage(`Player ${winner} wins!`);
      setGameActive(false);
      setShowConfetti(true);
      setWinner(winner);
      return;
    }

    if (isDraw(newBoard)) {
      setMessage("It's a draw!");
      setGameActive(false);
      return;
    }

    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    setMessage(`Player ${currentPlayer === "X" ? "O" : "X"}'s turn`);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setGameActive(true);
    setMessage("Player X's turn");
    setShowConfetti(false);
    setWinner(null);
  };

  return (
    <div className="app">
      <h1>Tic Tac Toe</h1>
      <div>
        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div ref={boardRef}>
        <Board board={board} handleClick={handleClick} />
      </div>
      {showConfetti && (
        <div className="confetti-container">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={winner === "O" ? 400 : 200}
          />
        </div>
      )}
      <div className="message">{message}</div>
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
}

export default App;
