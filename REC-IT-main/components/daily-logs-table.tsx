'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronDown, ChevronRight, Download, CheckCircle, Clock } from 'lucide-react'

interface CheckInEntry {
  id: string
  email: string
  idImage: string
  time: string
  date: string
  status: 'pending' | 'confirmed'
}

interface DailyLogsTableProps {
  logs: {[date: string]: CheckInEntry[]}
}

export default function DailyLogsTable({ logs }: DailyLogsTableProps) {
  const [expandedDates, setExpandedDates] = useState<{[date: string]: boolean}>({})

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }))
  }

  const exportDayData = (date: string, entries: CheckInEntry[]) => {
    const csvContent = [
      'Email,Time,Date,Status,ID',
      ...entries.map(entry => 
        `${entry.email},${entry.time},${entry.date},${entry.status},${entry.id}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rec-it-checkins-${date.replace(/\s/g, '-')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(logs).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (sortedDates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No daily logs yet</p>
            <p className="text-sm text-gray-400">
              Logs will appear here at the end of each day
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Daily Logs
          <Badge variant="outline" className="ml-2">
            {sortedDates.length} days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedDates.map(date => {
            const entries = logs[date]
            const confirmedCount = entries.filter(e => e.status === 'confirmed').length
            const pendingCount = entries.filter(e => e.status === 'pending').length
            const isExpanded = expandedDates[date]

            return (
              <div key={date} className="border rounded-lg">
                {/* Date Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => toggleDate(date)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <div>
                      <h3 className="font-medium">{date}</h3>
                      <p className="text-sm text-gray-600">
                        {entries.length} total check-ins
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {confirmedCount} confirmed
                      </Badge>
                      {pendingCount > 0 && (
                        <Badge variant="outline">
                          {pendingCount} pending
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        exportDayData(date, entries)
                      }}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Expanded Entries */}
                {isExpanded && (
                  <div className="border-t bg-gray-50">
                    <div className="p-4 space-y-3">
                      {entries
                        .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Latest first
                        .map(entry => (
                        <div 
                          key={entry.id}
                          className="bg-white border rounded p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {/* Student ID Image */}
                            <div className="w-12 h-8 border rounded overflow-hidden">
                              <img 
                                src={entry.idImage || "/placeholder.svg"} 
                                alt="Student ID" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Entry Details */}
                            <div>
                              <p className="font-medium text-sm">{entry.email}</p>
                              <p className="text-xs text-gray-600">{entry.time}</p>
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            {entry.status === 'confirmed' ? (
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Confirmed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
