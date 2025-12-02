'use client';

import { notFound, useParams } from 'next/navigation';
import { getToolsByCategory, getCategories } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AITool } from '@/data/aiTools';

export default function CategoryPage() {
  const params = useParams();
  const [categoryName, setCategoryName] = useState<string>('');
  const [tools, setTools] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const categoryParam = params?.category as string || '';
        console.log('Category param from URL:', categoryParam);
        
        if (!categoryParam) {
          console.error('No category parameter provided in URL');
          notFound();
          return;
        }

        // Get all categories
        const allCategories = await getCategories();
        console.log('All categories:', allCategories);

        // Convert URL parameter back to title case with spaces
        const formattedCategory = categoryParam
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        console.log('Formatted category:', formattedCategory);

        // Find the correct case-sensitive category name from our list
        const actualCategory = allCategories.find(
          (cat: string) => cat.toLowerCase() === formattedCategory.toLowerCase()
        );
        
        if (!actualCategory) {
          console.error(`Category not found: ${formattedCategory}. Available categories:`, allCategories);
          notFound();
          return;
        }

        setCategoryName(actualCategory);
        
        // Get tools for this category
        const categoryTools = await getToolsByCategory(actualCategory);
        setTools(categoryTools);
      } catch (error) {
        console.error('Error loading category data:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params?.category]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!categoryName) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Link 
              href="/categories" 
              className="inline-flex items-center text-blue-200 hover:text-white mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Categories
            </Link>
            <span className="text-blue-300">/</span>
            <span className="ml-2 font-medium">{categoryName}</span>
          </div>
          <h1 className="text-3xl font-bold">{categoryName} Tools</h1>
          <p className="mt-2 text-blue-100">
            {tools.length} {tools.length === 1 ? 'tool' : 'tools'} available
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={tool.logo} 
                    alt={tool.name}
                    className="w-12 h-12 rounded-md object-contain mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tool.category}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {tool.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {tool.price}
                  </span>
                  <Link
                    href={`/tools/${tool.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
