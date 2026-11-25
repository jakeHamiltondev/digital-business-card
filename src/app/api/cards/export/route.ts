import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import type { Profile, SavedCardWithProfile } from '@/lib/types'

const BYPASS_EMAIL = 'jh0695@gmail.com'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pro gate
  const isBypass = user.email === BYPASS_EMAIL
  if (!isBypass) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData || !isPro(profileData as Profile)) {
      return NextResponse.json({ error: 'Pro feature' }, { status: 403 })
    }
  }

  // Fetch saved cards with profiles
  const { data, error } = await supabase
    .from('saved_cards')
    .select('*, profile:profiles!saved_profile_id(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const cards = (data ?? []) as SavedCardWithProfile[]

  // Build workbook
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Linkfol'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Contacts')

  // Define columns
  sheet.columns = [
    { header: 'Full Name', key: 'full_name', width: 25 },
    { header: 'Title', key: 'title', width: 22 },
    { header: 'Company', key: 'company', width: 22 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'LinkedIn', key: 'linkedin', width: 30 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Tags', key: 'tags', width: 20 },
    { header: 'Notes', key: 'notes', width: 30 },
    { header: 'Favorite', key: 'favorite', width: 10 },
    { header: 'Saved Date', key: 'saved_at', width: 14 },
    { header: 'Linkfol Profile', key: 'profile_url', width: 30 },
  ]

  // Style header row
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, size: 11 }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF18181B' },
  }
  headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
  headerRow.alignment = { vertical: 'middle' }
  headerRow.height = 24

  // Add data rows
  for (const card of cards) {
    const p = card.profile

    // Combine phone entries into a single string
    const phoneStr =
      (p.phones ?? [])
        .map((ph) => (ph.type !== 'mobile' ? `${ph.number} (${ph.type})` : ph.number))
        .join(', ') ||
      p.phone ||
      ''

    sheet.addRow({
      full_name: p.full_name ?? p.username,
      title: p.title ?? '',
      company: p.company ?? '',
      email: p.email ?? '',
      phone: phoneStr,
      linkedin: p.social_links?.linkedin ?? '',
      location: p.location ?? '',
      tags: (card.tags ?? []).join(', '),
      notes: card.notes ?? '',
      favorite: card.is_favorite ? 'Yes' : '',
      saved_at: new Date(card.saved_at).toLocaleDateString('en-US'),
      profile_url: `https://linkfol.com/${p.username}`,
    })
  }

  // Auto-filter on header
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 12 },
  }

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }]

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer()

  const date = new Date().toISOString().slice(0, 10)
  return new Response(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.document',
      'Content-Disposition': `attachment; filename="linkfol-contacts-${date}.xlsx"`,
    },
  })
}
