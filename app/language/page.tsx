'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { Check } from 'lucide-react'

export default function LanguagePage() {
  const { language, setLanguage, t } = useLanguage()

  const languages = [
    {
      code: 'tr' as const,
      name: t.language.turkish,
      flag: '🇹🇷',
    },
    {
      code: 'en' as const,
      name: t.language.english,
      flag: '🇬🇧',
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 pt-16 lg:pt-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.language.title}</h1>
            <p className="text-gray-600 mt-1">{t.language.description}</p>
          </div>

          {/* Language Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <div className="bg-coral-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
