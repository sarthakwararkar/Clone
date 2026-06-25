import { redirect } from 'next/navigation'

export default function CommentersRedirectPage() {
  redirect('/youtube-commenters' as any)
}
