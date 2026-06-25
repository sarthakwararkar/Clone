import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, MessageSquare, Heart, Award } from 'lucide-react'
import { api } from '@/lib/api'
import type { YoutubeCommentator } from '@/types'

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const getInitials = (name: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getGradient = (name: string) => {
  if (!name) return 'from-gray-500 to-gray-600'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const gradients = [
    'from-red-500 to-orange-500',
    'from-orange-500 to-yellow-500',
    'from-pink-500 to-rose-500',
    'from-rose-500 to-red-600',
    'from-amber-500 to-red-500',
    'from-red-500 to-pink-500',
  ]
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

export const revalidate = 300 // ISR every 5 minutes

export const metadata: Metadata = {
  title: 'Our YouTube Supporters | Thanking All Of You | DealDhamal',
  description: 'A special page dedicated to thanking our YouTube commentators and supporters who help grow DealDhamal. We appreciate all of you!',
}

export default async function YoutubeCommentersPage() {
  let commentators: YoutubeCommentator[] = []
  try {
    commentators = await api.getCommentators()
  } catch (err) {
    console.error('Failed to load commentators for public page:', err)
  }

  const featuredCommentators = commentators.filter(c => c.is_featured)
  const regularCommentators = commentators.filter(c => !c.is_featured)

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Premium Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-gray-950 via-gray-900 to-red-950 text-white px-6 py-16 md:py-24 border border-gray-800 shadow-2xl text-center">
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #E84141 0%, transparent 70%)' }} />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider animate-pulse">
            <YoutubeIcon className="w-4 h-4 fill-primary text-primary" /> YouTube Campaign 2026
          </div>
          
          {/* Big Header Text */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-gray-100 to-red-300 bg-clip-text text-transparent drop-shadow-sm uppercase">
            thanking all of you
          </h1>
          
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium">
            Our YouTube commentators are the heartbeat of our community. This page is dedicated to acknowledging your support, feedback, and presence. Thank you for being part of DealDhamal!
          </p>

          <div className="flex justify-center gap-2 pt-2">
            <div className="flex -space-x-2.5">
              {commentators.slice(0, 5).map((c, i) => (
                <div 
                  key={c.id || i} 
                  className="w-9 h-9 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0"
                >
                  {c.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(c.name)} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {getInitials(c.name)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {commentators.length > 0 && (
              <p className="text-xs text-gray-500 self-center ml-2">
                Joined by <span className="text-white font-semibold">{commentators.length}+</span> amazing creators & commenters
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Featured Supporters Section */}
      {featuredCommentators.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Award className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">Featured Supporters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCommentators.map((c) => (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl p-6 border-2 border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 shadow-md hover:shadow-xl relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Gold Highlight Tag */}
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 fill-yellow-950" /> Featured
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                      {c.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getGradient(c.name)} text-white flex items-center justify-center text-sm font-bold`}>
                          {getInitials(c.name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base group-hover:text-primary transition-colors">{c.name}</h3>
                      {c.youtube_handle && (
                        <p className="text-xs text-gray-400 font-semibold">{c.youtube_handle}</p>
                      )}
                    </div>
                  </div>

                  {c.comment_text && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative mt-2 flex-1">
                      <MessageSquare className="w-4 h-4 text-gray-300 absolute top-3 left-3" />
                      <p className="text-xs text-gray-600 italic leading-relaxed pl-5">
                        &ldquo;{c.comment_text}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {c.channel_url && (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Supported DealDhamal on Youtube</span>
                    <a 
                      href={c.channel_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-primary-dark font-bold flex items-center gap-1 transition-colors"
                    >
                      Visit Channel <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Supporters Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" />
          <h2 className="text-xl font-bold text-gray-800">Our Community</h2>
        </div>

        {regularCommentators.length === 0 && featuredCommentators.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center max-w-md mx-auto shadow-sm">
            <YoutubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800">Starting the Campaign</h3>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              We are currently setting up the campaign! Add commentators from the admin panel to display them here.
            </p>
          </div>
        ) : regularCommentators.length === 0 ? (
          <p className="text-gray-400 text-xs italic text-center py-4">All supporters are highlighted in the featured section above!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {regularCommentators.map((c) => (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-red-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                      {c.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getGradient(c.name)} text-white flex items-center justify-center text-xs font-bold`}>
                          {getInitials(c.name)}
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-gray-800 text-sm truncate group-hover:text-primary transition-colors">{c.name}</h3>
                      {c.youtube_handle && (
                        <p className="text-xs text-gray-400 truncate">{c.youtube_handle}</p>
                      )}
                    </div>
                  </div>

                  {c.comment_text && (
                    <p className="text-xs text-gray-500 leading-relaxed italic bg-gray-50 rounded-xl p-3 border border-gray-50/50">
                      &ldquo;{c.comment_text}&rdquo;
                    </p>
                  )}
                </div>

                {c.channel_url && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <a 
                      href={c.channel_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-gray-600 hover:text-primary font-semibold flex items-center gap-1 transition-colors"
                    >
                      Channel <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Call-to-action */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-primary/10 rounded-3xl p-6 md:p-8 text-center space-y-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          Want to be listed here?
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto">
          Simply subscribe to our official channel, comment on our latest videos with your valuable feedback, and our administrators will review and list your channel on this dedicated page!
        </p>
        <div>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-dark font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <YoutubeIcon className="w-4 h-4 fill-white text-white" /> Visit Our YouTube Channel
          </a>
        </div>
      </div>
    </div>
  )
}
