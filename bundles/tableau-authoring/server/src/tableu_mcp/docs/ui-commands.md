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

# Menús contextuales (clic derecho)

Mismo método sobre el menú que abre un clic derecho en cada objeto de la hoja.

## `Barras` · axis:top (zona sin objeto: menú de tarjetas)

| ítem | comando interno | efecto |
|---|---|---|
| Reset Cards | `tabui:reset-cards` | sin cambio en el documento |
| Title | `tabui:view-title-card` | XML:  − `edge/strip@size=2147483647`, `strip/card@type=title` |
| Caption | `tabui:view-caption-card` | XML: + `cards/edge@name`, `edge/strip@size=96`, `strip/card@type=caption` |
| Summary | `tabui:view-summary-card` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@AVG=true`, `strip/card@KURTOSIS=false` |
| Filters > Disable Auto Update | `tabdoc:toggle-lock-quick-filters` | XML: + `worksheets/worksheet@lock-quick-filters=true` |
| Filters > Region | `tabdoc:view-quick-filters fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]"` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Region:nk]` |
| Filters > Sum of Importe | `tabdoc:view-quick-filters fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]"` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `strip/card@show-domain=false` |
| Highlighters > Region | `tabdoc:view-data-highlighter-range global-field-name="[federated.tszse28gx02x3fnwag3qym7mm` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `strip/card@type=highlighter` |
| Columns Shelf | `tabui:view-columns-shelf` | XML:  − `edge/strip@size=2147483647`, `strip/card@type=columns` |
| Rows Shelf | `tabui:view-rows-shelf` | XML:  − `edge/strip@size=2147483647`, `strip/card@type=rows` |
| Pages Shelf | `tabui:view-pages-shelf` | XML:  − `strip/card@type=pages` |
| Filters Shelf | `tabui:view-filters-shelf` | XML:  − `strip/card@type=filters` |
| Marks | `tabui:view-marks-shelf` | XML:  − `strip/card@type=marks` |

Desactivados: Map Legend, Measure Values Shelf, Current Page

## `Barras` · axis:bottom (cabecera / eje)

| ítem | comando interno | efecto |
|---|---|---|
| Edit Axis... | `tabdoc:show-edit-axis-dialog axis-orientation="o-horiz" duplicate-index="0" fn="[federated` | abre «Edit Axis [Importe]» |
| Format... | `tabui:format-axis-ui axis-orientation="o-horiz" duplicate-index="0" fn="[federated.tszse28`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header axis-orientation="o-horiz" duplicate-index="0" fn="[federated.tszse28gx` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@scope=cols` |
| Add Reference Line | `tabui:add-reference-line-ui axis-orientation="o-horiz" duplicate-index="0" fn="[federated.` | abre «Add Reference Line, Band, or Box» |

Desactivados: Clear Axis Range

## `Barras` · axis:left (cabecera / eje)

| ítem | comando interno | efecto |
|---|---|---|
| Keep only | `tabdoc:keep-only-or-exclude exclude="false"` | XML: + `filter/groupfilter@function=member`, `filter/groupfilter@level=[none:Region:nk]`, `filter/groupfilter@member="Este"`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=relevant` |
| Exclude | `tabdoc:keep-only-or-exclude exclude="true"` | XML: + `filter/groupfilter@function=except`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=relevant`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=exclusive`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-marker=enumerate` − `node-selection/oriented-node-reference@orientation=vertical`, `selection-collection/node-selection@select-tuples=false` |
| Hide | `tabdoc:hide-label` | XML: + `filter/groupfilter@function=except`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=relevant`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=exclusive`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-manual-selection-all-when-empty=true` |
| Format... | `tabui:format-label`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | XML: + `node-selection/oriented-node-reference@orientation=vertical`, `selection-collection/node-selection@select-tuples=false` |
| Rotate Label | `tabdoc:rotate-label` | XML: + `style-rule/format@attr=text-orientation`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=-90`, `style/style-rule@element=label` |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=false`, `style/style-rule@element=label` |
| Edit Alias... | `tabui:edit-member-alias-label` | abre «Edit Alias» |
| Split | `tabdoc:split-field-label` | sin cambio en el documento |

## `Barras` · title (título)

| ítem | comando interno | efecto |
|---|---|---|
| Edit Title... | `tabui:edit-title` | abre «Edit Title» |
| Hide Title | `tabdoc:hide-viz-title worksheet="Barras"` | XML:  − `edge/strip@size=2147483647`, `strip/card@type=title` |
| Format Title... | `tabui:format-caption-title`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |

Desactivados: Reset Title

## `Barras` · shelf:filters (píldora del estante)

No se abrió: no context menu

## `Barras` · marks:encoding (píldora de Marcas)

| ítem | comando interno | efecto |
|---|---|---|
| New Calculation | `tabui:start-pill-edit-ui pane-spec="0" shelf-pos-index="0" shelf-type="encoding-shelf"` | sin cambio en el documento |

## `Barras` · shelf:cols (píldora del estante)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:create-quantitative-filter-store global-field-name="[federated.tszse28gx02x3fnwag3q` | abre «Filter [Importe]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `strip/card@show-domain=false` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [SUM(Importe)]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@scope=cols` |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | XML: + `datasource-dependencies/column-instance@derivation=None` − `datasource-dependencies/column-instance@derivation=Sum` |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Sum | `tabui:change-aggregation-ui aggregation="sum"` | sin cambio en el documento |
| Measure (Sum) > Average | `tabui:change-aggregation-ui aggregation="average"` | XML: + `datasource-dependencies/column-instance@derivation=Avg` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Median | `tabui:change-aggregation-ui aggregation="median"` | XML: + `datasource-dependencies/column-instance@derivation=Median` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Std. Dev | `tabui:change-aggregation-ui aggregation="std-dev"` | XML: + `datasource-dependencies/column-instance@derivation=Stdev` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Std. Dev (Pop.) | `tabui:change-aggregation-ui aggregation="std-dev-p"` | XML: + `datasource-dependencies/column-instance@derivation=StdevP` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Variance | `tabui:change-aggregation-ui aggregation="var"` | XML: + `datasource-dependencies/column-instance@derivation=Var` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Variance (Pop.) | `tabui:change-aggregation-ui aggregation="var-p"` | XML: + `datasource-dependencies/column-instance@derivation=VarP` − `datasource-dependencies/column-instance@derivation=Sum` |
| Discrete | `tabui:change-field-type-ui field-type="ordinal"` | XML: + `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@type=quantitative` |
| Continuous | `tabui:change-field-type-ui field-type="quantitative"` | sin cambio en el documento |
| Add Table Calculation... | `tabdoc:table-calc-add`<br>`tabdoc:highlight brush-legends="false" pane-spec="0" selector={} special-fields="table" ta` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@type=Difference` |
| Quick Table Calculation > Running Total | `tabui:quick-table-calc-ui quick-table-calc-type="run-total"` | XML: + `column-instance/table-calc@aggregation=Sum`, `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@type=CumTotal` |
| Quick Table Calculation > Difference | `tabui:quick-table-calc-ui quick-table-calc-type="difference"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@type=Difference` |
| Quick Table Calculation > Percent Difference | `tabui:quick-table-calc-ui quick-table-calc-type="pct-diff"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@type=PctDiff` |
| Quick Table Calculation > Percent of Total | `tabui:quick-table-calc-ui quick-table-calc-type="pct-total"` | XML: + `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@type=PctTotal` |
| Quick Table Calculation > Rank | `tabui:quick-table-calc-ui quick-table-calc-type="rank"` | XML: + `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@rank-options=Competition,Descending`, `column-instance/table-calc@type=Rank` |
| Quick Table Calculation > Percentile | `tabui:quick-table-calc-ui quick-table-calc-type="pct-rank"` | XML: + `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@rank-options=Competition,Ascending`, `column-instance/table-calc@type=PctRank` |
| Quick Table Calculation > Moving Average | `tabui:quick-table-calc-ui quick-table-calc-type="moving-avg"` | XML: + `column-instance/table-calc@aggregation=Avg`, `column-instance/table-calc@from=-2`, `column-instance/table-calc@ordering-type=Columns`, `column-instance/table-calc@to=0` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Importe]`, `datasource-dependencies/column-instance@derivation=Sum`, `datasource-dependencies/column-instance@name` |

Desactivados: Quick Table Calculation > YTD Total, Quick Table Calculation > Compound Growth Rate, Quick Table Calculation > Year Over Year Growth, Quick Table Calculation > YTD Growth

## `Barras` · shelf:rows (píldora del estante)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:format-datavalue-ui data-value="r:::0"` | abre «Filter [Region]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Region:nk]` |
| Show Highlighter | `tabdoc:view-data-highlighter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `strip/card@type=highlighter` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [Region]» |
| Sort... | `tabdoc:show-sort-dialog global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:` | abre «Sort [Region]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=false`, `style/style-rule@element=label` |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Edit Aliases... | `tabui:edit-aliases-ui`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]"` | abre «Edit Aliases [Region]» |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | sin cambio en el documento |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count`, `datasource-dependencies/column-instance@type=quantitative` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal` |
| Measure > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD`, `datasource-dependencies/column-instance@type=quantitative` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Region]`, `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@name` |

## `Barras` · field:Fecha (campo del panel de datos)

| ítem | comando interno | efecto |
|---|---|---|
| Add to Sheet | `tabui:add-to-sheet-ui datasource="*****"` | XML: + `datasource-dependencies/column-instance@column=[Fecha]`, `datasource-dependencies/column-instance@derivation=Year`, `datasource-dependencies/column-instance@name`, `datasource-dependencies/column-instance@pivot=key` |
| Show Filter | `tabui:show-quickfilter-ui` | XML: + `cards/edge@name`, `datasource-dependencies/column-instance@column=[Fecha]`, `datasource-dependencies/column-instance@derivation=Year`, `datasource-dependencies/column-instance@name` |
| Create > Calculated Field... | `tabui:create-calculation-ui use-selector="true"`<br>`tabdoc:create-calc datasource="*****" fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha]` | abre «Dialog» |
| Create > Group... | `tabui:create-categorical-bins-ui` | abre «Create Group [Fecha]» |
| Create > Set... | `tabui:create-group-ui global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha]"`<br>`tabdoc:format-datavalue-ui data-value="r:::0"` | abre «Create Set» |
| Create > Parameter... | `tabdoc:create-new-parameter` | abre «Create Parameter» |
| Create > Custom date... | `tabui:create-Date-bin-ui` | abre «Create Custom Date [Fecha]» |
| Convert to Continuous | `tabdoc:convert-to-continuous` | XML: + `datasource-dependencies/column@type=quantitative`, `datasource/column@datatype=date`, `datasource/column@name`, `datasource/column@role=dimension` − `datasource-dependencies/column@type=ordinal` |
| Change Data Type > Number (decimal) | `tabdoc:change-data-type-menu-item data-type="real" datasource="*****" field-names=["[feder` | XML: + `columns/column@datatype=real`, `datasource-dependencies/column@datatype=real`, `datasource/column@datatype=real` − `columns/column@datatype=date`, `datasource-dependencies/column@datatype=date`, `datasource/column@datatype=date` |
| Change Data Type > Number (whole) | `tabdoc:change-data-type-menu-item data-type="integer" datasource="*****" field-names=["[fe` | XML: + `columns/column@datatype=integer`, `datasource-dependencies/column@datatype=integer` − `columns/column@datatype=date`, `datasource-dependencies/column@datatype=date` |
| Change Data Type > Date & Time | — | sin cambio en el documento; error: Desktop did not answer: timed out |
| Change Data Type > Date | — | **deja Desktop sin poder aplicar documentos** |
| Change Data Type > String | — | sin cambio en el documento |
| Change Data Type > Boolean | — | sin cambio en el documento |
| Change Data Type > Default | — | sin cambio en el documento |
| Default Properties > Comment... | `tabui:edit-user-description-ui` | abre «Edit Comment [Fecha]» |
| Default Properties > Color... | `tabui:edit-mark-color-ui` | abre «Edit Colors [Fecha]» |
| Default Properties > Shape... | `tabui:edit-mark-shape-ui` | abre «Edit Shape [Fecha]» |
| Default Properties > Date Format... | `tabui:set-default-date-format-ui` | abre «Default Date Format [Fecha]» |
| Default Properties > Sort... | `tabdoc:show-sort-dialog global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha` | abre «Sort [Fecha]» |
| Group by > Folder | `tabdoc:group-by-table datasource="*****" show-structure="false"` | XML: + `datasource/layout@show-structure=false` − `datasource/layout@show-structure=true` |
| Group by > Data Source Table | `tabdoc:group-by-table datasource="*****" show-structure="true"` | XML: + `datasource/layout@show-structure=true` − `datasource/layout@show-structure=false` |
| Hierarchy > Create Hierarchy... | `tabui:new-schema-drill-path-ui datasource="*****"` | abre «Create Hierarchy» |
| Replace References... | `tabui:replace-field-ui` | abre «Replace References...» |

