'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Bell, CheckCircle, AlertCircle, Clock, MapPin } from 'lucide-react'

interface Notification {
  id: string
  type: 'ticket_created' | 'ticket_updated' | 'technician_assigned' | 'technician_arrived' | 'job_completed'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface RealtimeNotificationProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onClearAll: () => void
}

export default function RealtimeNotification({ 
  notifications, 
  onMarkAsRead, 
  onClearAll 
}: RealtimeNotificationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ticket_created':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'ticket_updated':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'technician_assigned':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'technician_arrived':
        return <MapPin className="h-4 w-4 text-purple-500" />
      case 'job_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ticket_created':
        return 'border-l-blue-500 bg-blue-50'
      case 'ticket_updated':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'technician_assigned':
        return 'border-l-green-500 bg-green-50'
      case 'technician_arrived':
        return 'border-l-purple-500 bg-purple-50'
      case 'job_completed':
        return 'border-l-green-600 bg-green-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
