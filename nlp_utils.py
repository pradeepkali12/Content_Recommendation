
import spacy
import nltk
from bs4 import BeautifulSoup
import textstat
import re
import string
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from gemini_utils import gemini_rewrite, gemini_generate_assets

# Load spaCy model and download necessary NLTK data
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Please install the English model: python -m spacy download en_core_web_sm")
    nlp = None

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.tag import pos_tag

class ContentOptimizer:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        
    def preprocess_content(self, text):
        """Step A: Pre-processing"""
        # Clean HTML tags
        soup = BeautifulSoup(text, "html.parser")
        
        # Extract headings for SEO analysis
        headings = {
            'h1': [h.get_text().strip() for h in soup.find_all('h1')],
            'h2': [h.get_text().strip() for h in soup.find_all('h2')],
            'h3': [h.get_text().strip() for h in soup.find_all('h3')]
        }
        
        # Get clean text
        clean_text = soup.get_text()
        
        # Segmentation
        sentences = sent_tokenize(clean_text)
        paragraphs = [p.strip() for p in clean_text.split('\n\n') if p.strip()]
        
        # Tokenization and linguistic analysis
        if nlp:
            doc = nlp(clean_text)
            tokens = [(token.text, token.pos_, token.dep_) for token in doc if not token.is_space]
            entities = [(ent.text, ent.label_) for ent in doc.ents]
        else:
            # Fallback to NLTK
            words = word_tokenize(clean_text)
            pos_tags = pos_tag(words)
            tokens = [(word, pos, '') for word, pos in pos_tags]
            entities = []
        
        return {
            'clean_text': clean_text,
            'sentences': sentences,
            'paragraphs': paragraphs,
            'tokens': tokens,
            'entities': entities,
            'headings': headings,
            'original_html': text != clean_text
        }
    
    def analyze_readability(self, text, target_level=8):
        """Analyze readability metrics"""
        metrics = {
            'flesch_kincaid_grade': textstat.flesch_kincaid_grade(text),
            'flesch_reading_ease': textstat.flesch_reading_ease(text),
            'avg_sentence_length': textstat.avg_sentence_length(text),
            'difficult_words': textstat.difficult_words(text),
            'syllable_count': textstat.syllable_count(text),
            'word_count': len(text.split())
        }
        
        # Passive voice detection (improved)
        passive_count = self.detect_passive_voice(text)
        metrics['passive_voice_count'] = passive_count
        metrics['passive_voice_percentage'] = (passive_count / len(sent_tokenize(text))) * 100 if sent_tokenize(text) else 0
        
        return metrics
    
    def detect_passive_voice(self, text):
        """Detect passive voice constructions"""
        passive_patterns = [
            r'\b(was|were|been|being|is|are|am)\s+\w+ed\b',
            r'\b(was|were|been|being|is|are|am)\s+\w+en\b',
            r'\bby\s+\w+\s+(was|were|been|being|is|are|am)',
        ]
        
        passive_count = 0
        for pattern in passive_patterns:
            passive_count += len(re.findall(pattern, text, re.IGNORECASE))
        
        return passive_count
    
    def analyze_topic_coverage(self, text, reference_topics=None):
        """Analyze topic coverage and keyword distribution"""
        words = [word.lower() for word in word_tokenize(text) 
                if word.lower() not in self.stop_words and word.isalpha()]
        
        # Word frequency analysis
        word_freq = Counter(words)
        
        # Topic modeling (simplified)
        if reference_topics:
            vectorizer = TfidfVectorizer(stop_words='english', max_features=100)
            try:
                text_vector = vectorizer.fit_transform([text])
                topic_vector = vectorizer.transform(reference_topics)
                similarity = cosine_similarity(text_vector, topic_vector).mean()
                coverage_score = min(similarity * 100, 100)
            except:
                coverage_score = 50  # Default score if analysis fails
        else:
            # Basic coverage based on content length and diversity
            unique_words = len(set(words))
            total_words = len(words)
            coverage_score = min((unique_words / max(total_words * 0.1, 1)) * 100, 100)
        
        return {
            'coverage_score': coverage_score,
            'word_frequency': dict(word_freq.most_common(10)),
            'unique_words': len(set(words)),
            'total_words': len(words),
            'lexical_diversity': len(set(words)) / len(words) if words else 0
        }
    
    def analyze_seo_features(self, processed_content, text):
        """Analyze SEO-related features"""
        headings = processed_content['headings']
        
        seo_analysis = {
            'heading_structure': {
                'h1_count': len(headings['h1']),
                'h2_count': len(headings['h2']),
                'h3_count': len(headings['h3']),
                'proper_hierarchy': len(headings['h1']) == 1 and len(headings['h2']) > 0
            },
            'content_length': len(text.split()),
            'meta_title_length': len(headings['h1'][0]) if headings['h1'] else 0,
            'keyword_density': self.calculate_keyword_density(text)
        }
        
        return seo_analysis
    
    def calculate_keyword_density(self, text, top_n=5):
        """Calculate keyword density for top keywords"""
        words = [word.lower() for word in word_tokenize(text) 
                if word.lower() not in self.stop_words and word.isalpha() and len(word) > 3]
        
        total_words = len(words)
        word_freq = Counter(words)
        
        density = {}
        for word, count in word_freq.most_common(top_n):
            density[word] = (count / total_words) * 100
        
        return density
    
    def detect_tone(self, text):
        """Detect tone and style of the content"""
        # Simplified tone detection based on linguistic features
        formal_indicators = ['furthermore', 'moreover', 'consequently', 'therefore', 'thus', 'hence']
        casual_indicators = ['really', 'pretty', 'quite', 'sort of', 'kind of', 'stuff', 'things']
        expert_indicators = ['methodology', 'implementation', 'framework', 'analysis', 'evaluation']
        persuasive_indicators = ['should', 'must', 'need to', 'important', 'essential', 'critical']
        
        text_lower = text.lower()
        
        scores = {
            'formal': sum(1 for indicator in formal_indicators if indicator in text_lower),
            'casual': sum(1 for indicator in casual_indicators if indicator in text_lower),
            'expert': sum(1 for indicator in expert_indicators if indicator in text_lower),
            'persuasive': sum(1 for indicator in persuasive_indicators if indicator in text_lower)
        }
        
        # Determine dominant tone
        dominant_tone = max(scores, key=scores.get) if any(scores.values()) else 'neutral'
        
        return {
            'detected_tone': dominant_tone,
            'tone_scores': scores,
            'confidence': max(scores.values()) / len(text.split()) * 100 if text.split() else 0
        }
    
    def generate_recommendations(self, analysis_results, target_params):
        """Generate specific optimization recommendations"""
        recommendations = []
        
        # Readability recommendations
        readability = analysis_results['readability']
        target_grade = target_params.get('target_readability', 8)
        
        if readability['flesch_kincaid_grade'] > target_grade:
            recommendations.append({
                'type': 'readability',
                'priority': 'high',
                'message': f"Reading grade too high ({readability['flesch_kincaid_grade']:.1f}) → target {target_grade}. Shorten sentences and use simpler words.",
                'current_value': readability['flesch_kincaid_grade'],
                'target_value': target_grade
            })
        
        if readability['avg_sentence_length'] > 20:
            recommendations.append({
                'type': 'readability',
                'priority': 'medium',
                'message': f"Average sentence length too long ({readability['avg_sentence_length']:.1f} words). Aim for 15-20 words per sentence.",
                'current_value': readability['avg_sentence_length'],
                'target_value': 20
            })
        
        if readability['passive_voice_percentage'] > 10:
            recommendations.append({
                'type': 'style',
                'priority': 'medium',
                'message': f"High passive voice usage ({readability['passive_voice_percentage']:.1f}%). Use active voice for better engagement.",
                'current_value': readability['passive_voice_percentage'],
                'target_value': 10
            })
        
        # SEO recommendations
        seo = analysis_results['seo']
        
        if seo['heading_structure']['h1_count'] == 0:
            recommendations.append({
                'type': 'seo',
                'priority': 'high',
                'message': "Missing H1 heading. Add a main title to your content.",
                'current_value': 0,
                'target_value': 1
            })
        elif seo['heading_structure']['h1_count'] > 1:
            recommendations.append({
                'type': 'seo',
                'priority': 'medium',
                'message': f"Multiple H1 headings found ({seo['heading_structure']['h1_count']}). Use only one H1 per page.",
                'current_value': seo['heading_structure']['h1_count'],
                'target_value': 1
            })
        
        if seo['heading_structure']['h2_count'] == 0 and seo['content_length'] > 300:
            recommendations.append({
                'type': 'seo',
                'priority': 'medium',
                'message': "No H2 headings found. Add section headings to improve structure and SEO.",
                'current_value': 0,
                'target_value': 2
            })
        
        # Check keyword density for stuffing
        for keyword, density in seo['keyword_density'].items():
            if density > 3:
                recommendations.append({
                    'type': 'seo',
                    'priority': 'medium',
                    'message': f"Keyword '{keyword}' density too high ({density:.1f}%). Reduce to avoid keyword stuffing.",
                    'current_value': density,
                    'target_value': 3
                })
        
        # Content length recommendations
        if seo['content_length'] < 300:
            recommendations.append({
                'type': 'content',
                'priority': 'high',
                'message': f"Content too short ({seo['content_length']} words). Aim for at least 300 words for better SEO.",
                'current_value': seo['content_length'],
                'target_value': 300
            })
        
        # Topic coverage recommendations
        topic_coverage = analysis_results['topic_coverage']
        if topic_coverage['coverage_score'] < 70:
            recommendations.append({
                'type': 'content',
                'priority': 'medium',
                'message': f"Low topic coverage score ({topic_coverage['coverage_score']:.1f}%). Consider adding more relevant subtopics and keywords.",
                'current_value': topic_coverage['coverage_score'],
                'target_value': 70
            })
        
        # Lexical diversity
        if topic_coverage['lexical_diversity'] < 0.5:
            recommendations.append({
                'type': 'style',
                'priority': 'low',
                'message': f"Low vocabulary diversity ({topic_coverage['lexical_diversity']:.2f}). Use more varied vocabulary.",
                'current_value': topic_coverage['lexical_diversity'],
                'target_value': 0.5
            })
        
        return sorted(recommendations, key=lambda x: {'high': 3, 'medium': 2, 'low': 1}[x['priority']], reverse=True)

