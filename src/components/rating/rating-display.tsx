'use client'

import { Star, MessageSquare, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Rating {
  id: string
  rating: number
  comment?: string
  created_at: string
  tickets?: {
    tracking_number: string
    customer_name: string
  }
}

interface RatingDisplayProps {
  ratings: Rating[]
  showTicketInfo?: boolean
}

export default function RatingDisplay({ ratings, showTicketInfo = false }: RatingDisplayProps) {
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    percentage: ratings.length > 0 
      ? (ratings.filter(r => r.rating === star).length / ratings.length) * 100 
      : 0
  }))

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 ${
                star <= Math.round(averageRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600">
          Based on {ratings.length} review{ratings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2">
        {ratingCounts.map(({ star, count, percentage }) => (
          <div key={star} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 w-8">
              <span className="text-sm font-medium">{star}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-8 text-right">
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Individual Reviews */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Recent Reviews</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {ratings.slice(0, 5).map((rating) => (
              <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                  </div>
                </div>
                
                {showTicketInfo && rating.tickets && (
                  <p className="text-sm text-gray-600 mb-2">
                    Ticket: {rating.tickets.tracking_number} - {rating.tickets.customer_name}
                  </p>
                )}
                
                {rating.comment && (
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{rating.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

