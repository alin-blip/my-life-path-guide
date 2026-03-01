import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { BlogPost } from '@/data/blogPosts';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Gradient thumbnail placeholder */}
        <div className="h-48 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
          <div className="text-center px-6">
            <span className="text-4xl">⚔️</span>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Training Video</p>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {post.categories.map(cat => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>

          <h2 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.titleRo}
          </h2>

          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.publishedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};
