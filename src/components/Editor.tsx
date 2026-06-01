import { useState, useEffect, useMemo, useRef } from 'react';
import { isHtmlContent, markdownToEditorHtml } from '../lib/lessonContent';
import { 
  Save, 
  X, 
  Eye, 
  Edit2, 
  Bold, 
  Italic, 
  List, 
  Code, 
  Quote, 
  Heading1, 
  Heading2, 
  FileCode,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Undo2,
  Redo2,
  Printer,
  Search,
  Type,
  Underline,
  Strikethrough,
  Baseline,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Circle,
  Square,
  ArrowRight,
  Diamond,
  Star,
  ListOrdered,
  ListTodo,
  Outdent,
  Indent,
  Link,
  MessageSquarePlus,
  History,
  Languages,
  Video,
  Lock,
  Minus,
  Plus,
  Eraser,
  SpellCheck,
  Check,
  Keyboard,
  Table,
  Braces,
  Info,
  Copy,
  FileText,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { DocViewer } from './DocViewer';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { Language } from '../i18n';

interface EditorProps {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string, isAuto?: boolean) => void;
  onExitEditMode?: () => void;
  t: any;
  lang: Language;
  fontSize: number;
  onShowShare?: () => void;
  onShowHistory?: () => void;
  navigateToText?: string;
  navigateToSeq?: number;
}

