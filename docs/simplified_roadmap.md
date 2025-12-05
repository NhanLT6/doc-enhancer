# Doc Enhancer - Simplified MVP (localStorage + Markdown)

## Key Changes from Original Spec

### ❌ Remove These:
- Supabase/PostgreSQL
- Drizzle ORM
- Database migrations
- Background polling/monitoring (fetch on demand instead)
- Notion API integration (download .md file instead)
- Confluence version tracking (just fetch latest)
- Complex API endpoints for CRUD operations

### ✅ Keep These (Quality Focus):
- Vite + React + TypeScript + Mantine
- 2-column enhancement layout (good UX)
- react-diff-viewer-continued (professional diff)
- Zustand (clean state management)
- Biome (modern linting)
- Mantine full components (Accordion, Notifications, etc - polished UI)
- Confluence read integration (auto-fetch content)

### 🔄 Key Simplifications:
- localStorage instead of database
- Download .md file instead of Notion API
- Fetch on demand (when app opens) instead of polling
- Work with Markdown throughout the flow

## Markdown Handling Examples

### Turndown Helper (Convert HTML → Markdown)

```typescript
// src/lib/markdown.ts
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Fetch and Convert Flow

```typescript
// src/lib/api-client.ts

interface FetchConfluenceResponse {
  content: string; // HTML
  title: string;
  lastModified: string;
}

