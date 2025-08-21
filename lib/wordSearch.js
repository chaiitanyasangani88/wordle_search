class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.words = new Set(); // Store words that end at this node
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
      node.words.add(word); // Add word to all nodes in its path
    }
    node.isEndOfWord = true;
  }

  search(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char);
    }
    return Array.from(node.words);
  }

  searchByPattern(pattern) {
    const results = new Set();
    this._searchByPatternHelper(this.root, pattern, 0, '', results);
    return Array.from(results);
  }

  _searchByPatternHelper(node, pattern, index, currentWord, results) {
    if (index === pattern.length) {
      if (node.isEndOfWord) {
        results.add(currentWord);
      }
      return;
    }

    const char = pattern[index];
    if (char === '_') {
      // Wildcard - try all children
      for (const [childChar, childNode] of node.children) {
        this._searchByPatternHelper(childNode, pattern, index + 1, currentWord + childChar, results);
      }
    } else {
      // Specific character
      if (node.children.has(char)) {
        this._searchByPatternHelper(node.children.get(char), pattern, index + 1, currentWord + char, results);
      }
    }
  }
}

class InvertedIndex {
  constructor() {
    this.index = new Map(); // character -> Set of words containing that character
    this.positionIndex = new Map(); // character -> Map of word -> Set of positions
  }

  addWord(word) {
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      
      // Add to character index
      if (!this.index.has(char)) {
        this.index.set(char, new Set());
      }
      this.index.get(char).add(word);

      // Add to position index
      if (!this.positionIndex.has(char)) {
        this.positionIndex.set(char, new Map());
      }
      if (!this.positionIndex.get(char).has(word)) {
        this.positionIndex.get(char).set(word, new Set());
      }
      this.positionIndex.get(char).get(word).add(i);
    }
  }

  getWordsWithChar(char) {
    return Array.from(this.index.get(char) || []);
  }

  getWordsWithCharAtPosition(char, position) {
    const words = [];
    const charWords = this.positionIndex.get(char);
    if (charWords) {
      for (const [word, positions] of charWords) {
        if (positions.has(position)) {
          words.push(word);
        }
      }
    }
    return words;
  }
}

class WordSearchEngine {
  constructor() {
    this.trie = new Trie();
    this.invertedIndex = new InvertedIndex();
    this.words = new Set();
    this.wordLengthIndex = new Map(); // length -> Set of words
  }

  loadWords(wordsData) {
    // Clear existing data
    this.trie = new Trie();
    this.invertedIndex = new InvertedIndex();
    this.words = new Set();
    this.wordLengthIndex = new Map();

    // Process each word
    for (const word of Object.keys(wordsData)) {
      this.addWord(word);
    }
  }

  addWord(word) {
    this.words.add(word);
    this.trie.insert(word);
    this.invertedIndex.addWord(word);

    // Add to length index
    const length = word.length;
    if (!this.wordLengthIndex.has(length)) {
      this.wordLengthIndex.set(length, new Set());
    }
    this.wordLengthIndex.get(length).add(word);
  }

  search(query) {
    const results = new Set();
    
    // Parse the query
    const parsedQuery = this.parseQuery(query);
    
    if (parsedQuery.pattern) {
      // Pattern-based search using Trie
      const patternResults = this.trie.searchByPattern(parsedQuery.pattern);
      for (const word of patternResults) {
        results.add(word);
      }
    }

    if (parsedQuery.requiredChars.length > 0) {
      // Character requirement search using Inverted Index
      const charResults = this.searchByRequiredChars(parsedQuery.requiredChars);
      
      if (results.size > 0) {
        // Intersect with existing results
        const intersection = new Set();
        for (const word of results) {
          if (charResults.has(word)) {
            intersection.add(word);
          }
        }
        results.clear();
        intersection.forEach(word => results.add(word));
      } else {
        charResults.forEach(word => results.add(word));
      }
    }

    if (parsedQuery.length) {
      // Filter by length
      const lengthResults = this.wordLengthIndex.get(parsedQuery.length) || new Set();
      if (results.size > 0) {
        const intersection = new Set();
        for (const word of results) {
          if (lengthResults.has(word)) {
            intersection.add(word);
          }
        }
        results.clear();
        intersection.forEach(word => results.add(word));
      } else {
        lengthResults.forEach(word => results.add(word));
      }
    }

    return Array.from(results).sort();
  }