Desactivados: Hide

## `Barras` · field:Region (campo del panel de datos)

| ítem | comando interno | efecto |
|---|---|---|
| Add to Sheet | `tabui:add-to-sheet-ui datasource="*****"` | XML:  |
| Show Filter | `tabui:show-quickfilter-ui` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Region:nk]` |
| Aliases... | `tabui:edit-schema-field-alias-ui`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Region]"` | abre «Edit Aliases [Region]» |
| Create > Calculated Field... | `tabui:create-calculation-ui use-selector="true"`<br>`tabdoc:create-calc datasource="*****" fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Region` | abre «Dialog» |
| Create > Group... | `tabui:create-categorical-bins-ui` | abre «Create Group [Region]» |
| Create > Set... | `tabui:create-group-ui global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Region]`<br>`tabdoc:format-datavalue-ui data-value="r:::0"` | abre «Create Set» |
| Create > Parameter... | `tabdoc:create-new-parameter` | abre «Create Parameter» |
| Transform > Split | `tabui:split-field-ui` | abre «Custom Split» |
| Transform > Custom Split... | `tabui:show-custom-split-dialog-ui` | abre «Custom Split» |
| Transform > Make date | `tabdoc:make-date` | XML: + `column/calculation@class=tableau`, `column/calculation@formula`, `datasource/column@datatype=date`, `datasource/column@name` |
| Convert to Measure | `tabdoc:convert-to-measure`<br>`tabui:set-worksheet-sidepane-mode mode="data"` | XML: + `datasource-dependencies/column@aggregation=CountD`, `datasource-dependencies/column@default-role=measure`, `datasource-dependencies/column@default-type=quantitative`, `datasource/column@aggregation=CountD` |
| Default Properties > Comment... | `tabui:edit-user-description-ui` | abre «Edit Comment [Region]» |
| Default Properties > Color... | `tabui:edit-mark-color-ui` | abre «Edit Colors [Region]» |
| Default Properties > Shape... | `tabui:edit-mark-shape-ui` | abre «Edit Shape [Region]» |
| Default Properties > Sort... | `tabdoc:show-sort-dialog global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Regio` | abre «Sort [Region]» |
| Geographic Role > None | `tabdoc:change-semantic-role field-vector=["[federated.tszse28gx02x3fnwag3qym7mmnuk].[Regio` | sin cambio en el documento |
| Geographic Role > Airport | `tabdoc:change-semantic-role data-column-name="[Airport].[Name]" field-vector=["[federated.` | XML: + `datasource-dependencies/column@semantic-role=[Airport].[Name]`, `datasource/column@datatype=string`, `datasource/column@name`, `datasource/column@role=dimension` |
| Geographic Role > Area Code (U.S.) | `tabdoc:change-semantic-role data-column-name="[AreaCode].[Name]" field-vector=["[federated` | XML: + `datasource-dependencies/column@semantic-role=[AreaCode].[Name]`, `datasource/column@semantic-role=[AreaCode].[Name]` − `datasource-dependencies/column@semantic-role=[Airport].[Name]`, `datasource/column@semantic-role=[Airport].[Name]` |
| Geographic Role > CBSA/MSA (U.S.) | `tabdoc:change-semantic-role data-column-name="[CMSA].[Name]" field-vector=["[federated.tsz` | XML: + `datasource-dependencies/column@semantic-role=[CMSA].[Name]`, `datasource/column@semantic-role=[CMSA].[Name]` − `datasource-dependencies/column@semantic-role=[AreaCode].[Name]`, `datasource/column@semantic-role=[AreaCode].[Name]` |
| Geographic Role > City | `tabdoc:change-semantic-role data-column-name="[City].[Name]" field-vector=["[federated.tsz` | XML: + `datasource-dependencies/column@semantic-role=[City].[Name]`, `datasource/column@semantic-role=[City].[Name]` − `datasource-dependencies/column@semantic-role=[CMSA].[Name]`, `datasource/column@semantic-role=[CMSA].[Name]` |
| Geographic Role > Congressional District (U.S.) | `tabdoc:change-semantic-role data-column-name="[Congress].[Name]" field-vector=["[federated` | XML: + `datasource-dependencies/column@semantic-role=[Congress].[Name]`, `datasource/column@semantic-role=[Congress].[Name]` − `datasource-dependencies/column@semantic-role=[City].[Name]`, `datasource/column@semantic-role=[City].[Name]` |
| Geographic Role > Country/Region | `tabdoc:change-semantic-role data-column-name="[Country].[Name]" field-vector=["[federated.` | XML: + `datasource-dependencies/column@semantic-role=[Country].[Name]`, `datasource/column@semantic-role=[Country].[Name]` − `datasource-dependencies/column@semantic-role=[Congress].[Name]`, `datasource/column@semantic-role=[Congress].[Name]` |
| Geographic Role > County | `tabdoc:change-semantic-role data-column-name="[County].[Name]" field-vector=["[federated.t` | XML: + `datasource-dependencies/column@semantic-role=[County].[Name]`, `datasource/column@semantic-role=[County].[Name]` − `datasource-dependencies/column@semantic-role=[Country].[Name]`, `datasource/column@semantic-role=[Country].[Name]` |
| Geographic Role > NUTS Europe | `tabdoc:change-semantic-role data-column-name="[NUTS].[Name]" field-vector=["[federated.tsz` | XML: + `datasource-dependencies/column@semantic-role=[NUTS].[Name]`, `datasource/column@semantic-role=[NUTS].[Name]` − `datasource-dependencies/column@semantic-role=[County].[Name]`, `datasource/column@semantic-role=[County].[Name]` |
| Geographic Role > State/Province | `tabdoc:change-semantic-role data-column-name="[State].[Name]" field-vector=["[federated.ts` | XML: + `datasource-dependencies/column@semantic-role=[State].[Name]`, `datasource/column@semantic-role=[State].[Name]` − `datasource-dependencies/column@semantic-role=[NUTS].[Name]`, `datasource/column@semantic-role=[NUTS].[Name]` |
| Geographic Role > ZIP Code/Postcode | `tabdoc:change-semantic-role data-column-name="[ZipCode].[Name]" field-vector=["[federated.` | XML: + `datasource-dependencies/column@semantic-role=[ZipCode].[Name]`, `datasource/column@semantic-role=[ZipCode].[Name]` − `datasource-dependencies/column@semantic-role=[State].[Name]`, `datasource/column@semantic-role=[State].[Name]` |
| Image Role > None | `tabdoc:change-semantic-role field-vector=["[federated.tszse28gx02x3fnwag3qym7mmnuk].[Regio` | XML: + `datasource-dependencies/column@semantic-role=`, `datasource/column@semantic-role=` − `datasource-dependencies/column@semantic-role=[ZipCode].[Name]`, `datasource/column@semantic-role=[ZipCode].[Name]` |
| Image Role > URL | `tabdoc:change-semantic-role data-column-name="[URL]" field-vector=["[federated.tszse28gx02` | XML: + `datasource-dependencies/column@semantic-role=[URL]`, `datasource/column@semantic-role=[URL]` − `datasource-dependencies/column@semantic-role=`, `datasource/column@semantic-role=` |
| Group by > Folder | `tabdoc:group-by-table datasource="*****" show-structure="false"` | XML: + `datasource/layout@show-structure=false` − `datasource/layout@show-structure=true` |
| Group by > Data Source Table | `tabdoc:group-by-table datasource="*****" show-structure="true"` | XML: + `datasource/layout@show-structure=true` − `datasource/layout@show-structure=false` |
| Hierarchy > Create Hierarchy... | `tabui:new-schema-drill-path-ui datasource="*****"` | abre «Create Hierarchy» |
| Replace References... | `tabui:replace-field-ui` | abre «Replace References...» |

Desactivados: Hide, Transform > Pivot (select multiple fields)

## `Barras` · field:Importe (campo del panel de datos)

