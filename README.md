# Word Search App

A powerful word search application built with Next.js that uses advanced data structures (Trie and Inverted Index) to provide lightning-fast pattern matching and constraint-based word searches.

## Features

### 🔍 **Pattern Search**
- Use underscores (`_`) as wildcards for flexible pattern matching
- Example: `W___S` finds 5-letter words starting with W and ending with S
- Example: `A____` finds 5-letter words starting with A

### 🎯 **Advanced Search**
- Natural language queries for complex searches
- Length constraints: "5 Letter", "4 letter"
- Position constraints: "3rd letter is W", "2nd letter is H"
- Character requirements: "contains O", "Starts with W", "ends with S"

### 🚀 **Performance Features**
- **Trie Data Structure**: Efficient prefix and pattern matching
- **Inverted Index**: Fast character-based searches
- **Length Indexing**: Quick filtering by word length
- **Position Indexing**: Character position-specific searches

### 💡 **Smart Features**
- Search suggestions and autocomplete
- Search history with quick re-search
- Real-time results with loading states
- Responsive design for all devices

## Data Structures Used

### 1. **Trie (Prefix Tree)**
```javascript
class Trie {
  // Efficient prefix matching
  search(prefix) // Find all words starting with prefix
  
  // Pattern matching with wildcards
  searchByPattern(pattern) // e.g., "W___S" finds "WORDS"
}
```

### 2. **Inverted Index**
```javascript
class InvertedIndex {
  // Character -> Set of words containing that character
  getWordsWithChar(char) // Find all words containing 'O'
  
  // Character -> Position mapping
  getWordsWithCharAtPosition(char, position) // Find words with 'W' at position 2
}
```

### 3. **Length Index**
```javascript
// Word length -> Set of words
wordLengthIndex.get(5) // All 5-letter words
```

## Search Query Examples

### Pattern Search
| Query | Description | Example Results |
|-------|-------------|-----------------|
| `W___S` | 5-letter words starting with W, ending with S | words, works, wants |
| `A____` | 5-letter words starting with A | about, above, after |
| `_____` | All 5-letter words | about, above, after, words |
| `W___, [H]` | 4-letter words starting with W, containing H | with, when |

### Advanced Search
| Query | Description |
|-------|-------------|
| `5 Letter, Starts with W, ends with S, also contains O` | Complex constraint search |
| `4 letter word, 3rd letter is W, contains H` | Position-specific search |
| `3 Letter, contains A` | Length + character constraint |

## API Endpoints

### POST `/api/search`
Search for words using the search engine.

**Request Body:**
```json
{
  "query": "W___S, [O]",
  "advanced": false
}
```

**Response:**
```json
{
  "query": "W___S, [O]",
  "results": ["words", "works"],
  "count": 2,
  "suggestions": ["words", "works"],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd word-search-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

### 4. Open your browser
Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment on Vercel

### 1. Build the project
```bash
npm run build
```

### 2. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### 3. Or use Vercel Dashboard
- Push your code to GitHub
- Connect your repository to Vercel
- Vercel will automatically deploy on every push

## Project Structure

```
word-search-app/
├── lib/
│   └── wordSearch.js          # Core search engine with Trie & Inverted Index
├── pages/
│   ├── api/
│   │   └── search.js          # API endpoint for word searches
│   ├── _app.js               # Next.js app wrapper
│   ├── _document.js          # HTML document template
│   └── index.js              # Main search interface
├── public/                    # Static assets
├── styles/                    # Global CSS
├── words_dictionary_5.json   # 5-letter word dictionary
└── package.json              # Dependencies and scripts
```

## Performance Characteristics

### Time Complexity
- **Trie Search**: O(m) where m is pattern length
- **Inverted Index Search**: O(1) for character lookups
- **Pattern Matching**: O(n × m) where n is number of words, m is pattern length
- **Length Filtering**: O(1) constant time

### Space Complexity
- **Trie**: O(n × m) where n is number of words, m is average word length
- **Inverted Index**: O(n × c) where c is average characters per word
- **Total**: Approximately 2-3x the size of the word dictionary

## Customization

### Adding New Search Types
1. Extend the `WordSearchEngine` class
2. Add new constraint types in `parseAdvancedQuery()`
3. Implement search logic in `advancedSearch()`

### Supporting Different Word Lists
1. Replace `words_dictionary_5.json` with your word list
2. Ensure the format is `{"word": 1, ...}`
3. The engine automatically adapts to different word lengths

### Styling
The app uses Tailwind CSS. Modify the classes in `pages/index.js` to customize the appearance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) for optimal performance
- Styled with [Tailwind CSS](https://tailwindcss.com/) for beautiful UI
- Deployed on [Vercel](https://vercel.com/) for seamless hosting
- Word dictionary from various open-source word lists

---

**Happy Word Searching! 🎯✨**
