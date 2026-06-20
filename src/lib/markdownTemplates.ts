/** Clean Markdown lesson templates — no HTML, code blocks outside lists. */

export const BLANK_LESSON_KH = `# ម្ខាស់ចំណងជើងមេរៀន

> សេចក្តីផ្តើមខ្លី ១–២ បន្ទះ។

---

## ១. ប្រធានបទ

សរសេរខ្លឹមសារមេរៀន...

\`\`\`sql
SELECT * FROM table_name;
\`\`\`

---

## ២. កិច្ចការអនុវត្ត

1. សំណួរ ឬកិច្ចការ ១
2. សំណួរ ឬកិច្ចការ ២
`;

export const BLANK_LESSON_EN = `# Lesson Title

> Short introduction (1–2 sentences).

---

## 1. Topic

Explain the main concept here...

\`\`\`sql
SELECT * FROM table_name;
\`\`\`

---

## 2. Practice

1. Task or question 1
2. Task or question 2
`;

export const SQL_LESSON_KH = `# SQL Set Operators & Functions

សង្ខេបខ្លី ខ្លឹម និងគ្រប់ដោយមាន **SQL Query** សម្រាប់អនុវត្តក្នុង SQL Server ឬ PostgreSQL។

---

## ១. SQL Set Operators

### UNION ALL

បញ្ជូលតារាង **A + B** (រក្សា duplicates) → **លឿនបំផុត**

\`\`\`sql
SELECT Name FROM Employees   -- តារាង A
UNION ALL
SELECT Name FROM Customers;  -- តារាង B
\`\`\`

### UNION

បញ្ជូល **A + B** (លុប duplicates) → **យឺតជាង UNION ALL**

\`\`\`sql
SELECT Name FROM Employees
UNION
SELECT Name FROM Customers;
\`\`\`

### EXCEPT

យក rows ដែលមានក្នុង **A តែមិនមានក្នុង B**

\`\`\`sql
SELECT ID FROM Table_A
EXCEPT
SELECT ID FROM Table_B;
\`\`\`

### INTERSECT

យក rows ដែលមាន **ទាំង A និង B**

\`\`\`sql
SELECT Name FROM Employees
INTERSECT
SELECT Name FROM Customers;
\`\`\`

---

## ២. SQL Functions

### Single-Row Functions

ដំណើរការលើ **ជួរនីមួយៗ** (1 in → 1 out) — សម្រាប់សម្អាត/កែទិន្នន័យ

\`\`\`sql
SELECT UPPER(FirstName), LOWER(LastName)
FROM Sales.Employees;
\`\`\`

### Multi-Row (Aggregate) Functions

ដំណើរការលើ **ក្រុមទិន្នន័យ** (many in → 1 out) — សម្រាប់របាយការណ៍

\`\`\`sql
SELECT COUNT(EmployeeID), SUM(Salary)
FROM Sales.Employees;
\`\`\`

---

## ៣. Nested Functions

**ច្បាប់:** ដំណើរការពី **ក្នុង → ក្រៅ** (Inside-Out)

\`\`\`sql
-- LEFT → 'CAM'  រួច LOWER → 'cam'
SELECT LOWER(LEFT('CAMBODIA', 3));
\`\`\`

---

## ៤. Pro Tips

1. **Performance** — ប្រើ \`UNION ALL\` ក្នុង app ដើម្បី query លឿន
2. **Data Quality** — ប្រើ \`EXCEPT\` ពីរដើម្បី verify migration:

\`\`\`sql
SELECT * FROM Table_A EXCEPT SELECT * FROM Table_B;
SELECT * FROM Table_B EXCEPT SELECT * FROM Table_A;
\`\`\`

3. **Clean Code** — កុំប្រើ \`SELECT *\` ក្នុង Set Operators; កត់ column ឱ្យច្បាស់
`;

