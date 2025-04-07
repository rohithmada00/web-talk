# Web Talk - A voice-powered Chrome extension we built during HackHound 2025!

🗣️ Web Talk uses your voice + LLMs to make web browsing more intelligent, hands-free, and accessible.

✨ Inspiration
We were inspired by our passion for voice-based automation and LLM-powered web navigation. I’ve always been fascinated by how natural language can simplify complex web tasks — and this was our chance to bring that idea to life.

📚 What I Learned
• Chrome Extensions (Manifest V3), Web Speech API
• LLM integration with Groq (Gemma2-9b-it)
• Voice UI design & asynchronous problem-solving
• Browser scripting + LLM prompt engineering in real-world use

🛠️ How We Built It
• HTML, CSS, JavaScript
• Web Speech API for speech-to-text
• Groq API for command interpretation
• Chrome Tabs & Scripting APIs for action execution
• Local deployment via packed extension

We capture voice input → analyze it with Groq → and take actions like searching, navigating, summarizing, or answering page-specific questions.

🧗 Challenges We Faced
• Managing async fetch calls + headers
• Dynamic content script injection across domains
• Handling LLM outputs in structured JSON
• Summarizing full innerHTML reliably
• Designing flexible, consistent prompts
• Working around Manifest V3 restrictions

🚀 What’s Next?
We plan to add features like tab control, multilingual voice input, voice-based form filling, and TTS feedback — and publish Web Talk on the Chrome Web Store soon!