| ítem | comando interno | efecto |
|---|---|---|
| Add to Sheet | `tabui:add-to-sheet-ui datasource="*****"` | XML: + `datasource-dependencies/column-instance@column=[Region]`, `datasource-dependencies/column-instance@derivation=CountD`, `datasource-dependencies/column-instance@name`, `datasource-dependencies/column-instance@pivot=key` |
| Show Filter | `tabui:show-quickfilter-ui` | XML: + `cards/edge@name`, `datasource-dependencies/column-instance@column=[Region]`, `datasource-dependencies/column-instance@derivation=CountD`, `datasource-dependencies/column-instance@name` |
| Create > Calculated Field... | `tabui:create-calculation-ui use-selector="true"`<br>`tabdoc:create-calc datasource="*****" fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Import` | abre «Dialog» |
| Create > Group... | `tabui:create-categorical-bins-ui` | abre «Create Group [Importe]» |
| Create > Parameter... | `tabdoc:create-new-parameter` | abre «Create Parameter» |
| Convert to Discrete | `tabdoc:convert-to-discrete` | XML: + `datasource-dependencies/column@type=ordinal`, `datasource/column@type=ordinal` − `datasource-dependencies/column@default-type=quantitative`, `datasource-dependencies/column@type=nominal`, `datasource/column@default-type=quantitative` |
| Convert to Dimension | `tabdoc:convert-to-dimension`<br>`tabui:set-worksheet-sidepane-mode mode="data"` | XML:  − `datasource-dependencies/column@default-role=measure`, `datasource-dependencies/column@default-type=ordinal`, `datasource/column@default-role=measure` |
| Change Data Type > Number (decimal) | — | sin cambio en el documento |
| Change Data Type > Number (whole) | — | sin cambio en el documento |
| Change Data Type > Date & Time | — | sin cambio en el documento |
| Change Data Type > Date | — | sin cambio en el documento |
| Change Data Type > String | — | sin cambio en el documento |
| Change Data Type > Boolean | — | sin cambio en el documento |
| Change Data Type > Default | — | sin cambio en el documento |
| Default Properties > Comment... | `tabui:edit-user-description-ui` | abre «Edit Comment [Importe]» |
| Default Properties > Color... | `tabui:edit-mark-color-ui`<br>`tabdoc:launch-quantitative-color-dialog encoding-field-vector=["[federated.tszse28gx02x3fn` | abre «Edit Colors Importe» |
| Geographic Role > None | `tabdoc:change-semantic-role field-vector=["[federated.tszse28gx02x3fnwag3qym7mmnuk].[Impor` | sin cambio en el documento |
| Geographic Role > Airport | `tabdoc:change-semantic-role data-column-name="[Airport].[Name]" field-vector=["[federated.` | XML: + `datasource-dependencies/column@aggregation=Sum`, `datasource-dependencies/column@role=dimension`, `datasource-dependencies/column@semantic-role=[Airport].[Name]`, `datasource-dependencies/column@type=ordinal` − `datasource-dependencies/column@role=measure`, `datasource-dependencies/column@type=quantitative` |
| Geographic Role > Area Code (U.S.) | `tabdoc:change-semantic-role data-column-name="[AreaCode].[Name]" field-vector=["[federated` | XML: + `datasource-dependencies/column@default-format=*000`, `datasource-dependencies/column@semantic-role=[AreaCode].[Name]`, `datasource/column@default-format=*000`, `datasource/column@semantic-role=[AreaCode].[Name]` − `datasource-dependencies/column@semantic-role=[Airport].[Name]`, `datasource/column@semantic-role=[Airport].[Name]` |
| Geographic Role > CBSA/MSA (U.S.) | `tabdoc:change-semantic-role data-column-name="[CMSA].[Name]" field-vector=["[federated.tsz` | XML: + `datasource-dependencies/column@semantic-role=[CMSA].[Name]`, `datasource/column@semantic-role=[CMSA].[Name]` − `datasource-dependencies/column@semantic-role=[AreaCode].[Name]`, `datasource/column@semantic-role=[AreaCode].[Name]` |
| Geographic Role > City | `tabdoc:change-semantic-role data-column-name="[City].[Name]" field-vector=["[federated.tsz` | XML: + `datasource-dependencies/column@semantic-role=[City].[Name]`, `datasource/column@semantic-role=[City].[Name]` − `datasource-dependencies/column@semantic-role=[CMSA].[Name]`, `datasource/column@semantic-role=[CMSA].[Name]` |
| Geographic Role > Congressional District (U.S.) | `tabdoc:change-semantic-role data-column-name="[Congress].[Name]" field-vector=["[federated` | XML: + `datasource-dependencies/column@semantic-role=[Congress].[Name]`, `datasource/column@semantic-role=[Congress].[Name]` − `datasource-dependencies/column@semantic-role=[City].[Name]`, `datasource/column@semantic-role=[City].[Name]` |
| Geographic Role > Country/Region | `tabdoc:change-semantic-role data-column-name="[Country].[Name]" field-vector=["[federated.` | XML: + `datasource-dependencies/column@semantic-role=[Country].[Name]`, `datasource/column@semantic-role=[Country].[Name]` − `datasource-dependencies/column@semantic-role=[Congress].[Name]`, `datasource/column@semantic-role=[Congress].[Name]` |
| Geographic Role > County | `tabdoc:change-semantic-role data-column-name="[County].[Name]" field-vector=["[federated.t` | XML: + `datasource-dependencies/column@semantic-role=[County].[Name]`, `datasource/column@semantic-role=[County].[Name]` − `datasource-dependencies/column@semantic-role=[Country].[Name]`, `datasource/column@semantic-role=[Country].[Name]` |
| Geographic Role > NUTS Europe | `tabdoc:change-semantic-role data-column-name="[NUTS].[Name]" field-vector=["[federated.tsz` | XML: + `datasource-dependencies/column@aggregation=Sum`, `datasource-dependencies/column@semantic-role=[NUTS].[Name]`, `datasource-dependencies/column@type=nominal`, `datasource/column@aggregation=Sum` − `datasource-dependencies/column@aggregation=Avg`, `datasource-dependencies/column@semantic-role=[Geographical].[Longitude]`, `datasource-dependencies/column@type=quantitative` |
| Geographic Role > State/Province | `tabdoc:change-semantic-role data-column-name="[State].[Name]" field-vector=["[federated.ts` | XML: + `datasource-dependencies/column@semantic-role=[State].[Name]`, `datasource/column@semantic-role=[State].[Name]` − `datasource-dependencies/column@semantic-role=[NUTS].[Name]`, `datasource/column@semantic-role=[NUTS].[Name]` |
| Geographic Role > ZIP Code/Postcode | `tabdoc:change-semantic-role data-column-name="[ZipCode].[Name]" field-vector=["[federated.` | XML: + `datasource-dependencies/column@default-format=*00000`, `datasource-dependencies/column@semantic-role=[ZipCode].[Name]`, `datasource/column@default-format=*00000`, `datasource/column@semantic-role=[ZipCode].[Name]` − `datasource-dependencies/column@default-format=*000`, `datasource-dependencies/column@semantic-role=[State].[Name]`, `datasource/column@default-format=*000` |
| Group by > Folder | `tabdoc:group-by-table datasource="*****" show-structure="false"` | XML: + `datasource/layout@show-structure=false` − `datasource/layout@show-structure=true` |
| Group by > Data Source Table | `tabdoc:group-by-table datasource="*****" show-structure="true"` | XML: + `datasource/layout@show-structure=true` − `datasource/layout@show-structure=false` |
| Replace References... | `tabui:replace-field-ui` | abre «Replace References...» |
| Create > Bins... | `tabui:create-numeric-bins-ui` | abre «Edit Bins [Importe]» |
| Default Properties > Number Format... | `tabui:set-default-text-format-ui` | abre «Default Number Format [Importe]» |
| Geographic Role > Latitude | `tabdoc:change-semantic-role data-column-name="[Geographical].[Latitude]" field-vector=["[f` | XML: + `datasource-dependencies/column@aggregation=Avg`, `datasource-dependencies/column@semantic-role=[Geographical].[Latitude]`, `datasource-dependencies/column@type=quantitative`, `datasource/column@aggregation=Avg` − `datasource-dependencies/column@aggregation=Sum`, `datasource-dependencies/column@semantic-role=[County].[Name]`, `datasource-dependencies/column@type=ordinal` |
| Geographic Role > Longitude | `tabdoc:change-semantic-role data-column-name="[Geographical].[Longitude]" field-vector=["[` | XML: + `datasource-dependencies/column@semantic-role=[Geographical].[Longitude]`, `datasource/column@semantic-role=[Geographical].[Longitude]` − `datasource-dependencies/column@semantic-role=[Geographical].[Latitude]`, `datasource/column@semantic-role=[Geographical].[Latitude]` |

Desactivados: Hide

## `Barras` · tab (pestaña de la hoja)

| ítem | comando interno | efecto |
|---|---|---|
| New Worksheet | `tabui:new-worksheet-ui` | XML: + `cards/edge@name`, `edge/strip@size=160`, `edge/strip@size=2147483647`, `edge/strip@size=31` |
| New Dashboard | `tabui:new-uidashboard` | XML: + `dashboard/size@maxheight=800`, `dashboard/size@maxwidth=1000`, `dashboard/size@minheight=800`, `dashboard/size@minwidth=1000` |
| New Story | `tabui:new-storyboard-ui` | XML: + `dashboard/size@maxheight=964`, `dashboard/size@maxwidth=1016`, `dashboard/size@minheight=964`, `dashboard/size@minwidth=1016` |
| Hide | `tabui:delete-sheet-ui worksheet-orphans-handling-mode="ask-user"` | XML: + `windows/window@hidden=true` |
| Duplicate as Crosstab | `tabui:duplicate-sheet-as-crosstab` | XML: + `cards/edge@name`, `datasource-dependencies/column-instance@column=[Importe]`, `datasource-dependencies/column-instance@column=[Region]`, `datasource-dependencies/column-instance@derivation=None` |
| Color > None | `tabui:change-tab-color-sheet color="rgba(240,240,240,0)"` | sin cambio en el documento |
| Color > Blue | `tabui:change-tab-color-sheet color="rgb(79,119,154)"` | XML: + `windows/window@tab-color=#4f779a` |
| Color > Red | `tabui:change-tab-color-sheet color="rgb(246,98,115)"` | XML: + `windows/window@tab-color=#f66273` |
| Color > Yellow | `tabui:change-tab-color-sheet color="rgb(222,199,123)"` | XML: + `windows/window@tab-color=#dec77b` |
| Color > Brown | `tabui:change-tab-color-sheet color="rgb(166,82,0)"` | XML: + `windows/window@tab-color=#a65200` |
| Color > Purple | `tabui:change-tab-color-sheet color="rgb(110,89,127)"` | XML: + `windows/window@tab-color=#6e597f` |
| Color > Green | `tabui:change-tab-color-sheet color="rgb(23,146,125)"` | XML: + `windows/window@tab-color=#17927d` |
| Color > Teal | `tabui:change-tab-color-sheet color="rgb(114,188,187)"` | XML: + `windows/window@tab-color=#72bcbb` |

Desactivados: Paste, Hide All Sheets, Unhide All Sheets, Paste Formatting

## `Barras` · view (marca de la vista)

| ítem | comando interno | efecto |
|---|---|---|
| Format... | `tabui:format-ui element-instance-id="" field-names=[] format-context="fonts"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Mark Label > Automatic | `tabdoc:mark-label mark-enum="auto"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=on` |
| Mark Label > Always Show | `tabdoc:mark-label mark-enum="on"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=on` |
| Mark Label > Never Show | `tabdoc:mark-label mark-enum="off"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=off` |
| Annotate > Mark... | `tabui:annotate-ui annotate-enum="mark" x="79" y="8"` | abre «Edit Annotation» |
| Annotate > Point... | `tabui:annotate-ui annotate-enum="point" x="79" y="8"` | abre «Edit Annotation» |
| Annotate > Area... | `tabui:annotate-ui annotate-enum="area" x="79" y="8"` | abre «Edit Annotation» |
| Trend Lines > Show Trend Lines | `tabui:trend-lines-ui pane-ids=[{"row-index": 0,"column-index": 0,"layer-index": 0}]` | abre «Warning» |
| Drop Lines > Show Drop Lines | `tabdoc:toggle-drop-lines` | XML: + `pane/dropline@drop-when=selected`, `pane/dropline@haslabel=false`, `pane/dropline@x-axis=true`, `pane/dropline@y-axis=false` |
| Show View Toolbar | `tabdoc:zoom-controls-toggle` | XML: + `viewpoint/floating-toolbar-visibility@value=1` |
| Keep Only | `tabdoc:keep-only-or-exclude-selection exclude="false"` | XML: + `filter/groupfilter@function=member`, `filter/groupfilter@level=[none:Region:nk]`, `filter/groupfilter@member="Este"`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=database` |
| Exclude | `tabdoc:keep-only-or-exclude-selection exclude="true"` | XML: + `filter/groupfilter@function=except`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=database`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=exclusive`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-marker=enumerate` − `columns/field`, `pane-descriptor/x-fields`, `pane-descriptor/y-fields` |
| Create Set... | `tabui:create-group-selection-ui` | abre «Create Set»; XML: + `columns/field`, `pane-descriptor/x-fields`, `pane-descriptor/y-fields`, `selection-collection/tuple-selection` |

Desactivados: Trend Lines > Edit All Trend Lines..., Trend Lines > Describe Trend Model..., Drop Lines > Edit Drop Lines...

## `Barras` · view:empty (fondo de la vista)

| ítem | comando interno | efecto |
|---|---|---|
| Format... | `tabui:format-ui element-instance-id="" field-names=[] format-context="fonts"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Annotate > Point... | `tabui:annotate-ui annotate-enum="point" x="879" y="24"` | abre «Edit Annotation» |
| Annotate > Area... | `tabui:annotate-ui annotate-enum="area" x="879" y="24"` | abre «Edit Annotation» |
| Trend Lines > Show Trend Lines | `tabui:trend-lines-ui pane-ids=[{"row-index": 0,"column-index": 0,"layer-index": 0}]` | abre «Warning» |
| Drop Lines > Show Drop Lines | `tabdoc:toggle-drop-lines` | XML: + `pane/dropline@drop-when=selected`, `pane/dropline@haslabel=false`, `pane/dropline@x-axis=true`, `pane/dropline@y-axis=false` |
| Show View Toolbar | `tabdoc:zoom-controls-toggle` | XML: + `viewpoint/floating-toolbar-visibility@value=1` |
| Drop Lines > Edit Drop Lines... | — | sin cambio en el documento; error: item 'Edit Drop Lines...' is disabled |

