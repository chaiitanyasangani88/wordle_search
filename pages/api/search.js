import { WordSearchEngine } from '../../lib/wordSearch';

// Global instance to avoid reloading words on every request
let searchEngine = null;
let isInitialized = false;

async function initializeSearchEngine() {
  if (isInitialized) return;
  
  try {
    // Load the words dictionary
    const wordsData = require('../../words_dictionary_5.json');
    
    // Initialize the search engine
    searchEngine = new WordSearchEngine();
    searchEngine.loadWords(wordsData);
    
    isInitialized = true;
    console.log(`Loaded ${Object.keys(wordsData).length} words into search engine`);
  } catch (error) {
    console.error('Error initializing search engine:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize search engine if not already done
    await initializeSearchEngine();

    const { query, advanced } = req.method === 'GET' ? req.query : req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    let results;
    
    if (advanced) {
      // Parse advanced search constraints
      const constraints = parseAdvancedQuery(query);
      results = searchEngine.advancedSearch(constraints);
    } else {
      // Use simple search
      results = searchEngine.search(query);
    }

    // For 5-letter word searches, ensure all results are exactly 5 letters
    results = results.filter(word => word.length === 5);

    // Get suggestions for the query (also filtered to 5 letters)
    const suggestions = searchEngine.getSuggestions(query).filter(word => word.length === 5);

    res.status(200).json({
      query,
      results,
      count: results.length,
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

function parseAdvancedQuery(query) {
  const constraints = [];
  
  // Parse length constraint (e.g., "5 Letter", "4 letter")
  const lengthMatch = query.match(/(\d+)\s*[Ll]etter/);
  if (lengthMatch) {
    constraints.push({
      type: 'length',
      value: parseInt(lengthMatch[1])
    });
  }

  // Parse starts with constraint (e.g., "Starts with W", "starts with w")
  const startsWithMatch = query.match(/[Ss]tarts?\s+with\s+([A-Za-z])/);
  if (startsWithMatch) {
    constraints.push({
      type: 'starts_with',
      value: startsWithMatch[1].toLowerCase()
    });
  }

  // Parse ends with constraint (e.g., "Ends with S", "ends with s")
  const endsWithMatch = query.match(/[Ee]nds?\s+with\s+([A-Za-z])/);
  if (endsWithMatch) {
    constraints.push({
      type: 'ends_with',
      value: endsWithMatch[1].toLowerCase()
    });
  }

  // Parse contains constraint (e.g., "contains O", "Contains H")
  const containsMatch = query.match(/[Cc]ontains?\s+([A-Za-z])/);
  if (containsMatch) {
    constraints.push({
      type: 'contains',
      value: containsMatch[1].toLowerCase()
    });
  }

  // Parse position-specific contains (e.g., "3rd letter is W", "2nd letter is H")
  const positionMatch = query.match(/(\d+)(?:st|nd|rd|th)\s+letter\s+is\s+([A-Za-z])/);
  if (positionMatch) {
    constraints.push({
      type: 'contains_at_position',
      char: positionMatch[2].toLowerCase(),
      position: parseInt(positionMatch[1]) - 1 // Convert to 0-based index
    });
  }

  return constraints;
}