def process_content(data):
    """Main content processing function"""
    optimizer = ContentOptimizer()
    
    text = data['content']
    target_params = {
        'target_audience': data.get('target_audience', ''),
        'target_readability': int(data.get('target_readability', 8)),
        'target_tone': data.get('target_tone', ''),
        'optimization_goal': data.get('optimization_goal', '')
    }
    
    # Step A: Pre-processing
    processed_content = optimizer.preprocess_content(text)
    
    # Step B: Content Analysis
    readability_analysis = optimizer.analyze_readability(processed_content['clean_text'], target_params['target_readability'])
    topic_analysis = optimizer.analyze_topic_coverage(processed_content['clean_text'])
    seo_analysis = optimizer.analyze_seo_features(processed_content, processed_content['clean_text'])
    tone_analysis = optimizer.detect_tone(processed_content['clean_text'])
    
    # Compile analysis results
    analysis_results = {
        'readability': readability_analysis,
        'topic_coverage': topic_analysis,
        'seo': seo_analysis,
        'tone': tone_analysis,
        'structure': {
            'sentence_count': len(processed_content['sentences']),
            'paragraph_count': len(processed_content['paragraphs']),
            'entities': processed_content['entities'][:10],  # Limit for display
            'headings': processed_content['headings']
        }
    }
    
    # Step C: Generate recommendations
    recommendations = optimizer.generate_recommendations(analysis_results, target_params)
    
    # Calculate overall scores
    overall_scores = {
        'readability_score': max(0, min(100, 100 - (analysis_results['readability']['flesch_kincaid_grade'] - target_params['target_readability']) * 10)),
        'seo_score': calculate_seo_score(analysis_results['seo']),
        'content_quality_score': min(100, analysis_results['topic_coverage']['coverage_score'])
    }
    
    report = {
        'analysis': analysis_results,
        'scores': overall_scores,
        'target_params': target_params
    }
    
    return report, recommendations