Desactivados: Annotate > Mark..., Trend Lines > Edit All Trend Lines..., Trend Lines > Describe Trend Model...

## `Linea` · axis:bottom (cabecera / eje)

| ítem | comando interno | efecto |
|---|---|---|
| Edit Axis... | `tabdoc:show-edit-axis-dialog axis-orientation="o-horiz" duplicate-index="0" fn="[federated` | abre «Edit Axis [Month of Fecha]» |
| Format... | `tabui:format-axis-ui axis-orientation="o-horiz" duplicate-index="0" fn="[federated.tszse28`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header axis-orientation="o-horiz" duplicate-index="0" fn="[federated.tszse28gx` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[tmn:Fecha:qk]`, `style-rule/format@scope=cols` |
| Add Reference Line | `tabui:add-reference-line-ui axis-orientation="o-horiz" duplicate-index="0" fn="[federated.` | abre «Add Reference Line, Band, or Box» |

Desactivados: Clear Axis Range

## `Linea` · axis:left (cabecera / eje)

| ítem | comando interno | efecto |
|---|---|---|
| Edit Axis... | `tabdoc:show-edit-axis-dialog axis-orientation="o-vert" duplicate-index="0" fn="[federated.` | abre «Edit Axis [Importe]» |
| Format... | `tabui:format-axis-ui axis-orientation="o-vert" duplicate-index="0" fn="[federated.tszse28g`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header axis-orientation="o-vert" duplicate-index="0" fn="[federated.tszse28gx0` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@scope=rows` |
| Add Reference Line | `tabui:add-reference-line-ui axis-orientation="o-vert" duplicate-index="0" fn="[federated.t` | abre «Add Reference Line, Band, or Box» |

Desactivados: Clear Axis Range

## `Linea` · shelf:filters (píldora del estante)

No se abrió: no context menu

## `Linea` · marks:encoding (píldora de Marcas)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:format-datavalue-ui data-value="r:::0"` | abre «Filter [Canal]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Canal:nk]` |
| Show Highlighter | `tabdoc:view-data-highlighter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]`, `strip/card@type=highlighter` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [Canal]» |
| Sort... | `tabdoc:show-sort-dialog global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:` | abre «Sort [Canal]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Edit Aliases... | `tabui:edit-aliases-ui`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]"` | abre «Edit Aliases [Canal]» |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | sin cambio en el documento |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[attr:Canal:nk]` − `datasource-dependencies/column-instance@derivation=None`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]` |
| Measure > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[min:Canal:nk]` − `datasource-dependencies/column-instance@derivation=None`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]` |
| Measure > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[max:Canal:nk]` − `datasource-dependencies/column-instance@derivation=None`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]` |
| Measure > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count`, `datasource-dependencies/column-instance@type=quantitative`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[cnt:Canal:qk]` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]` |
| Measure > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD`, `datasource-dependencies/column-instance@type=quantitative`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[ctd:Canal:qk]` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal`, `encodings/color@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Canal]`, `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@name` |

## `Linea` · shelf:cols (píldora del estante)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:create-quantitative-filter-store global-field-name="[federated.tszse28gx02x3fnwag3q` | abre «Filter [Month of Fecha]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[tmn:Fecha:qk]`, `strip/card@show-domain=false` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [MONTH(Fecha)]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[tmn:Fecha:qk]`, `style-rule/format@scope=cols` |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[tmn:Fecha:qk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Show Missing Values | `tabdoc:show-full-range` | XML: + `show-full-range/column`, `table/show-full-range` |
| Extend Date Range > None | `tabdoc:extend-time-series base-column-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fech` | sin cambio en el documento |
| Extend Date Range > 1 Week | `tabdoc:extend-time-series base-column-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fech` | XML: + `extend-time-series/extended-column@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha]`, `extend-time-series/extended-column@num-periods=1`, `extend-time-series/extended-column@period-type=week`, `view/calcs-on-densified-marks@value=true` |
| Extend Date Range > 2 Weeks | `tabdoc:extend-time-series base-column-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fech` | XML: + `extend-time-series/extended-column@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha]`, `extend-time-series/extended-column@num-periods=2`, `extend-time-series/extended-column@period-type=week`, `view/calcs-on-densified-marks@value=true` |
| Extend Date Range > 1 Month | `tabdoc:extend-time-series base-column-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fech` | XML: + `extend-time-series/extended-column@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha]`, `extend-time-series/extended-column@num-periods=1`, `extend-time-series/extended-column@period-type=month`, `view/calcs-on-densified-marks@value=true` |
| Extend Date Range > 3 Months | `tabdoc:extend-time-series base-column-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fech` | XML: + `extend-time-series/extended-column@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha]`, `extend-time-series/extended-column@num-periods=3`, `extend-time-series/extended-column@period-type=month`, `view/calcs-on-densified-marks@value=true` |
| Extend Date Range > 6 Months | `tabdoc:extend-time-series base-column-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fech` | XML: + `extend-time-series/extended-column@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha]`, `extend-time-series/extended-column@num-periods=6`, `extend-time-series/extended-column@period-type=month`, `view/calcs-on-densified-marks@value=true` |
| Extend Date Range > 1 Year | `tabdoc:extend-time-series base-column-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fech` | XML: + `extend-time-series/extended-column@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[Fecha]`, `extend-time-series/extended-column@num-periods=1`, `extend-time-series/extended-column@period-type=year`, `view/calcs-on-densified-marks@value=true` |
| Extend Date Range > Custom... | `tabdoc:show-extend-time-series-editor base-column-name="[federated.tszse28gx02x3fnwag3qym7` | sin cambio en el documento |
| Standard Gregorian | `tabui:change-calendar-aggregations calendar-type-enum="standard-gregorian"` | sin cambio en el documento |
| ISO-8601 Week-Based | `tabui:change-calendar-aggregations calendar-type-enum="iso8601-week-based"` | XML: + `datasource-dependencies/column-instance@derivation=ISO-Week-Trunc` − `datasource-dependencies/column-instance@derivation=Month-Trunc` |
| Year | `tabui:change-aggregation-ui aggregation="year"` | XML: + `datasource-dependencies/column-instance@derivation=Year`, `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@type=quantitative` |
| Quarter | `tabui:change-aggregation-ui aggregation="qtr"` | XML: + `datasource-dependencies/column-instance@derivation=Quarter`, `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@type=quantitative` |
| Month | `tabui:change-aggregation-ui aggregation="month"` | XML: + `datasource-dependencies/column-instance@derivation=Month`, `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@type=quantitative` |
| Day | `tabui:change-aggregation-ui aggregation="day"` | XML: + `datasource-dependencies/column-instance@derivation=Day`, `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@type=quantitative` |
| More > Week Number | `tabui:change-aggregation-ui aggregation="week"` | XML: + `datasource-dependencies/column-instance@derivation=Week`, `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@type=quantitative` |
| More > Weekday | `tabui:change-aggregation-ui aggregation="weekday"` | XML: + `datasource-dependencies/column-instance@derivation=Weekday`, `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@type=quantitative` |
| More > Custom... | `tabui:custom-date-aggregation-ui state="false"` | abre «Custom Date» |
| Week Number | `tabui:change-aggregation-ui aggregation="trunc-week"` | XML: + `datasource-dependencies/column-instance@derivation=Week-Trunc` − `datasource-dependencies/column-instance@derivation=Month-Trunc` |
| Exact Date | `tabui:change-aggregation-ui aggregation="none"` | XML: + `datasource-dependencies/column-instance@derivation=None` − `datasource-dependencies/column-instance@derivation=Month-Trunc` |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute` − `datasource-dependencies/column-instance@derivation=Month-Trunc` |
| Measure > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count` − `datasource-dependencies/column-instance@derivation=Month-Trunc` |
| Measure > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD` − `datasource-dependencies/column-instance@derivation=Month-Trunc` |
| Measure > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min`, `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@type=quantitative` |
| Measure > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max`, `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@type=quantitative` |
| Discrete | `tabui:change-field-type-ui field-type="ordinal"` | XML: + `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@type=quantitative` |
| Continuous | `tabui:change-field-type-ui field-type="quantitative"` | sin cambio en el documento |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Fecha]`, `datasource-dependencies/column-instance@derivation=Month-Trunc`, `datasource-dependencies/column-instance@name` |

## `Linea` · shelf:rows (píldora del estante)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:create-quantitative-filter-store global-field-name="[federated.tszse28gx02x3fnwag3q` | abre «Filter [Importe]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `strip/card@show-domain=false` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [SUM(Importe)]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@scope=rows` |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | XML: + `datasource-dependencies/column-instance@derivation=None` − `datasource-dependencies/column-instance@derivation=Sum` |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Sum | `tabui:change-aggregation-ui aggregation="sum"` | sin cambio en el documento |
| Measure (Sum) > Average | `tabui:change-aggregation-ui aggregation="average"` | XML: + `datasource-dependencies/column-instance@derivation=Avg` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Median | `tabui:change-aggregation-ui aggregation="median"` | XML: + `datasource-dependencies/column-instance@derivation=Median` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Std. Dev | `tabui:change-aggregation-ui aggregation="std-dev"` | XML: + `datasource-dependencies/column-instance@derivation=Stdev` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Std. Dev (Pop.) | `tabui:change-aggregation-ui aggregation="std-dev-p"` | XML: + `datasource-dependencies/column-instance@derivation=StdevP` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Variance | `tabui:change-aggregation-ui aggregation="var"` | XML: + `datasource-dependencies/column-instance@derivation=Var` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Variance (Pop.) | `tabui:change-aggregation-ui aggregation="var-p"` | XML: + `datasource-dependencies/column-instance@derivation=VarP` − `datasource-dependencies/column-instance@derivation=Sum` |
| Discrete | `tabui:change-field-type-ui field-type="ordinal"` | XML: + `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@type=quantitative` |
| Continuous | `tabui:change-field-type-ui field-type="quantitative"` | sin cambio en el documento |
| Add Table Calculation... | `tabdoc:table-calc-add`<br>`tabdoc:highlight brush-legends="false" field-captions=["*****"] pane-spec="0" selector={} ` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=Difference` |
| Quick Table Calculation > Running Total | `tabui:quick-table-calc-ui quick-table-calc-type="run-total"` | XML: + `column-instance/table-calc@aggregation=Sum`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=CumTotal` |
| Quick Table Calculation > Difference | `tabui:quick-table-calc-ui quick-table-calc-type="difference"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=Difference` |
| Quick Table Calculation > Percent Difference | `tabui:quick-table-calc-ui quick-table-calc-type="pct-diff"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctDiff` |
| Quick Table Calculation > Percent of Total | `tabui:quick-table-calc-ui quick-table-calc-type="pct-total"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctTotal` |
| Quick Table Calculation > Rank | `tabui:quick-table-calc-ui quick-table-calc-type="rank"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@rank-options=Competition,Descending`, `column-instance/table-calc@type=Rank` |
| Quick Table Calculation > Percentile | `tabui:quick-table-calc-ui quick-table-calc-type="pct-rank"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@rank-options=Competition,Ascending`, `column-instance/table-calc@type=PctRank` |
| Quick Table Calculation > Moving Average | `tabui:quick-table-calc-ui quick-table-calc-type="moving-avg"` | XML: + `column-instance/table-calc@aggregation=Avg`, `column-instance/table-calc@from=-2`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@to=0` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Importe]`, `datasource-dependencies/column-instance@derivation=Sum`, `datasource-dependencies/column-instance@name` |

