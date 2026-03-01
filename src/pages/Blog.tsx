import { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts, getAllCategories } from '@/data/blogPosts';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSEO } from '@/components/blog/BlogSEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = getAllCategories();

  const filteredPosts = activeCategory
    ? blogPosts.filter(p => p.categories.includes(activeCategory))
    : blogPosts;

  return (
    <div className="min-h-screen bg-background">
      <BlogSEO isIndex />

      {/* Hero */}
      <header className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Acasă
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Blog & Training
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Articole, traininguri și resurse despre mindset antreprenorial, rutine de dimineață, planificare strategică și creștere personală.
          </p>
        </div>
      </header>

      {/* Filters + Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Toate
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            Niciun articol în această categorie momentan.
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
