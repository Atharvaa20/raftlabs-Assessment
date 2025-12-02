'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AITool } from '@/data/aiTools';
import { searchTools } from '@/lib/api';
import { useState, useEffect } from 'react';

type SortOption = 'relevance' | 'newest' | 'rating' | 'name';

interface SearchFilters {
  category: string;
  sort: SortOption;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    sort: 'relevance'
  });

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    router.push('/search');
  };

  // Perform search when query changes
  useEffect(() => {
    const search = async () => {
      if (!query) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSearchQuery(query);

      try {
        const results = await searchTools(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to load search results. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'sort' ? value as SortOption : value
    }));
  };

  // Apply filters and sorting
  const filteredResults = [...searchResults]
    .filter(tool => {
      if (!filters.category) return true;
      if (Array.isArray(tool.category)) {
        return tool.category.includes(filters.category);
      }
      return tool.category === filters.category;
    })
    .sort((a, b) => {
      if (filters.sort === 'newest') {
        const dateA = a.launchDate ? new Date(a.launchDate).getTime() : 0;
        const dateB = b.launchDate ? new Date(b.launchDate).getTime() : 0;
        return dateB - dateA;
      } else if (filters.sort === 'rating') {
        const getRating = (reviews?: string): number => {
          if (!reviews) return 0;
          const match = reviews.match(/\d+\.?\d*/);
          return match ? parseFloat(match[0]) : 0;
        };
        return getRating(b.reviews) - getRating(a.reviews);
      } else if (filters.sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  // Get unique categories for filter
  const categories = Array.from(
    new Set(
      searchResults.flatMap(tool => {
        const categories = tool.category || [];
        return Array.isArray(categories) ? categories : [categories];
      }).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Searching...</span>
          </div>
        )}

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

        {!isLoading && !error && filteredResults.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No tools found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}

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
                      {tool.category && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {Array.isArray(tool.category) ? tool.category[0] : tool.category}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-300 line-clamp-2">
                    {tool.description}
                  </p>
                  {tool.reviews && (
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-yellow-400">
                            {star <= 4 ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {tool.reviews}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
