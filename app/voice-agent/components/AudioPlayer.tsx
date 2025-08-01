import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
  onEnded?: () => void
}

export default function AudioPlayer({ src, autoPlay = false, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (autoPlay) {
      // Note: In a real implementation, we'd play the audio
      // For now, just simulate playback
      setIsPlaying(true)
      setTimeout(() => {
        setIsPlaying(false)
        if (onEnded) onEnded()
      }, 3000) // Simulate 3 second audio
    }
  }, [src, autoPlay, onEnded])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <audio ref={audioRef} src={src} />
      
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={togglePlayPause}
          className="h-10 w-10 p-0"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        {/* Simple progress indicator */}
        <div className="flex-1">
          <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: isPlaying ? '50%' : '0%' }}
            />
          </div>
        </div>

        {/* Volume icon */}
        <Volume2 className="h-5 w-5 text-gray-500" />
      </div>

      {/* Visual waveform placeholder */}
      {isPlaying && (
        <div className="flex items-center justify-center gap-1 mt-3">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
} 