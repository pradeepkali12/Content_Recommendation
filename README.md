# AI Content Optimizer

This project uses Google Gemini AI to optimize and enhance written content for readability, SEO, engagement, and marketing assets. It provides automated rewriting and asset generation using advanced AI models.

## Features
- **Content Rewriting:** Improves readability, structure, and engagement using Gemini AI.
- **SEO & Marketing Assets:** Generates headlines, meta descriptions, FAQs, CTAs, summaries, keywords, and social media posts.
- **Customizable Output:** Target audience, tone, readability, and optimization goals can be specified.

## How It Works
1. **Input Content:**
   - Provide your original text/content to the application (via web UI or API).
2. **Content Analysis & Recommendations:**
   - The app analyzes your content and generates improvement recommendations.
3. **AI Rewriting:**
   - The `gemini_rewrite` function sends your content and recommendations to Gemini AI, which returns a rewritten version in Markdown format.
4. **Asset Generation:**
   - The `gemini_generate_assets` function requests Gemini AI to create marketing and SEO assets based on your content and target parameters.
5. **Output Display:**
   - Enhanced content and generated assets are displayed to the user.

## File Overview
- `app.py`: Main application (Flask or CLI) to run the optimizer.
- `gemini_utils.py`: Contains core logic for AI rewriting and asset generation.
- `requirements.txt`: Python dependencies.
- `templates/` & `static/`: Web UI files (if using Flask).

## Setup Instructions
1. **Clone the Repository:**
   ```powershell
   git clone <repo-url>
   cd ai-content-optimizer
   ```
2. **Create & Activate Virtual Environment:**
   ```powershell
   python -m venv myenv
   .\myenv\Scripts\Activate.ps1
   ```
3. **Install Dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```
4. **Run the Application:**
   - For web app:
     ```powershell
     python app.py
     ```
   - For CLI (if available):
     ```powershell
     python app.py --help
     ```

## Usage Example
- Enter your content in the web interface or via API.
- Specify target audience, tone, readability, and goals.
- Click "Optimize" to get enhanced content and assets.

## Notes
- The Gemini API key is hardcoded in `gemini_utils.py` for demo purposes. For production, use environment variables or secure storage.
- Ensure internet access for API calls.

## Troubleshooting
- If you see AI enhancement errors, check your internet connection and API limits.
- For rate limits, wait a few seconds and retry.

## License
MIT License

## Contact
For questions or support, contact the repository owner.

# AI Content Optimizer

A comprehensive AI-powered content optimization platform that uses advanced NLP techniques to analyze, enhance, and optimize written content for better readability, SEO performance, and engagement.

## 🚀 Features

### Content Analysis
- **Readability Analysis**: Flesch-Kincaid grade level, reading ease, sentence length analysis
- **SEO Optimization**: Heading structure analysis, keyword density, meta description optimization
- **Content Structure**: Paragraph count, sentence analysis, named entity recognition
- **Tone Detection**: Automated tone classification (formal, casual, expert, persuasive, neutral)
- **Passive Voice Detection**: Identifies and quantifies passive voice usage

### AI-Powered Enhancement
- **Content Rewriting**: Uses Gemini AI to rewrite content for better readability and engagement
- **Marketing Assets Generation**: Automatic creation of headlines, meta descriptions, FAQs
- **Social Media Posts**: Generated social media content for Twitter, LinkedIn, and Facebook
- **Call-to-Action Suggestions**: Multiple CTA options optimized for conversion

### Advanced Analytics
- **Comprehensive Scoring**: Overall scores for readability, SEO, and content quality
- **Detailed Metrics**: Word count, syllable count, difficult words identification
- **Entity Recognition**: Automatic detection and categorization of named entities
- **Keyword Analysis**: Top keyword extraction with density analysis

## 📋 Requirements

- Python 3.8+
- Virtual environment (recommended)
- Gemini API key (optional, for AI rewriting features)

## 🛠 Installation

### 1. Clone or Download the Project
```bash
git clone <repository-url>
cd ai-content-optimizer
```

### 2. Set up Virtual Environment
```bash
python -m venv myenv
# Windows
myenv\Scripts\activate
# macOS/Linux
source myenv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Download spaCy Language Model
```bash
python -m spacy download en_core_web_sm
```

### 5. Download NLTK Data
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
```

## 🚀 Usage

### Starting the Application
```bash
python app.py
```

The application will be available at `http://localhost:5000`

### Using the Web Interface

1. **Input Content**: Paste your content in the main text area
2. **Set Parameters**: 
   - Target Audience (students, professionals, general, etc.)
   - Target Reading Level (Grade 1-16+)
   - Desired Tone (professional, casual, formal, etc.)
   - Optimization Goal (engagement, SEO, conversion, etc.)

3. **Analyze Content**: Click "Analyze & Optimize Content" to get comprehensive analysis
4. **View Results**:
   - **Scores**: Overall readability, SEO, and content quality scores
   - **Detailed Analysis**: Tabbed interface showing readability metrics, SEO analysis, content structure, and tone detection
   - **Recommendations**: Prioritized list of optimization suggestions