export const SQL_LESSON_EN = `# SQL Set Operators & Functions

A concise summary with **SQL queries** for SQL Server or PostgreSQL.

---

## 1. SQL Set Operators

### UNION ALL

Combines **A + B** (keeps duplicates) → **fastest**

\`\`\`sql
SELECT Name FROM Employees   -- Table A
UNION ALL
SELECT Name FROM Customers;  -- Table B
\`\`\`

### UNION

Combines **A + B** (removes duplicates) → **slower than UNION ALL**

\`\`\`sql
SELECT Name FROM Employees
UNION
SELECT Name FROM Customers;
\`\`\`

### EXCEPT

Rows in **A but not in B**

\`\`\`sql
SELECT ID FROM Table_A
EXCEPT
SELECT ID FROM Table_B;
\`\`\`

### INTERSECT

Rows in **both A and B**

\`\`\`sql
SELECT Name FROM Employees
INTERSECT
SELECT Name FROM Customers;
\`\`\`

---

## 2. SQL Functions

### Single-Row Functions

One row in → one value out (clean/transform data)

\`\`\`sql
SELECT UPPER(FirstName), LOWER(LastName)
FROM Sales.Employees;
\`\`\`

### Aggregate Functions

Many rows in → one summary out

\`\`\`sql
SELECT COUNT(EmployeeID), SUM(Salary)
FROM Sales.Employees;
\`\`\`

---

## 3. Nested Functions

**Rule:** evaluate **inside → out**

\`\`\`sql
-- LEFT → 'CAM'  then LOWER → 'cam'
SELECT LOWER(LEFT('CAMBODIA', 3));
\`\`\`

---

## 4. Pro Tips

1. **Performance** — prefer \`UNION ALL\` in apps for speed
2. **Data quality** — run \`EXCEPT\` both ways after migration:

\`\`\`sql
SELECT * FROM Table_A EXCEPT SELECT * FROM Table_B;
SELECT * FROM Table_B EXCEPT SELECT * FROM Table_A;
\`\`\`

3. **Clean code** — avoid \`SELECT *\` in set operators; list columns explicitly
`;

export const QUIZ_LESSON_KH = `# មេរៀន + Quiz

## ១. មេរៀន

សរសេរមេរៀននៅទីនេះ...

\`\`\`quiz
{"question":"UNION ALL ធ្វើអ្វី?","options":["លុប duplicate","រក្សា row ទាំងអស់","Sort data"],"answer":1}
\`\`\`

---

## ២. សំណួរបន្ថែម

\`\`\`quiz
{"question":"EXCEPT ប្រើសម្រាប់អ្វី?","options":["រក row រួម","រក row ដែល A មានតែ B គ្មាន","Sort column"],"answer":1}
\`\`\`
`;

export const QUIZ_LESSON_EN = `# Lesson with Quiz

## 1. Content

Write your lesson here...

\`\`\`quiz
{"question":"What does UNION ALL do?","options":["Removes duplicates","Keeps all rows","Sorts data"],"answer":1}
\`\`\`

---

## 2. Extra question

\`\`\`quiz
{"question":"What is EXCEPT used for?","options":["Common rows","Rows in A not in B","Sorting"],"answer":1}
\`\`\`
`;

export const HOMEWORK_KH = `# កិច្ចការផ្ទះ

**ឈ្មោះ:** _______________  
**ថ្ងៃ:** _______________

---

## សំណួរ

1. ឆ្លើយសំណួរទី ១...
2. ឆ្លើយសំណួរទី ២...

---

## SQL Practice

\`\`\`sql
-- សរសេរ query របស់អ្នកនៅទីនេះ
SELECT * FROM table_name;
\`\`\`
`;

export const HOMEWORK_EN = `# Homework

**Name:** _______________  
**Date:** _______________

---

## Questions

1. Answer question 1...
2. Answer question 2...

---

## SQL Practice

\`\`\`sql
-- Write your query here
SELECT * FROM table_name;
\`\`\`
`;

export const RESUME_KH = `# របាយការណ៍ជីវភាព (Resume / CV)

**ឈ្មោះ:** _______________  
**ទំនាក់ទង:** _______________  
**Email:** _______________  
**LinkedIn / Portfolio:** _______________

---

## បទពិសោធន៍ការងារ

### [តួនាទី] — [ក្រុមហ៊ុន]
**[ខែ/ឆ្នាំ] – [ខែ/ឆ្នាំ]**

- ការងារ / សមិទ្ធផល ១
- ការងារ / សមិទ្ធផល ២

### [តួនាទី] — [ក្រុមហ៊ុន]
**[ខែ/ឆ្នាំ] – [ខែ/ឆ្នាំ]**

- ការងារ / សមិទ្ធផល ១

---

## ការអប់រំ

| កម្រិត | សាលា / សកលវិទ្យាល័យ | ឆ្នាំ |
|--------|---------------------|------|
| Bachelor | _______________ | ____ |

---

## ជំនាញ

- ជំនាញ ១ · ជំនាញ ២ · ជំនាញ ៣

---

## ភាសា

- ខ្មែរ — _______________
- English — _______________
`;

