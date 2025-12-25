import json
import os
import base64
import requests

def handler(event, context):
    try:
        if event['httpMethod'] != 'POST':
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'})
            }

        data = json.loads(event['body'])
        image_b64 = data.get('image', '')
        
        if not image_b64:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No image provided'})
            }

        # Remove header if exists
        if 'base64,' in image_b64:
            image_b64 = image_b64.split('base64,')[1]

        zai_api_key = os.environ.get('ZAI_API_KEY')
        if not zai_api_key:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'ZAI_API_KEY not configured'})
            }

        # Z.ai (Zhipu AI) GLM-4V API Call
        payload = {
            "model": "glm-4v",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Identify all cups in this image. For each cup, provide its bounding box coordinates [x, y, width, height] normalized to a 1000x1000 scale. Also, if there is steam or visual evidence of heat, estimate the temperature (e.g., 45.0 for hot, 20.0 for cold). Return ONLY a valid JSON list in this format: [{\"label\": \"cup\", \"x\": 123, \"y\": 456, \"w\": 100, \"h\": 200, \"temp\": 42.5}]. NO extra text."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_b64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.1
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {zai_api_key}"
        }

        response = requests.post("https://open.bigmodel.cn/api/paas/v4/chat/completions", headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'body': json.dumps({'error': f'Z.ai API Error: {response.text}'})
            }

        response_data = response.json()
        content = response_data['choices'][0]['message']['content']
        
        # Extract JSON from potential Markdown formatting
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            items = json.loads(content)
        except Exception as e:
            # Fallback parsing if LLM output is slightly malformed
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'items': [],
                    'debug_raw': content,
                    'error': 'Failed to parse AI response'
                })
            }

        return {
            'statusCode': 200,
            'body': json.dumps({
                'items': items,
                'message': 'Detection successful'
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
