import { VideoSuggestion } from '@/types'
import Link from 'next/link'

interface VideoSuggestionsProps {
  suggestions: VideoSuggestion[]
}

export default function VideoSuggestions({ suggestions }: VideoSuggestionsProps) {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Recommended for you:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {suggestions.map((video) => (
          <Link
            key={video.id}
            href={`/video/${video.id}`}
            className="block bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
          >
            <div className="flex items-start space-x-2 mb-2">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                {video.category.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                  {video.title}
                </h3>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {video.reason}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="bg-blue-100 px-2 py-1 rounded">{video.category}</span>
              <span>{video.duration}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
