import sys
import os
# Add 'backend' to path so we can import 'app'
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.config import settings
print(f"GROQ_API_KEY set: {bool(settings.groq_api_key)}")
print(f"ASSEMBLYAI_API_KEY set: {bool(settings.assemblyai_api_key)}")
print(f"ASSEMBLYAI_API_KEY value length: {len(settings.assemblyai_api_key)}")
