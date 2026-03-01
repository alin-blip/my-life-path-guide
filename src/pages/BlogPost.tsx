import { useParams, Navigate } from 'react-router-dom';
import { getBlogPostBySlug } from '@/data/blogPosts';
import { BlogArticle } from '@/components/blog/BlogArticle';
import { BlogSEO } from '@/components/blog/BlogSEO';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <BlogSEO post={post} />
      <BlogArticle post={post} />
    </>
  );
};

export default BlogPost;
