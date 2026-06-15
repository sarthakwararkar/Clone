'use client'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updatePassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/Button'

export function PasswordChangeForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      const user = auth.currentUser
      if (!user) {
        // Support mock session update
        const isMock = localStorage.getItem('mock_firebase_session') !== null
        if (isMock) {
          toast.success('Password updated successfully (Mock)!')
          setNewPassword('')
          setConfirmPassword('')
          return
        }
        throw new Error('No authenticated user found')
      }

      await updatePassword(user, newPassword)
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
      <h3 className="font-extrabold text-gray-900 text-sm">Security &amp; Password</h3>

      <div>
        <label htmlFor="change-new-pwd" className="block text-[11px] font-bold text-gray-750 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            id="change-new-pwd"
            type={showPwd ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 pr-9 border border-gray-250 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="change-confirm-pwd" className="block text-[11px] font-bold text-gray-750 mb-1">
          Confirm New Password
        </label>
        <input
          id="change-confirm-pwd"
          type={showPwd ? 'text' : 'password'}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="••••••••"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={submitting}
        className="w-full text-xs py-2.5 font-bold cursor-pointer"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
          </span>
        ) : (
          'Update Password'
        )}
      </Button>
    </form>
  )
}
