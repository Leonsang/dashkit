# Iconos

Iconos de línea propios de dashkit (licencia MIT del repositorio), en blanco sobre fondo transparente, 24×24, trazo 2 px.
Pensados para ir sobre un cuadro de color (la tarjeta de un KPI) o sobre la barra lateral oscura de navegación.

Se ponen con `add_image` (CLI `image <archivo> --box x,y,w,h`) o con `"image": "assets/icons/<nombre>.svg"` en un
componente `image-component` del spec. Cada archivo se sube una vez por informe; las siguientes veces se reutiliza.

Para otro color, copia el archivo y cambia `stroke="#FFFFFF"`.