5. **AI Enhancement** (Optional):
   - Enter your Gemini API key
   - Click "Generate Enhanced Content & Assets"
   - Get rewritten content and marketing assets

### API Endpoints

#### POST /optimize
Analyze content and get optimization recommendations.

**Request Body:**
```json
{
  "content": "Your content text here...",
  "target_audience": "general audience",
  "target_readability": 8,
  "target_tone": "professional",
  "optimization_goal": "engagement"
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "scores": {
      "readability_score": 75,
      "seo_score": 80,
      "content_quality_score": 70
    },
    "analysis": {
      "readability": {...},
      "seo": {...},
      "structure": {...},
      "tone": {...}
    }
  },
  "recommendations": [...]
}
```

#### POST /rewrite
Generate enhanced content and marketing assets using AI.

**Request Body:**
```json
{
  "content": "Your content text here...",
  "target_audience": "professionals",
  "target_readability": 8,
  "target_tone": "professional",
  "optimization_goal": "engagement",
  "gemini_api_key": "your-api-key-here"
}
```

## 🔧 Configuration

### Gemini AI Setup
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Enter the API key in the web interface for AI-powered features

### Environment Variables (Optional)
Create a `.env` file for default configurations:
```env
GEMINI_API_KEY=your_default_api_key_here
DEFAULT_TARGET_READABILITY=8
DEFAULT_TONE=professional
```

## 📊 Analysis Metrics

### Readability Metrics
- **Flesch-Kincaid Grade Level**: Educational level required to understand the text
- **Flesch Reading Ease**: How easy the text is to read (0-100 scale)
- **Average Sentence Length**: Mean words per sentence
- **Passive Voice Percentage**: Amount of passive voice construction
- **Difficult Words Count**: Number of complex words

### SEO Metrics
- **Heading Structure**: H1, H2, H3 count and hierarchy analysis
- **Keyword Density**: Top keywords and their frequency
- **Content Length**: Total word count
- **Meta Description Analysis**: Length and optimization suggestions

### Content Structure
- **Sentence Count**: Total number of sentences
- **Paragraph Count**: Number of paragraphs
- **Named Entities**: People, places, organizations mentioned
- **Document Headings**: Complete heading structure

### Tone Analysis
- **Primary Tone Detection**: Dominant writing style
- **Tone Confidence Score**: Reliability of tone detection
- **Tone Breakdown**: Scores for formal, casual, expert, persuasive elements

## 🎯 Use Cases

### Content Creators
- Blog post optimization
- Article enhancement
- Social media content generation
- SEO improvement

### Marketing Teams
- Landing page optimization
- Email campaign content
- Marketing copy enhancement
- CTA optimization

### Educators
- Educational material simplification
- Reading level adjustment
- Student content creation
- Academic writing improvement

### Businesses
- Website content optimization
- Product description enhancement
- Corporate communication improvement
- Brand voice consistency

## 🔍 Advanced Features

### Content Recommendations
The system provides prioritized recommendations based on:
- **High Priority**: Critical issues affecting readability or SEO
- **Medium Priority**: Important improvements for better performance
- **Low Priority**: Minor enhancements for optimization

### AI Asset Generation
With Gemini API integration:
- Multiple headline variations
- SEO-optimized meta descriptions
- FAQ generation based on content
- Multiple CTA options
- Content summaries
- Keyword suggestions
- Social media posts for multiple platforms

### Copy-to-Clipboard Functionality
- One-click copying of any generated content
- Visual feedback for successful copying
- Fallback support for older browsers

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
```bash
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Using Docker (create Dockerfile)
docker build -t ai-content-optimizer .
docker run -p 5000:5000 ai-content-optimizer
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Dependencies

- **Flask**: Web framework
- **spaCy**: Advanced NLP processing
- **NLTK**: Natural language toolkit
- **TextStat**: Readability metrics
- **BeautifulSoup4**: HTML/XML parsing
- **scikit-learn**: Machine learning utilities
- **Requests**: HTTP library for API calls

## 📞 Support

For issues, questions, or contributions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs
4. Provide system information and error logs

## 🚀 Future Enhancements

- [ ] Multi-language support
- [ ] Advanced plagiarism detection
- [ ] Content performance tracking
- [ ] API rate limiting and caching
- [ ] Database integration for content history
- [ ] User authentication and profiles
- [ ] Batch content processing
- [ ] Integration with popular CMS platforms
- [ ] Mobile app development
- [ ] Enterprise features and analytics

## 📈 Version History

### v1.0.0 (Current)
- Initial release
- Complete NLP analysis pipeline
- AI-powered content rewriting
- Modern web interface
- Comprehensive metric analysis
- Marketing asset generation

---

**Made with ❤️ using Python, Flask, and advanced NLP technologies**
"# Content_Recommendation" 
