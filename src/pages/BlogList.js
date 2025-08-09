import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BlogCard from "../components/BlogCard"
import Newsletter from "../components/Newsletter"
import { posts } from "../posts/posts"
import Pagination from '../components/Pagination'

function BlogList() {
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();
  const postsPerPage = 9;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <main className="min-h-screen bg-background text-text-primary py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-12 mt-16 text-center">{t('blog.title')}</h1>

        {currentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center text-text-primary mt-8 mb-80">
            {t('blog.no_posts')}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
        </div>

        <div className="mt-24 mb-16">
          <Newsletter />
        </div>
      </div>
    </main>
  )
}

export default BlogList
