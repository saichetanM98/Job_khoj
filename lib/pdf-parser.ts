import { PDFParse } from "pdf-parse";

/**
 * Extracts raw textual content from a PDF file buffer.
 * Enforces a minimum character length check to guard against scanned/empty PDFs.
 */
export async function parsePdfText(
  buffer: Buffer
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();

    const text = textResult?.text?.trim() || "";

    if (!text || text.length < 20) {
      return {
        success: false,
        error: "Could not extract text from this PDF. Please try a different file.",
      };
    }

    return {
      success: true,
      text,
    };
  } catch (error) {
    console.error("[pdf-parser]", error);
    return {
      success: false,
      error: "Could not extract text from this PDF. Please try a different file.",
    };
  }
}
