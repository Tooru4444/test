'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Activity, MessageCircle, CheckCircle, Clock, MapPin, Plus, X } from 'lucide-react'
import Navigation from '@/components/navigation'
import CheckInModal from '@/components/check-in-modal'
import EntryTable from '@/components/entry-table'
import DailyLogsTable from '@/components/daily-logs-table'

interface UserProfile {
  role: 'student' | 'staff'
  email: string
  idImage?: string
  name?: string
  photoURL?: string
}

interface CheckInEntry {
  id: string
  email: string
  idImage: string
  time: string
  date: string
  status: 'pending' | 'confirmed'
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [checkInEntries, setCheckInEntries] = useState<CheckInEntry[]>([])
  const [checkInSuccess, setCheckInSuccess] = useState(false)
  const router = useRouter()

  const [currentDate, setCurrentDate] = useState(new Date().toDateString())
  const [dailyLogs, setDailyLogs] = useState<{[date: string]: CheckInEntry[]}>({})
  const [activeTab, setActiveTab] = useState<'current' | 'logs'>('current')

  useEffect(() => {
    const profile = localStorage.getItem('userProfile')
    if (!profile) {
      router.push('/')
      return
    }
    setUserProfile(JSON.parse(profile))

    // Check if it's a new day and archive previous entries
    const today = new Date().toDateString()
    const lastDate = localStorage.getItem('lastActiveDate')
    
    if (lastDate && lastDate !== today) {
      // Archive yesterday's entries
      const entries = JSON.parse(localStorage.getItem('checkInEntries') || '[]')
      if (entries.length > 0) {
        const logs = JSON.parse(localStorage.getItem('dailyLogs') || '{}')
        logs[lastDate] = entries
        localStorage.setItem('dailyLogs', JSON.stringify(logs))
        setDailyLogs(logs)
        
        // Clear current entries for new day
        localStorage.setItem('checkInEntries', '[]')
        setCheckInEntries([])
      }
    }
    
    // Set current date
    localStorage.setItem('lastActiveDate', today)
    setCurrentDate(today)

    // Load existing logs
    const savedLogs = localStorage.getItem('dailyLogs')
    if (savedLogs) {
      setDailyLogs(JSON.parse(savedLogs))
    }

    // Load existing check-in entries and set up polling for real-time updates
    const loadEntries = () => {
      const entries = JSON.parse(localStorage.getItem('checkInEntries') || '[]')
      // Sort entries by ID (timestamp) in descending order - latest first
      const sortedEntries = entries.sort((a: CheckInEntry, b: CheckInEntry) => 
        parseInt(b.id) - parseInt(a.id)
      )
      setCheckInEntries(sortedEntries)
    }

    // Auto-save entries every 30 seconds
    const autoSave = () => {
      const entries = JSON.parse(localStorage.getItem('checkInEntries') || '[]')
      if (entries.length > 0) {
        // Create backup with timestamp
        const backup = {
          date: today,
          entries: entries,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('checkInBackup', JSON.stringify(backup))
        console.log('Auto-saved entries at:', new Date().toLocaleTimeString())
      }
    }

    // Check for confirmation updates (for students)
    const checkForConfirmation = () => {
      const confirmedId = localStorage.getItem('checkInConfirmed')
      const confirmedTime = localStorage.getItem('checkInConfirmedTime')
      
      if (confirmedId && confirmedTime) {
        const timeStamp = parseInt(confirmedTime)
        const now = Date.now()
        
        // If confirmation is recent (within last 10 seconds) and modal is open
        if (now - timeStamp < 10000 && showCheckInModal) {
          setShowCheckInModal(false)
          setCheckInSuccess(true)
          
          // Clear the confirmation flags
          localStorage.removeItem('checkInConfirmed')
          localStorage.removeItem('checkInConfirmedTime')
        }
      }
    }

    loadEntries()
    checkForConfirmation()
    autoSave() // Initial auto-save

    // Poll for updates every 1 second for better responsiveness
    const interval = setInterval(() => {
      loadEntries()
      checkForConfirmation()
    }, 1000)

    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(autoSave, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(autoSaveInterval)
    }
  }, [router, showCheckInModal])

  const handleCheckIn = () => {
    if (!userProfile || userProfile.role !== 'student') return
  
    const newEntry: CheckInEntry = {
      id: Date.now().toString(),
      email: userProfile.email,
      idImage: userProfile.idImage || '',
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      status: 'pending'
    }

    // Get existing entries and add the new one
    const existingEntries = JSON.parse(localStorage.getItem('checkInEntries') || '[]')
    const updatedEntries = [newEntry, ...existingEntries] // Add to beginning for latest first
    
    // Save to localStorage
    localStorage.setItem('checkInEntries', JSON.stringify(updatedEntries))
    localStorage.setItem('globalCheckInEntries', JSON.stringify(updatedEntries))
    
    setCheckInEntries(updatedEntries)
    setShowCheckInModal(true)
    
    console.log('New check-in entry created:', newEntry)
  }

  const handleStaffConfirm = (entryId: string) => {
    const updatedEntries = checkInEntries.map(entry =>
      entry.id === entryId ? { ...entry, status: 'confirmed' as const } : entry
    )
    
    setCheckInEntries(updatedEntries)
    localStorage.setItem('checkInEntries', JSON.stringify(updatedEntries))
    localStorage.setItem('globalCheckInEntries', JSON.stringify(updatedEntries))
    
    // Trigger success notification for students
    localStorage.setItem('checkInConfirmed', entryId)
    localStorage.setItem('checkInConfirmedTime', Date.now().toString())
    
    console.log('Entry confirmed:', entryId)
    console.log('Updated entries:', updatedEntries)
  }

  const createTestEntry = () => {
    const testEntry: CheckInEntry = {
      id: 'test-' + Date.now().toString(),
      email: 'test.student@kettering.edu',
      idImage: '/placeholder.svg?height=100&width=150&text=Test+ID',
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      status: 'pending'
    }
  
    const updatedEntries = [...checkInEntries, testEntry]
    setCheckInEntries(updatedEntries)
    localStorage.setItem('checkInEntries', JSON.stringify(updatedEntries))
    localStorage.setItem('globalCheckInEntries', JSON.stringify(updatedEntries))
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        userRole={userProfile.role} 
        userName={userProfile.name} 
        userPhoto={userProfile.photoURL} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            REC-IT: Where every engineer unwinds
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your one-stop hub for events, clubs, pool hours, and equipment status at the Kettering Rec Center.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Calendar and Equipment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Calendar Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className="min-h-24 border rounded p-2 text-sm">
                      <div className="font-medium">{i + 3}</div>
                      {i === 1 && (
                        <div className="bg-blue-100 text-blue-800 rounded px-1 py-0.5 text-xs mt-1">
                          Basketball 6PM
                        </div>
                      )}
                      {i === 3 && (
                        <div className="bg-green-100 text-green-800 rounded px-1 py-0.5 text-xs mt-1">
                          Yoga 7AM
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Status Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Equipment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Treadmills</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      3/6 available
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Ellipticals</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      1/4 available
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Weight Bench</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      0/3 available
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Pool</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Open
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Check-in and LFG */}
          <div className="space-y-8">
            {/* Check-In Button */}
            {userProfile.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Quick Check-In
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleCheckIn}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Check In Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* LFG Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Looking for Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">Basketball Game</h4>
                    <Badge variant="outline">2 spots left</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Looking for 2 more players for basketball at 6 PM
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      6:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Court 1
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">Study Group</h4>
                    <Badge variant="outline">Open</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    CS471 study session in the lounge
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      7:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Lounge
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Staff Entry Table with Tabs */}
        {userProfile.role === 'staff' && (
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant={activeTab === 'current' ? 'default' : 'outline'}
                onClick={() => setActiveTab('current')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Current Entries ({checkInEntries.length})
              </Button>
              <Button
                variant={activeTab === 'logs' ? 'default' : 'outline'}
                onClick={() => setActiveTab('logs')}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Daily Logs ({Object.keys(dailyLogs).length} days)
              </Button>
            </div>

            {/* Debug and Control Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Button 
                onClick={createTestEntry}
                variant="outline"
                size="sm"
              >
                Add Test Entry
              </Button>
              <Button 
                onClick={() => {
                  localStorage.removeItem('checkInEntries')
                  localStorage.removeItem('globalCheckInEntries')
                  setCheckInEntries([])
                }}
                variant="outline"
                size="sm"
              >
                Clear Current
              </Button>
              <Button 
                onClick={() => {
                  const backup = localStorage.getItem('checkInBackup')
                  if (backup) {
                    const data = JSON.parse(backup)
                    alert(`Last backup: ${data.timestamp}\nEntries: ${data.entries.length}`)
                  } else {
                    alert('No backup found')
                  }
                }}
                variant="outline"
                size="sm"
              >
                Check Backup
              </Button>
              <Button 
                onClick={() => {
                  localStorage.removeItem('dailyLogs')
                  setDailyLogs({})
                }}
                variant="outline"
                size="sm"
              >
                Clear Logs
              </Button>
            </div>
            
            {activeTab === 'current' ? (
              <EntryTable 
                entries={checkInEntries} 
                onConfirm={handleStaffConfirm}
                title="Today's Check-Ins"
                showDate={false}
              />
            ) : (
              <DailyLogsTable logs={dailyLogs} />
            )}
          </div>
        )}
      </main>

      {/* Check-in Modal */}
      {showCheckInModal && userProfile.role === 'student' && (
        <CheckInModal 
          userProfile={userProfile}
          onClose={() => setShowCheckInModal(false)}
        />
      )}

      {/* Success Modal */}
      {checkInSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Successfully Checked In!
              </h3>
              <p className="text-gray-600 mb-6">
                Welcome to the Kettering Recreation Center
              </p>
              <Button 
                onClick={() => setCheckInSuccess(false)}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chatbot Icon */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
