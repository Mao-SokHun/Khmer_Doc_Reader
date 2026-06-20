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

export type MarkdownTemplateId = 'blank' | 'sql' | 'quiz' | 'homework';

const TEMPLATE_BY_LANG: Record<MarkdownTemplateId, { kh: string; en: string }> = {
  blank: { kh: BLANK_LESSON_KH, en: BLANK_LESSON_EN },
  sql: { kh: SQL_LESSON_KH, en: SQL_LESSON_EN },
  quiz: { kh: QUIZ_LESSON_KH, en: QUIZ_LESSON_EN },
  homework: { kh: HOMEWORK_KH, en: HOMEWORK_EN },
};

export function getMarkdownTemplate(id: MarkdownTemplateId, lang: 'kh' | 'en'): string {
  return TEMPLATE_BY_LANG[id][lang];
}
