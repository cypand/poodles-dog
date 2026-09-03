'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

const IDLE_LIMIT_MS = 3 * 60 * 60 * 1000 // 3 hours
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
const LAST_ACTIVITY_KEY = 'poodles-last-activity'

export default function IdleTimeout() {
  useEffect(() => {
    const updateActivity = () => {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
    }

    updateActivity()
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, updateActivity))

    const interval = setInterval(async () => {
      const last = sessionStorage.getItem(LAST_ACTIVITY_KEY)
      if (!last) return

      const idleFor = Date.now() - Number(last)
      if (idleFor > IDLE_LIMIT_MS) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.auth.signOut()
          window.location.href = '/login'
        }
      }
    }, 60 * 1000)

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, updateActivity))
      clearInterval(interval)
    }
  }, [])

  return null
}
