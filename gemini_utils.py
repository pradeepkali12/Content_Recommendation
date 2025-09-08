import requests
import json
import time

# Hardcoded API key - not visible to users
GEMINI_API_KEY = "ENTER_YOUR_API_KEY"

def gemini_rewrite(content, recommendations=None, target_params=None, api_key=None):
    """Rewrite content using Gemini AI with specific recommendations"""
    # Use hardcoded key if none provided, or ignore provided key
    actual_api_key = GEMINI_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={actual_api_key}"
    headers = {"Content-Type": "application/json"}
    
    # Build intelligent prompt based on recommendations
    improvement_points = []
    if recommendations:
        for rec in recommendations:
            if rec['priority'] in ['high', 'medium']:
                improvement_points.append(f"- {rec['message']}")
    
    target_info = ""
    if target_params:
        target_info = f"""
Target Requirements:
- Audience: {target_params.get('target_audience', 'general audience')}
- Reading Level: Grade {target_params.get('target_readability', 8)} (use simpler sentences and vocabulary)
- Tone: {target_params.get('target_tone', 'professional')}
- Goal: {target_params.get('optimization_goal', 'engagement')}
"""
    
    improvements_text = "\n".join(improvement_points) if improvement_points else "Improve overall readability and engagement"
    
    enhanced_prompt = f"""Please rewrite the following content with these specific improvements:

{improvements_text}

{target_info}

IMPORTANT FORMATTING REQUIREMENTS:
1. Use proper Markdown formatting with headers (# ## ###)
2. Add a compelling H1 title at the beginning
3. Structure content with clear sections using H2 and H3 headers
4. Use bullet points and numbered lists where appropriate
5. Make paragraphs concise (2-3 sentences max)
6. Add bold text for **key points** and emphasis
7. Include relevant subheadings to break up content
8. Ensure minimum 300 words for better SEO
9. Use simple vocabulary suitable for grade {target_params.get('target_readability', 8) if target_params else 8} reading level

Original Content:
{content}

Please provide a well-structured, engaging rewrite in Markdown format that addresses all the above requirements."""
    
    
    payload = {
        "contents": [{
            "parts": [{
                "text": enhanced_prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
            "topP": 0.8,
            "topK": 40
        }
    }
    
    try:
        # Add delay to avoid rate limits
        time.sleep(1)
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                return result['candidates'][0]['content']['parts'][0]['text']
            else:
                return f"[AI Enhancement: Unable to process content at this time]"
        elif response.status_code == 429:
            return f"[AI Enhancement: Service temporarily unavailable due to high demand. Please try again later.]"
        else:
            return f"[AI Enhancement: Service temporarily unavailable. Your original content analysis is still available above.]"
    except requests.exceptions.Timeout:
        return "[AI Enhancement: Request timeout. Please try again with shorter content.]"
    except requests.exceptions.RequestException as e:
        return f"[AI Enhancement: Currently unavailable. Your content analysis is still available above.]"
    except Exception as e:
        return f"[AI Enhancement: Temporarily unavailable. Please use the content analysis results above.]"

def gemini_generate_assets(content, target_params, api_key=None):
    """Generate additional content assets using Gemini AI"""
    # Use hardcoded key if none provided, or ignore provided key
    actual_api_key = GEMINI_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={actual_api_key}"
    headers = {"Content-Type": "application/json"}
    
    prompt = f"""
    Based on the following content, generate comprehensive marketing and SEO assets:

    Content: {content[:1000]}...  # Truncate for API limits
    
    Target Audience: {target_params.get('target_audience', 'general audience')}
    Target Tone: {target_params.get('target_tone', 'professional')}
    Optimization Goal: {target_params.get('optimization_goal', 'engagement')}

    Please provide a JSON response with the following structure:
    {{
        "headlines": ["headline1", "headline2", "headline3"],
        "meta_description": "SEO-optimized meta description under 155 characters",
        "faqs": [
            {{"question": "question1", "answer": "answer1"}},
            {{"question": "question2", "answer": "answer2"}},
            {{"question": "question3", "answer": "answer3"}}
        ],
        "cta_options": ["CTA1", "CTA2", "CTA3", "CTA4"],
        "summary": "Brief content summary",
        "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
        "social_media_posts": {{
            "twitter": "Tweet-length version",
            "linkedin": "Professional LinkedIn post",
            "facebook": "Engaging Facebook post"
        }}
    }}

    Ensure all content is optimized for the specified target audience and tone.
    """
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 2048,
            "topP": 0.9,
            "topK": 40
        }
    }
    
    try:
        # Add delay to avoid rate limits
        time.sleep(1)
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                generated_text = result['candidates'][0]['content']['parts'][0]['text']
                
                # Try to extract JSON from the response
                try:
                    # Look for JSON in the response
                    start_idx = generated_text.find('{')
                    end_idx = generated_text.rfind('}') + 1
                    if start_idx != -1 and end_idx != -1:
                        json_str = generated_text[start_idx:end_idx]
                        assets = json.loads(json_str)
                        return assets
                    else:
                        # Fallback to parsing text response
                        return parse_text_assets(generated_text)
                except json.JSONDecodeError:
                    return parse_text_assets(generated_text)
            else:
                return get_default_assets()
        else:
            return get_default_assets()
    except Exception as e:
        return get_default_assets()

def parse_text_assets(text):
    """Parse assets from plain text response if JSON parsing fails"""
    assets = {
        "headlines": [],
        "meta_description": "",
        "faqs": [],
        "cta_options": [],
        "summary": "",
        "keywords": [],
        "social_media_posts": {}
    }
    
    lines = text.split('\n')
    current_section = None
    
    for line in lines:
        line = line.strip()
        if 'headline' in line.lower():
            current_section = 'headlines'
        elif 'meta description' in line.lower():
            current_section = 'meta_description'
        elif 'faq' in line.lower():
            current_section = 'faqs'
        elif 'cta' in line.lower() or 'call to action' in line.lower():
            current_section = 'cta_options'
        elif 'summary' in line.lower():
            current_section = 'summary'
        elif 'keyword' in line.lower():
            current_section = 'keywords'
        elif line.startswith('- ') or line.startswith('• '):
            content = line[2:].strip()
            if current_section == 'headlines' and len(content) > 10:
                assets['headlines'].append(content)
            elif current_section == 'cta_options' and len(content) > 5:
                assets['cta_options'].append(content)
            elif current_section == 'keywords' and len(content) > 2:
                assets['keywords'].append(content)
    
    # Fill with defaults if parsing didn't work well
    if len(assets['headlines']) < 3:
        assets['headlines'] = get_default_assets()['headlines']
    if not assets['meta_description']:
        assets['meta_description'] = get_default_assets()['meta_description']
    if len(assets['faqs']) < 3:
        assets['faqs'] = get_default_assets()['faqs']
    if len(assets['cta_options']) < 3:
        assets['cta_options'] = get_default_assets()['cta_options']
    
    return assets

def get_default_assets():
    """Provide default assets when AI generation fails"""
    return {
        "headlines": [
            "Transform Your Content with AI-Powered Optimization",
            "Boost Engagement with Smart Content Enhancement",
            "Professional Content Optimization Made Easy"
        ],
        "meta_description": "Optimize your content with AI-powered tools for better readability, SEO, and engagement. Get actionable recommendations instantly.",
        "faqs": [
            {"question": "What is content optimization?", "answer": "Content optimization is the process of improving your content's readability, SEO performance, and engagement potential using data-driven insights."},
            {"question": "How does AI help with content optimization?", "answer": "AI analyzes your content for readability, tone, structure, and SEO factors, then provides specific recommendations for improvement."},
            {"question": "What metrics are analyzed?", "answer": "We analyze readability scores, keyword density, heading structure, tone detection, and passive voice usage among other factors."}
        ],
        "cta_options": [
            "Optimize Your Content Now",
            "Get Started Today",
            "Improve Your Content",
            "Try Content Optimization"
        ],
        "summary": "This content provides comprehensive guidance on optimizing written material for better performance and engagement.",
        "keywords": ["content optimization", "SEO", "readability", "AI tools", "content marketing"],
        "social_media_posts": {
            "twitter": "🚀 Optimize your content with AI! Get instant feedback on readability, SEO, and engagement. #ContentMarketing #AI",
            "linkedin": "Transform your content strategy with AI-powered optimization. Analyze readability, improve SEO, and boost engagement with data-driven insights.",
            "facebook": "Want better content performance? Our AI tool analyzes your writing and provides actionable recommendations to improve readability and engagement!"
        }
    }
