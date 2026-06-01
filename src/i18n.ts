export type Language = 'kh' | 'en';

export const translations = {
  kh: {
    documentTabs: 'Testing ',
    createTab: 'បង្កើតផ្ទាំងថ្មី',
    addLesson: 'បន្ថែមមេរៀនថ្មី...',
    edit: 'កែសម្រួល',
    downloadPdf: 'ទាញយក PDF',
    preview: 'មើលមុន',
    cancel: 'បោះបង់',
    save: 'រក្សាទុក',
    untitledLesson: 'មេរៀនគ្មានចំណងជើង...',
    editorPlaceholder: 'សរសេរមេរៀននៅទីនេះ... ប្រើ Markdown ដើម្បីរៀបចំអត្ថបទ និងកូដ',
    welcome: 'សូមស្វាគមន៍',
    appTitle: 'មេរៀនគ្រូ',
    signInGoogle: 'ចូលប្រើប្រាស់តាមរយៈ Google',
    workspace: 'Workspace',
    deleteLessonConfirm: 'តើអ្នកចង់លុបមេរៀននេះមែនទេ?',
    enterTabName: 'គ្រូឈ្មោះផ្ទាំងថ្មី (Enter Tab Name):',
    errorCreatingTab: 'Error creating tab. Please check your connection.',
    exportFailed: 'បរាជ័យក្នុងការទាញយក PDF',
    newLessonTitle: 'មេរៀនថ្មី',
    newLessonContent: '# មេរៀនថ្មី\n\nសរសេរអត្ថបទរបស់អ្នកនៅទីនេះ...\n\n```sql\n-- សរសេរកូដនៅទីនេះ\nSELECT * FROM table;\n```',
    errorCreatingLesson: 'បរាជ័យក្នុងការបង្កើតមេរៀន',
    errorSavingLesson: 'បរាជ័យក្នុងការរក្សាទុកមេរៀន',
    feature1Title: 'ផ្ទាំងឯកសារ',
    feature1Desc: 'រៀបចំផ្ទាំងឯកសារតាមប្រភេទ',
    feature2Title: 'ការកែសម្រួល Markdown',
    feature2Desc: 'សរសេរយ៉ាងលឿនជាមួយ Markdown',
    feature3Title: 'ទម្រង់សម្រាប់កូដ',
    feature3Desc: 'បង្ហាញកូដបានយ៉ាងស្អាត',
    cloudStorage: 'ពពកផ្ទុកទិន្នន័យ',
    cloudDesc: 'រក្សាទុកបានគ្រប់ឧបករណ៍',
    startFree: 'ចាប់ផ្ដើមដោយឥតគិតថ្លៃ',
    tagline: 'រៀបចំបញ្ជីមេរៀនរបស់អ្នក',
    taglineHighlight: 'យ៉ាងងាយស្រួល',
    infiniteKnowledge: 'ចំណេះដឹងគ្មានដែនកំណត់',
    sqlFolder: 'មេរៀន SQL',
    sqlLessonTitle: 'សង្ខេបមេរៀន SQL Set Operators & Functions',
    sqlLessonContent: `នេះគឺជាការសង្ខេបមេរៀនទាំងអស់ឡើងវិញយ៉ាងខ្លី ខ្លឹម និងគ្រប់ន័យ ដោយបន្ថែមជាមួយ **SQL Query** សម្រាប់ឱ្យអ្នកងាយស្រួលយល់ និងយកទៅអនុវត្តផ្ទាល់ក្នុង SQL Server ឬ PostgreSQL៖\n\n---\n\n### **១. SQL Set Operators (ការបញ្ជូលសំណុំទិន្នន័យ)**\n\n* **UNION ALL:** បញ្ជូលតារាង **A + B** (យកទាំងអស់ សូម្បីតែអាជាន់គ្នា) $\\rightarrow$ **លឿនបំផុត**។\n    \`\`\`sql\n    SELECT Name FROM Employees -- តារាង A\n    UNION ALL\n    SELECT Name FROM Customers; -- តារាង B\n    \`\`\`\n* **UNION:** បញ្ជូលតារាង **A + B** (លុបអាជាន់គ្នាចោល យកតែ Unique) $\\rightarrow$ **យឺតជាង**。\n    \`\`\`sql\n    SELECT Name FROM Employees \n    UNION \n    SELECT Name FROM Customers;\n    \`\`\`\n* **EXCEPT:** យកតែរបស់ដែលមានក្នុង **A តែមិនមានក្នុង B** (ការដកចេញ) $\\rightarrow$ ប្រើសម្រាប់ **ឆែករកកន្លែងបាត់**。\n    \`\`\`sql\n    SELECT ID FROM Table_A \n    EXCEPT \n    SELECT ID FROM Table_B; -- លទ្ធផលគឺ ID ដែលមានតែក្នុង A\n    \`\`\`\n* **INTERSECT:** យកតែរបស់ណាដែល **មានទាំងក្នុង A និងក្នុង B** (ចំណុចរួម) $\\rightarrow$ ប្រើសម្រាប់ **រកមើលអ្នកជាន់គ្នា**。\n    \`\`\`sql\n    SELECT Name FROM Employees \n    INTERSECT \n    SELECT Name FROM Customers; -- លទ្ធផលគឺមនុស្សដែលជាទាំងបុគ្គលិក និងអតិថិជន\n    \`\`\`\n\n---\n\n### **២. SQL Functions (ម៉ាស៊ីនកែច្នៃទិន្នន័យ)**\n\n* **Single-Row:** ដំណើរការលើ **"ជួរនីមួយៗ"** (1 In $\\rightarrow$ 1 Out)។ ប្រើសម្រាប់ **សម្អាត និងកែប្រែទិន្នន័យ**。\n    \`\`\`sql\n    SELECT UPPER(Firstname), LOWER(Lastname) \n    FROM Sales.Employees;\n    \`\`\`\n* **Multi-Row (Aggregate):** ដំណើរការលើ **"ក្រុមនៃទិន្នន័យ"** (Many In $\\rightarrow$ 1 Out)។ ប្រើសម្រាប់ **សង្ខេបរបាយការណ៍**。\n    \`\`\`sql\n    SELECT COUNT(EmployeeID), SUM(Salary) \n    FROM Sales.Employees;\n    \`\`\`\n\n---\n\n### **៣. Nested Functions (Function ត្រួតគ្នា)**\n\n* **ច្បាប់:** ដំណើរការពី **"ក្នុង ចេញមកក្រៅ"** (Inside-Out)។\n    \`\`\`sql\n    -- កាត់យកអក្សរ ៣ តួពីឆ្វេង រួចប្តូរជាអក្សរតូច\n    SELECT LOWER(LEFT('CAMBODIA', 3)); \n    -- ជំហានទី ១: LEFT បាន 'CAM' -> ជំហានទី ២: LOWER បាន 'cam'\n    \`\`\`\n\n---\n\n### **៤. គន្លឹះបច្ចេកទេស (Pro Tips)**\n\n1.  **Performance:** ប្រើ **UNION ALL** ជាអាទិភាពក្នុង App (Laravel/Flutter) ដើម្បីឱ្យ Query ដើរលឿន។\n2.  **Data Quality:** ប្រើ **EXCEPT** ពីរដង ដើម្បីផ្ទៀងផ្ទាត់ការផ្ទេរទិន្នន័យ (Migration)៖\n    \`\`\`sql\n    -- បើលទ្ធផលទាំងពីរចេញ Empty មានន័យថាជោគជ័យ ១០០%\n    SELECT * FROM Table_A EXCEPT SELECT * FROM Table_B;\n    SELECT * FROM Table_B EXCEPT SELECT * FROM Table_A;\n    \`\`\`\n3.  **Clean Code:** កុំប្រើ \`SELECT * \` ក្នុង Set Operators ត្រូវកត់ឈ្មោះ Column ឱ្យច្បាស់ជានិច្ច。\n\n---\n**កំណត់ត្រា:** នេះជាកំណត់ត្រាពេញលេញដែលមានទាំងកូដ និងការពន្យល់។`,
    translate: 'បកប្រែខ្លឹមសារ',
    translating: 'កំពុងបកប្រែ...',
    exportSettings: 'កំណត់ការទាញយក PDF',
    pageSize: 'ទំហំក្រដាស',
    orientation: 'ទិសដៅក្រដាស',
    portrait: 'បញ្ឈរ',
    landscape: 'ផ្ដេក',
    margins: 'គែមក្រដាស (Px)',
    download: 'ទាញយកឥឡូវនេះ',
    rename: 'ប្តូរឈ្មោះ',
    delete: 'លុប',
    renameTab: 'ប្តូរឈ្មោះផ្ទាំង',
    deleteTabConfirm: 'តើអ្នកចង់លុបផ្ទាំងនេះមែនទេ? មេរៀនទាំងអស់ក្នុងផ្ទាំងនេះក៏នឹងត្រូវលុបដែរ។',
    generateImage: 'បង្កើតរូបភាព AI',
    generatingImage: 'កំពុងបង្កើត...',
    imagePrompt: 'ពណ៌នារូបភាពដែលអ្នកចង់បាន...',
    generate: 'បង្កើត',
    insert: 'បញ្ចូល',
    previewPdf: 'មើលទម្រង់មុនទាញយក',
    pageRange: 'ជម្រើសទំព័រ',
    startPage: 'ទំព័រចាប់ផ្ដើម',
    endPage: 'ទំព័របញ្ចប់',
    allPages: 'ទាំងអស់',
    customRange: 'កំណត់ដោយខ្លួនឯង',
    totalPages: 'ទំព័រសរុប',
    share: 'ចែករំលែក',
    sharing: 'ការចែករំលែកឯកសារ',
    copyLink: 'ចម្លង link',
    linkCopied: 'បានចម្លង link!',
    versionHistory: 'ប្រវត្តិឯកសារ',
    versions: 'កំណែឯកសារ',
    guideFolder: 'មគ្គុទ្ទេសក៍ប្រើប្រាស់',
    guideTitle: '🚀 ស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងមេរៀនឆ្លាតវៃ',
    guideContent: `# 🚀 ស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងមេរៀនឆ្លាតវៃ

នេះជាមគ្គុទ្ទេសក៍ និងការបង្ហាញពីសមត្ថភាពរបស់កម្មវិធីយើង៖

## 📝 1. បង្កើត និងកែសម្រួលតាមរយៈ Cloud (Cloud-Based Editing)
*   ធ្វើការដោយផ្ទាល់នៅលើកម្មវិធីរុករក (ពុំចាំបាច់ដំឡើង)
*   ឯកសារត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ
*   អាចចូលប្រើប្រាស់បានពីគ្រប់ឧបករណ៍ (កុំព្យូទ័រ, ទូរស័ព្ទ, ថេប្លេត)

## 👥 2. ធ្វើការរួមគ្នាភ្លាមៗ (Real-Time Collaboration)
*   អ្នកប្រើប្រាស់ច្រើននាក់អាចកែសម្រួលឯកសារតែមួយក្នុងពេលតែមួយ
*   ឃើញការវាយអត្ថបទផ្ទាល់ (Live Typing)
*   បន្ថែមមតិយោបល់ និងការផ្ដល់យោបល់

## 💾 3. រក្សាទុកស្វ័យប្រវត្តិ & ប្រវត្តិឯកសារ (Auto Save & Version History)
*   រក្សាទុករាល់ការផ្លាស់ប្តូរដោយស្វ័យប្រវត្តិ
*   មើលកំណែមុនៗ និងទាញយកមាតិកាចាស់មកវិញ

## 🎨 4. ឧបករណ៍រៀបចំទម្រង់ & រចនាប័ទ្ម (Formatting & Styling Tools)
*   ផ្លាស់ប្តូរប្រភេទអក្សរ, ទំហំ, និងពណ៌
*   បន្ថែមចំណងជើង, បញ្ជី (Lists), និងការតម្រឹម (Alignment)
*   បញ្ចូលតារាង, រូបភាព (បង្កើតដោយ AI), គំនូសតាង និងតំណភ្ជាប់

## 🔍 5. ឧបករណ៍ឆ្លាតវៃ (Smart Tools - AI & Productivity)
*   ពិនិត្យអក្ខរាវិរុទ្ធ និងវេយ្យាករណ៍
*   វាយអត្ថបទដោយសំឡេង
*   ស្វែងរកព័ត៌មានបន្ថែម

## 🔐 6. ការចែករំលែក & សិទ្ធិប្រើប្រាស់ (Sharing & Permissions)
*   ចែករំលែកជាមួយអ្នកដទៃតាមរយៈ Link
*   កំណត់សិទ្ធិ៖ Viewer, Commenter, Editor

## 🌐 7. របៀបក្រៅបណ្តាញ (Offline Mode)
*   ធ្វើការដោយគ្មានអ៊ីនធឺណិត
*   ធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិនៅពេលមានអ៊ីនធឺណិតវិញ

## 📤 8. ការនាំចេញឯកសារ (Export)
*   ទាញយកជាទម្រង់៖ PDF, Word, Plain text

## 🔌 9. កម្មវិធីបន្ថែម (Add-ons)
*   បន្ថែមមុខងារពិសេសៗតាមរយៈ Add-ons`,
    advancedGuideTitle: '🔥 មុខងារកម្រិតខ្ពស់ និងមានប្រយោជន៍បំផុត',
    advancedGuideContent: `# 🔥 មុខងារកម្រិតខ្ពស់ និងមានប្រយោជន៍បំផុត

## 📑 1. គ្រោងឯកសារ (Document Outline)
*   បង្កើតរចនាសម្ព័ន្ធដោយស្វ័យប្រវត្តិផ្អែកលើ Heading (H1, H2, H3)
*   ជួយឱ្យអ្នករុករកក្នុងឯកសារវែងៗបានយ៉ាងលឿន

## 🔗 2. មាតិកា (Table of Contents)
*   បង្កើតមាតិកាដែលអាចចុចបានដោយស្វ័យប្រវត្តិ
*   ធ្វើបច្ចុប្បន្នភាពភ្លាមៗនៅពេលអ្នកកែសម្រួល Heading

## 🧠 3. វាយអត្ថបទដោយសំឡេង (Voice Typing)
*   បំប្លែងសំឡេងនិយាយទៅជាអត្ថបទ
*   មានប្រយោជន៍ខ្លាំងនៅពេលអ្នកមិនចង់វាយអក្សរ

## ✍️ 4. របៀបផ្ដល់យោបល់ (Suggesting Mode)
*   កែសម្រួលឯកសារដោយមិនប៉ះពាល់អត្ថបទដើមផ្ទាល់
*   អ្នកដទៃអាចទទូលយក ឬបដិសេធការផ្ដល់យោបល់របស់អ្នក

## 💬 5. មតិយោបល់ (Comments)
*   បន្ថែមមតិលើអត្ថបទជាក់លាក់
*   ឆ្លើយតប និងដោះស្រាយការពិភាក្សា

## 📌 6. មុខងារ @Mention
*   វាយ **@ + ឈ្មោះ/ឯកសារ/កាលបរិច្ឆេទ**
*   Tag មនុស្ស ឬភ្ជាប់ឯកសារពី Google Drive

## 📊 7. ការបញ្ចូលឆ្លាតវៃ (Smart Insert)
*   បញ្ចូលតារាងពី Google Sheets
*   កំណត់ត្រាប្រជុំ និងព្រឹត្តិការណ៍ប្រតិទិន

## 🌐 8. របៀបក្រៅបណ្តាញ (Offline Mode)
*   ធ្វើការដោយគ្មានអ៊ីនធឺណិត

## 🧩 9. កម្មវិធីបន្ថែម (Add-ons)
*   ដំឡើងឧបករណ៍ដូចជា Grammarly ឬឧបករណ៍បកប្រែ

## 📄 10. គំរូឯកសារ (Templates)
*   មានគំរូស្រាប់សម្រាប់៖ Resume, របាយការណ៍, គម្រោងផ្សេងៗ`
  },
  en: {
    documentTabs: 'DOCUMENT TABS',
    createTab: 'Create New Tab',
    addLesson: 'Add New Lesson...',
    edit: 'Edit',
    downloadPdf: 'Download PDF',
    preview: 'Preview',
    cancel: 'Cancel',
    save: 'Save',
    untitledLesson: 'Untitled Lesson...',
    editorPlaceholder: 'Write lesson here... Use Markdown for text and code formatting',
    welcome: 'Welcome',
    appTitle: 'Teacher Docs',
    signInGoogle: 'Sign in with Google',
    workspace: 'Workspace',
    deleteLessonConfirm: 'Are you sure you want to delete this lesson?',
    enterTabName: 'Enter Tab Name:',
    errorCreatingTab: 'Error creating tab. Please check your connection.',
    exportFailed: 'Failed to download PDF',
    newLessonTitle: 'New Lesson',
    newLessonContent: '# New Lesson\n\nWrite your content here...\n\n```sql\n-- Write your code here\nSELECT * FROM table;\n```',
    errorCreatingLesson: 'Error creating lesson',
    errorSavingLesson: 'Error saving lesson',
    feature1Title: 'Document Tabs',
    feature1Desc: 'Organize documents by category tabs',
    feature2Title: 'Markdown Editor',
    feature2Desc: 'Write fast with Markdown support',
    feature3Title: 'Code Formatting',
    feature3Desc: 'Beautiful code syntax highlighting',
    cloudStorage: 'Cloud Storage',
    cloudDesc: 'Save and access on any device',
    startFree: 'Get Started Free',
    tagline: 'Organize Your Lessons',
    taglineHighlight: 'Effortlessly',
    infiniteKnowledge: 'Infinite Knowledge',
    sqlFolder: 'SQL Lessons',
    sqlLessonTitle: 'SQL Set Operators & Functions Summary',
    sqlLessonContent: `This is a brief summary of all SQL lessons, concise and comprehensive, with **SQL Queries** included for easy understanding and direct application in SQL Server or PostgreSQL:\n\n---\n\n### **1. SQL Set Operators (Combining Data Sets)**\n\n* **UNION ALL:** Combines tables **A + B** (includes duplicates) $\\rightarrow$ **Fastest**.\n    \`\`\`sql\n    SELECT Name FROM Employees -- Table A\n    UNION ALL\n    SELECT Name FROM Customers; -- Table B\n    \`\`\`\n* **UNION:** Combines tables **A + B** (removes duplicates) $\\rightarrow$ **Slower**.\n    \`\`\`sql\n    SELECT Name FROM Employees \n    UNION \n    SELECT Name FROM Customers;\n    \`\`\`\n* **EXCEPT:** Returns rows found in **A but not in B** (subtraction) $\\rightarrow$ Useful for **checking for missing data**.\n    \`\`\`sql\n    SELECT ID FROM Table_A \n    EXCEPT \n    SELECT ID FROM Table_B; -- Result is IDs existing only in A\n    \`\`\`\n* **INTERSECT:** Returns rows **existing in both A and B** (commonality) $\\rightarrow$ Useful for **finding duplicates**.\n    \`\`\`sql\n    SELECT Name FROM Employees \n    INTERSECT \n    SELECT Name FROM Customers; -- Result is people who are both employees and customers\n    \`\`\`\n\n---\n\n### **2. SQL Functions (Data Processors)**\n\n* **Single-Row:** Operates on **"each row"** (1 In $\\rightarrow$ 1 Out). Used for **cleaning and modifying data**.\n    \`\`\`sql\n    SELECT UPPER(Firstname), LOWER(Lastname) \n    FROM Sales.Employees;\n    \`\`\`\n* **Multi-Row (Aggregate):** Operates on a **"group of data"** (Many In $\\rightarrow$ 1 Out). Used for **summarizing reports**.\n    \`\`\`sql\n    SELECT COUNT(EmployeeID), SUM(Salary) \n    FROM Sales.Employees;\n    \`\`\`\n\n---\n\n### **3. Nested Functions**\n\n* **Rule:** Executes from **"Inside-Out"**.\n    \`\`\`sql\n    -- Extract 3 characters from left and convert to lowercase\n    SELECT LOWER(LEFT('CAMBODIA', 3)); \n    -- Step 1: LEFT results in 'CAM' -> Step 2: LOWER results in 'cam'\n    \`\`\`\n\n---\n\n### **4. Pro Tips**\n\n1.  **Performance:** Prioritize **UNION ALL** in applications (Laravel/Flutter) for faster queries.\n2.  **Data Quality:** Use **EXCEPT** twice to verify data migration:\n    \`\`\`sql\n    -- If both results are empty, migration is 100% successful\n    SELECT * FROM Table_A EXCEPT SELECT * FROM Table_B;\n    SELECT * FROM Table_B EXCEPT SELECT * FROM Table_A;\n    \`\`\`\n3.  **Clean Code:** Avoid using \`SELECT * \` in Set Operators; always explicitly list column names.\n\n---\n**Note:** This is a complete record with code and explanations.`,
    translate: 'Translate Content',
    translating: 'Translating...',
    exportSettings: 'Export Settings',
    pageSize: 'Page Size',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    margins: 'Margins (Px)',
    download: 'Download Now',
    rename: 'Rename',
    delete: 'Delete',
    renameTab: 'Rename Tab',
    deleteTabConfirm: 'Are you sure you want to delete this tab? All lessons inside will be lost.',
    generateImage: 'Generate AI Image',
    generatingImage: 'Generating...',
    imagePrompt: 'Describe the image you want...',
    generate: 'Generate',
    insert: 'Insert',
    previewPdf: 'Preview PDF Layout',
    pageRange: 'Page Range',
    startPage: 'Start Page',
    endPage: 'End Page',
    allPages: 'All Pages',
    customRange: 'Custom Range',
    totalPages: 'Total Pages',
    share: 'Share',
    sharing: 'Share document',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',
    versionHistory: 'Version history',
    versions: 'Versions',
    guideFolder: 'User Guide',
    guideTitle: '🚀 Welcome to Smart Lesson Manager',
    guideContent: `# 🚀 Welcome to Smart Lesson Manager

Here is a guide and demonstration of our app's capabilities:

## 📝 1. Cloud-Based Editing
*   Work directly in your browser (no installation needed)
*   Files are saved automatically
*   Access documents from any device (PC, phone, tablet)

## 👥 2. Real-Time Collaboration
*   Multiple users can edit the same document at the same time
*   See others typing live (Live Typing)
*   Add comments and suggestions

## 💾 3. Auto Save & Version History
*   Automatically saves every change
*   View previous versions and restore old content

## 🎨 4. Formatting & Styling Tools
*   Change fonts, size, and color
*   Add headings, lists, and alignment
*   Insert tables, images (AI-generated), charts, and links

## 🔍 5. Smart Tools (AI & Productivity)
*   Spelling and grammar check
*   Voice typing
*   Explore more information

## 🔐 6. Sharing & Permissions
*   Share with others using a link
*   Set permissions: Viewer, Commenter, Editor

## 🌐 7. Offline Mode
*   Work without internet
*   Sync automatically when back online

## 📤 8. File Export & Compatibility
*   Download in formats: PDF, Word, Plain text

## 🔌 9. Add-ons & Extensions
*   Add extra features via Add-ons`,
    advancedGuideTitle: '🔥 Advanced & Useful Features',
    advancedGuideContent: `# 🔥 Advanced & Useful Features

## 📑 1. Document Outline
* Automatically creates a structure based on headings (H1, H2, H3)
* Lets you quickly navigate long documents

## 🔗 2. Table of Contents
* Generates a clickable table of contents automatically
* Updates instantly when you edit headings

## 🧠 3. Voice Typing
* Convert speech into text
* Found under **Tools → Voice typing**

## ✍️ 4. Suggesting Mode (Track Changes)
* Edit documents without changing the original text directly
* Others can accept or reject your suggestions

## 💬 5. Comments & Collaboration
* Add comments on specific text
* Reply and resolve discussions

## 📌 6. @Mention Feature
* Type **@ + name/file/date**
* Tag people or link files from Google Drive

## 📊 7. Smart Insert
* Charts from Google Sheets
* Meeting notes
* Calendar events

## 📄 8. Templates
* Ready-made templates for: Resume, Reports, etc.

## 🧪 9. Version History & Compare
* See all previous versions
* Restore or compare changes

## ⌨️ 10. Keyboard Shortcuts
* Ctrl + Alt + M → Add comment
* Ctrl + / → View shortcuts`
  }
};
