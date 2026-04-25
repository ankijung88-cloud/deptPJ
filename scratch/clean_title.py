from PIL import Image
import os

def clean_logo(input_file, output_file):
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        return

    img = Image.open(input_file).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # If the pixel is very bright (white), make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_file, "PNG")
    print(f"Successfully created transparent logo at {output_file}")

if __name__ == "__main__":
    clean_logo("public/titlelogo.png", "public/titlelogo_clean.png")
