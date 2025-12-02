import Link from 'next/link';
import { getFeaturedTools, getCategories, getAllTools } from '@/lib/api';
import { AITool } from '@/data/aiTools';

export default async function Home() {
  const [featuredTools, allCategories, allTools] = await Promise.all([
    getFeaturedTools(),
    getCategories(),
    getAllTools()
  ]);

  // Count tools per category
  const categoryCounts = allTools.reduce<Record<string, number>>((acc, tool: AITool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by count (most popular first) and take top 4
  const topCategories = [...allCategories]
    .filter((cat): cat is string => Boolean(cat))
    .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0))
    .slice(0, 5); // Show top 4 categories
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Discover the Best <span className="text-blue-600 dark:text-blue-400">AI Tools</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Explore our curated collection of cutting-edge AI tools to boost your productivity, creativity, and development workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/tools" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Browse All Tools
            </Link>
            <Link 
              href="#categories" 
              className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured AI Tools</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Handpicked selection of top AI tools</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTools.map((tool) => (
              <div key={tool.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                      {tool.logo ? (
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-2xl">{tool.emoji || '🤖'}</div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                      <div className="text-blue-600 dark:text-blue-400 font-medium">{tool.price}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{tool.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span 
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                    >
                      {tool.category}
                    </span>
                  </div>
                  <Link 
                    href={`/tools/${tool.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Learn more
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/tools" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Tools
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Find the perfect AI tool for your needs</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topCategories.map((category) => {
              const slug = category.toLowerCase().replace(/\s+/g, '-');
              const toolCount = categoryCounts[category] || 0;
              
              return (
                <Link 
                  key={slug} 
                  href={`/categories/${slug}`}
                  className="group bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center hover:bg-blue-50 dark:hover:bg-gray-600"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                    {category}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
                  </p>
                </Link>
              );
            })}
            
            {/* View All Categories Button */}
            <Link 
              href="/categories"
              className="group bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center hover:bg-blue-50 dark:hover:bg-gray-600 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <h3 className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                View All
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                See all categories
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to boost your productivity?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of professionals who are already using AI tools to work smarter and faster.
          </p>
          <Link 
            href="/tools" 
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Explore All Tools
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
