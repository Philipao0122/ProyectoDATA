import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
import requests
from io import BytesIO
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

def obtener_imagen_instagram(url):
    # Configurar Selenium en modo headless
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.get(url)
    time.sleep(5)  # Esperar a que cargue el contenido

    try:
        # Esperar a que el elemento esté presente
        time.sleep(3)  # Esperar a que cargue el contenido dinámico
        
        # Usar el selector específico para la imagen
        img_element = driver.find_element("xpath", "//div[contains(@class,'_aagw')]/img")
        img_url = img_element.get_attribute("src")
        
        if not img_url:
            raise Exception("No se pudo obtener la URL de la imagen")
            
        # Descargar imagen
        response = requests.get(img_url)
        response.raise_for_status()  # Verificar que la descarga fue exitosa
        img = Image.open(BytesIO(response.content))
        return img

    except Exception as e:
        print(f"Error al obtener la imagen: {str(e)}")
        return None
    finally:
        driver.quit()  # Asegurarse de cerrar el navegador

def mostrar_imagen():
    url = url_entry.get()
    if not url:
        messagebox.showwarning("Advertencia", "Por favor ingresa una URL.")
        return

    img = obtener_imagen_instagram(url)
    if img:
        img = img.resize((400, 400))
        tk_img = ImageTk.PhotoImage(img)
        img_label.config(image=tk_img)
        img_label.image = tk_img
    else:
        messagebox.showerror("Error", "No se pudo extraer la imagen.")

# Interfaz
root = tk.Tk()
root.title("Extractor de Imagen de Instagram")

tk.Label(root, text="URL del post:").pack(pady=5)
url_entry = tk.Entry(root, width=60)
url_entry.pack(pady=5)

tk.Button(root, text="Extraer Imagen", command=mostrar_imagen).pack(pady=10)
img_label = tk.Label(root)
img_label.pack()

root.mainloop()