Desactivados: Quick Table Calculation > YTD Total, Quick Table Calculation > Compound Growth Rate, Quick Table Calculation > Year Over Year Growth, Quick Table Calculation > YTD Growth

## `Linea` · view (marca de la vista)

| ítem | comando interno | efecto |
|---|---|---|
| Format... | — | XML: + `columns/field`, `pane-descriptor/x-fields`, `pane-descriptor/y-fields`, `selection-collection/tuple-selection` |
| Mark Label > Automatic | `tabdoc:mark-label mark-enum="auto"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=on` |
| Mark Label > Always Show | `tabdoc:mark-label mark-enum="on"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=on` |
| Mark Label > Never Show | `tabdoc:mark-label mark-enum="off"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=off` |
| Annotate > Mark... | `tabui:annotate-ui annotate-enum="mark" x="241" y="153"` | abre «Edit Annotation» |
| Annotate > Point... | `tabui:annotate-ui annotate-enum="point" x="241" y="153"` | abre «Edit Annotation» |
| Annotate > Area... | `tabui:annotate-ui annotate-enum="area" x="241" y="153"` | abre «Edit Annotation» |
| Trend Lines > Show Trend Lines | `tabui:trend-lines-ui pane-ids=[{"row-index": 0,"column-index": 0,"layer-index": 0}]` | XML: + `pane/trendline@enable-confidence-bands=false`, `pane/trendline@enable-instant-analytics=true`, `pane/trendline@enabled=true`, `pane/trendline@exclude-color=false` |
| Drop Lines > Show Drop Lines | `tabdoc:toggle-drop-lines` | XML: + `pane/dropline@drop-when=selected`, `pane/dropline@haslabel=false`, `pane/dropline@x-axis=true`, `pane/dropline@y-axis=true` |
| Show View Toolbar | — | sin cambio en el documento |
| Keep Only | — | sin cambio en el documento |
| Exclude | — | sin cambio en el documento |
| Group | — | sin cambio en el documento |
| Create Set... | — | sin cambio en el documento |

Desactivados: Trend Lines > Edit All Trend Lines..., Trend Lines > Describe Trend Model..., Drop Lines > Edit Drop Lines...

## `Tabla` · axis:top (cabecera / eje)

No se abrió: no context menu

## `Tabla` · axis:left (cabecera / eje)

| ítem | comando interno | efecto |
|---|---|---|
| Keep only | `tabdoc:keep-only-or-exclude exclude="false"` | XML: + `filter/groupfilter@function=member`, `filter/groupfilter@level=[none:Region:nk]`, `filter/groupfilter@member="Este"`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=relevant` |
| Exclude | `tabdoc:keep-only-or-exclude exclude="true"` | XML: + `filter/groupfilter@function=except`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=relevant`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=exclusive`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-marker=enumerate` − `node-selection/oriented-node-reference@orientation=vertical`, `selection-collection/node-selection@select-tuples=false` |
| Hide | `tabdoc:hide-label` | XML: + `filter/groupfilter@function=except`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=relevant`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=exclusive`, `filter/groupfilter@{http://www.tableausoftware.com/xml/user}ui-manual-selection-all-when-empty=true` |
| Format... | `tabui:format-label`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | XML: + `node-selection/oriented-node-reference@orientation=vertical`, `selection-collection/node-selection@select-tuples=false` |
| Rotate Label | `tabdoc:rotate-label` | XML: + `style-rule/format@attr=text-orientation`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=-90`, `style/style-rule@element=label` |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=false`, `style/style-rule@element=label` |
| Edit Alias... | `tabui:edit-member-alias-label` | abre «Edit Alias» |
| Split | `tabdoc:split-field-label` | sin cambio en el documento |

## `Tabla` · shelf:filters (píldora del estante)

No se abrió: no context menu

## `Tabla` · marks:encoding (píldora de Marcas)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:create-quantitative-filter-store global-field-name="[federated.tszse28gx02x3fnwag3q` | abre «Filter [Importe]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `strip/card@show-domain=false` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [SUM(Importe)]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | XML: + `datasource-dependencies/column-instance@derivation=None`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[attr:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Sum | `tabui:change-aggregation-ui aggregation="sum"` | sin cambio en el documento |
| Measure (Sum) > Average | `tabui:change-aggregation-ui aggregation="average"` | XML: + `datasource-dependencies/column-instance@derivation=Avg`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[avg:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Median | `tabui:change-aggregation-ui aggregation="median"` | XML: + `datasource-dependencies/column-instance@derivation=Median`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[med:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[cnt:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[ctd:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[min:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[max:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Std. Dev | `tabui:change-aggregation-ui aggregation="std-dev"` | XML: + `datasource-dependencies/column-instance@derivation=Stdev`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[std:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Std. Dev (Pop.) | `tabui:change-aggregation-ui aggregation="std-dev-p"` | XML: + `datasource-dependencies/column-instance@derivation=StdevP`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[stp:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Variance | `tabui:change-aggregation-ui aggregation="var"` | XML: + `datasource-dependencies/column-instance@derivation=Var`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[var:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Measure (Sum) > Variance (Pop.) | `tabui:change-aggregation-ui aggregation="var-p"` | XML: + `datasource-dependencies/column-instance@derivation=VarP`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[vrp:Importe:qk]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@derivation=Sum`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Discrete | `tabui:change-field-type-ui field-type="ordinal"` | XML: + `datasource-dependencies/column-instance@type=ordinal`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:ok]`, `style-rule/format@attr=mark-labels-cull`, `style-rule/format@attr=mark-labels-show` − `datasource-dependencies/column-instance@type=quantitative`, `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Continuous | `tabui:change-field-type-ui field-type="quantitative"` | sin cambio en el documento |
| Add Table Calculation... | `tabdoc:table-calc-add`<br>`tabdoc:highlight brush-legends="false" field-captions=["*****"] pane-spec="0" selector={} ` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=Difference`, `encodings/text@column` − `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Quick Table Calculation > Running Total | `tabui:quick-table-calc-ui quick-table-calc-type="run-total"` | XML: + `column-instance/table-calc@aggregation=Sum`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=CumTotal`, `encodings/text@column` − `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Quick Table Calculation > Difference | `tabui:quick-table-calc-ui quick-table-calc-type="difference"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=Difference`, `encodings/text@column` − `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Quick Table Calculation > Percent Difference | `tabui:quick-table-calc-ui quick-table-calc-type="pct-diff"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctDiff`, `encodings/text@column` − `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Quick Table Calculation > Percent of Total | `tabui:quick-table-calc-ui quick-table-calc-type="pct-total"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctTotal`, `encodings/text@column`, `style-rule/format@attr=mark-labels-cull` − `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Quick Table Calculation > Rank | `tabui:quick-table-calc-ui quick-table-calc-type="rank"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@rank-options=Competition,Descending`, `column-instance/table-calc@type=Rank`, `encodings/text@column` − `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Quick Table Calculation > Percentile | `tabui:quick-table-calc-ui quick-table-calc-type="pct-rank"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@rank-options=Competition,Ascending`, `column-instance/table-calc@type=PctRank`, `encodings/text@column` − `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Quick Table Calculation > Moving Average | `tabui:quick-table-calc-ui quick-table-calc-type="moving-avg"` | XML: + `column-instance/table-calc@aggregation=Avg`, `column-instance/table-calc@from=-2`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@to=0` − `encodings/text@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Importe]`, `datasource-dependencies/column-instance@derivation=Sum`, `datasource-dependencies/column-instance@name` |

Desactivados: Quick Table Calculation > YTD Total, Quick Table Calculation > Compound Growth Rate, Quick Table Calculation > Year Over Year Growth, Quick Table Calculation > YTD Growth

## `Tabla` · shelf:cols (píldora del estante)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:format-datavalue-ui data-value="r:::0"` | abre «Filter [Canal]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Canal:nk]` |
| Show Highlighter | `tabdoc:view-data-highlighter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]`, `strip/card@type=highlighter` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [Canal]» |
| Sort... | `tabdoc:show-sort-dialog global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:` | abre «Sort [Canal]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]`, `style-rule/format@value=false`, `style/style-rule@element=label` |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Edit Aliases... | `tabui:edit-aliases-ui`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Canal:nk]"` | abre «Edit Aliases [Canal]» |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | sin cambio en el documento |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count`, `datasource-dependencies/column-instance@type=quantitative` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal` |
| Measure > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD`, `datasource-dependencies/column-instance@type=quantitative` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Canal]`, `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@name` |

## `Tabla` · shelf:rows (píldora del estante)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:format-datavalue-ui data-value="r:::0"` | abre «Filter [Region]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Region:nk]` |
| Show Highlighter | `tabdoc:view-data-highlighter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `strip/card@type=highlighter` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [Region]» |
| Sort... | `tabdoc:show-sort-dialog global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:` | abre «Sort [Region]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=false`, `style/style-rule@element=label` |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Edit Aliases... | `tabui:edit-aliases-ui`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]"` | abre «Edit Aliases [Region]» |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | sin cambio en el documento |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max` − `datasource-dependencies/column-instance@derivation=None` |
| Measure > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count`, `datasource-dependencies/column-instance@type=quantitative` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal` |
| Measure > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD`, `datasource-dependencies/column-instance@type=quantitative` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Region]`, `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@name` |

## `Tabla` · view (marca de la vista)

| ítem | comando interno | efecto |
|---|---|---|
| Format... | `tabui:format-ui element-instance-id="" field-names=[] format-context="fonts"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | XML: + `columns/field`, `pane-descriptor/x-fields`, `pane-descriptor/y-fields`, `selection-collection/tuple-selection` |
| Annotate > Mark... | — | sin cambio en el documento |
| Annotate > Point... | `tabui:annotate-ui annotate-enum="point" x="10" y="8"` | abre «Edit Annotation»; XML: + `columns/field`, `pane-descriptor/x-fields`, `pane-descriptor/y-fields`, `selection-collection/tuple-selection` |
| Annotate > Area... | `tabui:annotate-ui annotate-enum="area" x="10" y="8"` | abre «Edit Annotation» |
| Trend Lines > Show Trend Lines | `tabui:trend-lines-ui pane-ids=[{"row-index": 0,"column-index": 0,"layer-index": 0}]` | abre «Warning» |
| Show View Toolbar | `tabdoc:zoom-controls-toggle` | XML: + `viewpoint/floating-toolbar-visibility@value=1` |
| Drop Lines > Show Drop Lines | — | sin cambio en el documento; error: submenu 'Drop Lines' did not open |

Desactivados: Annotate > Mark..., Trend Lines > Edit All Trend Lines..., Trend Lines > Describe Trend Model..., Drop Lines > Edit Drop Lines...

## `Dispersion` · axis:bottom (cabecera / eje)

| ítem | comando interno | efecto |
|---|---|---|
| Edit Axis... | `tabdoc:show-edit-axis-dialog axis-orientation="o-horiz" duplicate-index="0" fn="[federated` | abre «Edit Axis [Coste]» |
| Format... | `tabui:format-axis-ui axis-orientation="o-horiz" duplicate-index="0" fn="[federated.tszse28`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header axis-orientation="o-horiz" duplicate-index="0" fn="[federated.tszse28gx` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Coste:qk]`, `style-rule/format@scope=cols` |
| Add Reference Line | `tabui:add-reference-line-ui axis-orientation="o-horiz" duplicate-index="0" fn="[federated.` | abre «Add Reference Line, Band, or Box» |

Desactivados: Clear Axis Range

## `Dispersion` · axis:left (cabecera / eje)

| ítem | comando interno | efecto |
|---|---|---|
| Edit Axis... | `tabdoc:show-edit-axis-dialog axis-orientation="o-vert" duplicate-index="0" fn="[federated.` | abre «Edit Axis [Importe]» |
| Format... | `tabui:format-axis-ui axis-orientation="o-vert" duplicate-index="0" fn="[federated.tszse28g`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header axis-orientation="o-vert" duplicate-index="0" fn="[federated.tszse28gx0` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@scope=rows` |
| Add Reference Line | `tabui:add-reference-line-ui axis-orientation="o-vert" duplicate-index="0" fn="[federated.t` | abre «Add Reference Line, Band, or Box» |

Desactivados: Clear Axis Range

## `Dispersion` · shelf:filters (píldora del estante)

No se abrió: no context menu

## `Dispersion` · marks:encoding (píldora de Marcas)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:format-datavalue-ui data-value="i:0"` | abre «Filter [Region]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `filter/groupfilter@function=level-members`, `filter/groupfilter@level=[none:Region:nk]` |
| Show Highlighter | `tabdoc:view-data-highlighter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `strip/card@type=highlighter` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [Region]» |
| Sort... | `tabdoc:show-sort-dialog global-field-name="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:` | abre «Sort [Region]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Edit Aliases... | `tabui:edit-aliases-ui`<br>`tabdoc:edit-aliases-dialog fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]"` | abre «Edit Aliases [Region]» |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | sin cambio en el documento |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[attr:Region:nk]` − `datasource-dependencies/column-instance@derivation=None`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]` |
| Measure > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[min:Region:nk]` − `datasource-dependencies/column-instance@derivation=None`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]` |
| Measure > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[max:Region:nk]` − `datasource-dependencies/column-instance@derivation=None`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]` |
| Measure > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count`, `datasource-dependencies/column-instance@type=quantitative`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[cnt:Region:qk]` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]` |
| Measure > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD`, `datasource-dependencies/column-instance@type=quantitative`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[ctd:Region:qk]` − `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@type=nominal`, `encodings/lod@column=[federated.tszse28gx02x3fnwag3qym7mmnuk].[none:Region:nk]` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Region]`, `datasource-dependencies/column-instance@derivation=None`, `datasource-dependencies/column-instance@name` |

## `Dispersion` · shelf:cols (píldora del estante)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:create-quantitative-filter-store global-field-name="[federated.tszse28gx02x3fnwag3q` | abre «Filter [Coste]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Coste:qk]`, `strip/card@show-domain=false` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [SUM(Coste)]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Coste:qk]`, `style-rule/format@scope=cols` |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Coste:qk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | XML: + `datasource-dependencies/column-instance@derivation=None` − `datasource-dependencies/column-instance@derivation=Sum` |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Sum | `tabui:change-aggregation-ui aggregation="sum"` | sin cambio en el documento |
| Measure (Sum) > Average | `tabui:change-aggregation-ui aggregation="average"` | XML: + `datasource-dependencies/column-instance@derivation=Avg` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Median | `tabui:change-aggregation-ui aggregation="median"` | XML: + `datasource-dependencies/column-instance@derivation=Median` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Std. Dev | `tabui:change-aggregation-ui aggregation="std-dev"` | XML: + `datasource-dependencies/column-instance@derivation=Stdev` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Std. Dev (Pop.) | `tabui:change-aggregation-ui aggregation="std-dev-p"` | XML: + `datasource-dependencies/column-instance@derivation=StdevP` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Variance | `tabui:change-aggregation-ui aggregation="var"` | XML: + `datasource-dependencies/column-instance@derivation=Var` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Variance (Pop.) | `tabui:change-aggregation-ui aggregation="var-p"` | XML: + `datasource-dependencies/column-instance@derivation=VarP` − `datasource-dependencies/column-instance@derivation=Sum` |
| Discrete | `tabui:change-field-type-ui field-type="ordinal"` | XML: + `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@type=quantitative` |
| Continuous | `tabui:change-field-type-ui field-type="quantitative"` | sin cambio en el documento |
| Add Table Calculation... | `tabdoc:table-calc-add`<br>`tabdoc:table-calc-dialog-activated` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=Difference` |
| Quick Table Calculation > Running Total | `tabui:quick-table-calc-ui quick-table-calc-type="run-total"` | XML: + `column-instance/table-calc@aggregation=Sum`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=CumTotal` |
| Quick Table Calculation > Difference | `tabui:quick-table-calc-ui quick-table-calc-type="difference"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=Difference` |
| Quick Table Calculation > Percent Difference | `tabui:quick-table-calc-ui quick-table-calc-type="pct-diff"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctDiff` |
| Quick Table Calculation > Percent of Total | `tabui:quick-table-calc-ui quick-table-calc-type="pct-total"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctTotal` |
| Quick Table Calculation > Rank | `tabui:quick-table-calc-ui quick-table-calc-type="rank"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@rank-options=Competition,Descending`, `column-instance/table-calc@type=Rank` |
| Quick Table Calculation > Percentile | `tabui:quick-table-calc-ui quick-table-calc-type="pct-rank"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@rank-options=Competition,Ascending`, `column-instance/table-calc@type=PctRank` |
| Quick Table Calculation > Moving Average | `tabui:quick-table-calc-ui quick-table-calc-type="moving-avg"` | XML: + `column-instance/table-calc@aggregation=Avg`, `column-instance/table-calc@from=-2`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@to=0` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Coste]`, `datasource-dependencies/column-instance@derivation=Sum`, `datasource-dependencies/column-instance@name` |

