import { supabaseServer } from './supabase-server'
import { redirect } from 'next/navigation'

export async function getSession() {
  const supabase = supabaseServer()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error)
    return null
  }

  return session
}

export async function getUser() {
  const supabase = supabaseServer()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return user
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

export async function signOut() {
  const supabase = supabaseServer()
  await supabase.auth.signOut()
  redirect('/login')
}
