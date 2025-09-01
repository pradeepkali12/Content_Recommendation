from flask import Flask, render_template, request, jsonify
from nlp_utils import process_content, generate_rewrite
import traceback
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/optimize', methods=['POST'])
def optimize():
    try:
        print("Received request to /optimize")
        data = request.json
        print(f"Request data: {data}")
        
        # Validate required fields
        if not data:
            print("Error: No JSON data received")
            return jsonify({'error': 'No data received'}), 400
            
        if not data.get('content'):
            print("Error: Content is missing")
            return jsonify({'error': 'Content is required'}), 400
        
        content_length = len(data.get('content', ''))
        print(f"Content length: {content_length}")
        
        if content_length == 0:
            return jsonify({'error': 'Content cannot be empty'}), 400
        
        # Set default values for optional fields
        data.setdefault('target_readability', 8)
        data.setdefault('target_audience', 'general audience')
        data.setdefault('target_tone', 'professional')
        data.setdefault('optimization_goal', 'engagement')
        
        print("Processing content...")
        report, recommendations = process_content(data)
        print("Content processed successfully")
        
        return jsonify({
            'success': True,
            'report': report,
            'recommendations': recommendations
        })
    
    except Exception as e:
        print(f"Error in optimize route: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'An error occurred while processing your content: {str(e)}'
        }), 500

@app.route('/rewrite', methods=['POST'])
def rewrite():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        # Set default values for optional fields
        data.setdefault('target_readability', 8)
        data.setdefault('target_audience', 'general audience')
        data.setdefault('target_tone', 'professional')
        data.setdefault('optimization_goal', 'engagement')
        
        rewritten, assets = generate_rewrite(data)
        
        return jsonify({
            'success': True,
            'rewritten': rewritten,
            'assets': assets
        })
    
    except Exception as e:
        print(f"Error in rewrite route: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'An error occurred while rewriting your content: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Content Optimizer',
        'version': '1.0.0'
    })

@app.route('/test', methods=['POST'])
def test_endpoint():
    """Simple test endpoint to verify connectivity"""
    try:
        data = request.json or {}
        return jsonify({
            'success': True,
            'message': 'Test endpoint working correctly',
            'received_data': data,
            'timestamp': str(datetime.now())
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
