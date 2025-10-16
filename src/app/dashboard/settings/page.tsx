'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  MapPin,
  Clock,
  Save
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@alright.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+91 98765 43210" />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue="Manager" disabled />
                  </div>
                </div>
                <Button className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ticket-updates">Ticket Updates</Label>
                    <p className="text-sm text-gray-500">Get notified when ticket status changes</p>
                  </div>
                  <Switch id="ticket-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="assignment-alerts">Assignment Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified about new technician assignments</p>
                  </div>
                  <Switch id="assignment-alerts" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Auto-Assignment Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Auto-Assignment Settings
                </CardTitle>
                <CardDescription>Configure automatic technician assignment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-assign">Enable Auto-Assignment</Label>
                    <p className="text-sm text-gray-500">Automatically assign technicians to new tickets</p>
                  </div>
                  <Switch id="auto-assign" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-distance">Maximum Distance (km)</Label>
                    <Input id="max-distance" type="number" defaultValue="10" />
                  </div>
                  <div>
                    <Label htmlFor="response-time">Response Time (minutes)</Label>
                    <Input id="response-time" type="number" defaultValue="15" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Quick Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Set Default Location
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Working Hours
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Maps API</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Notifications</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Export Data
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
