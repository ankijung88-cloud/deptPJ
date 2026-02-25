import re

filepath = 'src/data/mockData.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Single-line replacements: `, en: '...'` or `, en: "..."`
content = re.sub(r',\s*(en|ja|zh)\??:\s*[\'"`].*?[\'"`]', '', content)

# 2. Multi-line replacements: `  en: '...',`
content = re.sub(r'^[ \t]*(en|ja|zh)\??:\s*[\'"`].*?[\'"`],?\r?\n', '', content, flags=re.MULTILINE)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully processed {filepath}")
