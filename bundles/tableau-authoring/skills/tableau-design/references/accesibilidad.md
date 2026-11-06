# Accesibilidad (WCAG 2.2 AA)

Tableau publica sus reglas en "Best Practices for Designing Accessible Views". `workbook Lint` revisa las
que se pueden comprobar en el XML (`A11Y-*`).

| Regla | Cómo cumplirla | Lint |
|---|---|---|
| Nombres descriptivos | Renombra "Sheet 1" y "Dashboard 1": el nombre es el título y el texto alternativo por defecto | `NAME-DEFAULT` |
| Títulos que digan algo | Nunca una sola palabra, sin jerga ni abreviaturas | `A11Y-ONE-WORD-TITLE` |
| Sin mayúsculas | Los títulos en tipo frase | `A11Y-CAPS-TITLE` |
| No solo color | Formas, etiquetas o tamaño, además del color. En líneas, el nombre al final de cada serie | `A11Y-LINE-COLOR-ONLY` |
| Contraste | 4.5:1 para el texto; 3:1 para el texto grande (18 pt, o 14 pt en negrita). Ojo: el gris que más usa Tableau, `#787878`, da 4.42:1 sobre blanco y **no llega** para texto pequeño; usa `#666666` (5.7:1) o `#555555` (7.5:1) | — |
| Título en cada dashboard | Un título o un objeto de texto que diga de qué va | `A11Y-DASH-TITLE` |
| Texto alternativo | Tableau lo genera desde 2023.1. Describe cada vista en su caption o en el título | — |
| Enlaces | Nada de "Haz clic aquí" o "Más": el texto dice adónde lleva | — |
| Orden de lectura | Mosaico en Z: el orden de las zonas es el de lectura. Lo flotante rompe ese orden | — |

## Medido en Desktop

- **Worksheet > Accessibility:** el diálogo tiene "Use mark tooltip for alt text on marks", que escribe
  `layout-options@tooltip-mark-announcement`. tableu no lo expone.
- **Un tooltip bien escrito** (`format Tooltip`) sirve a la vez de tooltip y de texto alternativo de la
  marca. Escríbelo como una frase: "Norte vendió 1,2 M €, un 8 % más que en 2024".

## Para lectores de pantalla y teclado

- Tamaño fijo y mosaico: el lector recorre las zonas en orden.
- Menos vistas y menos filtros: cada uno es una parada más.
- Si la vista principal es muy visual (un mapa), añade cerca una tabla o un texto con las mismas cifras.
