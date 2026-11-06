# Tipografía

## Lo que usa Tableau en sus libros (Superstore, World Indicators)

- **Familias:** las de Tableau: `Tableau Regular`, `Tableau Medium`, `Tableau Semibold` y `Tableau
  Bold`. Son de la misma familia y se ven igual en Desktop, Server y Cloud.
- **Tamaños más frecuentes:**
  - 9 pt para el cuerpo (etiquetas, cabeceras, tooltips);
  - 10 a 12 pt para cabeceras y subtítulos;
  - 13 a 15 pt para los títulos de las hojas;
  - 16 a 18 pt para el título del dashboard y los números grandes.
- **Color:** gris (`#787878`, `#555555`) para el texto, y más oscuro para lo que importa. Para cumplir el
  contraste AA en 9 pt, quédate en `#666666` o más oscuro (`accesibilidad.md`).

## Jerarquía recomendada

| Elemento | Tamaño | Peso | tableu |
|---|---|---|---|
| Título del dashboard | 16-18 | Bold | `format TextRuns kind=dashboard-title size=18 bold=true` |
| Número de un KPI | 18-24 | Bold | `worksheet Create measures=[...] value_font={"size": 22, "bold": true}` |
| Etiqueta de un KPI | 9-10 | Regular, gris | `label_font={"size": 10, "color": "#666666"}` |
| Título de una hoja | 12-14 | Semibold | `format Title text=... font_size=13 bold=true` |
| Cabeceras, ejes, etiquetas | 9 | Regular | `format Font element=header|axis|label size=9` |
| Tooltip | 9 | Regular | por defecto |

Reglas:

- **Un máximo de 3 familias** en el libro (`workbook Lint`: `VIS-FONTS`); mejor una sola.
- **Los tamaños grandes, solo para KPIs y títulos.** Si todo es grande, nada destaca.
- **Nada de MAYÚSCULAS en los títulos** (`A11Y-CAPS-TITLE`): se leen peor y los lectores de pantalla
  pueden deletrearlas.
- **Por defecto en todo el libro:** `workbook Format font="Tableau Regular" font_size=9 color="#555555"
  title_font_size=13`.

## Números

- Formato de negocio en la medida (`field Update default_format=`, ver
  `tableau-authoring/references/tablas-y-kpis.md`): miles con separador, porcentajes con 0 o 1 decimal y
  millones con `M`.
- Alinea a la derecha las columnas numéricas de las tablas (`format Font element=cell align=right`).
