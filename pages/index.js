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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Head>
        <title>Word Search - Find 5-Letter Words</title>
        <meta name="description" content="Search for 5-letter words with advanced filtering options" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200 to-pink-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <main className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0 px-4 py-2">
              Word Search
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-700 px-2 font-medium">
            Find 5-letter words with advanced pattern matching
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Left Panel - Search Controls */}
          <div className="w-full lg:w-1/2 bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">S</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Search Criteria</h2>
            </div>
            
            {/* Known letters with positions */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">Known Letters (With Positions)</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Enter letters you know and their exact positions</p>
              
              <div className="flex gap-2 sm:gap-3 mb-4 justify-center sm:justify-start">
                {knownLetters.map((letter, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={letter}
                    onChange={(e) => handleKnownLetterChange(index, e.target.value)}
                    placeholder="_"
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-transparent uppercase text-gray-900 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50"
                  />
                ))}
              </div>
              
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                <span className="font-semibold">Current pattern:</span>
                <span className="font-mono bg-white px-3 py-1 rounded ml-2 text-blue-700 font-bold shadow-sm">
                  {knownLetters.map(letter => letter || '_').join('')}
                </span>
              </div>
            </div>

            {/* Known letters without positions */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">Known Letters (Position Unknown)</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Enter letters you know exist in the word but don&apos;t know where</p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <div className="relative w-full sm:flex-1">
                  <input
                    type="text"
                    value={knownLettersWithoutPos}
                    onChange={(e) => setKnownLettersWithoutPos(e.target.value.toUpperCase())}
                    placeholder="e.g., E, A, T"
                    className="w-full sm:flex-1 px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-400 focus:border-transparent text-base sm:text-lg uppercase text-gray-900 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-green-50 hover:from-green-50 hover:to-emerald-50"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 font-bold">✓</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left bg-green-50 p-2 rounded-lg border border-green-200">
                  {knownLettersWithoutPos && (
                    <span className="font-semibold text-green-700">Contains: {knownLettersWithoutPos.split('').join(', ')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Excluded letters */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">Excluded Letters</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Enter letters that you know are NOT in the word</p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <div className="relative w-full sm:flex-1">
                  <input
                    type="text"
                    value={excludedLetters}
                    onChange={(e) => setExcludedLetters(e.target.value.toUpperCase())}
                    placeholder="e.g., X, Y, Z"
                    className="w-full sm:flex-1 px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-400 focus:border-transparent text-base sm:text-lg uppercase text-gray-900 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-red-50 hover:from-red-50 hover:to-pink-50"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 font-bold">✗</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left bg-red-50 p-2 rounded-lg border border-red-200">
                  {excludedLetters && (
                    <span className="font-semibold text-red-700">Excludes: {excludedLetters.split('').join(', ')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Clear button */}
            <div className="flex justify-center">
              <button
                onClick={clearAll}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="w-full lg:w-1/2 bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">R</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {(knownLetters.some(l => l) || knownLettersWithoutPos || excludedLetters) ? 
                    `Results ${resultCount > 0 ? `(${resultCount})` : ''}` : 
                    'Results'
                  }
                </h2>
              </div>
              {isLoading && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 text-center sm:text-right bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Searching...
                </div>
              )}
            </div>

            {/* Results Display */}
            {(knownLetters.some(l => l) || knownLettersWithoutPos || excludedLetters) ? (
              results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {results.map((word, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 px-2 sm:px-3 py-2 rounded-xl text-center font-bold hover:from-green-200 hover:to-emerald-200 transition-all duration-300 cursor-pointer text-xs sm:text-sm border border-green-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
                      title={word}
                    >
                      {word.toUpperCase()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 mt-16 sm:mt-20">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="text-base sm:text-lg font-semibold">Searching...</div>
                      <div className="text-xs sm:text-sm mt-2 text-gray-500">Finding matching words</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-base sm:text-lg font-semibold">No matches found</div>
                      <div className="text-xs sm:text-sm mt-2 text-gray-500">Try adjusting your search criteria</div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-center text-gray-600 mt-16 sm:mt-20">
                <div className="text-base sm:text-lg font-semibold">Enter search criteria to find words</div>
                <div className="text-xs sm:text-sm mt-2 text-gray-500 bg-gray-100 p-2 rounded-lg inline-block">
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
