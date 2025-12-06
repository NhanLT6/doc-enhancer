# Gemini API Integration Guide (2025 Updated)

Complete guide for integrating Google's Gemini AI into the Doc Enhancer application.

**Last Updated**: December 5, 2025
**Status**: Content enhancement ✅ | PDF conversion 🚧

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating API Key](#creating-api-key)
3. [Understanding Gemini API](#understanding-gemini-api)
4. [Our Use Cases](#our-use-cases)
5. [API Implementation](#api-implementation)
6. [Best Practices](#best-practices)
7. [Rate Limits & Pricing](#rate-limits--pricing)

---

## Getting Started

### What is Gemini?

Gemini is Google's most advanced AI model family (2025), offering:
- **Multimodal capabilities**: Text, images, PDFs (**up to 1000 pages**), audio, video
- **Long context window**: Up to 2M tokens (Gemini 1.5 Pro/2.5 Pro)
- **Latest Models**: Gemini 3 Pro (newest), Gemini 2.5 Pro/Flash, Gemini 2.0 Flash
- **Free tier**: Gemini 3 Pro **FREE** in AI Studio + 1,500 requests/day for 2.0 Flash
- **File API**: Store up to 20GB per project, 2GB per file (48-hour retention)

### Why Gemini for Doc Enhancer?

1. **Native PDF Support**: Process PDFs up to **1000 pages** with text, images, tables, charts (no OCR needed!)
2. **Free Tier**: Gemini 3 Pro completely **FREE** + 1,500 req/day for 2.0 Flash
3. **Fast Performance**: Gemini 2.5 Flash optimized for speed and cost-efficiency
4. **Markdown Output**: Excellent at generating structured markdown from any source
5. **Large Context**: Handle entire documentation pages and long PDFs in one request
6. **Production Ready**: Many developers report **$0 bills** even with thousands of requests!

---

## Creating API Key

### Step 1: Visit Google AI Studio

1. Go to [https://aistudio.google.com](https://aistudio.google.com/)
2. Sign in with your Google account
3. **Accept Terms of Service** for Generative AI when prompted

**Note**: Google AI Studio automatically creates a default Google Cloud Project and API Key for you!

### Step 2: Get API Key

1. Locate **"Get API key"** button in the left sidebar (or click the key icon 🔑)
2. You'll see two options:
   - ✅ **Create API key in new project** (recommended for new users)
   - **Select existing project** (if you have one)
3. Click your preferred option
4. Google automatically generates your API key
5. **Copy your API key** (format: `AIzaSyB...`)

**Important Policy Change (April 29, 2025)**:
New projects without prior Gemini 1.5 usage are encouraged to use newer models (2.0, 2.5, 3.0). This is great for us as newer models are better!

### Step 3: Add to Environment Variables

#### For Development (.env.local):

Create `.env.local` file in the project root:

```bash
# Gemini AI API
GEMINI_API_KEY=AIzaSyB...your-api-key-here
```

#### For Vercel Production:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your API key
   - **Environment**: Production, Preview, Development (select all)

### Step 4: Secure Your API Key

⚠️ **IMPORTANT SECURITY NOTES:**

- ✅ **DO**: Store in environment variables (server-side only)
- ✅ **DO**: Add `.env.local` to `.gitignore`
- ✅ **DO**: Use server-side API routes (Vercel Functions)
- ✅ **DO**: Set `GEMINI_API_KEY` or `GOOGLE_API_KEY` env var (auto-detected by SDK)
- ❌ **DON'T**: Expose in client-side code (NEVER!)
- ❌ **DON'T**: Commit to Git
- ❌ **DON'T**: Share publicly or in screenshots

---

## Understanding Gemini API

### Available Models (2025)

| Model | Use Case | Speed | Context | Cost | Status |
|-------|----------|-------|---------|------|--------|
| **`gemini-3-pro`** | Latest, most powerful multimodal | ⚡⚡⚡ | 2M tokens | **FREE** (AI Studio) | ✨ Newest (2025) |
| `gemini-2.5-pro` | State-of-the-art, thinking model | ⚡⚡ | 2M tokens | Pay-as-you-go | Production |
| `gemini-2.5-flash` | Best price-performance | ⚡⚡⚡ | 1M tokens | Pay-as-you-go | **Recommended** |
| `gemini-2.5-flash-lite` | Fastest, high throughput | ⚡⚡⚡⚡ | 1M tokens | Pay-as-you-go | Cost-efficient |
| `gemini-2.0-flash` | Fast with native tool use | ⚡⚡⚡ | 1M tokens | **1,500/day free** | Production |
| `gemini-1.5-flash` | General purpose | ⚡⚡ | 1M tokens | Free tier + paid | Stable |
| `gemini-1.5-pro` | Complex reasoning | ⚡ | 2M tokens | $1.25/$5 per 1M | Stable |

**Recommendation for Doc Enhancer**:
- **Development**: `gemini-2.0-flash` (1,500 free requests/day)
- **Production (low volume)**: `gemini-2.5-flash` (best price-performance)
- **Production (high volume)**: `gemini-2.5-flash-lite` (fastest)
- **Experimentation**: `gemini-3-pro` (free in AI Studio)

### API Endpoint

```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
```

### Request Structure

```typescript
{
  "contents": [
    {
      "parts": [
        { "text": "Your prompt here" }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 8192,
    "topP": 0.95,
    "topK": 40
  }
}
```

### Response Structure

```typescript
{
  "candidates": [
    {
      "content": {
        "parts": [
          { "text": "Generated content here" }
        ]
      },
      "finishReason": "STOP"
    }
  ]
}
```

---

## Our Use Cases

### Use Case 1: Content Enhancement ✅

**Goal**: Enhance technical documentation with better explanations, code examples, and structure.

**Current Implementation**: ✅ Already implemented in `/api/enhance-content.ts`

**How it works**:
```
1. User has markdown content
2. Send to Gemini 2.0 Flash with enhancement prompt
3. Gemini returns enhanced markdown
4. Display side-by-side diff
```

### Use Case 2: PDF to Markdown Conversion 🚧

**Goal**: Convert PDF documents to clean markdown format using Gemini's native PDF processing.

**Status**: 🚧 To be implemented (high priority)

**Gemini Capabilities (2025)**:
- ✅ **Native PDF processing** up to **1000 pages**
- ✅ **Extracts everything**: text, images, diagrams, charts, tables
- ✅ **No OCR needed**: Gemini uses native vision to understand document context
- ✅ **File API**: Upload files up to 2GB (stored for 48 hours)
- ✅ **Gemini 2.0 Flash** and newer models excel at PDF→Markdown conversion
- ✅ **Gemini 3 Pro** has native text extraction from PDFs

**How it will work**:

```
Option A - Inline Base64 (Recommended for files <10MB):
1. User uploads PDF file
2. Convert PDF to base64
3. Send to Gemini with "convert to markdown" prompt
4. Gemini processes entire document natively
5. Returns clean markdown content
6. Save as document for enhancement

Option B - File API (For large PDFs >10MB):
1. Upload PDF to Gemini File API
2. Get file URI (valid for 48 hours)
3. Reference file in generation request
4. Gemini processes and returns markdown
5. File automatically deleted after 48 hours
```

**Implementation Details**:

#### API Request for PDF (Inline Base64):

```typescript
{
  "contents": [
    {
      "parts": [
        {
          "inline_data": {
            "mime_type": "application/pdf",
            "data": "base64_encoded_pdf_here"
          }
        },
        {
          "text": "Convert this PDF to markdown. Extract all text, images, tables, and preserve the document structure. Output clean, well-formatted markdown."
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.2,  // Lower for accurate extraction
    "maxOutputTokens": 8192
  }
}
```

#### Sample Prompt (Enhanced for 2025):

```
Convert this PDF document to clean markdown format. Follow these guidelines:

**Text Extraction:**
1. Extract all text content accurately from all pages
2. Preserve the original document structure (headings, sections, subsections)
3. Maintain paragraph spacing and text flow

**Formatting:**
4. Use appropriate markdown syntax:
   - # for main headings (H1)
   - ## for subheadings (H2-H6)
   - **bold** for emphasized text
   - *italic* for secondary emphasis
   - - or * for bullet points
   - 1. for numbered lists
   - ``` for code blocks (with language identifier)

**Tables and Data:**
5. Convert all tables to markdown table format
6. Preserve table structure and alignment
7. Handle multi-column layouts appropriately

**Clean-up:**
8. Remove page numbers, headers, and footers
9. Remove watermarks or document metadata
10. Consolidate fragmented text

**Images and Diagrams:**
11. For images/diagrams, add descriptive placeholder: `![Description of image]()`
12. Note any charts or graphs with their key information

Output ONLY the markdown content. No explanations or meta-commentary.
```

### Use Case 3: Confluence HTML to Markdown ✅

**Status**: ✅ Already handled by `turndown` library

**Note**: We use `turndown` for HTML→Markdown conversion (from Confluence), not Gemini. This is faster and more cost-effective for simple HTML conversion. Gemini is reserved for complex PDFs and content enhancement.

---

## API Implementation

### Current Implementation (Content Enhancement)

File: `/api/enhance-content.ts`

```typescript
const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

const response = await fetch(geminiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [
      {
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      topP: 0.95,
      topK: 40
    }
  })
});

const data = await response.json();
const enhancedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
```

**Note**: Update to `gemini-2.5-flash` for better quality and speed in production!

### Planned Implementation (PDF to Markdown)

File: `/api/pdf-to-markdown.ts` (to be created)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PdfToMarkdownRequest {
  fileData: string; // base64 encoded PDF
  fileName?: string;
}

interface PdfToMarkdownResponse {
  markdown: string;
  model: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileData, fileName } = req.body as PdfToMarkdownRequest;

  if (!fileData) {
    return res.status(400).json({ error: 'Missing fileData parameter' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    // Use Gemini 2.0 Flash for PDF conversion (free tier)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `Convert this PDF document to clean markdown format. Follow these guidelines:

**Text Extraction:**
1. Extract all text content accurately from all pages
2. Preserve the original document structure (headings, sections, subsections)
3. Maintain paragraph spacing and text flow

**Formatting:**
4. Use appropriate markdown syntax:
   - # for main headings
   - ## for subheadings
   - **bold** for emphasized text
   - - for bullet points
   - \`\`\` for code blocks

**Tables and Data:**
5. Convert all tables to markdown table format
6. Preserve table structure and alignment

**Clean-up:**
7. Remove page numbers, headers, and footers
8. Remove watermarks or document metadata

**Images:**
9. For images/diagrams, add descriptive placeholder: ![Description]()

Output ONLY the markdown content. No explanations.`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: fileData
                }
              },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Lower temperature for accurate extraction
          maxOutputTokens: 8192,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.'
        });
      }

      return res.status(response.status).json({
        error: `Gemini API error: ${response.statusText}`
      });
    }

    const data = await response.json();
    const markdown = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!markdown) {
      return res.status(500).json({ error: 'No content generated by AI' });
    }

    const result: PdfToMarkdownResponse = {
      markdown,
      model: 'gemini-2.0-flash'
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to convert PDF:', error);
    return res.status(500).json({
      error: 'Failed to convert PDF to markdown',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### Frontend Implementation (PDF Upload)

File: `src/lib/api-client.ts` (to be added)

```typescript
export async function convertPdfToMarkdown(file: File): Promise<string> {
  // Convert file to base64
  const base64 = await fileToBase64(file);

  const response = await fetch('/api/pdf-to-markdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileData: base64,
      fileName: file.name
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to convert PDF');
  }

  const data = await response.json();
  return data.markdown;
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:application/pdf;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
  });
}
```

---

## Best Practices

### 1. Prompt Engineering

**Good Prompt Structure** (2025):
```
[Role] You are a technical documentation expert specializing in markdown formatting.

[Task] Enhance the following documentation by:
1. Adding relevant code examples with syntax highlighting
2. Clarifying technical terms and concepts
3. Improving document structure and readability
4. Adding best practices and recommendations

[Guidelines]
- Output ONLY markdown format
- Preserve the original organization
- Be concise and actionable
- Use proper markdown syntax
- Add code examples in appropriate languages

[Content]
{user_content}
```

**Bad Prompt**:
```
Make this better
{content}
```

### 2. Error Handling (Important!)

Always handle:
- ✅ API key missing (`GEMINI_API_KEY` not set)
- ✅ Rate limits (429 - retry after delay)
- ✅ Network errors (timeout, connection issues)
- ✅ Invalid responses (empty candidates array)
- ✅ Empty content (no text generated)
- ✅ Large file errors (>2GB for File API)

### 3. Temperature Settings

- **0.2-0.3**: PDF extraction, accurate conversion, data extraction
- **0.7**: Content enhancement, creative improvements (balanced)
- **0.9-1.0**: Creative writing, brainstorming (not recommended for docs)

### 4. Token Management

- Monitor token usage in responses
- Set appropriate `maxOutputTokens` (8192 for docs, 2048 for summaries)
- Use cheaper models for simple tasks (2.5 Flash Lite)
- Consider context window limits (1M or 2M tokens)

### 5. Model Selection Strategy

```
Simple text enhancement → gemini-2.0-flash (free tier)
PDF conversion (<100 pages) → gemini-2.0-flash
PDF conversion (>100 pages) → gemini-2.5-flash
Complex analysis → gemini-2.5-pro or gemini-3-pro
High volume production → gemini-2.5-flash-lite
```

---

## Rate Limits & Pricing (2025 Updated)

### Free Tier Options

**Gemini 3 Pro** (Latest - March 2025):
- ✅ **Completely FREE** in Google AI Studio
- ✅ Most powerful multimodal model in the world
- ✅ Best for interactive use and experimentation
- ⚠️ May have lower rate limits

**Gemini 2.0 Flash** (Recommended for MVP):
- ✅ **1,500 requests per day** (RPD)
- ✅ **1 million tokens per minute** (TPM)
- ✅ Completely free
- ✅ Production-ready and stable

### Paid Tier (Pay-as-you-go)

**Gemini 1.5 Pro** (August 2025 pricing):
- **Input**: $1.25 per 1M tokens
- **Output**: $5.00 per 1M tokens
- **Rate limit**: 1,000 RPM (paid tier)

**Gemini 1.5 Flash**:
- **Input**: $0.075 per 1M tokens
- **Output**: $0.30 per 1M tokens
- **Rate limit**: 2,000 RPM (paid tier, increased from 1,000)

**Gemini 2.5 Flash** (Best value):
- **Best price-performance ratio**
- Ideal for large-scale processing
- Lower cost than 1.5 models

### Rate Limit Tiers

Rate limits are **project-based** (not API key-based) and tied to usage tier:

- **Tier 1 (Free)**: Lower limits, good for development
- **Tier 2+**: Higher limits as usage increases
- Resets at **midnight Pacific time** (daily quotas)
- Automatic upgrade as spending increases

### Real-World Cost Examples

**Scenario 1**: 100 enhancements per day (MVP)
- Average input: 2,000 tokens (one page)
- Average output: 3,000 tokens (enhanced)
- Total per day: 500,000 tokens

**Cost**:
- Free tier (2.0 Flash): **$0** ✅
- Paid tier (1.5 Pro): ~$1.25/day (~$37.50/month)

**Scenario 2**: 50 PDF conversions per day
- Average PDF: 20 pages = ~10,000 tokens input
- Average output: ~15,000 tokens markdown
- Total per day: 1.25M tokens

**Cost**:
- Free tier (2.0 Flash): **$0** (within limits) ✅
- Paid tier (2.5 Flash): ~$0.50/day (~$15/month)

**Real-world reports (November 2025)**: Many developers report **$0 bills** even with thousands of requests! 🎉

---

## Implementation Checklist

### Phase 1: Setup ✅
- [x] Create Gemini API account at aistudio.google.com
- [x] Get API key
- [x] Add to environment variables (.env.local + Vercel)
- [x] Test with enhance-content endpoint
- [x] Verify free tier limits

### Phase 2: PDF Support (Current Priority) 🚧
- [ ] Create `/api/pdf-to-markdown.ts` endpoint
- [ ] Add `convertPdfToMarkdown` to api-client.ts
- [ ] Update AddDocumentModal to call PDF conversion API
- [ ] Test with sample PDFs (5-10 pages)
- [ ] Test with large PDFs (100+ pages)
- [ ] Handle errors gracefully (file too large, rate limits)
- [ ] Add loading progress indicator for large PDFs

### Phase 3: Optimization (Future) 📈
- [ ] Upgrade to Gemini 2.5 Flash for better quality
- [ ] Add retry logic for rate limit errors (429)
- [ ] Implement File API for very large PDFs (>10MB)
- [ ] Cache frequently converted PDFs (local storage)
- [ ] Monitor token usage and costs
- [ ] Add user feedback for AI quality
- [ ] Consider batch processing for multiple PDFs
- [ ] Explore Gemini 3 Pro for premium tier

---

## Quick Reference

### Important Links

**Get API Key:**
```
https://aistudio.google.com/app/apikey
```

**API Documentation:**
```
https://ai.google.dev/gemini-api/docs
```

**Document Processing Guide:**
```
https://ai.google.dev/gemini-api/docs/document-processing
```

**Pricing Calculator:**
```
https://ai.google.dev/gemini-api/docs/pricing
```

### Supported File Types

- **PDF**: ✅ application/pdf (up to **1000 pages**, 2GB max)
- **Images**: ✅ PNG, JPEG, WebP, HEIC, HEIF
- **Text**: ✅ Any text format
- **Video**: ✅ MP4, MOV, AVI (via File API)
- **Audio**: ✅ MP3, WAV, AAC

### PDF Processing Capabilities (2025)

- **Max pages**: 1000 pages per PDF
- **Max file size**: 2GB per file
- **Storage**: 20GB per project (File API)
- **Retention**: 48 hours (File API)
- **Processing**: Native vision (no OCR needed)
- **Extraction**: Text, images, tables, charts, diagrams

### Model Selection Quick Guide

```
Development/Testing    → gemini-2.0-flash (free)
PDF Conversion         → gemini-2.0-flash or 2.5-flash
Content Enhancement    → gemini-2.5-flash
Complex Analysis       → gemini-2.5-pro or gemini-3-pro
High Volume           → gemini-2.5-flash-lite
Experimentation       → gemini-3-pro (free in AI Studio)
```

---

## Next Steps for Implementation

1. ✅ **Verify API key** works with current enhance endpoint
2. 🚧 **Create PDF to Markdown** API endpoint (`/api/pdf-to-markdown.ts`)
3. 🚧 **Update frontend** to call PDF conversion (AddDocumentModal)
4. 🚧 **Test thoroughly** with various PDF types and sizes
5. 🚧 **Deploy to Vercel** and test in production
6. 📈 **Monitor usage** and consider upgrading to 2.5 Flash
7. ✨ **Explore Gemini 3 Pro** for premium features

---

## Sources

- [Gemini Developer API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API Rate Limits Guide](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Gemini Models Documentation](https://ai.google.dev/gemini-api/docs/models)
- [Using Gemini API Keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Document Understanding](https://ai.google.dev/gemini-api/docs/document-processing)
- [Gemini 2.5 Announcement](https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/)
- [Updated Gemini Models - Google Developers Blog](https://developers.googleblog.com/en/updated-gemini-models-reduced-15-pro-pricing-increased-rate-limits-and-more/)
- [Unlock PDFs for RAG with Markdown and Gemini - Medium](https://medium.com/google-cloud/unlocking-pdfs-for-rag-with-markdown-and-gemini-503846463f3f)
- [Gemini 2.0 Flash: Beyond OCR - Medium](https://medium.com/@michaeljward97/gemini-2-0-flash-beyond-ocr-cae2b3bd8e36)

---

**Document Version**: 2.0 (2025 Updated)
**Last Verified**: December 5, 2025
**Current Status**:
- ✅ Content Enhancement (Gemini 2.0 Flash)
- 🚧 PDF Conversion (Ready to implement)
- 📈 Future: Upgrade to Gemini 2.5/3.0

**Recommended Next Action**: Implement PDF to Markdown conversion using the code samples above!