export async function fetchConfluenceDocument(
  confluenceUrl: string
): Promise<{ markdown: string; title: string }> {
  const response = await fetch(
    `/api/confluence-fetch?confluenceUrl=${encodeURIComponent(confluenceUrl)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch from Confluence');
  }
  
  const data: FetchConfluenceResponse = await response.json();
  
  // Convert HTML to Markdown
  const markdown = htmlToMarkdown(data.content);
  
  return {
    markdown,
    title: data.title,
  };
}

export async function enhanceContent(
  content: string,
  instructions?: string
): Promise<string> {
  const response = await fetch('/api/enhance-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, instructions }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to enhance content');
  }
  
  const data = await response.json();
  return data.enhancedContent;
}
```

### React Component with Markdown Preview

```typescript
// Example: Preview panel with react-markdown
import { Card, Text, Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import { downloadMarkdown } from '@/lib/markdown';

interface PreviewPanelProps {
  enhancedContent: string;
  documentName: string;
}

function PreviewPanel({ enhancedContent, documentName }: PreviewPanelProps) {
  const handleDownload = () => {
    downloadMarkdown(enhancedContent, `${documentName}-enhanced`);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="lg" fw={500} mb="md">Enhanced Version</Text>
      
      {/* Markdown preview with styling */}
      <div style={{ 
        maxHeight: '600px', 
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
      }}>
        <ReactMarkdown
          components={{
            // Custom styling for code blocks
            code: ({ node, inline, ...props }) => (
              inline ? 
                <code style={{ 
                  backgroundColor: '#e9ecef',
                  padding: '0.2em 0.4em',
                  borderRadius: '3px',
                  fontSize: '0.9em',
                }} {...props} /> :
                <code style={{
                  display: 'block',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: '1em',
                  borderRadius: '6px',
                  overflow: 'auto',
                }} {...props} />
            ),
          }}
        >
          {enhancedContent}
        </ReactMarkdown>
      </div>
      
      <Button 
        leftSection={<IconDownload size={16} />}
        color="green"
        fullWidth 
        mt="md"
        onClick={handleDownload}
      >
        Download as .md
      </Button>
    </Card>
  );
}
```

## Simplified Architecture

```
Frontend (React + Zustand)
  ↓
localStorage (for data)
  ↓
Vercel Functions (2 thin proxies)
  ↓
External APIs (Confluence + Gemini only)
  ↓
Download .md file (no Notion API)
```

---

## Updated Tech Stack

### Frontend
- ✅ Vite + React 18 + TypeScript
- ✅ Mantine v7 (full components - Accordion, Notifications, etc)
- ✅ Zustand (state management)
- ✅ react-diff-viewer-continued (professional diff view)
- ✅ Biome (linting + formatting)
- ✅ @tabler/icons-react

### Markdown Handling
- ✅ **turndown** - Convert Confluence HTML → Markdown
- ✅ **react-markdown** - Render markdown preview

### Backend (Minimal)
- ✅ Vercel Functions (2 endpoints only)
- ❌ No database
- ❌ No ORM
- ❌ No Notion integration

### Storage
- ✅ **localStorage** for all data
- ✅ Simple JSON serialization
- ✅ Work with Markdown format throughout

---

## Simplified API Endpoints

You only need 2 thin proxy endpoints:

```typescript
// 1. GET /api/confluence-fetch
// Fetches latest content from Confluence (returns HTML)
Request: ?confluenceUrl=https://...
Response: {
  content: string (HTML),
  title: string,
  lastModified: string
}

// 2. POST /api/enhance-content  
// Forwards to Gemini API for AI enhancement
Request: {
  content: string (markdown),
  instructions: string
}
Response: {
  enhancedContent: string (markdown)
}
```

**All business logic lives in the frontend!**
- Confluence HTML → Markdown conversion (turndown)
- Change detection (diff library)
- Download .md file (browser API)
- localStorage management

---

## Simplified Project Structure

```
doc-enhancer/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── DocumentCard.tsx
│   │   ├── changes/
│   │   │   ├── ChangesList.tsx
│   │   │   └── DiffViewer.tsx
│   │   └── enhancement/
│   │       ├── EnhancementLayout.tsx  # 2-column layout
│   │       ├── SourcePanel.tsx        # Left: changes + instructions
│   │       └── PreviewPanel.tsx       # Right: AI preview (react-markdown)
│   ├── lib/
│   │   ├── storage.ts                 # localStorage wrapper
│   │   ├── markdown.ts                # turndown helper
│   │   └── api-client.ts              # Fetch wrappers (2 endpoints)
│   ├── store/
│   │   └── documentStore.ts           # Zustand store
│   ├── pages/
│   │   ├── Dashboard.tsx              # List documents + fetch on mount
│   │   ├── CheckChanges.tsx           # Diff viewer
│   │   └── EnhanceDocument.tsx        # 2-column enhancement
│   ├── App.tsx
│   └── main.tsx
├── api/                                # ONLY 2 proxy functions
│   ├── confluence-fetch.ts             # Fetch from Confluence
│   └── enhance-content.ts              # Call Gemini AI
├── biome.json
├── postcss.config.cjs
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## localStorage Helper (Replace Database Layer)

```typescript
// src/lib/storage.ts

export interface Document {
  id: string;
  name: string;
  confluenceUrl: string;
  lastFetchedContent: string; // Stored as markdown
  createdAt: string;
  updatedAt: string;
}

export interface EnhancementRecord {
  id: string;
  documentId: string;
  originalContent: string;
  enhancedContent: string;
  instructions: string;
  createdAt: string;
}

class LocalStorage {
  private getKey(type: string): string {
    return `doc-enhancer:${type}`;
  }

  // Documents
  getDocuments(): Document[] {
    const data = localStorage.getItem(this.getKey('documents'));
    return data ? JSON.parse(data) : [];
  }

  getDocument(id: string): Document | null {
    const docs = this.getDocuments();
    return docs.find(d => d.id === id) || null;
  }

  saveDocuments(docs: Document[]): void {
    localStorage.setItem(this.getKey('documents'), JSON.stringify(docs));
  }

  addDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document {
    const documents = this.getDocuments();
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    documents.push(newDoc);
    this.saveDocuments(documents);
    return newDoc;
  }

  updateDocument(id: string, updates: Partial<Document>): void {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    if (index !== -1) {
      documents[index] = { 
        ...documents[index], 
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveDocuments(documents);
    }
  }

  deleteDocument(id: string): void {
    const documents = this.getDocuments().filter(d => d.id !== id);
    this.saveDocuments(documents);
    
    // Also delete related history
    const history = this.getHistory().filter(h => h.documentId !== id);
    localStorage.setItem(this.getKey('history'), JSON.stringify(history));
  }

  // Enhancement History
  getHistory(documentId?: string): EnhancementRecord[] {
    const data = localStorage.getItem(this.getKey('history'));
    const history: EnhancementRecord[] = data ? JSON.parse(data) : [];
    return documentId ? history.filter(h => h.documentId === documentId) : history;
  }

  addHistory(record: Omit<EnhancementRecord, 'id' | 'createdAt'>): EnhancementRecord {
    const history = this.getHistory();
    const newRecord: EnhancementRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    history.push(newRecord);
    localStorage.setItem(this.getKey('history'), JSON.stringify(history));
    return newRecord;
  }

  // Utility
  clearAll(): void {
    localStorage.removeItem(this.getKey('documents'));
    localStorage.removeItem(this.getKey('history'));
  }

  exportData(): string {
    return JSON.stringify({
      documents: this.getDocuments(),
      history: this.getHistory(),
    }, null, 2);
  }

  importData(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      if (data.documents) this.saveDocuments(data.documents);
      if (data.history) {
        localStorage.setItem(this.getKey('history'), JSON.stringify(data.history));
      }
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Invalid import data');
    }
  }
}

export const storage = new LocalStorage();
```

---

## Simplified Installation

```bash
# Create Vite project
npm create vite@latest doc-enhancer -- --template react-ts
cd doc-enhancer

# Install core dependencies
npm install react-router-dom zustand

# Markdown handling (ESSENTIAL)
npm install turndown react-markdown

# Diff viewer
npm install react-diff-viewer-continued diff

# Mantine (full UI library)
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications
npm install @tabler/icons-react

# PostCSS for Mantine (required)
npm install -D postcss postcss-preset-mantine postcss-simple-vars

# Biome (linting + formatting)
npm install --save-dev --save-exact @biomejs/biome
npx @biomejs/biome init

# Utilities
npm install date-fns

# That's it! No database, no TanStack Query needed
```

---

## Minimal Vercel Function Examples

### 1. Confluence Fetch

```typescript
// api/confluence-fetch.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { confluenceUrl } = req.query;

  if (!confluenceUrl) {
    return res.status(400).json({ error: 'confluenceUrl required' });
  }

  try {
    // Extract page ID from URL
    const pageId = extractPageId(confluenceUrl as string);
    
    // Fetch from Confluence API
    const response = await fetch(
      `${process.env.CONFLUENCE_BASE_URL}/rest/api/content/${pageId}?expand=body.storage`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CONFLUENCE_TOKEN}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Confluence API error');
    }

    const data = await response.json();
    
    return res.status(200).json({
      content: data.body.storage.value, // HTML content
      title: data.title,
      lastModified: data.version.when,
    });
  } catch (error) {
    console.error('Confluence fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch from Confluence' });
  }
}

