'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, User, Shield } from 'lucide-react'


export default function RoleSelection() {
  const [idImage, setIdImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIdImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    if (idImage) {
      // Get Google user info from Firebase Auth
      let name = ''
      let photoURL = ''
      let email = ''
      if (typeof window !== 'undefined') {
        try {
          const user = (await import('firebase/auth')).getAuth().currentUser
          if (user) {
            name = user.displayName || ''
            photoURL = user.photoURL || ''
            email = user.email || ''
          }
        } catch {}
      }
      localStorage.setItem('userProfile', JSON.stringify({ role: 'student', idImage: imagePreview, name, photoURL, email }))
      router.push('/dashboard')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Upload Your Student ID
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Please upload your student ID to continue
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student ID Upload */}

          <div className="space-y-4">
            <Label htmlFor="id-upload">Upload Student ID</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-2">
                  <img 
                    src={imagePreview || "/placeholder.svg"} 
                    alt="Student ID Preview" 
                    className="mx-auto max-h-32 rounded"
                  />
                  <p className="text-sm text-gray-600">ID uploaded successfully</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload your student ID</p>
                </div>
              )}
              <Input
                id="id-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('id-upload')?.click()}
                className="mt-2"
              >
                Choose File
              </Button>
            </div>
          </div>


          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={!idImage || isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
