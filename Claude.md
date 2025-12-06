# Doc Enhancer - AI Documentation Enhancement Tool

## Project Overview

Doc Enhancer is a web application that helps enhance documentation using AI. It allows users to upload documents (from Confluence or local files), select text, and use AI to improve, clarify, or modify the content with custom prompts.

## Tech Stack

### Frontend
- **React 19.2.1** - UI framework
- **TypeScript** - Type safety
- **Vite 7.2.6** - Build tool and dev server
- **Mantine UI v8** - Component library
  - @mantine/core - Core components
  - @mantine/notifications - Toast notifications
  - @mantine/modals - Modal dialogs
- **React Markdown** - Markdown rendering
- **React Diff Viewer** - Show differences between original and enhanced text

### Backend (Serverless)
- **Vercel Functions** - Serverless API endpoints
- **AI SDK (Vercel)** - AI integration
- **Google Gemini AI** - AI model for text enhancement and PDF conversion
  - gemini-2.0-flash - Main model
  - gemini-2.0-flash-exp - Experimental with caching
- **Sharp** - Image compression (Node.js)
- **pdf.js** - PDF parsing and image extraction

### Storage
- **localStorage** - Client-side document storage

## Project Structure

```
doc-enhancer/
├── api/                          # Vercel serverless functions
│   ├── confluence-fetch.ts       # Fetch content from Confluence
│   ├── enhance-content.ts        # AI text enhancement (Marked Local Context)
│   └── pdf-to-markdown.ts        # Convert PDF to markdown with image extraction
│
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AddDocumentModal.tsx    # Modal for adding documents (Confluence/File)
│   │   │   └── DocumentCard.tsx        # Document card with actions (enhance, delete)
│   │   │
│   │   └── enhancement/
│   │       ├── EnhancementLayout.tsx       # Main layout wrapper
│   │       ├── InlineEnhancementDoc.tsx    # Document viewer with enhancement UI
│   │       ├── EnhancementSidePanel.tsx    # Side panel for custom enhancement
│   │       └── FloatingEnhanceMenu.tsx     # Floating menu on text selection
│   │
│   ├── lib/
│   │   ├── api-client.ts         # API client functions (fetchFromConfluence, enhanceContent, etc.)
│   │   ├── markdown.ts           # Markdown conversion utilities
│   │   ├── mockData.ts           # Mock data for development
│   │   ├── settings.ts           # Settings management (Confluence credentials)
│   │   └── storage.ts            # localStorage wrapper for documents
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx         # Main dashboard page
│   │   └── Settings.tsx          # Settings page
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
└── vercel.json                  # Vercel deployment configuration
```

## Key Features & Implementation

### 1. Document Management
- **Location**: `src/pages/Dashboard.tsx`, `src/components/dashboard/`
- **Storage**: `src/lib/storage.ts` (localStorage)
- **Features**:
  - Add documents from Confluence
  - Upload local files (.txt, .md, .pdf)
  - PDF to markdown conversion with image extraction
  - Delete documents with confirmation modal

### 2. PDF Processing
- **API**: `api/pdf-to-markdown.ts`
- **Features**:
  - Extract text and images from PDF
  - Convert to markdown using Gemini AI
  - Compress images using Sharp (JPEG quality 80)
  - Return images separately from markdown
  - Image placeholders: `{{IMAGE_0}}`, `{{IMAGE_1}}`, etc.

### 3. Text Enhancement
- **Strategy**: "Marked Local Context"
- **API**: `api/enhance-content.ts`
- **Features**:
  - Send full document for context (cached)
  - Send paragraph with `<target>` tags for precise selection
  - AI can expand selection for grammatical completeness
  - Returns `{ originalTextToReplace, newText }`
  - Supports custom prompts and questions

### 4. Image Rendering
- **Location**: `src/components/enhancement/InlineEnhancementDoc.tsx`
- **Implementation**:
  - Images stored separately in `Document.images[]`
  - Custom ReactMarkdown paragraph component
  - Renders `{{IMAGE_N}}` placeholders as actual images
  - Base64 data URIs for self-contained storage

