# verify — demostrar los criterios

Obligatorio en todo cambio:

1. `reload_report` y `diagnose_report`: 0 issues en las páginas tocadas, o
   solo los que el spec acepta.
2. `audit_ux`: la puntuación, comparada con la del levantamiento.
3. `lint_report_spec` del `.spec.json` final: 0 errores.

Según el criterio:

| El criterio trata de | Compruébalo con |
|---|---|
| Que un componente existe y está bien vinculado | `get_report_layout` y `get_component_config` |
| Un control o botón que filtra | Modo vista (`/view`): actúa sobre el control y comprueba que la tabla o el gráfico cambian. Anota los valores de antes y de después |
| Un valor | El texto renderizado del componente en modo vista |
| Aspecto | `audit_ux` y una captura del navegador |

Escribe `verification.md`:

```markdown
# Verificación: <cambio>

Informe: <URL de la copia> · Spec: [spec.md](spec.md) · Verificado el <fecha>

| # | Criterio | Resultado | Evidencia |
|---|---|---|---|
```

Un criterio sin evidencia es un fallo. Al terminar, actualiza
`sdd/README.md` y sugiere un mensaje de commit que nombre la carpeta.
