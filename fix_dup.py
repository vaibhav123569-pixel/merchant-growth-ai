
import sys
import re

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# The exact block
block_start = "{paytmData && ("
block_end = "    </section>\n)}"

start_idx = content.find(block_start)
if start_idx != -1:
    end_idx = content.find(block_end, start_idx)
    if end_idx != -1:
        end_idx += len(block_end)
        
        # Check if there is another one
        second_start = content.find(block_start, end_idx)
        if second_start != -1:
            # We found a duplicate! Let us remove the second one.
            second_end = content.find(block_end, second_start)
            if second_end != -1:
                second_end += len(block_end)
                content = content[:second_start] + content[second_end:]
                print("Removed second duplicate.")
        else:
            print("No second duplicate found")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

