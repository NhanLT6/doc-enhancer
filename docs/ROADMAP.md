# Doc Enhancer - Unified Roadmap

## Project Overview

**Purpose:** Enhance technical documentation by syncing changes from Confluence and using AI to add implementation details, improve clarity, and maintain consistency.

**Core Value:** Automatically detect documentation changes, let developers add context/instructions, and generate enhanced versions with AI assistance.

**Strategy:** Launch fast with simplified MVP (4-5 days), validate with users, then add advanced features based on feedback.

---

## Tech Stack

### Frontend
- **Framework:** Vite + React 18 + TypeScript
- **UI Library:** Mantine v7 (comprehensive component library)
- **State Management:** Zustand (lightweight)
- **Diff Viewer:** react-diff-viewer-continued
- **Markdown:** turndown (HTML→MD) + react-markdown (preview)
- **Linting/Formatting:** Biome (replaces ESLint + Prettier)
- **Icons:** @tabler/icons-react

### Backend (Minimal for MVP)
- **Platform:** Vercel Functions (2 thin proxy endpoints)
- **Storage:** localStorage (MVP) → Supabase PostgreSQL (Phase 2)
- **AI:** Google Gemini 2.0 Flash (free tier)

### APIs
- **Confluence REST API** (read changes)
- **Gemini API** (AI enhancements)
- **Notion API** (Phase 2 - auto-push)

---

## MVP Features (Phase 1: 4-5 Days)

### ✅ What's Included
- Document management (add, list, delete)
- Manual Confluence content fetch (on-demand)
- HTML → Markdown conversion
- Change detection with diff viewer
- 2-column enhancement UI
- AI-powered content enhancement
- Download enhanced .md files
- Enhancement history in localStorage

### ❌ What's Excluded (Move to Later Phases)
- Database (use localStorage)
- Notion API integration (manual download)
- Background polling (on-demand fetch)
- Version tracking (just latest)
- Multi-user collaboration
- Complex rollback

---

## Implementation Timeline

### **Day 1: Foundation** ✅ COMPLETED
- [x] Initialize Vite + React + TypeScript project
- [x] Install dependencies (Mantine, Zustand, markdown tools, diff viewer)
- [x] Setup PostCSS for Mantine
- [x] Setup Biome configuration
- [x] Create project folder structure
- [x] Setup Mantine provider and styles
- [x] Create environment variables template
- [x] Build Enhancement Workflow UI with mock data
- [x] Verify project runs successfully

**Deliverable:** Project runs, Enhancement UI works with mock data ✅

---

### **Day 1-2: Core Helpers & Storage**
- [ ] Create `src/lib/storage.ts` - localStorage wrapper
  - Document CRUD operations
  - Enhancement history storage
  - Export/import data functionality
- [ ] Create `src/lib/markdown.ts` - Markdown helpers
  - HTML to Markdown conversion (turndown)
  - Download .md file function
- [ ] Create `src/lib/api-client.ts` - API wrappers
  - Fetch from Confluence
  - Enhance with Gemini
- [ ] Create `src/store/documentStore.ts` - Zustand store
  - Documents state
  - Current document state
  - Actions

**Deliverable:** Core utilities ready, can store/retrieve data

---

### **Day 2: Backend Functions**
- [ ] Create `api/confluence-fetch.ts` - Vercel function
  - Extract page ID from URL
  - Fetch from Confluence API
  - Return HTML content + metadata
- [ ] Create `api/enhance-content.ts` - Vercel function
  - Forward to Gemini API
  - Return enhanced markdown
- [ ] Setup environment variables
  - CONFLUENCE_TOKEN
  - CONFLUENCE_BASE_URL
  - GEMINI_API_KEY
- [ ] Test API endpoints locally

**Deliverable:** Both API endpoints work

---

### **Day 2-3: Dashboard & Document Management**
- [ ] Create `src/pages/Dashboard.tsx`
  - List all documents
  - Add document form (modal)
  - Delete document
  - Last updated time
- [ ] Create `src/components/dashboard/DocumentCard.tsx`
  - Document info display
  - Action buttons
  - Status badges
- [ ] Integrate with localStorage
- [ ] Auto-fetch content when document added
- [ ] Convert HTML → Markdown on fetch
- [ ] Store in localStorage

**Deliverable:** Can add/manage documents, see fetched content

---

### **Day 3: Change Detection & Diff Viewer**
- [ ] Create `src/pages/CheckChanges.tsx`
  - Fetch latest from Confluence
  - Compare with stored content
  - Show diff if changed
  - "No changes" state
- [ ] Create `src/components/changes/DiffViewer.tsx`
  - Integrate react-diff-viewer-continued
  - Side-by-side view
  - Styling
