'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AITool } from '@/data/aiTools';
import { searchTools } from '@/lib/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Perform search when query changes
  useEffect(() => {
    const search = async () => {
      if (!query) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSearchQuery(query);

      try {
        const results = await searchTools(query);
        setSearchResults(results);
        setHasSearched(true);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to load search results. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [query]);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        setSearchQuery(query);
        performSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters and sorting
  const filteredResults = [...searchResults]
    .filter(tool => {
      if (!filters.category) return true;
      // Handle both string and array categories
      if (Array.isArray(tool.category)) {
        return tool.category.includes(filters.category);
      }
      return tool.category === filters.category;
    })
    .sort((a, b) => {
      if (filters.sort === 'newest') {
        // Handle missing or invalid dates by putting them at the end
        const dateA = a.launchDate ? new Date(a.launchDate).getTime() : 0;
        const dateB = b.launchDate ? new Date(b.launchDate).getTime() : 0;
        return dateB - dateA;
      } else if (filters.sort === 'rating') {
        // Extract numeric rating from reviews string (e.g., "4.5 (10 reviews)" -> 4.5)
        const getRating = (reviews: string | undefined): number => {
          if (!reviews) return 0;
          const match = reviews.match(/\d+\.?\d*/);
          return match ? parseFloat(match[0]) : 0;
        };
        return getRating(b.reviews) - getRating(a.reviews);
      } else if (filters.sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0; // Default: relevance (already sorted by the API)
    });

  // Get unique categories for filter
  const categories = Array.from(
    new Set(
      searchResults.flatMap(tool => 
        Array.isArray(tool.category) ? tool.category : [tool.category]
      )
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {query ? `Search results for "${query}"` : 'Search AI Tools'}
          </h1>
          <div className="mt-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-16 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center px-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Filters and Sort */}
        {query && (
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort by
                </label>
                <select
                  id="sort"
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Searching...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No results */}
        {!isLoading && !error && filteredResults.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No tools found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try searching for: {' '}
                <button 
                  onClick={() => setSearchQuery('chatbot')} 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  chatbot
                </button>,{' '}
                <button 
                  onClick={() => setSearchQuery('image generation')} 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  image generation
                </button>, or{' '}
                <button 
                  onClick={() => setSearchQuery('productivity')} 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  productivity
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && filteredResults.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {tool.emoji || '🤖'}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {Array.isArray(tool.category) ? tool.category.join(' • ') : tool.category}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {tool.price}
                    </span>
                    {tool.reviews && (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">
                          {(() => {
                            // Extract numeric rating from reviews string (e.g., "4.5 (10 reviews)" -> "4.5")
                            const ratingMatch = tool.reviews.match(/\d+\.?\d*/);
                            const rating = ratingMatch ? parseFloat(ratingMatch[0]) : null;
                            return rating ? rating.toFixed(1) : tool.reviews;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
