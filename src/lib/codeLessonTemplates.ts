/** Programming language / framework / library lesson templates (same layout as SQL). */

export type CodeSubcategory = 'language' | 'framework' | 'library';

export type CodeTemplateTopic = {
  titleKh: string;
  titleEn: string;
  code: string;
};

export type CodeTemplateDef = {
  id: CodeTemplateId;
  subcategory: CodeSubcategory;
  titleKh: string;
  titleEn: string;
  descKh: string;
  descEn: string;
  fenceLang: string;
  topics: CodeTemplateTopic[];
};

export const CODE_SUBCATEGORIES: Array<{
  id: CodeSubcategory;
  labelKh: string;
  labelEn: string;
}> = [
  { id: 'language', labelKh: 'ភាសា Programming', labelEn: 'Languages' },
  { id: 'framework', labelKh: 'Framework', labelEn: 'Frameworks' },
  { id: 'library', labelKh: 'Library & Tools', labelEn: 'Libraries & Tools' },
];

export const CODE_TEMPLATE_IDS = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'html-css',
  'bash',
  'react',
  'vue',
  'angular',
  'nextjs',
  'nodejs',
  'django',
  'flask',
  'spring',
  'laravel',
  'dotnet',
  'mongodb',
  'docker',
  'git',
] as const;

export type CodeTemplateId = (typeof CODE_TEMPLATE_IDS)[number];

export function isCodeTemplateId(id: string): id is CodeTemplateId {
  return (CODE_TEMPLATE_IDS as readonly string[]).includes(id);
}

export function buildCodeLessonMarkdown(def: CodeTemplateDef, lang: 'kh' | 'en'): string {
  const title = lang === 'kh' ? def.titleKh : def.titleEn;
  const intro =
    lang === 'kh'
      ? `សង្ខេប **${def.titleKh}** — សរសេរ ឬ **Paste code (Ctrl+V)** ដើម្បី syntax highlight ដោយស្វ័យប្រវត្តិ។`
      : `**${def.titleEn}** — write or **paste code (Ctrl+V)** for automatic syntax highlighting.`;

  const sections = def.topics
    .map((topic, index) => {
      const heading = lang === 'kh' ? topic.titleKh : topic.titleEn;
      return `## ${index + 1}. ${heading}

\`\`\`${def.fenceLang}
${topic.code.trim()}
\`\`\``;
    })
    .join('\n\n---\n\n');

  const notes =
    lang === 'kh'
      ? `## Notes

- Paste code → auto wrap + highlight
- ប្តូរភាសា code block: \`\`\`${def.fenceLang}\`, \`\`\`javascript, \`\`\`typescript`
      : `## Notes

- Paste code → auto wrap + highlight
- Change fence language: \`\`\`${def.fenceLang}\`, \`\`\`javascript, \`\`\`typescript`;

  return `# ${title}

> ${intro}

---

${sections}

---

${notes}
`;
}

const topic = (titleKh: string, titleEn: string, code: string): CodeTemplateTopic => ({
  titleKh,
  titleEn,
  code,
});

