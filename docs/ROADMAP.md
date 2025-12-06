# Doc Enhancer - Product Roadmap

## Project Overview

**Purpose:** Enhance technical documentation by syncing changes from Confluence and using AI to add implementation details, improve clarity, and maintain consistency.

**Core Value:** Automatically detect documentation changes, let developers add context/instructions, and generate enhanced versions with AI assistance.

**Strategy:** Launch fast with simplified MVP (4-5 days), validate with users, then add advanced features based on feedback.

---

## Tech Stack

### Frontend
- **Framework:** Vite + React 18 + TypeScript
- **UI Library:** Mantine v7
- **State Management:** Zustand
- **Markdown:** turndown (HTML→MD) + react-markdown (preview)
- **Diff Viewer:** react-diff-viewer-continued
- **Linting/Formatting:** Biome
- **Icons:** @tabler/icons-react

### Backend
- **Platform:** Vercel Functions (2 proxy endpoints)
- **Storage:** localStorage (MVP) → Supabase PostgreSQL (Phase 2)
- **AI:** Google Gemini 2.0 Flash (free tier)

### APIs
- **Confluence REST API** (read content)
- **Gemini API** (AI enhancements)
- **Notion API** (Phase 3 - auto-push)

---

## Phase 1: MVP (4-5 Days) 🎯

**Goal:** Launch working product to validate idea with users

### Features

**Document Management**
- [x] Add documents (name + Confluence URL)
- [ ] List all documents
- [ ] Delete documents
- [ ] Auto-fetch content when document added

**Content Fetching**
- [x] Vercel function to fetch from Confluence
- [ ] Extract page ID from URL
- [ ] Convert HTML → Markdown (turndown)
- [ ] Store in localStorage
- [ ] Manual refresh (on-demand, no polling)

**Change Detection**
- [ ] Compare stored content vs latest fetch
- [ ] Side-by-side diff viewer (react-diff-viewer-continued)
- [ ] Highlight what changed
- [ ] "No changes" state
- [ ] "Proceed to Enhance" button

**Enhancement Workflow**
- [x] 2-column layout (source | enhanced)
- [x] Source panel with instruction textarea
- [x] Preview panel with markdown rendering
- [x] "Generate Enhancement" button with loading state
- [ ] Connect to real Gemini API
- [x] Download enhanced .md file
- [ ] Store enhancement in history

**Enhancement History**
- [ ] View past enhancements per document
- [ ] Show timestamp and instructions used
- [ ] Reuse previous instructions
- [ ] Store in localStorage

**UI/UX Polish**
- [x] Professional Mantine components
- [x] Loading states with spinners
- [x] Success/error notifications
- [x] Empty states
- [ ] Responsive design (mobile-friendly)
- [ ] Confirmation dialogs

**Deployment**
- [ ] Setup Vercel project
- [ ] Configure environment variables
- [ ] Deploy frontend + API endpoints
- [ ] Test on production URL

### Implementation Tasks

**Setup** ✅ COMPLETED
- [x] Initialize Vite + React + TypeScript
- [x] Install dependencies
- [x] Setup Mantine + PostCSS
- [x] Setup Biome
- [x] Create folder structure
- [x] Environment variables template
- [x] Build Enhancement UI with mock data

**Core Helpers** 🚧 IN PROGRESS
- [ ] `src/lib/storage.ts` - localStorage wrapper (CRUD operations)
- [ ] `src/lib/markdown.ts` - HTML→MD conversion, download function
- [ ] `src/lib/api-client.ts` - API call wrappers
- [ ] `src/store/documentStore.ts` - Zustand store

**Backend API**
- [ ] `api/confluence-fetch.ts` - Fetch from Confluence
- [ ] `api/enhance-content.ts` - Call Gemini API

**Pages & Components**
- [x] `EnhancementLayout.tsx` - 2-column layout
- [x] `SourcePanel.tsx` - Left panel
- [x] `PreviewPanel.tsx` - Right panel with markdown
- [ ] `Dashboard.tsx` - List documents
- [ ] `DocumentCard.tsx` - Document item
- [ ] `CheckChanges.tsx` - Diff viewer page
- [ ] `DiffViewer.tsx` - Diff component

