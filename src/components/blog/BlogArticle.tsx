import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, ChevronRight } from 'lucide-react';
import { BlogPost } from '@/data/blogPosts';

interface BlogArticleProps {
  post: BlogPost;
}

export const BlogArticle = ({ post }: BlogArticleProps) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    post.sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [post.sections]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">Acasă</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{post.titleRo}</span>
          </nav>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map(cat => (
              <Badge key={cat} variant="secondary">{cat}</Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            {post.titleRo}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime}
            </span>
          </div>
        </div>
      </header>

      {/* Content + ToC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-12">
          {/* Sticky ToC - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Cuprins</p>
              {post.sections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    activeSection === s.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {s.title.replace(/^\d+\.\s*/, '')}
                </a>
              ))}
            </nav>
          </aside>

          {/* Article Body */}
          <main className="flex-1 max-w-3xl">
            {post.sections.map((section, idx) => (
              <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                  {section.title}
                </h2>
                <div className="prose prose-lg max-w-none text-foreground/85 leading-relaxed space-y-4">
                  {section.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('> ')) {
                      return (
                        <blockquote key={pIdx} className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground my-6">
                          {paragraph.replace(/^>\s*„?/, '').replace(/"$/, '')}
                        </blockquote>
                      );
                    }
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={pIdx} className="text-xl font-bold text-foreground mt-8 mb-3">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n').filter(l => l.startsWith('- '));
                      return (
                        <ul key={pIdx} className="space-y-2 my-4">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span dangerouslySetInnerHTML={{ __html: item.replace(/^-\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={pIdx} dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }} />
                    );
                  })}
                </div>

                {/* CTA after each section */}
                {idx < post.sections.length - 1 && (
                  <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                    <p className="text-sm font-medium text-foreground mb-3">
                      🚀 Vrei să implementezi asta chiar azi?
                    </p>
                    <Link to="/challenge-7-zile">
                      <Button variant="gradient" size="sm">
                        Încearcă CEO Mind OS gratuit 5 zile
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Final CTA */}
                {idx === post.sections.length - 1 && (
                  <div className="mt-10 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20 text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Ești pregătit să-ți transformi dimineața?
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                      Încearcă CEO Mind OS gratuit 5 zile — Rutina Războinicului, AI Mind Coach, CORE 4 și Domino Door.
                    </p>
                    <Link to="/challenge-7-zile">
                      <Button variant="gradient" size="lg">
                        Începe Gratuit Acum ⚔️
                      </Button>
                    </Link>
                  </div>
                )}
              </section>
            ))}

            {/* Author Bio */}
            <div className="mt-16 p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shrink-0">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">{post.author}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{post.authorBio}</p>
                </div>
              </div>
            </div>

            {/* Back to Blog */}
            <div className="mt-8">
              <Link to="/blog">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Înapoi la Blog
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
