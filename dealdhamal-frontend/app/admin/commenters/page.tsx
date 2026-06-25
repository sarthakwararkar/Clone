'use client'
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Search, ExternalLink, Award, Upload, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
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

export default function AdminCommentersPage() {
  const [search, setSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCommentator, setEditingCommentator] = useState<YoutubeCommentator | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [youtubeHandle, setYoutubeHandle] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [channelUrl, setChannelUrl] = useState('')
  const [commentText, setCommentText] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  // Cloudinary Upload using backend API and ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file')
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image size must be less than 2MB')
    }
    try {
      setUploading(true)
      toast.info('Uploading image to Cloudinary...')
      const secureUrl = await api.adminUploadFile(file, 'avatars')
      setAvatarUrl(secureUrl)
      toast.success('Image uploaded successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const queryClient = useQueryClient()

  // Queries
  const { data: commentators = [], isLoading } = useQuery({
    queryKey: ['adminCommentators'],
    queryFn: () => api.adminGetCommentators(),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.adminCreateCommentator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCommentators'] })
      toast.success('Commentator added successfully')
      resetForm()
      setIsAddModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add commentator')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.adminUpdateCommentator(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCommentators'] })
      toast.success('Commentator updated successfully')
      resetForm()
      setEditingCommentator(null)
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update commentator')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.adminDeleteCommentator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCommentators'] })
      toast.success('Commentator deleted successfully')
      setDeletingId(null)
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete commentator')
      setDeletingId(null)
    },
  })

  const resetForm = () => {
    setName('')
    setYoutubeHandle('')
    setAvatarUrl('')
    setChannelUrl('')
    setCommentText('')
    setIsFeatured(false)
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (comm: YoutubeCommentator) => {
    setEditingCommentator(comm)
    setName(comm.name)
    setYoutubeHandle(comm.youtube_handle || '')
    setAvatarUrl(comm.avatar_url || '')
    setChannelUrl(comm.channel_url || '')
    setCommentText(comm.comment_text || '')
    setIsFeatured(comm.is_featured)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required')
    createMutation.mutate({
      name,
      youtube_handle: youtubeHandle.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      channel_url: channelUrl.trim() || null,
      comment_text: commentText.trim() || null,
      is_featured: isFeatured,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCommentator) return
    if (!name.trim()) return toast.error('Name is required')
    updateMutation.mutate({
      id: editingCommentator.id,
      data: {
        name,
        youtube_handle: youtubeHandle.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        channel_url: channelUrl.trim() || null,
        comment_text: commentText.trim() || null,
        is_featured: isFeatured,
      },
    })
  }

  const filtered = commentators.filter((c) => {
    const term = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(term) ||
      (c.youtube_handle && c.youtube_handle.toLowerCase().includes(term)) ||
      (c.comment_text && c.comment_text.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">YouTube Commentators Campaign</h1>
          <p className="text-xs text-gray-500">Manage the list of commentators to thank on the public campaign page.</p>
        </div>
        <Button onClick={handleOpenAdd} className="sm:self-start">
          <Plus className="w-4 h-4" /> Add Commentator
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, handle, or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <YoutubeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-semibold">No commentators found</p>
          <p className="text-gray-400 text-xs mt-1">Try refining your search or add a new commentator.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Commentator</th>
                  <th className="px-6 py-4">YouTube Handle</th>
                  <th className="px-6 py-4">Featured Message</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {filtered.map((comm) => (
                  <tr key={comm.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                          {comm.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={comm.avatar_url} alt={comm.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${getGradient(comm.name)} text-white flex items-center justify-center text-xs font-bold`}>
                              {getInitials(comm.name)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{comm.name}</p>
                          {comm.channel_url && (
                            <a
                              href={comm.channel_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                            >
                              Visit Channel <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {comm.youtube_handle || '-'}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-xs text-gray-500 italic">
                        {comm.comment_text ? `"${comm.comment_text}"` : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {comm.is_featured ? (
                        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full font-semibold border border-yellow-100">
                          <Award className="w-3.5 h-3.5" /> Featured
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(comm)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(comm.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add YouTube Commentator">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarthak Wararkar"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">YouTube Handle</label>
            <input
              type="text"
              value={youtubeHandle}
              onChange={(e) => setYoutubeHandle(e.target.value)}
              placeholder="e.g. @sarthak"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Avatar / Logo</label>
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-150">
              <div className="w-14 h-14 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-white relative flex-shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getGradient(name)} text-white flex items-center justify-center text-sm font-bold`}>
                    {getInitials(name)}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center p-0.5">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="text-[8px] font-bold mt-0.5 leading-tight">Uploading...</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarUrl('')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-[9px] text-gray-400">JPG, PNG or WebP. Max 2MB.</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Avatar URL (Optional)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste an image URL directly..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Channel Link</label>
            <input
              type="url"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="e.g. https://youtube.com/@sarthak"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Comment Text</label>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write the comment or thanking note here..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeaturedAdd"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isFeaturedAdd" className="text-sm font-semibold text-gray-700 select-none">
              Mark as Featured Commentator
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editingCommentator !== null} onClose={() => setEditingCommentator(null)} title="Edit YouTube Commentator">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">YouTube Handle</label>
            <input
              type="text"
              value={youtubeHandle}
              onChange={(e) => setYoutubeHandle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Avatar / Logo</label>
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-150">
              <div className="w-14 h-14 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-white relative flex-shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getGradient(name)} text-white flex items-center justify-center text-sm font-bold`}>
                    {getInitials(name)}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center p-0.5">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="text-[8px] font-bold mt-0.5 leading-tight">Uploading...</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarUrl('')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-[9px] text-gray-400">JPG, PNG or WebP. Max 2MB.</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Avatar URL (Optional)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste an image URL directly..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Channel Link</label>
            <input
              type="url"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Comment Text</label>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeaturedEdit"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isFeaturedEdit" className="text-sm font-semibold text-gray-700 select-none">
              Mark as Featured Commentator
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingCommentator(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deletingId !== null} onClose={() => setDeletingId(null)} title="Delete Commentator">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to remove this commentator from the campaign? This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              loading={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