**Integration**
- [ ] Connect Dashboard to localStorage
- [ ] Connect Enhancement to real API
- [ ] Navigation between pages
- [ ] Error handling throughout

### Success Criteria

✅ **MVP is complete when:**
- Can add/manage documents
- Can fetch from Confluence
- Can detect changes with diff view
- Can enhance with AI (real API)
- Can download enhanced .md files
- Enhancement history works
- Deployed and accessible
- 3-5 beta users testing successfully

---

## Phase 2: Database & Persistence (1-2 Weeks)

**Goal:** Multi-device sync and better reliability

### Features
- [ ] Setup Supabase project
- [ ] Create database schema (documents, pending_updates, enhancement_history)
- [ ] Setup Drizzle ORM
- [ ] Run migrations
- [ ] Create migration script (localStorage → Supabase)
- [ ] Update storage layer (keep same interface)
- [ ] Add user authentication (Supabase Auth)
- [ ] Multi-device sync
- [ ] Better data reliability and backup

### Database Schema

```sql
-- documents
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  confluence_url TEXT NOT NULL,
  notion_page_id TEXT,
  last_confluence_version INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- enhancement_history
CREATE TABLE enhancement_history (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id),
  version INTEGER,
  enhanced_content TEXT,
  original_content TEXT,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- pending_updates
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

---

## Phase 3: Notion Integration (1-2 Weeks)

**Goal:** Auto-push to Notion instead of manual download

### Features
- [ ] Add Notion API client
- [ ] Create `/api/apply-to-notion` endpoint
- [ ] Parse Markdown → Notion blocks
- [ ] Update Notion page via API
- [ ] Append change log to Notion
- [ ] Add "Push to Notion" button (alongside download)
- [ ] Store Notion page IDs in database
- [ ] Handle Notion API errors gracefully
- [ ] Retry logic for failed pushes

---

## Phase 4: Version Tracking & History (2-3 Weeks)

**Goal:** Full version control for documents

### Features
- [ ] Store multiple versions per document
- [ ] Version selector UI (dropdown/timeline)
- [ ] Show diff between any two versions
- [ ] Rollback to previous version
- [ ] Version timeline visualization
- [ ] Tag important versions
- [ ] Export full version history
- [ ] Compare versions side-by-side
- [ ] Version metadata (who, when, why)

---

## Phase 5: Advanced Enhancement (2-3 Weeks)

**Goal:** More powerful AI enhancements

### Features

**Inline Enhancement (Notion/Google Docs style)**
- [ ] Text selection with floating menu
  - **Button 1: Auto Enhance** (instant enhancement like Notion)
    - Select text → Click "Enhance" → Auto-replace
    - Show loading indicator inline
    - Toast notification with Undo option
  - **Button 2: Custom Prompt** (detailed control like Google Docs)
    - Opens side panel (AppShell.Aside)
    - Input field for custom instructions or questions
    - AI responds with enhanced version
    - Diff view in side panel
    - Accept/Reject/Edit manually buttons
    - Follow-up conversation support
    - Chat history per selection
- [ ] **Conversation Markers** (like Google Docs comments)
  - Save conversation history for each enhancement
  - Add visual marker/indicator in document
  - Click marker → Reopen side panel with conversation history
  - View all enhancements in a list
  - Filter by date/type
- [ ] Side panel features
  - Non-blocking (can read document while open)
  - Persistent across sessions
  - Diff viewer for comparing original vs enhanced
  - Manual text editing in panel
  - Export conversation history

**Style Guide Management**
- [ ] Create/edit style guides
- [ ] Organization-wide templates
- [ ] Apply style guide to enhancements

**AI Features**
- [ ] AI confidence scoring
  - Show confidence per section
  - Flag low-confidence suggestions
- [ ] Custom AI prompts
  - Save prompt templates
  - Share prompts across team
- [ ] Batch processing
  - Enhance multiple documents
  - Queue system
- [ ] A/B testing enhancements
  - Generate multiple versions
  - Compare approaches

---

## Phase 6: Collaboration & Enterprise (3-4 Weeks)

**Goal:** Team collaboration and enterprise features

### Features

**Multi-user Collaboration**
- [ ] Team workspaces
- [ ] User roles (viewer, editor, admin)
- [ ] Comment threads on changes
- [ ] Text selection + inline comments
- [ ] Approval workflows
- [ ] Activity feed per document

**Integrations**
- [ ] Slack notifications on changes
- [ ] Microsoft Teams integration
- [ ] Jira ticket creation
- [ ] GitHub sync for docs-as-code
- [ ] Linear integration
- [ ] Webhook support

**Background Monitoring**
- [ ] Scheduled checks (cron jobs)
- [ ] Background polling with TanStack Query
- [ ] Desktop notifications
- [ ] Email digests
- [ ] Change summaries

**Analytics Dashboard**
- [ ] Usage metrics
- [ ] Enhancement quality scores
- [ ] Document activity tracking
- [ ] Popular documents
- [ ] User activity
- [ ] API usage stats

**Enterprise Features**
- [ ] SSO / SAML authentication
- [ ] Audit logs
- [ ] Custom branding
- [ ] Data export/import
- [ ] Compliance features (GDPR, SOC2)
- [ ] Advanced permissions

---

## Architecture Evolution

### Current: MVP (Phase 1)
```
Frontend (React + Zustand)
  ↓
