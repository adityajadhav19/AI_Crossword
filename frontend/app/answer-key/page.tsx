// frontend/app/answer-key/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AnswerGrid from '../components/AnswerGrid'; // We'll create this next

type Grid = (string | '')[][];

export default function AnswerKeyPage() {
  const [solutionGrid, setSolutionGrid] = useState<Grid | null>(null);

  useEffect(() => {
    // This code runs when the page loads
    // It retrieves the grid data that we saved from the main page
    const savedGrid = sessionStorage.getItem('crosswordSolution');
    if (savedGrid) {
      setSolutionGrid(JSON.parse(savedGrid));
    }
  }, []);

  return (
    <main>
      <div className="title-section">
        <h1>Crossword Answer Key</h1>
      </div>
      
      {solutionGrid ? (
        <div className="grid-and-actions">
          <AnswerGrid grid={solutionGrid} />
        </div>
      ) : (
        <p>No answer key found. Please generate a puzzle first.</p>
      )}
    </main>
  );
}