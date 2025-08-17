"use client"

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy } from 'lucide-react'

export type ClientCtasProps = {
  providerId: string
  name: string
  address?: string
  phone?: string
  category?: string
  compact?: boolean
}

export function ClientCTAs({name, address,compact }: ClientCtasProps) {
  const onShare = useCallback(async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      if (navigator.share) {
        await navigator.share({ title: name, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard')
      }
    } catch {}
  }, [name])

  const onCopyAddress = useCallback(async () => {
    try {
      if (!address) return
      await navigator.clipboard.writeText(address)
    } catch {}
  }, [address])

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button aria-label="Share provider" variant="outline" className="h-9" onClick={onShare}><Share2 className="mr-2" /> Share</Button>
        <Button aria-label="Copy address" disabled={!address} variant="outline" className="h-9" onClick={onCopyAddress}><Copy className="mr-2" /> Copy</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button aria-label="Share provider" variant="outline" className="h-9" onClick={onShare}><Share2 className="mr-2" /> Share</Button>
      <Button aria-label="Copy address" disabled={!address} variant="outline" className="h-9" onClick={onCopyAddress}><Copy className="mr-2" /> Copy</Button>
    </div>
  )
}

export default ClientCTAs


