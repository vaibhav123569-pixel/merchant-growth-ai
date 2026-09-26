
import sys

# 1. Update MerchantApp.tsx
with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("<div>merchant<span>GROWTH AI</span></div>", "<div>GROWTH<span>merchant</span></div>")
content = content.replace("merchantGROWTH AI", "GROWTHmerchant")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

# 2. Update layout.tsx if it exists
try:
    with open("app/layout.tsx", "r", encoding="utf-8") as f:
        layout = f.read()
    layout = layout.replace("Merchant Growth AI", "GROWTHmerchant")
    layout = layout.replace("merchant GROWTH AI", "GROWTHmerchant")
    
    with open("app/layout.tsx", "w", encoding="utf-8") as f:
        f.write(layout)
except FileNotFoundError:
    pass

print("Renamed website to GROWTHmerchant")

