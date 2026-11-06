# Temas y color

El tema del informe (*Tema y diseño*) define fuente, colores de texto, relleno, acento, fondo, retícula,
subida y bajada, bordes y la paleta de series. Todo el color se decide ahí, no componente a componente
(§6 y §7 de la skill). Las herramientas para aplicarlo están en `ls-authoring`
(`references/paginas-temas-y-ajustes.md`).

## Cuál usar

| Situación | Tema |
|---|---|
| Informe corporativo sin manual de marca | `marca-azul` |
| Pantallas en salas, TV o modo nocturno | `oscuro-accesible` |
| Público con baja visión, proyectores, impresión en blanco y negro | `alto-contraste` |
| Informe editorial o de comunicación, tono cálido | `calido-editorial` |
| Marca propia | Tema propio partiendo de `examples/tema-marca.json`, y `audit_ux` hasta 90 o más |

Evita los predefinidos del editor (Cosecha, Pop, Niebla...) si el contraste importa: `audit_ux` no puede
medir sus colores.

## La biblioteca, medida

Contraste WCAG calculado sobre el relleno de las tarjetas (`fill`). Texto normal: mínimo 4,5:1. Series
(barras, líneas): mínimo 3:1.

| Tema | Fuente | Texto | Acento | Peor serie | Bordes |
|---|---|---|---|---|---|
| `marca-azul` | Roboto | 16,1:1 | `#1a73e8`, 4,51:1 | 4,83:1 (`#B35900`) | 1 px `#dadce0`, radio 8 |
| `oscuro-accesible` | Roboto | 13,4:1 sobre `#202124` | `#8AB4F8`, 7,64:1 | 6,42:1 (`#C58AF9`) | 1 px `#3C4043`, radio 8 |
| `alto-contraste` | Arial | 21:1 | negro | 7,12:1 (`#8B4500`) | 2 px negro, radio 0 |
| `calido-editorial` | Georgia | 13,4:1 sobre `#FFFBF5` | `#A0430A`, 6,17:1 | 4,67:1 (`#8D6E00`) | 1 px `#E0D6CC`, radio 4 |

El acento de `marca-azul` llega justo a 4,5:1: no lo uses para texto pequeño sobre un fondo que no sea
blanco.

## Paleta de series

- **Ocho colores como mucho**, en el orden del tema. La primera serie recibe el primero: pon ahí la métrica
  principal.
- **Distinguibles sin color:** no confíes en el tono. En `alto-contraste`, el rojo `#B00020` y el verde
  `#006400` tienen casi la misma luminosidad (7,33 y 7,44:1) y una persona daltónica no los separa: no los
  pongas juntos en un gráfico. Etiqueta las series o usa leyenda (§9).
- **Un color, un significado:** si "Online" es azul en un gráfico, que lo sea en todos. El tema lo asegura
  solo si el orden de las series coincide; si no, fija el color del valor a mano en el panel Estilo.
- **Gris para el contexto y acento para la idea:** en un gráfico con una serie destacada, las demás en gris.

## Subida y bajada

`increase` y `decrease` colorean la variación de los scorecards. Si la métrica es "menos es mejor" (coste,
rebote, CPA), inviértelos en ese scorecard (`ls-kpi-scorecards` §6). El color nunca va solo: el scorecard
muestra también la flecha y el signo.

## Fuentes

Una familia para todo el informe, dos como mucho (`audit_ux` avisa con tres o más). Usa una fuente del
desplegable del editor; una que no esté ahí no se puede elegir.