export const RESUME_EN = `# Resume / CV

**Name:** _______________  
**Phone:** _______________  
**Email:** _______________  
**LinkedIn / Portfolio:** _______________

---

## Work Experience

### [Job Title] — [Company]
**[Month/Year] – [Month/Year]**

- Achievement or responsibility 1
- Achievement or responsibility 2

### [Job Title] — [Company]
**[Month/Year] – [Month/Year]**

- Achievement or responsibility 1

---

## Education

| Level | School / University | Year |
|-------|---------------------|------|
| Bachelor | _______________ | ____ |

---

## Skills

- Skill 1 · Skill 2 · Skill 3

---

## Languages

- Khmer — _______________
- English — _______________
`;

export const REPORT_KH = `# របាយការណ៍

**ចំណងជើង:** _______________  
**កាលបរិច្ឆេទ:** _______________  
**អ្នករៀបចំ:** _______________  
**អ្នកទទួល:** _______________

---

## ១. សេចក្តីសង្ខេប (Executive Summary)

សរសេរសង្ខេប ២–៣ បន្ទះ...

---

## ២. របត់ការងារ / លទ្ធផល

| ល.រ. | ការងារ | ស្ថានភាព | កំណត់សម្គាល់ |
|------|--------|----------|-------------|
| ១ | | ✅ / ⏳ | |
| ២ | | ✅ / ⏳ | |

---

## ៣. ទិន្នន័យ & ការវិភាគ

- ចំណុចសំខាន់ ១
- ចំណុចសំខាន់ ២

---

## ៤. បញ្ហា & ដំណោះស្រាយ

| បញ្ហា | ដំណោះស្រាយ | រយៈពេល |
|-------|------------|---------|
| | | |

---

## ៥. ផែនការបន្ត

1. ជំហាន ១
2. ជំហាន ២
3. ជំហាន ៣

---

## ៦. សេចក្តីសន្និដ្ឋាន

...
`;

export const REPORT_EN = `# Report

**Title:** _______________  
**Date:** _______________  
**Prepared by:** _______________  
**Recipient:** _______________

---

## 1. Executive Summary

Write a brief 2–3 paragraph overview...

---

## 2. Progress / Results

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | | ✅ / ⏳ | |
| 2 | | ✅ / ⏳ | |

---

## 3. Data & Analysis

- Key point 1
- Key point 2

---

## 4. Issues & Solutions

| Issue | Solution | Timeline |
|-------|----------|----------|
| | | |

---

## 5. Next Steps

1. Step 1
2. Step 2
3. Step 3

---

## 6. Conclusion

...
`;

export const PROJECT_KH = `# គម្រោង — [ឈ្មោះគម្រោង]

**គម្រោង:** _______________  
**ក្រុម / អ្នកទទួលខុសត្រូវ:** _______________  
**រយៈពេល:** _______________ → _______________  
**ស្ថានភាព:** 🟢 កំពុងដំណើរការ / 🟡 រង់ចាំ / 🔴 យឺត

---

## ១. គោលបំណង

- គោលបំណង ១
- គោលបំណង ២

---

## ២. វិសាលភាព (Scope)

**ក្នុងវិសាលភាព:**
- ...

**ក្រៅវិសាលភាព:**
- ...

---

## ៣. Timeline

| ដំណាក់កាល | កាលបរិច្ឆេទ | ស្ថានភាព |
|-----------|-------------|--------|
| Kick-off | | |
| Milestone 1 | | |
| Delivery | | |

---

## ៤. តួនាទី & ការទទួលខុសត្រូវ

| តួនាទី | ឈ្មោះ | ការងារ |
|--------|-------|--------|
| PM | | |
| Member | | |

---

## ៥. ធនធាន & ថវិកា

- ធនធាន: ...
- ថវិកា (បើមាន): ...

---

## ៦. ហានិភ័យ & ការគ្រប់គ្រង

| ហានិភ័យ | ផលប៉ះពាល់ | វិធានការការពារ |
|---------|-----------|----------------|
| | | |

---

## ៧. ឯកសារភ្ជាប់

- [ ] Proposal
- [ ] Design
- [ ] Final deliverable
`;

