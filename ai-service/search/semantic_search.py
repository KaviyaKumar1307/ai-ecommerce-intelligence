"""
Semantic Product Search Engine
Uses TF-IDF Vector Space Model and Cosine Similarity to compute semantic relevance
between user natural-language queries and product attributes.
"""
from typing import List, Dict, Any
from preprocessing.text_preprocessor import TFIDFVectorizer, tokenize

class SemanticSearchEngine:
    def __init__(self):
        self.vectorizer = TFIDFVectorizer()
        self.product_vectors: Dict[int, Dict[str, float]] = {}
        self.product_corpus: Dict[int, str] = {}
        self.indexed: bool = False

    def build_product_text(self, product: Dict[str, Any]) -> str:
        """Create a rich consolidated text representation for indexing."""
        parts = [
            str(product.get('name', '')),
            str(product.get('brand', '')),
            str(product.get('category', '')),
            str(product.get('description', '')),
            str(product.get('features_text', ''))
        ]
        return " ".join([p for p in parts if p]).strip()

    def index_catalog(self, products: List[Dict[str, Any]]):
        """Build TF-IDF matrix for all catalog products."""
        self.product_corpus = {}
        docs = []
        product_ids = []

        for p in products:
            pid = p['id']
            text = self.build_product_text(p)
            self.product_corpus[pid] = text
            docs.append(text)
            product_ids.append(pid)

        if docs:
            self.vectorizer.fit(docs)
            self.product_vectors = {
                pid: self.vectorizer.transform(self.product_corpus[pid])
                for pid in product_ids
            }
            self.indexed = True

    def search(self, query: str, products: List[Dict[str, Any]], top_k: int = 10) -> Dict[str, Any]:
        """
        Execute semantic search.
        If catalog has changed or not yet indexed, index it.
        """
        if not self.indexed or len(self.product_vectors) != len(products):
            self.index_catalog(products)

        query_vec = self.vectorizer.transform(query)
        query_tokens = set(tokenize(query))

        scored_products = []
        for p in products:
            pid = p['id']
            p_vec = self.product_vectors.get(pid, {})
            score = self.vectorizer.cosine_similarity(query_vec, p_vec)

            # Check overlap terms for transparent explanation
            p_tokens = set(tokenize(self.product_corpus.get(pid, '')))
            overlap = query_tokens.intersection(p_tokens)

            explanation = (
                f"Cosine similarity: {score:.3f}. Matched concepts: {', '.join(sorted(overlap))}"
                if overlap else f"Cosine similarity: {score:.3f} based on contextual semantics."
            )

            scored_products.append({
                "id": pid,
                "name": p.get("name"),
                "similarity_score": round(float(score), 4),
                "matched_terms": list(overlap),
                "explanation": explanation
            })

        # Rank descending by similarity score
        scored_products.sort(key=lambda x: x['similarity_score'], reverse=True)

        # Filter out completely unrelated (score == 0) unless nothing matches
        relevant = [sp for sp in scored_products if sp['similarity_score'] > 0.02]
        if not relevant and scored_products:
            relevant = scored_products[:top_k]
        else:
            relevant = relevant[:top_k]

        return {
            "query": query,
            "algorithm": "TF-IDF + Cosine Similarity Vector Space Model",
            "formula": "cos(Q, D) = (Q · D) / (||Q|| * ||D||)",
            "total_matches": len(relevant),
            "results": relevant
        }
