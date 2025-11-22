'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { Users } from 'lucide-react'
import AnnouncementBar from '@/components/ui/AnnouncementBar'

export default function CommunityPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen">
      <AnnouncementBar message="🎉 Welcome to Commart Seller Panel — New updates are live!" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-100 mb-6">
                <Users className="w-8 h-8 text-coral-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Community</h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Community Hub — Coming Soon. A place for sellers, news and opportunities.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
