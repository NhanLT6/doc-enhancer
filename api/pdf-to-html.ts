/**
 * Vercel Function: Convert PDF to HTML using Gemini AI
 * Endpoint: POST /api/pdf-to-html
 * Features:
 * - Converts PDF text to HTML
 * - Extracts embedded images as base64 data URIs
 * - Embeds images directly in HTML as <img> tags
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
  html: z.string(),
  imageCount: z.number(),
  model: z.string(),
});

type PdfToHtmlRequest = z.infer<typeof requestSchema>;
type PdfToHtmlResponse = z.infer<typeof responseSchema>;

// ========== PDF to HTML Conversion Prompt ==========

function buildPdfToHtmlPrompt(imageCount: number): string {
  return `Convert this PDF document to well-formatted HTML. Follow these rules EXACTLY:

CRITICAL FORMATTING RULES:
1. **Headers**: Use proper hierarchy
   - Document title → <h1>
   - Major sections → <h2>
   - Subsections → <h3>

2. **Line Breaks**: Preserve original line breaks
   - Use <p> tags for paragraphs
   - Use <br> for line breaks within contact info, addresses, dates
   - Don't wrap everything in a single paragraph

3. **Lists**:
   - Use <ul> and <li> for bullet points
   - Use <ol> and <li> for numbered lists

4. **Emphasis**:
   - Use <strong> for labels and important terms
   - Use <em> for emphasis

5. **Tables**:
   - Use proper <table>, <thead>, <tbody>, <tr>, <th>, <td> structure
   - Add appropriate spacing and formatting

6. **Images**:
   ${imageCount > 0 ? `- IMPORTANT: Replace actual visible images with placeholders {{IMAGE_0}}, {{IMAGE_1}}, etc. (we have ${imageCount} images)` : '- No images detected in this PDF'}
   - ONLY replace actual visible images (photos, logos, diagrams, charts)
   - DO NOT create placeholders for:
     * Page breaks
     * Blank spaces
     * Decorative lines or borders
     * Background patterns
     * Whitespace between sections

EXAMPLE OUTPUT (showing proper HTML structure):

<h1>John Smith</h1>

<p>
  <strong>Phone:</strong> +1 555-0123<br>
  <strong>Email:</strong> john.smith@example.com<br>
  <strong>Address:</strong> 123 Main Street, City, State 12345<br>
  <strong>LinkedIn:</strong> linkedin.com/in/johnsmith<br>
  <strong>GitHub:</strong> github.com/johnsmith
</p>

<h2>Professional Summary</h2>

<p>Senior Software Engineer with 8+ years of experience in full-stack development. Specialized in cloud architecture and scalable systems.</p>

<h2>Technical Skills</h2>

<p>
  <strong>Frontend:</strong> React, TypeScript, Next.js, Tailwind CSS<br>
  <strong>Backend:</strong> Node.js, Python, Go<br>
  <strong>Databases:</strong> PostgreSQL, MongoDB, Redis<br>
  <strong>Cloud:</strong> AWS, Azure, Docker, Kubernetes
</p>

<h2>Work Experience</h2>

<h3>Senior Software Engineer | Tech Company Inc | 2020 - Present</h3>

<p><em>Remote - San Francisco, CA</em></p>

<p>Key Responsibilities:</p>
<ul>
  <li>Led development of microservices architecture serving 10M+ users</li>
  <li>Mentored junior developers and conducted code reviews</li>
  <li>Improved system performance by 40% through optimization</li>
</ul>

${imageCount > 0 ? '<p>{{IMAGE_0}}</p>\n\n' : ''}
<h3>Software Engineer | Startup Co | 2018 - 2020</h3>

<p><em>New York, NY</em></p>

<ul>
  <li>Built core product features using React and Node.js</li>
  <li>Implemented CI/CD pipeline reducing deployment time by 60%</li>
</ul>

<h2>Education</h2>

<p>
  <strong>Bachelor of Science in Computer Science</strong><br>
  University of Technology | 2014 - 2018<br>
  <em>GPA: 3.8/4.0</em>
</p>

REQUIREMENTS:
- Output ONLY HTML (no explanations, no code fences, no DOCTYPE, no <html>, <head>, or <body> tags)
- Start directly with content (first tag should be content like <h1> or <p>)
- Use proper heading hierarchy
- Use semantic HTML tags
- Preserve line breaks with <br> where appropriate
- Use proper list structures
${imageCount > 0 ? `- Replace images with {{IMAGE_N}} placeholders (0 to ${imageCount - 1})` : '- No image placeholders needed'}`;
}

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
    console.log(`Converting PDF to HTML: ${fileName} (${fileData.length} bytes base64)`);

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

    // Step 2: Use Gemini to convert PDF to HTML
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
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
              text: `${buildPdfToHtmlPrompt(imageCount)}

Document: ${fileName}`,
            },
          ],
        },
      ],
      temperature: 0.2, // Lower temperature for accurate extraction
    });

    if (!text || text.trim().length === 0) {
      console.error('No HTML generated');
      return res.status(500).json({
        error: 'No content generated by AI',
        details: 'The AI did not return any content. The PDF might be empty or unreadable.',
      });
    }

    // Step 3: Replace {{IMAGE_N}} placeholders with actual <img> tags
    let htmlContent = text;

    if (extractedImages && extractedImages.images.length > 0) {
      extractedImages.images.forEach((img, index) => {
        const placeholder = `{{IMAGE_${index}}}`;
        const imgTag = `<img src="${img.data}" alt="Image ${index + 1} from ${fileName}" width="${img.width}" height="${img.height}" />`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), imgTag);
      });
    }

    // Remove any remaining placeholders that don't have corresponding images
    htmlContent = htmlContent.replace(/\{\{IMAGE_\d+\}\}/g, '');

    console.log(
      `Successfully converted PDF to HTML: ${fileName} (${htmlContent.length} chars, ${imageCount} images embedded)`
    );

    const result: PdfToHtmlResponse = {
      html: htmlContent,
      imageCount,
      model: 'gemini-2.5-flash',
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to convert PDF:', error);
    return res.status(500).json({
      error: 'Failed to convert PDF to HTML',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
