# Comandos de la interfaz de Tableau Desktop

Generado por `scripts/ui_reverse.py` (Tableau Desktop 2026.3.0, menus through UI Automation). Cada comando se ejecutó por UI Automation sobre un libro de prueba recién aplicado; se registró el comando interno que Desktop anota en su log, el diálogo que abre (cerrado con la X, que cancela) y lo que cambia en el XML del libro. Lo que cambia el XML es lo que `tableu` puede escribir directamente; el detalle completo de cada diff está en `ui-commands.json`.

## Hoja `Barras` (worksheets)

| menú | comando interno | efecto |
|---|---|---|
| Data > Ventas > Refresh | `tabui:refresh-datasource-ui datasource="*****"` | sin cambio en el documento |
| Data > Ventas > View Data... | `tabdoc:launch-hybrid-view-data-dialog data-provider-type="datasource" datasource="*****"`<br>`tabdoc:view-data-dialog-show-aliases show-aliases="true"` | abre «View Data: Ventas» |
| Data > Ventas > Rename... | `tabui:rename-datasource-ui datasource="*****"` | abre «Rename Data Source» |
| Data > Ventas > Duplicate | `tabui:duplicate-datasource-ui datasource="*****"` | XML: + `attributes/attribute@datatype=string`, `attributes/attribute@name`, `columns/column@datatype=date`, `columns/column@datatype=integer` − `workbook/windows@source-height=30` |
| Data > Ventas > Edit Data Source Filters... | `tabui:edit-datasource-filters-ui datasource="*****"`<br>`tabdoc:create-datasource-filter-store datasource="*****" load-global="true"` | abre «Edit Data Source Filters» |
| Data > Ventas > Assume Referential Integrity | `tabui:toggle-referential-integrity-ui datasource="*****"` | XML: + `datasource/connection@tableau-ri=true` |
| Data > Ventas > Date Properties... | `tabui:edit-datasource-date-properties-ui datasource="*****"` | abre «Date Properties [Ventas]» |
| Data > Ventas > Edit Aliases... > Measure Names... | `tabui:edit-datasource-field-aliases datasource="*****" fn="[federated.tszse28gx02x3fnwag3q`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[:Measure Names]"` | abre «Edit Aliases [Measure Names]» |
| Data > Ventas > Edit Aliases... > Canal... | `tabui:edit-datasource-field-aliases datasource="*****" fn="[federated.tszse28gx02x3fnwag3q`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Canal]"` | abre «Edit Aliases [Canal]» |
| Data > Ventas > Edit Aliases... > Region... | `tabui:edit-datasource-field-aliases datasource="*****" fn="[federated.tszse28gx02x3fnwag3q`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Region]"` | abre «Edit Aliases [Region]» |
| Data > Ventas > Properties... | `tabui:properties-datasource-ui datasource="*****"` | abre «Connection Properties» |
| Worksheet > New Worksheet | `tabui:new-worksheet-ui` | XML: + `cards/edge@name`, `edge/strip@size=160`, `edge/strip@size=2147483647`, `edge/strip@size=31` |
| Worksheet > Clear > Sheet | `tabdoc:validate-workbook-xml workbook-xml="<?xml version='1.0' encoding='utf-8' ?><workboo`<br>`tabui:clear-viz-ui` | XML: + `pane/mark@class=Automatic`, `viewpoint/default-map-tool-selection@tool=2` − `datasource-dependencies/column-instance@column=[Importe]`, `datasource-dependencies/column-instance@column=[Region]`, `datasource-dependencies/column-instance@derivation=None` |
| Worksheet > Actions... | `tabdoc:show-action-list-dialog-for-worksheet`<br>`tabdoc:discard-action-changes` | abre «Actions» |
| Worksheet > Tooltip... | `tabui:edit-tooltip set-all="true"` | abre «Edit Tooltip» |
| Worksheet > Show Title | `tabui:view-title-card` | XML:  − `edge/strip@size=2147483647`, `strip/card@type=title` |
| Worksheet > Show Caption | `tabui:view-caption-card` | XML: + `cards/edge@name`, `edge/strip@size=96`, `strip/card@type=caption` |
| Worksheet > Accessibility | `tabdoc:launch-viz-alt-text-dialog` | abre «Accessibility» |
| Worksheet > Show Summary | `tabui:view-summary-card` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@AVG=true`, `strip/card@KURTOSIS=false` |
| Worksheet > Show Cards > Reset Cards | `tabui:reset-cards` | sin cambio en el documento |
| Worksheet > Show Cards > Columns Shelf | `tabui:view-columns-shelf`<br>`tabdoc:update-animation-side-pane` | XML:  − `edge/strip@size=2147483647`, `strip/card@type=columns` |
| Worksheet > Show Cards > Rows Shelf | `tabui:view-rows-shelf` | XML:  − `edge/strip@size=2147483647`, `strip/card@type=rows` |
| Worksheet > Show Cards > Pages Shelf | `tabui:view-pages-shelf` | XML:  − `strip/card@type=pages` |
| Worksheet > Show Cards > Filters Shelf | `tabui:view-filters-shelf` | XML:  − `strip/card@type=filters` |
| Worksheet > Show Cards > Marks | `tabui:view-marks-shelf` | XML:  − `strip/card@type=marks` |
| Worksheet > Show View Toolbar > Automatic | `tabdoc:zoom-controls toolbar-visibility="auto"` | sin cambio en el documento |
| Worksheet > Show View Toolbar > Show on Hover | `tabdoc:zoom-controls toolbar-visibility="show"` | XML: + `viewpoint/floating-toolbar-visibility@value=1` |
| Worksheet > Show View Toolbar > Hide | `tabdoc:zoom-controls toolbar-visibility="hide"` | XML: + `viewpoint/floating-toolbar-visibility@value=2` |
| Worksheet > Show Sort Controls | `tabdoc:show-sort-controls` | XML: + `document-format-change-manifest/HideSortControls`, `view/hide-sort-controls` |
| Worksheet > Duplicate as Crosstab | `tabui:duplicate-sheet-as-crosstab` | XML: + `cards/edge@name`, `datasource-dependencies/column-instance@column=[Importe]`, `datasource-dependencies/column-instance@column=[Region]`, `datasource-dependencies/column-instance@derivation=None` |
| Worksheet > Auto Updates > Auto Update Worksheet | `tabdoc:auto-update update-scope="worksheet"` | XML: + `worksheets/worksheet@lock-updates=true` |
| Worksheet > Auto Updates > Auto Update Filters | `tabdoc:auto-update update-scope="quick-filters"` | XML: + `worksheets/worksheet@lock-quick-filters=true` |
| Dashboard > New Dashboard | `tabui:new-uidashboard` | XML: + `dashboard/size@maxheight=800`, `dashboard/size@maxwidth=1000`, `dashboard/size@minheight=800`, `dashboard/size@minwidth=1000` |
| Dashboard > Add Phone Layouts to Existing Dashboards | `tabdoc:add-device-layout-to-dashboards dashboard-device-layout="phone"` | XML: + `devicelayout/size@maxheight=700`, `devicelayout/size@maxheight=950`, `devicelayout/size@minheight=700`, `devicelayout/size@minheight=950` |
| Dashboard > Add Phone Layouts to New Dashboards | `tabdoc:toggle-include-phone-layouts` | XML: + `/workbook@include-phone-layouts=false` |
| Story > New Story | `tabui:new-storyboard-ui` | XML: + `dashboard/size@maxheight=964`, `dashboard/size@maxwidth=1016`, `dashboard/size@minheight=964`, `dashboard/size@minwidth=1016` |
| Analysis > Show Mark Labels | `tabdoc:validate-workbook-xml workbook-xml="<?xml version='1.0' encoding='utf-8' ?><workboo`<br>`tabdoc:toggle-mark-labels` | XML: + `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show`, `style-rule/format@value=true`, `style/style-rule@element=mark` |
| Analysis > Aggregate Measures | `tabdoc:aggregate-measures` | XML: + `view/aggregation@value=false` − `view/aggregation@value=true` |
| Analysis > Stack Marks > Automatic | `tabui:stack-marks-ui stacking-mode="auto"` | XML: + `view/breakdown@value=on` − `view/breakdown@value=auto` |
| Analysis > Stack Marks > On | `tabui:stack-marks-ui stacking-mode="on"` | sin cambio en el documento |
| Analysis > Stack Marks > Off | `tabui:stack-marks-ui stacking-mode="off"`<br>`tabdoc:update-animation-side-pane` | XML: + `view/breakdown@value=off` − `view/breakdown@value=auto` |
| Analysis > View Data... | `tabdoc:launch-hybrid-view-data-dialog data-provider-type="selection"`<br>`tabdoc:view-data-dialog-show-aliases show-aliases="true"` | abre «View Data: Barras» |
| Analysis > Percentage Of > None | `tabdoc:percentages show-percentages="false"` | sin cambio en el documento |
| Analysis > Percentage Of > Table | `tabdoc:percentages percentage-mode="table" show-percentages="true"`<br>`tabdoc:update-animation-side-pane` | XML: + `column-instance/table-calc@ordering-type=Table`, `column-instance/table-calc@type=PctTotal`, `table/percentages@enabled=true`, `table/percentages@mode=table` |
| Analysis > Percentage Of > Column | `tabdoc:percentages percentage-mode="column" show-percentages="true"` | XML: + `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@type=PctTotal`, `table/percentages@enabled=true`, `table/percentages@mode=column` |
| Analysis > Percentage Of > Row | `tabdoc:percentages percentage-mode="row" show-percentages="true"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctTotal`, `table/percentages@enabled=true`, `table/percentages@mode=row` |
| Analysis > Percentage Of > Pane | `tabdoc:percentages percentage-mode="pane" show-percentages="true"` | XML: + `column-instance/table-calc@ordering-type=Pane`, `column-instance/table-calc@type=PctTotal`, `table/percentages@enabled=true`, `table/percentages@mode=pane` |
| Analysis > Percentage Of > Row in Pane | `tabdoc:percentages percentage-mode="row-in-pane" show-percentages="true"` | XML: + `column-instance/table-calc@ordering-type=RowInPane`, `column-instance/table-calc@type=PctTotal`, `table/percentages@enabled=true`, `table/percentages@mode=row-in-pane` |
| Analysis > Percentage Of > Column in Pane | `tabdoc:percentages percentage-mode="column-in-pane" show-percentages="true"` | XML: + `column-instance/table-calc@ordering-type=ColumnInPane`, `column-instance/table-calc@type=PctTotal`, `table/percentages@enabled=true`, `table/percentages@mode=column-in-pane` |
| Analysis > Percentage Of > Cell | `tabdoc:percentages percentage-mode="cell-in-pane" show-percentages="true"` | XML: + `column-instance/table-calc@ordering-type=CellInPane`, `column-instance/table-calc@type=PctTotal`, `table/percentages@enabled=true`, `table/percentages@mode=cell-in-pane` |
| Analysis > Totals > Show Row Grand Totals | `tabdoc:show-col-totals` | XML: + `table/cols@total=true` |
| Analysis > Totals > Show Column Grand Totals | `tabdoc:show-row-totals` | XML: + `table/rows@total=true` |
| Analysis > Totals > Row Totals to Left | `tabdoc:move-row-totals` | XML: + `table/cols@onLeft=true` |
| Analysis > Totals > Column Totals to Top | `tabdoc:move-column-totals` | XML: + `table/rows@onTop=true` |
| Analysis > Trend Lines > Show Trend Lines | `tabui:trend-lines-ui pane-spec="0" update-all-panes="true"` | abre «Warning» |
| Analysis > Special Values > Show | `tabdoc:special-values special-values-mode="hide-and-warn"` | XML: + `style-rule/format@attr=break-on-special`, `style-rule/format@attr=omit-on-special`, `style-rule/format@attr=show-null-value-warning`, `style-rule/format@value=true` |
| Analysis > Special Values > Hide | `tabdoc:special-values special-values-mode="hide-break-lines"` | XML: + `style-rule/format@attr=break-on-special`, `style-rule/format@attr=omit-on-special`, `style-rule/format@attr=show-null-value-warning`, `style-rule/format@value=false` |
| Analysis > Table Layout > Show Empty Rows | `tabdoc:show-empty-rows` | XML: + `table/rows@include-empty=true` |
| Analysis > Table Layout > Show Empty Columns | `tabdoc:show-empty-cols` | XML: + `table/cols@include-empty=true` |
| Analysis > Table Layout > Show Field Labels for Rows | `tabdoc:show-row-field-names` | XML: + `style-rule/format@attr=display-field-labels`, `style-rule/format@scope=rows`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Analysis > Table Layout > Advanced... | `tabui:show-table-options-dialog` | abre «Table Options» |
| Analysis > Filters > Disable Auto Update | `tabdoc:toggle-lock-quick-filters` | XML: + `worksheets/worksheet@lock-quick-filters=true` |
| Analysis > Filters > Region | `tabdoc:view-quick-filters fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]"` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Region:nk]` |
| Analysis > Filters > Sum of Importe | `tabdoc:view-quick-filters fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]"` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `strip/card@show-domain=false` |
| Analysis > Highlighters > Region | — | sin cambio en el documento; error: no item 'Region' |
| Analysis > Create Calculated Field... | `tabui:create-calculation-ui use-selector="false"` | abre «Dialog» |
| Analysis > Infer Properties from Missing Values | `tabdoc:enable-calculations-for-densified-marks` | XML: + `view/calcs-on-densified-marks@value=true` |
| Analysis > Swap Rows and Columns | `tabdoc:swap-rows-and-columns` | XML:  |
| Map > Background Maps > Light | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Normal | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Dark | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Streets | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Outdoors | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Satellite | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Offline | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > None | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Add Mapbox Map... | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Add WMS Map... | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Manage Maps... | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Maps > Set As Default | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Background Images > Ventas... | — | sin cambio en el documento; error: no menu 'Map' |
| Map > Geocoding > Import Custom Geocoding... | — | sin cambio en el documento; error: no menu 'Map' |
| Format > Workbook... | `tabdoc:open-workbook-format-side-pane`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Font... | `tabui:format-ui element-instance-id="" field-names=[] format-context="fonts"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Alignment... | `tabui:format-ui element-instance-id="" field-names=[] format-context="alignment"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Shading... | `tabui:format-ui element-instance-id="" field-names=[] format-context="shading"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Borders... | `tabui:format-ui element-instance-id="" field-names=[] format-context="borders"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Lines... | `tabui:format-ui element-instance-id="" field-names=[] format-context="lines"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Animations... | `tabdoc:launch-animation-side-pane`<br>`tabdoc:set-secondary-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Reference Lines... | `tabui:format-ui element-instance-id="" field-names=[] format-context="ref-lines"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Drop Lines... | `tabui:format-ui element-instance-id="" field-names=[] format-context="drop-lines"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Annotations... | `tabui:format-ui element-instance-id="" field-names=[] format-context="annotations"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Title and Caption... | `tabui:format-ui element-instance-id="" field-names=[] format-context="titcap"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Field Labels... | `tabui:format-ui element-instance-id="" field-names=[] format-context="field-labels"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Legends... | `tabui:format-ui element-instance-id="" field-names=[] format-context="legends"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Filters... | `tabui:format-ui element-instance-id="" field-names=[] format-context="quick-filters"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Highlighters... | `tabui:format-ui element-instance-id="" field-names=[] format-context="data-highlighters"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Parameters... | `tabui:format-ui element-instance-id="" field-names=[] format-context="parameter-ctrls"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Cell Size > Taller | `tabdoc:cell-size cell-size-change="taller" max-cell="240" min-cell="6"`<br>`tabdoc:update-animation-side-pane` | XML: + `style-rule/format@attr=aspect`, `style-rule/format@attr=cell`, `style-rule/format@attr=cell-h`, `style-rule/format@attr=cell-q` |
| Format > Cell Size > Wider | `tabdoc:cell-size cell-size-change="wider" max-cell="240" min-cell="6"`<br>`tabdoc:update-animation-side-pane` | XML: + `style-rule/format@attr=aspect`, `style-rule/format@attr=cell`, `style-rule/format@attr=cell-h`, `style-rule/format@attr=cell-q` |
| Format > Cell Size > Narrower | `tabdoc:cell-size cell-size-change="narrower" max-cell="240" min-cell="6"`<br>`tabdoc:update-animation-side-pane` | XML: + `style-rule/format@attr=aspect`, `style-rule/format@attr=cell`, `style-rule/format@attr=cell-h`, `style-rule/format@attr=cell-q` |
| Format > Cell Size > Bigger | `tabdoc:cell-size cell-size-change="bigger" max-cell="240" min-cell="6"`<br>`tabdoc:update-animation-side-pane` | XML: + `style-rule/format@attr=cell`, `style-rule/format@attr=cell-h`, `style-rule/format@attr=cell-q`, `style-rule/format@attr=cell-w` |
| Format > Cell Size > Smaller | `tabdoc:cell-size cell-size-change="smaller" max-cell="240" min-cell="6"`<br>`tabdoc:update-animation-side-pane` | XML: + `style-rule/format@attr=cell`, `style-rule/format@attr=cell-h`, `style-rule/format@attr=cell-q`, `style-rule/format@attr=cell-w` |
| Format > Cell Size > Square Cell | `tabdoc:cell-type cell-type="square" horz-text-cell="3" vert-text-cell="1"`<br>`tabdoc:update-animation-side-pane` | XML: + `style-rule/format@attr=cell`, `style-rule/format@attr=cell-h`, `style-rule/format@attr=cell-q`, `style-rule/format@attr=cell-w` |
| Format > Cell Size > Text Cell | `tabdoc:cell-type cell-type="text" horz-text-cell="3" vert-text-cell="1"`<br>`tabdoc:update-animation-side-pane` | XML: + `style-rule/format@attr=cell`, `style-rule/format@attr=cell-h`, `style-rule/format@attr=cell-q`, `style-rule/format@attr=cell-w` |
| Format > Workbook Theme > Default | — | sin cambio en el documento; error: no item 'Default' |
| Format > Workbook Theme > Previous | — | sin cambio en el documento; error: no item 'Previous' |
| Format > Workbook Theme > Modern | — | sin cambio en el documento; error: no item 'Modern' |
| Format > Workbook Theme > Classic | — | sin cambio en el documento; error: no item 'Classic' |
| Format > Import Custom Theme... | `tabui:import-theme` | abre «Import Custom Theme» |

Desactivados en esta hoja (necesitan una selección o no aplican): 46. Data > Paste, Data > Refresh All Extracts..., Data > Edit Blend Relationships..., Data > Replace Data Source..., Data > Ventas > Use Extract, Data > Ventas > Replace Data Source..., Worksheet > Clear > Formatting, Worksheet > Clear > Axis Ranges, Worksheet > Clear > Context, Worksheet > Show Cards > Measure Values Shelf, Worksheet > Show Cards > Current Page, Dashboard > Show Grid, Dashboard > Grid Options..., Dashboard > Format, Dashboard > Copy Selected Dashboard Item, Dashboard > Copy Image, Dashboard > Export Image..., Dashboard > Clear, Dashboard > Show Title, Dashboard > Actions..., Dashboard > Auto Update, Dashboard > Run Update, Dashboard > Add Phone Layouts to Existing Dashboards, Story > Format, Story > Copy Image, Story > Export Image..., Story > Clear, Story > Show Title, Story > Show Back/Forward Buttons, Story > Run Update, Analysis > Reveal Hidden Data, Analysis > Totals > Add All Subtotals, Analysis > Totals > Remove All Subtotals, Analysis > Trend Lines > Edit All Trend Lines..., Analysis > Trend Lines > Describe Trend Model..., Analysis > Table Layout > Show Field Labels for Columns, Analysis > Cycle Fields, Analysis > Analytics Extension Custom Functions Explorer, Map > Map Legend, Map > Background Layers...…

## Hoja `Linea` (worksheets)

| menú | comando interno | efecto |
|---|---|---|
| Analysis > Forecast > Show Forecast | `tabdoc:forecast-toggle`<br>`tabdoc:update-animation-side-pane` | XML: + `datasource-dependencies/column-instance@column=[Forecast Indicator]`, `datasource-dependencies/column-instance@column=[Importe]`, `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@derivation=Sum` |
| Analysis > Filters > Canal | `tabdoc:view-quick-filters fn="[federated.tszse28gx02x3fnwag3qym7mmnuk (copy)].[none:Canal:`<br>`tabdoc:update-animation-side-pane` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Canal:nk]` |
| Analysis > Filters > Month of Fecha | `tabdoc:view-quick-filters fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[tmn:Fecha:qk]"`<br>`tabdoc:update-animation-side-pane` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[tmn:Fecha:qk]`, `strip/card@show-domain=false` |

Desactivados en esta hoja (necesitan una selección o no aplican): 46. Data > Paste, Data > Refresh All Extracts..., Data > Edit Blend Relationships..., Data > Replace Data Source..., Data > Ventas > Use Extract, Data > Ventas > Replace Data Source..., Worksheet > Clear > Formatting, Worksheet > Clear > Axis Ranges, Worksheet > Clear > Context, Worksheet > Show Cards > Measure Values Shelf, Worksheet > Show Cards > Current Page, Dashboard > Show Grid, Dashboard > Grid Options..., Dashboard > Format, Dashboard > Copy Selected Dashboard Item, Dashboard > Copy Image, Dashboard > Export Image..., Dashboard > Clear, Dashboard > Show Title, Dashboard > Actions..., Dashboard > Auto Update, Dashboard > Run Update, Dashboard > Add Phone Layouts to Existing Dashboards, Story > Format, Story > Copy Image, Story > Export Image..., Story > Clear, Story > Show Title, Story > Show Back/Forward Buttons, Story > Run Update, Analysis > Reveal Hidden Data, Analysis > Totals > Add All Subtotals, Analysis > Totals > Remove All Subtotals, Analysis > Forecast > Forecast Options..., Analysis > Forecast > Describe Forecast..., Analysis > Trend Lines > Edit All Trend Lines..., Analysis > Trend Lines > Describe Trend Model..., Analysis > Table Layout > Show Field Labels for Rows, Analysis > Table Layout > Show Field Labels for Columns, Analysis > Cycle Fields…

## Hoja `Tabla` (worksheets)

| menú | comando interno | efecto |
|---|---|---|
| Analysis > Table Layout > Show Field Labels for Columns | `tabdoc:show-col-field-names`<br>`tabdoc:update-animation-side-pane` | XML: + `style-rule/format@attr=display-field-labels`, `style-rule/format@scope=cols`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Analysis > Cycle Fields | `tabdoc:show-me-cycle`<br>`tabdoc:update-animation-side-pane` | XML:  |

Desactivados en esta hoja (necesitan una selección o no aplican): 45. Data > Paste, Data > Refresh All Extracts..., Data > Edit Blend Relationships..., Data > Replace Data Source..., Data > Ventas > Use Extract, Data > Ventas > Replace Data Source..., Worksheet > Clear > Formatting, Worksheet > Clear > Axis Ranges, Worksheet > Clear > Context, Worksheet > Show Cards > Measure Values Shelf, Worksheet > Show Cards > Current Page, Dashboard > Show Grid, Dashboard > Grid Options..., Dashboard > Format, Dashboard > Copy Selected Dashboard Item, Dashboard > Copy Image, Dashboard > Export Image..., Dashboard > Clear, Dashboard > Show Title, Dashboard > Actions..., Dashboard > Auto Update, Dashboard > Run Update, Dashboard > Add Phone Layouts to Existing Dashboards, Story > Format, Story > Copy Image, Story > Export Image..., Story > Clear, Story > Show Title, Story > Show Back/Forward Buttons, Story > Run Update, Analysis > Show Mark Labels, Analysis > Reveal Hidden Data, Analysis > Totals > Add All Subtotals, Analysis > Totals > Remove All Subtotals, Analysis > Trend Lines > Edit All Trend Lines..., Analysis > Trend Lines > Describe Trend Model..., Analysis > Analytics Extension Custom Functions Explorer, Map > Map Legend, Map > Background Layers..., Map > Map Options...…

## Hoja `Dispersion` (worksheets)

| menú | comando interno | efecto |
|---|---|---|
| Analysis > Filters > Sum of Coste | `tabdoc:view-quick-filters fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Coste:qk]"`<br>`tabdoc:update-animation-side-pane` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Coste:qk]`, `strip/card@show-domain=false` |

