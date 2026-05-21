import pypdf
import os

def generate_test_pdf(pdf_in):
    
    pdf_out = "DesvioRuta_test.pdf"
    
    if not os.path.exists(pdf_in):
        print(f"Error: {pdf_in} not found.")
        return
        
    reader = pypdf.PdfReader(pdf_in)
    writer = pypdf.PdfWriter()
    writer.append(reader)
    
    # Map of all detected fields
    fields_to_fill = {
        'Widget': 'Widget (Campo 1)',
        '_2': '_2 (Campo 2)',
        '_3': '_3 (Campo 3)',
        '_4': '_4 (Campo 4)',
        '_5': '_5 (Campo 5)'
    }
    
    # We apply the values to all pages just in case
    for page in writer.pages:
        writer.update_page_form_field_values(page, fields_to_fill)
        
    with open(pdf_out, "wb") as f:
        writer.write(f)
        
    print(f"\n[SUCCESS] Se ha generado '{os.path.abspath(pdf_out)}'")
    print("Por favor, abre este archivo PDF para ver en qué posición física aparece cada etiqueta (Widget, _2, _3, _4, _5).")

if __name__ == "__main__":
    pdfs = ["PARQUEO EN PUNTO NO AUTORIZADO.pdf","PERNOCTACION EN PUNTO NO AUTORIZADO.pdf", "INCUMPLIMIENTO DE FRANJA DE DESCANSO.pdf", "DESVIO DE RUTA NO AUTORIZADO.pdf", "EXCESO DE VELOCIDAD EN CURVA.pdf"]
    for pdf_in in pdfs:	
    	generate_test_pdf(pdf_in)
