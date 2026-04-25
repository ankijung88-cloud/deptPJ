from PIL import Image
import os

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # If the pixel is very bright (near white/beige), make it transparent
        # R, G, B values above 200 are usually background in this specific image
        if item[0] > 220 and item[1] > 220 and item[2] > 210:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    input_file = "src/assets/images/mongtang_logo_raw.jpg"
    output_file = "public/images/mongtang_logo.png"
    
    if not os.path.exists("public/images"):
        os.makedirs("public/images")
        
    remove_background(input_file, output_file)
    print(f"Successfully processed {input_file} to {output_file}")