- [ ] Add "Proceed to Enhance" button
- [ ] Store comparison state

**Deliverable:** Can detect and view changes with professional diff

---

### **Day 4: Connect Real Enhancement Workflow**
- [ ] Update `src/pages/EnhanceDocument.tsx`
  - Load real document data
  - Pass to EnhancementLayout
- [ ] Connect SourcePanel to real API
  - Call `/api/enhance-content`
  - Handle loading states
  - Handle errors
- [ ] Update PreviewPanel
  - Show real enhanced content
  - Proper error states
- [ ] Add navigation between pages

**Deliverable:** Full enhancement workflow works end-to-end

---

### **Day 4-5: Polish & History**
- [ ] Add enhancement history view
  - List past enhancements per document
  - Show timestamp
  - Preview previous versions
- [ ] Add "Reuse Instructions" feature
- [ ] Improve loading states everywhere
- [ ] Add error handling with notifications
- [ ] Add empty states for all views
- [ ] Improve responsive design
- [ ] Add confirmation dialogs
- [ ] Test entire flow multiple times

**Deliverable:** Polished, user-friendly MVP

---

### **Day 5-6: Deploy**
- [ ] Setup Vercel project
- [ ] Configure environment variables in Vercel
- [ ] Test API endpoints on Vercel
- [ ] Deploy frontend to Vercel
- [ ] Test on production URL
- [ ] Fix any deployment issues
- [ ] Share with initial users

**Deliverable:** App is live! 🚀

---

## Phase 2: Database & Sync (1-2 Weeks)

### Goal: Multi-device sync and better reliability

- [ ] Setup Supabase project
- [ ] Create database schema (3 tables)
  - documents
  - pending_updates
  - enhancement_history
- [ ] Setup Drizzle ORM
- [ ] Run migrations
- [ ] Create migration script (localStorage → Supabase)
- [ ] Update storage layer (keep same interface)
- [ ] Add authentication (optional)
- [ ] Test multi-device sync

**Deliverable:** Data persists across devices

---

## Phase 3: Notion Integration (1-2 Days)

### Goal: Auto-push to Notion instead of manual download

- [ ] Add Notion API client (`src/lib/api/notion.ts`)
- [ ] Create `/api/apply-to-notion` endpoint
- [ ] Parse Markdown → Notion blocks
- [ ] Update Notion page via API
- [ ] Append change log to Notion
- [ ] Add "Push to Notion" button (alongside download)
- [ ] Store Notion page IDs in database
- [ ] Handle Notion API errors

**Deliverable:** Can auto-push enhanced docs to Notion

---

## Phase 4: Version Tracking (2-3 Days)

### Goal: Compare versions, see full history

- [ ] Store multiple versions per document
- [ ] Add version selector UI
- [ ] Show diff between any two versions
- [ ] Add rollback capability
- [ ] Version timeline view
- [ ] Tag important versions
- [ ] Export version history

**Deliverable:** Full version control for documents

---

## Phase 5: Advanced Features (2-4 Weeks)

### Background Monitoring
- [ ] Add TanStack Query with refetchInterval
- [ ] Background polling for changes
- [ ] Desktop notifications
- [ ] Schedule checks (cron jobs)

### Style Guide Management
- [ ] Create style guide editor UI
- [ ] Store organization style guides
- [ ] Apply style guide to enhancements
- [ ] Multiple style guide templates

### Collaboration Features
- [ ] Multi-user support
- [ ] Comment threads on changes
- [ ] Text selection + inline comments
- [ ] Approval workflows
- [ ] User roles (viewer, editor, admin)

### Advanced Enhancement
- [ ] Partial apply (select specific sections)
- [ ] AI confidence scoring
- [ ] Template system for common patterns
- [ ] Batch processing (multiple docs)
- [ ] Custom AI prompts

### Integrations
- [ ] Slack notifications on changes
- [ ] Microsoft Teams integration
- [ ] Jira ticket creation
- [ ] GitHub sync for docs
- [ ] Linear integration

### Analytics
- [ ] Usage dashboard
- [ ] Enhancement metrics
- [ ] Document activity tracking
- [ ] Popular documents
- [ ] AI enhancement quality metrics

---

## Architecture Evolution

### Current (MVP)
```
Frontend (React + Zustand)
  ↓
localStorage (data)
  ↓
Vercel Functions (2 proxies)
  ↓
External APIs (Confluence + Gemini)
  ↓
Download .md file
```

### Phase 2 (Database)
```
Frontend (React + Zustand)
  ↓
Supabase PostgreSQL + Drizzle ORM
  ↓
Vercel Functions (3-4 endpoints)
  ↓
External APIs (Confluence + Gemini)
  ↓
Download .md file
```

