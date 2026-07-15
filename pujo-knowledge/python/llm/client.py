"""
LLM Client for DeepSeek API integration
"""
import requests
import logging
from typing import List, Dict, Optional, Generator
from config import settings

logger = logging.getLogger(__name__)


class DeepSeekClient:
    """Client for interacting with the DeepSeek API

    Uses deepseek-v4-flash for high-volume automated calls (concept
    extraction, summaries, exercise generation during document processing)
    and deepseek-v4-pro for interactive AI Tutor answers, where a single
    higher-quality response matters more than per-call cost.
    """

    def __init__(self, base_url: str = None, api_key: str = None):
        self.base_url = (base_url or settings.deepseek_url).rstrip('/')
        self.api_key = api_key or settings.deepseek_api_key
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = None,
        stream: bool = False
    ) -> Dict:
        """
        Send a chat completion request to DeepSeek

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: DeepSeek model to use (defaults to deepseek-v4-flash)
            temperature: Sampling temperature (0.0 to 2.0)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response

        Returns:
            Response dict with 'choices' containing the generated text
        """
        url = f"{self.base_url}/v1/chat/completions"

        payload = {
            "model": model or settings.deepseek_model_flash,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens or settings.max_tokens,
            "stream": stream
        }

        try:
            response = requests.post(url, json=payload, headers=self.headers, timeout=120)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"DeepSeek API error: {e}")
            raise
    
    def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = None
    ) -> Generator[str, None, None]:
        """
        Stream chat completion response

        Yields:
            Text chunks as they are generated
        """
        url = f"{self.base_url}/v1/chat/completions"

        payload = {
            "model": model or settings.deepseek_model_flash,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens or settings.max_tokens,
            "stream": True
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers=self.headers,
                stream=True,
                timeout=120
            )
            response.raise_for_status()

            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:]
                        if data != '[DONE]':
                            import json
                            chunk = json.loads(data)
                            if chunk['choices'][0].get('delta', {}).get('content'):
                                yield chunk['choices'][0]['delta']['content']
        except requests.exceptions.RequestException as e:
            logger.error(f"DeepSeek streaming error: {e}")
            raise
    
    def generate_summary(self, text: str, summary_type: str = "detailed") -> str:
        """
        Generate a summary of the given text
        
        Args:
            text: Text to summarize
            summary_type: Type of summary (quick, detailed, academic)
        
        Returns:
            Generated summary
        """
        prompts = {
            "quick": "Provide a brief 2-3 sentence summary of the following text:",
            "detailed": "Provide a comprehensive summary of the following text, covering all key points:",
            "academic": "Provide an academic-style summary including main arguments, methodology, and conclusions:"
        }
        
        prompt = prompts.get(summary_type, prompts["detailed"])
        
        messages = [
            {"role": "system", "content": "You are an expert at summarizing academic and technical content."},
            {"role": "user", "content": f"{prompt}\n\n{text}"}
        ]
        
        response = self.chat_completion(messages, model=settings.deepseek_model_flash, temperature=0.3)
        return response['choices'][0]['message']['content']

    def generate_structured_summary(self, sections_text: str) -> str:
        """
        Generate a single whole-document summary structured around the
        standard research-paper narrative arc.

        Args:
            sections_text: Combined, section-labeled excerpts from the
                document's introduction/methodology/results/discussion/
                conclusion sections

        Returns:
            A summary of at most 15 paragraphs
        """
        messages = [
            {
                "role": "system",
                "content": "You are an expert at summarizing academic and technical documents. "
                            "Preserve any mathematical notation exactly, written in LaTeX "
                            "(inline as $...$, display equations as $$...$$)."
            },
            {
                "role": "user",
                "content": f"""Summarize the following document in at most 15 paragraphs, \
covering (in order, only where applicable to this document): Introduction, Data, Method, \
Findings, and Conclusion. Skip any of these the document doesn't actually contain rather \
than padding. Preserve mathematical notation as LaTeX.

{sections_text}"""
            }
        ]

        response = self.chat_completion(messages, model=settings.deepseek_model_flash, temperature=0.3)
        return response['choices'][0]['message']['content']

    def extract_concepts(self, text: str) -> List[Dict[str, str]]:
        """
        Extract key concepts from text
        
        Args:
            text: Text to analyze
        
        Returns:
            List of concept dicts with 'name' and 'definition'
        """
        messages = [
            {
                "role": "system",
                "content": "You are an expert at extracting key concepts from academic texts. Return concepts in JSON format."
            },
            {
                "role": "user",
                "content": f"""Extract the key concepts from the following text. 
For each concept, provide:
- name: The concept name
- definition: A brief definition
- type: The type (theory, method, variable, etc.)

Return as JSON array.

Text:
{text}"""
            }
        ]
        
        response = self.chat_completion(messages, model=settings.deepseek_model_flash, temperature=0.2)
        content = response['choices'][0]['message']['content']

        # Try to parse JSON from response
        try:
            import json
            import re
            # Extract JSON from markdown code blocks if present
            json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
            if json_match:
                content = json_match.group(1)
            return json.loads(content)
        except:
            logger.warning("Failed to parse concepts as JSON")
            return []
    
    def generate_questions(
        self,
        text: str,
        num_questions: int = 5,
        difficulty: str = "medium"
    ) -> List[Dict]:
        """
        Generate questions from text
        
        Args:
            text: Text to generate questions from
            num_questions: Number of questions to generate
            difficulty: Difficulty level (easy, medium, hard)
        
        Returns:
            List of question dicts
        """
        messages = [
            {
                "role": "system",
                "content": "You are an expert educator creating study questions. Return questions in JSON format."
            },
            {
                "role": "user",
                "content": f"""Generate {num_questions} {difficulty} questions from the following text.

For each question, provide:
- question: The question text
- type: Question type (mcq, true_false, short_answer)
- options: Array of options (for MCQ)
- correct_answer: The correct answer
- explanation: Explanation of the answer

Return as JSON array.

Text:
{text}"""
            }
        ]
        
        response = self.chat_completion(messages, model=settings.deepseek_model_flash, temperature=0.5)
        content = response['choices'][0]['message']['content']

        try:
            import json
            import re
            json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
            if json_match:
                content = json_match.group(1)
            return json.loads(content)
        except:
            logger.warning("Failed to parse questions as JSON")
            return []
    
    def answer_question(
        self,
        question: str,
        context: str,
        chat_history: List[Dict] = None
    ) -> str:
        """
        Answer a question based on context (AI Tutor functionality)
        
        Args:
            question: The user's question
            context: Relevant context from documents
            chat_history: Previous conversation messages
        
        Returns:
            The answer
        """
        messages = [
            {
                "role": "system",
                "content": """You are an AI tutor helping students learn from their study materials. 
Provide clear, accurate answers based on the context provided. 
If the context doesn't contain enough information, say so."""
            }
        ]
        
        if chat_history:
            messages.extend(chat_history)
        
        messages.append({
            "role": "user",
            "content": f"""Context from study materials:
{context}

Question: {question}"""
        })
        
        response = self.chat_completion(messages, model=settings.deepseek_model_pro, temperature=0.7)
        return response['choices'][0]['message']['content']


# Global LLM client instance
llm_client = DeepSeekClient()
