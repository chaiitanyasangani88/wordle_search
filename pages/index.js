import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

export default function Home() {
  const [knownLetters, setKnownLetters] = useState(['', '', '', '', '']); // Position-specific letters
  const [knownLettersWithoutPos, setKnownLettersWithoutPos] = useState(''); // Letters that exist but position unknown
  const [excludedLetters, setExcludedLetters] = useState(''); // Letters that don&apos;t exist
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  const handleSearch = useCallback(async () => {
    // Build the search query
    let pattern = '';
    let requiredChars = [];
    
    // Build pattern from known letters (use _ for unknown positions)
    pattern = knownLetters.map(letter => letter || '_').join('');
    
    // Add known letters without positions to required characters
    if (knownLettersWithoutPos) {
      requiredChars = [...new Set(knownLettersWithoutPos.toUpperCase().split(''))];
    }

    // If no search criteria, clear results and return
    if (!knownLetters.some(l => l) && !knownLettersWithoutPos && !excludedLetters) {
      setResults([]);
      setResultCount(0);
      return;
    }

    // If we have a pattern with known letters, search by pattern first
    if (pattern.includes('_') || knownLetters.some(l => l)) {
      setIsLoading(true);
      try {
        // First, search by pattern only
        const patternResponse = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: pattern,
            advanced: false
          }),
        });

        const patternData = await patternResponse.json();
        
        if (patternData.error) {
          console.error('Pattern search error:', patternData.error);
          return;
        }

        let filteredResults = patternData.results;

        // Apply contains constraint filter
        if (requiredChars.length > 0) {
          filteredResults = filteredResults.filter(word => {
            const wordUpper = word.toUpperCase();
            return requiredChars.every(char => wordUpper.includes(char));
          });
        }

        // Apply excluded letters filter
        if (excludedLetters) {
          const excluded = excludedLetters.toUpperCase().split('');
          filteredResults = filteredResults.filter(word => 
            !excluded.some(letter => word.toUpperCase().includes(letter))
          );
        }

        setResults(filteredResults);
        setResultCount(filteredResults.length);

      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If no pattern specified, search by contains constraint only
      if (requiredChars.length > 0) {
        setIsLoading(true);
        try {
          const containsResponse = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: '_____', // All 5-letter words
              advanced: false
            }),
          });

          const containsData = await containsResponse.json();
          
          if (containsData.error) {
            console.error('Contains search error:', containsData.error);
            return;
          }

          let filteredResults = containsData.results;

          // Apply contains constraint filter
          if (requiredChars.length > 0) {
            filteredResults = filteredResults.filter(word => {
              const wordUpper = word.toUpperCase();
              return requiredChars.every(char => wordUpper.includes(char));
            });
          }

          // Apply excluded letters filter
          if (excludedLetters) {
            const excluded = excludedLetters.toUpperCase().split('');
            filteredResults = filteredResults.filter(word => 
              !excluded.some(letter => word.toUpperCase().includes(letter))
            );
          }

          setResults(filteredResults);
          setResultCount(filteredResults.length);

        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [knownLetters, knownLettersWithoutPos, excludedLetters]);

  // Real-time search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  const handleKnownLetterChange = (index, value) => {
    const newKnownLetters = [...knownLetters];
    newKnownLetters[index] = value.toUpperCase();
    setKnownLetters(newKnownLetters);
  };

  const clearAll = () => {
    setKnownLetters(['', '', '', '', '']);
    setKnownLettersWithoutPos('');
    setExcludedLetters('');
    setResults([]);
    setResultCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Word Search - Find 5-Letter Words</title>
        <meta name="description" content="Search for 5-letter words with advanced filtering options" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Word Search
          </h1>
          <p className="text-lg text-gray-600">
            Find 5-letter words with advanced pattern matching
          </p>
        </div>

        <div className="flex gap-8">
          {/* Left Panel - Search Controls */}
          <div className="w-1/2 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Search Criteria</h2>
            
            {/* Known letters with positions */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700">Known Letters (With Positions)</h3>
              <p className="text-sm text-gray-500 mb-4">Enter letters you know and their exact positions</p>
              
              <div className="flex gap-3 mb-4">
                {knownLetters.map((letter, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={letter}
                    onChange={(e) => handleKnownLetterChange(index, e.target.value)}
                    placeholder="_"
                    className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase text-gray-900"
                  />
                ))}
              </div>
              
              <div className="text-sm text-gray-500">
                Current pattern: 
                <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">
                  {knownLetters.map(letter => letter || '_').join('')}
                </span>
              </div>
            </div>

            {/* Known letters without positions */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700">Known Letters (Position Unknown)</h3>
              <p className="text-sm text-gray-500 mb-4">Enter letters you know exist in the word but don&apos;t know where</p>
              
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={knownLettersWithoutPos}
                  onChange={(e) => setKnownLettersWithoutPos(e.target.value.toUpperCase())}
                  placeholder="e.g., E, A, T"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg uppercase text-gray-900"
                />
                <div className="text-sm text-gray-500">
                  {knownLettersWithoutPos && (
                    <span>Contains: {knownLettersWithoutPos.split('').join(', ')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Excluded letters */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700">Excluded Letters</h3>
              <p className="text-sm text-gray-500 mb-4">Enter letters that you know are NOT in the word</p>
              
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={excludedLetters}
                  onChange={(e) => setExcludedLetters(e.target.value.toUpperCase())}
                  placeholder="e.g., X, Y, Z"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg uppercase text-gray-900"
                />
                <div className="text-sm text-gray-500">
                  {excludedLetters && (
                    <span>Excludes: {excludedLetters.split('').join(', ')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Clear button only (search is automatic) */}
            <div className="flex justify-center">
              <button
                onClick={clearAll}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="w-1/2 bg-gray-50 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {(knownLetters.some(l => l) || knownLettersWithoutPos || excludedLetters) ? 
                  `Results ${resultCount > 0 ? `(${resultCount})` : ''}` : 
                  'Results'
                }
              </h2>
              {isLoading && (
                <div className="text-sm text-blue-600">Searching...</div>
              )}
            </div>

            {/* Results Display */}
            {(knownLetters.some(l => l) || knownLettersWithoutPos || excludedLetters) ? (
              results.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {results.map((word, index) => (
                    <div
                      key={index}
                      className="bg-white text-green-800 px-3 py-2 rounded-lg text-center font-medium hover:bg-green-50 transition-colors cursor-pointer text-sm border shadow-sm"
                      title={word}
                    >
                      {word.toUpperCase()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-20">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="text-lg">Searching...</div>
                      <div className="text-sm mt-2">Finding matching words</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg">No matches found</div>
                      <div className="text-sm mt-2">Try adjusting your search criteria</div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-lg">Enter search criteria to find words</div>
                <div className="text-sm mt-2">
                  Pattern: {knownLetters.map(l => l || '_').join('')}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
