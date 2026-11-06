# Mapas

## Pasos

1. **Rol geográfico:** `field Update datasource=Ventas field=Region geo_role=state`. Valores:
   `country | state | county | city | zip | airport | cbsa (CBSA/MSA) | congress | areacode | nuts |
   latitude | longitude`. Es lo que hace el clic derecho > Geographic Role, que escribe
   `column@semantic-role=[State].[Name]` (medido; CBSA/MSA es `[CMSA].[Name]`).
2. **Hoja con el campo en Detalle:** `worksheet Create ... detail=["Region"] color="SUM(Margen)"`.
3. **Mapa:** `worksheet MakeMap worksheet=... filled=true` (polígonos) o `filled=false` (símbolos).
   tableu pone Latitud y Longitud generadas en los estantes y el mapa base de Tableau.

## Qué mapa elegir

- **Mapa de símbolos** (`filled=false`, `size=SUM(m)`): para **totales** (ventas, población). El
  tamaño se compara bien.
- **Mapa relleno** (`filled=true`, `color=...`): para **tasas o ratios** (margen %, penetración). Un
  relleno con totales engaña: las regiones grandes parecen más importantes.
- **Color divergente** para valores con signo (margen): `format ColorPalette field="SUM(Margen)"
  gradient=["#d7191c", "#f7f7f7", "#1a9641"] center=0`.

## Límites

- Si un miembro no se reconoce (nombres en español que Tableau no geocodifica), queda en "Unknown":
  usa el nombre oficial con `field SetAliases`, o una columna de código ISO.
- Las capas del mapa base, el lazo y la selección radial son de Map > Background Maps y Map Layers.
  No se cubren: están en `tableu://coverage-gaps`.
- `Worksheet > Clear > Sheet` deja `viewpoint/default-map-tool-selection`, propio de la interfaz y no
  hace falta escribirlo.
