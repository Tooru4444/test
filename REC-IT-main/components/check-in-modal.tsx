'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Clock, CheckCircle } from 'lucide-react'

interface UserProfile {
  role: 'student' | 'staff'
  email: string
  idImage?: string
}

interface CheckInModalProps {
  userProfile: UserProfile
  onClose: () => void
}

export default function CheckInModal({ userProfile, onClose }: CheckInModalProps) {
  const [currentEntry, setCurrentEntry] = useState<any>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    // Find the current user's most recent check-in entry
    const checkEntries = () => {
      const entries = JSON.parse(localStorage.getItem('checkInEntries') || '[]')
      const userEntry = entries
        .filter((entry: any) => entry.email === userProfile.email)
        .sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id))[0] // Get most recent
      
      if (userEntry) {
        setCurrentEntry(userEntry)
        if (userEntry.status === 'confirmed') {
          setIsConfirmed(true)
        }
      }
    }

    checkEntries()
    
    // Poll for status updates every 500ms
    const interval = setInterval(checkEntries, 500)
    
    return () => clearInterval(interval)
  }, [userProfile.email])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              {isConfirmed ? 'Check-In Confirmed!' : 'Check-In Submitted'}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            {userProfile.idImage && (
              <div className="mx-auto w-48 h-32 border rounded-lg overflow-hidden">
                <img 
                  src={userProfile.idImage || "/placeholder.svg"} 
                  alt="Student ID" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Email: {userProfile.email}</p>
              <p className="text-sm text-gray-600">
                Time: {currentEntry?.time || new Date().toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-600">
                Date: {currentEntry?.date || new Date().toLocaleDateString()}
              </p>
            </div>
            
            {isConfirmed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-800 font-medium">
                  Successfully Checked In!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Welcome to the Kettering Recreation Center
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2 animate-spin" />
                <p className="text-yellow-800 font-medium">
                  Waiting for staff confirmation...
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  Please wait while staff verifies your check-in
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