Desactivados: Quick Table Calculation > YTD Total, Quick Table Calculation > Compound Growth Rate, Quick Table Calculation > Year Over Year Growth, Quick Table Calculation > YTD Growth

## `Dispersion` · shelf:rows (píldora del estante)

| ítem | comando interno | efecto |
|---|---|---|
| Filter... | `tabui:edit-filter-ui`<br>`tabdoc:create-quantitative-filter-store global-field-name="[federated.tszse28gx02x3fnwag3q` | abre «Filter [Importe]» |
| Show Filter | `tabui:show-quickfilter` | XML: + `cards/edge@name`, `edge/strip@size=160`, `strip/card@param=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `strip/card@show-domain=false` |
| Apply to Worksheets > Selected Worksheets... | `tabdoc:launch-shared-filter-dialog` | abre «Apply Filter to Worksheets [SUM(Importe)]» |
| Format... | `tabui:show-field-format-ui`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Show Header | `tabdoc:show-header` | XML: + `style-rule/format@attr=display`, `style-rule/format@class=0`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@scope=rows` |
| Include in Tooltip | `tabdoc:include-in-tooltip` | XML: + `style-rule/format@attr=in-tooltip`, `style-rule/format@field=[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Importe:qk]`, `style-rule/format@value=false`, `style/style-rule@element=worksheet` |
| Dimension | `tabui:change-aggregation-ui aggregation="none"` | XML: + `datasource-dependencies/column-instance@derivation=None` − `datasource-dependencies/column-instance@derivation=Sum` |
| Attribute | `tabui:change-aggregation-ui aggregation="attr"` | XML: + `datasource-dependencies/column-instance@derivation=Attribute` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Sum | `tabui:change-aggregation-ui aggregation="sum"` | sin cambio en el documento |
| Measure (Sum) > Average | `tabui:change-aggregation-ui aggregation="average"` | XML: + `datasource-dependencies/column-instance@derivation=Avg` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Median | `tabui:change-aggregation-ui aggregation="median"` | XML: + `datasource-dependencies/column-instance@derivation=Median` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Count | `tabui:change-aggregation-ui aggregation="count"` | XML: + `datasource-dependencies/column-instance@derivation=Count` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Count (Distinct) | `tabui:change-aggregation-ui aggregation="count-d"` | XML: + `datasource-dependencies/column-instance@derivation=CountD` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Minimum | `tabui:change-aggregation-ui aggregation="min"` | XML: + `datasource-dependencies/column-instance@derivation=Min` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Maximum | `tabui:change-aggregation-ui aggregation="max"` | XML: + `datasource-dependencies/column-instance@derivation=Max` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Std. Dev | `tabui:change-aggregation-ui aggregation="std-dev"` | XML: + `datasource-dependencies/column-instance@derivation=Stdev` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Std. Dev (Pop.) | `tabui:change-aggregation-ui aggregation="std-dev-p"` | XML: + `datasource-dependencies/column-instance@derivation=StdevP` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Variance | `tabui:change-aggregation-ui aggregation="var"` | XML: + `datasource-dependencies/column-instance@derivation=Var` − `datasource-dependencies/column-instance@derivation=Sum` |
| Measure (Sum) > Variance (Pop.) | `tabui:change-aggregation-ui aggregation="var-p"` | XML: + `datasource-dependencies/column-instance@derivation=VarP` − `datasource-dependencies/column-instance@derivation=Sum` |
| Discrete | `tabui:change-field-type-ui field-type="ordinal"` | XML: + `datasource-dependencies/column-instance@type=ordinal` − `datasource-dependencies/column-instance@type=quantitative` |
| Continuous | `tabui:change-field-type-ui field-type="quantitative"` | sin cambio en el documento |
| Add Table Calculation... | `tabdoc:table-calc-add`<br>`tabdoc:table-calc-dialog-activated` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=Difference` |
| Quick Table Calculation > Running Total | `tabui:quick-table-calc-ui quick-table-calc-type="run-total"` | XML: + `column-instance/table-calc@aggregation=Sum`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=CumTotal` |
| Quick Table Calculation > Difference | `tabui:quick-table-calc-ui quick-table-calc-type="difference"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=Difference` |
| Quick Table Calculation > Percent Difference | `tabui:quick-table-calc-ui quick-table-calc-type="pct-diff"` | XML: + `column-instance/table-calc@diff-options=Relative`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctDiff` |
| Quick Table Calculation > Percent of Total | `tabui:quick-table-calc-ui quick-table-calc-type="pct-total"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@type=PctTotal` |
| Quick Table Calculation > Rank | `tabui:quick-table-calc-ui quick-table-calc-type="rank"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@rank-options=Competition,Descending`, `column-instance/table-calc@type=Rank` |
| Quick Table Calculation > Percentile | `tabui:quick-table-calc-ui quick-table-calc-type="pct-rank"` | XML: + `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@rank-options=Competition,Ascending`, `column-instance/table-calc@type=PctRank` |
| Quick Table Calculation > Moving Average | `tabui:quick-table-calc-ui quick-table-calc-type="moving-avg"` | XML: + `column-instance/table-calc@aggregation=Avg`, `column-instance/table-calc@from=-2`, `column-instance/table-calc@ordering-type=Rows`, `column-instance/table-calc@to=0` |
| Remove | `tabdoc:remove-fields` | XML:  − `datasource-dependencies/column-instance@column=[Importe]`, `datasource-dependencies/column-instance@derivation=Sum`, `datasource-dependencies/column-instance@name` |

Desactivados: Quick Table Calculation > YTD Total, Quick Table Calculation > Compound Growth Rate, Quick Table Calculation > Year Over Year Growth, Quick Table Calculation > YTD Growth

## `Dispersion` · view (marca de la vista)

| ítem | comando interno | efecto |
|---|---|---|
| Format... | `tabui:format-ui element-instance-id="" field-names=[] format-context="fonts"`<br>`tabdoc:set-side-pane-expansion-state side-pane-expansion-state="expanded"` | sin cambio en el documento |
| Mark Label > Automatic | `tabdoc:mark-label mark-enum="auto"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=on` |
| Mark Label > Always Show | `tabdoc:mark-label mark-enum="on"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=on` |
| Mark Label > Never Show | `tabdoc:mark-label mark-enum="off"` | XML: + `mark-labels/mark-label@id`, `mark-labels/mark-label@label-state=off` |
| Annotate > Mark... | `tabui:annotate-ui annotate-enum="mark" x="468" y="51"` | abre «Edit Annotation» |
| Annotate > Point... | `tabui:annotate-ui annotate-enum="point" x="468" y="51"` | abre «Edit Annotation» |
| Annotate > Area... | `tabui:annotate-ui annotate-enum="area" x="468" y="51"` | abre «Edit Annotation» |
| Trend Lines > Show Trend Lines | `tabui:trend-lines-ui pane-ids=[{"row-index": 0,"column-index": 0,"layer-index": 0}]` | XML: + `pane/trendline@enable-confidence-bands=false`, `pane/trendline@enable-instant-analytics=true`, `pane/trendline@enabled=true`, `pane/trendline@exclude-color=false` |
| Drop Lines > Show Drop Lines | `tabdoc:toggle-drop-lines` | XML: + `pane/dropline@drop-when=selected`, `pane/dropline@haslabel=false`, `pane/dropline@x-axis=true`, `pane/dropline@y-axis=true` |
| Show View Toolbar | — | sin cambio en el documento |
| Keep Only | — | sin cambio en el documento |
| Exclude | — | sin cambio en el documento |
| Create Set... | — | sin cambio en el documento |

Desactivados: Trend Lines > Edit All Trend Lines..., Trend Lines > Describe Trend Model..., Drop Lines > Edit Drop Lines...

# Diálogos: qué escribe cada control

Cada fila abre el diálogo sobre el libro de prueba, cambia solo ese control (un clic, o un valor escrito en el campo), pulsa OK si el diálogo lo tiene y compara el documento.

## Edit Axis

Se abre con: Barras · axis:bottom · Edit Axis...

| control | qué escribe | comando interno |
|---|---|---|
| Uniform axis range for all rows or columns | `style-rule/encoding@range-type=uniform` | `tabdoc:set-both-axis-extents-type axis-extents-type="axis-extent-uniform" axis-o` |
| Independent axis ranges for each row or column | `style-rule/encoding@range-type=independent` | `tabdoc:set-both-axis-extents-type axis-extents-type="axis-extent-independent" ax` |
| Custom | `style-rule/encoding@max=1228.5`, `style-rule/encoding@min=0.0`, `style-rule/encoding@range-type=fixed` | `tabdoc:set-both-axis-extents-type axis-extents-type="axis-extent-fixed" axis-ori` |
| Custom > #0=1000 | `style-rule/encoding@max=1228.5`, `style-rule/encoding@min=1000.0`, `style-rule/encoding@range-type=fixed` | `tabdoc:set-both-axis-extents-type axis-extents-type="axis-extent-fixed" axis-ori`<br>`tabdoc:set-axis-range-start axis-orientation="o-horiz" duplicate-index="0" fn="[` |
| Custom > #1=1000 | `style-rule/encoding@max=1000.0`, `style-rule/encoding@min=0.0`, `style-rule/encoding@range-type=fixed` | `tabdoc:set-both-axis-extents-type axis-extents-type="axis-extent-fixed" axis-ori`<br>`tabdoc:set-axis-range-end axis-orientation="o-horiz" duplicate-index="0" fn="[fe` |
| Include zero | `style-rule/encoding@domain-expand=false` | `tabdoc:set-axis-include-zero axis-orientation="o-horiz" duplicate-index="0" fn="` |
| Reversed | `style-rule/encoding@reverse=true` | `tabdoc:set-axis-reversed axis-orientation="o-horiz" duplicate-index="0" fn="[fed` |
| Logarithmic | `style-rule/encoding@scale=log` | `tabdoc:set-axis-scale-type axis-orientation="o-horiz" duplicate-index="0" fn="[f` |
| Title=Texto de prueba | `style-rule/format@attr=title`, `style-rule/format@class=0`, `style-rule/format@field=[sum:Importe:qk]`, `style-rule/format@scope=cols`, `style-rule/format@value=Texto de prueba` | `tabdoc:set-axis-title axis-orientation="o-horiz" axis-title="Texto de prueba" du` |
| Automatic | `style-rule/format@attr=auto-subtitle`, `style-rule/format@class=0`, `style-rule/format@field=[sum:Importe:qk]`, `style-rule/format@scope=cols`, `style-rule/format@value=false` | `tabdoc:set-axis-use-automatic-subtitle axis-orientation="o-horiz" duplicate-inde` |
| Tick Marks > Fixed | `style-rule/encoding@major-origin=0.0`, `style-rule/encoding@major-spacing=1000.0` | `tabdoc:set-major-tick-mark-state axis-orientation="o-horiz" duplicate-index="0" ` |
| Tick Marks > None | `style-rule/encoding@major-origin=0.0`, `style-rule/encoding@major-show=false`, `style-rule/encoding@major-spacing=1000.0` | `tabdoc:set-major-tick-mark-state axis-orientation="o-horiz" duplicate-index="0" ` |

