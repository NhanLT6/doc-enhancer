# Doc Enhancer – Project Specification & Roadmap

## Project Overview

**Purpose:** Enhance technical documentation by syncing changes from Confluence and using AI to add implementation details, improve clarity, and maintain consistency.

**Core Value:** Automatically detect documentation changes, let developers add context/instructions, and generate enhanced versions with AI assistance.

**UI Framework Choice:** Using Mantine v7 for its comprehensive component library (26/32 components ready out-of-box), modern design, built-in form validation, and faster development speed compared to alternatives while maintaining good customization options.

## Tech Stack (Final Decisions)

### Frontend
- **Framework:** Vite + React 18 + TypeScript
- **UI Library:** Mantine v7 (modern, comprehensive component library)
- **State Management:** Zustand (lightweight)
- **Data Fetching:** TanStack Query v5 (manual refresh for MVP, no polling)
- **Diff Viewer:** react-diff-viewer-continued
- **Linting/Formatting:** Biome (replaces ESLint + Prettier)
- **Icons:** @tabler/icons-react (Mantine's icon library)

### Backend (Serverless)
- **Platform:** Vercel Functions (Node.js/TypeScript)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle (method chaining syntax)
- **AI:** Google Gemini 2.5 Flash (free tier)

### APIs to Integrate
- Confluence REST API (read changes)
- Notion API (update documentation)
- Google Gemini API (AI enhancements)

## Core Features (MVP)

### 1. Change Detection
- Manually check Confluence for new version
- Display what changed (use diff viewer)
- Show summary of changes

### 2. Enhancement Workflow
- Two-column layout (source changes | AI enhanced output)
- Select specific changes to enhance
- Add instructions per change (optional)
- Generate AI-enhanced version
- Review and approve before applying

### 3. Apply to Notion
- Update Notion page with enhanced content
- Add version tracking in change log section
- Store history in database

## NOT in MVP (Future)
- ❌ Background polling/monitoring
- ❌ Style guide management UI
- ❌ Complex comment threads
- ❌ Multi-user collaboration
- ❌ Text selection + inline comments
- ❌ Rollback functionality

## Project Structure

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
│   │       ├── SourcePanel.tsx        # Left: changes
│   │       └── PreviewPanel.tsx       # Right: AI output
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts              # Drizzle schema
│   │   │   ├── client.ts              # DB connection
│   │   │   └── queries.ts             # Reusable queries
│   │   ├── api/
│   │   │   ├── confluence.ts          # Confluence client
│   │   │   ├── notion.ts              # Notion client
│   │   │   └── gemini.ts              # Gemini AI client
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx              # List documents
│   │   ├── CheckChanges.tsx           # Review changes
│   │   └── EnhanceDocument.tsx        # 2-column enhancement
│   ├── store/
│   │   └── documentStore.ts           # Zustand store
│   ├── App.tsx
│   └── main.tsx
├── api/                                # Vercel serverless functions
│   ├── core/                           # Platform-agnostic logic
│   │   ├── confluence-check.ts         # Core: check changes
│   │   ├── enhance-document.ts         # Core: AI enhancement
│   │   └── apply-to-notion.ts          # Core: update Notion
│   ├── confluence-check.ts             # Vercel wrapper
│   ├── enhance-document.ts             # Vercel wrapper
│   └── apply-to-notion.ts              # Vercel wrapper
├── drizzle/
│   └── migrations/                     # DB migrations
├── public/
├── biome.json                          # Biome config
├── postcss.config.cjs                  # PostCSS for Mantine
├── drizzle.config.ts                   # Drizzle config
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Database Schema

```typescript
// documents table
{
  id: serial (PK)
  name: text
  confluenceUrl: text
  notionPageId: text
  lastConfluenceVersion: integer
  createdAt: timestamp
}

// pending_updates table
{
  id: serial (PK)
  documentId: integer (FK -> documents.id)
  confluenceVersion: integer
  oldContent: text
  newContent: text
  changesJson: text (JSON string)
  status: varchar ('pending' | 'processing' | 'completed' | 'skipped')
  createdAt: timestamp
}

// enhancement_history table
{
  id: serial (PK)
  documentId: integer (FK -> documents.id)
  version: integer
  enhancedContent: text
  changesSummary: text
  createdAt: timestamp
}
```

## API Endpoints

```typescript
// GET /api/confluence-check?documentId=1
// Check if Confluence doc has new version
Response: {
  hasChanges: boolean
  oldVersion: number
  newVersion: number
  changes?: {
    oldContent: string
    newContent: string
  }
}

// POST /api/enhance-document
// Generate AI-enhanced version
Request: {
  documentId: number
  changes: string
  instructions?: string[]
}
Response: {
  enhancedContent: string
  summary: string
}

// POST /api/apply-to-notion
// Update Notion page
Request: {
  documentId: number
  enhancedContent: string
  summary: string
}
Response: {
  success: boolean
  notionUrl: string
}
```

## Implementation Roadmap

**Total Timeline: 7-8 days**

### Phase 1: Setup (Day 1)
**Goal:** Get development environment ready

- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies (React, Mantine, Biome)
- [ ] Setup PostCSS configuration for Mantine
- [ ] Setup MantineProvider in main.tsx
- [ ] Setup Biome configuration
- [ ] Setup Supabase project + get connection string
- [ ] Setup Drizzle + define schema
- [ ] Run migrations
- [ ] Create basic routing (Dashboard, CheckChanges, Enhance)
- [ ] Setup environment variables

**Deliverable:** Project runs locally with routing and Mantine theme

---

### Phase 2: Database & Core Functions (Day 2)
**Goal:** Backend logic without UI

- [ ] Create Drizzle schema (3 tables)
- [ ] Setup database client
- [ ] Write core queries:
  - Get documents
  - Create pending update
  - Save enhancement history
- [ ] Create Confluence API client (get page content)
- [ ] Create Gemini API client (enhance text)
- [ ] Create Notion API client (update page)
- [ ] Test API clients manually (no UI yet)

**Deliverable:** All APIs work via console/Postman

---

### Phase 3: Dashboard & Document Setup (Day 3)
**Goal:** Manage documents in UI

**Tasks:**
- [ ] Create Dashboard page
- [ ] Add "Add Document" form:
  - Confluence URL input
  - Notion Page ID input
  - Document name input
- [ ] Display document cards
- [ ] Add "Check for Changes" button per document
- [ ] Store documents in Supabase
- [ ] Use Zustand for client state

**Deliverable:** Can add documents and list them

---

### Phase 4: Change Detection (Day 4)
**Goal:** Detect and display changes

**Tasks:**
- [ ] Create `/api/confluence-check` endpoint
- [ ] Implement change detection logic:
  - Fetch latest Confluence version
  - Compare with last known version
  - Extract changed content
- [ ] Create CheckChanges page
- [ ] Integrate react-diff-viewer-continued
- [ ] Display side-by-side diff
- [ ] Add "Skip" and "Enhance" buttons
- [ ] Save pending update to database

**Deliverable:** Can see what changed in Confluence

---

### Phase 5: Enhancement UI (Day 5-6)
**Goal:** 2-column enhancement interface

**Tasks:**
- [ ] Create EnhanceDocument page
- [ ] Implement 2-column layout:
  - Left: Source changes
  - Right: AI enhanced preview
- [ ] Add instruction input per change (optional)
- [ ] Create `/api/enhance-document` endpoint
- [ ] Integrate Gemini API
- [ ] Generate enhanced content with AI
- [ ] Display enhanced preview
- [ ] Add "Edit" capability for AI output
- [ ] Add "Approve & Apply" button

**Deliverable:** Full enhancement workflow works

---

### Phase 6: Apply to Notion (Day 7)
**Goal:** Update Notion with enhanced content

**Tasks:**
- [ ] Create `/api/apply-to-notion` endpoint
- [ ] Parse enhanced content to Notion blocks
- [ ] Update Notion page via API
- [ ] Append change log to Notion
- [ ] Save to enhancement_history table
- [ ] Show success confirmation
- [ ] Link to updated Notion page

**Deliverable:** End-to-end flow complete

---

### Phase 7: Polish & Deploy (Day 7-8)
**Goal:** Production-ready MVP

**Tasks:**
- [ ] Add loading states (use Mantine's Loader component)
- [ ] Add error handling
- [ ] Add success/error notifications (Mantine notifications)
- [ ] Improve UI styling and responsiveness
- [ ] Add empty states (use Mantine's Empty/Text components)
- [ ] Test entire flow multiple times
- [ ] Setup Vercel deployment
- [ ] Configure environment variables in Vercel
- [ ] Deploy to production
- [ ] Test on production

**Deliverable:** App is live and usable

---

## Setup Instructions

### 1. Initialize Project

```bash
# Create Vite project
npm create vite@latest doc-enhancer -- --template react-ts
cd doc-enhancer

# Install dependencies
npm install

# Install UI dependencies
npm install react-router-dom zustand @tanstack/react-query
npm install react-diff-viewer-continued diff

# Install Mantine (core + hooks + form + notifications)
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications
npm install @tabler/icons-react

# PostCSS for Mantine (required)
npm install -D postcss postcss-preset-mantine postcss-simple-vars

# Install Biome
npm install --save-dev --save-exact @biomejs/biome
npx @biomejs/biome init

# Install database tools
npm install drizzle-orm postgres @supabase/supabase-js
npm install -D drizzle-kit

# Install utilities
npm install date-fns
```

### 2. Configure Biome

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  }
}
```

### 3. Configure Mantine

```typescript
// postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};
```

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
```

### 4. Setup Supabase

1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Add to `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Setup Drizzle

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 6. Define Schema & Run Migration

```bash
# Generate migration
npx drizzle-kit generate

# Run migration
npx drizzle-kit migrate
```

### 7. Get API Keys

**Confluence:**
- Settings > Personal Access Tokens
- Create token with READ permissions

**Notion:**
- https://www.notion.so/my-integrations
- Create integration
- Get Internal Integration Token
- Share your page with the integration

**Gemini:**
- https://makersuite.google.com/app/apikey
- Create API key (free)

Add to `.env.local`:

```env
CONFLUENCE_TOKEN=your-token
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
NOTION_TOKEN=secret_xxx
GEMINI_API_KEY=your-key
```

## Code Examples

### Mantine Components Usage

```typescript
// Example: Dashboard with Mantine
import { AppShell, Card, Button, Grid, Text, Badge } from '@mantine/core';
import { IconRefresh, IconPlus } from '@tabler/icons-react';

function Dashboard() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Text size="xl" fw={700} p="md">Doc Enhancer</Text>
      </AppShell.Header>
      
      <AppShell.Main>
        <Grid>
          <Grid.Col span={4}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text fw={500} size="lg">Technical Spec</Text>
              <Text size="sm" c="dimmed" mt="xs">
                Confluence: v47 | Notion: Updated 2 days ago
              </Text>
              <Badge color="green" variant="light" mt="md">Up to date</Badge>
              <Button 
                leftSection={<IconRefresh size={16} />}
                variant="light" 
                fullWidth 
                mt="md"
              >
                Check for Changes
              </Button>
            </Card>
          </Grid.Col>
        </Grid>
        
        <Button 
          leftSection={<IconPlus size={16} />}
          mt="xl"
        >
          Add Document
        </Button>
      </AppShell.Main>
    </AppShell>
  );
}
```

```typescript
// Example: Form with Mantine
import { Modal, TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

function AddDocumentModal({ opened, onClose }) {
  const form = useForm({
    initialValues: {
      name: '',
      confluenceUrl: '',
      notionPageId: '',
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Name is required' : null),
      confluenceUrl: (value) => 
        !value.startsWith('http') ? 'Must be a valid URL' : null,
      notionPageId: (value) => 
        (value.length < 1 ? 'Notion Page ID is required' : null),
    },
  });

  const handleSubmit = async (values) => {
    try {
      await createDocument(values);
      notifications.show({
        title: 'Success',
        message: 'Document added successfully',
        color: 'green',
      });
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add document',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add Document">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Document Name"
            placeholder="Technical Specification"
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Confluence URL"
            placeholder="https://..."
            {...form.getInputProps('confluenceUrl')}
          />
          <TextInput
            label="Notion Page ID"
            placeholder="abc123..."
            {...form.getInputProps('notionPageId')}
          />
          <Button type="submit" fullWidth>
            Add Document
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
```

```typescript
// Example: 2-Column Enhancement Layout
import { Grid, Card, Textarea, Button, Text, Accordion } from '@mantine/core';
import { IconSparkles, IconCheck } from '@tabler/icons-react';

function EnhancementLayout() {
  return (
    <Grid>
      {/* Left Column - Source Changes */}
      <Grid.Col span={6}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" fw={500} mb="md">Source Changes</Text>
          
          <Accordion>
            <Accordion.Item value="change-1">
              <Accordion.Control>
                <Text fw={500}>Change #1: Authentication</Text>
                <Text size="sm" c="dimmed">Session timeout updated</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" c="dimmed">Old: 30 minutes</Text>
                <Text size="sm">New: 60 minutes</Text>
                
                <Textarea
                  label="Your instruction (optional)"
                  placeholder="Explain why this is better for users..."
                  mt="md"
                  minRows={3}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          
          <Button 
            leftSection={<IconSparkles size={16} />}
            fullWidth 
            mt="md"
          >
            Generate Enhancement
          </Button>
        </Card>
      </Grid.Col>
      
      {/* Right Column - AI Enhanced Preview */}
      <Grid.Col span={6}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" fw={500} mb="md">Enhanced Version</Text>
          
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {/* AI generated content here */}
          </Text>
          
          <Button 
            leftSection={<IconCheck size={16} />}
            color="green"
            fullWidth 
            mt="md"
          >
            Approve & Apply to Notion
          </Button>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
```

### Drizzle Schema

```typescript
// src/lib/db/schema.ts
import { pgTable, serial, text, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  confluenceUrl: text('confluence_url').notNull(),
  notionPageId: text('notion_page_id').notNull(),
  lastConfluenceVersion: integer('last_confluence_version').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pendingUpdates = pgTable('pending_updates', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id),
  confluenceVersion: integer('confluence_version'),
  oldContent: text('old_content'),
  newContent: text('new_content'),
  changesJson: text('changes_json'),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const enhancementHistory = pgTable('enhancement_history', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id),
  version: integer('version'),
  enhancedContent: text('enhanced_content'),
  changesSummary: text('changes_summary'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Zustand Store

```typescript
// src/store/documentStore.ts
import { create } from 'zustand';

interface Document {
  id: number;
  name: string;
  confluenceUrl: string;
  notionPageId: string;
}

interface DocumentStore {
  documents: Document[];
  currentDocument: Document | null;
  setDocuments: (docs: Document[]) => void;
  setCurrentDocument: (doc: Document) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  currentDocument: null,
  setDocuments: (docs) => set({ documents: docs }),
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
}));
```

### Vercel Function Example

```typescript
// api/enhance-document.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enhanceDocumentCore } from './core/enhance-document';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await enhanceDocumentCore(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Enhancement error:', error);
    return res.status(500).json({ error: 'Enhancement failed' });
  }
}
```

### Core Function (Portable)

```typescript
// api/core/enhance-document.ts
import { callGemini } from '../../src/lib/api/gemini';

export async function enhanceDocumentCore(body: {
  documentId: number;
  changes: string;
  instructions?: string[];
}) {
  const { changes, instructions } = body;

  const prompt = `
You are enhancing a technical specification document.

Original changes from Confluence:
${changes}

${instructions?.length ? `User instructions:\n${instructions.join('\n')}` : ''}

Task: Enhance these changes by:
1. Adding implementation details
2. Including code examples where relevant
3. Clarifying technical concepts
4. Maintaining the same structure

Output the enhanced content in Notion markdown format.
  `.trim();

  const enhancedContent = await callGemini(prompt);

  return {
    enhancedContent,
    summary: 'Enhanced with AI assistance',
  };
}
```

## Key Implementation Notes

### Keep It Simple
- No over-engineering
- No premature abstractions
- Core functions in `/api/core` for portability
- Direct Vercel wrappers for now
- Refactor to Cloudflare later if needed

### Error Handling
```typescript
// Simple try-catch everywhere
try {
  const result = await someFunction();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('User-friendly message');
}
```

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

async function handleAction() {
  setIsLoading(true);
  try {
    await doSomething();
  } finally {
    setIsLoading(false);
  }
}
```

## Success Criteria

MVP is complete when:
- ✅ Can add documents (Confluence + Notion links)
- ✅ Can detect changes from Confluence
- ✅ Can view side-by-side diff
- ✅ Can add instructions for enhancement
- ✅ AI generates enhanced version
- ✅ Can review and edit AI output
- ✅ Can apply to Notion successfully
- ✅ Version history is saved
- ✅ Deployed to Vercel and accessible

## Future Enhancements (Post-MVP)

### Phase 2 Features
- Background polling (TanStack Query refetchInterval)
- Style guide management UI
- Text selection + inline instructions
- Slack notifications
- Rollback capability

### Phase 3 Features
- Multi-document batch processing
- Template system for common patterns
- Analytics dashboard
- AI confidence scoring
- Partial apply (some sections)

### Cloudflare Migration
When Vercel limits reached:
1. Copy `/api/core` functions
2. Create Cloudflare Workers wrappers
3. Update API base URL in frontend
4. Deploy to Cloudflare Pages + Workers

---

## Getting Started

1. **Setup environment:**
   ```bash
   git clone <repo>
   cd doc-enhancer
   npm install
   cp .env.example .env.local
   # Fill in API keys
   ```

2. **Run migrations:**
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Access app:**
   - Frontend: http://localhost:5173
   - Vercel Functions: http://localhost:5173/api/*

---

## Important Commands

```bash
# Development
npm run dev                    # Start dev server

# Database
npx drizzle-kit generate       # Generate migration
npx drizzle-kit migrate        # Run migration
npx drizzle-kit studio         # Visual database browser

# Linting/Formatting
npx biome check --write        # Format & fix issues
npx biome check                # Check only

# Build
npm run build                  # Build for production
npm run preview                # Preview production build

# Deploy
vercel                         # Deploy to Vercel
```

---

**Remember:** Focus on getting MVP working first. Optimize and refactor later!