Desactivados en esta hoja (necesitan una selección o no aplican): 43. Data > Paste, Data > Refresh All Extracts..., Data > Edit Blend Relationships..., Data > Replace Data Source..., Data > Ventas > Use Extract, Data > Ventas > Replace Data Source..., Worksheet > Clear > Formatting, Worksheet > Clear > Axis Ranges, Worksheet > Clear > Context, Worksheet > Show Cards > Measure Values Shelf, Worksheet > Show Cards > Current Page, Dashboard > Show Grid, Dashboard > Grid Options..., Dashboard > Format, Dashboard > Copy Selected Dashboard Item, Dashboard > Copy Image, Dashboard > Export Image..., Dashboard > Clear, Dashboard > Show Title, Dashboard > Actions..., Dashboard > Auto Update, Dashboard > Run Update, Dashboard > Add Phone Layouts to Existing Dashboards, Story > Format, Story > Copy Image, Story > Export Image..., Story > Clear, Story > Show Title, Story > Show Back/Forward Buttons, Story > Run Update, Analysis > Reveal Hidden Data, Analysis > Totals > Add All Subtotals, Analysis > Totals > Remove All Subtotals, Analysis > Trend Lines > Edit All Trend Lines..., Analysis > Trend Lines > Describe Trend Model..., Analysis > Table Layout > Show Field Labels for Rows, Analysis > Table Layout > Show Field Labels for Columns, Analysis > Analytics Extension Custom Functions Explorer, Format > Dashboard..., Format > Story...…

