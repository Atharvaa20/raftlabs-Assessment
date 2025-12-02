import { NextResponse } from 'next/server';
import { aiTools } from '@/data/aiTools';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results = aiTools.filter(tool => 
    tool.name.toLowerCase().includes(query) ||
    tool.description.toLowerCase().includes(query) ||
    tool.category.toLowerCase().includes(query) ||
    (tool.features && tool.features.some(feature => feature.toLowerCase().includes(query)))
  );

  return NextResponse.json({ results });
}
