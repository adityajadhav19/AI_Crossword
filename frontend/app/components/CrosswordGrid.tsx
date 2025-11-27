// frontend/app/components/CrosswordGrid.tsx - FINAL, FULLY INTERACTIVE VERSION
'use client';

import React, { useEffect, useRef } from 'react';

// Define types for our data
type Grid = (string | '')[][];
interface Word {
  word: string;
  number: number;
  orientation: 'across' | 'down';
  start_row: number;
  start_col: number;
}
interface CrosswordGridProps {
  grid: Grid | null;
  placedWords: Word[] | null;
  userAnswers: Grid | null;
  results: Grid | null;
  onInputChange: (row: number, col: number, value: string) => void;
  activeClue: Word | null;
  setActiveClue: (clue: Word | null) => void;
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  placedWords,
  userAnswers,
  results,
  onInputChange,
  activeClue,
  setActiveClue,
}) => {
  if (!grid) return null;

  const rows = grid.length;
  const cols = grid[0].length;
  // Create a ref to hold an array of all input elements
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: rows }, () => Array(cols).fill(null))
  );

  // A map to find the number for a given cell coordinate
  const numberMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (placedWords) {
      placedWords.forEach(word => {
        if (word.number > 0) {
          map.set(`${word.start_row}-${word.start_col}`, word.number);
        }
      });
    }
    return map;
  }, [placedWords]);

  // When a user clicks a cell, find the word it belongs to and set it as active
  const handleCellClick = (r: number, c: number) => {
    const clickedWord = placedWords?.find(w => {
      if (w.orientation === 'across') {
        return r === w.start_row && c >= w.start_col && c < w.start_col + w.word.length;
      }
      if (w.orientation === 'down') {
        return c === w.start_col && r >= w.start_row && r < w.start_row + w.word.length;
      }
      return false;
    });
    if (clickedWord) {
      setActiveClue(clickedWord);
    }
  };

  // Handles typing and automatically moves the cursor forward
  const handleLocalInputChange = (r: number, c: number, value: string) => {
    onInputChange(r, c, value); // Update the state in the parent component

    // If a character was typed and there's an active clue, move to the next cell
    if (value && activeClue) {
      let nextR = r, nextC = c;
      if (activeClue.orientation === 'across') {
        nextC = c + 1;
        // Don't move past the end of the word
        if (nextC >= activeClue.start_col + activeClue.word.length) return;
      } else { // 'down'
        nextR = r + 1;
        // Don't move past the end of the word
        if (nextR >= activeClue.start_row + activeClue.word.length) return;
      }

      // Focus the next input if it's within the grid
      if (nextR < rows && nextC < cols && grid[nextR][nextC]) {
        inputRefs.current[nextR][nextC]?.focus();
      }
    }
  };
  
  // Handles arrow keys and backspace navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    const key = e.key;

    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      e.preventDefault();
      let nextR = r, nextC = c;
      if (key === 'ArrowUp') nextR--;
      if (key === 'ArrowDown') nextR++;
      if (key === 'ArrowLeft') nextC--;
      if (key === 'ArrowRight') nextC++;

      // Ensure the next cell is within bounds
      if (nextR >= 0 && nextR < rows && nextC >= 0 && nextC < cols && grid[nextR][nextC]) {
        inputRefs.current[nextR][nextC]?.focus();
      }
    } else if (key === 'Backspace' && userAnswers?.[r]?.[c] === '') {
      e.preventDefault();
      let prevR = r, prevC = c;
      if (activeClue?.orientation === 'across') {
        prevC = c - 1;
      } else { // 'down'
        prevR = r - 1;
      }
      if (prevR >= 0 && prevC >= 0) {
        inputRefs.current[prevR][prevC]?.focus();
        onInputChange(prevR, prevC, ''); // Also clear the previous cell's content
      }
    }
  };

  return (
    <div className="grid-container" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isCellEmpty = !cell || cell.trim() === '';
          const result = results?.[r]?.[c];
          
          let cellClass = `cell ${isCellEmpty ? 'empty' : 'filled'}`;
          if (result === 'correct') cellClass += ' correct';
          if (result === 'incorrect') cellClass += ' incorrect';

          // Highlight the active clue
          if (activeClue) {
            const { start_row, start_col, orientation, word } = activeClue;
            if (orientation === 'across' && r === start_row && c >= start_col && c < start_col + word.length) {
              cellClass += ' highlight';
            }
            if (orientation === 'down' && c === start_col && r >= start_row && r < start_row + word.length) {
              cellClass += ' highlight';
            }
          }

          const wordNumber = numberMap.get(`${r}-${c}`);
          return (
            <div key={`${r}-${c}`} className="cell-container" onClick={() => handleCellClick(r, c)}>
              {!isCellEmpty && wordNumber && (<span className="cell-number">{wordNumber}</span>)}
              <input
                ref={el => (inputRefs.current[r][c] = el)}
                type="text"
                maxLength={1}
                disabled={isCellEmpty}
                className={cellClass}
                value={userAnswers?.[r]?.[c] || ''}
                onChange={e => handleLocalInputChange(r, c, e.target.value)}
                onKeyDown={e => handleKeyDown(e, r, c)}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default CrosswordGrid;
