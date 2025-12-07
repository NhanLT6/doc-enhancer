/**
 * Vercel Function: Enhance selected text using Gemini AI
 * Endpoint: POST /api/enhance-content
 *
 * Strategy: "Marked Local Context" with HTML
 * - Sends full document HTML for global context (cacheable)
 * - Sends parent node HTML with <target> tags for precise selection
 * - AI can expand selection for grammatical completeness
 * - Preserves HTML structure (tables, lists, formatting)
 */

import * as process from 'node:process';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from 'ai';
import { z } from 'zod';

// ========== Request/Response Schemas ==========

const documentMetadataSchema = z.object({
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
});

const requestSchema = z.object({
  fullDocumentHtml: z.string().min(1, 'Full document HTML is required'),
  targetBlockHtml: z.string().min(1, 'Target block HTML is required'),
  instructions: z.string().optional(),
  documentName: z.string().optional(),
  metadata: documentMetadataSchema.optional(),
});

const responseSchema = z.object({
  action: z.literal('replace'),
  newHtml: z.string(),
  model: z.string(),
});

type EnhanceRequest = z.infer<typeof requestSchema>;
type EnhanceResponse = z.infer<typeof responseSchema>;

// ========== System Prompt ==========

const SYSTEM_PROMPT = `You are a professional technical writing assistant. Your role is to enhance selected text while maintaining consistency with the full document.

Core Principles:
1. **Maintain Consistency**: Match the terminology, tone, and style of the full document
2. **Context Awareness**: Consider what comes before and after the selection
3. **Smart Expansion**: If the selected text is grammatically incomplete, expand to include necessary surrounding words
4. **Preserve Intent**: Keep the original meaning while improving clarity and professionalism
5. **Preserve Structure**: Maintain HTML structure and formatting (tables, lists, bold, italic, etc.)

Enhancement Guidelines:
- Improve clarity and conciseness
- Fix grammar and punctuation
- Use active voice when appropriate
- Add specific details where vague
- Maintain technical accuracy
- **CRITICAL**: Preserve HTML tags and structure
- Keep table formatting with <table>, <tr>, <td>, <th> tags
- Keep list formatting with <ul>, <ol>, <li> tags
- Keep text formatting like <strong>, <em>, <code>
- Keep images as <img> tags with src and alt attributes
- Return ONLY valid HTML`;

// ========== User Prompt Template ==========

type DocumentMetadata = z.infer<typeof documentMetadataSchema>;

function buildUserPrompt(
  targetBlockHtml: string,
  instructions?: string,
  metadata?: DocumentMetadata
): string {
  const metadataSection = metadata
    ? `
**Document Context** (maintain consistency with these characteristics):
- **Document Type**: ${metadata.documentType}
- **Summary**: ${metadata.summary}
- **Tone**: ${metadata.styleGuide.tone}
- **Perspective**: ${metadata.styleGuide.perspective}
- **Technical Level**: ${metadata.styleGuide.technicalLevel}
- **Key Terms to Preserve**: ${metadata.keyTerms.slice(0, 10).join(', ')}${metadata.keyTerms.length > 10 ? ', ...' : ''}
- **Common Patterns**: ${metadata.styleGuide.commonPatterns.slice(0, 3).join('; ')}

**IMPORTANT**: When enhancing, maintain the document's ${metadata.styleGuide.tone} tone, use ${metadata.styleGuide.perspective} perspective, and preserve all key terms exactly as they appear.
`
    : '';

  return `I need to enhance a specific part of my document.
${metadataSection}
**Context**: Below is an HTML block (paragraph, table cell, or list item) containing my selection. The text I selected is wrapped in <target> tags.

**Current HTML Block**:
${targetBlockHtml}

**Task**:
1. Analyze the content inside <target> tags
2. If the selection is grammatically incomplete or breaks sentence flow, expand to include necessary surrounding words
3. Enhance the content (improve clarity, grammar, professionalism)${metadata ? `\n4. **CRITICAL**: Match the document's ${metadata.styleGuide.tone} tone and ${metadata.styleGuide.perspective} perspective` : ''}
5. **CRITICAL**: Preserve all HTML structure and tags
${instructions ? `6. Follow this specific instruction: ${instructions}` : ''}

**CRITICAL**: Return your response as a JSON object with this EXACT format:
{
  "action": "replace",
  "new_html": "The enhanced HTML content (with all tags preserved)"
}

**Examples**:
Input: <p>Revenue <target>went up</target> significantly.</p>
Output: {"action": "replace", "new_html": "<p>Revenue <strong>increased</strong> significantly.</p>"}

Input: <td><target>This data</target> is important</td>
Output: {"action": "replace", "new_html": "<td><strong>This information</strong> is important</td>"}

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

  const { fullDocumentHtml, targetBlockHtml, instructions, documentName, metadata } =
    validation.data;

  try {
    console.log(`Enhancing content in: ${documentName || 'Untitled'}`);
    console.log(`Target block HTML: "${targetBlockHtml.substring(0, 100)}..."`);
    if (metadata) {
      console.log(`Using metadata: ${metadata.documentType}, tone: ${metadata.styleGuide.tone}`);
    }

    // Prepare system message with full document context
    const systemMessage = `${SYSTEM_PROMPT}

**Full Document Context** (for reference only, do NOT modify this):
${fullDocumentHtml}

${documentName ? `\nDocument Name: "${documentName}"` : ''}`;

    // Build user message with marked selection and metadata
    const userMessage = buildUserPrompt(targetBlockHtml, instructions, metadata);

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    // Generate enhanced text using Gemini
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent output
    });

    if (!text || text.trim().length === 0) {
      return res.status(500).json({
        error: 'No content generated by AI',
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
      action: parsedResponse.action,
      newHtml: parsedResponse.new_html,
      model: 'gemini-2.0-flash-exp',
    });

    if (!result.success) {
      return res.status(500).json({
        error: 'AI response missing required fields',
        details: result.error.errors,
      });
    }

    console.log(`Enhanced successfully. New HTML: "${result.data.newHtml.substring(0, 100)}..."`);

    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Failed to enhance content:', error);
    return res.status(500).json({
      error: 'Failed to enhance content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
