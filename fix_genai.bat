@echo off
taskkill /f /im node.exe
rmdir /s /q node_modules\@google\generative-ai
npm install @google/genai --save --no-audit --no-fund
