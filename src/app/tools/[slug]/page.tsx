import { notFound } from 'next/navigation';
import { getToolBySlug, getFeaturedTools } from '@/lib/api';
import { ArrowLeft, ExternalLink, Star, Check, Share2, Heart } from 'lucide-react';
import Link from 'next/link';

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  const featuredTools = await getFeaturedTools(3);

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back and Action Buttons */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/tools" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Tools
            </Link>
            <div className="flex space-x-3">
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-2xl p-6 w-32 h-32 flex items-center justify-center mb-6 md:mb-0 md:mr-8 overflow-hidden">
              {tool.logo ? (
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-5xl">{tool.emoji || '🤖'}</span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
                  <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{tool.description}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[5, 10, 15, 30, 100].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(parseInt(tool.reviews) || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                     ({ parseInt(tool.reviews)} reviews)
                  </span>
                </div>
                
                {tool.price && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {tool.price}
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tool.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About {tool.name}</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300">
                  {tool.description} {/* Duplicated for demo purposes */}
                </p>
                
              </div>
            </div>
            
            {/* Features Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key Features</h2>
              <ul className="space-y-3">
                {(tool.features ?? []).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pricing</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Pricing</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tool.price || 'See website for details'}
                  </span>
                </div>
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center mt-6 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Visit Website to Learn More
                </a>
              </div>
            </div>
            
            {/* Related Tools */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Similar Tools</h3>
              <div className="space-y-4">
                {featuredTools
                  .filter(t => t.id !== tool.id)
                  .map((relatedTool) => (
                    <Link
                      key={relatedTool.id}
                      href={`/tools/${relatedTool.id}`}
                      className="group flex items-center space-x-3 p-3 -mx-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                        <img src={relatedTool.logo} alt={relatedTool.name} className="w-10 h-10 object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          {relatedTool.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {relatedTool.price || 'Price not available'}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
