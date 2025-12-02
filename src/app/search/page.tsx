// src/app/search/page.tsx
import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}