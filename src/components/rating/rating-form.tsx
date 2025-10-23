'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, Send, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ratingCreateSchema } from '@/lib/validation'

type RatingFormData = {
  rating: number
  comment?: string
}

interface RatingFormProps {
  ticketId: string
  technicianId: string
  customerEmail: string
  onSuccess?: () => void
}

export default function RatingForm({ ticketId, technicianId, customerEmail, onSuccess }: RatingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema)
  })

  const rating = watch('rating', 0)

  const onSubmit = async (data: RatingFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          technician_id: technicianId,
          customer_email: customerEmail,
          rating: data.rating,
          comment: data.comment
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        onSuccess?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Thank You!
          </h3>
          <p className="text-gray-600">
            Your rating has been submitted successfully.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Rate Your Service</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Star Rating */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              How would you rate this service? *
            </Label>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setValue('rating', star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredStar || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
            )}
            <input
              type="hidden"
              {...register('rating', { required: true, min: 1, max: 5 })}
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
              Additional Comments (Optional)
            </Label>
            <textarea
              id="comment"
              {...register('comment')}
              rows={3}
              placeholder="Tell us about your experience..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
            />
            {errors.comment && (
              <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Rating
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

