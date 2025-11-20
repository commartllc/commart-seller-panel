'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { supabaseBrowser, type StoreSettings } from '@/lib/supabase-browser'
import { Save } from 'lucide-react'

export default function StorePage() {
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

    setMessage('Settings saved successfully!')
    setSaving(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600">Configure your store preferences</p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Store Information */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Store Name</label>
                <input
                  type="text"
                  value={settings?.store_name || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, store_name: e.target.value } : null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                  placeholder="My Awesome Store"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Store URL</label>
                <input
                  type="url"
                  value={settings?.store_url || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, store_url: e.target.value } : null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                  placeholder="https://mystore.commart.com"
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(s => s ? { ...s, email_notifications: !s.email_notifications } : null)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings?.email_notifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings?.email_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via SMS</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(s => s ? { ...s, sms_notifications: !s.sms_notifications } : null)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings?.sms_notifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings?.sms_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Notifications</p>
                  <p className="text-sm text-gray-500">Get notified about new orders</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(s => s ? { ...s, order_notifications: !s.order_notifications } : null)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings?.order_notifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings?.order_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Marketing Notifications</p>
                  <p className="text-sm text-gray-500">Receive marketing and promotional updates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(s => s ? { ...s, marketing_notifications: !s.marketing_notifications } : null)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings?.marketing_notifications ? 'bg-primary-600' : 'bg-gray-200'
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
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
