import { AITool, aiTools, categories } from '@/data/aiTools';

export async function getAllTools(): Promise<AITool[]> {
  // In a real app, this would be an API call
  return Promise.resolve(aiTools);
}

export async function getToolBySlug(slug: string | undefined): Promise<AITool | undefined> {
  if (!slug) return undefined;

  const tools = await getAllTools();
  const normalizedSlug = slug.toLowerCase();

  return tools.find(tool => {
    if (tool.id === slug) return true;

    const nameSlug = tool.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return nameSlug === normalizedSlug;
  });
}

export async function getToolsByCategory(category: string): Promise<AITool[]> {
  const tools = await getAllTools();
  if (category === 'All') return tools;
  // category is a string on AITool; match exact category
  return tools.filter(tool => tool.category === category);
}

export async function getCategories(): Promise<string[]> {
  return Promise.resolve(categories);
}

export async function searchTools(query: string): Promise<AITool[]> {
  const tools = await getAllTools();
  const queryLower = query.toLowerCase();
  return tools.filter(
    tool =>
      tool.name.toLowerCase().includes(queryLower) ||
      tool.description.toLowerCase().includes(queryLower) ||
      tool.category.toLowerCase().includes(queryLower) ||
      (tool.features && tool.features.some(feature => feature.toLowerCase().includes(queryLower)))
  );
}

// export async function getFeaturedTools(limit: number = 3): Promise<AITool[]> {
//   const tools = await getAllTools();
//   return tools
//     .sort((a, b) => (b.rating || 0) - (a.rating || 0))
//     .slice(0, limit);
// }
export async function getFeaturedTools(limit: number = 3): Promise<AITool[]> {
  const tools = await getAllTools();
  return tools
    .filter(tool => tool.reviews) // Only include tools with reviews
    .sort((a, b) => {
      // Convert reviews from string like "100 reviews" to number
      const aReviews = a.reviews ? parseInt(a.reviews.split(' ')[0]) : 0;
      const bReviews = b.reviews ? parseInt(b.reviews.split(' ')[0]) : 0;
      return bReviews - aReviews;
    })
    .slice(0, limit);
}
