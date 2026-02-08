import React, { useState } from 'react';
import { useBrotherhood } from '@/hooks/useBrotherhood';
import { SkoolWritePost } from './SkoolWritePost';
import { SkoolCategoryFilter } from './SkoolCategoryFilter';
import { SkoolPostCard } from './SkoolPostCard';
import { SkoolGroupSidebar } from './SkoolGroupSidebar';
import { useLanguage } from '@/context/LanguageContext';

export const CommunityTab: React.FC = () => {
  const { language } = useLanguage();
  const { posts, loading, createPost, toggleLike } = useBrotherhood();
  const [activeCategory, setActiveCategory] = useState('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main Feed */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-4">
        <SkoolWritePost onPost={createPost} />
        <SkoolCategoryFilter active={activeCategory} onChange={setActiveCategory} />

        {posts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              {language === 'ro'
                ? 'Nicio postare încă. Fii primul care postează!'
                : 'No posts yet. Be the first to post!'}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <SkoolPostCard key={post.id} post={post} onLike={toggleLike} />
          ))
        )}
      </div>

      {/* Group Info Sidebar — hidden on mobile */}
      <div className="hidden lg:block w-80 shrink-0">
        <SkoolGroupSidebar />
      </div>
    </div>
  );
};
