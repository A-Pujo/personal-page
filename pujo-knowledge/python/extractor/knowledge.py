"""
Knowledge Extractor - Extract concepts, definitions, and relationships
"""
import logging
import re
from typing import List, Dict, Tuple
from llm.client import llm_client
from config import settings

logger = logging.getLogger(__name__)


class KnowledgeExtractor:
    """Extract structured knowledge from text"""
    
    def __init__(self):
        self.llm = llm_client
    
    def extract_concepts(self, text: str, max_concepts: int = 20) -> List[Dict]:
        """
        Extract key concepts from text
        
        Args:
            text: Text to analyze
            max_concepts: Maximum number of concepts to extract
        
        Returns:
            List of concept dicts
        """
        try:
            concepts = self.llm.extract_concepts(text)
            return concepts[:max_concepts]
        except Exception as e:
            logger.error(f"Failed to extract concepts: {e}")
            return []
    
    def extract_definitions(self, text: str) -> List[Dict[str, str]]:
        """
        Extract definitions from text
        
        Args:
            text: Text to analyze
        
        Returns:
            List of dicts with 'term' and 'definition'
        """
        definitions = []
        
        # Pattern for "X is defined as Y" or "X refers to Y"
        patterns = [
            r'(\b[A-Z][a-zA-Z\s]+)\s+is defined as\s+([^.]+)',
            r'(\b[A-Z][a-zA-Z\s]+)\s+refers to\s+([^.]+)',
            r'(\b[A-Z][a-zA-Z\s]+)\s+is\s+([^.]+that[^.]+)',
            r'Define\s+(\b[A-Z][a-zA-Z\s]+)\s+as\s+([^.]+)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                term = match.group(1).strip()
                definition = match.group(2).strip()
                
                if len(term) > 3 and len(definition) > 10:
                    definitions.append({
                        'term': term,
                        'definition': definition
                    })
        
        return definitions
    
    def extract_equations(self, text: str) -> List[Dict]:
        """
        Extract mathematical equations from text
        
        Args:
            text: Text to analyze
        
        Returns:
            List of equation dicts
        """
        equations = []
        
        # Pattern for equations (simple heuristic)
        # Look for lines with =, mathematical symbols
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            if '=' in line and any(symbol in line for symbol in ['+', '-', '*', '/', '^', '∑', '∫']):
                equations.append({
                    'equation': line.strip(),
                    'line_number': i,
                    'context': ' '.join(lines[max(0, i-1):min(len(lines), i+2)])
                })
        
        return equations
    
    def extract_algorithms(self, text: str) -> List[Dict]:
        """
        Extract algorithm descriptions from text
        
        Args:
            text: Text to analyze
        
        Returns:
            List of algorithm dicts
        """
        algorithms = []
        
        # Look for algorithm keywords
        algorithm_patterns = [
            r'Algorithm\s+\d+:?\s+([^\n]+)',
            r'Procedure\s+([^\n]+)',
            r'Method:?\s+([^\n]+)'
        ]
        
        for pattern in algorithm_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                algorithms.append({
                    'name': match.group(1).strip(),
                    'text': match.group(0)
                })
        
        return algorithms
    
    def extract_assumptions(self, text: str) -> List[str]:
        """
        Extract assumptions from text
        
        Args:
            text: Text to analyze
        
        Returns:
            List of assumption strings
        """
        assumptions = []
        
        # Look for assumption patterns
        patterns = [
            r'[Aa]ssume\s+that\s+([^.]+)',
            r'[Aa]ssumption\s+\d+:?\s+([^.\n]+)',
            r'[Ww]e assume\s+([^.]+)',
            r'[Uu]nder the assumption\s+([^.]+)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                assumption = match.group(1).strip()
                if len(assumption) > 10:
                    assumptions.append(assumption)
        
        return assumptions
    
    def extract_relationships(self, concepts: List[Dict]) -> List[Dict]:
        """
        Extract relationships between concepts
        
        Args:
            concepts: List of concept dicts
        
        Returns:
            List of relationship dicts
        """
        # This is a simplified version
        # In a full implementation, use NLP techniques or LLM
        relationships = []
        
        relationship_keywords = {
            'uses': ['uses', 'utilizes', 'employs'],
            'requires': ['requires', 'needs', 'depends on'],
            'produces': ['produces', 'generates', 'creates'],
            'related_to': ['related to', 'similar to', 'associated with']
        }
        
        # For now, return empty - can be enhanced with NLP
        return relationships
    
    def extract_citations(self, text: str) -> List[Dict]:
        """
        Extract citations from text
        
        Args:
            text: Text to analyze
        
        Returns:
            List of citation dicts
        """
        citations = []
        
        # Pattern for citations like [1], (Author, Year), etc.
        patterns = [
            r'\[(\d+)\]',
            r'\(([A-Z][a-z]+,?\s+\d{4})\)',
            r'\(([A-Z][a-z]+\s+et al\.,?\s+\d{4})\)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                citations.append({
                    'text': match.group(0),
                    'reference': match.group(1)
                })
        
        return citations
    
    def extract_key_points(self, text: str, num_points: int = 5) -> List[str]:
        """
        Extract key points from text
        
        Args:
            text: Text to analyze
            num_points: Number of key points to extract
        
        Returns:
            List of key point strings
        """
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        # Simple heuristic: prefer sentences with keywords
        keywords = [
            'important', 'key', 'main', 'critical', 'significant',
            'conclude', 'find', 'show', 'demonstrate', 'prove'
        ]
        
        scored_sentences = []
        for sentence in sentences:
            score = sum(1 for keyword in keywords if keyword in sentence.lower())
            scored_sentences.append((score, sentence))
        
        # Sort by score and return top N
        scored_sentences.sort(reverse=True, key=lambda x: x[0])
        return [sent for _, sent in scored_sentences[:num_points]]
    
    def classify_document(self, cover_text: str) -> Dict[str, object]:
        """
        Classify a document's field, subject area, and material type using
        the cover pages only (title/authors/abstract/TOC), which is enough
        signal for classification while keeping the LLM call cheap.

        Args:
            cover_text: Text from roughly the first 1-3 pages of the document

        Returns:
            Dict with 'field', 'subject_area', 'material_type', 'confidence'
        """
        messages = [
            {
                "role": "system",
                "content": "You are an expert academic librarian. Classify documents "
                            "from their cover pages. Respond with strict JSON only - "
                            "no markdown, no explanation."
            },
            {
                "role": "user",
                "content": f"""Read the following cover pages of a document (title, authors, \
abstract, table of contents, etc., if present) and classify it.

Return a JSON object with exactly these keys:
- "field": the broad academic/professional field (e.g. "Computer Science", "Economics", \
"Biology", "Physics", "Finance", "Mathematics", "Medicine", "Law", "Literature", "Engineering", "General")
- "subject_area": a more specific subject/topic within that field (e.g. "Machine Learning", \
"Macroeconomics", "Molecular Biology")
- "material_type": the kind of document (e.g. "Research Paper", "Textbook", "Lecture Notes", \
"Thesis", "Technical Report", "Slides", "Manual", "Article", "Other")
- "confidence": your confidence in this classification from 0.0 to 1.0

Text:
{cover_text}"""
            }
        ]

        try:
            response = self.llm.chat_completion(
                messages,
                model=settings.deepseek_model_flash,
                temperature=0.1,
                max_tokens=300
            )
            content = response['choices'][0]['message']['content']

            json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
            if json_match:
                content = json_match.group(1)

            import json
            result = json.loads(content)

            confidence = float(result.get('confidence', 0.5))
            confidence = max(0.0, min(confidence, 1.0))

            return {
                'field': result.get('field') or 'General',
                'subject_area': result.get('subject_area') or 'General',
                'material_type': result.get('material_type') or 'Other',
                'confidence': confidence
            }
        except Exception as e:
            logger.error(f"LLM classification failed, falling back to keyword match: {e}")
            subject, confidence = self._keyword_classify(cover_text)
            return {
                'field': subject,
                'subject_area': subject,
                'material_type': 'Other',
                'confidence': confidence
            }

    def _keyword_classify(self, text: str) -> Tuple[str, float]:
        """
        Fallback keyword-based classification, used only if the LLM
        classification call fails (e.g. DeepSeek is unreachable).

        Args:
            text: Document text

        Returns:
            Tuple of (subject_area, confidence)
        """
        subject_keywords = {
            'Machine Learning': ['neural network', 'machine learning', 'deep learning', 'training', 'model'],
            'Statistics': ['statistical', 'probability', 'hypothesis', 'significance', 'variance'],
            'Economics': ['economic', 'market', 'price', 'demand', 'supply', 'GDP'],
            'Finance': ['portfolio', 'investment', 'return', 'risk', 'asset', 'equity'],
            'Mathematics': ['theorem', 'proof', 'lemma', 'proposition', 'corollary'],
            'Computer Science': ['algorithm', 'complexity', 'data structure', 'runtime', 'optimization'],
            'Physics': ['energy', 'force', 'quantum', 'particle', 'wave'],
            'Biology': ['cell', 'protein', 'gene', 'organism', 'evolution']
        }

        text_lower = text.lower()
        scores = {}

        for subject, keywords in subject_keywords.items():
            count = sum(text_lower.count(keyword) for keyword in keywords)
            scores[subject] = count

        if not scores or max(scores.values()) == 0:
            return 'General', 0.5

        best_subject = max(scores, key=scores.get)
        max_score = scores[best_subject]
        total_score = sum(scores.values())

        confidence = min(max_score / total_score, 1.0) if total_score > 0 else 0.5

        return best_subject, confidence


# Global knowledge extractor instance
knowledge_extractor = KnowledgeExtractor()
