
import sys

with open("vite.config.ts", "r", encoding="utf-8") as f:
    content = f.read()

if "optimizeDeps:" not in content:
    replacement = """  return {
    optimizeDeps: {
      exclude: ["drizzle-orm/d1", "better-sqlite3"]
    },
    server: {"""
    content = content.replace("  return {\n    server: {", replacement)
    with open("vite.config.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed vite.config.ts")
else:
    print("Already fixed")

