import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Profile, ResumeEntry, ResumeEntryType } from './types'

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return raw
}

const SECTION_ORDER: ResumeEntryType[] = [
  'experience',
  'education',
  'skill',
  'project',
  'certification',
]

const SECTION_LABELS: Record<ResumeEntryType, string> = {
  experience: 'Work Experience',
  education: 'Education',
  skill: 'Skills',
  project: 'Projects',
  certification: 'Certifications',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    paddingTop: 54,
    paddingBottom: 54,
    paddingLeft: 54,
    paddingRight: 54,
    lineHeight: 1.55,
  },
  headerName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  headerContact: {
    fontSize: 9,
    color: '#666',
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d4',
    marginTop: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#888',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 4,
    marginBottom: 10,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  entryDate: {
    fontSize: 9,
    color: '#666',
  },
  entryOrg: {
    fontSize: 9.5,
    color: '#444',
    marginBottom: 4,
  },
  entryDesc: {
    fontSize: 9,
    color: '#333',
    marginTop: 4,
    lineHeight: 1.5,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  skillCategory: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    width: 100,
    flexShrink: 0,
    color: '#333',
  },
  skillList: {
    fontSize: 9.5,
    color: '#444',
    flex: 1,
  },
  projectSkills: {
    fontSize: 8.5,
    color: '#666',
    marginTop: 2,
  },
  entryBlock: {
    marginBottom: 14,
  },
})

function formatDateRange(start?: string | null, end?: string | null): string {
  const parts = [start, end].filter(Boolean)
  return parts.join(' – ')
}

type Props = {
  profile: Profile
  entries: ResumeEntry[]
}

export function ResumePDF({ profile, entries }: Props) {
  const entriesByType: Partial<Record<ResumeEntryType, ResumeEntry[]>> = {}
  for (const entry of entries) {
    if (!entriesByType[entry.type]) entriesByType[entry.type] = []
    entriesByType[entry.type]!.push(entry)
  }

  const contactParts = [
    profile.email,
    profile.phone ? formatPhone(profile.phone) : null,
  ].filter(Boolean)

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <Text style={s.headerName}>{profile.full_name ?? profile.username}</Text>
        {contactParts.length > 0 ? (
          <Text style={s.headerContact}>{contactParts.join('  |  ')}</Text>
        ) : null}

        <View style={s.hr} />

        {/* Sections */}
        {SECTION_ORDER.map((type) => {
          const sectionEntries = entriesByType[type]
          if (!sectionEntries || sectionEntries.length === 0) return null

          return (
            <View key={type} style={s.section}>
              <Text style={s.sectionHeading}>{SECTION_LABELS[type]}</Text>

              {type === 'skill' ? (
                sectionEntries.map((entry) => (
                  <View key={entry.id} style={s.skillRow}>
                    <Text style={s.skillCategory}>{entry.title}</Text>
                    <Text style={s.skillList}>
                      {(entry.skills_list ?? []).join(', ')}
                    </Text>
                  </View>
                ))
              ) : (
                sectionEntries.map((entry) => (
                  <View key={entry.id} style={s.entryBlock}>
                    <View style={s.entryRow}>
                      <Text style={s.entryTitle}>
                        {entry.title}
                        {entry.organization ? `  ·  ${entry.organization}` : ''}
                      </Text>
                      {(entry.start_date || entry.end_date) ? (
                        <Text style={s.entryDate}>
                          {formatDateRange(entry.start_date, entry.end_date)}
                        </Text>
                      ) : null}
                    </View>
                    {entry.location ? (
                      <Text style={s.entryOrg}>{entry.location}</Text>
                    ) : null}
                    {entry.description ? (
                      <Text style={s.entryDesc}>{entry.description}</Text>
                    ) : null}
                    {type === 'project' && entry.skills_list && entry.skills_list.length > 0 ? (
                      <Text style={s.projectSkills}>
                        {entry.skills_list.join(', ')}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          )
        })}
      </Page>
    </Document>
  )
}
