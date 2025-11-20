'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { supabaseBrowser, type StoreSettings } from '@/lib/supabase-browser'
import { Save } from 'lucide-react'

export default function StorePage() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session) return

      const { data } = await supabaseBrowser
        .from('store_settings')
        .select('*')
        .eq('seller_id', session.user.id)
        .single()

      if (data) {
        setSettings(data)
      } else {
        // Create default settings if none exist
        setSettings({
          id: '',
          seller_id: session.user.id,
          store_name: '',
          store_url: '',
          email_notifications: true,
          sms_notifications: false,
          order_notifications: true,
          marketing_notifications: false,
          created_at: '',
          updated_at: ''
        })
      }
      setLoading(false)
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    setMessage('')

    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (!session) return

    const settingsData = {
      seller_id: session.user.id,
      store_name: settings.store_name,
      store_url: settings.store_url,
      email_notifications: settings.email_notifications,
      sms_notifications: settings.sms_notifications,
      order_notifications: settings.order_notifications,
      marketing_notifications: settings.marketing_notifications
    }

    if (settings.id) {
      await supabaseBrowser
        .from('store_settings')
        .update(settingsData)
        .eq('id', settings.id)
    } else {
      await supabaseBrowser
        .from('store_settings')
        .insert(settingsData)
    }

    setMessage(t.settings.saved)
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.settings.title}</h1>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">{t.common.loading}</div>
          ) : (
            <>
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Store Identity */}
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settings.storeIdentity}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.settings.storeName}</label>
                      <input
                        type="text"
                        value={settings?.store_name || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, store_name: e.target.value } : null)}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        placeholder="My Awesome Store"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.settings.storeUrl}</label>
                      <input
                        type="url"
                        value={settings?.store_url || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, store_url: e.target.value } : null)}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        placeholder="https://mystore.commart.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settings.notifications}</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.settings.emailNotifications}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings(s => s ? { ...s, email_notifications: !s.email_notifications } : null)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings?.email_notifications ? 'bg-coral-500' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings?.email_notifications ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.settings.orderNotifications}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings(s => s ? { ...s, order_notifications: !s.order_notifications } : null)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings?.order_notifications ? 'bg-coral-500' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings?.order_notifications ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.settings.marketingEmails}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings(s => s ? { ...s, marketing_notifications: !s.marketing_notifications } : null)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings?.marketing_notifications ? 'bg-coral-500' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings?.marketing_notifications ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors disabled:opacity-50"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? t.common.loading : t.settings.saveChanges}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