export const PROJECT_EN = `# Project — [Project Name]

**Project:** _______________  
**Team / Owner:** _______________  
**Timeline:** _______________ → _______________  
**Status:** 🟢 In progress / 🟡 On hold / 🔴 Delayed

---

## 1. Objectives

- Objective 1
- Objective 2

---

## 2. Scope

**In scope:**
- ...

**Out of scope:**
- ...

---

## 3. Timeline

| Phase | Date | Status |
|-------|------|--------|
| Kick-off | | |
| Milestone 1 | | |
| Delivery | | |

---

## 4. Roles & Responsibilities

| Role | Name | Tasks |
|------|------|-------|
| PM | | |
| Member | | |

---

## 5. Resources & Budget

- Resources: ...
- Budget (if any): ...

---

## 6. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| | | |

---

## 7. Attachments

- [ ] Proposal
- [ ] Design
- [ ] Final deliverable
`;

export const LESSON_PLAN_KH = `# សឥ្ធាកម្មមេរៀន

**មុខវិជ្ជា:** _______________  
**ថ្នាក់:** _______________  
**រយៈពេល:** ___ ម៉ោង  
**គ្រូ:** _______________  
**កាលបរិច្ឆេទ:** _______________

---

## ១. គោលបំណងសិក្សា

1. សិស្សអាច...
2. សិស្សអាច...

---

## ២. សម្ភារ & ឧបករណ៍

- ...
- ...

---

## ៣. សកម្មភាព (Activities)

| ពេលវេលា | សកម្មភាព | វិធីសាស្ត្រ |
|---------|---------|------------|
| ៥ នាទី | Warm-up | |
| ២០ នាទី | បង្រៀន | |
| ១៥ នាទី | អនុវត្ត | |
| ៥ នាទី | Wrap-up | |

---

## ៤. ការវាយតម្លៃ

- ...
`;

export const LESSON_PLAN_EN = `# Lesson Plan

**Subject:** _______________  
**Grade:** _______________  
**Duration:** ___ hours  
**Teacher:** _______________  
**Date:** _______________

---

## 1. Learning Objectives

1. Students will be able to...
2. Students will be able to...

---

## 2. Materials

- ...
- ...

---

## 3. Activities

| Time | Activity | Method |
|------|----------|--------|
| 5 min | Warm-up | |
| 20 min | Instruction | |
| 15 min | Practice | |
| 5 min | Wrap-up | |

---

## 4. Assessment

- ...
`;

export const MEETING_KH = `# កំណត់ត្រាប្រជុំ

**ប្រធានបទ:** _______________  
**កាលបរិច្ឆេទ:** _______________  
**ទីតាំង / Online:** _______________  
**អ្នកចូលរួម:** _______________

---

## របៀបវារៈ

1. ...
2. ...
3. ...

---

## កំណត់ត្រា

| ល.រ. | ប្រធានបទ | សេចក្តីសម្រេច | អ្នកទទួលខុសត្រូវ | កាលបរិច្ឆេទ |
|------|----------|--------------|----------------|-------------|
| ១ | | | | |
| ២ | | | | |

---

## Action Items

- [ ] ...
- [ ] ...
`;

export const MEETING_EN = `# Meeting Notes

**Topic:** _______________  
**Date:** _______________  
**Location / Online:** _______________  
**Attendees:** _______________

---

## Agenda

1. ...
2. ...
3. ...

---

## Notes

| # | Topic | Decision | Owner | Due |
|---|-------|----------|-------|-----|
| 1 | | | | |
| 2 | | | | |

---

## Action Items

- [ ] ...
- [ ] ...
`;

export type MarkdownTemplateId =
  | 'blank'
  | 'sql'
  | 'quiz'
  | 'homework'
  | 'resume'
  | 'report'
  | 'project'
  | 'lesson-plan'
  | 'meeting';

const TEMPLATE_BY_LANG: Record<MarkdownTemplateId, { kh: string; en: string }> = {
  blank: { kh: BLANK_LESSON_KH, en: BLANK_LESSON_EN },
  sql: { kh: SQL_LESSON_KH, en: SQL_LESSON_EN },
  quiz: { kh: QUIZ_LESSON_KH, en: QUIZ_LESSON_EN },
  homework: { kh: HOMEWORK_KH, en: HOMEWORK_EN },
  resume: { kh: RESUME_KH, en: RESUME_EN },
  report: { kh: REPORT_KH, en: REPORT_EN },
  project: { kh: PROJECT_KH, en: PROJECT_EN },
  'lesson-plan': { kh: LESSON_PLAN_KH, en: LESSON_PLAN_EN },
  meeting: { kh: MEETING_KH, en: MEETING_EN },
};

export function getMarkdownTemplate(id: MarkdownTemplateId, lang: 'kh' | 'en'): string {
  return TEMPLATE_BY_LANG[id][lang];
}
