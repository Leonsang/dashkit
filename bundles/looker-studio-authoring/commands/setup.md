---
description: Prepara el navegador para el MCP de Looker Studio — comprueba el puerto CDP 9222 y, si no responde, abre Edge con un perfil dedicado.
argument-hint: "[URL o id del informe a abrir]"
---

# /setup — Looker Studio / Data Studio por CDP

1. **¿Hay un navegador escuchando?** Pide `http://127.0.0.1:9222/json/version`
   (PowerShell: `Invoke-RestMethod http://127.0.0.1:9222/json/version`; bash:
   `curl -s http://127.0.0.1:9222/json/version`). Si responde con un `Browser`,
   salta al paso 3.
2. **Abre Edge con depuración remota** y un perfil dedicado, que no sea el
   personal del usuario: el puerto CDP da control total sobre ese perfil a
   cualquier proceso local.
   - Windows (PowerShell):
     `Start-Process msedge -ArgumentList '--remote-debugging-port=9222', "--user-data-dir=$env:LOCALAPPDATA\EdgeCDP", '--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'`
   - Windows (cmd): `start msedge --remote-debugging-port=9222 --user-data-dir=%LOCALAPPDATA%\EdgeCDP --disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding`
   - macOS: `open -na "Microsoft Edge" --args --remote-debugging-port=9222 --user-data-dir="$HOME/.edge-cdp" --disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding`

   Las opciones `--disable-*` evitan que el sistema dé por oculta la ventana cuando otra la tapa: entonces
   el editor aplaza sus guardados y lo creado puede perderse al recargar. Si el navegador ya estaba abierto
   sin ellas, funciona igual mientras su ventana quede a la vista.

   Vuelve a comprobar el paso 1. La primera vez, el usuario tiene que iniciar
   sesión en Google en esa ventana. Díselo y espera a que confirme: tú no
   escribes credenciales.
3. **Comprueba el servidor MCP:** `attach_to_report` (solo lectura). Si las
   herramientas `looker-studio` no aparecen, falta Node.js 20 o más; sugiere
   `dashkit doctor -b looker-studio-authoring`.
4. **Si el usuario dio un informe ($ARGUMENTS):**
   - Si es suyo y quiere editarlo tal cual: `open_report` con la URL `/edit`.
   - En cualquier otro caso, o si duda: `copy_report` y trabaja sobre la
     copia. Así no se toca el original.
5. Termina con `diagnose_report` y resume lo que encontró. Después indica el
   siguiente paso: describir el cambio que quiere, o `/ls-sdd` para un flujo
   con especificación aprobada.