## Hoja `Tablero` (dashboards)

| menú | comando interno | efecto |
|---|---|---|
| Data > Ventas > Refresh | `tabui:refresh-datasource-ui datasource="*****"`<br>`tabdoc:update-animation-side-pane` | sin cambio en el documento |
| Data > Ventas > View Data... | `tabdoc:launch-hybrid-view-data-dialog data-provider-type="datasource" datasource="*****"`<br>`tabdoc:view-data-dialog-show-aliases show-aliases="true"` | abre «View Data: Ventas» |
| Data > Ventas > Rename... | `tabui:rename-datasource-ui datasource="*****"` | abre «Rename Data Source» |
| Data > Ventas > Duplicate | `tabui:duplicate-datasource-ui datasource="*****"`<br>`tabdoc:update-animation-side-pane` | XML: + `attributes/attribute@datatype=string`, `attributes/attribute@name`, `columns/column@datatype=date`, `columns/column@datatype=integer` |
| Data > Ventas > Edit Data Source Filters... | `tabui:edit-datasource-filters-ui datasource="*****"`<br>`tabdoc:create-datasource-filter-store datasource="*****" load-global="true"` | abre «Edit Data Source Filters» |
| Data > Ventas > Assume Referential Integrity | `tabui:toggle-referential-integrity-ui datasource="*****"` | XML: + `datasource/connection@tableau-ri=true` |
| Data > Ventas > Date Properties... | `tabui:edit-datasource-date-properties-ui datasource="*****"` | abre «Date Properties [Ventas]» |
| Worksheet > New Worksheet | `tabui:new-worksheet-ui` | XML: + `cards/edge@name`, `edge/strip@size=160`, `edge/strip@size=2147483647`, `edge/strip@size=31` |
| Worksheet > Auto Updates > Auto Update Filters | `tabdoc:auto-update update-scope="quick-filters"` | XML: + `dashboards/dashboard@lock-quick-filters=true`, `worksheets/worksheet@lock-quick-filters=true` |
| Dashboard > New Dashboard | `tabui:new-uidashboard` | XML: + `dashboard/size@maxheight=800`, `dashboard/size@maxwidth=1000`, `dashboard/size@minheight=800`, `dashboard/size@minwidth=1000` |
| Dashboard > Device Layouts > Add Desktop | `tabdoc:new-dashboard-layout activate-new="true" dashboard-device-layout="desktop"` | XML: + `devicelayouts/devicelayout@active=true`, `devicelayouts/devicelayout@name` |
| Dashboard > Device Layouts > Add Tablet | `tabdoc:new-dashboard-layout activate-new="true" dashboard-device-layout="tablet"` | XML: + `devicelayout/size@sizing-mode=automatic`, `devicelayouts/devicelayout@name` |
| Dashboard > Device Layouts > Add Phone | `tabdoc:new-dashboard-layout activate-new="true" dashboard-device-layout="phone"` | XML: + `devicelayout/size@maxheight=950`, `devicelayout/size@minheight=950`, `devicelayout/size@sizing-mode=vscroll`, `devicelayouts/devicelayout@auto-generated=true` |
| Dashboard > Show Grid | `tabdoc:dashboard-show-grid` | XML: + `window/grid@grid-overlay-mode=on` |
| Dashboard > Format | — | sin cambio en el documento; error: no item 'Format' |
| Dashboard > Clear | — | sin cambio en el documento; error: no item 'Clear' |
| Dashboard > Show Title | — | sin cambio en el documento; error: item 'Show Title' is disabled |
| Dashboard > Actions... | — | sin cambio en el documento; error: no item 'Actions...' |
| Dashboard > Auto Update | `tabdoc:auto-update update-scope="dashboard"` | XML: + `dashboards/dashboard@lock-updates=true`, `worksheets/worksheet@lock-updates=true` |
| Dashboard > Add Phone Layouts to Existing Dashboards | — | sin cambio en el documento; error: item 'Add Phone Layouts to Existing Dashboards' is disabled |
| Dashboard > Add Phone Layouts to New Dashboards | `tabdoc:toggle-include-phone-layouts` | XML: + `/workbook@include-phone-layouts=false` |
| Story > New Story | `tabui:new-storyboard-ui` | XML: + `dashboard/size@maxheight=964`, `dashboard/size@maxwidth=1016`, `dashboard/size@minheight=964`, `dashboard/size@minwidth=1016` |
| Analysis > Infer Properties from Missing Values | — | sin cambio en el documento; error: no item 'Infer Properties from Missing Values' |
| Format > Dashboard... | — | sin cambio en el documento; error: no item 'Dashboard...' |
| Format > Workbook... | `tabdoc:open-workbook-format-side-pane`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Animations... | — | sin cambio en el documento |
| Format > Parameters... | — | sin cambio en el documento; error: no item 'Parameters...' |
| Format > Workbook Theme > Default | — | sin cambio en el documento; error: no item 'Default' |
| Format > Workbook Theme > Previous | — | sin cambio en el documento; error: no item 'Previous' |
| Format > Workbook Theme > Modern | — | sin cambio en el documento; error: no item 'Modern' |
| Format > Workbook Theme > Classic | — | sin cambio en el documento; error: no item 'Classic' |
| Format > Import Custom Theme... | `tabui:import-theme` | abre «Import Custom Theme» |

