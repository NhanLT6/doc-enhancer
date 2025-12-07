# Doc Enhancer - AI Documentation Enhancement Tool

## Project Overview

Doc Enhancer is a web application that helps enhance documentation using AI. It allows users to upload documents (from Confluence or local files), select text, and use AI to improve, clarify, or modify the content with custom prompts. The app uses AI-powered metadata extraction to maintain consistency with the document's original style and tone.

## Tech Stack

### Frontend
- **React 19.2.1** - UI framework
- **TypeScript** - Type safety
- **Vite 7.2.6** - Build tool and dev server
- **Mantine UI v8** - Component library
  - @mantine/core - Core components
  - @mantine/notifications - Toast notifications
  - @mantine/modals - Modal dialogs
- **Tiptap** - Rich text editor with WYSIWYG capabilities
  - @tiptap/react - React integration
  - @tiptap/starter-kit - Core extensions
  - @tiptap/extension-bubble-menu - Floating toolbar for text selection
  - @tiptap/extension-table - Table support
  - @tiptap/extension-image - Image support
  - @tiptap/extension-link - Link support
- **React Diff Viewer** - Show differences between original and enhanced text
- **Marked** - Markdown to HTML conversion (for .md file imports)

### Backend (Serverless)
- **Vercel Functions** - Serverless API endpoints
- **AI SDK (Vercel)** - AI integration
- **Google Gemini AI** - AI models for text enhancement, PDF conversion, and document analysis
  - gemini-2.5-flash - Main model for all operations
- **Sharp** - Image compression (Node.js)
- **pdf.js** - PDF parsing and image extraction

### Storage
- **localStorage** - Client-side document storage
- **Content Format**: Tiptap JSON (converted from HTML during import)
- **Metadata**: AI-extracted document characteristics for context-aware enhancements

## Project Structure

```
doc-enhancer/
├── api/                          # Vercel serverless functions
│   ├── analyze-document.ts       # Extract document metadata using AI
│   ├── confluence-fetch.ts       # Fetch content from Confluence (HTML)
│   ├── enhance-content.ts        # AI text enhancement with metadata awareness
│   └── pdf-to-html.ts            # Convert PDF to HTML with embedded images
│
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AddDocumentModal.tsx    # Modal for adding documents (File first, then Confluence)
│   │   │   └── DocumentCard.tsx        # Document card with metadata badge
│   │   │
│   │   ├── editor/
│   │   │   └── TiptapEditor.tsx        # Tiptap editor component (basic)
│   │   │
│   │   └── enhancement/
│   │       ├── DocumentEnhancement.tsx     # Main document editor with BubbleMenu
│   │       └── EnhancementSidePanel.tsx    # Side panel for custom enhancement
│   │
│   ├── lib/
│   │   ├── api-client.ts         # API client functions
│   │   ├── content-converters.ts # HTML/Markdown/Tiptap conversion utilities
│   │   ├── mockData.ts           # Mock data for development
│   │   ├── settings.ts           # Settings management (Confluence credentials)
│   │   ├── storage.ts            # localStorage wrapper for documents
│   │   ├── tiptap-config.ts      # Tiptap extensions configuration
│   │   └── tiptap-helpers.ts     # Tiptap utility functions
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx         # Main dashboard page
│   │   ├── Settings.tsx          # Settings page
│   │   └── TiptapTest.tsx        # Test page for Tiptap features
│   │
│   ├── App.tsx                   # Root app component with routing
│   ├── main.tsx                  # App entry point with providers
│   └── vite-env.d.ts            # Vite type definitions
│
├── public/                       # Static assets
├── .env                         # Environment variables (GOOGLE_GENERATIVE_AI_API_KEY)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── vercel.json                  # Vercel deployment configuration
└── MIGRATION_PLAN.md            # Markdown to Tiptap migration plan
```

## Key Features & Implementation

### 1. Document Management
- **Location**: `src/pages/Dashboard.tsx`, `src/components/dashboard/`
- **Storage**: `src/lib/storage.ts` (localStorage)
- **Features**:
  - Add documents from local files (.txt, .md, .pdf) - **First tab**
  - Add documents from Confluence - **Second tab**
  - PDF to HTML conversion with embedded images
  - AI-powered metadata extraction on import
  - Delete documents with confirmation modal
  - Metadata badge showing "Ready (AI Analyzed)" when metadata is available

### 2. Document Metadata Extraction
- **API**: `api/analyze-document.ts`
- **Features**:
  - **Summary**: 3-5 sentence summary of document purpose and audience
  - **Style Guide**:
    - Tone (e.g., "formal technical", "conversational")
    - Vocabulary (domain-specific terms used consistently)
    - Perspective (first-person, third-person, imperative)
    - Technical level (beginner, intermediate, expert)
    - Common patterns (recurring sentence structures)
  - **Key Terms**: Technical terms, product names, acronyms to preserve
  - **Document Type**: Classification (API docs, user guide, etc.)
