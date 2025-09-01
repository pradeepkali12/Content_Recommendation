#!/usr/bin/env python3
"""Test script to send actual HTTP request to Flask app like browser does"""

import requests
import json

# Test data exactly as frontend would send it
test_data = {
    'content': 'This is a test article about artificial intelligence. AI is transforming various industries and changing the way we work. Machine learning algorithms can process vast amounts of data to identify patterns and make predictions.',
    'target_readability': 8,
    'target_audience': 'general audience', 
    'target_tone': 'professional',
    'optimization_goal': 'engagement'
}

print("Testing actual HTTP request to Flask app...")

try:
    # Test if server is running
    print("Step 1: Testing health endpoint...")
    health_response = requests.get('http://localhost:5000/health', timeout=5)
    print(f"Health check status: {health_response.status_code}")
    
    if health_response.status_code == 200:
        print("✅ Server is running")
        
        # Test the optimize endpoint
        print("\nStep 2: Testing optimize endpoint...")
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(
            'http://localhost:5000/optimize', 
            json=test_data, 
            headers=headers,
            timeout=30
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Request successful!")
            print(f"Result keys: {list(result.keys())}")
            if 'report' in result:
                print(f"Report keys: {list(result['report'].keys())}")
            if 'recommendations' in result:
                print(f"Recommendations count: {len(result['recommendations'])}")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Response text: {response.text}")
    else:
        print("❌ Server health check failed")
        
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to server. Is it running on http://localhost:5000?")
except requests.exceptions.Timeout:
    print("❌ Request timed out")
except Exception as e:
    print(f"❌ Error: {str(e)}")