def calculate_seo_score(seo_analysis):
    """Calculate overall SEO score"""
    score = 100
    
    # H1 penalty
    if seo_analysis['heading_structure']['h1_count'] == 0:
        score -= 20
    elif seo_analysis['heading_structure']['h1_count'] > 1:
        score -= 10
    
    # H2 bonus
    if seo_analysis['heading_structure']['h2_count'] > 0:
        score += 5
    else:
        score -= 10
    
    # Content length
    if seo_analysis['content_length'] < 300:
        score -= 15
    elif seo_analysis['content_length'] > 2000:
        score += 10
    
    # Keyword density penalty for stuffing
    for density in seo_analysis['keyword_density'].values():
        if density > 3:
            score -= 5
    
    return max(0, min(100, score))

def generate_rewrite(data):
    """Generate rewritten content and assets using Gemini AI"""
    content = data['content']
    target_params = {
        'target_audience': data.get('target_audience', 'general audience'),
        'target_readability': data.get('target_readability', 8),
        'target_tone': data.get('target_tone', 'professional'),
        'optimization_goal': data.get('optimization_goal', 'engagement')
    }
    
    # First analyze the content to get recommendations
    try:
        optimizer = ContentOptimizer()
        preprocessed_content = optimizer.preprocess_content(content)
        report, recommendations = process_content(data)
        
        # Pass both recommendations and target parameters to AI rewriter
        rewritten = gemini_rewrite(content, recommendations=recommendations, target_params=target_params)
        
        # Generate additional assets
        assets = gemini_generate_assets(content, target_params)
        
        return rewritten, assets
        
    except Exception as e:
        print(f"Error in generate_rewrite: {str(e)}")
        # Fallback to simple rewrite without recommendations
        rewritten = gemini_rewrite(content, target_params=target_params)
        assets = gemini_generate_assets(content, target_params)
        return rewritten, assets
