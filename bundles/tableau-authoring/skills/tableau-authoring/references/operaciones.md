# Operaciones de tableu

Índice generado desde el servidor (`scripts/ops_reference.py`); no lo edites a mano. Cada herramienta MCP es `<objeto>_operations` y en la CLI `tableu op <objeto> <operación>`. Con `operation="Help"` cada herramienta da sus parámetros.

## desktop

Tableau Desktop process: API flag, launch, instances, modal error dialogs, log warnings.

Guía: `SKILL.md`, `references/revision.md`

| Operación | Parámetros |
|---|---|
| `Status` | `()` |
| `EnableApi` | `(version=None)` |
| `DisableApi` | `(version=None)` |
| `Launch` | `(workbook=None, wait=120, allow_second_instance=False, force=False)` |
| `ListInstances` | `()` |
| `ErrorDialogs` | `(dismiss=True)` |
| `Modals` | `(close_safe=False)` |
| `Warnings` | `(pid=None, since=None, limit=50)` |

## settings

Desktop preferences (registry groups), custom color palettes (Preferences.tps), repository path.

Guía: `references/comandos-de-desktop.md`, `references/ejes-y-formato.md`

| Operación | Parámetros |
|---|---|
| `ListGroups` | `(version=None)` |
| `List` | `(group='Settings', version=None)` |
| `Get` | `(name, group='Settings', version=None)` |
| `Set` | `(name, value, group='Settings', version=None, force=False)` |
| `Delete` | `(name, group='Settings', version=None, force=False)` |
| `ListPalettes` | `()` |
| `CreatePalette` | `(name, colors, type='regular')` |
| `DeletePalette` | `(name)` |
| `RepositoryPath` | `()` |

## transaction

Batch edits: Begin, run any edits, Commit (one validate + one apply) or Rollback.

Guía: `SKILL.md`

| Operación | Parámetros |
|---|---|
| `Begin` | `()` |
| `Status` | `()` |
| `Commit` | `(force=False)` |
| `Rollback` | `()` |

## workbook

Whole workbook: info, XML, validate/apply, save as, lint, image export, backups, start sheet, format.

Guía: `references/revision.md`, `SKILL.md`

| Operación | Parámetros |
|---|---|
| `Info` | `()` |
| `GetXml` | `(part=None)` |
| `ApplyXml` | `(xml, force=False)` |
| `Validate` | `(xml)` |
| `Preflight` | `()` |
| `CheckStructure` | `(include_info=False)` |
| `Schema` | `(element=None, search=None)` |
| `New` | `(path)` |
| `SaveAs` | `(path)` |
| `Lint` | `()` |
| `ExportImage` | `(sheet, kind='dashboards', path=None, allow_worksheet=False)` |
| `SummaryData` | `(sheet, max_rows=100)` |
| `ListBackups` | `(limit=20)` |
| `Restore` | `(backup)` |
| `Reopen` | `(pending, confirm=False, wait=180)` |
| `ShowSheet` | `(sheet, confirm=False)` |
| `SetStartSheet` | `(sheet)` |
| `ReorderSheets` | `(order)` |
| `Format` | `(font=None, font_size=None, color=None, title_font_size=None, locale=None)` |

## datasource

Connections: files (CSV/Excel, multi-table relationships), .tds, databases, filters, rename/delete.

Guía: `tableau-data-model/SKILL.md`

| Operación | Parámetros |
|---|---|
| `List` | `()` |
| `Get` | `(datasource)` |
| `PreviewFile` | `(source)` |
| `CreateFromFiles` | `(sources, relationships=None, caption=None, joins=None)` |
| `CreateFromTds` | `(path, caption=None)` |
| `CreateDatabase` | `(kind, server, database, table=None, schema=None, custom_sql=None, caption=None, username='', port=None, warehouse=None, http_path=None, authentication='username-password', columns=None)` |
| `Rename` | `(datasource, caption)` |
| `Delete` | `(datasource, force=False)` |
| `AddFilter` | `(datasource, field, values=None, exclude=False, min=None, max=None)` |
| `CreateExtract` | `(datasource, hyper_path=None)` |
| `ListRelationships` | `(datasource)` |

## field

Field properties: caption, role/type, datatype, hidden, default format, description, geo role, aliases.

Guía: `tableau-data-model/SKILL.md`

| Operación | Parámetros |
|---|---|
| `List` | `(datasource)` |
| `Update` | `(datasource, field, caption=None, role=None, type=None, datatype=None, hidden=None, default_format=None, description=None, aggregation=None, geo_role=None)` |
| `SetAliases` | `(datasource, field, aliases)` |
| `Delete` | `(datasource, field, force=False)` |

## calculation

Calculated fields, LOD expressions, table-calc formulas.

Guía: `tableau-data-model/SKILL.md`

| Operación | Parámetros |
|---|---|
| `List` | `(datasource)` |
| `Create` | `(datasource, name, formula, datatype='real', role=None, default_format=None, description=None)` |
| `Update` | `(datasource, field, formula=None, caption=None, datatype=None, default_format=None)` |
| `Delete` | `(datasource, field, force=False)` |

