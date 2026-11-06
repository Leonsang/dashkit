# Color

## Estrategia

1. **Neutros para la base y un acento para el mensaje.** Barras en gris o en el azul de Tableau, y la
   categoría que importa en el color de acento. Se hace con `format ColorPalette colors={"Norte":
   "#e15759", "Sur": "#bab0ac", ...}`.
2. **El color codifica una sola cosa por dashboard.** Si "Canal" es azul en una vista, que sea azul en
   todas: la misma paleta asignada por miembro en cada hoja.
3. **No dependas solo del color.** Etiquetas, formas (`shape=`) o posición. En líneas, marca el final de
   cada serie con su nombre.
4. **Pocos colores:** `workbook Lint` avisa (`VIS-PALETTE`) por encima de 10. Con más de 6 o 7
   categorías, agrupa (`group Create`) o usa "Otros".

## Paletas de Tableau (nombre para `palette=`)

| Uso | Paleta | Colores |
|---|---|---|
| Categorías (por defecto) | `tableau10` | `#4e79a7 #f28e2b #e15759 #76b7b2 #59a14f #edc948 #b07aa1 #ff9da7 #9c755f #bab0ac` |
| Categorías, apta para daltonismo | `color_blind_10` | `#1170aa #fc7d0b #a3acb9 #57606c #5fa2ce #c85200 #7b848f #a3cce9 #ffbc79 #c8d0d9` |
| Medida secuencial | `gradient=["#eff3ff", "#08519c"]` | de claro a oscuro, sin centro |
| Medida divergente (con signo: margen, variación) | `gradient=["#d7191c", "#f7f7f7", "#1a9641"] center=0` | rojo, neutro, verde |

Para una medida, `steps=5` hace una paleta **escalonada** (5 tonos), más fácil de leer que una continua.
`min`/`max` fijan el rango, para que dos hojas usen la misma escala.

## Texto y fondos

En los libros de Tableau:

- **Texto:** gris, no negro. Lo más frecuente es `#787878` y `#555555`; el negro (`#000000`) queda para
  los números importantes. `#787878` da 4.42:1 sobre blanco, por debajo de WCAG AA en texto pequeño:
  para cuerpo de 9 pt usa `#666666` o `#555555` (`accesibilidad.md`).
- **Fondos:** blancos. Las bandas son muy claras (`#f5f5f5` o `#f0f0f0`).
- **Acento en títulos:** Superstore usa un ocre (`#d3872a`).

## Rojo y verde

Unos 1 de cada 12 hombres no distinguen bien el rojo del verde. Si usas los dos (pérdidas y ganancias):
- añade el signo o una forma;
- o usa azul y naranja (`#1170aa` / `#fc7d0b`).

## Paleta corporativa

`settings CreatePalette name="Marca" colors=[...] type=regular` la deja disponible en todos los libros,
tras reiniciar Desktop. Compruébala con un simulador de daltonismo antes de fijarla.
