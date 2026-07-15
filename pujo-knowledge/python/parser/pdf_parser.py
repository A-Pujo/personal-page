"""
PDF Parser using PyMuPDF
"""
import fitz  # PyMuPDF
import logging
import re
from collections import Counter
from pathlib import Path
from typing import Dict, List, Tuple
import json

logger = logging.getLogger(__name__)


class PDFParser:
    """Parse PDF documents and extract structured content"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)
        self.doc = None
        self.metadata = {}
        self.sections = []
    
    def open(self):
        """Open the PDF document"""
        try:
            self.doc = fitz.open(self.pdf_path)
            logger.info(f"Opened PDF: {self.pdf_path.name} ({self.doc.page_count} pages)")
            return self
        except Exception as e:
            logger.error(f"Failed to open PDF {self.pdf_path}: {e}")
            raise
    
    def close(self):
        """Close the PDF document"""
        if self.doc:
            self.doc.close()
    
    def __enter__(self):
        return self.open()
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
    
    def extract_metadata(self) -> Dict:
        """Extract PDF metadata"""
        if not self.doc:
            raise ValueError("Document not opened")
        
        metadata = self.doc.metadata
        
        self.metadata = {
            'title': metadata.get('title') or self.pdf_path.stem,
            'author': metadata.get('author', ''),
            'subject': metadata.get('subject', ''),
            'keywords': metadata.get('keywords', ''),
            'creator': metadata.get('creator', ''),
            'producer': metadata.get('producer', ''),
            'created': metadata.get('creationDate', ''),
            'modified': metadata.get('modDate', ''),
            'page_count': self.doc.page_count,
            'file_size': self.pdf_path.stat().st_size
        }
        
        return self.metadata
    
    def extract_text(self, page_num: int = None) -> str:
        """Extract text from a page or entire document"""
        if not self.doc:
            raise ValueError("Document not opened")
        
        if page_num is not None:
            if 0 <= page_num < self.doc.page_count:
                return self.doc[page_num].get_text()
            else:
                raise ValueError(f"Page {page_num} out of range")
        
        # Extract all pages
        text = ""
        for page in self.doc:
            text += page.get_text() + "\n\n"
        return text
    
    def extract_text_with_layout(self, page_num: int) -> Dict:
        """Extract text preserving layout information"""
        if not self.doc:
            raise ValueError("Document not opened")
        
        page = self.doc[page_num]
        
        # Get text blocks with position
        blocks = page.get_text("dict")["blocks"]
        
        text_blocks = []
        for block in blocks:
            if block["type"] == 0:  # Text block
                for line in block.get("lines", []):
                    line_text = ""
                    for span in line.get("spans", []):
                        line_text += span["text"]

                    if line_text.strip():
                        first_span = line["spans"][0] if line["spans"] else {}
                        font_name = first_span.get("font", "")
                        # Bit 4 (16) of the span flags marks bold in PyMuPDF;
                        # some fonts also only signal it via the font name.
                        is_bold = bool(first_span.get("flags", 0) & 16) or "Bold" in font_name

                        text_blocks.append({
                            "text": line_text,
                            "bbox": block["bbox"],
                            "font_size": first_span.get("size", 0),
                            "font": font_name,
                            "bold": is_bold
                        })

        return {
            "page": page_num,
            "blocks": text_blocks
        }
    
    def extract_images(self, output_dir: Path = None) -> List[Dict]:
        """Extract all images from the document"""
        if not self.doc:
            raise ValueError("Document not opened")
        
        images = []
        
        for page_num in range(self.doc.page_count):
            page = self.doc[page_num]
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = self.doc.extract_image(xref)
                
                image_info = {
                    "page": page_num,
                    "index": img_index,
                    "xref": xref,
                    "width": base_image["width"],
                    "height": base_image["height"],
                    "colorspace": base_image["colorspace"],
                    "ext": base_image["ext"]
                }
                
                if output_dir:
                    image_path = output_dir / f"page_{page_num}_img_{img_index}.{base_image['ext']}"
                    with open(image_path, "wb") as img_file:
                        img_file.write(base_image["image"])
                    image_info["path"] = str(image_path)
                
                images.append(image_info)
        
        logger.info(f"Extracted {len(images)} images")
        return images
    
    def detect_sections(self) -> List[Dict]:
        """
        Detect document sections based on font sizes and formatting
        This is a heuristic approach - can be enhanced with ML models

        Headings are identified relative to the document's own body-text
        size rather than a fixed absolute threshold, since academic PDFs
        commonly use bold headings at or below typical "large font"
        cutoffs (e.g. a 10pt bold "ABSTRACT" next to 10pt body text).
        Lines that repeat verbatim across multiple pages (running
        headers/footers) and bare page numbers are excluded as headings.
        """
        if not self.doc:
            raise ValueError("Document not opened")

        # First pass: gather every line so we can compute the body-text
        # size and spot repeating headers/footers before classifying.
        pages_blocks = []
        size_weights = Counter()
        line_page_counts = Counter()

        for page_num in range(self.doc.page_count):
            layout = self.extract_text_with_layout(page_num)
            pages_blocks.append(layout["blocks"])

            for block in layout["blocks"]:
                text = block["text"].strip()
                if not text:
                    continue
                size_weights[round(block["font_size"], 1)] += len(text)
                line_page_counts[text] += 1

        body_size = size_weights.most_common(1)[0][0] if size_weights else 0
        repeated_lines = {
            text for text, count in line_page_counts.items() if count > 1
        }

        def is_heading(text: str, font_size: float, bold: bool) -> bool:
            if not text or len(text) >= 200:
                return False
            if text in repeated_lines or re.fullmatch(r'\d+', text):
                return False
            # Notably larger than body text (e.g. a title), or bold at/above
            # body size (e.g. "ABSTRACT", "1. INTRODUCTION" in this paper).
            return font_size >= body_size * 1.4 or (
                bold and font_size >= body_size - 0.5
            )

        sections = []
        current_section = None

        for page_num, blocks in enumerate(pages_blocks):
            for block in blocks:
                text = block["text"].strip()
                if not text:
                    continue
                font_size = block["font_size"]
                bold = block.get("bold", False)

                if is_heading(text, font_size, bold):
                    if current_section:
                        sections.append(current_section)

                    current_section = {
                        "title": text,
                        "start_page": page_num,
                        "content": "",
                        "type": self._classify_section(text)
                    }
                elif current_section:
                    current_section["content"] += text + " "

        if current_section:
            sections.append(current_section)

        self.sections = sections
        logger.info(f"Detected {len(sections)} sections (body font size: {body_size}pt)")
        return sections
    
    def _classify_section(self, title: str) -> str:
        """Classify section type based on title"""
        title_lower = title.lower()
        
        section_types = {
            'abstract': ['abstract', 'summary'],
            'introduction': ['introduction', 'background'],
            'methodology': ['methodology', 'methods', 'approach'],
            'results': ['results', 'findings', 'experiments'],
            'discussion': ['discussion', 'analysis'],
            'conclusion': ['conclusion', 'conclusions'],
            'references': ['references', 'bibliography', 'citations'],
            'appendix': ['appendix', 'supplementary']
        }
        
        for section_type, keywords in section_types.items():
            if any(keyword in title_lower for keyword in keywords):
                return section_type
        
        return 'other'
    
    def extract_tables(self, page_num: int = None) -> List[Dict]:
        """Extract tables from the document"""
        if not self.doc:
            raise ValueError("Document not opened")
        
        # This is a basic implementation
        # For better table extraction, use camelot or pdfplumber
        tables = []
        
        pages = [page_num] if page_num is not None else range(self.doc.page_count)
        
        for pnum in pages:
            page = self.doc[pnum]
            # Get tables using PyMuPDF's table detection
            tabs = page.find_tables()
            
            for table_index, table in enumerate(tabs):
                table_data = table.extract()
                tables.append({
                    "page": pnum,
                    "index": table_index,
                    "rows": len(table_data),
                    "cols": len(table_data[0]) if table_data else 0,
                    "data": table_data
                })
        
        return tables
    
    def get_page_dimensions(self, page_num: int) -> Tuple[float, float]:
        """Get page dimensions (width, height) in points"""
        if not self.doc:
            raise ValueError("Document not opened")
        
        page = self.doc[page_num]
        rect = page.rect
        return (rect.width, rect.height)
    
    def to_json(self, output_path: Path = None) -> Dict:
        """Export parsed content to JSON"""
        data = {
            "metadata": self.metadata,
            "sections": self.sections,
            "page_count": self.doc.page_count if self.doc else 0
        }
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        
        return data


def parse_pdf(pdf_path: str, extract_images: bool = False, image_output_dir: Path = None) -> Dict:
    """
    Convenience function to parse a PDF and extract all content
    
    Args:
        pdf_path: Path to PDF file
        extract_images: Whether to extract images
        image_output_dir: Directory to save extracted images
    
    Returns:
        Dict containing all parsed content
    """
    with PDFParser(pdf_path) as parser:
        metadata = parser.extract_metadata()
        sections = parser.detect_sections()
        
        result = {
            "metadata": metadata,
            "sections": sections,
            "full_text": parser.extract_text()
        }
        
        if extract_images and image_output_dir:
            result["images"] = parser.extract_images(image_output_dir)
        
        return result