## parameter

Parameters: range, list or any value; reference as [Parameters].[Name].

Guía: `references/filtros-y-parametros.md`

| Operación | Parámetros |
|---|---|
| `List` | `()` |
| `Create` | `(name, datatype='integer', value=0, domain='any', min=None, max=None, step=None, values=None, aliases=None, default_format=None)` |
| `Update` | `(name, value=None, min=None, max=None, step=None, values=None)` |
| `Delete` | `(name)` |

## group

Groups of dimension members.

Guía: `references/filtros-y-parametros.md`

| Operación | Parámetros |
|---|---|
| `Create` | `(datasource, field, name, groups, include_other=False)` |
| `Delete` | `(datasource, field, force=False)` |

## set

Sets by members, condition or top N. Use IN_OUT(Set) on shelves for In/Out.

Guía: `references/filtros-y-parametros.md`

| Operación | Parámetros |
|---|---|
| `Create` | `(datasource, field, name, members=None, condition=None, top=None, by=None, direction='top')` |
| `Delete` | `(datasource, name)` |

## bin

Bins over a measure (histograms).

Guía: `references/filtros-y-parametros.md`

| Operación | Parámetros |
|---|---|
| `Create` | `(datasource, field, size=None, name=None, size_parameter=None)` |
| `Delete` | `(datasource, field, force=False)` |

## hierarchy

Drill-down hierarchies.

Guía: `tableau-data-model/SKILL.md`

| Operación | Parámetros |
|---|---|
| `Create` | `(datasource, name, fields)` |
| `Delete` | `(datasource, name)` |

## folder

Data-pane folders.

Guía: `tableau-data-model/SKILL.md`

| Operación | Parámetros |
|---|---|
| `Create` | `(datasource, name, fields)` |
| `Delete` | `(datasource, name)` |

## worksheet

Sheets: create in one call, shelves, marks, encodings, sort, totals, dual/shared axis, maps, pages.

Guía: `references/vistas.md`, `references/tablas-y-kpis.md`, `references/mapas.md`

| Operación | Parámetros |
|---|---|
| `List` | `()` |
| `Get` | `(worksheet)` |
| `Create` | `(name, datasource, rows=None, cols=None, mark='automatic', color=None, size=None, label=None, detail=None, tooltip=None, shape=None, path=None, angle=None, pages=None, title=None, sort_desc_by=None, sort=None, filters=None, totals=None, mark_color=None, show_labels=False, measures=None, measure_labels=None, measures_on='cols', label_font=None, value_font=None)` |
| `Delete` | `(name)` |
| `Rename` | `(name, new_name)` |
| `Duplicate` | `(sheet, new_name)` |
| `SetShelf` | `(worksheet, shelf, fields)` |
| `SetMark` | `(worksheet, mark, pane=0)` |
| `SetEncoding` | `(worksheet, encoding, field, pane=0)` |
| `SetSort` | `(worksheet, field, by=None, direction='DESC', order=None)` |
| `SetTotals` | `(worksheet, rows=None, cols=None, subtotals=None)` |
| `SetDualAxis` | `(worksheet, measures, shelf='rows', marks=None, synchronize=True, colors=None)` |
| `ViewOptions` | `(worksheet, title=None, caption=None, summary=None, sort_controls=None, toolbar=None, empty_rows=None, empty_cols=None, row_totals_left=None, col_totals_top=None, aggregate=None, special_values=None)` |
| `SetSharedAxis` | `(worksheet, measures, shelf='rows')` |
| `MakeMap` | `(worksheet, filled=True)` |
| `OrientTableCalcs` | `(worksheet, direction=None)` |
| `SetVisibility` | `(sheet, hidden)` |
| `AddCard` | `(worksheet, card_type, field_qname=None, mode=None, parameter=None)` |
| `AddMeasureValues` | `(worksheet, measures, labels=None, on='cols', label_font=None, value_font=None)` |

## filter

Worksheet filters: values, ranges, relative dates, top N, conditions, wildcard, context, filter cards.

Guía: `references/filtros-y-parametros.md`

| Operación | Parámetros |
|---|---|
| `List` | `(worksheet)` |
| `Add` | `(worksheet, field, values=None, exclude=False, min=None, max=None, relative=None, top=None, condition=None, wildcard=None, context=False, show_card=False, card_mode=None, group=None, include_null=False)` |
| `AddShared` | `(worksheets, field, card_on=None)` |
| `Remove` | `(worksheet, field)` |

## analytics

Reference lines/bands, trend lines, forecasts.

Guía: `references/analitica.md`

| Operación | Parámetros |
|---|---|
| `AddReferenceLine` | `(worksheet, measure, formula='average', scope='per-table', value=None, label=None, color=None, band_to=None, value_of=None, percentages=None)` |
| `AddTrendLine` | `(worksheet, fit='linear', degree=2, confidence_bands=False)` |
| `AddForecast` | `(worksheet, periods=None, confidence=95.0)` |
| `Remove` | `(worksheet, kind='all')` |

## format