export const CODE_TEMPLATE_DEFS: CodeTemplateDef[] = [
  {
    id: 'javascript',
    subcategory: 'language',
    titleKh: 'JavaScript',
    titleEn: 'JavaScript',
    descKh: 'Variables, functions, async/await',
    descEn: 'Variables, functions, async/await',
    fenceLang: 'javascript',
    topics: [
      topic('ផัวแปร & ប្រភេទ', 'Variables & types', `const title = "Khmer Doc";
let count = 0;
const tags = ["js", "web"];`),
      topic('Functions & Arrow', 'Functions & arrow', `function greet(name) {
  return \`Hello, \${name}!\`;
}

const add = (a, b) => a + b;`),
      topic('Async / Await', 'Async / await', `async function fetchLesson(id) {
  const res = await fetch(\`/api/lessons/\${id}\`);
  return res.json();
}`),
    ],
  },
  {
    id: 'typescript',
    subcategory: 'language',
    titleKh: 'TypeScript',
    titleEn: 'TypeScript',
    descKh: 'Types, interfaces, generics',
    descEn: 'Types, interfaces, generics',
    fenceLang: 'typescript',
    topics: [
      topic('Types & Interfaces', 'Types & interfaces', `interface Lesson {
  id: string;
  title: string;
  tags?: string[];
}

const lesson: Lesson = { id: "1", title: "Intro" };`),
      topic('Generics', 'Generics', `function firstItem<T>(items: T[]): T | undefined {
  return items[0];
}`),
      topic('Union & Optional', 'Union & optional', `type Lang = "kh" | "en";
function label(lang: Lang): string {
  return lang === "kh" ? "ខ្មែរ" : "English";
}`),
    ],
  },
  {
    id: 'python',
    subcategory: 'language',
    titleKh: 'Python',
    titleEn: 'Python',
    descKh: 'Functions, classes, list comprehension',
    descEn: 'Functions, classes, list comprehension',
    fenceLang: 'python',
    topics: [
      topic('Basics', 'Basics', `name = "Khmer Doc"
numbers = [1, 2, 3]
squares = [n * n for n in numbers]`),
      topic('Functions', 'Functions', `def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))`),
      topic('Classes', 'Classes', `class Lesson:
    def __init__(self, title: str):
        self.title = title

lesson = Lesson("Python 101")`),
    ],
  },
  {
    id: 'java',
    subcategory: 'language',
    titleKh: 'Java',
    titleEn: 'Java',
    descKh: 'Classes, interfaces, streams',
    descEn: 'Classes, interfaces, streams',
    fenceLang: 'java',
    topics: [
      topic('Class & Method', 'Class & method', `public class Lesson {
  private final String title;

  public Lesson(String title) {
    this.title = title;
  }

  public String getTitle() {
    return title;
  }
}`),
      topic('Interface', 'Interface', `interface Readable {
  String read();
}

public class Doc implements Readable {
  public String read() { return "content"; }
}`),
      topic('Streams', 'Streams', `List<String> titles = List.of("A", "B", "C");
long count = titles.stream().filter(t -> t.startsWith("A")).count();`),
    ],
  },
  {
    id: 'csharp',
    subcategory: 'language',
    titleKh: 'C#',
    titleEn: 'C#',
    descKh: 'Classes, LINQ, async',
    descEn: 'Classes, LINQ, async',
    fenceLang: 'csharp',
    topics: [
      topic('Class', 'Class', `public class Lesson {
    public string Title { get; set; } = "";
}

var lesson = new Lesson { Title = "C# Basics" };`),
      topic('LINQ', 'LINQ', `var nums = new[] { 1, 2, 3, 4 };
var evens = nums.Where(n => n % 2 == 0).ToList();`),
      topic('Async', 'Async', `public async Task<string> LoadAsync(string id) {
    using var client = new HttpClient();
    return await client.GetStringAsync($"/api/{id}");
}`),
    ],
  },
  {
    id: 'cpp',
    subcategory: 'language',
    titleKh: 'C / C++',
    titleEn: 'C / C++',
    descKh: 'Pointers, STL, classes',
    descEn: 'Pointers, STL, classes',
    fenceLang: 'cpp',
    topics: [
      topic('Hello World', 'Hello world', `#include <iostream>

int main() {
  std::cout << "Hello, Khmer Doc!" << std::endl;
  return 0;
}`),
      topic('Class', 'Class', `class Lesson {
public:
  std::string title;
  Lesson(std::string t) : title(std::move(t)) {}
};`),
      topic('Vector STL', 'Vector & STL', `#include <vector>
#include <algorithm>

std::vector<int> nums = {3, 1, 4};
std::sort(nums.begin(), nums.end());`),
    ],
  },
  {
    id: 'go',
    subcategory: 'language',
    titleKh: 'Go',
    titleEn: 'Go',
    descKh: 'Structs, goroutines, errors',
    descEn: 'Structs, goroutines, errors',
    fenceLang: 'go',
    topics: [
      topic('Struct & Function', 'Struct & function', `type Lesson struct {
  Title string
}

func greet(name string) string {
  return "Hello, " + name
}`),
      topic('Goroutine', 'Goroutine', `go func() {
  fmt.Println("background task")
}()`),
      topic('Error handling', 'Error handling', `data, err := os.ReadFile("lesson.md")
if err != nil {
  return err
}`),
    ],
  },
  {
    id: 'rust',
    subcategory: 'language',
    titleKh: 'Rust',
    titleEn: 'Rust',
    descKh: 'Ownership, Result, struct',
    descEn: 'Ownership, Result, struct',
    fenceLang: 'rust',
    topics: [
      topic('Struct & Impl', 'Struct & impl', `struct Lesson {
    title: String,
}

impl Lesson {
    fn new(title: &str) -> Self {
        Self { title: title.to_string() }
    }
}`),
      topic('Result', 'Result', `fn parse_id(raw: &str) -> Result<i32, std::num::ParseIntError> {
    raw.parse::<i32>()
}`),
      topic('Iterator', 'Iterator', `let nums = vec![1, 2, 3];
let sum: i32 = nums.iter().sum();`),
    ],
  },
  {
    id: 'php',
    subcategory: 'language',
    titleKh: 'PHP',
    titleEn: 'PHP',
    descKh: 'Arrays, OOP, PDO',
    descEn: 'Arrays, OOP, PDO',
    fenceLang: 'php',
    topics: [
      topic('Arrays', 'Arrays', `<?php
$lesson = ["title" => "PHP", "lang" => "kh"];
echo $lesson["title"];`),
      topic('Class', 'Class', `class Lesson {
  public function __construct(public string $title) {}
}

$doc = new Lesson("Intro");`),
      topic('PDO Query', 'PDO query', `$stmt = $pdo->prepare("SELECT * FROM lessons WHERE id = ?");
$stmt->execute([$id]);`),
    ],
  },
  {
    id: 'ruby',
    subcategory: 'language',
    titleKh: 'Ruby',
    titleEn: 'Ruby',
    descKh: 'Classes, blocks, symbols',
    descEn: 'Classes, blocks, symbols',
    fenceLang: 'ruby',
    topics: [
      topic('Basics', 'Basics', `title = "Khmer Doc"
tags = [:kh, :lesson]
puts title`),
      topic('Class', 'Class', `class Lesson
  attr_reader :title
  def initialize(title)
    @title = title
  end
end`),
      topic('Blocks', 'Blocks', `[1, 2, 3].each { |n| puts n * 2 }`),
    ],
  },
  {
    id: 'swift',
    subcategory: 'language',
    titleKh: 'Swift',
    titleEn: 'Swift',
    descKh: 'Structs, optionals, async',
    descEn: 'Structs, optionals, async',
    fenceLang: 'swift',
    topics: [
      topic('Struct', 'Struct', `struct Lesson {
    let title: String
}

let lesson = Lesson(title: "Swift")`),
      topic('Optional', 'Optional', `var nickname: String? = nil
if let name = nickname {
    print(name)
}`),
      topic('Async', 'Async', `func loadLesson(id: String) async throws -> Data {
    let url = URL(string: "https://api.example.com/\\(id)")!
    return try await URLSession.shared.data(from: url).0
}`),
    ],
  },
  {
    id: 'kotlin',
    subcategory: 'language',
    titleKh: 'Kotlin',
    titleEn: 'Kotlin',
    descKh: 'Data class, null safety',
    descEn: 'Data class, null safety',
    fenceLang: 'kotlin',
    topics: [
      topic('Data class', 'Data class', `data class Lesson(val id: String, val title: String)

val lesson = Lesson("1", "Kotlin")`),
      topic('Null safety', 'Null safety', `var subtitle: String? = null
println(subtitle?.length ?: 0)`),
      topic('Extension', 'Extension', `fun String.wordCount(): Int = split(" ").size`),
    ],
  },
  {
    id: 'html-css',
    subcategory: 'language',
    titleKh: 'HTML & CSS',
    titleEn: 'HTML & CSS',
    descKh: 'Semantic HTML, Flexbox, Grid',
    descEn: 'Semantic HTML, Flexbox, Grid',
    fenceLang: 'html',
    topics: [
      topic('Semantic HTML', 'Semantic HTML', `<!DOCTYPE html>
<html lang="km">
  <head><meta charset="UTF-8" /><title>Lesson</title></head>
  <body>
    <main><h1>ចំណងជើង</h1><p>ខ្លឹមសារ</p></main>
  </body>
</html>`),
      topic('Flexbox', 'Flexbox', `.row {
  display: flex;
  gap: 1rem;
  align-items: center;
}`),
      topic('CSS Grid', 'CSS Grid', `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}`),
    ],
  },
  {
    id: 'bash',
    subcategory: 'language',
    titleKh: 'Bash / Shell',
    titleEn: 'Bash / Shell',
    descKh: 'Scripts, pipes, cron',
    descEn: 'Scripts, pipes, cron',
    fenceLang: 'bash',
    topics: [
      topic('Script', 'Script', `#!/usr/bin/env bash
set -euo pipefail
echo "Deploy Khmer Doc Reader"`),
      topic('Variables', 'Variables', `NAME="lesson"
echo "Editing $NAME"`),
      topic('Pipe', 'Pipe', `grep -R "TODO" src/ | wc -l`),
    ],
  },
  {
    id: 'react',
    subcategory: 'framework',
    titleKh: 'React',
    titleEn: 'React',
    descKh: 'Components, hooks, props',
    descEn: 'Components, hooks, props',
    fenceLang: 'tsx',
    topics: [
      topic('Component', 'Component', `type Props = { title: string };

export function LessonCard({ title }: Props) {
  return <article className="card">{title}</article>;
}`),
      topic('useState', 'useState', `const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Open</button>`),
      topic('useEffect', 'useEffect', `useEffect(() => {
  document.title = title;
}, [title]);`),
    ],
  },
  {
    id: 'vue',
    subcategory: 'framework',
    titleKh: 'Vue 3',
    titleEn: 'Vue 3',
    descKh: 'Composition API, ref, computed',
    descEn: 'Composition API, ref, computed',
    fenceLang: 'vue',
    topics: [
      topic('Script setup', 'Script setup', `<script setup lang="ts">
const title = ref("Vue Lesson");
</script>

<template><h1>{{ title }}</h1></template>`),
      topic('Computed', 'Computed', `const count = ref(0);
const doubled = computed(() => count.value * 2);`),
      topic('Watch', 'Watch', `watch(title, (value) => {
  console.log("title changed", value);
});`),
    ],
  },
  {
    id: 'angular',
    subcategory: 'framework',
    titleKh: 'Angular',
    titleEn: 'Angular',
    descKh: 'Components, services, RxJS',
    descEn: 'Components, services, RxJS',
    fenceLang: 'typescript',
    topics: [
      topic('Component', 'Component', `@Component({
  selector: "app-lesson",
  template: \`<h1>{{ title }}</h1>\`,
})
export class LessonComponent {
  title = "Angular";
}`),
      topic('Service', 'Service', `@Injectable({ providedIn: "root" })
export class LessonService {
  getAll() { return fetch("/api/lessons"); }
}`),
      topic('RxJS pipe', 'RxJS pipe', `this.lessons$ = this.api.getAll().pipe(
  map(items => items.filter(l => l.published))
);`),
    ],
  },
  {
    id: 'nextjs',
    subcategory: 'framework',
    titleKh: 'Next.js',
    titleEn: 'Next.js',
    descKh: 'App Router, server components',
    descEn: 'App Router, server components',
    fenceLang: 'tsx',
    topics: [
      topic('Page', 'Page', `export default function Page() {
  return <main><h1>Next.js Lesson</h1></main>;
}`),
      topic('Server fetch', 'Server fetch', `export default async function Page() {
  const res = await fetch("https://api.example.com/lessons");
  const data = await res.json();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}`),
      topic('Route handler', 'Route handler', `export async function GET() {
  return Response.json({ ok: true });
}`),
    ],
  },
  {
    id: 'nodejs',
    subcategory: 'framework',
    titleKh: 'Node.js + Express',
    titleEn: 'Node.js + Express',
    descKh: 'REST API, middleware, routes',
    descEn: 'REST API, middleware, routes',
    fenceLang: 'javascript',
    topics: [
      topic('Express app', 'Express app', `import express from "express";
const app = express();
app.use(express.json());`),
      topic('Route', 'Route', `app.get("/api/lessons/:id", (req, res) => {
  res.json({ id: req.params.id });
});`),
      topic('Listen', 'Listen', `app.listen(3000, () => console.log("API ready"));`),
    ],
  },
  {
    id: 'django',
    subcategory: 'framework',
    titleKh: 'Django',
    titleEn: 'Django',
    descKh: 'Models, views, URLs',
    descEn: 'Models, views, URLs',
    fenceLang: 'python',
    topics: [
      topic('Model', 'Model', `from django.db import models

class Lesson(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()`),
      topic('View', 'View', `def lesson_detail(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk)
    return render(request, "lesson.html", {"lesson": lesson})`),
      topic('URL', 'URL', `path("lessons/<int:pk>/", lesson_detail, name="lesson-detail"),`),
    ],
  },
  {
    id: 'flask',
    subcategory: 'framework',
    titleKh: 'Flask',
    titleEn: 'Flask',
    descKh: 'Routes, JSON API, blueprints',
    descEn: 'Routes, JSON API, blueprints',
    fenceLang: 'python',
    topics: [
      topic('App & route', 'App & route', `from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/api/lessons")
def list_lessons():
    return jsonify([{"title": "Flask"}])`),
      topic('POST', 'POST', `@app.post("/api/lessons")
def create_lesson():
    return jsonify({"ok": True}), 201`),
      topic('Blueprint', 'Blueprint', `bp = Blueprint("lessons", __name__, url_prefix="/lessons")`),
    ],
  },
  {
    id: 'spring',
    subcategory: 'framework',
    titleKh: 'Spring Boot',
    titleEn: 'Spring Boot',
    descKh: 'REST controller, JPA entity',
    descEn: 'REST controller, JPA entity',
    fenceLang: 'java',
    topics: [
      topic('Controller', 'Controller', `@RestController
@RequestMapping("/api/lessons")
public class LessonController {
  @GetMapping("/{id}")
  public Lesson get(@PathVariable String id) { ... }
}`),
      topic('Entity', 'Entity', `@Entity
public class Lesson {
  @Id private String id;
  private String title;
}`),
      topic('Service', 'Service', `@Service
public class LessonService {
  public List<Lesson> findAll() { ... }
}`),
    ],
  },
  {
    id: 'laravel',
    subcategory: 'framework',
    titleKh: 'Laravel',
    titleEn: 'Laravel',
    descKh: 'Routes, Eloquent, controllers',
    descEn: 'Routes, Eloquent, controllers',
    fenceLang: 'php',
    topics: [
      topic('Route', 'Route', `Route::get('/lessons/{id}', [LessonController::class, 'show']);`),
      topic('Eloquent', 'Eloquent', `class Lesson extends Model {
  protected $fillable = ['title', 'content'];
}`),
      topic('Controller', 'Controller', `public function show(string $id) {
  return Lesson::findOrFail($id);
}`),
    ],
  },
  {
    id: 'dotnet',
    subcategory: 'framework',
    titleKh: '.NET / ASP.NET',
    titleEn: '.NET / ASP.NET',
    descKh: 'Minimal API, controllers',
    descEn: 'Minimal API, controllers',
    fenceLang: 'csharp',
    topics: [
      topic('Minimal API', 'Minimal API', `var app = WebApplication.CreateBuilder(args).Build();
app.MapGet("/api/lessons", () => Results.Ok(new[] { "Lesson A" }));
app.Run();`),
      topic('Controller', 'Controller', `[ApiController]
[Route("api/[controller]")]
public class LessonsController : ControllerBase {
  [HttpGet("{id}")] public IActionResult Get(string id) => Ok(id);
}`),
      topic('DTO', 'DTO', `public record LessonDto(string Id, string Title);`),
    ],
  },
  {
    id: 'mongodb',
    subcategory: 'library',
    titleKh: 'MongoDB',
    titleEn: 'MongoDB',
    descKh: 'CRUD, aggregation, indexes',
    descEn: 'CRUD, aggregation, indexes',
    fenceLang: 'javascript',
    topics: [
      topic('Insert & Find', 'Insert & find', `db.lessons.insertOne({ title: "Mongo", lang: "kh" });
db.lessons.find({ lang: "kh" });`),
      topic('Update', 'Update', `db.lessons.updateOne(
  { _id: id },
  { $set: { title: "Updated" } }
);`),
      topic('Aggregation', 'Aggregation', `db.lessons.aggregate([
  { $group: { _id: "$lang", count: { $sum: 1 } } }
]);`),
    ],
  },
  {
    id: 'docker',
    subcategory: 'library',
    titleKh: 'Docker',
    titleEn: 'Docker',
    descKh: 'Dockerfile, compose, volumes',
    descEn: 'Dockerfile, compose, volumes',
    fenceLang: 'dockerfile',
    topics: [
      topic('Dockerfile', 'Dockerfile', `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "start"]`),
      topic('Compose', 'Compose', `services:
  app:
    build: .
    ports:
      - "3000:3000"`),
      topic('Commands', 'Commands', `docker build -t khmer-doc .
docker compose up -d`),
    ],
  },
  {
    id: 'git',
    subcategory: 'library',
    titleKh: 'Git',
    titleEn: 'Git',
    descKh: 'Branch, commit, merge, stash',
    descEn: 'Branch, commit, merge, stash',
    fenceLang: 'bash',
    topics: [
      topic('Basics', 'Basics', `git status
git add .
git commit -m "Add lesson template"`),
      topic('Branch', 'Branch', `git checkout -b feature/templates
git merge main`),
      topic('Remote', 'Remote', `git push -u origin feature/templates
git pull --rebase`),
    ],
  },
];

export function getCodeTemplateDef(id: CodeTemplateId): CodeTemplateDef | undefined {
  return CODE_TEMPLATE_DEFS.find((def) => def.id === id);
}
