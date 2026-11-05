# spec — un cambio a un informe existente

1. Si no hay levantamiento, ejecuta antes `ls-sdd survey`.
2. Crea `sdd/NNN-<slug>/` y enlaza el levantamiento.
3. **Escribe `spec.md`:**
   - por qué (hallazgos por número o el pedido);
   - qué cambia (área | hoy | después);
   - qué no debe cambiar;
   - riesgos (fuentes de datos compartidas, componentes que otros filtros
     usan);
   - en qué informe se trabaja (URL de la **copia**);
   - criterios de aceptación comprobables.
4. **Escribe o actualiza el `.spec.json`** con solo los componentes que el
   cambio crea o modifica (`key` estable por componente; `id` si ya existe).
   Pasa `lint_report_spec` hasta 0 errores y pega la salida.
5. **Puerta:**
   - aprobación explícita;
   - `sdd/README.md` actualizado;
   - siguiente paso: `ls-sdd tasks`.