function extractPageId(url: string): string {
  // Extract page ID from Confluence URL
  // Example: https://domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title
  const match = url.match(/pages\/(\d+)/);
  return match ? match[1] : '';
}
```

### 2. Enhance Content (Gemini)

```typescript
// api/enhance-content.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, instructions } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content required' });
  }

  try {
    const prompt = `
You are enhancing technical documentation written in Markdown.

Original content:
${content}

${instructions ? `User instructions:\n${instructions}` : ''}

Task: Enhance this documentation by:
1. Adding implementation details and examples where helpful
2. Clarifying technical concepts
3. Improving structure and readability
4. Adding code examples in appropriate language
5. Maintaining professional technical writing style

Important: 
- Keep the same overall structure
- Output in Markdown format
- Be concise but thorough
- Focus on practical, actionable information
`.trim();

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    const enhancedContent = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      enhancedContent,
    });
  } catch (error) {
    console.error('Enhancement error:', error);
    return res.status(500).json({ error: 'Enhancement failed' });
  }
}
```

---

## Updated Roadmap (4-5 Days!)

### Day 1: Setup + Storage + Markdown
- [ ] Initialize Vite project
- [ ] Install dependencies (with turndown + react-markdown)
- [ ] Setup Mantine + PostCSS
- [ ] Setup Biome configuration
- [ ] Create `storage.ts` helper
- [ ] Create `markdown.ts` helper (turndown + download)
- [ ] Test localStorage CRUD operations
- [ ] Setup routing (Dashboard, CheckChanges, Enhance)
- [ ] Create basic Zustand store

**Deliverable:** Project runs, localStorage works, can convert HTML→MD

---

### Day 2: Dashboard + Document Management
- [ ] Create Dashboard page with Mantine components
- [ ] Add Document form (name + Confluence URL)
- [ ] Display document cards with nice UI
- [ ] Implement delete document
- [ ] Create `/api/confluence-fetch` endpoint
- [ ] Test fetching from Confluence
- [ ] Fetch on Dashboard mount (on demand)
- [ ] Convert HTML to Markdown and store
- [ ] Show last updated time

**Deliverable:** Can add docs, auto-fetch from Confluence on load

---

### Day 3: Change Detection + Diff Viewer
- [ ] Create CheckChanges page
- [ ] Implement "Check for Updates" button per document
- [ ] Compare stored content vs latest fetch
- [ ] Integrate react-diff-viewer-continued
- [ ] Display side-by-side diff with good styling
- [ ] Add "No changes" state
- [ ] Add "Proceed to Enhance" button
- [ ] Store comparison state in Zustand

**Deliverable:** Can see what changed in a nice diff view

---

### Day 4: 2-Column Enhancement UI
- [ ] Create EnhanceDocument page with 2-column layout
- [ ] Left panel: Show changes + instruction textarea
- [ ] Right panel: Preview area (empty initially)
- [ ] Create `/api/enhance-content` endpoint (Gemini)
- [ ] Add "Generate Enhancement" button
- [ ] Integrate react-markdown for preview
- [ ] Style markdown preview nicely
- [ ] Add loading states during AI generation
- [ ] Add error handling with Mantine notifications

**Deliverable:** Full enhancement workflow with beautiful UI

---

### Day 5: Download + History + Polish
- [ ] Implement download .md functionality
- [ ] Add enhancement history view (Accordion)
- [ ] Show past enhancements per document
- [ ] Add "Use Previous Enhancement" feature
- [ ] Improve all loading states (Loader components)
- [ ] Add empty states for all views
- [ ] Add success notifications
- [ ] Test entire flow multiple times
- [ ] Fix any bugs
- [ ] Improve responsive design

**Deliverable:** Polished, fully functional MVP

---

### Day 5-6: Deploy
- [ ] Setup Vercel deployment
- [ ] Configure environment variables in Vercel
- [ ] Test API endpoints on Vercel
- [ ] Deploy frontend to Vercel
- [ ] Test on production URL
- [ ] Share with users for feedback

**Deliverable:** App is live! 🚀

---

## Migration Path (Future Enhancements)

### Phase 2: Add Database (When needed)
**Why:** Multi-device sync, better reliability, team collaboration

1. Create Supabase project
2. Run migrations (same schema as localStorage)
3. Create one-time migration script:
```typescript
// Migrate localStorage → Supabase
const localData = storage.exportData();
await uploadToSupabase(localData);
```
4. Replace `storage.ts` implementation (keep same interface!)
5. **Zero code changes in components!**

**Estimated time:** 1 day

---

### Phase 3: Add Notion Integration (When needed)
**Why:** Auto-push instead of manual download

1. Add Notion API endpoint
2. Parse Markdown → Notion blocks
3. Add "Push to Notion" button next to download
4. Store Notion page IDs in database

**Estimated time:** 1-2 days

---

### Phase 4: Add Version Tracking (When needed)
**Why:** Compare any two versions, see full history

1. Store multiple versions per document
2. Add version selector UI
3. Show diff between any two versions
4. Add rollback capability

**Estimated time:** 2 days

---

### Phase 5: Advanced Features
- Scheduled background checks (cron jobs)
- Slack notifications on changes
- Style guide management
- Team collaboration features
- Bulk enhancement processing
- AI confidence scoring

---

## NOT in MVP (Explicitly Cut)

These make sense but slow down launch:

❌ **Background polling** - Fetch on demand is enough  
❌ **Version tracking** - Just track latest is fine  
❌ **Notion API** - Manual download works  
❌ **Multi-user collaboration** - Single user first  
❌ **Complex rollback** - Can re-fetch if needed  
❌ **Inline comments** - Can use instruction box  
❌ **Database** - localStorage is sufficient  

**Philosophy:** Launch fast, validate idea, add features users actually request.

---

## Core User Flow

1. **Add Document** 
   - Enter document name + Confluence URL
   - Auto-fetches latest content on save
   - Converts HTML → Markdown
   - Stores in localStorage

2. **Check for Changes** (On Demand)
   - Click "Refresh" button on any document
   - Fetches latest from Confluence
   - Compares with stored version
   - Shows diff if changed

3. **Enhance Content**
   - Open document in 2-column view
   - Left: Source content + instruction box
   - Right: Empty (waiting for enhancement)
   - Add optional instructions
   - Click "Generate Enhancement"
   - AI processes → Right panel shows preview (react-markdown)

4. **Download**
   - Review enhanced content in formatted preview
   - Click "Download .md"
   - Get markdown file with document name
   - Manually upload to Notion/wherever you want

5. **History**
   - View past enhancements
   - Reuse previous instructions
   - Compare different versions

---

## Advantages of This Approach

✅ **Launch in ~4-5 days** instead of 7-8 days  
✅ **No database complexity** (Supabase later)  
✅ **No API integration complexity** (Notion later)  
✅ **Zero hosting costs** beyond Vercel Functions  
✅ **Work with clean Markdown throughout**  
✅ **Professional UI with Mantine**  
✅ **Fast, responsive, modern tooling (Biome)**  
✅ **Easy to test locally** (no external services needed)  
✅ **Fetch on demand** (no polling complexity)  

---

## Known Limitations (MVP)

⚠️ **Data only on one browser** (localStorage)  
⚠️ **Manual download** instead of auto-push to Notion  
⚠️ **No version tracking** (just latest vs current)  
⚠️ **Clearing browser data = losing everything**  
⚠️ **~5-10MB storage limit** (plenty for docs)  
⚠️ **No multi-device sync**  

**For MVP validation? Perfect!** Add features after you validate users want this.

---

## Environment Variables (Simplified)

```env
# .env.local (Only 3 variables needed!)

