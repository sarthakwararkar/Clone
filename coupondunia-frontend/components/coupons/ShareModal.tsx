'use client'
import { useState, useCallback, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Link2, Mail, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  title: string
}

export function ShareModal({ isOpen, onClose, shareUrl, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [absoluteUrl, setAbsoluteUrl] = useState('')

  // Resolve absolute URL client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin
      setAbsoluteUrl(shareUrl.startsWith('http') ? shareUrl : `${origin}${shareUrl}`)
    }
  }, [shareUrl, isOpen])

  const handleCopy = useCallback(async () => {
    if (!absoluteUrl) return
    try {
      await navigator.clipboard.writeText(absoluteUrl)
      setCopied(true)
      toast.success('Link copied to clipboard! ✓')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }, [absoluteUrl])

  const shareText = `Check out this offer on DealDhamal: ${title}`

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} - ${absoluteUrl}`)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Awesome Deal on DealDhamal: ${title}`)
    const body = encodeURIComponent(`Hi!\n\nI found this great deal on DealDhamal:\n\n${title}\n\nCheck it out here: ${absoluteUrl}\n\nHappy saving!`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share This Offer" maxWidth="max-w-md">
      <div className="space-y-6 pt-4">
        
        {/* Share buttons grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all group gap-2"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 transition-transform group-hover:scale-110">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.962 3.21 1.48 4.757 1.485 5.429.002 9.841-4.408 9.843-9.839.002-2.63-1.018-5.101-2.872-6.958C16.463 1.986 13.992.96 11.998.96 6.571.96 2.16 5.372 2.158 10.8c-.001 1.761.47 3.42 1.364 4.88l-1.01 3.69 3.792-.994zM16.57 13.68c-.27-.135-1.597-.788-1.846-.879-.25-.09-.43-.135-.61.135-.18.27-.698.88-.854 1.058-.157.177-.315.2-.585.065-.27-.135-1.14-.42-2.172-1.34-1.03-.92-1.72-2.055-1.922-2.394-.2-.339-.022-.522.148-.691.153-.153.338-.395.508-.593.169-.198.225-.339.339-.564.113-.226.056-.423-.028-.593-.085-.17-.733-1.768-.999-2.42-.26-.636-.525-.55-.718-.56-.186-.01-.4-.01-.61-.01-.21 0-.555.08-.846.395-.29.316-1.11 1.085-1.11 2.646 0 1.56 1.132 3.072 1.288 3.284.156.21 2.23 3.398 5.397 4.767.75.325 1.339.52 1.799.664.757.24 1.446.207 1.99.126.608-.09 1.598-.654 1.824-1.284.226-.63.226-1.17.158-1.284-.067-.113-.25-.203-.52-.338z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">WhatsApp</span>
          </button>

          {/* Email Button */}
          <button
            onClick={handleEmailShare}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group gap-2"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Email</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">Or copy link</span>
          </div>
        </div>

        {/* Copy Link Input Field */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              readOnly
              value={absoluteUrl}
              onClick={handleCopy}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none cursor-pointer text-gray-600 select-all font-mono"
            />
          </div>
          <Button
            variant={copied ? 'secondary' : 'primary'}
            onClick={() => void handleCopy()}
            className="px-4 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>

      </div>
    </Modal>
  )
}