localStorage
  ↓
Vercel Functions (2 proxies)
  ↓
Confluence + Gemini APIs
  ↓
Download .md
```

### Phase 2: Database
```
Frontend (React + Zustand)
  ↓
Supabase PostgreSQL + Drizzle
  ↓
Vercel Functions (4 endpoints)
  ↓
Confluence + Gemini APIs
  ↓
Download .md
```

### Phase 3+: Full Stack
```
Frontend (React + Zustand + TanStack Query)
  ↓
Supabase (PostgreSQL + Auth + Realtime)
  ↓
Vercel/Cloudflare Functions
  ↓
External APIs (Confluence + Notion + Gemini + Slack)
  ↓
Multi-output (Notion + Download + GitHub)
```

---

## Environment Variables

```env
# Phase 1 (MVP)
CONFLUENCE_TOKEN=your-token
CONFLUENCE_BASE_URL=https://domain.atlassian.net
GEMINI_API_KEY=your-key

# Phase 2 (Database)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key

# Phase 3 (Notion)
NOTION_TOKEN=secret_xxx

# Phase 6 (Integrations)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
GITHUB_TOKEN=ghp_xxx
TEAMS_WEBHOOK_URL=https://...
```

---

## Migration Paths

### localStorage → Supabase (Phase 1 → Phase 2)

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

### Vercel → Cloudflare (Optional)

1. Copy `/api/core` business logic (portable)
2. Create Cloudflare Workers wrappers
3. Update API base URL in frontend
4. Deploy to Cloudflare Pages + Workers
5. Zero changes to core logic

---

## Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm preview                # Preview build

# Code Quality
pnpm lint                   # Check code
pnpm lint:fix               # Fix issues
pnpm format                 # Format code

# Database (Phase 2+)
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
pnpm db:studio              # Visual DB browser

# Deployment
vercel                      # Deploy preview
vercel --prod               # Deploy production
```

---

## Current Status

**Phase:** 1 (MVP)
**Progress:** Day 1 Complete ✅
**Next:** Core helpers & storage

### Completed ✅
- Project initialization
- Mantine UI setup
- Enhancement Workflow UI (mock data)
- Beautiful markdown preview
- Loading states & notifications
- Git repository setup

### In Progress 🚧
- Core utility helpers
- localStorage wrapper
- Zustand store

### Next Up 📋
- Backend API endpoints
- Dashboard & document management
- Real Confluence integration
- Diff viewer

---

## Known Limitations

### MVP (Phase 1)
- ⚠️ Data only in one browser (localStorage)
- ⚠️ Manual download (no Notion auto-push)
- ⚠️ No version tracking (just latest)
- ⚠️ No multi-device sync
- ⚠️ ~5-10MB storage limit
- ⚠️ Single user only

**These are acceptable for validation!** Features will be added based on user feedback.

---

**Last Updated:** 2025-12-05
**Current Sprint:** Phase 1 - Day 1 Complete