Listas desplegables sin medir: : Automatic, Title : Custom

## Date Properties

Se abre con: Barras · Data > Ventas > Date Properties...

| control | qué escribe | comando interno |
|---|---|---|

Listas desplegables sin medir: Date format:, Default calendar:, Fiscal year start:, Week start:

## Edit Aliases

Se abre con: Barras · Data > Ventas > Edit Aliases... > Measure Names...

| control | qué escribe | comando interno |
|---|---|---|

## Edit Tooltip

Se abre con: Barras · Worksheet > Tooltip...

| control | qué escribe | comando interno |
|---|---|---|
| #0=Texto de prueba | `formatted-text/run@bold=true`, `formatted-text/run@fontcolor=#757575`, `formatted-text/run@fontname=Texto de prueba` | — |
| #1=1000 | `formatted-text/run@bold=true`, `formatted-text/run@fontcolor=#757575` | — |
| #0 | sin cambio en el documento | — |
| #1 | sin cambio en el documento | — |
| #2 | sin cambio en el documento | — |
| RichTextDialog_TextEdit=Texto de prueba | `formatted-text/run@bold=true` | — |
| Show tooltips | `table/tooltip-style@tooltip-mode=none` | — |
| Include command buttons | `formatted-text/run@bold=true`, `formatted-text/run@fontcolor=#757575`, `pane/customized-tooltip@show-buttons=false` | — |
| Allow selection by category | `panes/pane@selection-relaxation-option=selection-relaxation-disallow` − `panes/pane@selection-relaxation-option=selection-relaxation-allow` | — |

## Accessibility

Se abre con: Barras · Worksheet > Accessibility

| control | qué escribe | comando interno |
|---|---|---|
| Visualization Alt Text=Texto de prueba |  | `tabdoc:set-or-clear-accessibility-options accessibility-options={"viz-alt-text-u` |
| Use mark tooltip for alt text on marks. | `worksheet/layout-options@tooltip-mark-announcement=true` | `tabdoc:set-or-clear-accessibility-options accessibility-options={"viz-alt-text-u` |
| Sample mark alt text description=Texto de prueba | sin cambio en el documento | — |

Listas desplegables sin medir: Filter Alt Text :

## Table Options

Se abre con: Barras · Analysis > Table Layout > Advanced...

| control | qué escribe | comando interno |
|---|---|---|
| Constrain aspect ratio | `style-rule/format@value=0` | `tabdoc:apply-table-options table-options-pres-model={"keep-aspect-ratio": false,` |
| Aspect=1000 | `style-rule/format@value=1000` | `tabdoc:apply-table-options table-options-pres-model={"keep-aspect-ratio": true,"` |
| Manual | `panes/pane@decimalplaces=0` | `tabdoc:apply-table-options table-options-pres-model={"keep-aspect-ratio": true,"` |
| Show innermost level at bottom of view when there is a
vertical axis | `style-rule/format@attr=hnaxis`, `style-rule/format@value=false` | `tabdoc:apply-table-options table-options-pres-model={"keep-aspect-ratio": true,"` |
| Vertical | `style-rule/format@attr=hnlabel`, `style-rule/format@value=vertical` | `tabdoc:apply-table-options table-options-pres-model={"keep-aspect-ratio": true,"` |

## Add Reference Line, Band, or Box

Se abre con: Barras · axis:bottom · Add Reference Line

| control | qué escribe | comando interno |
|---|---|---|
| Line | `pane/reference-line@axis-column=[sum:Importe:qk]`, `pane/reference-line@enable-instant-analytics=true`, `pane/reference-line@formula=average` | — |
| Band | `pane/reference-line@formula=max`, `pane/reference-line@formula=min`, `pane/reference-line@paired-id=refline0`, `pane/reference-line@paired-id=refline1`, `pane/reference-line@symmetric=false` | — |
| Distribution | `pane/reference-line@fill-above=false`, `pane/reference-line@fill-below=false`, `pane/reference-line@percentage-bands=true`, `pane/reference-line@symmetric=false`, `reference-line/reference-line-value@percentage=60`, `reference-line/reference-line-value@percentage=80` | — |
| Box Plot | `pane/reference-line@boxplot-mark-exclusion=false`, `pane/reference-line@boxplot-whisker-type=standard`, `pane/reference-line@scope=per-cell`, `pane/reference-line@symmetric=false` | — |
| Entire Table | `pane/reference-line@scope=per-table` | — |
| Per Cell | `pane/reference-line@scope=per-cell` | — |
| Show recalculated line for highlighted or selected data points | `pane/reference-line@enable-instant-analytics=false` | — |

Listas desplegables sin medir: Fill Above:, Fill Below:, Label:, Line:, Tooltip:

## Edit Alias

Se abre con: Barras · axis:left · Edit Alias...

| control | qué escribe | comando interno |
|---|---|---|
| Name:=Texto de prueba | `aliases/alias@key="Este"`, `aliases/alias@value=Texto de prueba`, `datasource/column@datatype=string`, `datasource/column@name`, `datasource/column@role=dimension`, `datasource/column@type=nominal` | `tabdoc:try-set-aliases new-aliases-pres-model={"uid": 4,"alias-list":[{"item-ind`<br>`tabdoc:commit-single-alias-changes uid="4"` |

## Edit Title

Se abre con: Barras · title · Edit Title...

| control | qué escribe | comando interno |
|---|---|---|
| #0=Texto de prueba | `formatted-text/run@fontname=Texto de prueba` | — |
| #1=1000 | `formatted-text/run@fontsize=10` | — |
| #0 | sin cambio en el documento | — |
| #1 | sin cambio en el documento | — |
| #2 | sin cambio en el documento | — |
| RichTextDialog_TextEdit=Texto de prueba |  | — |

## Filter

Se abre con: Barras · shelf:cols · Filter...

