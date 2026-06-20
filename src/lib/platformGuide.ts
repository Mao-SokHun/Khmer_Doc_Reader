export const PLATFORM_GUIDE_VERSION = 'platform-v4';

export const PLATFORM_GUIDE_KH = `# មគ្គុទ្ទេសក៍ប្រើប្រាស់ Khmer Doc Reader

ឯកសារនេះពន្យល់ **ជំហានមួយ​រួម​មួយ** របៀបប្រើប្រាស់ platform សម្រាប់គ្រូ និងអ្នកសរសេរមេរៀន។

---

## 1. ចាប់ផ្ដើម — ទំព័រដើម

1. បើកគេហទំព័រ → ឃើញ **ទំព័រដើម** (Home) ជាមួយបញ្ជីមេរៀន
2. **ថយទៅទំព័រដើម** — ពេលកំពុងអានមេរៀន ចុចប៊ូតុង **«ទំព័រដើម»** ខាង Header ខ្ពស់ (ឬចុច **Esc**)
3. **ផ្ទាំងឯកសារ** (Tabs) នៅខាងឆ្វេង — ប្រើសម្រាប់ចែកប្រភេទមេរៀន
4. ចុច **បង្កើតផ្ទាំងថ្មី** ដើម្បីបន្ថែម Tab ថ្មី
5. ចុច **ស្វែងរក** ឬ **Ctrl+K** ដើម្បីរកមេរៀន/ខ្លឹមសារលឿន

---

## 2. បង្កើតមេរៀនថ្មី

1. ជ្រើស Tab នៅ Sidebar
2. ចុច **+** បន្ថែមមេរៀន
3. វាយ **ឈ្មោះមេរៀន** ក្នុង modal
4. ជ្រើស **គំរូ** — ឧ. របាយការណ៍, គម្រោង, សឥ្ធាកម្មមេរៀន
5. ឬបង្កើតឯកសារទទេ រួចសរសេរខ្លួនឯង

---

## 3. កែសម្រួលមេរៀន (Editor)

1. បើកមេរៀន → ចុច **កែសម្រួល** ឬ **Ctrl+E**
2. **Toolbar** ខាងលើ — អក្សរ, Heading, List, Code, Table, រូបភាព
3. **Paste code** — platform នឹង wrap code block + syntax highlighting ដោយស្វ័យប្រវត្តិ
4. **Markdown** — heading (#), bold (**), code fences ដំណើរការល្អ
5. **រក្សាទុក** — autosave + ចុច **រក្សាទុក** ដើម្បី save manual + snapshot

---

## 4. មើល & រុករកមេរៀន

1. **View mode** — អានមេរៀនជា Markdown + code highlight
2. **Outline** (Sidebar) — ចុចចំណងជើង → scroll ទៅផ្នែកនោះ
3. **Presentation** — បង្ហាញជា slides (ចុច Present)
4. **Dark / Light mode** — ប៊ូតុងព្រះច័ន្ទ/ព្រះអាទិត្យ ខាង Header

---

## 5. ចែករំលែក & ទាញយក

1. **Share** — បង្កើត link មើល read-only (?share=...)
2. **PDF** — ទាញយក PDF (More menu → Export)
3. **Markdown** — export .md file
4. **Version history** — មើល/restore កំណែមុន (រក្សាទុក per browser)

---

## 6. AI (បើមាន Gemini API key)

1. **Translate** — បកប្រែមេរៀនទៅភាសាផ្សេង
2. **Generate image** — បង្កើតរូបភាពពី prompt

---

## 7. គំរូឯកសារ (Templates)

មាន **គំរូស្រាប់** សម្រាប់បង្កើតឯកសារលឿន — ចុច **+** បន្ថែមមេរៀន ឬ **គំរូមេរៀន** នៅទំព័រដើម៖

| គំរូ | ប្រើសម្រាប់ |
|------|------------|
| **របាយការណ៍ជីវភាព** | បទពិសោធន៍ ការអប់រំ ជំនាញ |
| **របាយការណ៍** | របាយការណ៍ការងារ លទ្ធផល ផែនការបន្ត |
| **គម្រោង** | ផែនការ តួនាទី ហានិភ័យ |
| **សឥ្ធាកម្មមេរៀន** | គោលបំណង សកម្មភាព វាយតម្លៃ |
| **មេរៀនភាសា SQL** | សំណួរ SQL |
| **កិច្ចការផ្ទះ / សំណួរក្រេប** | កិច្ចការផ្ទះ ឬ quiz |
| **កំណត់ត្រាប្រជុំ** | របៀបវារៈ កិច្ចការ |

**របៀបប្រើ:** ជ្រើស Tab → **+** → វាយឈ្មោះ → ជ្រើសគំរូ → **រក្សាទុក**

---

## 8. Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K | ស្វែងរក |
| Ctrl+E | កែសម្រួល |
| Ctrl+S | រក្សាទុក (ក្នុង editor) |

---

## 9. Tips

- មិនចាំបាច់ login — ទិន្នន័យរក្សាទុក per browser
- ប្រើ **Templates** — របាយការណ៍, គម្រោង, SQL, សឥ្ធាកម្មមេរៀន
- ប្រើ **Outline** សម្រាប់មេរៀនវែង

---

**ចាប់ផ្ដើមឥឡូវ:** បង្កើត Tab → បន្ថែមមេរៀន → កែសម្រួល → Share ឬ PDF
`;

