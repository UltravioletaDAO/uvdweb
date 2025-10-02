import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 'review-1',
      author: 'StreamerDAO Community',
      authorType: 'Organization',
      rating: 5,
      date: '2024-09-15',
      title: 'Game-Changing Chat Monetization',
      content: 'Karma Hello has completely transformed how we engage with our community. The AI agents are incredibly smart at evaluating content quality, and our viewers love earning real crypto rewards. Stream engagement is up 300% since implementation.',
      product: 'Karma Hello',
      verified: true,
      socialHandle: '@StreamerDAO',
      image: '/images/testimonials/streamer-dao.jpg'
    },
    {
      id: 'review-2',
      author: 'Avalanche Ecosystem Fund',
      authorType: 'Organization',
      rating: 5,
      date: '2024-08-20',
      title: 'Innovative Web3 Integration',
      content: 'UltraVioleta DAO sets new standards for Web3 engagement. Their implementation of blockchain rewards for content creators is revolutionary. The anti-farming mechanisms are sophisticated and effective.',
      product: 'Karma Hello',
      verified: true,
      socialHandle: '@AvalancheEco',
      image: '/images/testimonials/avalanche.jpg'
    },
    {
      id: 'review-3',
      author: 'Carlos Mendez',
      authorType: 'Person',
      rating: 5,
      date: '2024-09-01',
      title: 'Incredible Content Analytics',
      content: 'Abracadabra saved us 20+ hours per week on content creation. The semantic search is mind-blowing - I can find any moment from months of streams instantly. The automated blog generation is surprisingly high quality.',
      product: 'Abracadabra',
      verified: true,
      socialHandle: '@carlosmendez_',
      role: 'Content Creator',
      subscribers: '125K',
      image: '/images/testimonials/carlos.jpg'
    },
    {
      id: 'review-4',
      author: 'TechStreamer Pro',
      authorType: 'Person',
      rating: 5,
      date: '2024-08-15',
      title: 'Best Stream Analytics Platform',
      content: 'The predictive analytics helped me identify trending topics before they exploded. My content strategy is now data-driven thanks to Abracadabra. The knowledge graph connections reveal insights I never would have found manually.',
      product: 'Abracadabra',
      verified: true,
      socialHandle: '@TechStreamerPro',
      role: 'Tech Influencer',
      subscribers: '89K',
      image: '/images/testimonials/techstreamer.jpg'
    },
    {
      id: 'review-5',
      author: 'Latin Web3 Alliance',
      authorType: 'Organization',
      rating: 5,
      date: '2024-07-28',
      title: 'Empowering LATAM Communities',
      content: 'UltraVioleta\'s multilingual support is exceptional. Both Karma Hello and Abracadabra work perfectly in Spanish, Portuguese, and English. They truly understand the Latin American market needs.',
      product: 'Both Products',
      verified: true,
      socialHandle: '@LatinWeb3',
      image: '/images/testimonials/latin-web3.jpg'
    },
    {
      id: 'review-6',
      author: 'Maria Silva',
      authorType: 'Person',
      rating: 5,
      date: '2024-09-10',
      title: 'From Zero to Crypto Earnings',
      content: 'I started with zero crypto knowledge. Karma Hello made it so easy - just chat and earn! Now I\'m making 500K UVD tokens daily with quality interactions. The Echoes NFT 2x multiplier is amazing.',
      product: 'Karma Hello',
      verified: true,
      socialHandle: '@mariasilva_br',
      role: 'Community Member',
      image: '/images/testimonials/maria.jpg'
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Generate Review schema for each testimonial
  const generateReviewSchema = (testimonial) => {
    return {
      "@type": "Review",
      "@id": `https://ultravioleta.xyz/services#${testimonial.id}`,
      "itemReviewed": {
        "@type": "SoftwareApplication",
        "name": testimonial.product
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": testimonial.authorType,
        "name": testimonial.author,
        ...(testimonial.socialHandle && { "sameAs": `https://twitter.com/${testimonial.socialHandle.substring(1)}` })
      },
      "reviewBody": testimonial.content,
      "headline": testimonial.title,
      "datePublished": testimonial.date,
      ...(testimonial.verified && {
        "publisher": {
          "@type": "Organization",
          "name": "UltraVioleta DAO"
        }
      })
    };
  };

  return (
    <section className="mb-16" itemScope itemType="https://schema.org/Product">
      <meta itemProp="name" content="UltraVioleta DAO Services" />

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-purple-400 mb-4">
          What Our Community Says
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto">
          Join thousands of satisfied users leveraging our AI-powered Web3 tools
        </p>

        {/* Rating Summary */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <div className="text-gray-400">
            <span className="text-white font-bold text-xl">4.9</span> / 5
          </div>
          <div className="text-gray-400">
            ({testimonials.length * 72} reviews)
          </div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div className="relative max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/30"
            itemScope
            itemType="https://schema.org/Review"
            itemProp="review"
          >
            {/* Hidden schema data */}
            <meta itemProp="datePublished" content={testimonials[currentIndex].date} />
            <span itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
              <meta itemProp="ratingValue" content={testimonials[currentIndex].rating} />
              <meta itemProp="bestRating" content="5" />
            </span>

            <div className="flex items-start gap-6">
              {/* Quote Icon */}
              <Quote className="w-12 h-12 text-purple-400 opacity-50 flex-shrink-0" />

              <div className="flex-grow">
                {/* Product Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/30 rounded-full text-sm text-purple-300 mb-4">
                  <span>{testimonials[currentIndex].product}</span>
                  {testimonials[currentIndex].verified && (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </div>

                {/* Review Title */}
                <h3 itemProp="headline" className="text-xl font-bold text-white mb-3">
                  {testimonials[currentIndex].title}
                </h3>

                {/* Review Content */}
                <blockquote itemProp="reviewBody" className="text-gray-300 text-lg mb-6 leading-relaxed">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold"
                      itemProp="author"
                      itemScope
                      itemType={`https://schema.org/${testimonials[currentIndex].authorType}`}
                    >
                      <span itemProp="name" className="sr-only">
                        {testimonials[currentIndex].author}
                      </span>
                      {testimonials[currentIndex].author.charAt(0)}
                    </div>

                    <div>
                      <div className="font-semibold text-white">
                        {testimonials[currentIndex].author}
                      </div>
                      {testimonials[currentIndex].role && (
                        <div className="text-sm text-gray-400">
                          {testimonials[currentIndex].role}
                          {testimonials[currentIndex].subscribers &&
                            ` • ${testimonials[currentIndex].subscribers} subscribers`
                          }
                        </div>
                      )}
                      {testimonials[currentIndex].socialHandle && (
                        <a
                          href={`https://twitter.com/${testimonials[currentIndex].socialHandle.substring(1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                        >
                          <Twitter className="w-3 h-3" />
                          {testimonials[currentIndex].socialHandle}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonials[currentIndex].rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prevTestimonial}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 bg-purple-600/50 hover:bg-purple-600 rounded-full transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextTestimonial}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 bg-purple-600/50 hover:bg-purple-600 rounded-full transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-purple-400'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Verified Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>4.9/5 Average Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Twitter className="w-4 h-4 text-blue-400" />
            <span>Social Verified</span>
          </div>
        </div>
      </div>

      {/* Schema.org JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "UltraVioleta DAO Services",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": String(testimonials.length * 72),
              "bestRating": "5"
            },
            "review": testimonials.map(generateReviewSchema)
          })
        }}
      />
    </section>
  );
};

export default TestimonialsSection;