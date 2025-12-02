"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { AITool } from '@/data/aiTools';

// This is a client component that will be hydrated on the client
// It receives the initial data as props
async function getData() {
  const { getAllTools, getCategories } = await import('@/lib/api');
  const [tools, categories] = await Promise.all([
    getAllTools(),
    getCategories()
  ]);
  return { tools, categories };
}

export default function ToolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for tools and categories
  const [allTools, setAllTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getData();
        setAllTools(data.tools);
        setCategories(data.categories);
        
        // Set initial filters from URL
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category');
        const page = searchParams.get('page');
        const sort = searchParams.get('sort') as 'newest' | 'popular' | 'name' | null;
        
        if (query) setSearchQuery(query);
        if (category) setSelectedCategory(category);
        if (page) setCurrentPage(parseInt(page, 10));
        if (sort) setSortBy(sort);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    // Update URL without page reload
    router.replace(`/tools?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedCategory, sortBy, currentPage, router]);
  
  // Filter and sort tools
  const { filteredTools, totalTools, totalPages } = useMemo(() => {
    let result = [...allTools];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        (tool.features && tool.features.some(feature => 
          feature.toLowerCase().includes(query)
        ))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(tool => tool.category === selectedCategory);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
          // Convert reviews string to number (e.g., "5 reviews" -> 5)
          const parseReviews = (reviews: string | undefined): number => {
            if (!reviews) return 0;
            const match = reviews.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
          };
          const aRating = parseReviews(a.reviews);
          const bRating = parseReviews(b.reviews);
          return bRating - aRating;
        case 'newest':
        default:
          // Sort by launch date if available, otherwise keep original order
          if (a.launchDate && b.launchDate) {
            return new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime();
          }
          // If no launch date, maintain original order
          return 0;
      }
    });
    
    // Calculate pagination
    const total = result.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    
    return {
      filteredTools: result,
      totalTools: total,
      totalPages: pages
    };
  }, [allTools, searchQuery, selectedCategory, sortBy]);
  
  // Get paginated tools
  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTools.slice(startIndex, startIndex + pageSize);
  }, [filteredTools, currentPage]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);
  
  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled by the useEffect that watches searchQuery
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('newest');
    setCurrentPage(1);
  };
  
  const hasActiveFilters = searchQuery || selectedCategory || sortBy !== 'newest';
  
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 mt-6">AI Tools Directory</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Discover the best AI tools to boost your productivity, creativity, and development workflow.
          </p>
          
          {/* Search and Filter */}
          <div className="mt-8 max-w-3xl
          ">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI tools..."
                className="block w-full pl-10 pr-10 py-3 border border-transparent rounded-md leading-5 bg-blue-700 bg-opacity-50 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-200 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </form>
            
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full text-blue-100 bg-blue-700 bg-opacity-50 hover:bg-opacity-70 transition-colors"
                >
                  Clear filters
                  <X className="ml-1 h-3 w-3" />
                </button>
              )}
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'name')}
                className="rounded-md border-0 bg-blue-700 bg-opacity-50 text-white text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="popular">Sort by: Most Popular</option>
                <option value="name">Sort by: A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Categories */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All Tools
              </button>
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(prev => prev === category ? null : category)}
                  className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || selectedCategory
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No tools available at the moment.'}
              </p>
              {searchQuery || selectedCategory ? (
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
                      {tool.logo ? (
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{tool.emoji || '🤖'}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
          
          {/* Pagination */}
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="hidden md:flex space-x-1">
              {pageNumbers[0] > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && (
                    <span className="px-2 py-1 text-gray-500">...</span>
                  )}
                </>
              )}
              
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-transparent'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="px-2 py-1 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
