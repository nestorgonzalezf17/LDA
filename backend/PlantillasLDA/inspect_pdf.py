import sys
import subprocess
import os

# Ensure pypdf is installed
try:
    import pypdf
except ImportError:
    print("pypdf not found. Installing pypdf...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    import pypdf

def list_fields(pdf_path):
    print(f"Inspecting fields for: {os.path.abspath(pdf_path)}")
    try:
        reader = pypdf.PdfReader(pdf_path)
        fields = reader.get_fields()
        if not fields:
            print("\n[WARNING] No form fields (AcroForm) detected in this PDF.")
            print("If you converted from Word, you must manually add fillable form fields (Text Fields) using Adobe Acrobat, Foxit, or a free online tool like PDFescape.")
            return
        
        print(f"\nSUCCESS: Detected {len(fields)} fields:")
        for field_name, field_info in fields.items():
            field_type = field_info.get('/FT', 'Unknown')
            current_value = field_info.get('/V', 'None (Vacio)')
            default_value = field_info.get('/DV', 'None (Vacio)')
            tooltip = field_info.get('/TU', 'None')
            
            print(f"  * Name: '{field_name}'")
            print(f"    - Type: {field_type}")
            print(f"    - Current Value (/V): {current_value}")
            print(f"    - Default Value (/DV): {default_value}")
            print(f"    - Tooltip (/TU): {tooltip}")
            print("-" * 40)
            
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    pdfs = ["PARQUEO EN PUNTO NO AUTORIZADO.pdf","PERNOCTACION EN PUNTO NO AUTORIZADO.pdf", "INCUMPLIMIENTO DE FRANJA DE DESCANSO.pdf", "DESVIO DE RUTA NO AUTORIZADO.pdf", "EXCESO DE VELOCIDAD EN CURVA.pdf"]
    for pdf_file in pdfs:	
    	
        if not os.path.exists(pdf_file):
            # try parent or relative paths if run from elsewhere
            possible_paths = [
                pdf_file,
                os.path.join("backend", "PlantillasLDA", pdf_file),
                os.path.join("PlantillasLDA", pdf_file)
            ]
            for p in possible_paths:
                if os.path.exists(p):
                    pdf_file = p
                    break
                
        list_fields(pdf_file)