Desactivados en esta hoja (necesitan una selección o no aplican): 50. Data > Paste, Data > Refresh All Extracts..., Data > Edit Blend Relationships..., Data > Replace Data Source..., Data > Ventas > Use Extract, Data > Ventas > Replace Data Source..., Worksheet > Actions..., Worksheet > Tooltip..., Worksheet > Show Title, Worksheet > Show Caption, Worksheet > Accessibility, Worksheet > Show Summary, Worksheet > Show Sort Controls, Worksheet > Describe Sheet..., Worksheet > Duplicate as Crosstab, Worksheet > Auto Updates > Auto Update Worksheet, Dashboard > Grid Options..., Dashboard > Copy Selected Dashboard Item, Dashboard > Run Update, Story > Format, Story > Copy Image, Story > Export Image..., Story > Clear, Story > Show Title, Story > Show Back/Forward Buttons, Story > Run Update, Analysis > Show Mark Labels, Analysis > Aggregate Measures, Analysis > Reveal Hidden Data, Analysis > Cycle Fields, Analysis > Swap Rows and Columns, Analysis > Analytics Extension Custom Functions Explorer, Format > Story..., Format > Font..., Format > Alignment..., Format > Shading..., Format > Borders..., Format > Lines..., Format > Reference Lines..., Format > Drop Lines...…