# Confluence API
CONFLUENCE_TOKEN=your-confluence-token
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# That's it! No DATABASE_URL, no SUPABASE, no NOTION_TOKEN
```

### Getting API Keys

**1. Confluence Token:**
- Go to: https://id.atlassian.com/manage-profile/security/api-tokens
- Click "Create API token"
- Give it a name like "Doc Enhancer"
- Copy token (save it, you won't see it again)
- Needs READ permissions only

**2. Gemini API Key:**
- Go to: https://makersuite.google.com/app/apikey
- Click "Create API key"
- Select existing Google Cloud project or create new
- Free tier: 15 requests/minute, plenty for MVP
- Copy API key

---

## Quick Start

```bash
# 1. Setup
git clone <repo>
cd doc-enhancer
npm install
cp .env.example .env.local
# Add API keys (no DB!)

# 2. Start immediately
npm run dev

# 3. Deploy
vercel
```

---

## Success Criteria (MVP Complete When...)

✅ **Document Management**
- Can add documents with Confluence URL
- Can view list of documents
- Can delete documents
- Auto-fetches content on add

✅ **Change Detection**
- Can manually refresh from Confluence
- Converts HTML → Markdown automatically
- Shows diff view when content changes
- Clear visual indication of what changed

✅ **Enhancement Flow**
- 2-column layout works smoothly
- Left: Source content + instruction box
- Right: Enhanced preview with react-markdown
- Can add custom instructions
- AI generates enhanced content
- Nice loading states and error handling

✅ **Output**
- Enhanced markdown renders properly
- Download .md button works
- File saves with correct name

✅ **Polish**
- All Mantine components styled nicely
- Responsive design works
- Loading states everywhere
- Error notifications show helpful messages
- Empty states for all views

✅ **Deployment**
- Deployed to Vercel
- Environment variables configured
- API endpoints work in production
- Can share URL with users

**When all these work → MVP is ready for user feedback! 🎉**

---

## Key Technical Decisions Summary

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **Database** | localStorage (MVP) → Supabase (later) | Launch 2-3 days faster, validate first |
| **State** | Zustand | Clean, simple, scales well |
| **UI Library** | Mantine v7 | Comprehensive, modern, fast to build |
| **Linting** | Biome | Replaces ESLint + Prettier, simpler setup |
| **Diff** | react-diff-viewer-continued | Professional, well-maintained |
| **Markdown** | turndown + react-markdown | Essential for Confluence → Markdown flow |
| **AI** | Gemini 2.0 Flash | Free tier, fast, good quality |
| **Backend** | Vercel Functions | Simple proxies, no complex logic |
| **Polling** | ❌ On-demand fetch | Simpler, user controls refresh |
| **Notion** | ❌ Download .md | Removes integration complexity |
| **Versions** | ❌ Latest only | Can add tracking later |

---

## Important Commands Reference

```bash
# Development
npm run dev                    # Start frontend (port 5173)
vercel dev                     # Start API endpoints locally

