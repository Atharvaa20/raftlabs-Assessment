import Link from 'next/link';
import { getCategories, getAllTools } from '@/lib/api';
import { FolderOpen } from 'lucide-react';
import { AITool } from '@/data/aiTools';

export default async function CategoriesPage() {
  const allCategories = await getCategories();
  
  // Count tools per category
  const tools = await getAllTools();
  const categoryCounts = tools.reduce<Record<string, number>>((acc, tool: AITool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Debug logging
  console.log('All categories:', allCategories);
  console.log('Category counts:', categoryCounts);
  
  // Sort categories by count (most popular first) and filter out any undefined/null categories
  const sortedCategories = [...allCategories]
    .filter((cat): cat is string => Boolean(cat)) // Ensure we only have string categories
    .sort((a, b) => {
      return (categoryCounts[b] || 0) - (categoryCounts[a] || 0);
    });
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 mt-6">AI Tool Categories</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Browse AI tools by category to find the perfect solution for your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedCategories.map((category) => {
            // Safely generate the URL slug
            const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link
                key={category}
                href={`/categories/${categorySlug}`}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-700 transition-colors duration-200">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {categoryCounts[category] || 0} {categoryCounts[category] === 1 ? 'tool' : 'tools'} available
                </p>
              </div>
            </Link>
          );
          })}
        </div>
        
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            We're constantly adding new categories and tools. Let us know what you'd like to see!
          </p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Suggest a Category
          </button>
        </div>
      </div>
    </div>
  );
}
