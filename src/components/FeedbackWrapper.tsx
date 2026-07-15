import { createClient } from '@/lib/supabase/server'
import FeedbackModal from '@/components/FeedbackModal'

export default async function FeedbackWrapper() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return <FeedbackModal />
}
