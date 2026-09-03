import { supabase } from '@/lib/supabase/client'

export async function logAudit(
  action: string,
  targetType: string,
  targetId: string,
  targetLabel: string,
  details?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    await supabase.from('admin_audit_log').insert({
      actor_id: user.id,
      actor_name: profile?.display_name ?? 'Unknown',
      action,
      target_type: targetType,
      target_id: targetId,
      target_label: targetLabel,
      details: details ?? null,
    })
  } catch {
    // Audit logging should never block the actual action
  }
}