# Linting & Formatting
npx biome check --write        # Format and fix all issues
npx biome check                # Check only (CI)
npx biome format --write .     # Format only

# Build & Deploy
npm run build                  # Build for production
npm run preview                # Preview production build
vercel                         # Deploy to Vercel
vercel --prod                  # Deploy to production

# Utilities
npm run type-check             # TypeScript checking
```

---

## Final Notes

### ⚡ Speed Wins
- **No database setup** = saves 1 day
- **No Notion API** = saves 1 day  
- **No version tracking** = saves 1 day
- **On-demand fetch** = saves 0.5 days
- **Total saved: ~3.5 days** from original 7-8 day timeline

### 🎯 Quality Maintained
- ✅ Professional UI with Mantine
- ✅ Clean code with Biome
- ✅ Type-safe with TypeScript
- ✅ Good state management with Zustand
- ✅ Beautiful diffs and markdown rendering
- ✅ Proper error handling and loading states

### 🚀 Launch Strategy
1. **Day 1-5:** Build simplified MVP
2. **Day 6:** Test with real Confluence docs
3. **Day 7:** Deploy and share with users
4. **Week 2:** Gather feedback
5. **Week 3+:** Add requested features (database, Notion, versions)

### 💡 Philosophy
> "Launch fast with quality basics. Add complexity only when users prove they need it."

**You're building a tool to validate an idea, not a perfect product. This approach gets you to validation 3x faster while maintaining the core quality that makes users want to use it.**

Good luck! 🎉