export const PLATFORM_GUIDE_EN = `# Khmer Doc Reader — User Guide

This document walks you through **step by step** how to use the platform.

---

## 1. Getting started — Home

1. Open the site → see the **Home** dashboard with your lessons
2. **Back to Home** — while reading a lesson, click the **Home** button in the top header (or press **Esc**)
3. **Document tabs** on the left organize lessons by topic
4. Click **Create new tab** to add a folder
5. Click **Search** or press **Ctrl+K** to find lessons quickly

---

## 2. Create a new lesson

1. Select a tab in the sidebar
2. Click **+** to add a lesson
3. Enter the **lesson name** in the modal
4. Pick a **template** (report, project, lesson plan, etc.)
5. Or start blank and write your own content

---

## 3. Edit a lesson (Editor)

1. Open a lesson → click **Edit** or \`Ctrl+E\`
2. Use the **toolbar** — fonts, headings, lists, code, tables, images
3. **Paste code** — auto-wraps into syntax-highlighted blocks
4. **Markdown** — \`# headings\`, \`**bold**\`, fenced code blocks work well
5. **Save** — autosave runs automatically; click **Save** for manual save + snapshot

---

## 4. View & navigate

1. **View mode** — read rendered Markdown with code highlighting
2. **Outline** (sidebar) — click a heading to jump to that section
3. **Presentation** — slide mode for teaching
4. **Dark / Light mode** — toggle in the header

---

## 5. Share & export

1. **Share** — create a read-only link (\`?share=...\`)
2. **PDF** — export from the header / More menu
3. **Markdown** — download \`.md\`
4. **Version history** — view and restore older versions (stored per browser)

---

## 6. AI features (when Gemini API key is configured)

1. **Translate** — translate lesson content to another language
2. **Generate image** — create images from a text prompt

---

## 7. Document templates

Ready-made **templates** help you create documents quickly — click **+** to add a lesson or **Templates** on the home page:

| Template | Use for |
|----------|---------|
| **Resume / CV** | Work history, education, skills |
| **Report** | Progress reports, results, next steps |
| **Project** | Project plans — timeline, roles, risks |
| **Lesson plan** | Objectives, activities, assessment (teachers) |
| **SQL lesson** | SQL queries and operators |
| **Homework / Quiz** | Assignments or lessons with quiz blocks |
| **Meeting notes** | Agenda, decisions, action items |

**How to use:** Pick a tab → **+** → enter name → choose template → **Save**

---

## 8. Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+K\` | Search |
| \`Ctrl+E\` | Edit |
| \`Ctrl+S\` | Save (in editor) |

---

## 9. Tips

- No login required — your workspace is saved per browser
- Use **Templates** — Report, Project, SQL, Lesson plan
- Use the **Outline** for long documents

---

**Start now:** Create a tab → Add a lesson → Edit → Share or export PDF
`;

export function getPlatformGuide(lang: 'kh' | 'en'): string {
  return lang === 'kh' ? PLATFORM_GUIDE_KH : PLATFORM_GUIDE_EN;
}
