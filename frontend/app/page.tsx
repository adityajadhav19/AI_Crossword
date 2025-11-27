// frontend/app/page.tsx - FINAL VERIFIED VERSION
'use client';
import React, { useState, useMemo } from 'react';
import axios from 'axios';
import CrosswordGrid from './components/CrosswordGrid';

type Grid = (string | '')[][];
interface Word { word: string; number: number; orientation: 'across' | 'down'; start_row: number; start_col: number; clue?: string; }

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [grid, setGrid] = useState<Grid | null>(null);
  const [clues, setClues] = useState<Record<string, string> | null>(null);
  const [placedWords, setPlacedWords] = useState<Word[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Grid | null>(null);
  const [results, setResults] = useState<Grid | null>(null);
  const [activeClue, setActiveClue] = useState<Word | null>(null);
  const [summary, setSummary] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setFile(e.target.files[0]); };

  const handleGeneratePuzzle = async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setIsLoading(true); setError(''); setGrid(null); setSummary('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/upload-pdf/', formData);
      const data = response.data;
      setGrid(data.grid); setClues(data.clues); setPlacedWords(data.placed_words);
      setUserAnswers(data.grid.map((row: string[]) => row.map(() => '')));
      setResults(data.grid.map((row: string[]) => row.map(() => '')));
      setActiveClue(null);
    } catch (err) { setError('Failed to generate puzzle. Please check the backend server.');
    } finally { setIsLoading(false); }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!userAnswers) return;
    const newUserAnswers = userAnswers.map(r => [...r]);
    newUserAnswers[row][col] = value.slice(-1).toUpperCase();
    setUserAnswers(newUserAnswers);
  };

  // --- NEW WORD-BASED CHECKING LOGIC ---
  const handleCheckAnswers = () => {
    if (!placedWords || !userAnswers) return;

    let correctWordCount = 0;
    let incorrectWordCount = 0;
    const newResults = grid ? grid.map(row => row.map(() => '')) : [];

    placedWords.forEach(word => {
      let userWord = '';
      let isAttempted = false;

      // Extract the user's word from the grid
      for (let i = 0; i < word.word.length; i++) {
        let r = word.start_row;
        let c = word.start_col;
        if (word.orientation === 'across') {
          c += i;
        } else {
          r += i;
        }
        const char = userAnswers[r][c] || ' ';
        userWord += char;
        if (char !== ' ') {
          isAttempted = true; // The user has typed at least one letter for this word
        }
      }

      if (isAttempted) {
        const wordStatus = userWord.trim().toUpperCase() === word.word.toUpperCase() ? 'correct' : 'incorrect';
        
        if (wordStatus === 'correct') {
          correctWordCount++;
        } else {
          incorrectWordCount++;
        }
        
        // Apply the status to all cells for this word
        for (let i = 0; i < word.word.length; i++) {
          let r = word.start_row;
          let c = word.start_col;
          if (word.orientation === 'across') {
            c += i;
          } else {
            r += i;
          }
          newResults[r][c] = wordStatus;
        }
      }
    });

    setResults(newResults);
    setSummary(`Correct Words: ${correctWordCount}, Incorrect Words: ${incorrectWordCount}`);
  };

  const handleReset = () => { 
    if (grid) { 
      setUserAnswers(grid.map(row => row.map(() => ''))); 
      setResults(grid.map(row => row.map(() => ''))); 
      setSummary('');
    } 
  };

  // Function to handle clicking the Sign In button
  const handleSignInClick = () => {
    // This is a simple browser command that sends the user to the /auth page
    window.location.href = '/auth'; 
  };

  const handleShowAnswers = () => {
    if (!placedWords || !grid) return;
    const answers = grid.map(row => [...row]);
    setUserAnswers(answers);
    const newResults = grid.map(row => row.map(() => 'correct'));
    setResults(newResults);
  };

  const handleDownloadPDF = async () => {
    // Placeholder implementation for PDF download
    console.log('Download PDF functionality to be implemented');
  };
  
  const { acrossClues, downClues } = useMemo(() => {
    const across: Word[] = [], down: Word[] = [];
    if (placedWords && clues) {
      placedWords.forEach(word => {
        if (word.number > 0) {
          const clueText = clues[word.word];
          if (clueText) { word.orientation === 'across' ? across.push({ ...word, clue: clueText }) : down.push({ ...word, clue: clueText }); }
        }
      });
    }
    return { acrossClues: across.sort((a, b) => a.number - b.number), downClues: down.sort((a, b) => a.number - b.number) };
  }, [clues, placedWords]);

  return (
    // The outermost container (it does NOT have 'relative' so the button will float above the content)
    <div className="min-h-screen bg-gray-50 font-inter"> 
      
      {/* --------------------- 1. SIGN IN BUTTON BAR --------------------- */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-end">
          <button 
            onClick={handleSignInClick} 
            // Using strong, visible styling for the button
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out shadow-lg"
          >
            Sign In
          </button>
        </div>
      </div>
      {/* ----------------------------------------------------------------- */}

      {/* Essential Styles for Grid - kept inside the main component */}
      <style jsx global>{`
        .crossword-grid {
          max-width: 500px;
          margin: 0 auto;
          aspect-ratio: 1 / 1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .cell {
          min-width: 30px;
          min-height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
          user-select: none;
          transition: background-color 0.1s ease;
        }
        .cell input {
          text-align: center;
          padding: 0;
          margin: 0;
        }
        .active-cell {
          z-index: 10;
        }
        .clue-list li {
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .clue-list li:hover, .clue-list li.active {
          background-color: #eef2ff;
          font-weight: 600;
        }
      `}</style>
      
      {/* --------------------- 2. MAIN PUZZLE CONTENT -------------------- */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">

        <div className="title-section text-center mb-8 pt-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">AI-Based PDF to Crossword Converter</h1>
          <p className="text-lg text-gray-600 mb-6">Upload a PDF to automatically generate a playable crossword puzzle.</p>
          <div className="flex flex-col items-center justify-center space-y-4">
            <input 
              type="file" 
              id="file-upload" 
              onChange={handleFileChange} 
              accept=".pdf" 
              className="block w-full max-w-sm text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
            />
            <button 
              onClick={handleGeneratePuzzle} 
              disabled={isLoading}
              className="w-full max-w-sm px-6 py-3 rounded-xl text-white font-semibold shadow-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition duration-150 ease-in-out"
            >
              {isLoading ? 'Generating...' : 'Generate Puzzle'}
            </button>
          </div>
          {error && <p className="error-message text-red-500 mt-4 font-medium">{error}</p>}
          {isLoading && <div className="summary-display text-indigo-600 mt-4 font-medium">Processing request...</div>}
        </div>

        {grid && userAnswers && results && (
          <div className="puzzle-container flex flex-col lg:flex-row justify-center lg:space-x-8 mt-10">
            
            <div className="grid-and-actions w-full lg:w-1/3 mb-8 lg:mb-0">
              <CrosswordGrid 
                grid={grid} 
                placedWords={placedWords} 
                userAnswers={userAnswers} 
                results={results} 
                onInputChange={handleInputChange} 
                activeClue={activeClue} 
                setActiveClue={setActiveClue} 
              />
              <div className="summary-display text-center text-lg font-semibold mt-4 text-gray-800">{summary}</div>
              <div className="action-buttons flex flex-wrap justify-center space-x-2 mt-4">
                <button onClick={handleCheckAnswers} className="btn check bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition">Check Answers</button>
                <button onClick={handleReset} className="btn reset bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition">Reset</button>
                <button onClick={handleShowAnswers} className="btn show-answers bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition">Show Answers</button>
                <button onClick={handleDownloadPDF} className="btn download-pdf bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition" disabled={isLoading}>
                  {isLoading ? 'Downloading...' : 'Download PDF'}
                </button> 
              </div>
            </div>

            <div className="clues-container w-full lg:w-1/3 p-6 bg-white rounded-xl shadow-lg">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Across Clues</h2>
                  <ul className='clue-list text-sm text-gray-700 space-y-1'>
                    {acrossClues.map(w => <li 
                      key={`a-${w.number}`} 
                      onClick={() => setActiveClue(w)} 
                      className={activeClue?.number === w.number && activeClue.orientation === 'across' ? 'active bg-indigo-50 border border-indigo-200' : ''}
                    >
                      <strong>{w.number}.</strong> {w.clue}
                    </li>)}
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Down Clues</h2>
                  <ul className='clue-list text-sm text-gray-700 space-y-1'>
                    {downClues.map(w => <li 
                      key={`d-${w.number}`} 
                      onClick={() => setActiveClue(w)} 
                      className={activeClue?.number === w.number && activeClue.orientation === 'down' ? 'active bg-indigo-50 border border-indigo-200' : ''}
                    >
                      <strong>{w.number}.</strong> {w.clue}
                    </li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* ----------------------------------------------------------------- */}

    </div>
  );
}