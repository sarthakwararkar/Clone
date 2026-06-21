'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Send, Smile, MessageSquare, Heart, HelpCircle, PenTool } from 'lucide-react'

interface Message {
  id: string
  sender: 'sora' | 'user'
  text: string
  timestamp: Date
  showSuggestions?: boolean
}

interface FAQOption {
  label: string
  query: string
  keywords: string[]
  answer: string
}

const FAQ_OPTIONS: FAQOption[] = [
  {
    label: 'Top Deals',
    query: 'Where can I find the top deals?',
    keywords: ['deal', 'deals', 'top', 'best', 'offer', 'offers', 'hot', 'discount', 'discounts', 'featured'],
    answer: 'You can find all the best handpicked deals and offers on our [Best Offers](/best-offers) page! We update it daily with the highest discounts and verified hot coupons. ✨'
  },
  {
    label: 'Saved Coupons',
    query: 'Where can I find my saved coupons?',
    keywords: ['save', 'saved', 'coupon', 'coupons', 'my coupons', 'bookmark', 'bookmarks', 'favorite', 'favorites'],
    answer: 'Your saved coupons are stored in your profile! You can view them anytime on the [Saved Coupons](/account/saved) page. Make sure you are logged in to see them. 🔖'
  },
  {
    label: 'All Stores',
    query: 'What are all the stores?',
    keywords: ['store', 'stores', 'merchant', 'merchants', 'brand', 'brands', 'shop', 'shops', 'where can i shop', 'list'],
    answer: 'We support over 500+ top Indian brands! You can browse the complete list of stores on our [Stores](/stores) directory or view them by [Categories](/categories) like fashion, electronics, and food. 🛍️'
  },
  {
    label: 'How to Avail Coupons',
    query: 'How to avail coupons?',
    keywords: ['avail', 'use', 'apply', 'how to use', 'how to apply', 'work', 'redeem', 'click', 'get code', 'show deal'],
    answer: "To use a coupon, simply click on any 'Get Code' or 'Show Deal' button. The code will copy to your clipboard automatically, and a tab will open the merchant's store so you can paste it at checkout! 🛒"
  },
  {
    label: 'Cashback Tracking',
    query: 'How long does cashback tracking take?',
    keywords: ['cashback', 'track', 'tracking', 'pending', 'missing', 'money', 'wallet'],
    answer: 'Cashback tracking usually takes between 24 to 72 hours from the time of your purchase. Once tracked, it will show as "Pending" in your user dashboard! 💸'
  }
]

