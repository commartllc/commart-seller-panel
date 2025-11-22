'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { supabaseBrowser, type StoreSettings } from '@/lib/supabase-browser'
import { Save, Phone, Mail, Clock, MessageSquare } from 'lucide-react'

interface ExtendedSettings extends StoreSettings {
  phone_number?: string
  email?: string
  working_hours?: string
  support_notes?: string
}

export default function StorePage() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState<ExtendedSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

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
        setSettings({
          id: '',
          seller_id: session.user.id,
          store_name: '',
          store_url: '',
          email_notifications: true,
          sms_notifications: false,
          order_notifications: true,
          marketing_notifications: false,
          phone_number: '',
          email: '',
          working_hours: '',
          support_notes: '',
          created_at: '',
          updated_at: ''
        })
      }
      setLoading(false)
    }

    fetchSettings()
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)

    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (!session) return

    const settingsData = {
      seller_id: session.user.id,
      store_name: settings.store_name,
      store_url: settings.store_url,
      email_notifications: settings.email_notifications,
      sms_notifications: settings.sms_notifications,
      order_notifications: settings.order_notifications,
      marketing_notifications: settings.marketing_notifications,
      phone_number: settings.phone_number,
      email: settings.email,
      working_hours: settings.working_hours,
      support_notes: settings.support_notes
    }

    try {
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
      showToast(t.settings.saved)
    } catch (error) {
      console.error('Save error:', error)
    }

    setSaving(false)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 pt-16 lg:pt-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Toast */}
          {toast && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
              {toast}
            </div>
          )}

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.settings.title}</h1>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">{t.common.loading}</div>
          ) : (
            <>
              <div className="bg-white rounded-md shadow-sm border border-gray-100">
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
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        placeholder="My Awesome Store"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.settings.storeUrl}</label>
                      <input
                        type="url"
                        value={settings?.store_url || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, store_url: e.target.value } : null)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        placeholder="https://mystore.commart.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settings.contactInfo}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {t.settings.phone}
                      </label>
                      <input
                        type="tel"
                        value={settings?.phone_number || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, phone_number: e.target.value } : null)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        placeholder="+90 555 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {t.settings.email}
                      </label>
                      <input
                        type="email"
                        value={settings?.email || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, email: e.target.value } : null)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        placeholder="store@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Working Hours
                      </label>
                      <input
                        type="text"
                        value={settings?.working_hours || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, working_hours: e.target.value } : null)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        placeholder="Mon-Fri 9:00-18:00, Sat 10:00-14:00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Support Notes
                      </label>
                      <textarea
                        value={settings?.support_notes || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, support_notes: e.target.value } : null)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        rows={3}
                        placeholder="Additional support information for customers..."
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
                  className="flex items-center px-4 py-2 bg-coral-500 text-white rounded-md hover:bg-coral-600 transition-colors disabled:opacity-50"
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
