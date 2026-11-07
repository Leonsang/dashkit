# Benchmark: ¿puede un agente con un modelo pequeño construir tableros con dashkit?

Mismo escenario para cada modelo (`escenario.md`): a partir de un CSV ficticio (`datos/cafe_brisa.csv`,
generado por `datos/generar_cafeterias.py`), crear el informe, elegir arquetipo y tema, proponer el mock y
construir dos tableros, verificándolos como el lector.

## Cómo se corre

1. Un agente por modelo, uno detrás de otro (el navegador es uno), con `prompt-agente.md` y su propia carpeta.
2. Al acabar: `node bench/puntuar.mjs <url-del-informe> <carpeta>` → `puntuacion.json`.
3. Las métricas de uso (tokens, llamadas, duración) las da el arnés que lanza el agente; se anotan en
   `resultados.md` junto a la puntuación y las fricciones.

## Archivos

| Archivo | Qué es |
|---|---|
| `escenario.md` | El enunciado, igual para todos |
| `rubrica.md` | 100 puntos y métricas de uso |
| `prompt-agente.md` | El prompt que recibe cada agente |
| `puntuar.mjs` | Puntuador automático con la CLI de dashkit |
| `datos/` | Generador y CSV ficticio |
| `resultados.md` | Resultados por modelo |
