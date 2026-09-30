"""
AI Shopping Assistant
Parses conversational natural-language queries, extracts constraints
(budget, category, usage intent, specifications), queries actual catalog products,
and generates structured recommendations with explainable justification.
"""
import re
from typing import List, Dict, Any, Optional

CATEGORY_KEYWORDS = {
    'laptops': ['laptop', 'macbook', 'notebook', 'pc', 'computer', 'workstation', 'coding', 'programming', 'developer', 'ram', 'ssd'],
    'audio': ['headphone', 'headphones', 'earbud', 'earbuds', 'speaker', 'anc', 'noise cancelling', 'sound', 'mic', 'microphone'],
    'smartphones': ['phone', 'smartphone', 'mobile', 'galaxy', 'iphone', 'android', 'smartwatch', 'watch', 'wearable', 'camera'],
    'fitness': ['shoe', 'shoes', 'running', 'marathon', 'sneaker', 'gym', 'workout', 'yoga', 'rower', 'massager', 'dumbbell'],
    'office': ['chair', 'desk', 'lamp', 'mouse', 'keyboard', 'monitor', 'ergonomic', 'office', 'screen', 'espresso', 'mug']
}

INTENT_MAP = {
    'programming': ['programming', 'coding', 'developer', 'software', 'machine learning', 'data science', 'ai'],
    'gaming': ['gaming', 'game', 'gamer', 'rtx', 'fps', 'gpu'],
    'marathon': ['marathon', 'long-distance', 'running', 'road racing', 'jogging'],
    'work_from_home': ['home office', 'remote work', 'wfh', 'desk', 'ergonomic', 'back pain']
}

class ShoppingAssistant:
    def __init__(self):
        pass

    def parse_query(self, message: str) -> Dict[str, Any]:
        """
        Extract budget, category intent, usage intent, and technical specs from natural language.
        """
        lower = message.lower()

        # 1. Extract Price / Budget constraint (e.g. "under 70000", "below ₹5,000", "< 150000", "under 1.5 lakh")
        max_price = None
        price_patterns = [
            r'(?:under|below|less than|within|up to|budget of|max(?:imum)?)\s*(?:of)?\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(k|thousand|lakh|lac)?',
            r'(?:rs\.?|inr|₹)\s*([0-9]+(?:,[0-9]+)*)\s*(?:budget|or less)?'
        ]

        for pat in price_patterns:
            match = re.search(pat, lower)
            if match:
                raw_num = match.group(1).replace(',', '')
                val = float(raw_num)
                multiplier = match.group(2) if len(match.groups()) > 1 else None
                if multiplier in ['k', 'thousand']:
                    val *= 1000
                elif multiplier in ['lakh', 'lac']:
                    val *= 100000
                max_price = val
                break

        # 2. Extract Category
        matched_categories = []
        for cat_name, kw_list in CATEGORY_KEYWORDS.items():
            if any(re.search(r'\b' + re.escape(kw) + r'\b', lower) for kw in kw_list):
                matched_categories.append(cat_name)

        # 3. Extract Usage Intent
        detected_intents = []
        for intent_name, intent_kws in INTENT_MAP.items():
            if any(re.search(r'\b' + re.escape(ikw) + r'\b', lower) for ikw in intent_kws):
                detected_intents.append(intent_name)

        # 4. Extract Brand if explicitly mentioned
        brands = ['apple', 'dell', 'lenovo', 'asus', 'hp', 'sony', 'bose', 'samsung', 'google', 'nike', 'asics', 'hoka', 'logitech', 'herman miller']
        mentioned_brands = [b for b in brands if b in lower]

        return {
            "max_price": max_price,
            "detected_categories": matched_categories,
            "detected_intents": detected_intents,
            "brands": mentioned_brands,
            "raw_message": message
        }

    def process(
        self,
        message: str,
        history: List[Dict[str, str]],
        products: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        parsed = self.parse_query(message)
        max_price = parsed["max_price"]
        cats = parsed["detected_categories"]
        intents = parsed["detected_intents"]
        brands = parsed["brands"]

        candidates = []
        for p in products:
            p_price = float(p.get('price', 0))
            p_name = p.get('name', '').lower()
            p_desc = p.get('description', '').lower()
            p_brand = p.get('brand', '').lower()
            p_text = f"{p_name} {p_desc} {p_brand} {p.get('features_text', '').lower()}"

            # Filter budget
            if max_price is not None and p_price > max_price:
                continue

            # Compute match score based on extracted constraints
            score = 0.0
            reasons = []

            # Brand alignment
            if any(b in p_brand or b in p_name for b in brands):
                score += 3.0
                reasons.append(f"Matches preferred brand '{p.get('brand')}'")

            # Intent alignment
            for intent in intents:
                for kw in INTENT_MAP[intent]:
                    if kw in p_text:
                        score += 2.0
                        reasons.append(f"Optimized for {intent.replace('_', ' ')}: contains {kw}")
                        break

            # Category alignment
            for cat in cats:
                for kw in CATEGORY_KEYWORDS[cat]:
                    if kw in p_text:
                        score += 1.5
                        break

            # Rating factor
            score += (float(p.get('rating', 4.0)) - 4.0)

            if score > 0.5 or (not cats and not intents and max_price and p_price <= max_price):
                match_reason = "; ".join(reasons) if reasons else f"Within requested budget of ₹{max_price:,.0f}" if max_price else "Matches requested specifications"
                candidates.append({
                    "id": p['id'],
                    "name": p['name'],
                    "price": p_price,
                    "rating": p.get('rating'),
                    "score": round(score, 2),
                    "match_reason": match_reason
                })

        # Rank candidates by match score
        candidates.sort(key=lambda x: x['score'], reverse=True)
        top_candidates = candidates[:4]

        # Generate conversational, contextual explanation
        budget_str = f" under ₹{max_price:,.0f}" if max_price else ""
        intent_str = f" for {', '.join(intents).replace('_', ' ')}" if intents else ""
        category_str = f" in {', '.join(cats)}" if cats else ""

        if top_candidates:
            reply = (
                f"I found {len(top_candidates)} great options{budget_str}{intent_str}{category_str}. "
                f"Top pick: **{top_candidates[0]['name']}** priced at ₹{top_candidates[0]['price']:,.0f}. "
                f"{top_candidates[0]['match_reason']}."
            )
        else:
            # Helpful fallback if price is too tight
            cheapest = sorted([p for p in products if any(kw in f"{p['name']} {p['description']}".lower() for c in cats for kw in CATEGORY_KEYWORDS[c])], key=lambda x: float(x.get('price', 0)))[:2] if cats else []
            if cheapest and max_price:
                reply = (
                    f"I couldn't find options under ₹{max_price:,.0f} for your specific criteria. "
                    f"The closest available options start at ₹{float(cheapest[0]['price']):,.0f} for **{cheapest[0]['name']}**."
                )
                top_candidates = [{"id": c['id'], "name": c['name'], "price": float(c['price']), "match_reason": "Closest available alternative in this category"} for c in cheapest]
            else:
                reply = "I understand what you're looking for! Could you specify your budget or preferred specifications so I can narrow down the perfect match?"

        return {
            "reply": reply,
            "parsed_filters": {
                "budget_max": max_price,
                "categories": cats,
                "intents": intents,
                "brands": brands
            },
            "intent": intents[0] if intents else (cats[0] if cats else "general_inquiry"),
            "suggested_products": [
                {
                    "id": tc["id"],
                    "rank": idx + 1,
                    "match_reason": tc["match_reason"]
                }
                for idx, tc in enumerate(top_candidates)
            ]
        }
