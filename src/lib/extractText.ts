import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import AdmZip from "adm-zip";

export async function extractText(buffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.toLowerCase().split(".").pop();

  if (ext === "pdf") {
    const pdf = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await pdf.getText();
    await pdf.destroy();
    return result.text;
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === "pptx") {
    return extractPptxText(buffer);
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

function extractPptxText(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const texts: string[] = [];

  const entries = zip.getEntries();
  for (const entry of entries) {
    if (entry.entryName.startsWith("ppt/slides/slide") && entry.entryName.endsWith(".xml")) {
      const xml = entry.getData().toString("utf-8");
      const matches = xml.match(/<a:t>([^<]*)<\/a:t>/g);
      if (matches) {
        const slideText = matches
          .map((m) => m.replace(/<\/?a:t>/g, ""))
          .join(" ");
        texts.push(slideText);
      }
    }
  }

  return texts.join("\n\n");
}
