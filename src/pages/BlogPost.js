import React from "react"
import { useTranslation } from 'react-i18next'
import { Link, useParams, useNavigate } from "react-router-dom"
import { posts } from "../posts/posts"
import SEO from '../components/SEO'

function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const post = posts.find((post) => post.slug === slug)

  React.useEffect(() => {
    if (!post) {
      navigate("/404")
    }
  }, [navigate, post])

  if (!post) {
    return (
      <main className="min-h-screen bg text-text-primary flex items-center justify-center">
        <div className="text-center text-text-secondary">
          {t('blog.not_found')}
        </div>
      </main>
    )
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        keywords={post.categories ? post.categories.join(', ') + ', UltraVioleta DAO, Web3 LATAM' : 'UltraVioleta DAO, Web3 LATAM, blockchain article'}
        article={true}
        author={{name: post.author || 'UltraVioleta DAO', type: 'Person'}}
        publishedTime={post.date}
        image={post.image}
        type="article"
      />
      <main className="min-h-screen bg-background text-text-primary pb-16">
      {/* Hero section */}
      <div className="relative h-[34vh] w-full">
        <div className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {post.categories && post.categories.map((category, index) => (
              <span key={index} className="inline-block bg-ultraviolet-darker text-text-primary text-sm px-3 py-1 rounded-full mb-4 mr-2">
                {category}
              </span>
            ))}
            <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">{post.title}</h1>
            <div className="flex items-center justify-center text-zinc-300 text-sm space-x-4">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readingTime} min de lectura</span>
            </div>

            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">{post.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="prose prose-lg prose-invert max-w-none prose-headings:text-violet-300 prose-a:text-violet-400 prose-strong:text-white">
          {post.content.map((item, index) => {
            if (item.type === 'image') {
              return <img key={index} src={item.src} alt={item.alt} className=" mb-10"/>;
            }
            if (typeof item === 'string') {
              return <p className="mb-6" key={index}>{item} </p>;
            }
            return null;
          })}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-zinc-800">
            <h3 className="text-lg text-text-primary font-semibold mb-4">{t('blog.tags')}</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related posts */}
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-12 pt-6 border-t border-zinc-800">
            <h3 className="text-2xl text-text-primary font-bold mb-6">{t('blog.related')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {post.relatedPosts.map((relatedSlug) => {
                const relatedPost = posts.find((p) => p.slug === relatedSlug)
                if (!relatedPost) return null

                return (
                  <div
                    key={relatedSlug}
                    className="bg-zinc-900 rounded-lg overflow-hidden shadow-md border border-zinc-800"
                  >
                    <Link to={`/blog/${relatedPost.slug}`}>
                      <div className="relative h-40 w-full">
                        <img
                          src={relatedPost.coverImage || "/postContent/images/placeholder.webp"}
                          alt={relatedPost.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/blog/${relatedPost.slug}`}>
                        <h4 className="text-lg font-semibold text-text-primary hover:text-violet-400 transition-colors">
                          {relatedPost.title}
                        </h4>
                      </Link>
                      <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{relatedPost.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
    </>
  )
}

export default BlogPost
