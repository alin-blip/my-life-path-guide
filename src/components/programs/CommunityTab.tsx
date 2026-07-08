import React, { useState, useEffect } from 'react';
import { useBrotherhood } from '@/hooks/useBrotherhood';
import { SkoolWritePost } from './SkoolWritePost';
import { SkoolCategoryFilter } from './SkoolCategoryFilter';
import { SkoolPostCard } from './SkoolPostCard';
import { SkoolGroupSidebar } from './SkoolGroupSidebar';
import { CommunityWelcomeBanner } from './CommunityWelcomeBanner';
import { useLanguage } from '@/context/LanguageContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureLimitBanner } from '@/components/FeatureLimitBanner';
import { toast } from 'sonner';

export const CommunityTab: React.FC = () => {
  const { language } = useLanguage();
  const { posts, loading, createPost, toggleLike, fetchPosts } = useBrotherhood();
  const [activeCategory, setActiveCategory] = useState('all');
  const { status: accessStatus, consume: consumePostQuota } = useFeatureAccess('brotherhood_post');

  // Re-fetch posts when category changes
  useEffect(() => {
    fetchPosts(undefined, activeCategory);
  }, [activeCategory]);

  const handleCreatePost = async (
    content: string,
    options?: { mediaUrls?: string[]; category?: string; [k: string]: unknown },
  ) => {
    // Free-tier gate: 1 post per ISO week
    if (accessStatus && !accessStatus.unlimited) {
      const allowed = await consumePostQuota();
      if (!allowed) {
        toast.error(
          language === 'ro'
            ? 'Ai atins limita săptămânală pentru Brotherhood. Fă upgrade pentru postări nelimitate.'
            : 'You reached this week\'s Brotherhood limit. Upgrade for unlimited posts.',
        );
        return;
      }
    }
    await createPost(content, undefined, options?.mediaUrls, options);
  };

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
        <CommunityWelcomeBanner />
        <FeatureLimitBanner
          status={accessStatus}
          featureLabel={language === 'ro' ? 'postări Brotherhood' : 'Brotherhood posts'}
        />
        <SkoolWritePost onPost={handleCreatePost} />
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
            <SkoolPostCard key={post.id} post={post} onLike={toggleLike} onRefresh={() => fetchPosts(undefined, activeCategory)} />
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

