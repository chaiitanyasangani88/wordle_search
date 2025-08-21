/**
 * Performance Optimizations for Vercel Deployment
 * 
 * This file contains optimizations to ensure the word search app
 * runs efficiently within Vercel's serverless function constraints.
 */

// Memory optimization: Limit the number of results returned
const MAX_RESULTS = 1000;
const MAX_SUGGESTIONS = 20;

// Cache optimization: Simple in-memory cache for frequent queries
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Optimize search results to prevent memory issues
 * @param {Array} results - Raw search results
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} Optimized results
 */
function optimizeResults(results, maxResults = MAX_RESULTS) {
  if (results.length <= maxResults) {
    return results;
  }
  
  // Return first N results with a note about truncation
  return results.slice(0, maxResults);
}

/**
 * Get cached results if available and not expired
 * @param {string} query - Search query
 * @returns {Object|null} Cached results or null
 */
function getCachedResults(query) {
  const cached = queryCache.get(query);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    queryCache.delete(query);
    return null;
  }
  
  return cached.results;
}

/**
 * Cache search results for future use
 * @param {string} query - Search query
 * @param {Object} results - Search results
 */
function cacheResults(query, results) {
  // Only cache successful searches with reasonable result counts
  if (results && results.results && results.results.length > 0 && results.results.length < 100) {
    queryCache.set(query, {
      results: results,
      timestamp: Date.now()
    });
    
    // Limit cache size to prevent memory issues
    if (queryCache.size > 100) {
      const firstKey = queryCache.keys().next().value;
      queryCache.delete(firstKey);
    }
  }
}

/**
 * Memory usage optimization: Clean up large objects
 * @param {WordSearchEngine} engine - Search engine instance
 */
function optimizeMemoryUsage(engine) {
  // Clear any temporary data structures
  if (engine.tempResults) {
    engine.tempResults.clear();
    engine.tempResults = null;
  }
  
  // Force garbage collection if available (Node.js only)
  if (global.gc) {
    global.gc();
  }
}

/**
 * Response optimization for Vercel
 * @param {Object} response - API response object
 * @returns {Object} Optimized response
 */
function optimizeResponse(response) {
  return {
    query: response.query,
    results: response.results,
    count: response.results.length,
    suggestions: response.suggestions?.slice(0, MAX_SUGGESTIONS) || [],
    timestamp: response.timestamp,
    // Add performance hints
    performance: {
      resultCount: response.results.length,
      suggestionCount: response.suggestions?.length || 0,
      cached: false
    }
  };
}

/**
 * Batch processing for large result sets
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} batchSize - Size of each batch
 * @returns {Array} Processed results
 */
function processInBatches(items, processor, batchSize = 100) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const processed = processor(batch);
    results.push(...processed);
    
    // Yield control to prevent blocking
    if (i % (batchSize * 10) === 0) {
      // Small delay to prevent blocking
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1);
    }
  }
  
  return results;
}

module.exports = {
  optimizeResults,
  getCachedResults,
  cacheResults,
  optimizeMemoryUsage,
  optimizeResponse,
  processInBatches,
  MAX_RESULTS,
  MAX_SUGGESTIONS
};
