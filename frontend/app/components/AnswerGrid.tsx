// frontend/app/components/AnswerGrid.tsx
'use client';

import React from 'react';

type Grid = (string | '')[][];
interface AnswerGridProps {
  grid: Grid;
}

const AnswerGrid: React.FC<AnswerGridProps> = ({ grid }) => {
  return (
    <div className="grid-container" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isCellEmpty = !cell || cell.trim() === '';
          const cellClass = `cell ${isCellEmpty ? 'empty' : 'filled'}`;

          return (
            <div key={`${r}-${c}`} className={cellClass}>
              {isCellEmpty ? '' : cell}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AnswerGrid;
