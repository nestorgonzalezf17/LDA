const fs = require('fs');
const path = require('path');

// Intentamos requerir 'xlsx'. Si no está instalado, informamos al usuario cómo instalarlo.
try {
    const XLSX = require('xlsx');

    const excelFile = 'ENCUESTA DE CLIMA ORGANIZACIONAL (6).xlsx';
    const csvFile = 'ENCUESTA DE CLIMA ORGANIZACIONAL (6)_hoja2.csv';

    const excelPath = path.join(__dirname, excelFile);
    const csvPath = path.join(__dirname, csvFile);

    if (!fs.existsSync(excelPath)) {
        console.error(`Error: No se encontró el archivo Excel en: ${excelPath}`);
        process.exit(1);
    }

    console.log(`Leyendo archivo: ${excelFile}...`);
    const workbook = XLSX.readFile(excelPath);

    // Las hojas están en un array. La hoja 2 es el índice 1.
    const sheetName = workbook.SheetNames[2];
    if (!sheetName) {
        console.error('Error: El documento no tiene una segunda hoja.');
        process.exit(1);
    }

    console.log(`Hoja detectada para exportar: "${sheetName}"`);
    const worksheet = workbook.Sheets[sheetName];

    // Convertir la hoja a formato CSV
    console.log('Convirtiendo a CSV...');
    let csvContent = XLSX.utils.sheet_to_csv(worksheet);

    // Eliminar el texto "Promedio de " que aparece al inicio de los textos
    console.log('Limpiando el texto "Promedio de "...');
    csvContent = csvContent.replace(/(^|,)("?)Promedio de /gm, '$1$2');

    // Eliminar el número y el punto al inicio de las preguntas (ej. "1. " o "12.")
    console.log('Limpiando números y puntos al inicio...');
    csvContent = csvContent.replace(/(^|,)("?)\d+\.\s*/gm, '$1$2');

    // Escribir el archivo CSV con codificación UTF-8
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`¡Éxito! Contenido de la hoja 2 exportado a: ${csvFile}`);

} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error('\n[!] Error: Se requiere la librería "xlsx".');
        console.error('Para instalarla, ejecuta el siguiente comando en esta carpeta:');
        console.error('    npm install xlsx\n');
    } else {
        console.error('Ocurrió un error inesperado:', error.message);
    }
    process.exit(1);
}
