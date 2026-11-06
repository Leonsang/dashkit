# Revisión: comprobar lo construido

Construir no basta: hay que ver que Desktop lo carga y lo dibuja como se espera.

## Orden

1. **Que el XML sea válido:**
   - `workbook Validate` usa el validador de Desktop.
   - Sin Desktop, la validación usa el XSD de la instalación local (`schemaChecked: false` dice que solo
     se revisó el XML).
2. **`workbook CheckStructure`:** compara con lo que escribe Tableau en sus propios libros. Detecta
   elementos desconocidos, hijos fuera del orden de Tableau y valores fuera del vocabulario.
3. **`workbook Preflight`:** comprueba que el libro cargará. Detecta:
   - libros sin hojas;
   - archivos de datos o `.hyper` que faltan;
   - filtros que lo excluyen todo;
   - dashboards con hojas inexistentes.

   `desktop Launch` lo pasa solo antes de abrir un archivo.
4. **`workbook Lint`:** buenas prácticas, con una puntuación de 0 a 100. Corrige hasta 90 o más. Cada
   aviso trae su arreglo y su fuente.
5. **`workbook ExportImage sheet=<dashboard>`:** **mira** la imagen.
   - Comprueba títulos, ejes, etiquetas cortadas, leyendas y que no haya marcas vacías ni "Unknown".
   - La API solo dibuja lo que está en pantalla. Para otra hoja usa `workbook ShowSheet confirm=true`,
     con permiso del usuario, porque reabre Desktop.
6. **`workbook SummaryData sheet=`:** los datos agregados de una hoja dibujada, para contrastar cifras.

## Qué mirar en la imagen

- **Títulos:** que digan la pregunta o la conclusión ("Ventas por región, 2025"), no "Sheet 1".
- **Ejes:** con el formato correcto (miles, %, moneda) y sin títulos repetidos.
- **Orden:** barras de mayor a menor, salvo un orden natural (meses, tallas).
- **Color:** pocos colores; el acento, donde está la idea.
- **Tarjetas:** las de filtro deben tener controles. Si salen vacías, la hoja no está en el dashboard.
- **Espacio:** nada cortado, nada que haya que desplazar en un dashboard de tamaño fijo.

## Guardar y organizar el libro

- **`workbook SaveAs path=`:** guarda el XML actual (el libro en vivo o la copia de una transacción) en un
  `.twb` o `.twbx`. **`workbook New path=`:** un libro vacío.
- **`workbook ApplyXml xml=`:** valida y aplica un XML completo. Es la salida para lo que tableu no
  escribe (ver `comandos-de-desktop.md`). Valida antes con `workbook Validate`.
- **`workbook SetStartSheet sheet=`:** la hoja que se abre primero (normalmente el dashboard de resumen).
- **`workbook ReorderSheets order=[...]`:** el orden de las pestañas.
- **Hojas internas:** ocúltalas con `worksheet SetVisibility hidden=true`.

## Modales y fallos

- **`desktop Modals`:** lista todas las ventanas modales de Desktop (título, textos y botones).
  `close_safe=true` cierra solo los mensajes de error o aviso.
- **Cada respuesta puede traer `desktopModals`.**
  - Las de error o aviso se cierran solas.
  - Las demás (File Recovery, Save changes?…) se le cuentan al usuario, y hay que esperar su respuesta.
    No pulses sus botones.
- **Una llamada en vivo que se cuelga** suele ser un diálogo: `desktop ErrorDialogs` lo lee y lo cierra.
- **Problemas sin diálogo:** `desktop Warnings` lee el log de Desktop.
- **Respaldos:** `workbook ListBackups` / `Restore`. Se crean antes de cada cambio en vivo.
- **Errores conocidos** (y su explicación) en `tableu://behavior`:
  - `8F2A4D91`: exportar una hoja que no está en pantalla.
  - "Internal Error 501CF476": un libro que no carga. Pasa `Preflight`.
