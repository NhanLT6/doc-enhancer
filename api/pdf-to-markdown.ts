/**
 * Vercel Function: Convert PDF to Markdown using Gemini AI
 * Endpoint: POST /api/pdf-to-markdown
 * Features:
 * - Converts PDF text to markdown
 * - Extracts embedded images as base64 data URIs
 * - Uses Gemini for intelligent content conversion
 */

import { google } from '@ai-sdk/google';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from 'ai';
import { z } from 'zod';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

// ========== Request/Response Schemas ==========

const requestSchema = z.object({
  fileData: z.string().min(1, 'fileData is required'),
  fileName: z.string().min(1, 'fileName is required'),
});

const responseSchema = z.object({
  markdown: z.string(),
  images: z.array(
    z.object({
      data: z.string(),
      alt: z.string(),
      width: z.number(),
      height: z.number(),
    })
  ),
  model: z.string(),
  imageCount: z.number(),
});

type PdfToMarkdownRequest = z.infer<typeof requestSchema>;
type PdfToMarkdownResponse = z.infer<typeof responseSchema>;

// ========== PDF to Markdown Conversion Prompt ==========

const PDF_TO_MARKDOWN_PROMPT = `Convert this PDF document to well-formatted Markdown. Follow these rules EXACTLY:

CRITICAL FORMATTING RULES:
1. **Headers**: Use proper hierarchy
   - Document title → # (h1)
   - Major sections → ## (h2)
   - Subsections → ### (h3)

2. **Line Breaks**: Preserve original line breaks
   - Contact info, addresses, dates should be on SEPARATE lines
   - Use TWO blank lines between major sections
   - Use ONE blank line between paragraphs

3. **Lists**:
   - Use - for bullet points
   - Use 1. 2. 3. for numbered lists

4. **Emphasis**:
   - Use **bold** for labels and important terms
   - Use *italics* for emphasis

5. **Images**:
   - ONLY replace actual visible images (photos, logos, diagrams, charts) with placeholders
   - Use {{IMAGE_0}}, {{IMAGE_1}}, etc. in order of appearance
   - DO NOT create placeholders for:
     * Page breaks
     * Blank spaces
     * Decorative lines or borders
     * Background patterns
     * Whitespace between sections

EXAMPLE OUTPUT (showing proper line breaks):

# John Smith

**Phone:** +1 555-0123
**Email:** john.smith@example.com
**Address:** 123 Main Street, City, State 12345
**LinkedIn:** linkedin.com/in/johnsmith
**GitHub:** github.com/johnsmith


## Professional Summary

Senior Software Engineer with 8+ years of experience in full-stack development. Specialized in cloud architecture and scalable systems.


## Technical Skills

**Frontend:** React, TypeScript, Next.js, Tailwind CSS
**Backend:** Node.js, Python, Go
**Databases:** PostgreSQL, MongoDB, Redis
**Cloud:** AWS, Azure, Docker, Kubernetes


## Work Experience

### Senior Software Engineer | Tech Company Inc | 2020 - Present

*Remote - San Francisco, CA*

Key Responsibilities:
- Led development of microservices architecture serving 10M+ users
- Mentored junior developers and conducted code reviews
- Improved system performance by 40% through optimization


{{IMAGE_0}}


### Software Engineer | Startup Co | 2018 - 2020

*New York, NY*

- Built core product features using React and Node.js
- Implemented CI/CD pipeline reducing deployment time by 60%


## Education

**Bachelor of Science in Computer Science**
University of Technology | 2014 - 2018
*GPA: 3.8/4.0*


REQUIREMENTS:
- Output ONLY markdown (no explanations, no code fences around the entire document)
- Start directly with content
- Use proper heading hierarchy
- Preserve line breaks (especially for contact info, dates, locations)
- Add blank lines between sections
- Replace images with {{IMAGE_N}} placeholders`;

// ========== PDF Image Extraction Utilities ==========

interface ExtractedImage {
  data: string; // Base64 data URI
  width: number;
  height: number;
  pageNumber: number;
  imageIndex: number;
  format: 'jpeg' | 'png' | 'webp' | 'unknown';
}

interface ImageExtractionResult {
  images: ExtractedImage[];
  totalPages: number;
  totalImages: number;
}

