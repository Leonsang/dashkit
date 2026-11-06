# Brief de diseño

Antes de construir, deja escrito esto (en `tableau-sdd` es la sección de diseño de la spec). Si falta un
punto, pregunta **una cosa cada vez** y deduce lo obvio del contexto.

```markdown
## Brief

- Audiencia: quién lo lee y con qué frecuencia (dirección, semanal; analistas, a diario).
- Decisión: qué decide o hace el lector después de mirarlo.
- Preguntas (una por vista, máximo 3 por dashboard):
  1. ...
- KPIs: medida, fórmula, formato, comparación (meta o periodo anterior) y umbral de alerta.
- Arquetipo: resumen | exploración | detalle | protagonista | relato (references/arquetipos.md).
- Filtros e interacción: qué filtra el lector y desde dónde (tarjeta, acción, parámetro).
- Datos: fuente, nivel de detalle (una fila = ...), refresco (extract diario...), volumen.
- Tamaño: 1200x800 fijo (u otro), y si hace falta diseño para móvil.
- Estilo: paleta (acento y neutros), fuente, formato de número, idioma y locale (es_ES...).
- Publicación (recomendación): proyecto y colección.
- Fuera de alcance: ...
```

## De brief a construcción

| Brief | Decide | Dónde |
|---|---|---|
| Preguntas | El tipo de gráfico de cada hoja | SKILL.md §2 y `tableau-authoring/references/vistas.md` |
| Arquetipo | El layout del dashboard | `references/arquetipos.md`, `dashboard CreateFromLayout` |
| KPIs | La hoja de KPIs y sus calculados | `tableau-authoring/references/tablas-y-kpis.md`, `tableau-data-model` |
| Filtros e interacción | Tarjetas, filtros compartidos y acciones | `tableau-authoring/references/filtros-y-parametros.md` y `acciones-e-historias.md` |
| Datos | Fuente, relaciones o joins, extract | `tableau-data-model` |
| Estilo | Paleta, fuentes y formatos | `references/color.md`, `references/tipografia.md` |