### Phase 3+ (Full Stack)
```
Frontend (React + Zustand + TanStack Query)
  ↓
Supabase (PostgreSQL + Auth + Realtime)
  ↓
Vercel/Cloudflare Functions (6-8 endpoints)
  ↓
External APIs (Confluence + Notion + Gemini + Slack)
  ↓
Multi-output (Notion push + Download + GitHub)
```

---

## Database Schema (Phase 2+)

### documents
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  confluence_url TEXT NOT NULL,
  notion_page_id TEXT,
  last_confluence_version INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### pending_updates
```sql
CREATE TABLE pending_updates (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id),
  confluence_version INTEGER,
  old_content TEXT,
  new_content TEXT,
  changes_json TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### enhancement_history
```sql
CREATE TABLE enhancement_history (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id),
  version INTEGER,
  enhanced_content TEXT,
  changes_summary TEXT,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Success Criteria

### MVP Complete When:
- ✅ Can add/manage documents
- ✅ Can fetch from Confluence
- ✅ Can detect changes with diff view
- ✅ Can enhance with AI
- ✅ Can download enhanced .md files
- ✅ Enhancement history works
- ✅ Deployed and accessible
- ✅ 3-5 beta users testing successfully

### Phase 2 Complete When:
- ✅ Data syncs across devices
- ✅ Database backup/restore works
- ✅ Migration from localStorage successful
- ✅ Performance is good with 100+ documents

### Phase 3 Complete When:
- ✅ Can auto-push to Notion
- ✅ Notion formatting looks good
- ✅ Change logs appear correctly
- ✅ Error handling is robust

---

## Environment Variables

```env
# MVP (Phase 1)
CONFLUENCE_TOKEN=your-confluence-token
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
GEMINI_API_KEY=your-gemini-api-key

# Phase 2 (Database)
DATABASE_URL=postgresql://user:password@host:5432/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Phase 3 (Notion)
NOTION_TOKEN=secret_xxx

# Phase 5 (Advanced)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
GITHUB_TOKEN=ghp_xxx
```

---

## Key Decisions

| Decision | MVP Choice | Future Option | Reasoning |
|----------|------------|---------------|-----------|
| **Storage** | localStorage | Supabase PostgreSQL | Launch 2-3 days faster |
| **Notion** | Manual download | Auto-push API | Remove integration complexity |
| **Polling** | On-demand fetch | Background polling | Simpler, user controls |
| **Versions** | Latest only | Full tracking | Can add later if needed |
| **Auth** | None | Supabase Auth | Single user first |
| **Backend** | Vercel Functions | Cloudflare Workers | Easy to migrate later |

---

## Migration Paths

### localStorage → Supabase
```typescript
// One-time migration script
const localData = storage.exportData();
const { documents, history } = JSON.parse(localData);

for (const doc of documents) {
  await db.insert(documentsTable).values(doc);
}
for (const record of history) {
  await db.insert(historyTable).values(record);
}
```

### Vercel → Cloudflare (if needed)
1. Copy `/api/core` business logic (already portable)
2. Create Cloudflare Workers wrappers
3. Update API base URL in frontend
4. Deploy to Cloudflare Pages + Workers
5. Zero changes to core logic

---

## Commands Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Code Quality
pnpm lint                   # Check code
pnpm lint:fix               # Fix code issues
pnpm format                 # Format code

# Database (Phase 2+)
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
pnpm db:studio              # Visual database browser

# Deployment
vercel                      # Deploy to Vercel
vercel --prod               # Deploy to production
```

---

## Project Status

### ✅ Completed
- [x] Project initialization
- [x] Dependencies installed
- [x] Configuration files setup
- [x] Enhancement Workflow UI (with mock data)
- [x] Beautiful markdown preview
- [x] Loading states and notifications

### 🚧 In Progress
- [ ] Core helpers (storage, markdown, API client)
- [ ] Zustand store
- [ ] Backend API endpoints

### 📋 Next Up
- [ ] Dashboard & Document Management
- [ ] Real Confluence integration
- [ ] Change detection & diff viewer

---

## Notes

### Why This Approach?
- **Speed**: Launch in 4-5 days vs 7-8 days
- **Validation**: Prove concept before building infrastructure
- **Flexibility**: Easy to add features users actually want
- **Quality**: Still professional UI and UX

### Known MVP Limitations
- ⚠️ Data only in one browser
- ⚠️ Manual download vs auto-push
- ⚠️ No version tracking
- ⚠️ No multi-device sync
- ⚠️ ~5-10MB storage limit

**These are acceptable for validation!** Add features after users prove they want this.

---

**Last Updated:** 2025-12-05
**Current Phase:** MVP (Day 1 Complete)
**Next Milestone:** Core helpers & storage (Day 1-2)