Formatting: backgrounds (worksheet, pane, header, title, cards, dashboard, containers, zones, story), banding, borders, lines, fonts per element, rich text, mark borders, palettes, number formats, axes, reference-line styling, tooltips. Style is the generic setter; Elements lists style elements.

Guía: `references/ejes-y-formato.md`, `references/analitica.md`

| Operación | Parámetros |
|---|---|
| `Marks` | `(worksheet, color=None, size=None, show_labels=None, opacity=None, pane=0)` |
| `ColorPalette` | `(worksheet, field, colors=None, palette=None, gradient=None, center=None, min=None, max=None, steps=None)` |
| `Worksheet` | `(worksheet, font=None, font_size=None, font_color=None, background=None, gridlines=None, zero_lines=None, row_dividers=None, field_labels=None)` |
| `Field` | `(worksheet, field, number_format=None, axis_title=None, axis_min=None, axis_max=None, show_header=None, legend_title=None, axis_range=None, include_zero=None, reverse=None, log_scale=None, tick_spacing=None, tick_origin=None, show_ticks=None)` |
| `Title` | `(sheet, text, font_size=None, bold=False, color=None)` |
| `Tooltip` | `(worksheet, text, pane=0, viz_sheet=None, viz_width=300, viz_height=300, viz_filter='<All Fields>')` |
| `Label` | `(worksheet, text, pane=0, show=True)` |
| `Workbook` | `(font=None, font_size=None, color=None, title_font_size=None, locale=None)` |
| `Dashboard` | `(dashboard, background=None, title_font_size=None, font=None)` |
| `Zone` | `(dashboard, zone_id, background=None, border=None, margin=4, padding=None, show_title=None)` |
| `Backgrounds` | `(sheet, worksheet=None, pane=None, header=None, title=None, legend=None, filter_card=None, parameter_card=None, highlighter=None)` |
| `Banding` | `(sheet, rows=True, color='#f0f0f0', size=1, level=0, header=True)` |
| `Borders` | `(sheet, area='cell', style='solid', color='#d4d4d4', width=1, scope=None, data_class=None)` |
| `Lines` | `(sheet, kind='gridline', visible=True, color=None, width=None, pattern=None, scope=None)` |
| `Font` | `(sheet, element='worksheet', family=None, size=None, color=None, bold=None, italic=None, align=None, field=None)` |
| `TextRuns` | `(sheet, kind='title', font=None, size=None, color=None, bold=None, italic=None, align=None, zone_id=None)` |
| `MarkBorder` | `(worksheet, color='#ffffff', pane=0)` |
| `ReferenceLine` | `(worksheet, line_id='refline0', color=None, width=None, pattern=None, fill_above=None, fill_below=None, label_color=None)` |
| `Container` | `(dashboard, zone_id, background=None, border_color=None, border_style='solid')` |
| `Story` | `(story, caption_background=None, caption_font=None, caption_size=None, caption_color=None, background=None)` |
| `Style` | `(sheet, element, attr, value, field=None, scope=None, data_class=None, id=None, pane=None)` |
| `Elements` | `()` |

## dashboard

Dashboards: create, size, zones (sheet, text, image, web, blank, legend, filter, parameter, container, highlighter; tiled or floating), device layouts.

Guía: `references/dashboards.md`

| Operación | Parámetros |
|---|---|
| `List` | `()` |
| `ListZones` | `(dashboard)` |
| `Create` | `(name, sheets=None, layout='grid', width=1200, height=800, title=True, rows=None, heights=None)` |
| `CreateFromLayout` | `(name, layout='overview', kpis=None, main=None, details=None, filters=None, legends=None, width=1200, height=800, title=True)` |
| `Layouts` | `()` |
| `Delete` | `(name)` |
| `Rename` | `(name, new_name)` |
| `SetSize` | `(name, width=None, height=None, mode='fixed')` |
| `AddZone` | `(dashboard, kind, sheet=None, text=None, field=None, parameter=None, url=None, image=None, container=None, mode=None, floating=False, x=0, y=0, w=300, h=200, font_size=None, bold=False, font_color=None, background=None, border=None, target_sheet=None, italic=False, font=None, align=None, title=None, position=None, fixed_width=None, fixed_height=None)` |
| `RemoveZone` | `(dashboard, zone_id)` |
| `AddDeviceLayout` | `(dashboard, device='phone', sheets=None, height_per_sheet=300)` |

## action

Dashboard actions: filter, highlight, URL, go to sheet.

Guía: `references/acciones-e-historias.md`

| Operación | Parámetros |
|---|---|
| `List` | `()` |
| `Create` | `(kind, name, source, target=None, fields=None, activation='on-select', clear='show-all', url=None, parameter=None, source_field=None, set_name=None, set_mode='assign', source_dashboard=None, aggregation='attr', set_clear='exclude-all', exclude_sheets=None)` |
| `Delete` | `(name)` |

## story

Stories and story points.

Guía: `references/acciones-e-historias.md`

| Operación | Parámetros |
|---|---|
| `Create` | `(name, points, width=1016, height=964, title=None)` |
| `AddPoint` | `(story, sheet, caption, filters=None)` |
| `Delete` | `(name)` |