export function Editor({ 
  initialTitle, 
  initialContent, 
  onSave, 
  onExitEditMode,
  t, 
  lang,
  fontSize, 
  onShowShare,
  onShowHistory,
  navigateToText,
  navigateToSeq = 0
}: EditorProps) {
  const isKh = lang === 'kh';
  const labelMap: Record<string, string> = isKh
    ? {
        File: 'ឯកសារ',
        Edit: 'កែសម្រួល',
        View: 'មើល',
        Insert: 'បញ្ចូល',
        Format: 'ទម្រង់',
        Tools: 'ឧបករណ៍',
        Extensions: 'ផ្នែកបន្ថែម',
        Help: 'ជំនួយ',
        New: 'ថ្មី',
        Open: 'បើក',
        'Make a copy': 'បង្កើតច្បាប់ចម្លង',
        Share: 'ចែករំលែក',
        Email: 'អ៊ីមែល',
        Download: 'ទាញយក',
        Rename: 'ប្តូរឈ្មោះ',
        Move: 'ផ្លាស់ទី',
        'Version history': 'ប្រវត្តិកំណែ',
        'Page setup': 'កំណត់ទំព័រ',
        Print: 'បោះពុម្ព',
        Undo: 'មិនធ្វើវិញ',
        Redo: 'ធ្វើវិញ',
        Cut: 'កាត់',
        Copy: 'ចម្លង',
        Paste: 'បិទភ្ជាប់',
        'Paste without formatting': 'បិទភ្ជាប់គ្មានទម្រង់',
        'Select all': 'ជ្រើសទាំងអស់',
        'Find and replace': 'ស្វែងរក និងជំនួស',
        Mode: 'របៀប',
        Comments: 'មតិយោបល់',
        'Show print layout': 'បង្ហាញប្លង់បោះពុម្ព',
        'Show ruler': 'បង្ហាញបន្ទាត់រង្វាស់',
        'Show non-printing characters': 'បង្ហាញតួអក្សរមិនបោះពុម្ព',
        'Full screen': 'ពេញអេក្រង់',
        Image: 'រូបភាព',
        Table: 'តារាង',
        'Building blocks': 'គំរូប្លុក',
        'Smart chips': 'Smart chips',
        Link: 'តំណ',
        Drawing: 'គំនូរ',
        Chart: 'គំនូសតាង',
        Symbols: 'និមិត្តសញ្ញា',
        'Horizontal line': 'បន្ទាត់ផ្ដេក',
        Comment: 'មតិយោបល់',
        Text: 'អត្ថបទ',
        'Paragraph styles': 'រចនាប័ទ្មកថាខណ្ឌ',
        'Align & indent': 'តម្រឹម និងចូលបន្ទាត់',
        'Line & paragraph spacing': 'ចន្លោះបន្ទាត់ និងកថាខណ្ឌ',
        Columns: 'ជួរឈរ',
        'Bullets & numbering': 'ចំណុច និងលេខរៀង',
        'Headers & footers': 'ក្បាល និងជើងទំព័រ',
        'Page numbers': 'លេខទំព័រ',
        'Clear formatting': 'សម្អាតទម្រង់',
        'Spelling and grammar': 'ពិនិត្យអក្ខរាវិរុទ្ធ និងវេយ្យាករណ៍',
        'Word count': 'រាប់ពាក្យ',
        'Review suggested edits': 'ពិនិត្យការកែដែលបានស្នើ',
        'Compare documents': 'ប្រៀបធៀបឯកសារ',
        Citations: 'ឯកសារយោង',
        Dictionary: 'វចនានុក្រម',
        'Translate document': 'បកប្រែឯកសារ',
        'Voice typing': 'វាយដោយសំឡេង',
        'Add-ons': 'កម្មវិធីបន្ថែម',
        'Apps Script': 'Apps Script',
        'Manage add-ons': 'គ្រប់គ្រងកម្មវិធីបន្ថែម',
        Training: 'ការបណ្តុះបណ្តាល',
        'Keyboard shortcuts': 'ផ្លូវកាត់ក្តារចុច',
        Fit: 'សមទំហំ',
        'Normal text': 'អត្ថបទធម្មតា',
        Title: 'ចំណងជើង',
        Subtitle: 'ចំណងជើងរង',
        'Heading 1': 'ចំណងជើង 1',
        'Heading 2': 'ចំណងជើង 2',
        'Heading 3': 'ចំណងជើង 3',
        'Heading 4': 'ចំណងជើង 4',
        Options: 'ជម្រើស',
        'More fonts': 'អក្សរច្រើនទៀត',
        Recent: 'ថ្មីៗ',
        'Bulleted list': 'បញ្ជីចំណុច',
        'Circle bullets': 'ចំណុចរង្វង់',
        'Square bullets': 'ចំណុចការ៉េ',
        'Arrow bullets': 'ចំណុចព្រួញ',
        'Diamond bullets': 'ចំណុចពេជ្រ',
        'Star bullets': 'ចំណុចផ្កាយ',
        'Numbered list': 'បញ្ជីលេខរៀង',
        'Checklist menu': 'បញ្ជីត្រួតពិនិត្យ',
        'API endpoint doc': 'គំរូ API endpoint',
        'Markdown table': 'តារាង Markdown',
        'Code block (TypeScript)': 'កូដប្លុក (TypeScript)',
        'Callout note': 'ប្រអប់កំណត់ចំណាំ',
        'Mermaid diagram': 'គំនូស Mermaid',
        'Checklist section': 'ផ្នែក Checklist',
        'Lesson objective': 'គោលបំណងមេរៀន',
        'Learning activity': 'សកម្មភាពសិក្សា',
        Assessment: 'ការវាយតម្លៃ',
        'Full lesson plan': 'ផែនការមេរៀនពេញ',
        'Copy as Markdown': 'ចម្លងជា Markdown',
        'Copy as Plain text': 'ចម្លងជាអត្ថបទធម្មតា',
        'Copy as HTML': 'ចម្លងជា HTML',
        '2 x 2 table': 'តារាង 2 x 2',
        '3 x 3 table': 'តារាង 3 x 3',
        '4 x 4 table': 'តារាង 4 x 4',
        '5 x 5 table': 'តារាង 5 x 5',
        '2 columns x 6 rows': '2 ជួរឈរ x 6 ជួរដេក',
        '3 columns x 8 rows': '3 ជួរឈរ x 8 ជួរដេក',
        '6 columns x 6 rows': '6 ជួរឈរ x 6 ជួរដេក',
        'Quick lesson plan table': 'តារាងផែនការមេរៀនរហ័ស',
      }
    : {};
  const ui = {
    history: isKh ? 'ប្រវត្តិ' : 'History',
    search: isKh ? 'ស្វែងរក' : 'Search',
    findPlaceholder: isKh ? 'ស្វែងរក...' : 'Find...',
    undo: isKh ? 'មិនធ្វើវិញ' : 'Undo',
    redo: isKh ? 'ធ្វើវិញ' : 'Redo',
    print: isKh ? 'បោះពុម្ព' : 'Print',
    spellCheck: isKh ? 'ពិនិត្យអក្ខរាវិរុទ្ធ' : 'Spell check',
    paintFormat: isKh ? 'លាបទម្រង់' : 'Paint format',
    insertToc: isKh ? 'បញ្ចូលតារាងមាតិកា' : 'Insert Table of Contents',
    copy: isKh ? 'ចម្លង' : 'Copy',
    quickInsert: isKh ? 'បញ្ចូលរហ័ស' : 'Quick insert',
    zoomOut: isKh ? 'បង្រួមក្រដាស' : 'Zoom out paper',
    zoomIn: isKh ? 'ពង្រីកក្រដាស' : 'Zoom in paper',
    styleShort: isKh ? 'រចនា' : 'Style',
    bold: isKh ? 'ដិត' : 'Bold',
    italic: isKh ? 'ទ្រេត' : 'Italic',
    underline: isKh ? 'គូសបន្ទាត់ក្រោម' : 'Underline',
    strikethrough: isKh ? 'គូសកាត់' : 'Strikethrough',
    textColor: isKh ? 'ពណ៌អក្សរ' : 'Text color',
    highlightColor: isKh ? 'ពណ៌បន្លិច' : 'Highlight color',
    insertLink: isKh ? 'បញ្ចូលតំណ' : 'Insert link',
    addComment: isKh ? 'បន្ថែមមតិយោបល់' : 'Add comment',
    insertImage: isKh ? 'បញ្ចូលរូបភាព' : 'Insert image',
    insertTable: isKh ? 'បញ្ចូលតារាង Markdown' : 'Insert markdown table',
    table: isKh ? 'តារាង' : 'Table',
    insertCode: isKh ? 'បញ្ចូលកូដប្លុក' : 'Insert code block',
    copyMarkdown: isKh ? 'ចម្លង Markdown' : 'Copy markdown',
    alignment: isKh ? 'តម្រឹម' : 'Alignment',
    alignLeft: isKh ? 'តម្រឹមឆ្វេង' : 'Align left',
    alignCenter: isKh ? 'តម្រឹមកណ្ដាល' : 'Align center',
    alignRight: isKh ? 'តម្រឹមស្ដាំ' : 'Align right',
    justify: isKh ? 'តម្រឹមពេញជួរ' : 'Justify',
    checklist: isKh ? 'Checklist' : 'Checklist',
    bulletedList: isKh ? 'បញ្ជីចំណុច' : 'Bulleted list',
    numberedList: isKh ? 'បញ្ជីលេខរៀង' : 'Numbered list',
    decreaseIndent: isKh ? 'បន្ថយចូលបន្ទាត់' : 'Decrease indent',
    increaseIndent: isKh ? 'បន្ថែមចូលបន្ទាត់' : 'Increase indent',
    clearFormatting: isKh ? 'សម្អាតទម្រង់' : 'Clear formatting',
    shortcuts: isKh ? 'ផ្លូវកាត់' : 'Shortcuts',
    keyboardShortcuts: isKh ? 'ផ្លូវកាត់ក្តារចុច' : 'Keyboard shortcuts',
    docStats: isKh ? 'ស្ថិតិឯកសារ' : 'Doc stats',
    words: isKh ? 'ពាក្យ' : 'words',
    chars: isKh ? 'តួអក្សរ' : 'chars',
    pages: isKh ? 'ទំព័រ' : 'pages',
    minRead: isKh ? 'នាទីអាន' : 'min read',
    pageSetup: isKh ? 'កំណត់ទំព័រ' : 'Page setup',
    paperSize: isKh ? 'ទំហំក្រដាស' : 'Paper size',
    pageWidth: isKh ? 'ទទឹងទំព័រ (px)' : 'Page width (px)',
    pagePadding: isKh ? 'គម្លាតក្នុងទំព័រ (px)' : 'Page padding (px)',
    done: isKh ? 'រួចរាល់' : 'Done',
    wordCount: isKh ? 'រាប់ពាក្យ' : 'Word count',
    wordsTitle: isKh ? 'ពាក្យ' : 'Words',
    charsTitle: isKh ? 'តួអក្សរ' : 'Characters',
    pagesTitle: isKh ? 'ទំព័រ' : 'Pages',
    readingTime: isKh ? 'ពេលអាន' : 'Reading time',
    min: isKh ? 'នាទី' : 'min',
    saveAction: isKh ? 'រក្សាទុក' : 'Save',
    toggleShortcuts: isKh ? 'បិទ/បើកផ្លូវកាត់' : 'Toggle shortcuts',
    result: isKh ? 'លទ្ធផល' : 'Result',
    imagePlaceholder: isKh
      ? 'ឧ. ការិយាល័យបច្ចេកវិទ្យាអនាគត ជាមួយរុក្ខជាតិ និង hologram, digital art style...'
      : 'e.g. A futuristic workspace with holograms and plants, digital art style...',
    noHeadings: isKh ? 'មិនមាន Heading ទេ។ សូមបន្ថែម #, ##, ### ជាមុន។' : 'No headings found. Add headings first (e.g. #, ##, ###).',
    commentPrompt: isKh ? 'មតិយោបល់' : 'Comment',
    commentPrefix: isKh ? 'មតិយោបល់' : 'Comment',
    lineSpacingPrompt: isKh ? 'ចន្លោះបន្ទាត់ (1, 1.15, 1.5, 2)' : 'Line spacing (1, 1.15, 1.5, 2)',
    untitledLesson: isKh ? 'មេរៀនគ្មានចំណងជើង' : 'Untitled Lesson',
    copyOf: isKh ? 'ច្បាប់ចម្លង' : 'Copy of',
    lesson: isKh ? 'មេរៀន' : 'Lesson',
    renameDocPrompt: isKh ? 'ប្តូរឈ្មោះឯកសារ' : 'Rename document',
    moveToFolderPrompt: isKh ? 'ផ្លាស់ទីទៅថត' : 'Move to folder',
    myDocuments: isKh ? 'ឯកសាររបស់ខ្ញុំ' : 'My Documents',
    enterUrl: isKh ? 'បញ្ចូល URL' : 'Enter URL',
    findText: isKh ? 'ស្វែងរកអត្ថបទ' : 'Find text',
    replaceWith: isKh ? 'ជំនួសដោយ' : 'Replace with',
    clipboardDenied: isKh ? 'Browser មិនអនុញ្ញាតឲ្យចូល clipboard។' : 'Clipboard access denied by browser.',
    citationText: isKh ? 'អត្ថបទយោង' : 'Citation text',
    citationDefault: isKh ? 'អ្នកនិពន្ធ, ចំណងជើង, ឆ្នាំ' : 'Author, Title, Year',
    imageGenerateFailed: isKh ? 'បង្កើតរូបភាពបរាជ័យ។ សូមព្យាយាមម្ដងទៀត។' : 'Failed to generate image. Please try again.',
  };
  const localize = (label: string) => labelMap[label] || label;
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeTopMenu, setActiveTopMenu] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTextStyle, setActiveTextStyle] = useState('Normal text');
  const [activeAlignment, setActiveAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [activeListType, setActiveListType] = useState('Bulleted list');
  const [selectedFontSize, setSelectedFontSize] = useState(fontSize);
  const [textColor, setTextColor] = useState('#111827');
  const [highlightColor, setHighlightColor] = useState('#fef08a');
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showWordCount, setShowWordCount] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(false);
  const [showPageSetupModal, setShowPageSetupModal] = useState(false);
  const [pageWidth, setPageWidth] = useState(850);
  const [paperSizeKey, setPaperSizeKey] = useState('A4');
  const [pagePadding, setPagePadding] = useState(48);
  const [pageCount, setPageCount] = useState(1);
  const [showPrintLayout, setShowPrintLayout] = useState(true);
  const [showNonPrintingChars, setShowNonPrintingChars] = useState(false);
  const [lineSpacing, setLineSpacing] = useState(1.7);
  const [textColorPalettePos, setTextColorPalettePos] = useState({ top: 0, left: 0 });
  const [highlightPalettePos, setHighlightPalettePos] = useState({ top: 0, left: 0 });
  const [alignMenuPos, setAlignMenuPos] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const topMenuRef = useRef<HTMLDivElement>(null);
  const openFileInputRef = useRef<HTMLInputElement>(null);
  const textColorButtonRef = useRef<HTMLButtonElement>(null);
  const highlightButtonRef = useRef<HTMLButtonElement>(null);
  const alignButtonRef = useRef<HTMLButtonElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const historyRef = useRef<string[]>([initialContent]);
  const historyIndexRef = useRef(0);
  const isHistoryNavigationRef = useRef(false);
  const navigationHighlightTimerRef = useRef<number | null>(null);
  const PAGE_HEIGHT_PX = 1120;
  const PAGE_TOP_OFFSET_PX = 14;
  const PAGE_BOTTOM_OFFSET_PX = 14;
  const PAGE_GAP_PX = 10;
  const PAGE_STRIDE_PX = PAGE_HEIGHT_PX + PAGE_GAP_PX;
  const CODE_BLOCK_WRAP_STYLE = 'margin:12px 0;border-radius:14px;border:1px solid #d5dbe5;overflow:hidden;background:#e9edf3;';
  const CODE_BLOCK_LABEL_STYLE = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #d5dbe5;background:#e9edf3;color:#374151;font-family:"Inter",sans-serif;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;';
  const CODE_BLOCK_PRE_STYLE = 'margin:0;padding:14px 16px;border:0;border-radius:0;background:#dfe5ee;color:#1e293b;font-family:"JetBrains Mono","Fira Code",Consolas,"Courier New",monospace;font-size:13px;line-height:1.65;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;';
  const CODE_BLOCK_CODE_STYLE = 'font-family:inherit;font-size:inherit;color:inherit;background:transparent;white-space:inherit;';
  const normalizeEditorContent = (value: string) => {
    const raw = (value || '').trim();
    if (!raw) return '';
    if (isHtmlContent(raw)) return value;
    return markdownToEditorHtml(raw);
  };
  const decorateCodeBlocks = (editor: HTMLDivElement) => {
    editor.querySelectorAll('pre').forEach((pre) => {
      pre.setAttribute('style', CODE_BLOCK_PRE_STYLE);
      const code = pre.querySelector('code');
      if (code) code.setAttribute('style', CODE_BLOCK_CODE_STYLE);
    });
    editor.querySelectorAll('[data-code-block-wrap="true"]').forEach((wrap) => {
      wrap.setAttribute('style', CODE_BLOCK_WRAP_STYLE);
      const label = wrap.firstElementChild as HTMLElement | null;
      if (label) {
        label.setAttribute('style', CODE_BLOCK_LABEL_STYLE);
        label.setAttribute('contenteditable', 'false');
      }
    });
  };
  const codeLanguageOptions = [
    { key: 'ts', label: 'TypeScript', starter: 'export function example(): void {\n  // TODO: implement\n}' },
    { key: 'js', label: 'JavaScript', starter: 'function example() {\n  // TODO: implement\n}' },
    { key: 'sql', label: 'SQL', starter: 'SELECT Name\nFROM Employees\nWHERE IsActive = 1;' },
    { key: 'json', label: 'JSON', starter: '{\n  "name": "example",\n  "enabled": true\n}' },
    { key: 'html', label: 'HTML', starter: '<section>\n  <h2>Title</h2>\n  <p>Content</p>\n</section>' },
    { key: 'css', label: 'CSS', starter: '.card {\n  border-radius: 12px;\n  padding: 12px;\n}' },
    { key: 'bash', label: 'Bash', starter: 'npm install\nnpm run dev' },
  ];
  const paperSizeOptions = [
    { key: 'A5', label: 'A5', width: 559 },
    { key: 'A4', label: 'A4', width: 794 },
    { key: 'A3', label: 'A3', width: 1123 },
    { key: 'A2', label: 'A2', width: 1587 },
    { key: 'A1', label: 'A1', width: 2245 },
    { key: 'A0', label: 'A0', width: 3178 },
    { key: 'B4', label: 'B4', width: 944 },
    { key: 'B5', label: 'B5', width: 665 },
    { key: 'Letter', label: 'Letter (8.5 x 11 in)', width: 816 },
    { key: 'Legal', label: 'Legal (8.5 x 14 in)', width: 816 },
    { key: 'Tabloid', label: 'Tabloid (11 x 17 in)', width: 1056 },
    { key: 'Ledger', label: 'Ledger (17 x 11 in)', width: 1632 },
    { key: 'Executive', label: 'Executive (7.25 x 10.5 in)', width: 696 },
    { key: 'Statement', label: 'Statement (5.5 x 8.5 in)', width: 528 },
    { key: 'Folio', label: 'Folio (8.5 x 13 in)', width: 816 },
    { key: 'Custom', label: isKh ? 'កំណត់ដោយខ្លួនឯង' : 'Custom', width: pageWidth },
  ];

  const colorPalette = [
    '#202124', '#5f6368', '#80868b', '#9aa0a6', '#bdc1c6', '#dadce0', '#e8eaed', '#f1f3f4', '#ffffff',
    '#a50e0e', '#c5221f', '#ea8600', '#f9ab00', '#fbbc04', '#34a853', '#1a73e8', '#185abc', '#9334e6',
    '#b31412', '#d93025', '#f29900', '#fbbc04', '#fdd663', '#81c995', '#8ab4f8', '#aecbfa', '#d7aefb',
    '#fce8e6', '#f4c7c3', '#fde293', '#fff1c6', '#fef7e0', '#e6f4ea', '#d2e3fc', '#e8f0fe', '#f3e8fd',
    '#fad2cf', '#f6aea9', '#fdd663', '#ffe69c', '#fff3c4', '#c4e7cb', '#aecbfa', '#cfe2ff', '#e6d8f6',
  ];

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setHistory([initialContent]);
    setHistoryIndex(0);
    historyRef.current = [initialContent];
    historyIndexRef.current = 0;
  }, [initialTitle, initialContent]);

  useEffect(() => {
    setSelectedFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const targetElement = event.target as HTMLElement | null;
      const clickedInsidePortalMenu = !!targetElement?.closest('[data-editor-portal="dropdown"]');
      const outsideToolbar = !toolbarRef.current?.contains(target);
      const outsideTopMenu = !topMenuRef.current?.contains(target);
      if (outsideToolbar && !clickedInsidePortalMenu) {
        setActiveDropdown(null);
      }
      if (outsideTopMenu) setActiveTopMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    const normalized = normalizeEditorContent(initialContent || '');
    if (editorRef.current.innerHTML !== normalized) {
      editorRef.current.innerHTML = normalized;
      decorateCodeBlocks(editorRef.current);
    }
  }, [initialContent]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const measurePages = () => {
      const clone = editor.cloneNode(true) as HTMLDivElement;
      clone.style.position = 'absolute';
      clone.style.left = '-99999px';
      clone.style.top = '0';
      clone.style.visibility = 'hidden';
      clone.style.pointerEvents = 'none';
      clone.style.height = 'auto';
      clone.style.minHeight = '0';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.transform = 'none';
      clone.style.background = 'transparent';
      clone.style.backgroundImage = 'none';
      clone.style.width = `${editor.clientWidth}px`;

      document.body.appendChild(clone);
      const contentHeight = Math.max(clone.scrollHeight, PAGE_HEIGHT_PX);
      clone.remove();

      const nextCount = Math.max(1, Math.ceil(contentHeight / PAGE_HEIGHT_PX));
      setPageCount((prev) => (prev === nextCount ? prev : nextCount));
    };

    measurePages();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measurePages);
      resizeObserver.observe(editor);
    }
    window.addEventListener('resize', measurePages);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', measurePages);
    };
  }, [content, fontSize, pagePadding, lineSpacing, PAGE_HEIGHT_PX]);

  useEffect(() => {
    const paletteWidth = 230;
    const viewportPadding = 8;
    const updatePosition = () => {
      if (activeDropdown === 'textColor' && textColorButtonRef.current) {
        const rect = textColorButtonRef.current.getBoundingClientRect();
        const left = Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - paletteWidth - viewportPadding);
        setTextColorPalettePos({ top: rect.bottom + 4, left });
      }
      if (activeDropdown === 'highlightColor' && highlightButtonRef.current) {
        const rect = highlightButtonRef.current.getBoundingClientRect();
        const left = Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - paletteWidth - viewportPadding);
        setHighlightPalettePos({ top: rect.bottom + 4, left });
      }
    };

    if (activeDropdown !== 'textColor' && activeDropdown !== 'highlightColor') return;

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [activeDropdown]);

  useEffect(() => {
    if (activeDropdown !== 'align' || !alignButtonRef.current) return;
    const menuWidth = 170;
    const viewportPadding = 8;
    const updatePosition = () => {
      const rect = alignButtonRef.current!.getBoundingClientRect();
      const left = Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - menuWidth - viewportPadding);
      setAlignMenuPos({ top: rect.bottom + 4, left });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [activeDropdown]);

  const refreshFormatState = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) {
      setFormatState({ bold: false, italic: false, underline: false, strikeThrough: false });
      return;
    }

    const anchorNode = selection.anchorNode;
    if (!anchorNode || !editor.contains(anchorNode)) {
      setFormatState({ bold: false, italic: false, underline: false, strikeThrough: false });
      return;
    }

    const el =
      anchorNode.nodeType === Node.ELEMENT_NODE
        ? (anchorNode as HTMLElement)
        : (anchorNode.parentElement as HTMLElement | null);
    if (!el) return;

    const style = window.getComputedStyle(el);
    const weight = Number.parseInt(style.fontWeight || '400', 10);
    const deco = style.textDecorationLine || '';

    setFormatState({
      bold: !!el.closest('b,strong') || weight >= 600,
      italic: !!el.closest('i,em') || style.fontStyle === 'italic',
      underline: !!el.closest('u') || deco.includes('underline'),
      strikeThrough: !!el.closest('s,strike,del') || deco.includes('line-through'),
    });
  };

  const saveCurrentSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!editor || !selection || !range) return false;
    if (!editor.contains(range.commonAncestorContainer)) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const applyInlineStyleToSelection = (styles: Record<string, string>) => {
    const editor = editorRef.current;
    if (!editor) return false;
    restoreSelection();
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return false;

    const span = document.createElement('span');
    Object.entries(styles).forEach(([prop, value]) => {
      span.style.setProperty(prop, value);
    });
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);
    savedRangeRef.current = newRange.cloneRange();
    updateContent(editor.innerHTML);
    refreshFormatState();
    return true;
  };

  const cleanupTypingStyleMarkers = (editor: HTMLDivElement) => {
    editor.querySelectorAll('span[data-typing-style="1"]').forEach((node) => {
      const el = node as HTMLSpanElement;
      const text = el.textContent ?? '';
      const cleanedText = text.replace(/\u200B/g, '');
      if (cleanedText !== text) {
        if (cleanedText.length === 0) {
          el.remove();
          return;
        }
        el.textContent = cleanedText;
      }
      if (cleanedText === '') {
        el.remove();
      }
    });
  };

  const applyTypingStyleAtCaret = (styles: Record<string, string>) => {
    const editor = editorRef.current;
    if (!editor) return false;
    restoreSelection();
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return false;

    cleanupTypingStyleMarkers(editor);

    const span = document.createElement('span');
    span.setAttribute('data-typing-style', '1');
    Object.entries(styles).forEach(([prop, value]) => {
      span.style.setProperty(prop, value);
    });
    const marker = document.createTextNode('\u200B');
    span.appendChild(marker);
    range.insertNode(span);

    const nextRange = document.createRange();
    nextRange.setStart(marker, 1);
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    savedRangeRef.current = nextRange.cloneRange();
    return true;
  };

  const runCommand = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection();
    editor.focus();
    document.execCommand(command, false, value);
    updateContent(editor.innerHTML);
    refreshFormatState();
    saveCurrentSelection();
  };

  useEffect(() => {
    const onSelectionChange = () => refreshFormatState();
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  // Handle auto-save
  useEffect(() => {
    if (content === initialContent && title === initialTitle) return;
    
    const timer = setTimeout(() => {
      onSave(title, content, true);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [title, content, initialContent, initialTitle, onSave]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            onSave(title, content, false);
            onExitEditMode?.();
            break;
          case 'b':
            e.preventDefault();
            runCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            runCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            runCommand('underline');
            break;
          case '/':
            e.preventDefault();
            setShowShortcuts((prev) => !prev);
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, onSave]);

  const updateContent = (newContent: string) => {
    if (isHistoryNavigationRef.current) {
      setContent(newContent);
      return;
    }
    if (newContent === content) return;

    setContent(newContent);
    const baseHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    if (baseHistory[baseHistory.length - 1] === newContent) return;
    baseHistory.push(newContent);
    if (baseHistory.length > 50) baseHistory.shift();

    const nextIndex = baseHistory.length - 1;
    historyRef.current = baseHistory;
    historyIndexRef.current = nextIndex;
    setHistory(baseHistory);
    setHistoryIndex(nextIndex);
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      const newIndex = historyIndexRef.current - 1;
      const nextContent = historyRef.current[newIndex];
      if (typeof nextContent !== 'string') return;

      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      setContent(nextContent);
      if (editorRef.current) {
        isHistoryNavigationRef.current = true;
        editorRef.current.innerHTML = nextContent;
        decorateCodeBlocks(editorRef.current);
        queueMicrotask(() => {
          isHistoryNavigationRef.current = false;
        });
        refreshFormatState();
      }
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const newIndex = historyIndexRef.current + 1;
      const nextContent = historyRef.current[newIndex];
      if (typeof nextContent !== 'string') return;

      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      setContent(nextContent);
      if (editorRef.current) {
        isHistoryNavigationRef.current = true;
        editorRef.current.innerHTML = nextContent;
        decorateCodeBlocks(editorRef.current);
        queueMicrotask(() => {
          isHistoryNavigationRef.current = false;
        });
        refreshFormatState();
      }
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      document.execCommand('insertText', false, `${prefix}${suffix}`);
      updateContent(editor.innerHTML);
      return;
    }

    const selectedText = selection.toString();
    const wrapped = `${prefix}${selectedText}${suffix}`;
    document.execCommand('insertText', false, wrapped);
    updateContent(editor.innerHTML);
  };

  const applyToSelectedLines = (lineTransformer: (line: string) => string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const currentText = editor.innerText;
    const transformed = currentText
      .split('\n')
      .map(lineTransformer)
      .join('\n');
    document.execCommand('selectAll');
    document.execCommand('insertText', false, transformed);
    updateContent(editor.innerHTML);
  };

  const setTextStyle = (style: string) => {
    setActiveTextStyle(style);
    if (style === 'Normal text') {
      applyInlineStyleToSelection({
        'font-size': `${fontSize + 5}px`,
        'font-weight': '400',
        'font-style': 'normal',
        'text-decoration': 'none',
      });
      return;
    }
    if (style === 'Title') return void applyInlineStyleToSelection({ 'font-size': '34px', 'font-weight': '700' });
    if (style === 'Subtitle') return void applyInlineStyleToSelection({ 'font-size': '26px', 'font-weight': '500', color: '#5f6368' });
    if (style === 'Heading 1') return void applyInlineStyleToSelection({ 'font-size': '30px', 'font-weight': '700' });
    if (style === 'Heading 2') return void applyInlineStyleToSelection({ 'font-size': '24px', 'font-weight': '700' });
    if (style === 'Heading 3') return void applyInlineStyleToSelection({ 'font-size': '20px', 'font-weight': '600' });
    if (style === 'Heading 4') return void applyInlineStyleToSelection({ 'font-size': '18px', 'font-weight': '500', color: '#6b7280' });
    if (style === 'Code block') {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      document.execCommand('formatBlock', false, 'pre');
      updateContent(editor.innerHTML);
      setActiveDropdown(null);
    }
  };

  const setAlignment = (align: string) => {
    setActiveAlignment(align as 'left' | 'center' | 'right' | 'justify');
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection();
    editor.focus();
    if (align === 'left') document.execCommand('justifyLeft');
    if (align === 'center') document.execCommand('justifyCenter');
    if (align === 'right') document.execCommand('justifyRight');
    if (align === 'justify') document.execCommand('justifyFull');
    updateContent(editor.innerHTML);
    setActiveDropdown(null);
    saveCurrentSelection();
  };

  const applyFontFamily = (family: string) => {
    setFontFamily(family);
    const applied = applyInlineStyleToSelection({ 'font-family': family });
    if (applied) return;

    const typingApplied = applyTypingStyleAtCaret({ 'font-family': family });
    if (typingApplied) return;

    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
    applyTypingStyleAtCaret({ 'font-family': family });
  };

  const applySelectedFontSize = (size: number) => {
    setSelectedFontSize(size);
    const applied = applyInlineStyleToSelection({ 'font-size': `${size}px` });
    if (applied) return;

    const typingApplied = applyTypingStyleAtCaret({ 'font-size': `${size}px` });
    if (typingApplied) return;

    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
    applyTypingStyleAtCaret({ 'font-size': `${size}px` });
  };

  const applyTextColor = (color: string) => {
    setTextColor(color);
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection();
    editor.focus();
    document.execCommand('foreColor', false, color);
    updateContent(editor.innerHTML);
    setActiveDropdown(null);
    saveCurrentSelection();
  };

  const applyHighlightColor = (color: string) => {
    setHighlightColor(color);
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection();
    editor.focus();
    document.execCommand('hiliteColor', false, color);
    updateContent(editor.innerHTML);
    setActiveDropdown(null);
    saveCurrentSelection();
  };

  const applyListStyle = (type: string) => {
    setActiveListType(type);
    const listPrefixes: Record<string, string> = {
      'Bulleted list': '- ',
      'Circle bullets': '○ ',
      'Square bullets': '▪ ',
      'Arrow bullets': '➤ ',
      'Diamond bullets': '◆ ',
      'Star bullets': '★ ',
      'Numbered list': '1. ',
      'Checklist menu': '- [ ] ',
    };
    insertMarkdown(listPrefixes[type] || '- ', '');
    setActiveDropdown(null);
  };

  const insertTemplate = (template: string) => {
    const templates: Record<string, string> = {
      'API endpoint doc': [
        '## Endpoint',
        '`GET /api/v1/resource`',
        '',
        '### Description',
        '- Purpose:',
        '- Auth required: yes/no',
        '',
        '### Request',
        '```json',
        '{',
        '  "example": "value"',
        '}',
        '```',
        '',
        '### Response',
        '```json',
        '{',
        '  "status": "ok"',
        '}',
        '```',
      ].join('\n'),
      'Markdown table': [
        '| Feature | Status | Notes |',
        '| --- | --- | --- |',
        '| Example | Done | Add details here |',
      ].join('\n'),
      'Code block (TypeScript)': [
        '```ts',
        'export function example(): void {',
        '  // TODO: implement',
        '}',
        '```',
      ].join('\n'),
      'Callout note': [
        '> [!NOTE]',
        '> Add an important note here.',
      ].join('\n'),
      'Mermaid diagram': [
        '```mermaid',
        'flowchart TD',
        '  A[Start] --> B[Step]',
        '  B --> C[Done]',
        '```',
      ].join('\n'),
      'Checklist section': [
        '## Checklist',
        '- [ ] Task one',
        '- [ ] Task two',
        '- [ ] Task three',
      ].join('\n'),
      'Lesson objective': [
        '## Objective',
        '- Students will be able to ...',
      ].join('\n'),
      'Learning activity': [
        '## Activity',
        '1. Warm-up (5 min)',
        '2. Main task (20 min)',
        '3. Reflection (5 min)',
      ].join('\n'),
      'Assessment': [
        '## Assessment',
        '- Formative checks:',
        '- Exit ticket:',
      ].join('\n'),
      'Full lesson plan': [
        '# Lesson Plan',
        '',
        '## Objective',
        '- Students will be able to ...',
        '',
        '## Materials',
        '- Slides',
        '- Worksheet',
        '',
        '## Activity',
        '1. Warm-up (5 min)',
        '2. Guided practice (15 min)',
        '3. Independent practice (10 min)',
        '',
        '## Assessment',
        '- Observation checklist',
        '- Exit ticket',
      ].join('\n'),
    };
    const value = templates[template];
    if (!value) return;
    insertMarkdown(`\n${value}\n`, '');
    setActiveDropdown(null);
  };

  const insertStyledCodeBlock = (languageKey = 'ts') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    restoreSelection();
    const pickedLanguage = codeLanguageOptions.find((item) => item.key === languageKey) || codeLanguageOptions[0];
    const starterCode = pickedLanguage.starter;
    const escapedCode = starterCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const blockHtml = `<div data-code-block-wrap="true" data-code-language="${pickedLanguage.key}" style="${CODE_BLOCK_WRAP_STYLE}"><div contenteditable="false" style="${CODE_BLOCK_LABEL_STYLE}">${pickedLanguage.label}</div><pre data-code-block="true" style="${CODE_BLOCK_PRE_STYLE}"><code style="${CODE_BLOCK_CODE_STYLE}">${escapedCode}</code></pre></div><p><br></p>`;
    document.execCommand('insertHTML', false, blockHtml);
    decorateCodeBlocks(editor);
    updateContent(editor.innerHTML);
    saveCurrentSelection();
  };

  const insertMarkdownTable = (rows: number, cols: number, includeHeader = true) => {
    const safeRows = Math.max(1, Math.min(12, rows));
    const safeCols = Math.max(1, Math.min(12, cols));
    const editor = editorRef.current;
    if (!editor) return;
    const headerCells = Array.from(
      { length: safeCols },
      (_, i) =>
        `<th style="border:1px solid #94a3b8;padding:10px 12px;background:#e2e8f0;color:#0f172a;font-weight:800;text-align:left;font-size:13px;letter-spacing:0.02em;text-transform:uppercase;">Header ${i + 1}</th>`
    ).join('');
    const bodyRows = Array.from({ length: includeHeader ? safeRows - 1 : safeRows }, (_, r) => {
      const cells = Array.from(
        { length: safeCols },
        (_, c) => `<td style="border:1px solid #cbd5e1;padding:9px 12px;background:#ffffff;color:#1f2937;">R${r + 1}C${c + 1}</td>`
      ).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    const tableHtml = `
      <table style="border-collapse:collapse;width:100%;margin:12px 0;border:1px solid #cbd5e1;">
        ${includeHeader ? `<thead><tr>${headerCells}</tr></thead>` : ''}
        <tbody>${bodyRows}</tbody>
      </table>
      <p><br></p>
    `;
    restoreSelection();
    editor.focus();
    document.execCommand('insertHTML', false, tableHtml);
    updateContent(editor.innerHTML);
    setActiveDropdown(null);
  };

  const docStats = useMemo(() => {
    const plainText = content
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/[#>*_\-\[\]\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = plainText ? plainText.split(' ').length : 0;
    const chars = content.length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingMinutes };
  }, [content]);

  const slugifyHeading = (text: string) =>
    text
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const buildToc = () => {
    const headings = [...content.matchAll(/^(#{1,6})\s+(.+)$/gm)].map((match) => ({
      level: match[1].length,
      text: match[2].trim(),
    }));
    if (!headings.length) {
      alert(ui.noHeadings);
      return;
    }
    const tocBody = headings
      .map(({ level, text }) => `${'  '.repeat(Math.max(0, level - 1))}- [${text}](#${slugifyHeading(text)})`)
      .join('\n');
    const toc = `## ${isKh ? 'តារាងមាតិកា' : 'Table of Contents'}\n${tocBody}\n`;
    insertMarkdown(`\n${toc}\n`, '');
  };

  const markdownToPlain = (value: string) =>
    value
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[*_~>-]/g, '')
      .replace(/\s+\n/g, '\n')
      .trim();

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const markdownToHtml = (value: string) => {
    const escaped = escapeHtml(value);
    const lines = escaped.split('\n');
    const htmlLines = lines.map((line) => {
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        return `<h${level}>${heading[2]}</h${level}>`;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        return `<li>${line.replace(/^\s*[-*]\s+/, '')}</li>`;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        return `<li>${line.replace(/^\s*\d+\.\s+/, '')}</li>`;
      }
      if (!line.trim()) return '';
      return `<p>${line}</p>`;
    });
    return htmlLines.join('\n');
  };

  const copyContentAs = async (format: 'markdown' | 'plain' | 'html') => {
    const value = format === 'markdown' ? content : format === 'plain' ? markdownToPlain(content) : markdownToHtml(content);
    try {
      await navigator.clipboard.writeText(value);
      alert(isKh ? `បានចម្លងជា ${format}។` : `Copied as ${format}.`);
    } catch (error) {
      console.error('Copy failed:', error);
      alert(isKh ? 'ចម្លងបរាជ័យ។ Browser បានទប់ស្កាត់ clipboard។' : 'Copy failed. Browser blocked clipboard access.');
    }
  };

  const handleIndent = (type: 'indent' | 'outdent') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(type === 'indent' ? 'indent' : 'outdent');
    updateContent(editor.innerHTML);
  };

  const clearFormatting = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('removeFormat');
    updateContent(editor.innerHTML);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: imagePrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64EncodeString}`;
          setGeneratedImageUrl(imageUrl);
          break;
        }
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      alert(ui.imageGenerateFailed);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const insertGeneratedImage = () => {
    if (generatedImageUrl) {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      document.execCommand('insertImage', false, generatedImageUrl);
      updateContent(editor.innerHTML);
      setShowImageModal(false);
      setImagePrompt('');
      setGeneratedImageUrl(null);
    }
  };

  const ToolbarButton = ({ icon: Icon, title, onClick, active, className, children, buttonRef }: any) => (
    <button
      ref={buttonRef}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={cn(
        "p-1 rounded hover:bg-slate-200/60 text-slate-600 transition-colors flex items-center justify-center min-w-[24px] h-6 cursor-pointer",
        active && "bg-blue-100/80 text-blue-700",
        className
      )}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );

  const ToolbarDropdown = ({ label, items, id, type = 'text', triggerIcon: TriggerIcon }: any) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeTimerRef = useRef<number | null>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
    const isOpen = activeDropdown === id;

    const clearCloseTimer = () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };

    const openDropdown = () => {
      clearCloseTimer();
      setActiveDropdown(id);
    };

    const closeDropdownSoon = () => {
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
        setActiveDropdown((current) => (current === id ? null : current));
        closeTimerRef.current = null;
      }, 120);
    };

    useEffect(() => {
      if (!isOpen || !triggerRef.current) return;
      const updatePosition = () => {
        const rect = triggerRef.current!.getBoundingClientRect();
        const menuWidth = type === 'font' ? 260 : type === 'styles' ? 240 : type === 'size' ? 76 : 188;
        const viewportPadding = 8;
        const nextLeft = Math.min(
          Math.max(viewportPadding, rect.left),
          window.innerWidth - menuWidth - viewportPadding
        );
        setMenuPos({
          top: rect.bottom + 4,
          left: nextLeft,
          width: menuWidth,
        });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }, [isOpen, type]);

    useEffect(() => () => clearCloseTimer(), []);

    return (
      <div className="inline-block">
        <button
          ref={triggerRef}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={openDropdown}
          onMouseLeave={closeDropdownSoon}
          onClick={() => setActiveDropdown(isOpen ? null : id)}
          className={cn(
            "flex items-center gap-0.5 px-1 text-xs font-medium text-slate-700 hover:bg-slate-200/60 h-6 rounded cursor-pointer transition-colors",
            isOpen && "bg-blue-100/80 text-blue-700",
            type === 'font' ? "min-w-[58px]" : type === 'styles' ? "min-w-[86px]" : type === 'zoom' ? "min-w-[52px]" : type === 'size' ? "min-w-[42px]" : type === 'list' ? "min-w-[30px]" : "min-w-[52px]"
          )}
        >
          {TriggerIcon ? (
            <TriggerIcon size={14} />
          ) : (
            <span className={cn("truncate", type === 'font' ? "max-w-[38px]" : type === 'styles' ? "max-w-[68px]" : "max-w-[34px]")}>{label}</span>
          )}
          <ChevronDown size={12} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdownSoon}
                data-editor-portal="dropdown"
                style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
                className="fixed bg-[#f8f9fa] rounded-lg shadow-xl border border-slate-300 z-[260] overflow-hidden py-1 max-h-[70vh] overflow-y-auto"
              >
                {items.map((item: any, index: number) => {
                  if (item.type === 'divider') {
                    return <div key={`${id}-divider-${index}`} className="my-1 border-t border-slate-300/80" />;
                  }
                  if (item.type === 'header') {
                    return (
                      <div key={`${id}-header-${item.label}-${index}`} className="px-4 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        {localize(item.label)}
                      </div>
                    );
                  }
                  return (
                    <button
                      type="button"
                      key={item.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        item.onClick();
                        if (!item.keepOpen) setActiveDropdown(null);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-1.5 text-sm hover:bg-slate-200/70 transition-colors flex items-center justify-between",
                        item.active ? "text-slate-800 font-semibold bg-slate-200/90" : "text-slate-700"
                      )}
                      style={item.style}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon ? <item.icon size={14} /> : null}
                        {!item.iconOnly && <span>{localize(item.label)}</span>}
                      </div>
                      {item.active && <Check size={14} className="text-slate-700" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    );
  };

  const Divider = () => <div className="w-px h-3 bg-slate-200 mx-0.5 self-center" />;

  const changePaperZoom = (delta: number) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  };

  const zoomItems = [
    { label: 'Fit', onClick: () => setZoom(100), active: zoom === 100 },
    { type: 'divider' },
    { label: '50%', onClick: () => setZoom(50), active: zoom === 50 },
    { label: '75%', onClick: () => setZoom(75), active: zoom === 75 },
    { label: '90%', onClick: () => setZoom(90), active: zoom === 90 },
    { label: '100%', onClick: () => setZoom(100), active: zoom === 100 },
    { label: '125%', onClick: () => setZoom(125), active: zoom === 125 },
    { label: '150%', onClick: () => setZoom(150), active: zoom === 150 },
    { label: '200%', onClick: () => setZoom(200), active: zoom === 200 },
  ];

  const paperSizeItems = paperSizeOptions.map((opt) => ({
    label: opt.label,
    onClick: () => {
      setPaperSizeKey(opt.key);
      if (opt.key !== 'Custom') {
        setPageWidth(opt.width);
      }
    },
    active: paperSizeKey === opt.key,
  }));

  const styleItems = [
    { label: 'Normal text', onClick: () => setTextStyle('Normal text'), active: activeTextStyle === 'Normal text' },
    { type: 'divider' },
    { label: 'Title', onClick: () => setTextStyle('Title'), active: activeTextStyle === 'Title', style: { fontSize: '22px', fontWeight: 700 } },
    { label: 'Subtitle', onClick: () => setTextStyle('Subtitle'), active: activeTextStyle === 'Subtitle', style: { fontSize: '14px', color: '#5f6368' } },
    { type: 'divider' },
    { label: 'Heading 1', onClick: () => setTextStyle('Heading 1'), active: activeTextStyle === 'Heading 1', style: { fontSize: '18px', fontWeight: 700 } },
    { label: 'Heading 2', onClick: () => setTextStyle('Heading 2'), active: activeTextStyle === 'Heading 2', style: { fontSize: '14px', fontWeight: 700 } },
    { label: 'Heading 3', onClick: () => setTextStyle('Heading 3'), active: activeTextStyle === 'Heading 3', style: { fontSize: '12px', fontWeight: 600 } },
    { label: 'Heading 4', onClick: () => setTextStyle('Heading 4'), active: activeTextStyle === 'Heading 4', style: { fontSize: '11px', color: '#6b7280' } },
    { type: 'divider' },
    { label: 'Options', onClick: () => setShowShortcuts(true) },
  ];

  const fontItems = [
    { label: 'More fonts', onClick: () => setShowShortcuts(true), keepOpen: true },
    { type: 'divider' },
    { type: 'header', label: 'Recent' },
    { label: 'Times New Roman', onClick: () => applyFontFamily('Times New Roman'), active: fontFamily === 'Times New Roman', style: { fontFamily: 'Times New Roman' } },
    { label: 'Siemreap', onClick: () => applyFontFamily('Siemreap'), active: fontFamily === 'Siemreap', style: { fontFamily: 'Siemreap' } },
    { label: 'Kantumruy Pro', onClick: () => applyFontFamily('Kantumruy Pro'), active: fontFamily === 'Kantumruy Pro', style: { fontFamily: 'Kantumruy Pro' } },
    { type: 'divider' },
    { label: 'Arial', onClick: () => applyFontFamily('Arial'), active: fontFamily === 'Arial' },
    { label: 'Amatic SC', onClick: () => applyFontFamily('Amatic SC'), active: fontFamily === 'Amatic SC', style: { fontFamily: 'Amatic SC' } },
    { label: 'Caveat', onClick: () => applyFontFamily('Caveat'), active: fontFamily === 'Caveat', style: { fontFamily: 'Caveat' } },
    { label: 'Comfortaa', onClick: () => applyFontFamily('Comfortaa'), active: fontFamily === 'Comfortaa', style: { fontFamily: 'Comfortaa' } },
    { label: 'Comic Sans MS', onClick: () => applyFontFamily('Comic Sans MS'), active: fontFamily === 'Comic Sans MS', style: { fontFamily: 'Comic Sans MS' } },
    { label: 'Courier New', onClick: () => applyFontFamily('Courier New'), active: fontFamily === 'Courier New', style: { fontFamily: 'Courier New' } },
    { label: 'EB Garamond', onClick: () => applyFontFamily('EB Garamond'), active: fontFamily === 'EB Garamond', style: { fontFamily: 'EB Garamond' } },
    { label: 'Georgia', onClick: () => applyFontFamily('Georgia'), active: fontFamily === 'Georgia', style: { fontFamily: 'Georgia' } },
    { label: 'Impact', onClick: () => applyFontFamily('Impact'), active: fontFamily === 'Impact', style: { fontFamily: 'Impact' } },
    { label: 'Kantumruy Pro', onClick: () => applyFontFamily('Kantumruy Pro'), active: fontFamily === 'Kantumruy Pro', style: { fontFamily: 'Kantumruy Pro' } },
    { label: 'Lexend', onClick: () => applyFontFamily('Lexend'), active: fontFamily === 'Lexend', style: { fontFamily: 'Lexend' } },
    { label: 'Lobster', onClick: () => applyFontFamily('Lobster'), active: fontFamily === 'Lobster', style: { fontFamily: 'Lobster' } },
  ];

  const fontSizeItems = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96].map((size) => ({
    label: String(size),
    onClick: () => applySelectedFontSize(size),
    active: selectedFontSize === size,
  }));

  const alignIcon = activeAlignment === 'left'
    ? AlignLeft
    : activeAlignment === 'center'
      ? AlignCenter
      : activeAlignment === 'right'
        ? AlignRight
        : AlignJustify;

  const listItems = [
    { label: 'Bulleted list', icon: List, iconOnly: true, onClick: () => applyListStyle('Bulleted list'), active: activeListType === 'Bulleted list' },
    { label: 'Circle bullets', icon: Circle, iconOnly: true, onClick: () => applyListStyle('Circle bullets'), active: activeListType === 'Circle bullets' },
    { label: 'Square bullets', icon: Square, iconOnly: true, onClick: () => applyListStyle('Square bullets'), active: activeListType === 'Square bullets' },
    { label: 'Arrow bullets', icon: ArrowRight, iconOnly: true, onClick: () => applyListStyle('Arrow bullets'), active: activeListType === 'Arrow bullets' },
    { label: 'Diamond bullets', icon: Diamond, iconOnly: true, onClick: () => applyListStyle('Diamond bullets'), active: activeListType === 'Diamond bullets' },
    { label: 'Star bullets', icon: Star, iconOnly: true, onClick: () => applyListStyle('Star bullets'), active: activeListType === 'Star bullets' },
    { label: 'Numbered list', icon: ListOrdered, iconOnly: true, onClick: () => applyListStyle('Numbered list'), active: activeListType === 'Numbered list' },
    { label: 'Checklist menu', icon: ListTodo, iconOnly: true, onClick: () => applyListStyle('Checklist menu'), active: activeListType === 'Checklist menu' },
  ];

  const templateItems = [
    { label: 'API endpoint doc', onClick: () => insertTemplate('API endpoint doc') },
    { label: 'Markdown table', onClick: () => insertTemplate('Markdown table') },
    { label: 'Code block (TypeScript)', onClick: () => insertTemplate('Code block (TypeScript)') },
    { label: 'Callout note', onClick: () => insertTemplate('Callout note') },
    { label: 'Mermaid diagram', onClick: () => insertTemplate('Mermaid diagram') },
    { label: 'Checklist section', onClick: () => insertTemplate('Checklist section') },
    { label: 'Lesson objective', onClick: () => insertTemplate('Lesson objective') },
    { label: 'Learning activity', onClick: () => insertTemplate('Learning activity') },
    { label: 'Assessment', onClick: () => insertTemplate('Assessment') },
    { label: 'Full lesson plan', onClick: () => insertTemplate('Full lesson plan') },
  ];

  const tableItems = [
    { label: '2 x 2 table', onClick: () => insertMarkdownTable(2, 2) },
    { label: '3 x 3 table', onClick: () => insertMarkdownTable(3, 3) },
    { label: '4 x 4 table', onClick: () => insertMarkdownTable(4, 4) },
    { label: '5 x 5 table', onClick: () => insertMarkdownTable(5, 5) },
    { type: 'divider' },
    { label: '2 columns x 6 rows', onClick: () => insertMarkdownTable(6, 2) },
    { label: '3 columns x 8 rows', onClick: () => insertMarkdownTable(8, 3) },
    { label: '6 columns x 6 rows', onClick: () => insertMarkdownTable(6, 6) },
    { type: 'divider' },
    { label: 'Quick lesson plan table', onClick: () => insertTemplate('Markdown table') },
  ];
  const codeLanguageItems = codeLanguageOptions.map((lang) => ({
    label: lang.label,
    onClick: () => insertStyledCodeBlock(lang.key),
  }));

  const copyItems = [
    { label: 'Copy as Markdown', onClick: () => copyContentAs('markdown') },
    { label: 'Copy as Plain text', onClick: () => copyContentAs('plain') },
    { label: 'Copy as HTML', onClick: () => copyContentAs('html') },
  ];

  const topMenus: Record<string, string[]> = {
    File: ['New', 'Open', 'Make a copy', 'Share', 'Email', 'Download', 'Rename', 'Move', 'Version history', 'Page setup', 'Print'],
    Edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Paste without formatting', 'Select all', 'Find and replace'],
    View: ['Mode', 'Comments', 'Show print layout', 'Show ruler', 'Show non-printing characters', 'Full screen'],
    Insert: ['Image', 'Table', 'Building blocks', 'Smart chips', 'Link', 'Drawing', 'Chart', 'Symbols', 'Horizontal line', 'Comment'],
    Format: ['Text', 'Paragraph styles', 'Align & indent', 'Line & paragraph spacing', 'Columns', 'Bullets & numbering', 'Headers & footers', 'Page numbers', 'Clear formatting'],
    Tools: ['Spelling and grammar', 'Word count', 'Review suggested edits', 'Compare documents', 'Citations', 'Dictionary', 'Translate document', 'Voice typing'],
    Extensions: ['Add-ons', 'Apps Script', 'Manage add-ons'],
    Help: ['Help', 'Training', 'Keyboard shortcuts'],
  };

  const downloadCurrentDoc = () => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${(title || 'lesson').replace(/[^\w\- ]+/g, '').trim() || 'lesson'}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  };

  const handleFindAndReplace = () => {
    const findText = window.prompt(ui.findText);
    if (!findText) return;
    const replaceText = window.prompt(ui.replaceWith, '');
    if (replaceText === null) return;
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaced = content.replace(new RegExp(escaped, 'gi'), replaceText);
    updateContent(replaced);
    if (editorRef.current) editorRef.current.innerHTML = replaced;
  };

  const pasteWithoutFormatting = async () => {
    try {
      const text = await navigator.clipboard.readText();
      runCommand('insertText', text);
    } catch (error) {
      console.error('Paste without formatting failed:', error);
      alert(ui.clipboardDenied);
    }
  };

  const handleClipboardMenuAction = async (action: 'cut' | 'copy' | 'paste') => {
    const editor = editorRef.current;
    if (!editor) return;

    restoreSelection();
    editor.focus();
    const selection = window.getSelection();

    if (action === 'paste') {
      try {
        const text = await navigator.clipboard.readText();
        runCommand('insertText', text);
        return;
      } catch (error) {
        console.error('Paste failed:', error);
        const pasted = document.execCommand('paste');
        if (!pasted) alert(ui.clipboardDenied);
        return;
      }
    }

    const selectedText = selection?.toString() ?? '';
    if (!selectedText) {
      const success = document.execCommand(action);
      if (!success) alert(ui.clipboardDenied);
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedText);
      if (action === 'cut' && selection && !selection.isCollapsed) {
        selection.deleteFromDocument();
        updateContent(editor.innerHTML);
        saveCurrentSelection();
      }
    } catch (error) {
      console.error(`${action} failed:`, error);
      const success = document.execCommand(action);
      if (!success) alert(ui.clipboardDenied);
    }
  };

  const convertPlainTextToHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

  const handleOpenFile = () => {
    openFileInputRef.current?.click();
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  const insertComment = () => {
    const note = window.prompt(ui.commentPrompt);
    if (!note?.trim()) return;
    const timestamp = new Date().toLocaleString();
    runCommand('insertText', ` [${ui.commentPrefix}: ${note.trim()} • ${timestamp}] `);
  };

  const paintCurrentFormat = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    if (formatState.bold) document.execCommand('bold');
    if (formatState.italic) document.execCommand('italic');
    if (formatState.underline) document.execCommand('underline');
    if (formatState.strikeThrough) document.execCommand('strikeThrough');
    document.execCommand('foreColor', false, textColor);
    document.execCommand('hiliteColor', false, highlightColor);
    updateContent(editor.innerHTML);
    refreshFormatState();
  };

  const runSearchInEditor = () => {
    const term = searchTerm.trim();
    if (!term) return;
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const lowerTerm = term.toLowerCase();
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const text = node.nodeValue || '';
      const idx = text.toLowerCase().indexOf(lowerTerm);
      if (idx >= 0) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + term.length);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        return;
      }
    }
  };

  const normalizeForMatch = (value: string) =>
    value
      .toLowerCase()
      .replace(/[*_~`>#|\\/\-[\]()[\]{}:;,.!?'"“”‘’•○▪◆★]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const tokenizeForMatch = (value: string) =>
    normalizeForMatch(value)
      .split(' ')
      .filter((token) => token.length > 0);

  useEffect(() => {
    const target = navigateToText?.trim();
    const editor = editorRef.current;
    if (!target || !editor) return;
    const needle = normalizeForMatch(target);
    const needleTokens = tokenizeForMatch(target);
    if (!needle || needleTokens.length === 0) return;
    const minTokenMatches = Math.max(1, Math.ceil(needleTokens.length * 0.6));

    const candidates = Array.from(
      editor.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, pre, code, td, th')
    ) as HTMLElement[];
    const scored = candidates
      .map((el) => {
        const text = normalizeForMatch(el.innerText || el.textContent || '');
        if (!text) return null;
        const textTokens = tokenizeForMatch(text);
        let score = 0;

        if (text.includes(needle)) score += 1000;

        const matchedTokenCount = needleTokens.filter((token) =>
          textTokens.some((candidateToken) => candidateToken.includes(token) || token.includes(candidateToken))
        ).length;
        if (!text.includes(needle) && matchedTokenCount < minTokenMatches) return null;
        score += matchedTokenCount * 20;

        // Prefer tighter matches to avoid jumping to very large containers.
        score -= Math.max(0, text.length - needle.length) * 0.02;

        return { el, score, textLength: text.length };
      })
      .filter((entry): entry is { el: HTMLElement; score: number; textLength: number } => !!entry && entry.score > 0)
      .sort((a, b) => (b.score === a.score ? a.textLength - b.textLength : b.score - a.score));

    const bestMatch = scored[0]?.el || null;

    if (!bestMatch) return;

    bestMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const oldBg = bestMatch.style.backgroundColor;
    bestMatch.style.backgroundColor = 'rgba(59, 130, 246, 0.12)';
    if (navigationHighlightTimerRef.current !== null) {
      window.clearTimeout(navigationHighlightTimerRef.current);
    }
    navigationHighlightTimerRef.current = window.setTimeout(() => {
      bestMatch.style.backgroundColor = oldBg;
    }, 800);

    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(bestMatch);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  }, [navigateToText, navigateToSeq, content]);

  useEffect(() => () => {
    if (navigationHighlightTimerRef.current !== null) {
      window.clearTimeout(navigationHighlightTimerRef.current);
    }
  }, []);

  const applyLineSpacing = () => {
    const choice = window.prompt(ui.lineSpacingPrompt, String(lineSpacing));
    const value = Number(choice);
    if (!Number.isFinite(value) || value < 1 || value > 3) return;
    setLineSpacing(value);
  };

  const startVoiceTyping = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript) runCommand('insertText', transcript);
    };
    recognition.start();
  };

  const handleFilePicked = async (file: File) => {
    const text = await file.text();
    const isHtml = file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm');
    const html = isHtml ? text : convertPlainTextToHtml(text);
    setTitle(file.name.replace(/\.[^.]+$/, ''));
    updateContent(html);
    if (editorRef.current) editorRef.current.innerHTML = html;
  };

  const handleTopMenuAction = async (menu: string, item: string) => {
    setActiveTopMenu(null);

    if (menu === 'File') {
      if (item === 'New') {
        setTitle(ui.untitledLesson);
        updateContent('');
        if (editorRef.current) editorRef.current.innerHTML = '';
        return;
      }
      if (item === 'Open') return handleOpenFile();
      if (item === 'Make a copy') {
        const copiedTitle = `${ui.copyOf} ${title || ui.untitledLesson}`;
        setTitle(copiedTitle);
        onSave(copiedTitle, content);
        return;
      }
      if (item === 'Share') {
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (error) {
          console.error('Share link copy failed:', error);
          alert(ui.clipboardDenied);
        }
        return;
      }
      if (item === 'Email') {
        window.location.href = `mailto:?subject=${encodeURIComponent(title || ui.lesson)}`;
        return;
      }
      if (item === 'Rename') {
        const next = window.prompt(ui.renameDocPrompt, title);
        if (next?.trim()) setTitle(next.trim());
        return;
      }
      if (item === 'Move') {
        const nextPrefix = window.prompt(ui.moveToFolderPrompt, ui.myDocuments);
        if (nextPrefix?.trim()) setTitle(`${nextPrefix.trim()} / ${title}`);
        return;
      }
      if (item === 'Version history') return onShowHistory ? onShowHistory() : setShowWordCount(true);
      if (item === 'Page setup') return setShowPageSetupModal(true);
      if (item === 'Print') return window.print();
      if (item === 'Download') return downloadCurrentDoc();
    }

    if (menu === 'Edit') {
      if (item === 'Undo') return undo();
      if (item === 'Redo') return redo();
      if (item === 'Cut') return handleClipboardMenuAction('cut');
      if (item === 'Copy') return handleClipboardMenuAction('copy');
      if (item === 'Paste') return handleClipboardMenuAction('paste');
      if (item === 'Paste without formatting') return pasteWithoutFormatting();
      if (item === 'Select all') return runCommand('selectAll');
      if (item === 'Find and replace') return handleFindAndReplace();
    }

    if (menu === 'View') {
      if (item === 'Mode') return setShowPreview((s) => !s);
      if (item === 'Comments') return insertComment();
      if (item === 'Show ruler') return setShowRuler((s) => !s);
      if (item === 'Show print layout') return setShowPrintLayout((s) => !s);
      if (item === 'Show non-printing characters') return setShowNonPrintingChars((s) => !s);
      if (item === 'Full screen') return toggleFullscreen();
    }

    if (menu === 'Insert') {
      if (item === 'Image') return setShowImageModal(true);
      if (item === 'Table') return insertMarkdownTable(3, 3);
      if (item === 'Building blocks') return insertTemplate('Full lesson plan');
      if (item === 'Smart chips') return runCommand('insertText', '@');
      if (item === 'Link') {
        const url = window.prompt(ui.enterUrl);
        if (!url) return;
        return runCommand('createLink', url);
      }
      if (item === 'Drawing') return setShowImageModal(true);
      if (item === 'Chart') return insertMarkdownTable(4, 4);
      if (item === 'Symbols') return runCommand('insertText', '•');
      if (item === 'Horizontal line') return runCommand('insertHorizontalRule');
      if (item === 'Comment') return insertComment();
    }

    if (menu === 'Format') {
      if (item === 'Text') return setActiveDropdown('font');
      if (item === 'Clear formatting') return clearFormatting();
      if (item === 'Paragraph styles') return setActiveDropdown('styles');
      if (item === 'Align & indent') return setActiveDropdown('align');
      if (item === 'Line & paragraph spacing') return applyLineSpacing();
      if (item === 'Columns') return setShowPageSetupModal(true);
      if (item === 'Bullets & numbering') return setActiveDropdown('lists');
      if (item === 'Headers & footers') return setShowPageSetupModal(true);
      if (item === 'Page numbers') return runCommand('insertText', '\nPage 1\n');
    }

    if (menu === 'Tools') {
      if (item === 'Word count') return setShowWordCount(true);
      if (item === 'Spelling and grammar') return setSpellCheckEnabled((s) => !s);
      if (item === 'Review suggested edits') return setShowPreview(true);
      if (item === 'Compare documents') return handleOpenFile();
      if (item === 'Citations') {
        const cite = window.prompt(ui.citationText, ui.citationDefault);
        if (!cite?.trim()) return;
        return runCommand('insertText', ` (${cite.trim()})`);
      }
      if (item === 'Dictionary') return window.open('https://dictionary.cambridge.org/', '_blank');
      if (item === 'Translate document') return window.open('https://translate.google.com/', '_blank');
      if (item === 'Voice typing') return startVoiceTyping();
    }

    if (menu === 'Extensions') {
      if (item === 'Add-ons') return window.open('https://workspace.google.com/marketplace', '_blank');
      if (item === 'Apps Script') return window.open('https://script.google.com/home', '_blank');
      if (item === 'Manage add-ons') return window.open('https://workspace.google.com/marketplace', '_blank');
    }

    if (menu === 'Help') {
      if (item === 'Keyboard shortcuts') return setShowShortcuts(true);
      if (item === 'Help') return window.open('https://support.google.com/docs', '_blank');
      if (item === 'Training') return window.open('https://workspace.google.com/learning-center/products/docs/', '_blank');
    }

    return;
  };

  return (
    <div className="flex h-full flex-col bg-[#f9fbfd]">
      <input
        ref={openFileInputRef}
        type="file"
        accept=".txt,.md,.markdown,.html,.htm"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleFilePicked(file);
          e.currentTarget.value = '';
        }}
      />
      {/* Top Banner: File Title & Menu Bar */}
      <div className="flex flex-col bg-white border-b border-slate-200 px-4 pt-4 pb-2 z-30 shadow-sm transition-all duration-300 relative">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded bg-[#4285f4]">
            <FileCode size={32} className="text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.untitledLesson}
                className="bg-transparent text-[18px] text-slate-800 placeholder:text-slate-300 focus:outline-none px-1 hover:ring-1 hover:ring-slate-200 rounded min-w-[240px] md:min-w-[320px]"
              />
            </div>
            <div ref={topMenuRef} className="flex items-center gap-1 -ml-1 relative">
              {Object.keys(topMenus).map((menu) => (
                <div key={menu} className="relative">
                  <button
                    onClick={() => setActiveTopMenu(activeTopMenu === menu ? null : menu)}
                    className={cn(
                      "px-2 py-0.5 text-sm rounded transition-colors leading-tight cursor-pointer",
                      activeTopMenu === menu ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {localize(menu)}
                  </button>
                  <AnimatePresence>
                    {activeTopMenu === menu && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-slate-200 bg-white shadow-xl z-[200] py-1 max-h-[70vh] overflow-y-auto"
                      >
                        {topMenus[menu].map((item) => (
                          <button
                            key={`${menu}-${item}`}
                            type="button"
                            onClick={() => handleTopMenuAction(menu, item)}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            {localize(item)}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              className={cn(
                "hidden md:flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold transition-all border",
                !showPreview ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-blue-600 border-blue-200 hover:border-blue-400"
              )}
            >
              {!showPreview ? <Eye size={16} /> : <Edit2 size={16} />}
              {!showPreview ? t.preview : t.edit}
            </button>
            <button 
              className="text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer" 
              title={ui.history}
              onClick={onShowHistory}
            >
              <History size={20} />
            </button>
            <button 
              onClick={onShowShare}
              className="flex items-center gap-1.5 bg-[#c2e7ff] text-[#001d35] px-4 py-1.5 rounded-full font-bold text-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Lock size={16} />
              {t.share}
            </button>
            <button
              onClick={() => onSave(title, content)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-1.5 rounded-full font-bold text-sm hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95 shadow-blue-200"
            >
              <Save size={18} />
              {t.save}
            </button>
          </div>
        </div>
      </div>

      {/* Main Toolbar: Formatting Tools */}
      <div
        ref={toolbarRef}
        className="flex items-center gap-0.5 px-1 h-9 bg-[#edf2fa] border-b border-slate-200 z-20 overflow-x-auto overflow-y-hidden no-scrollbar rounded-full mx-3 my-1.5 shadow-sm relative whitespace-nowrap touch-pan-x"
      >
        <div className="flex items-center">
          <ToolbarButton icon={Search} title={ui.search} onClick={() => setShowSearch(!showSearch)} active={showSearch} />
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 140, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      runSearchInEditor();
                    }
                  }}
                  placeholder={ui.findPlaceholder}
                  className="h-7 w-32 ml-1 px-2 rounded bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ToolbarButton icon={Undo2} title={ui.undo} onClick={undo} active={historyIndex > 0} />
        <ToolbarButton icon={Redo2} title={ui.redo} onClick={redo} active={historyIndex < history.length - 1} />
        <ToolbarButton icon={Printer} title={ui.print} onClick={() => window.print()} />
        <ToolbarButton icon={SpellCheck} title={ui.spellCheck} active={spellCheckEnabled} onClick={() => setSpellCheckEnabled((s) => !s)} />
        <ToolbarButton icon={Baseline} title={ui.paintFormat} onClick={paintCurrentFormat} />
        <ToolbarDropdown label={ui.paperSize} items={paperSizeItems} id="paperSize" type="list" triggerIcon={FileText} />
        <ToolbarDropdown label={ui.copy} items={copyItems} id="copy" type="zoom" />
        <ToolbarDropdown label={ui.quickInsert} items={templateItems} id="template" />
        <ToolbarButton icon={ZoomOut} title={ui.zoomOut} onClick={() => changePaperZoom(-10)} />
        <ToolbarDropdown label={`${zoom}%`} items={zoomItems} id="zoom" type="zoom" />
        <ToolbarButton icon={ZoomIn} title={ui.zoomIn} onClick={() => changePaperZoom(10)} />

        <Divider />
        
        <ToolbarDropdown label={ui.styleShort} items={styleItems} id="styles" type="styles" />
        
        <Divider />
        
        <ToolbarDropdown label={fontFamily} items={fontItems} id="font" type="font" />
        
        <Divider />
        
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={Minus} onClick={() => applySelectedFontSize(Math.max(1, selectedFontSize - 1))} />
          <ToolbarDropdown label={`${selectedFontSize}`} items={fontSizeItems} id="fontSize" type="size" />
          <ToolbarButton icon={Plus} onClick={() => applySelectedFontSize(selectedFontSize + 1)} />
        </div>
        
        <Divider />
        
        <ToolbarButton icon={Bold} title={ui.bold} active={formatState.bold} onClick={() => runCommand('bold')} />
        <ToolbarButton icon={Italic} title={ui.italic} active={formatState.italic} onClick={() => runCommand('italic')} />
        <ToolbarButton icon={Underline} title={ui.underline} active={formatState.underline} onClick={() => runCommand('underline')} />
        <ToolbarButton icon={Strikethrough} title={ui.strikethrough} active={formatState.strikeThrough} onClick={() => runCommand('strikeThrough')} />
        <div>
          <ToolbarButton
            buttonRef={textColorButtonRef}
            icon={Type}
            title={ui.textColor}
            className="text-slate-800"
            onClick={() => setActiveDropdown(activeDropdown === 'textColor' ? null : 'textColor')}
          />
          {createPortal(
            <AnimatePresence>
              {activeDropdown === 'textColor' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  data-editor-portal="dropdown"
                  style={{ top: textColorPalettePos.top, left: textColorPalettePos.left }}
                  className="fixed bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-[260] w-[230px]"
                >
                  <div className="grid grid-cols-9 gap-1.5">
                    {colorPalette.map((color) => (
                      <button
                        key={`text-${color}`}
                        type="button"
                        onClick={() => applyTextColor(color)}
                        className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center"
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {textColor === color && <Check size={12} className="text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>
        <div>
          <ToolbarButton
            buttonRef={highlightButtonRef}
            icon={Baseline}
            title={ui.highlightColor}
            className="text-slate-800"
            onClick={() => setActiveDropdown(activeDropdown === 'highlightColor' ? null : 'highlightColor')}
          />
          {createPortal(
            <AnimatePresence>
              {activeDropdown === 'highlightColor' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  data-editor-portal="dropdown"
                  style={{ top: highlightPalettePos.top, left: highlightPalettePos.left }}
                  className="fixed bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-[260] w-[230px]"
                >
                  <div className="grid grid-cols-9 gap-1.5">
                    {colorPalette.map((color) => (
                      <button
                        key={`highlight-${color}`}
                        type="button"
                        onClick={() => applyHighlightColor(color)}
                        className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center"
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {highlightColor === color && <Check size={12} className="text-slate-800 drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>
        
        <Divider />
        
        <ToolbarButton
          icon={Link}
          title={ui.insertLink}
          onClick={() => {
            const url = window.prompt(ui.enterUrl);
            if (!url) return;
            document.execCommand('createLink', false, url);
            if (editorRef.current) updateContent(editorRef.current.innerHTML);
          }}
        />
        <ToolbarButton icon={MessageSquarePlus} title={ui.addComment} onClick={insertComment} />
        <ToolbarButton icon={ImageIcon} title={ui.insertImage} onClick={() => setShowImageModal(true)} />
        <ToolbarDropdown label={ui.table} items={tableItems} id="table" />
        <ToolbarDropdown label="Code" items={codeLanguageItems} id="codeLang" type="list" triggerIcon={Braces} />
        <ToolbarButton icon={Copy} title={ui.copyMarkdown} onClick={() => copyContentAs('markdown')} />
        
        <Divider />
        
        <div>
          <ToolbarButton
            buttonRef={alignButtonRef}
            icon={alignIcon}
            title={ui.alignment}
            onClick={() => setActiveDropdown(activeDropdown === 'align' ? null : 'align')}
            active={activeDropdown === 'align'}
          />
          {createPortal(
            <AnimatePresence>
              {activeDropdown === 'align' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  data-editor-portal="dropdown"
                  style={{ top: alignMenuPos.top, left: alignMenuPos.left }}
                  className="fixed z-[260] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                  <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAlignment('left');
                        setActiveDropdown(null);
                      }}
                      className={cn("h-8 w-8 inline-flex items-center justify-center rounded", activeAlignment === 'left' ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-white")}
                      title={ui.alignLeft}
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlignment('center');
                        setActiveDropdown(null);
                      }}
                      className={cn("h-8 w-8 inline-flex items-center justify-center rounded", activeAlignment === 'center' ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-white")}
                      title={ui.alignCenter}
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlignment('right');
                        setActiveDropdown(null);
                      }}
                      className={cn("h-8 w-8 inline-flex items-center justify-center rounded", activeAlignment === 'right' ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-white")}
                      title={ui.alignRight}
                    >
                      <AlignRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlignment('justify');
                        setActiveDropdown(null);
                      }}
                      className={cn("h-8 w-8 inline-flex items-center justify-center rounded", activeAlignment === 'justify' ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-white")}
                      title={ui.justify}
                    >
                      <AlignJustify size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>
        
        <Divider />
        
        <ToolbarDropdown label={localize(activeListType)} triggerIcon={List} items={listItems} id="lists" type="list" />
        <ToolbarButton icon={ListTodo} title={ui.checklist} onClick={() => applyListStyle('Checklist menu')} />
        <ToolbarButton icon={List} title={ui.bulletedList} onClick={() => { document.execCommand('insertUnorderedList'); if (editorRef.current) updateContent(editorRef.current.innerHTML); }} />
        <ToolbarButton icon={ListOrdered} title={ui.numberedList} onClick={() => { document.execCommand('insertOrderedList'); if (editorRef.current) updateContent(editorRef.current.innerHTML); }} />
        <ToolbarButton icon={Outdent} title={ui.decreaseIndent} onClick={() => handleIndent('outdent')} />
        <ToolbarButton icon={Indent} title={ui.increaseIndent} onClick={() => handleIndent('indent')} />
        <ToolbarButton icon={Eraser} title={ui.clearFormatting} onClick={clearFormatting} />
        <div className="flex-1" />
        
        <div className="flex items-center pr-2">
            <button
                onClick={() => setShowShortcuts(true)}
                className="p-1 px-2 rounded-full bg-white text-slate-500 hover:text-blue-600 transition-all border border-slate-200 text-[11px] font-bold flex items-center gap-1.5 mr-1 active:scale-95"
                title={ui.keyboardShortcuts}
            >
                <Keyboard size={12} />
                {ui.shortcuts}
            </button>
        </div>
      </div>

      <div className="fixed bottom-3 right-3 z-[90] rounded-xl border border-slate-200 bg-white/92 px-2 py-1.5 text-[10.5px] text-slate-600 shadow-sm backdrop-blur-sm w-[148px]">
        <div className="mb-1 flex items-center gap-1 font-semibold text-slate-700">
          <Info size={12} />
          {ui.docStats}
        </div>
        <div className="space-y-0">
          <div>{pageCount} {ui.pages}</div>
          <div>{docStats.words} {ui.words}</div>
          <div>{docStats.chars} {ui.chars}</div>
          <div>{docStats.readingMinutes} {ui.minRead}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 lg:p-5 custom-scrollbar">
        {showPreview ? (
          <DocViewer content={content} fontSize={fontSize} />
        ) : (
          <div 
            className={cn(
              "mx-auto w-full min-h-full bg-white rounded-sm overflow-hidden relative origin-top transition-transform duration-200",
              showPrintLayout ? "shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60" : "ring-0 shadow-none"
            )}
            style={{ 
              maxWidth: `${pageWidth}px`,
              transform: `scale(${zoom / 100})`,
              marginBottom: `${(zoom / 100 - 1) * 100}%` 
            }}
          >
            {/* Simulation of a page ruler */}
            {showRuler && (
              <div className="h-4 bg-slate-100 flex items-end px-16 border-b border-slate-200 uppercase">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-px h-1.5 bg-slate-400" />
                    <span className="text-[8px] text-slate-400 font-bold mt-0.5">{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const editor = e.currentTarget as HTMLDivElement;
                cleanupTypingStyleMarkers(editor);
                decorateCodeBlocks(editor);
                updateContent(editor.innerHTML);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' || e.key === 'Delete') {
                  const editor = editorRef.current;
                  if (editor) cleanupTypingStyleMarkers(editor);
                }
              }}
              onKeyUp={() => { refreshFormatState(); saveCurrentSelection(); }}
              onMouseUp={() => { refreshFormatState(); saveCurrentSelection(); }}
              onFocus={() => { refreshFormatState(); saveCurrentSelection(); }}
              onSelect={saveCurrentSelection}
              onBlur={saveCurrentSelection}
              data-placeholder=""
              className="w-full min-h-[1050px] p-12 leading-relaxed text-slate-700 focus:outline-none border-none"
              spellCheck={spellCheckEnabled}
              style={{
                fontSize: `${fontSize + 5}px`,
                fontFamily: fontFamily === 'Arial' ? '"Inter", sans-serif' : fontFamily,
                whiteSpace: 'pre-wrap',
                minHeight: `${pageCount * PAGE_HEIGHT_PX + Math.max(0, pageCount - 1) * PAGE_GAP_PX}px`,
                padding: `${pagePadding}px`,
                paddingTop: `${pagePadding + PAGE_TOP_OFFSET_PX}px`,
                paddingBottom: `${pagePadding + PAGE_BOTTOM_OFFSET_PX}px`,
                lineHeight: lineSpacing,
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                backgroundImage: [
                  showNonPrintingChars ? 'radial-gradient(circle at 1px 1px, rgba(100,116,139,0.35) 1px, transparent 0)' : '',
                  showPrintLayout
                    ? `repeating-linear-gradient(to bottom, transparent 0, transparent ${PAGE_HEIGHT_PX - 1}px, rgba(148,163,184,0.32) ${PAGE_HEIGHT_PX - 1}px, rgba(148,163,184,0.32) ${PAGE_HEIGHT_PX}px, rgba(241,245,249,0.92) ${PAGE_HEIGHT_PX}px, rgba(241,245,249,0.92) ${PAGE_STRIDE_PX}px)`
                    : '',
                ]
                  .filter(Boolean)
                  .join(', '),
                backgroundSize: [
                  showNonPrintingChars ? '12px 12px' : '',
                  showPrintLayout ? `100% ${PAGE_STRIDE_PX}px` : '',
                ]
                  .filter(Boolean)
                  .join(', '),
              }}
            />
          </div>
        )}
      </div>

      {/* Improved Image Modal */}
      <AnimatePresence>
        {showPageSetupModal && (
          <div className="fixed inset-0 z-[108] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{ui.pageSetup}</h3>
                <button onClick={() => setShowPageSetupModal(false)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4 text-sm">
                <label className="block">
                  <span className="text-slate-600">{ui.paperSize}</span>
                  <select
                    value={paperSizeKey}
                    onChange={(e) => {
                      const nextKey = e.target.value;
                      setPaperSizeKey(nextKey);
                      const selected = paperSizeOptions.find((p) => p.key === nextKey);
                      if (selected && selected.key !== 'Custom') {
                        setPageWidth(selected.width);
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white"
                  >
                    {paperSizeOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-slate-600">{ui.pageWidth}</span>
                  <input
                    type="number"
                    min={600}
                    max={3600}
                    value={pageWidth}
                    onChange={(e) => {
                      setPaperSizeKey('Custom');
                      setPageWidth(Math.max(600, Math.min(3600, Number(e.target.value) || 850)));
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-slate-600">{ui.pagePadding}</span>
                  <input
                    type="number"
                    min={16}
                    max={96}
                    value={pagePadding}
                    onChange={(e) => setPagePadding(Math.max(16, Math.min(96, Number(e.target.value) || 48)))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowPageSetupModal(false)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                  {ui.done}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showWordCount && (
          <div className="fixed inset-0 z-[107] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-base font-bold text-slate-800">{ui.wordCount}</h3>
                <button onClick={() => setShowWordCount(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 py-4 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>{ui.pagesTitle}</span>
                  <strong>{pageCount}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>{ui.wordsTitle}</span>
                  <strong>{docStats.words}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>{ui.charsTitle}</span>
                  <strong>{docStats.chars}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>{ui.readingTime}</span>
                  <strong>{docStats.readingMinutes} {ui.min}</strong>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {showShortcuts && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-base font-bold text-slate-800">{ui.keyboardShortcuts}</h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 py-4 space-y-2 text-sm">
                {[
                  [ui.saveAction, 'Ctrl/Cmd + S'],
                  [ui.bold, 'Ctrl/Cmd + B'],
                  [ui.italic, 'Ctrl/Cmd + I'],
                  [ui.underline, 'Ctrl/Cmd + U'],
                  [ui.toggleShortcuts, 'Ctrl/Cmd + /'],
                ].map(([name, key]) => (
                  <div key={name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-700">{name}</span>
                    <kbd className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{key}</kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        {showImageModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#f8f9fa]">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <Sparkles size={20} />
                  </div>
                  {t.generateImage}
                </h2>
                <button 
                  onClick={() => setShowImageModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.imagePrompt}</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-slate-700 resize-none font-medium"
                    placeholder={ui.imagePlaceholder}
                  />
                </div>

                {generatedImageUrl && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{ui.result}</label>
                    <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 group">
                      <img 
                        src={generatedImageUrl} 
                        alt="Generated" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#f8f9fa] backdrop-blur-sm border-t border-slate-100 flex gap-4">
                {!generatedImageUrl ? (
                  <button
                    onClick={handleGenerateImage}
                    disabled={!imagePrompt.trim() || isGeneratingImage}
                    className="flex-1 py-4 px-6 rounded-2xl bg-[#4285f4] text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 disabled:opacity-50"
                  >
                    {isGeneratingImage ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    {isGeneratingImage ? t.generatingImage : t.generate}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="py-4 px-6 rounded-2xl border-2 border-slate-200 font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                    >
                      {isGeneratingImage ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                      {t.generate}
                    </button>
                    <button
                      onClick={insertGeneratedImage}
                      className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                    >
                      <ImageIcon size={20} />
                      {t.insert}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