- **Purpose**: Enables context-aware AI enhancements that maintain document consistency

### 3. PDF Processing
- **API**: `api/pdf-to-html.ts`
- **Features**:
  - Extract text and images from PDF
  - Convert to HTML using Gemini AI
  - Compress images using Sharp (JPEG quality 80)
  - Embed images directly as `<img>` tags with base64 data URIs
  - No placeholders - images are part of the HTML
  - Proper HTML structure (headings, lists, tables, paragraphs)

### 4. Confluence Import
- **API**: `api/confluence-fetch.ts`
- **Features**:
  - Fetches raw HTML from Confluence storage format
  - Sanitizes HTML for Tiptap compatibility
  - Removes script tags, event handlers, unsafe attributes
  - Preserves tables, lists, images, and formatting
  - No conversion to markdown - HTML all the way

### 5. Text File Import
- **Converters**: `src/lib/content-converters.ts`
- **.md files**: Converts markdown to HTML using marked library
- **.txt files**: Wraps each line in `<p>` tags to create HTML
- All formats → HTML → Tiptap JSON → Storage

### 6. Text Enhancement with Metadata
- **Strategy**: "Marked Local Context" with HTML
- **API**: `api/enhance-content.ts`
- **Features**:
  - Sends full document HTML for context (cacheable)
  - Sends parent node HTML with `<target>` tags for precise selection
  - **NEW**: Sends document metadata for context-aware enhancement
  - AI maintains document's tone, perspective, and vocabulary
  - AI preserves key terms exactly as they appear
  - AI can expand selection for grammatical completeness
  - Returns `{ action: 'replace', newHtml: string }`
  - Preserves HTML structure (tables, lists, formatting)

### 7. Tiptap Editor
- **Location**: `src/components/enhancement/DocumentEnhancement.tsx`
- **Features**:
  - **WYSIWYG editing** with native table, image, and link support
  - **BubbleMenu**: Floating toolbar appears on text selection
    - "Auto Enhance" - Quick enhancement with AI
    - "Custom Enhance" - Opens side panel for custom instructions
  - **Native rendering**: Tables, images, links render directly (no placeholders)
  - **Editable**: Full editing capabilities
  - **State**: Stores content as Tiptap JSON, converts to HTML for API calls

### 8. Enhancement Side Panel
- **Location**: `src/components/enhancement/EnhancementSidePanel.tsx`
- **Features**:
  - Custom prompt input for specific enhancement requests
  - Conversation history tracking
  - HTML diff viewer showing before/after comparison
  - Follow-up questions supported
  - Accept/Reject enhancement options
  - Uses document metadata for consistent enhancements

## Data Models

### Document (src/lib/storage.ts)
```typescript
interface Document {
  id: string;
  name: string;
  confluenceUrl: string;
  content: any; // Tiptap JSON format - stores rich content with embedded images
  metadata?: DocumentMetadata; // AI-generated metadata for context-aware enhancements
  createdAt: string;
  updatedAt: string;
}
```

### DocumentMetadata
```typescript
interface DocumentMetadata {
  summary: string; // 3-5 sentence summary
  styleGuide: {
    tone: string; // e.g., "formal technical", "conversational"
    vocabulary: string[]; // 10-15 domain-specific terms
    perspective: string; // "first-person", "third-person", "imperative"
    technicalLevel: string; // "beginner", "intermediate", "expert"
    commonPatterns: string[]; // Recurring sentence structures
  };
  keyTerms: string[]; // Important terms to preserve exactly
  documentType: string; // e.g., "API documentation", "user guide"
}
```

### EnhancementRecord
```typescript
interface EnhancementRecord {
  id: string;
  documentId: string;
  originalContent: any; // Tiptap JSON
  enhancedContent: any; // Tiptap JSON
  instructions: string;
  createdAt: string;
}
```

## API Endpoints

### POST /api/analyze-document
Extract document metadata using Gemini AI.

**Request:**
```typescript
{
  fullDocumentHtml: string;
  documentName?: string;
}
```

**Response:**
```typescript
{
  summary: string;
  styleGuide: {
    tone: string;
    vocabulary: string[];
    perspective: string;
    technicalLevel: string;
    commonPatterns: string[];
  };
  keyTerms: string[];
  documentType: string;
  model: string;
}
```

### POST /api/confluence-fetch
Fetch content from Confluence page (returns sanitized HTML).

**Request:**
```typescript
{
  confluenceUrl: string;
  confluenceToken: string;
  confluenceEmail: string;
}
```

**Response:**
```typescript
{
  content: string;    // Sanitized HTML
  title: string;
  version: number;
  lastModified: string;
}
```

### POST /api/pdf-to-html
Convert PDF to HTML with embedded images.