  parseQuery(query) {
    const result = {
      pattern: null,
      requiredChars: [],
      length: null
    };

    // Parse pattern like "W___S" or "W___"
    const patternMatch = query.match(/^([A-Za-z_]+)$/);
    if (patternMatch) {
      result.pattern = patternMatch[1].toLowerCase();
      result.length = result.pattern.length;
    }

    // Parse required characters like "[O]" or "[H]"
    const charMatches = query.match(/\[([A-Za-z])\]/g);
    if (charMatches) {
      result.requiredChars = charMatches.map(match => match[1].toLowerCase());
    }

    // Parse length specification like "5 Letter" or "4 letter"
    const lengthMatch = query.match(/(\d+)\s*[Ll]etter/);
    if (lengthMatch) {
      result.length = parseInt(lengthMatch[1]);
    }

    return result;
  }

  searchByRequiredChars(requiredChars) {
    if (requiredChars.length === 0) return new Set();

    let commonWords = null;
    for (const char of requiredChars) {
      const wordsWithChar = new Set(this.invertedIndex.getWordsWithChar(char));
      if (commonWords === null) {
        commonWords = wordsWithChar;
      } else {
        // Intersect with existing results
        const intersection = new Set();
        for (const word of commonWords) {
          if (wordsWithChar.has(word)) {
            intersection.add(word);
          }
        }
        commonWords = intersection;
      }
    }
    return commonWords || new Set();
  }

  // Advanced search with position constraints
  advancedSearch(constraints) {
    let results = new Set(this.words);

    for (const constraint of constraints) {
      if (constraint.type === 'length') {
        const lengthWords = this.wordLengthIndex.get(constraint.value) || new Set();
        results = this.intersectSets(results, lengthWords);
      } else if (constraint.type === 'starts_with') {
        const startWords = this.trie.search(constraint.value);
        results = this.intersectSets(results, new Set(startWords));
      } else if (constraint.type === 'ends_with') {
        const endWords = this.searchByEnding(constraint.value);
        results = this.intersectSets(results, endWords);
      } else if (constraint.type === 'contains_at_position') {
        const posWords = this.invertedIndex.getWordsWithCharAtPosition(constraint.char, constraint.position);
        results = this.intersectSets(results, new Set(posWords));
      } else if (constraint.type === 'contains') {
        const containsWords = this.invertedIndex.getWordsWithChar(constraint.value);
        results = this.intersectSets(results, containsWords);
      }
    }

    return Array.from(results).sort();
  }

  searchByEnding(suffix) {
    const results = new Set();
    for (const word of this.words) {
      if (word.endsWith(suffix)) {
        results.add(word);
      }
    }
    return results;
  }

  intersectSets(set1, set2) {
    // Ensure both parameters are Sets
    const set1Set = set1 instanceof Set ? set1 : new Set(set1);
    const set2Set = set2 instanceof Set ? set2 : new Set(set2);
    
    const intersection = new Set();
    for (const item of set1Set) {
      if (set2Set.has(item)) {
        intersection.add(item);
      }
    }
    return intersection;
  }

  // Get search suggestions
  getSuggestions(partialQuery) {
    const suggestions = [];
    
    // Pattern suggestions
    if (partialQuery.includes('_')) {
      const pattern = partialQuery.replace(/[^A-Za-z_]/g, '');
      if (pattern.length > 0) {
        const results = this.trie.searchByPattern(pattern);
        suggestions.push(...results.slice(0, 5));
      }
    }

    // Length suggestions
    const lengthMatch = partialQuery.match(/(\d+)\s*[Ll]etter/);
    if (lengthMatch) {
      const length = parseInt(lengthMatch[1]);
      const lengthWords = this.wordLengthIndex.get(length) || new Set();
      suggestions.push(...Array.from(lengthWords).slice(0, 5));
    }

    return [...new Set(suggestions)].slice(0, 10);
  }
}

module.exports = { WordSearchEngine, Trie, InvertedIndex };
