/**
 * Vercel Function: Analyze document and extract metadata using Gemini AI
 * Endpoint: POST /api/analyze-document
 *
 * Purpose: Extract document summary, style guide, key terms, and document type
 * This metadata is used for context-aware text enhancement
 */

import * as process from 'node:process';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from 'ai';
import { z } from 'zod';

// ========== Request/Response Schemas ==========

const requestSchema = z.object({
  fullDocumentHtml: z.string().min(1, 'Full document HTML is required'),
  documentName: z.string().optional(),
});

const responseSchema = z.object({
  summary: z.string(),
  styleGuide: z.object({
    tone: z.string(),
    vocabulary: z.array(z.string()),
    perspective: z.string(),
    technicalLevel: z.string(),
    commonPatterns: z.array(z.string()),
  }),
  keyTerms: z.array(z.string()),
  documentType: z.string(),
  model: z.string(),
});

type AnalyzeRequest = z.infer<typeof requestSchema>;
type AnalyzeResponse = z.infer<typeof responseSchema>;

// ========== System Prompt ==========

const SYSTEM_PROMPT = `You are a professional technical writing analyst. Your role is to analyze documents and extract metadata that will help maintain consistency in future AI-powered text enhancements.

Core Responsibilities:
1. Provide a concise summary of the document's purpose and key topics
2. Identify the writing style and tone patterns
3. Extract important terminology that should be preserved
4. Determine the document type and technical level

Analysis Guidelines:
- Be precise and specific in your analysis
- Focus on actionable insights for maintaining consistency
- Identify patterns that are unique to this document
- Note terminology that appears frequently or is domain-specific
- Consider the intended audience and purpose`;

// ========== User Prompt Template ==========

function buildUserPrompt(fullDocumentHtml: string, documentName?: string): string {
  return `Analyze this technical document and provide metadata for future AI enhancement tasks.

${documentName ? `**Document Name**: ${documentName}\n` : ''}
**DOCUMENT**:
${fullDocumentHtml}

Provide a JSON response with:

1. **summary**: A 3-5 sentence summary capturing:
   - Main purpose of the document
   - Intended audience
   - Key topics covered

2. **styleGuide**: {
   - **tone**: Describe the writing style (e.g., "formal technical", "conversational tutorial", "academic research", "casual blog post")
   - **vocabulary**: List 10-15 domain-specific terms, product names, or technical jargon used consistently
   - **perspective**: Identify narrative voice ("first-person", "second-person", "third-person", "imperative")
   - **technicalLevel**: Assess complexity ("beginner-friendly", "intermediate", "expert/advanced")
   - **commonPatterns**: List 3-5 recurring sentence structures, phrases, or writing patterns (e.g., "Uses numbered lists for steps", "Starts sections with questions", "Heavy use of code examples")
}

3. **keyTerms**: List 10-20 important technical terms, product names, acronyms, or specialized vocabulary that should be preserved exactly in enhancements

4. **documentType**: Categorize the document (e.g., "API documentation", "user guide", "technical specification", "tutorial", "reference manual", "troubleshooting guide", "release notes")

**CRITICAL**: Return ONLY a valid JSON object with this EXACT structure:
{
  "summary": "string",
  "styleGuide": {
    "tone": "string",
    "vocabulary": ["term1", "term2", ...],
    "perspective": "string",
    "technicalLevel": "string",
    "commonPatterns": ["pattern1", "pattern2", ...]
  },
  "keyTerms": ["term1", "term2", ...],
  "documentType": "string"
}

Output ONLY the JSON object, nothing else.`;
}

// ========== Handler ==========

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body
  const validation = requestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: validation.error.errors,
    });
  }

  const { fullDocumentHtml, documentName } = validation.data;

  try {
    console.log(`Analyzing document: ${documentName || 'Untitled'}`);
    console.log(`Document length: ${fullDocumentHtml.length} characters`);

    // Build analysis prompt
    const userMessage = buildUserPrompt(fullDocumentHtml, documentName);

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Generate metadata using Gemini
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.2, // Low temperature for consistent, analytical output
    });

    if (!text || text.trim().length === 0) {
      return res.status(500).json({
        error: 'No metadata generated by AI',
      });
    }

    // Parse JSON response from AI
    let parsedResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      parsedResponse = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', text);
      return res.status(500).json({
        error: 'AI returned invalid JSON format',
        details: text.substring(0, 200),
      });
    }

    // Validate response structure
    const result = responseSchema.safeParse({
      ...parsedResponse,
      model: 'gemini-2.5-flash',
    });

    if (!result.success) {
      return res.status(500).json({
        error: 'AI response missing required fields',
        details: result.error.errors,
      });
    }

    console.log(`Analysis complete. Document type: ${result.data.documentType}`);
    console.log(`Summary: "${result.data.summary.substring(0, 100)}..."`);

    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Failed to analyze document:', error);
    return res.status(500).json({
      error: 'Failed to analyze document',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
