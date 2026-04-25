from PIL import Image
import os

def clean_logo():
    input_path = "public/stamplogo.png"
    output_path = "public/stamplogo_clean.png"
    
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return

    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # If the pixel is very bright (white), make it transparent
        # Using a conservative threshold to avoid removing anti-aliasing pixels
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Successfully created transparent logo at {output_path}")

if __name__ == "__main__":
    clean_logo()