export function SoraFAQBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize chatbot with greeting
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'sora',
        text: "Hi there! (´ ▽ ` )ﾉ I'm Sora! I can totally help! Just tell me what you're looking for! Ask me anything about DealDhamal! ✨",
        timestamp: new Date(),
        showSuggestions: true
      }
    ])
  }, [])

  // Auto-scroll when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Handle open/close with indicator cleanup
  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setHasNewMessage(false)
    }
  }

  // Parse markdown links like [Text](/url) into JSX
  const renderMessageText = (text: string) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex))
      }
      const label = match[1]
      const url = match[2]
      parts.push(
        <Link
          key={url + matchIndex}
          href={url as any}
          onClick={() => setIsOpen(false)} // Close bot window when user navigates
          className="text-white underline font-extrabold hover:text-cyan-200 transition-colors"
        >
          {label}
        </Link>
      )
      lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  // Answer matching algorithm
  const getAnswerForQuery = (query: string): { text: string; showSuggestions: boolean } => {
    const cleanQuery = query.toLowerCase().trim()

    // 1. Basic greetings check
    const greetings = ['hi', 'hello', 'hey', 'yo', 'hola', 'greetings', 'sup', 'sora']
    if (greetings.some(g => cleanQuery === g || cleanQuery.startsWith(g + ' '))) {
      return {
        text: "Hello! (〃＾▽＾〃) I'm Sora, your friendly DealDhamal guide! Choose one of the options below or ask me about coupons, cashback, or stores!",
        showSuggestions: true
      }
    }

    // 2. Keyword matching with FAQs
    let bestMatch: FAQOption | null = null
    let maxMatches = 0

    for (const faq of FAQ_OPTIONS) {
      let matches = 0
      for (const word of faq.keywords) {
        if (cleanQuery.includes(word)) {
          matches++
        }
      }
      // Give additional weight to direct question matches
      if (cleanQuery.includes(faq.label.toLowerCase())) {
        matches += 2
      }

      if (matches > maxMatches) {
        maxMatches = matches
        bestMatch = faq
      }
    }

    if (bestMatch && maxMatches > 0) {
      return {
        text: bestMatch.answer,
        showSuggestions: false
      }
    }

    // 3. Fallback
    return {
      text: "I'm sorry, I'm only trained to answer specific questions about DealDhamal! (´; ω ; `) Try asking about coupons, cashback, or stores, or select one of these options:",
      showSuggestions: true
    }
  }

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMsgId = `user-${Date.now()}`
    const newUserMessage: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue('')

    // Simulate Sora's response typing delay
    setTimeout(() => {
      const response = getAnswerForQuery(textToSend)
      const botMsgId = `sora-${Date.now()}`
      const newBotMessage: Message = {
        id: botMsgId,
        sender: 'sora',
        text: response.text,
        timestamp: new Date(),
        showSuggestions: response.showSuggestions
      }
      setMessages((prev) => [...prev, newBotMessage])
      if (!isOpen) {
        setHasNewMessage(true)
      }
    }, 600)
  }

  return (
    <>
      {/* Floating launcher bubble button */}
      <button
        onClick={toggleChat}
        id="sora-chatbot-launcher"
        className={`fixed bottom-6 right-6 z-50 group flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isOpen ? 'scale-0 pointer-events-none' : 'scale-100'
        }`}
        aria-label="Open Sora FAQ Chatbot"
      >
        {/* Sparkles / Floating bubble elements around avatar */}
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/35 to-cyan-500/35 rounded-full blur-md group-hover:blur-lg group-hover:scale-110 transition-all duration-300"></div>
        
        {/* Floating Mini Elements */}
        <div className="absolute -top-3 -left-2 bg-pink-400 text-white rounded-full p-1 shadow-md scale-75 group-hover:scale-90 transition-transform duration-300 animate-[bounce_2s_infinite]">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <div className="absolute -top-1 -right-3 bg-cyan-400 text-white rounded-full p-1 shadow-md scale-75 group-hover:scale-90 transition-transform duration-300 animate-[bounce_2.5s_infinite_100ms]">
          <HelpCircle className="w-3.5 h-3.5" />
        </div>
        <div className="absolute bottom-4 -right-2 bg-pink-300 text-white rounded-full p-0.5 shadow-md scale-75 group-hover:scale-90 transition-transform duration-300 animate-[bounce_3s_infinite_200ms]">
          <Heart className="w-3 h-3 fill-white" />
        </div>

        {/* Circular Avatar Bubble Container */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-pink-400/50 bg-slate-900/10 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.35)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] group-hover:border-cyan-400/60 transition-all duration-300 animate-[float_4s_ease-in-out_infinite]">
          <Image
            src="/sora-avatar-v2.png"
            alt="Sora Mascot"
            width={80}
            height={80}
            className="object-cover w-full h-full transform scale-110 group-hover:scale-120 transition-transform duration-300"
            unoptimized
          />
        </div>

        {/* Pink "CHAT!" badge */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase absolute -bottom-1 shadow-md border border-white/20 scale-95 group-hover:scale-105 transition-transform duration-300">
          CHAT!
        </div>

        {/* Unread message notification dot */}
        {hasNewMessage && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border border-white text-[8px] text-white items-center justify-center font-bold">1</span>
          </span>
        )}
      </button>

      {/* Chat window panel */}
      <div
        id="sora-chatbot-window"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          width: '380px',
          maxWidth: 'calc(100vw - 2rem)',
          height: '480px',
          maxHeight: 'calc(100vh - 6rem)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3)',
          transition: 'all 300ms ease-in-out',
          transformOrigin: 'bottom right',
          transform: isOpen ? 'scale(1)' : 'scale(0)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}
        className="bg-white/80 dark:bg-slate-950/80"
      >
        {/* Soft background glows - positioned inside bounds to avoid clipping */}
        <div className="absolute -z-10 w-44 h-44 bg-pink-400/20 rounded-full blur-3xl top-0 left-0 pointer-events-none"></div>
        <div className="absolute -z-10 w-44 h-44 bg-cyan-400/20 rounded-full blur-3xl bottom-0 right-0 pointer-events-none"></div>

        {/* Header */}
        <div 
          style={{
            height: '64px',
            minHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '16px',
            paddingRight: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            position: 'relative'
          }}
          className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-500 text-white shadow-sm shrink-0"
        >
          {/* macOS window dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          </div>

          {/* Centered Brand / Sora profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
              <Image
                src="/sora-avatar-v2.png"
                alt="Sora"
                width={36}
                height={36}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontWeight: 800, fontSize: '14px', lineHeight: '1.2' }}>Sora • FAQ Bot</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: '1', marginTop: '2px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#34d399', borderRadius: '50%' }} className="animate-pulse"></span>
                Active Guide
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={toggleChat}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'background-color 200ms'
            }}
            className="hover:bg-white/10"
            aria-label="Close Chat"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Scrollable messages container */}
        <div 
          style={{
            flex: '1 1 0%',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
          className="no-scrollbar"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', maxWidth: '85%', alignItems: 'flex-start' }}>
                {msg.sender === 'sora' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(236,72,153,0.2)', backgroundColor: '#fdf2f8', overflow: 'hidden', flexShrink: 0, marginTop: '2px' }}>
                    <Image
                      src="/sora-avatar-v2.png"
                      alt="Sora"
                      width={28}
                      height={28}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                )}
                
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-none border border-slate-100 dark:border-slate-700/50 self-end ml-auto'
                      : 'bg-gradient-to-br from-pink-500 via-pink-600 to-rose-500 text-white rounded-tl-none self-start shadow-pink-100 dark:shadow-none'
                  }`}
                >
                  {msg.sender === 'sora' ? renderMessageText(msg.text) : msg.text}
                </div>
              </div>

              {/* Suggestions quick-click list (only shown on bot replies that require selection) */}
              {msg.sender === 'sora' && msg.showSuggestions && (
                <div style={{ paddingLeft: '36px', marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '100%' }}>
                  {FAQ_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleSendMessage(option.query)}
                      className="px-3 py-1.5 rounded-full border border-pink-300 text-pink-600 dark:border-pink-500/40 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-950/20 hover:bg-gradient-to-r hover:from-pink-500 hover:to-cyan-500 hover:text-white hover:border-transparent transition-all duration-200 text-[10px] font-bold cursor-pointer shadow-sm active:scale-95"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage(inputValue)
          }}
          style={{
            padding: '12px',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            backgroundColor: 'rgba(255,255,255,0.6)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
          className="dark:bg-slate-900/60 dark:border-slate-800/50"
        >
          {/* Pencil icon decorative decoration */}
          <div style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: '#94a3b8', pointerEvents: 'none' }}>
            <PenTool style={{ width: '14px', height: '14px' }} />
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Sora a question..."
            style={{
              width: '100%',
              borderRadius: '9999px',
              paddingTop: '10px',
              paddingBottom: '10px',
              paddingLeft: '38px',
              paddingRight: '80px',
              fontSize: '12px',
              border: '1px solid rgba(0,0,0,0.1)',
              outline: 'none'
            }}
            className="bg-white dark:bg-slate-800 dark:border-slate-700/50 dark:text-slate-100 text-slate-800 focus:ring-2 focus:ring-pink-500/50"
          />

          <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="hover:text-pink-500 transition-colors"
              aria-label="Add Emoji"
              onClick={() => setInputValue(prev => prev + ' ✨')}
            >
              <Smile style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              type="submit"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:scale-105 active:scale-95 transition-transform"
              aria-label="Send Message"
            >
              <Send style={{ width: '14px', height: '14px', transform: 'rotate(-12deg)' }} />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