**Request:**
```typescript
{
  fileData: string;   // Base64 encoded PDF
  fileName: string;
}
```

**Response:**
```typescript
{
  html: string;          // HTML with <img> tags (base64 embedded)
  imageCount: number;
  model: string;
}
```

### POST /api/enhance-content
Enhance selected text using Marked Local Context strategy with metadata awareness.

**Request:**
```typescript
{
  fullDocumentHtml: string;              // Entire document for context
  targetBlockHtml: string;               // Parent node with <target> tags
  instructions?: string;                 // Custom user prompt
  documentName?: string;
  metadata?: DocumentMetadata;           // AI-extracted document characteristics
}
```

**Response:**
```typescript
{
  action: 'replace';
  newHtml: string;                // Enhanced HTML (preserves structure)
  model: string;
}
```

## Content Flow Pipeline

```
Import Flow:
PDF/Confluence/.md/.txt → HTML → Tiptap JSON → Storage
                                        ↓
                                  AI Analysis
                                        ↓
                                    Metadata

Enhancement Flow:
User selects text → Extract HTML context → Send to API with metadata
                                                    ↓
                              AI enhances (maintains style/tone)
                                                    ↓
                              Returns enhanced HTML → Replace in editor
```

## Important Implementation Details

### Content Format Evolution
- **Old**: Markdown with `{{IMAGE_N}}` placeholders
- **New**: Tiptap JSON (from HTML) with images embedded as `<img>` tags
- **Migration**: Completed - all legacy markdown code removed

### Text Selection & Enhancement
- Uses Tiptap's selection API to get selected text and parent node
- Converts selection to HTML with `<target>` tags
- Sends to API with full document HTML and metadata
- AI returns enhanced HTML
- Replacement happens using Tiptap's `insertContentAt()` command

### Image Handling
- **PDFs**: Images extracted, compressed, embedded as base64 `<img>` tags in HTML
- **Confluence**: Images included in HTML response
- **Rendering**: Tiptap natively renders `<img>` tags, no special handling needed
- **Storage**: All images embedded in Tiptap JSON structure

### Metadata Usage
- Extracted automatically on document import
- Passed to enhancement API for every enhancement request
- Ensures AI maintains:
  - Original document tone and perspective
  - Consistent vocabulary and terminology
  - Appropriate technical level
  - Key terms preserved exactly

### Caching Strategy
- Gemini API can use `cacheControl: true` for system messages
- Full document HTML cached for performance
- Reduces API costs for repeated enhancement requests
- Metadata cached in localStorage with document

## Development Commands

```bash
# Install dependencies
pnpm install

# Run frontend dev server (http://localhost:5173)
pnpm dev

# Run Vercel functions locally (http://localhost:3000)
pnpm dev:vercel

# Build for production
pnpm build

# Type check
pnpm type-check

# Lint and format
pnpm lint
pnpm lint:fix
pnpm format
```

## Environment Variables

Required in `.env`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Migration Notes

**Last Major Migration**: Markdown → Tiptap HTML Editor (Completed 2025-12-07)

**Changes Made**:
- Replaced ReactMarkdown with Tiptap editor
- Migrated from markdown placeholders to HTML with embedded images
- Added AI-powered metadata extraction for context-aware enhancements
- Updated all APIs to work with HTML instead of markdown
- Removed 101 deprecated dependencies (react-markdown, remark-gfm, turndown, zustand, diff)
- Deleted legacy components (FloatingEnhanceMenu, InlineEnhancementDoc, EnhancementLayout)
- Simplified component architecture (merged multiple components into DocumentEnhancement)

**Why Tiptap**:
- Native table, image, and rich formatting support
- WYSIWYG editing experience
- Better integration with HTML-based APIs
- Eliminates need for markdown placeholders
- More maintainable and modern

**Why Metadata**:
- Maintains document consistency across enhancements
- AI understands document style, tone, and vocabulary
- Preserves technical terminology and key terms
- Improves enhancement quality significantly
- Automated - no manual configuration needed

## Maintenance Notes

**Last Updated**: 2025-12-07

**Recent Changes**:
- **Phase 1-4**: Migrated from markdown to Tiptap HTML editor
- **Phase 5**: Updated all document imports to HTML, added metadata extraction
- **Phase 6**: Cleaned up legacy components and dependencies
- Switched tab order in AddDocumentModal (file upload first)
- Enhanced DocumentCard to show metadata badge
- Updated all components to pass metadata to enhancement API

**TODO**:
- [ ] Implement "Check Changes" functionality for Confluence sync
- [ ] Add undo/redo tracking for enhancements
- [ ] Export enhanced documents (HTML, PDF, Markdown)
- [ ] Support for more file formats (DOCX, RTF)
- [ ] Batch enhancement operations
- [ ] Enhancement history viewer
