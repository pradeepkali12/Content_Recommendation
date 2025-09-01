// AI Content Optimizer JavaScript
class ContentOptimizer {
    constructor() {
        this.init();
        this.currentAnalysis = null;
        this.currentContent = null;
    }

    init() {
        this.bindEvents();
        this.initCharacterCounter();
        this.initTabs();
    }

    bindEvents() {
        // Form submission
        document.getElementById('contentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted');
            
            // Get content and validate
            const content = document.getElementById('content').value.trim();
            if (!content || content.length === 0) {
                alert('Please enter some content to analyze before submitting.');
                return false;
            }
            
            this.optimizeContent();
        });

        // Rewrite button
        document.getElementById('rewriteBtn').addEventListener('click', () => {
            this.rewriteContent();
        });

        // Copy functionality for generated content
        this.initCopyButtons();
        
        // Prevent form submission on Enter key in input fields (except textarea)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
    }

    initCharacterCounter() {
        const textarea = document.getElementById('content');
        const counter = document.getElementById('charCount');

        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            counter.textContent = count.toLocaleString();
            
            // Color coding based on length
            if (count < 100) {
                counter.style.color = '#ef4444'; // Red for too short
            } else if (count < 500) {
                counter.style.color = '#f59e0b'; // Orange for short
            } else if (count < 2000) {
                counter.style.color = '#10b981'; // Green for good
            } else {
                counter.style.color = '#6b7280'; // Gray for long
            }
        });
    }

    initTabs() {
        // Handle tab switching with lazy render
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabContainer = e.target.closest('.card');
                const tabButtons = tabContainer.querySelectorAll('.tab-btn');
                const tabPanels = tabContainer.querySelectorAll('.tab-panel');
                const targetTab = e.target.getAttribute('data-tab');

                // Remove active class from all tabs and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                e.target.classList.add('active');
                const targetPanel = tabContainer.querySelector(`#${targetTab}`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // Lazy render the selected panel if we have currentAnalysis
                if (this.currentAnalysis && tabContainer.classList.contains('analysis-card')) {
                    const { analysis } = this.currentAnalysis.report || {};
                    if (!analysis) return;
                    switch (targetTab) {
                        case 'readability':
                            this.displayReadabilityAnalysis(analysis.readability);
                            break;
                        case 'seo':
                            this.displaySEOAnalysis(analysis.seo);
                            break;
                        case 'structure':
                            this.displayStructureAnalysis(analysis.structure);
                            break;
                        case 'tone':
                            this.displayToneAnalysis(analysis.tone);
                            break;
                        default:
                            break;
                    }
                }

                // Enhanced content tabs lazy reveal; content already injected when rewrite done
                if (tabContainer.classList.contains('enhanced-card')) {
                    // nothing extra yet
                }
            }
        });
    }

    initCopyButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                this.copyToClipboard(e.target);
            }
        });
    }

    async optimizeContent() {
        try {
            console.log('Starting content optimization...');
            this.showLoading('Analyzing your content...');
            
            const formData = this.getFormData();
            console.log('Form data:', formData);
            
            // Validate content is not empty
            if (!formData.content || formData.content.trim().length === 0) {
                throw new Error('Please enter some content to analyze');
            }
            
            this.currentContent = formData.content;

            console.log('Sending request to /optimize...');
            const response = await fetch('/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                this.currentAnalysis = data;
                this.displayResults(data.report, data.recommendations);
                this.showRewriteSection();
            } else {
                this.showError(data.error || 'An error occurred during analysis');
            }
        } catch (error) {
            console.error('Error in optimizeContent:', error);
            this.showError('Error: ' + error.message);
        } finally {
            console.log('Hiding loading...');
            this.hideLoading();
        }
    }

    async rewriteContent() {
        try {
            this.showLoading('Generating enhanced content and assets...');

            const formData = this.getFormData();
            // No need to get API key from form - it's hardcoded in the backend
            
            const response = await fetch('/rewrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.displayEnhancedContent(data.rewritten, data.assets);
            } else {
                this.showError(data.error || 'An error occurred during rewriting');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Network error occurred. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    getFormData() {
        return {
            content: document.getElementById('content').value,
            target_audience: document.getElementById('target_audience').value,
            target_readability: parseInt(document.getElementById('target_readability').value) || 8,
            target_tone: document.getElementById('target_tone').value,
            optimization_goal: document.getElementById('optimization_goal').value
        };
    }

    displayResults(report, recommendations) {
        // Display scores immediately
        this.displayScores(report.scores);

        // Do NOT render analysis panels yet; wait for tab click (lazy)

        // Display recommendations
        this.displayRecommendations(recommendations);

        // Show results section
        const section = document.getElementById('resultsSection');
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });

        // Auto-activate first analysis tab (readability) once after results show
        const analysisCard = section.querySelector('.analysis-card');
        if (analysisCard) {
            const firstBtn = analysisCard.querySelector('.analysis-tabs .tab-btn[data-tab="readability"]');
            if (firstBtn && !firstBtn.classList.contains('active')) {
                firstBtn.click();
            }
        }
    }

    displayScores(scores) {
        const scoresGrid = document.getElementById('scoresGrid');
        scoresGrid.innerHTML = `
            <div class="score-item">
                <div class="score-value ${this.getScoreClass(scores.readability_score)}">
                    ${Math.round(scores.readability_score)}
                </div>
                <div class="score-label">Readability Score</div>
                <div class="progress-bar">
                    <div class="progress-fill ${this.getScoreClass(scores.readability_score)}" 
                         style="width: ${scores.readability_score}%"></div>
                </div>
            </div>
            <div class="score-item">
                <div class="score-value ${this.getScoreClass(scores.seo_score)}">
                    ${Math.round(scores.seo_score)}
                </div>
                <div class="score-label">SEO Score</div>
                <div class="progress-bar">
                    <div class="progress-fill ${this.getScoreClass(scores.seo_score)}" 
                         style="width: ${scores.seo_score}%"></div>
                </div>
            </div>
            <div class="score-item">
                <div class="score-value ${this.getScoreClass(scores.content_quality_score)}">
                    ${Math.round(scores.content_quality_score)}
                </div>
                <div class="score-label">Content Quality</div>
                <div class="progress-bar">
                    <div class="progress-fill ${this.getScoreClass(scores.content_quality_score)}" 
                         style="width: ${scores.content_quality_score}%"></div>
                </div>
            </div>
        `;
    }

    displayReadabilityAnalysis(readability) {
        const panel = document.getElementById('readability');
        panel.innerHTML = `
            <div class="metric-grid">
                <div class="metric-item">
                    <div class="metric-value">${readability.flesch_kincaid_grade.toFixed(1)}</div>
                    <div class="metric-label">Grade Level</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${readability.flesch_reading_ease.toFixed(0)}</div>
                    <div class="metric-label">Reading Ease</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${readability.avg_sentence_length.toFixed(1)}</div>
                    <div class="metric-label">Avg Sentence Length</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${readability.passive_voice_percentage.toFixed(1)}%</div>
                    <div class="metric-label">Passive Voice</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${readability.difficult_words}</div>
                    <div class="metric-label">Difficult Words</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${readability.word_count.toLocaleString()}</div>
                    <div class="metric-label">Word Count</div>
                </div>
            </div>
            <div class="mt-3">
                <h4>Reading Level Interpretation:</h4>
                <p>${this.getReadingLevelInterpretation(readability.flesch_kincaid_grade)}</p>
            </div>
        `;
    }

    displaySEOAnalysis(seo) {
        const panel = document.getElementById('seo');
        
        let keywordDensityHtml = '';
        for (const [keyword, density] of Object.entries(seo.keyword_density)) {
            keywordDensityHtml += `
                <div class="keyword-item">
                    <span class="keyword-name">${keyword}</span>
                    <span class="keyword-density">${density.toFixed(1)}%</span>
                </div>
            `;
        }

        panel.innerHTML = `
            <div class="metric-grid">
                <div class="metric-item">
                    <div class="metric-value">${seo.heading_structure.h1_count}</div>
                    <div class="metric-label">H1 Headings</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${seo.heading_structure.h2_count}</div>
                    <div class="metric-label">H2 Headings</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${seo.heading_structure.h3_count}</div>
                    <div class="metric-label">H3 Headings</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${seo.content_length.toLocaleString()}</div>
                    <div class="metric-label">Content Length</div>
                </div>
            </div>
            <div class="mt-3">
                <h4>Top Keywords by Density:</h4>
                <div class="keyword-list">
                    ${keywordDensityHtml}
                </div>
            </div>
            <div class="mt-3">
                <h4>Heading Structure Status:</h4>
                <p class="${seo.heading_structure.proper_hierarchy ? 'text-success' : 'text-warning'}">
                    ${seo.heading_structure.proper_hierarchy ? 
                        '✓ Proper heading hierarchy detected' : 
                        '⚠ Heading hierarchy needs improvement'}
                </p>
            </div>
        `;
    }

    displayStructureAnalysis(structure) {
        const panel = document.getElementById('structure');
        
        let entitiesHtml = '';
        structure.entities.slice(0, 10).forEach(([entity, label]) => {
            entitiesHtml += `<span class="entity-tag" title="${label}">${entity}</span> `;
        });

        let headingsHtml = '';
        Object.entries(structure.headings).forEach(([level, headings]) => {
            if (headings.length > 0) {
                headingsHtml += `<div class="heading-group">
                    <h5>${level.toUpperCase()} (${headings.length})</h5>
                    <ul>${headings.map(h => `<li>${h}</li>`).join('')}</ul>
                </div>`;
            }
        });

        panel.innerHTML = `
            <div class="metric-grid">
                <div class="metric-item">
                    <div class="metric-value">${structure.sentence_count}</div>
                    <div class="metric-label">Sentences</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${structure.paragraph_count}</div>
                    <div class="metric-label">Paragraphs</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${structure.entities.length}</div>
                    <div class="metric-label">Named Entities</div>
                </div>
            </div>
            <div class="mt-3">
                <h4>Document Headings:</h4>
                ${headingsHtml || '<p>No headings detected in the content.</p>'}
            </div>
            <div class="mt-3">
                <h4>Key Entities Detected:</h4>
                <div class="entities-container">
                    ${entitiesHtml || '<p>No named entities detected.</p>'}
                </div>
            </div>
        `;
    }

    displayToneAnalysis(tone) {
        const panel = document.getElementById('tone');
        
        let scoresHtml = '';
        Object.entries(tone.tone_scores).forEach(([toneType, score]) => {
            const percentage = (score / Math.max(...Object.values(tone.tone_scores))) * 100;
            scoresHtml += `
                <div class="tone-score-item">
                    <div class="tone-label">${this.capitalizeTone(toneType)}</div>
                    <div class="tone-bar">
                        <div class="tone-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="tone-value">${score}</div>
                </div>
            `;
        });

        panel.innerHTML = `
            <div class="tone-analysis">
                <div class="detected-tone">
                    <h4>Detected Primary Tone:</h4>
                    <div class="tone-badge ${tone.detected_tone}">
                        ${this.capitalizeTone(tone.detected_tone)}
                    </div>
                    <p class="confidence">Confidence: ${tone.confidence.toFixed(1)}%</p>
                </div>
                <div class="mt-3">
                    <h4>Tone Breakdown:</h4>
                    <div class="tone-scores">
                        ${scoresHtml}
                    </div>
                </div>
                <div class="mt-3">
                    <h4>Tone Characteristics:</h4>
                    <p>${this.getToneDescription(tone.detected_tone)}</p>
                </div>
            </div>
        `;
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationsList');
        
        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="no-recommendations">
                    <i class="fas fa-check-circle"></i>
                    <h3>Great job! Your content is well-optimized.</h3>
                    <p>We found no critical issues with your content structure, readability, or SEO.</p>
                </div>
            `;
            return;
        }

        const recommendationsHtml = recommendations.map(rec => `
            <div class="recommendation-item recommendation-${rec.priority}">
                <div class="recommendation-header">
                    <span class="priority-badge priority-${rec.priority}">
                        ${rec.priority} priority
                    </span>
                    <span class="recommendation-type">${rec.type}</span>
                </div>
                <div class="recommendation-message">${rec.message}</div>
                ${rec.current_value !== undefined ? `
                    <div class="recommendation-metrics">
                        <span>Current: ${rec.current_value}</span>
                        <span>Target: ${rec.target_value}</span>
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = recommendationsHtml;
    }

    displayEnhancedContent(rewritten, assets) {
        // Display rewritten content with Markdown rendering
        const rewrittenContainer = document.querySelector('#rewritten .rewritten-content');
        
        // Check if the content appears to be Markdown
        const isMarkdown = rewritten.includes('#') || rewritten.includes('**') || rewritten.includes('*') || rewritten.includes('-');
        
        // If not markdown, try to structure it: split into paragraphs, add a heading
        function autoStructure(text) {
            const parts = text.trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
            if (parts.length === 0) return text;
            let out = '# Rewritten Content\n\n';
            parts.forEach((p, idx) => {
                if (idx === 0) {
                    out += p + '\n\n';
                } else {
                    out += `## Section ${idx}\n\n` + p + '\n\n';
                }
            });
            return out;
        }

    let processed = rewritten;

    // If response contains visually empty lines that might be interpreted strangely, normalize
    processed = processed.replace(/^[ \t]+$/gm, '');
    // Remove possible leading code fences accidentally returned
    processed = processed.replace(/^```[a-zA-Z0-9]*\n?|```$/g, '');
        if (!isMarkdown) {
            processed = autoStructure(rewritten);
        }

        let formattedContent;
        if (typeof marked !== 'undefined') {
            // Configure marked options
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: false,
                sanitize: false
            });
            formattedContent = marked.parse(processed);
        } else {
            formattedContent = this.formatContent(processed);
        }
        
        rewrittenContainer.innerHTML = `
            <div class="copyable-content">
                <div class="content-subtabs">
                    <button class="copy-btn view-mode-btn active" data-mode="rendered">Rendered</button>
                    <button class="copy-btn view-mode-btn" data-mode="source">Source</button>
                    <button class="copy-btn" data-copy-target="rewritten-text">Copy</button>
                    
                </div>
                <div class="rendered-content markdown-content" id="rewritten-html">${formattedContent}</div>
                <div class="raw-content" id="rewritten-text" style="display:none;"><pre>${processed}</pre></div>
            </div>
        `;

        // Add view mode toggle
        rewrittenContainer.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                const rendered = rewrittenContainer.querySelector('.rendered-content');
                const raw = rewrittenContainer.querySelector('.raw-content');
                if (mode === 'rendered') { rendered.style.display='block'; raw.style.display='none'; }
                else { rendered.style.display='none'; raw.style.display='block'; }
                rewrittenContainer.querySelectorAll('.view-mode-btn').forEach(b=>b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Display marketing assets
        this.displayAssets(assets);

        // Display social media posts
        this.displaySocialPosts(assets.social_media_posts || {});

        // Show enhanced content section
    const enhancedSection = document.getElementById('enhancedContentSection');
    enhancedSection.style.display = 'block';
    enhancedSection.scrollIntoView({ behavior: 'smooth' });

    // Auto-select rewritten tab if not already active
    const enhancedCard = enhancedSection.querySelector('.enhanced-card');
    if (enhancedCard) {
        const rewrittenBtn = enhancedCard.querySelector('.enhanced-tabs .tab-btn[data-tab="rewritten"]');
        if (rewrittenBtn && !rewrittenBtn.classList.contains('active')) {
            // Manually apply active class & panel since we bypassed user click
            enhancedCard.querySelectorAll('.enhanced-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
            enhancedCard.querySelectorAll('.enhanced-tabs-content .tab-panel').forEach(p=>p.classList.remove('active'));
            rewrittenBtn.classList.add('active');
            const rewrittenPanel = enhancedCard.querySelector('#rewritten');
            if (rewrittenPanel) rewrittenPanel.classList.add('active');
        }
    }
    }

    displayAssets(assets) {
        const assetsContainer = document.querySelector('#assets .assets-grid');
        
        assetsContainer.innerHTML = `
            <div class="asset-section">
                <h3><i class="fas fa-heading"></i> Headline Options</h3>
                <ul class="headlines-list">
                    ${(assets.headlines || []).map(headline => 
                        `<li>
                            <div class="copyable-content">
                                <button class="copy-btn" data-copy-text="${headline}">Copy</button>
                                ${headline}
                            </div>
                        </li>`
                    ).join('')}
                </ul>
            </div>

            <div class="asset-section">
                <h3><i class="fas fa-search"></i> Meta Description</h3>
                <div class="copyable-content">
                    <button class="copy-btn" data-copy-text="${assets.meta_description || ''}">Copy</button>
                    <p>${assets.meta_description || 'Meta description not generated'}</p>
                    <small>Length: ${(assets.meta_description || '').length} characters</small>
                </div>
            </div>

            <div class="asset-section">
                <h3><i class="fas fa-question-circle"></i> Frequently Asked Questions</h3>
                <div class="faq-list">
                    ${(assets.faqs || []).map(faq => `
                        <div class="faq-item">
                            <div class="faq-question">${faq.question}</div>
                            <div class="faq-answer">${faq.answer}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="asset-section">
                <h3><i class="fas fa-mouse-pointer"></i> Call-to-Action Options</h3>
                <ul class="cta-list">
                    ${(assets.cta_options || []).map(cta => 
                        `<li>
                            <div class="copyable-content">
                                <button class="copy-btn" data-copy-text="${cta}">Copy</button>
                                ${cta}
                            </div>
                        </li>`
                    ).join('')}
                </ul>
            </div>

            <div class="asset-section">
                <h3><i class="fas fa-file-alt"></i> Content Summary</h3>
                <div class="copyable-content">
                    <button class="copy-btn" data-copy-text="${assets.summary || ''}">Copy</button>
                    <p>${assets.summary || 'Summary not generated'}</p>
                </div>
            </div>

            <div class="asset-section">
                <h3><i class="fas fa-tags"></i> Suggested Keywords</h3>
                <div class="keywords-container">
                    ${(assets.keywords || []).map(keyword => 
                        `<span class="keyword-tag">${keyword}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    displaySocialPosts(socialPosts) {
        const socialContainer = document.querySelector('#social .social-posts');
        
        const platforms = {
            twitter: { name: 'Twitter', icon: 'fab fa-twitter', color: '#1da1f2' },
            linkedin: { name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0077b5' },
            facebook: { name: 'Facebook', icon: 'fab fa-facebook', color: '#1877f2' }
        };

        const postsHtml = Object.entries(socialPosts).map(([platform, post]) => {
            const platformInfo = platforms[platform] || { name: platform, icon: 'fas fa-share', color: '#666' };
            return `
                <div class="social-post">
                    <div class="social-platform" style="color: ${platformInfo.color}">
                        <i class="${platformInfo.icon}"></i>
                        ${platformInfo.name}
                    </div>
                    <div class="copyable-content">
                        <button class="copy-btn" data-copy-text="${post}">Copy</button>
                        <p>${post}</p>
                        <small>Characters: ${post.length}</small>
                    </div>
                </div>
            `;
        }).join('');

        socialContainer.innerHTML = postsHtml || '<p>No social media posts generated.</p>';
    }

    // Utility methods
    showRewriteSection() {
        document.getElementById('rewriteSection').style.display = 'block';
    }

    showLoading(message) {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = message;
        overlay.style.display = 'flex';
        
        // Add a safety timeout to prevent infinite loading
        this.loadingTimeout = setTimeout(() => {
            console.warn('Loading timeout reached');
            this.hideLoading();
            this.showError('Request timed out. Please try again.');
        }, 30000); // 30 seconds timeout
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = 'none';
        
        // Clear the timeout if it exists
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    getScoreClass(score) {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-average';
        return 'score-poor';
    }

    getReadingLevelInterpretation(grade) {
        if (grade <= 5) return 'Very easy to read - suitable for elementary school students.';
        if (grade <= 8) return 'Easy to read - suitable for middle school students and general audiences.';
        if (grade <= 12) return 'Moderately difficult - suitable for high school students and educated adults.';
        if (grade <= 16) return 'Difficult to read - suitable for college-level readers.';
        return 'Very difficult to read - suitable for graduate-level readers and experts.';
    }

    capitalizeTone(tone) {
        return tone.charAt(0).toUpperCase() + tone.slice(1);
    }

    getToneDescription(tone) {
        const descriptions = {
            formal: 'Your content uses formal language structures and professional vocabulary.',
            casual: 'Your content has a relaxed, conversational tone that\'s easy to relate to.',
            expert: 'Your content demonstrates technical expertise with specialized terminology.',
            persuasive: 'Your content uses compelling language designed to influence the reader.',
            neutral: 'Your content maintains an objective, balanced tone throughout.'
        };
        return descriptions[tone] || 'Your content tone could not be definitively categorized.';
    }

    formatContent(content) {
        // Basic content formatting
        return content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    async copyToClipboard(button) {
        let textToCopy;
        
        if (button.hasAttribute('data-copy-text')) {
            textToCopy = button.getAttribute('data-copy-text');
        } else if (button.hasAttribute('data-copy-target')) {
            const target = document.getElementById(button.getAttribute('data-copy-target'));
            textToCopy = target ? target.innerText : '';
        }

        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            this.fallbackCopyTextToClipboard(textToCopy);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contentOptimizer = new ContentOptimizer();
});

// Add sample content function
function addSampleContent() {
    const textarea = document.getElementById('content');
    const sampleContent = `Artificial intelligence is transforming how businesses operate in the modern world. Companies are using AI to automate processes, improve customer service, and make better decisions. This technology helps organizations save time and money while providing better results for their customers.

However, implementing AI requires careful planning and consideration. Businesses need to understand their specific needs and choose the right tools for their goals. Training employees and ensuring data security are also important factors to consider when adopting new AI technologies.

With proper implementation, AI can give companies a competitive advantage and help them grow faster in today's digital marketplace. The key is to start small, measure results, and gradually expand AI usage across different business functions.`;
    
    textarea.value = sampleContent;
    
    // Trigger the character counter update
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
}

// Test connection function
async function testConnection() {
    try {
        console.log('Testing connection to server...');
        
        const response = await fetch('/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                test: 'connectivity',
                timestamp: new Date().toISOString()
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            alert('✅ Connection test successful!\nServer is responding correctly.');
        } else {
            alert('❌ Connection test failed:\n' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Connection test error:', error);
        alert('❌ Connection test failed:\n' + error.message + '\n\nCheck the browser console for more details.');
    }
}

// Additional CSS for dynamic elements
const additionalStyles = `
    <style>
        .entity-tag {
            display: inline-block;
            background: #e0f2fe;
            color: #0369a1;
            padding: 0.25rem 0.5rem;
            margin: 0.25rem;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        
        .heading-group {
            margin-bottom: 1rem;
        }
        
        .heading-group h5 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .heading-group ul {
            margin-left: 1rem;
            color: var(--text-secondary);
        }
        
        .tone-score-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            gap: 1rem;
        }
        
        .tone-label {
            min-width: 100px;
            font-weight: 500;
        }
        
        .tone-bar {
            flex: 1;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .tone-fill {
            height: 100%;
            background: var(--primary-color);
            border-radius: 4px;
        }
        
        .tone-value {
            min-width: 30px;
            text-align: right;
            font-weight: 500;
        }
        
        .tone-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: var(--primary-color);
            color: white;
            border-radius: 20px;
            font-weight: 500;
            margin: 0.5rem 0;
        }
        
        .confidence {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        
        .no-recommendations {
            text-align: center;
            padding: 2rem;
            color: var(--success-color);
        }
        
        .no-recommendations i {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .recommendation-metrics {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        
        .recommendation-metrics span {
            margin-right: 1rem;
        }
        
        .keyword-tag {
            display: inline-block;
            background: var(--primary-color);
            color: white;
            padding: 0.25rem 0.5rem;
            margin: 0.25rem;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        
        .text-success { color: var(--success-color); }
        .text-warning { color: var(--warning-color); }
    </style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);