## API Endpoints

### POST /api/confluence-fetch
Fetch content from Confluence page.

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
  content: string;    // HTML content
  title: string;
  version: number;
  lastModified: string;
}
```

### POST /api/pdf-to-markdown
Convert PDF to markdown with image extraction.

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
  markdown: string;        // Markdown with {{IMAGE_N}} placeholders
  images: Array<{
    data: string;          // Base64 data URI
    alt: string;
    width: number;
    height: number;
  }>;
  model: string;
  imageCount: number;
}
```

### POST /api/enhance-content
Enhance selected text using Marked Local Context strategy.

**Request:**
```typescript
{
  fullDocument: string;              // Entire document for context
  paragraphWithSelection: string;    // Paragraph with <target> tags
  selectedText: string;              // The selected text
  instructions?: string;             // Custom user prompt
  documentName?: string;
}
```

**Response:**
```typescript
{
  originalTextToReplace: string;  // May be expanded from selection
  newText: string;                // Enhanced version
  model: string;
}
```

## Data Models

### Document (src/lib/storage.ts)
```typescript
interface Document {
  id: string;
  name: string;
  confluenceUrl: string;
  lastFetchedContent: string;      // Markdown with placeholders
  images?: DocumentImage[];         // Extracted images
  createdAt: string;
  updatedAt: string;
}
```

### DocumentImage
```typescript
interface DocumentImage {
  data: string;      // Base64 data URI (e.g., "data:image/jpeg;base64,...")
  alt: string;
  width: number;
  height: number;
}
```

## Important Implementation Details

### Text Selection & Enhancement
- Uses `innerText` to get rendered text (without markdown symbols)
- Finds selection in rendered content, extracts surrounding paragraph
- Sends plain text to API (not markdown)
- AI returns enhanced plain text
- Replacement happens in both markdown and rendered view

### Image Handling
- PDFs: Images extracted during conversion, compressed to JPEG
- Stored separately from markdown content
- Rendered using custom ReactMarkdown components
- Placeholders automatically cleaned up if Gemini creates extras

### Caching Strategy
- Gemini API uses `cacheControl: true` for system message
- Full document context cached for performance
- Reduces API costs for repeated enhancement requests

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
```

## Environment Variables

Required in `.env`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Known Issues & Solutions

### Issue: Image placeholders showing as text
- **Cause**: Mismatch between placeholder format
- **Solution**: Use `{{IMAGE_N}}` format consistently (not `{{IMG_N}}`)

### Issue: Wrong text selected in side panel
- **Cause**: Markdown symbols in source vs rendered text
- **Solution**: Use `innerText` for selection, work with plain text

### Issue: Too many image placeholders
- **Cause**: Gemini creating placeholders for page breaks
- **Solution**: Validation and cleanup in `api/pdf-to-markdown.ts`

## Instructions for AI Assistants

### When Adding New Files
1. Add the file to the appropriate section in this document
2. Include its purpose and key features
3. Update the directory tree if it's a new directory

### When Removing Files
1. Remove the file from this document
2. Update any references to it
3. Update the directory tree if directory is empty

### When Moving Files
1. Update the file path in this document
2. Update the directory tree
3. Update any import path examples

### When Adding New Features
1. Document the feature in the "Key Features" section
2. Add any new API endpoints to the "API Endpoints" section
3. Update data models if schemas change

## Maintenance Notes

**Last Updated**: 2025-12-06

**Recent Changes**:
- Implemented Marked Local Context enhancement strategy
- Added image extraction and compression for PDFs
- Replaced browser confirm with Mantine modals
- Fixed text selection offset calculation
- Added placeholder validation and cleanup

**TODO**:
- [ ] Implement "Check Changes" functionality for Confluence sync
- [ ] Add undo/redo for enhancements
- [ ] Export enhanced documents
- [ ] Support for more file formats
