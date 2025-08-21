const { WordSearchEngine } = require('./wordSearch');

// Simple test function
function testSearchEngine() {
  console.log('🧪 Testing Word Search Engine...\n');

  // Create a test dictionary with some sample words
  const testWords = {
    "words": 1,
    "works": 1,
    "wants": 1,
    "about": 1,
    "above": 1,
    "after": 1,
    "with": 1,
    "when": 1,
    "what": 1,
    "that": 1,
    "this": 1,
    "they": 1,
    "have": 1,
    "here": 1,
    "help": 1,
    "home": 1,
    "open": 1,
    "over": 1,
    "only": 1,
    "once": 1
  };

  // Initialize the search engine
  const engine = new WordSearchEngine();
  engine.loadWords(testWords);

  console.log(`✅ Loaded ${Object.keys(testWords).length} test words\n`);

  // Test 1: Pattern search
  console.log('🔍 Test 1: Pattern Search "W___S"');
  const patternResults = engine.search('W___S');
  console.log(`Results: ${patternResults.join(', ')}`);
  console.log(`Count: ${patternResults.length}\n`);

  // Test 2: Pattern with required character
  console.log('🔍 Test 2: Pattern Search "W___, [H]"');
  const patternWithChar = engine.search('W___, [H]');
  console.log(`Results: ${patternWithChar.join(', ')}`);
  console.log(`Count: ${patternWithChar.length}\n`);

  // Test 3: Advanced search
  console.log('🔍 Test 3: Advanced Search "5 Letter, Starts with W, ends with S, also contains O"');
  const advancedResults = engine.advancedSearch([
    { type: 'length', value: 5 },
    { type: 'starts_with', value: 'w' },
    { type: 'ends_with', value: 's' },
    { type: 'contains', value: 'o' }
  ]);
  console.log(`Results: ${advancedResults.join(', ')}`);
  console.log(`Count: ${advancedResults.length}\n`);

  // Test 4: Position-specific search
  console.log('🔍 Test 4: Position Search "4 letter word, 3rd letter is W, contains H"');
  const positionResults = engine.advancedSearch([
    { type: 'length', value: 4 },
    { type: 'contains_at_position', char: 'w', position: 2 },
    { type: 'contains', value: 'h' }
  ]);
  console.log(`Results: ${positionResults.join(', ')}`);
  console.log(`Count: ${positionResults.length}\n`);

  // Test 5: Suggestions
  console.log('💡 Test 5: Suggestions for "W___"');
  const suggestions = engine.getSuggestions('W___');
  console.log(`Suggestions: ${suggestions.join(', ')}\n`);

  console.log('✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testSearchEngine();
}

module.exports = { testSearchEngine };
