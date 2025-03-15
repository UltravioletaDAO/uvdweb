import React from 'react';
import { Link } from "react-router-dom"

const BlogCard = ({ post }) => {
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800 hover:border-ultraviolet-darker transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <Link to={`/blog/${post.slug}`}>
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={post.coverImage || "/postContent/images/placeholder.webp"}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-card-image-gradient"></div>
          <div className="absolute top-3 right-3">
            {post.categories.map((category, index) => (
              <span key={index} className="bg-ultraviolet-darker text-text-primary text-xs px-2 py-1 rounded-full mr-2">
                {category}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold text-text-primary hover:text-violet-400 transition-colors mb-2">{post.title}</h2>
        </Link>

        <div className="flex items-center text-text-secondary text-sm mb-3">
          <span>{post.date}</span>
        </div>

        <p className="text-text-secondary mb-4 line-clamp-2">{post.description}</p>

        <Link to={`/blog/${post.slug}`} className="inline-block mt-3 text-violet-300 hover:text-violet-100">
          Continuar Leyendo <span className="ml-1">→</span>
          <span className="ml-2 text-xs text-text-secondary">{post.readingTime} min</span>
        </Link>
      </div>
    </div>
  )
}

export default BlogCard