| control | qué escribe | comando interno |
|---|---|---|
| Range of values | `view/filter@class=quantitative`, `view/filter@column=[sum:Importe:qk]`, `view/filter@included-values=in-range` | `tabdoc:format-datavalue-ui data-value="r:::1044" global-field-name="[federated.t`<br>`tabdoc:format-datavalue-ui data-value="r:::1170" global-field-name="[federated.t` |
| At least | `view/filter@class=quantitative`, `view/filter@column=[sum:Importe:qk]`, `view/filter@included-values=in-range` | `tabdoc:format-datavalue-ui data-value="r:::1170" global-field-name="[federated.t`<br>`tabdoc:format-datavalue-ui data-value="r:::1044" global-field-name="[federated.t` |
| Special | `view/filter@included-values=all` | `tabdoc:apply-quantitative-filter-range commit-edits="true" quantitative-filter={` |
| At most | `view/filter@class=quantitative`, `view/filter@column=[sum:Importe:qk]`, `view/filter@included-values=in-range` | `tabdoc:format-datavalue-ui data-value="r:::1044" global-field-name="[federated.t`<br>`tabdoc:format-datavalue-ui data-value="r:::1044" global-field-name="[federated.t` |
| #0=1000 | `view/filter@class=quantitative`, `view/filter@column=[sum:Importe:qk]`, `view/filter@included-values=in-range` | `tabdoc:validate-data-value data-type="real" global-field-name="[federated.tszse2`<br>`tabdoc:format-datavalue-ui data-value="r:4:0:1000" global-field-name="[federated` |
| #1=1000 | `view/filter@class=quantitative`, `view/filter@column=[sum:Importe:qk]`, `view/filter@included-values=in-range` | `tabdoc:validate-data-value data-type="real" global-field-name="[federated.tszse2`<br>`tabdoc:format-datavalue-ui data-value="r:::1044" global-field-name="[federated.t` |
| Include Null Values | `view/filter@included-values=in-range-or-null` | `tabdoc:apply-quantitative-filter-range commit-edits="true" quantitative-filter={` |

## Apply Filter to Worksheets

Se abre con: Barras · shelf:cols · Apply to Worksheets > Selected Worksheets...

| control | qué escribe | comando interno |
|---|---|---|
| Filter will be applied to 0 worksheets.=Texto de prueba | sin cambio en el documento | — |
| Select all worksheets | `view/filter@filter-group=3` | `tabdoc:change-shared-filter fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Im` |
| #1 | `view/filter@class=quantitative`, `view/filter@column=[sum:Importe:qk]`, `view/filter@included-values=in-range` | `tabdoc:change-shared-filter fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Im` |
| #2 | `view/filter@class=quantitative`, `view/filter@column=[sum:Importe:qk]`, `view/filter@included-values=in-range` | `tabdoc:change-shared-filter fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Im` |
| #3 | `view/filter@class=quantitative`, `view/filter@column=[sum:Importe:qk]`, `view/filter@included-values=in-range` | `tabdoc:change-shared-filter fn="[federated.tszse28gx02x3fnwag3qym7mmnuk].[sum:Im` |
| Show only selected worksheets | sin cambio en el documento | — |

## Sort

Se abre con: Barras · shelf:rows · Sort...

| control | qué escribe | comando interno |
|---|---|---|
| Descending | `view/natural-sort@column=[none:Region:nk]`, `view/natural-sort@direction=DESC` | `tabdoc:sort-dialog-sort aggregation="sum" global-field-name="[federated.tszse28g`<br>`tabdoc:sort aggregation="sum" global-field-name="[federated.tszse28gx02x3fnwag3q` |

Listas desplegables sin medir: Sort By

## Create Group

Se abre con: Barras · field:Fecha · Create > Group...

| control | qué escribe | comando interno |
|---|---|---|
| #0=Texto de prueba | `datasource/column@datatype=date` | `tabui:set-worksheet-sidepane-mode mode="data"` |
| Show Add Location | `column/calculation@class=categorical-bin`, `column/calculation@column=[Fecha]`, `column/calculation@new-bin=true` | `tabui:set-worksheet-sidepane-mode mode="data"` |
| Include 'Other' | `column/calculation@default="Other"` | `tabui:set-worksheet-sidepane-mode mode="data"` |

## Create Set

Se abre con: Barras · field:Fecha · Create > Set...

| control | qué escribe | comando interno |
|---|---|---|
| Name:=Texto de prueba | sin cambio en el documento | `tabdoc:validate-categorical-filter-name categorical-filter-cache-info={"uuid": "` |
| Custom value list | `group/groupfilter@function=level-members`, `group/groupfilter@level=[Fecha]`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-manual-selection-all-when-empty=true`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-manual-selection-is-empty=true`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-manual-selection=true` | `tabdoc:categorical-filter-set-range-type-deferred categorical-filter-cache-info=`<br>`tabdoc:apply-categorical-filter-updates categorical-filter-cache-info={"uuid": "` |
| Use all | `group/groupfilter@function=level-members`, `group/groupfilter@level=[Fecha]`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=all` | `tabdoc:categorical-filter-set-range-type-deferred categorical-filter-cache-info=`<br>`tabdoc:apply-categorical-filter-updates categorical-filter-cache-info={"uuid": "` |
| #0=Texto de prueba | `group/groupfilter@function=empty-level`, `group/groupfilter@member=[Fecha]`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=database`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=inclusive` | `tabdoc:categorical-filter-search categorical-filter-cache-info={"uuid": "{DE1B32`<br>`tabdoc:apply-categorical-filter-updates categorical-filter-cache-info={"uuid": "` |
| #1=Texto de prueba | `group/groupfilter@function=empty-level`, `group/groupfilter@member=[Fecha]`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=database`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=inclusive` | `tabdoc:categorical-filter-search categorical-filter-cache-info={"uuid": "{5E862E`<br>`tabdoc:apply-categorical-filter-updates categorical-filter-cache-info={"uuid": "` |
| Exclude | `group/groupfilter@function=except`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-domain=database`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=exclusive`, `groupfilter/groupfilter@function=empty-level`, `groupfilter/groupfilter@function=level-members`, `groupfilter/groupfilter@level=[Fecha]` | `tabdoc:categorical-filter-set-selection-exclusive-deferred categorical-filter-ca`<br>`tabdoc:apply-categorical-filter-updates categorical-filter-cache-info={"uuid": "` |
| Condition > By field: | `datasource/column@datatype=real`, `datasource/column@name`, `datasource/column@role=measure`, `datasource/column@type=quantitative`, `group/groupfilter@expression=SUM([Importe]) == 0.`, `group/groupfilter@function=filter` | `tabdoc:apply-categorical-filter-updates categorical-filter-cache-info={"uuid": "`<br>`tabui:set-worksheet-sidepane-mode mode="data"` |
| Condition > By formula: | sin cambio en el documento | `tabdoc:validate-categorical-filter-condition-formula categorical-filter-cache-in` |
| Top > By field: | `group/groupfilter@count=10`, `group/groupfilter@end=top`, `group/groupfilter@function=end`, `group/groupfilter@units=records`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-marker=end`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-top-by-field=true` | `tabdoc:validate-categorical-filter-limit-formula categorical-filter-cache-info={`<br>`tabdoc:validate-categorical-filter-limit-count categorical-filter-cache-info={"u` |
| Top > By formula: | `group/groupfilter@function=level-members`, `group/groupfilter@level=[Fecha]`, `group/groupfilter@{http://www.tableausoftware.com/xml/user}ui-enumeration=all` | `tabdoc:validate-categorical-filter-limit-formula categorical-filter-cache-info={`<br>`tabdoc:validate-categorical-filter-limit-count categorical-filter-cache-info={"u` |

## Create Parameter

Se abre con: Barras · field:Fecha · Create > Parameter...

| control | qué escribe | comando interno |
|---|---|---|
| Name=Texto de prueba | `column/calculation@class=tableau`, `column/calculation@formula=#2025-01-01#`, `datasource/aliases@enabled=yes`, `datasource/column@caption`, `datasource/column@datatype=date`, `datasource/column@name` | `tabdoc:parameter-edit-name actual-parameter-display-name="Texto de prueba" contr`<br>`tabdoc:parameter-close-dialog commit-edits="true" controller-id="14"` |
| All | `column/calculation@class=tableau`, `column/calculation@formula=#2025-01-01#`, `datasource/column@caption`, `datasource/column@datatype=date`, `datasource/column@name`, `datasource/column@param-domain-type=any` | `tabdoc:parameter-edit-domain controller-id="15" parameter-domain-type="any"`<br>`tabdoc:parameter-close-dialog commit-edits="true" controller-id="15"` |
| All > Current value=Texto de prueba | sin cambio en el documento | `tabdoc:parameter-edit-domain controller-id="17" parameter-domain-type="any"`<br>`tabdoc:parameter-edit-value controller-id="17" value-string="Texto de prueba"` |
| Range | `column/calculation@class=tableau`, `column/calculation@formula=#2025-01-01#`, `column/range@max=#2025-12-24#`, `column/range@min=#2025-01-01#`, `datasource/column@caption`, `datasource/column@datatype=date` | `tabdoc:parameter-edit-domain controller-id="18" parameter-domain-type="range"`<br>`tabdoc:parameter-close-dialog commit-edits="true" controller-id="18"` |
| Range > Current value=Texto de prueba | sin cambio en el documento | `tabdoc:parameter-edit-domain controller-id="20" parameter-domain-type="range"`<br>`tabdoc:parameter-edit-value controller-id="20" value-string="Texto de prueba"` |
| Range > Minimum=Texto de prueba | sin cambio en el documento | `tabdoc:parameter-edit-domain controller-id="21" parameter-domain-type="range"`<br>`tabdoc:parameter-edit-min-range-value controller-id="21" value-string="Texto de ` |
| Range > Maximum=Texto de prueba | sin cambio en el documento | `tabdoc:parameter-edit-domain controller-id="22" parameter-domain-type="range"`<br>`tabdoc:parameter-edit-max-range-value controller-id="22" value-string="Texto de ` |
| When workbook opens | `column/calculation@class=tableau`, `column/calculation@formula=#2025-01-01#`, `datasource/column@caption`, `datasource/column@datatype=date`, `datasource/column@name`, `datasource/column@param-domain-type=list` | `tabdoc:parameter-set-domain-to-refreshable controller-id="23"`<br>`tabdoc:parameter-close-dialog commit-edits="true" controller-id="23"` |

Listas desplegables sin medir: Add values from, Current value : 1/1/2025, Data type : Date, Display format : 1/1/2025, Value when workbook opens : Current value

## Create Custom Date

Se abre con: Barras · field:Fecha · Create > Custom date...

| control | qué escribe | comando interno |
|---|---|---|
| #0=Texto de prueba | sin cambio en el documento | — |

## Edit Comment

Se abre con: Barras · field:Fecha · Default Properties > Comment...

| control | qué escribe | comando interno |
|---|---|---|
| #0=Texto de prueba | `formatted-text/run@fontname=Texto de prueba` | — |
| #1=1000 |  | — |
| #0 |  | — |
| #1 | sin cambio en el documento | — |
| #2 | sin cambio en el documento | — |
| RichTextDialog_TextEdit=Texto de prueba |  | — |

## Edit Colors

Se abre con: Barras · field:Fecha · Default Properties > Color...

| control | qué escribe | comando interno |
|---|---|---|

## Edit Shape

Se abre con: Barras · field:Fecha · Default Properties > Shape...

| control | qué escribe | comando interno |
|---|---|---|

## Default Date Format

Se abre con: Barras · field:Fecha · Default Properties > Date Format...

| control | qué escribe | comando interno |
|---|---|---|

## Create Hierarchy

Se abre con: Barras · field:Fecha · Hierarchy > Create Hierarchy...

| control | qué escribe | comando interno |
|---|---|---|
| Name:=Texto de prueba | `drill-paths/drill-path@name` | `tabui:set-worksheet-sidepane-mode mode="data"` |

## Custom Split

Se abre con: Barras · field:Region · Transform > Split

| control | qué escribe | comando interno |
|---|---|---|
| #0=Texto de prueba | error: Desktop did not answer: timed out | — |