async function extractImagesFromPDF(
  pdfBuffer: Buffer | Uint8Array
): Promise<ImageExtractionResult> {
  const images: ExtractedImage[] = [];

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBuffer,
      verbosity: 0,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const pageImages = await extractImagesFromPage(page, pageNum);
      images.push(...pageImages);
    }

    return {
      images,
      totalPages,
      totalImages: images.length,
    };
  } catch (error) {
    console.error('Error extracting images from PDF:', error);
    throw new Error(
      `Failed to extract images: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async function extractImagesFromPage(
  page: any,
  pageNumber: number
): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = [];
  let imageIndex = 0;

  try {
    const operatorList = await page.getOperatorList();
    const resources = await page.objs;

    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const op = operatorList.fnArray[i];
      const args = operatorList.argsArray[i];

      if (op === 85 || op === 86) {
        const imageName = args[0];

        try {
          const imgObj = await new Promise((resolve, reject) => {
            resources.get(imageName, (obj: any) => {
              if (obj) resolve(obj);
              else reject(new Error('Image object not found'));
            });
          });

          if (imgObj && (imgObj as any).data) {
            const extractedImage = await processImageObject(
              imgObj,
              pageNumber,
              imageIndex
            );
            if (extractedImage) {
              images.push(extractedImage);
              imageIndex++;
            }
          }
        } catch (err) {
          console.warn(`Could not extract image ${imageName} from page ${pageNumber}:`, err);
        }
      }
    }
  } catch (error) {
    console.warn(`Error processing page ${pageNumber}:`, error);
  }

  return images;
}

async function processImageObject(
  imgObj: any,
  pageNumber: number,
  imageIndex: number
): Promise<ExtractedImage | null> {
  try {
    const { width, height, data, kind } = imgObj;

    if (!data || !width || !height) {
      return null;
    }

    // Determine pixel format from kind
    // kind: 1 = grayscale, 2 = RGB, 3 = RGBA
    let channels: 1 | 2 | 3 | 4;
    if (kind === 1) {
      channels = 1; // Grayscale
    } else if (kind === 2) {
      channels = 3; // RGB
    } else if (kind === 3) {
      channels = 4; // RGBA
    } else {
      console.warn(`Unknown image kind: ${kind}`);
      return null;
    }

    // Convert raw pixel data to compressed JPEG using sharp
    const buffer = Buffer.from(data);
    const encodedBuffer = await sharp(buffer, {
      raw: {
        width,
        height,
        channels,
      },
    })
      .jpeg({ quality: 80 }) // Good balance between quality and size
      .toBuffer();

    const base64 = encodedBuffer.toString('base64');

    return {
      data: `data:image/jpeg;base64,${base64}`,
      width,
      height,
      pageNumber,
      imageIndex,
      format: 'jpeg',
    };
  } catch (error) {
    console.warn('Error processing image object:', error);
    return null;
  }
}

// ========== End PDF Image Extraction Utilities ==========

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body with Zod
  const validation = requestSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: validation.error.errors,
    });
  }

  const { fileData, fileName } = validation.data;

  try {
    console.log(`Converting PDF to markdown: ${fileName} (${fileData.length} bytes base64)`);

    // Step 1: Extract images from PDF
    console.log('Extracting images from PDF...');
    // Convert base64 to Uint8Array (pdf.js requirement)
    const pdfBuffer = Buffer.from(fileData, 'base64');
    const pdfData = new Uint8Array(pdfBuffer);
    let extractedImages = null;
    let imageCount = 0;

    try {
      extractedImages = await extractImagesFromPDF(pdfData);
      imageCount = extractedImages.totalImages;
      console.log(`Extracted ${imageCount} images from ${extractedImages.totalPages} pages`);
    } catch (imgError) {
      console.warn('Failed to extract images, continuing without them:', imgError);
      // Continue without images - don't fail the entire conversion
    }

    // Step 2: Use Gemini to convert PDF to markdown
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: fileData,
              mediaType: 'application/pdf',
            },
            {
              type: 'text',
              text: `${PDF_TO_MARKDOWN_PROMPT}

Document: ${fileName}`,
            },
          ],
        },
      ],
      temperature: 0.2, // Lower temperature for accurate extraction
    });

    if (!text || text.trim().length === 0) {
      console.error('No markdown generated');
      return res.status(500).json({
        error: 'No content generated by AI',
        details: 'The AI did not return any content. The PDF might be empty or unreadable.',
      });
    }

    // Step 3: Validate and clean up image placeholders
    // Count how many {{IMAGE_N}} placeholders Gemini created
    const placeholderMatches = text.match(/\{\{IMAGE_\d+\}\}/g);
    const placeholderCount = placeholderMatches ? placeholderMatches.length : 0;

    console.log(`Gemini created ${placeholderCount} image placeholders, we extracted ${imageCount} actual images`);

    // Clean up markdown by removing extra placeholders that don't have corresponding images
    let cleanedText = text;
    if (placeholderCount > imageCount) {
      console.warn(`Removing ${placeholderCount - imageCount} extra image placeholders created by Gemini`);
      // Remove placeholders beyond the number of extracted images
      for (let i = imageCount; i < placeholderCount; i++) {
        cleanedText = cleanedText.replace(new RegExp(`\\{\\{IMAGE_${i}\\}\\}\\s*`, 'g'), '');
      }
    }

    // Step 4: Prepare images array for response (keep valid placeholders in markdown)
    const imagesForResponse = extractedImages
      ? extractedImages.images.map((img, index) => ({
          data: img.data,
          alt: `Image ${index + 1} from ${fileName}`,
          width: img.width,
          height: img.height,
        }))
      : [];

    console.log(
      `Successfully converted PDF to markdown: ${fileName} (${cleanedText.length} chars, ${imageCount} images)`
    );

    const result: PdfToMarkdownResponse = {
      markdown: cleanedText, // Keep valid placeholders {{IMAGE_0}}, {{IMAGE_1}}, etc.
      images: imagesForResponse, // Return images separately
      model: 'gemini-2.0-flash',
      imageCount,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to convert PDF:', error);
    return res.status(500).json({
      error: 'Failed to convert PDF to markdown',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
