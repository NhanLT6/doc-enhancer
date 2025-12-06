/**
 * PDF Image Extraction Utility
 * Extracts embedded images from PDF files and converts them to base64 data URIs
 * Uses Mozilla's PDF.js library for reliable PDF parsing
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface ExtractedImage {
  data: string; // Base64 data URI (data:image/jpeg;base64,...)
  width: number;
  height: number;
  pageNumber: number;
  imageIndex: number; // Index within the page
  format: 'jpeg' | 'png' | 'webp' | 'unknown';
}

export interface ImageExtractionResult {
  images: ExtractedImage[];
  totalPages: number;
  totalImages: number;
}

/**
 * Extract all images from a PDF buffer
 * @param pdfBuffer - PDF file as Buffer or Uint8Array
 * @returns Array of extracted images with metadata
 */
export async function extractImagesFromPDF(
  pdfBuffer: Buffer | Uint8Array
): Promise<ImageExtractionResult> {
  const images: ExtractedImage[] = [];

  try {
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBuffer,
      verbosity: 0, // Suppress warnings
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    // Process each page
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

/**
 * Extract images from a single PDF page
 */
async function extractImagesFromPage(
  page: any,
  pageNumber: number
): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = [];
  let imageIndex = 0;

  try {
    // Get page operations
    const operatorList = await page.getOperatorList();

    // Get page resources
    const resources = await page.objs;

    // Find image operations in the page
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const op = operatorList.fnArray[i];
      const args = operatorList.argsArray[i];

      // Check if this is an image operation
      // Op codes: 85 = paintImageXObject, 86 = paintInlineImageXObject
      if (op === 85 || op === 86) {
        const imageName = args[0];

        try {
          // Get image object
          const imgObj = await new Promise((resolve, reject) => {
            resources.get(imageName, (obj: any) => {
              if (obj) resolve(obj);
              else reject(new Error('Image object not found'));
            });
          });

          if (imgObj && imgObj.data) {
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

/**
 * Process an image object from PDF.js and convert to base64
 */
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

    // Determine image format based on kind
    // kind: 1 = grayscale, 2 = RGB, 3 = RGBA
    let format: 'jpeg' | 'png' | 'webp' | 'unknown' = 'unknown';
    let mimeType = 'image/png';

    // For RGB data, use JPEG for better compression
    if (kind === 2 && data.length === width * height * 3) {
      format = 'jpeg';
      mimeType = 'image/jpeg';
    } else {
      format = 'png';
      mimeType = 'image/png';
    }

    // Convert image data to base64
    const base64 = await convertImageDataToBase64(data, width, height, kind);

    if (!base64) {
      return null;
    }

    return {
      data: `data:${mimeType};base64,${base64}`,
      width,
      height,
      pageNumber,
      imageIndex,
      format,
    };
  } catch (error) {
    console.warn('Error processing image object:', error);
    return null;
  }
}

/**
 * Convert raw image data to base64 using Canvas API (if available) or raw encoding
 */
async function convertImageDataToBase64(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  kind: number
): Promise<string | null> {
  try {
    // For Node.js environment, we'll use a simple approach
    // Convert the raw image data to base64 directly
    // This works for grayscale and RGB data

    // Create a buffer from the image data
    const buffer = Buffer.from(data);
    const base64 = buffer.toString('base64');

    return base64;
  } catch (error) {
    console.warn('Error converting image to base64:', error);
    return null;
  }
}

/**
 * Get summary of images in PDF
 */
export async function getImageSummary(
  pdfBuffer: Buffer | Uint8Array
): Promise<{
  hasImages: boolean;
  imageCount: number;
  pageCount: number;
}> {
  try {
    const result = await extractImagesFromPDF(pdfBuffer);
    return {
      hasImages: result.totalImages > 0,
      imageCount: result.totalImages,
      pageCount: result.totalPages,
    };
  } catch (error) {
    console.error('Error getting image summary:', error);
    return {
      hasImages: false,
      imageCount: 0,
      pageCount: 0,
    };
  }
}
