'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'

interface CheckInEntry {
  id: string
  email: string
  idImage: string
  time: string
  date: string
  status: 'pending' | 'confirmed'
}

interface EntryTableProps {
  entries: CheckInEntry[]
  onConfirm: (entryId: string) => void
  title?: string
  showDate?: boolean
}

export default function EntryTable({ 
  entries, 
  onConfirm, 
  title = "Entry Table - Check-In Management",
  showDate = true 
}: EntryTableProps) {
  // Debug information
  console.log('EntryTable received entries:', entries)
  
  const handleConfirm = (entryId: string) => {
    onConfirm(entryId)
    
    // Show brief success feedback
    const button = document.querySelector(`[data-entry-id="${entryId}"]`)
    if (button) {
      button.textContent = 'Confirmed!'
      setTimeout(() => {
        button.textContent = 'Confirm'
      }, 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {title}
          <Badge variant="outline" className="ml-2">
            {entries.length} entries
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Enhanced info panel */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-700">Status Overview:</p>
              <p className="text-gray-600">Total entries: {entries.length}</p>
              <p className="text-gray-600">
                Pending: {entries.filter(e => e.status === 'pending').length}
              </p>
              <p className="text-gray-600">
                Confirmed: {entries.filter(e => e.status === 'confirmed').length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Auto-save: Every 30s</p>
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No check-in requests yet</p>
            <p className="text-sm text-gray-400">
              Students need to click "Check In Now" to appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Student ID Image */}
                  <div className="w-16 h-12 border rounded overflow-hidden">
                    <img 
                      src={entry.idImage || "/placeholder.svg"} 
                      alt="Student ID" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Entry Details */}
                  <div className="space-y-1">
                    <p className="font-medium">{entry.email}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {showDate && <span>{entry.date}</span>}
                      <span>{entry.time}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="flex items-center gap-3">
                  {entry.status === 'pending' ? (
                    <>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => handleConfirm(entry.id)}
                        className="bg-green-600 hover:bg-green-700 transition-all duration-200"
                        data-entry-id={entry.id}
                      >
                        Confirm
                      </Button>
                    </>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Confirmed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
