"""
Text Preprocessing and TF-IDF Feature Extraction Module
Provides clean tokenization, stopword removal, and vector representation
with cosine similarity computation.
"""
import re
import math
from typing import List, Dict, Any, Tuple

DEFAULT_STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
    'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
    'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more',
    'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
    'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
    'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
    'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
}

def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text to alphanumeric lowercase words."""
    if not text:
        return []
    cleaned = re.sub(r'[^a-zA-Z0-9\s-]', ' ', str(text).lower())
    tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 1]
    return [t for t in tokens if t not in DEFAULT_STOPWORDS]

class TFIDFVectorizer:
    """
    Explainable, robust TF-IDF Vectorizer.
    Calculates TF-IDF representations and cosine similarities.
    
    Formula:
        TF(t, d) = count(t, d) / |d|
        IDF(t, D) = ln((1 + |D|) / (1 + DF(t))) + 1
        TF-IDF(t, d) = TF(t, d) * IDF(t, D)
        Cosine(A, B) = (A · B) / (||A|| * ||B||)
    """
    def __init__(self):
        self.vocabulary: Dict[str, int] = {}
        self.idf_weights: Dict[str, float] = {}
        self.document_count: int = 0

    def fit(self, documents: List[str]):
        """Fit vectorizer on a corpus of documents."""
        self.document_count = len(documents)
        df_counts: Dict[str, int] = {}

        tokenized_docs = [tokenize(doc) for doc in documents]
        for tokens in tokenized_docs:
            unique_terms = set(tokens)
            for term in unique_terms:
                df_counts[term] = df_counts.get(term, 0) + 1

        # Build vocabulary sorted by term frequency
        vocab_terms = sorted(df_counts.keys())
        self.vocabulary = {term: idx for idx, term in enumerate(vocab_terms)}

        # Compute smoothed IDF weights
        for term, df in df_counts.items():
            self.idf_weights[term] = math.log((1 + self.document_count) / (1 + df)) + 1.0

        return self

    def transform(self, doc: str) -> Dict[str, float]:
        """Convert a document into an L2-normalized sparse TF-IDF vector."""
        tokens = tokenize(doc)
        if not tokens:
            return {}

        tf_counts: Dict[str, int] = {}
        for t in tokens:
            tf_counts[t] = tf_counts.get(t, 0) + 1

        doc_len = len(tokens)
        vector: Dict[str, float] = {}

        for term, count in tf_counts.items():
            if term in self.idf_weights:
                tf = count / doc_len
                idf = self.idf_weights[term]
                vector[term] = tf * idf

        # L2 Normalization
        norm = math.sqrt(sum(v * v for v in vector.values()))
        if norm > 0:
            for term in vector:
                vector[term] = vector[term] / norm

        return vector

    def cosine_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """
        Compute cosine similarity between two sparse L2-normalized vectors.
        Since vectors are unit normalized, similarity is the dot product.
        """
        if not vec_a or not vec_b:
            return 0.0

        # Iterate over the smaller vector
        if len(vec_a) > len(vec_b):
            vec_a, vec_b = vec_b, vec_a

        dot_product = sum(weight * vec_b.get(term, 0.0) for term, weight in vec_a.items())
        return max(0.0, min(1.0, dot_product))
