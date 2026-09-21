import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  BorderStyle,
  TabStopType,
  TabStopPosition,
} from 'docx'
import type { Profile, ResumeEntry, ResumeEntryType } from './types'

const FONT = 'Calibri'
const MARGIN = 1080 // 0.75 inch in twips

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

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return raw
}

function formatDateRange(start?: string | null, end?: string | null): string {
  return [start, end].filter(Boolean).join(' – ')
}

function sectionHeading(label: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: label.toUpperCase(),
        bold: true,
        size: 16,
        color: '888888',
        font: FONT,
      }),
    ],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 3, space: 3, color: 'E5E5E5' },
    },
    spacing: { before: 220, after: 80 },
  })
}

function entryBlock(type: ResumeEntryType, entry: ResumeEntry): Paragraph[] {
  const paras: Paragraph[] = []

  const titleRuns: TextRun[] = [
    new TextRun({ text: entry.title, bold: true, size: 20, font: FONT }),
  ]
  if (entry.organization) {
    titleRuns.push(
      new TextRun({ text: `  ·  ${entry.organization}`, size: 20, color: '444444', font: FONT }),
    )
  }

  const dateStr = formatDateRange(entry.start_date, entry.end_date)
  if (dateStr) {
    titleRuns.push(new TextRun({ text: '\t', size: 20 }))
    titleRuns.push(new TextRun({ text: dateStr, size: 18, color: '666666', font: FONT }))
  }

  paras.push(
    new Paragraph({
      children: titleRuns,
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { after: 20 },
    }),
  )

  if (entry.location) {
    paras.push(
      new Paragraph({
        children: [new TextRun({ text: entry.location, size: 18, color: '666666', font: FONT })],
        spacing: { after: 20 },
      }),
    )
  }

  if (entry.description) {
    paras.push(
      new Paragraph({
        children: [new TextRun({ text: entry.description, size: 19, color: '333333', font: FONT })],
        spacing: { after: 40 },
      }),
    )
  }

  if (type === 'project' && entry.skills_list && entry.skills_list.length > 0) {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({ text: entry.skills_list.join(', '), size: 17, color: '666666', font: FONT }),
        ],
        spacing: { after: 40 },
      }),
    )
  }

  paras.push(new Paragraph({ children: [], spacing: { after: 60 } }))
  return paras
}

function skillBlock(entry: ResumeEntry): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${entry.title}: `, bold: true, size: 19, font: FONT }),
      new TextRun({
        text: (entry.skills_list ?? []).join(', '),
        size: 19,
        color: '444444',
        font: FONT,
      }),
    ],
    spacing: { after: 60 },
  })
}

export async function buildResumeDocx(profile: Profile, entries: ResumeEntry[]): Promise<Buffer> {
  const entriesByType: Partial<Record<ResumeEntryType, ResumeEntry[]>> = {}
  for (const entry of entries) {
    if (!entriesByType[entry.type]) entriesByType[entry.type] = []
    entriesByType[entry.type]!.push(entry)
  }

  const contactParts = [
    profile.email,
    profile.phone ? formatPhone(profile.phone) : null,
  ].filter(Boolean) as string[]

  const children: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: profile.full_name ?? profile.username,
          bold: true,
          size: 48,
          font: FONT,
        }),
      ],
      spacing: { after: 60 },
    }),
  ]

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: contactParts.join('  |  '), size: 18, color: '666666', font: FONT }),
        ],
        spacing: { after: 20 },
      }),
    )
  }

  // Horizontal rule via paragraph border
  children.push(
    new Paragraph({
      children: [],
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, space: 4, color: 'D4D4D4' },
      },
      spacing: { after: 120 },
    }),
  )

  for (const type of SECTION_ORDER) {
    const sectionEntries = entriesByType[type]
    if (!sectionEntries || sectionEntries.length === 0) continue

    children.push(sectionHeading(SECTION_LABELS[type]))

    if (type === 'skill') {
      for (const entry of sectionEntries) {
        children.push(skillBlock(entry))
      }
    } else {
      for (const entry of sectionEntries) {
        children.push(...entryBlock(type, entry))
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
          },
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}
