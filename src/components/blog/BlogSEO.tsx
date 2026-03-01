import { Helmet } from 'react-helmet-async';
import { BlogPost } from '@/data/blogPosts';

interface BlogSEOProps {
  post?: BlogPost;
  isIndex?: boolean;
  canonicalBase?: string;
}

export const BlogSEO = ({ post, isIndex, canonicalBase = 'https://my-life-path-guide.lovable.app' }: BlogSEOProps) => {
  if (isIndex) {
    return (
      <Helmet>
        <title>Blog & Training | CEO Mind OS — Rutine, Mindset, Business</title>
        <meta name="description" content="Articole și traininguri despre rutine de dimineață, mindset antreprenorial, planificare strategică și creștere personală pentru CEO și Founderi." />
        <link rel="canonical" href={`${canonicalBase}/blog`} />
        <meta property="og:title" content="Blog & Training | CEO Mind OS" />
        <meta property="og:description" content="Articole și traininguri despre rutine de dimineață, mindset antreprenorial și creștere personală." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${canonicalBase}/blog`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog & Training | CEO Mind OS" />
        <link rel="alternate" hrefLang="ro" href={`${canonicalBase}/blog`} />
      </Helmet>
    );
  }

  if (!post) return null;

  const articleUrl = `${canonicalBase}/blog/${post.slug}`;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.titleRo,
    "description": post.metaDescription,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "CEO Mind OS",
      "url": canonicalBase
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "mainEntityOfPage": articleUrl,
    "keywords": post.metaKeywords.join(', '),
    "articleSection": post.categories.join(', '),
    "inLanguage": "ro-RO"
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasă", "item": canonicalBase },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${canonicalBase}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.titleRo, "item": articleUrl }
    ]
  };

  return (
    <Helmet>
      <title>{post.titleRo} | CEO Mind OS</title>
      <meta name="description" content={post.metaDescription} />
      <meta name="keywords" content={post.metaKeywords.join(', ')} />
      <link rel="canonical" href={articleUrl} />
      
      <meta property="og:title" content={post.titleRo} />
      <meta property="og:description" content={post.metaDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={articleUrl} />
      <meta property="article:published_time" content={post.publishedAt} />
      <meta property="article:modified_time" content={post.updatedAt} />
      <meta property="article:author" content={post.author} />
      {post.categories.map(cat => (
        <meta key={cat} property="article:tag" content={cat} />
      ))}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.titleRo} />
      <meta name="twitter:description" content={post.metaDescription} />
      
      <link rel="alternate" hrefLang="ro" href={articleUrl} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
    </Helmet>
  );
};