## Hoja `Historia` (stories)

| menú | comando interno | efecto |
|---|---|---|
| Worksheet > New Worksheet | `tabui:new-worksheet-ui`<br>`tabdoc:update-animation-side-pane` | XML: + `cards/edge@name`, `edge/strip@size=160`, `edge/strip@size=2147483647`, `edge/strip@size=31` |
| Dashboard > New Dashboard | `tabui:new-uidashboard`<br>`tabdoc:update-animation-side-pane` | XML: + `dashboard/size@maxheight=800`, `dashboard/size@maxwidth=1000`, `dashboard/size@minheight=800`, `dashboard/size@minwidth=1000` |
| Dashboard > Add Phone Layouts to New Dashboards | `tabdoc:toggle-include-phone-layouts`<br>`tabdoc:update-animation-side-pane` | XML:  − `/workbook@include-phone-layouts=false` |
| Story > New Story | `tabui:new-storyboard-ui`<br>`tabdoc:update-animation-side-pane` | XML: + `dashboard/size@maxheight=964`, `dashboard/size@maxwidth=1016`, `dashboard/size@minheight=964`, `dashboard/size@minwidth=1016` |
| Story > Format | `tabui:format-ui element-instance-id="" field-names=[] format-context="story"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Story > Clear | `tabui:clear-story-ui` | XML: + `story-points/story-point@captured-sheet=`, `zone-style/format@attr=border-color`, `zone-style/format@attr=border-style`, `zone-style/format@attr=border-width` − `story-points/story-point@caption`, `story-points/story-point@captured-sheet=Barras`, `story-points/story-point@captured-sheet=Tablero` |
| Story > Show Title | `tabdoc:show-storyboard-title`<br>`tabdoc:update-animation-side-pane` | XML:  − `zone/zone@h`, `zone/zone@id`, `zone/zone@type-v2=title` |
| Story > Show Back/Forward Buttons | `tabdoc:toggle-storypoints-nav-arrows` | XML: + `zone/flipboard@show-nav-arrows=false` − `zone/flipboard@show-nav-arrows=true` |
| Format > Story... | `tabui:format-ui element-instance-id="" field-names=[] format-context="story"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Workbook... | `tabdoc:open-workbook-format-side-pane`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Animations... | `tabdoc:launch-animation-side-pane`<br>`tabdoc:set-secondary-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Format > Import Custom Theme... | `tabui:import-theme` | abre «Import Custom Theme» |

Desactivados en esta hoja (necesitan una selección o no aplican): 10. Data > Refresh All Extracts..., Data > Ventas > Use Extract, Dashboard > Show Grid, Dashboard > Grid Options..., Dashboard > Add Phone Layouts to Existing Dashboards, Story > Run Update, Analysis > Analytics Extension Custom Functions Explorer, Format > Export Custom Theme..., Format > Copy Formatting, Format > Paste Formatting

