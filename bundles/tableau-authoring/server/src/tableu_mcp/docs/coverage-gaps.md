# Pool de funciones que faltan en tableu

Generado por `scripts/coverage_gaps.py` a partir de `xml-catalog.json`, que es la estructura de los documentos que instala Tableau Desktop 2026.3. Contiene lo que Tableau escribe y `tableu` todavía no sabe escribir, ordenado por el número de documentos de Tableau que lo usan. Cada línea es una herramienta o un parámetro candidato. Mira cómo lo escribe Tableau en `xml-catalog.json` antes de implementarlo, y valida el resultado con Desktop.

## Formato

Valores de atributos que activan una función:

- `style-rule/encoding @type=custom-interpolated` (33 documentos)
- `style-rule/encoding @type=centersize` (33 documentos)
- `style-rule/encoding @attr=size-bar` (33 documentos)

## Filtros

Valores de atributos que activan una función:

- `group/groupfilter @function=crossjoin` (49 documentos)
- `filter/groupfilter @function=empty-level` (35 documentos)
- `filter/groupfilter @function=crossjoin` (35 documentos)

## Datos

Valores de atributos que activan una función:

- `connection/relation @type=join` (77 documentos)
- `relation/relation @type=join` (40 documentos)

## Analítica

Valores de atributos que activan una función:

- `pane/reference-line @scope=per-pane` (31 documentos)
- `pane/reference-line @scope=per-cell` (31 documentos)

## Otros

Elementos:

- `document-format-change-manifest/SortTagCleanup` (32 documentos, 32 veces)
- `document-format-change-manifest/SetMembershipControl` (31 documentos, 31 veces)
- `document-format-change-manifest/MapboxVectorStylesAndLayers` (30 documentos, 30 veces)
- `document-format-change-manifest/ExplainData_NullValueExplanation` (30 documentos, 30 veces)
- `document-format-change-manifest/ExplainData_AuthorControls` (30 documentos, 30 veces)
- `document-format-change-manifest/AutoCreateAndUpdateDSDPhoneLayouts` (30 documentos, 30 veces)
- `document-format-change-manifest/AccessibleZoneTabOrder` (30 documentos, 30 veces)
- `source/exclude-sheet` (17 documentos, 79 veces)
- `story-point/capturedDeltas` (15 documentos, 30 veces)
- `reference-line/reference-line-value` (15 documentos, 60 veces)
- `document-format-change-manifest/ZoneFriendlyName` (15 documentos, 15 veces)
- `document-format-change-manifest/WorksheetBackgroundTransparency` (15 documentos, 15 veces)
- `document-format-change-manifest/VizInTooltipHideWorksheet` (15 documentos, 15 veces)
- `datasource-relationships/datasource-relationship` (15 documentos, 15 veces)
- `datasource-relationship/column-mapping` (15 documentos, 15 veces)
- `relation/clause` (9 documentos, 17 veces)
- `workbook/style-theme` (2 documentos, 2 veces)
- `connection/calculations` (2 documentos, 2 veces)
- `view/alphabetic-sort` (1 documentos, 1 veces)
- `document-format-change-manifest/VConnDownstreamExtractsWithWarnings` (1 documentos, 1 veces)
- `document-format-change-manifest/ObjectModelExtractV2` (1 documentos, 1 veces)

## Internos

Desktop los escribe y los regenera al guardar (cachés, miniaturas, estado de la interfaz). No hace falta una herramienta para ellos.

Elementos:

- `semantic-values/semantic-value` (64 documentos, 1591 veces)
- `metadata-record/approx-count` (32 documentos, 814 veces)
- `highlight/color-one-way` (32 documentos, 582 veces)
- `thumbnails/thumbnail` (31 documentos, 255 veces)
- `metadata-record/precision` (31 documentos, 93 veces)
- `workbook/explain-data` (30 documentos, 30 veces)
- `window/device-preview` (30 documentos, 120 veces)
- `viewpoint/geo-search-visibility` (30 documentos, 30 veces)
- `explanation-types/explanation-type` (30 documentos, 270 veces)
- `explain-data/explanation-types` (30 documentos, 30 veces)
- `highlight/bucket-selection` (29 documentos, 58 veces)
- `metadata-record/scale` (17 documentos, 73 veces)
- `viewpoint/floating-toolbar-visibility` (16 documentos, 17 veces)
- `viewpoint/map-navigation` (15 documentos, 15 veces)
- `viewpoint/default-map-tool-selection` (15 documentos, 45 veces)
- `column/server-captions` (10 documentos, 31 veces)
- `refresh/refresh-event` (2 documentos, 2 veces)
- `connection/refresh` (2 documentos, 3 veces)

## Contra el esquema completo de Tableau (XSD de la instalación local)

El esquema define 504 elementos. Estos son los que tableu todavía no escribe, por área, con el contexto donde van y la marca de funcionalidad que los activa. Consulta la definición completa de cualquiera con `workbook Schema element=<nombre>`.

### Analítica (1)

- `<annotation>` en AnnotationSpecification-G, annotations

### Otros (274)

- `<accelerator-details>` en Workbook-AcceleratorDetails-G · requiere `AcceleratorDetails`
- `<actual-parameters>` en RelationActualParameters-G
- `<add-in>` en pane, zone · requiere `Extensions`, `VizExtensions`
- `<additional-resource>` en DataOrientation-Item-CT
- `<address-column>` en address-columns
- `<address-columns>` en GeocodingEnhancement-AddressColumns-G
- `<alphabetic-sort>` en Sort-Alphabetic-G · requiere `SortTagCleanup`
- `<alt-text>` en layout-options · requiere `AccessibilityEditableAltText`
- `<analysis-fields>` en AnalysisFields-G, model-specification
- `<analytic-model-specifications>` en AnalyticModel-Specifications-G
- `<analytic-model>` en AnalyticModel-G
- `<analytics-extension-object-node>` en AnalyticsExtensionObjectNode-G
- `<anchored-zones>` en FlexibleLayoutRoot-G
- `<anchoring-properties>` en FlexibleLayoutRoot-AnchoringProperties-G
- `<anova>` en StatisticalModel-ANOVA-G
- `<archive-path>` en Icon-CT
- `<associated-user-geom>` en metadata-record
- `<author>` en Tableau-Extension-CT, Workspace-Extension-CT
- `<auto-hidden>` en metadata-record
- `<axis-extent-node>` en AxisExtentNode-G
- `<axis-title-node>` en AxisTitleNode-G
- `<binding>` en bindings
- `<bindings>` en relation
- `<bottom-right>` en annotation
- `<calcs-on-densified-marks>` en view · requiere `AllowCalculationsForDensifiedMarks`
- `<calculated-member>` en DataSource-CalculatedMember-G
- `<calculations>` en MaterialisedCalcs-G
- `<capturedDeltas>` en Deltas-G
- `<cast-to-local-type>` en metadata-record
- `<categorical-domain>` en CategoricalDomain-G
- `<clause>` en relation, subquery
- `<clear-filter>` en ClearFilter-G
- `<clear-shelf-sort-v2>` en ShelfSortDelta-ClearShelfSort-V2-G
- `<clear-shelf-sort>` en ShelfSortDelta-ClearShelfSort-G
- `<clear-shelf-sorts>` en ShelfSortDelta-ClearShelfSorts-G
- `<clear-sort>` en ClearSort-G
- `<cluster>` en StatisticalModel-Cluster-G
- `<clusters>` en StatisticalModel-Clusters-G
- `<column-mapping>` en ColumnMapping-G
- `<configure-context-menu-item>` en Extension-Context-Menu-CT
- `<connection-customization>` en DataConnectionCustomization-G
- `<context-menu>` en Tableau-Extension-CT, Workspace-Extension-CT
- `<core>` en model-patch · requiere `ModelPatchingV1`
- `<current-page>` en Flipboard-VizDeltas-G, VisualDoc-CurrentPage-G
- `<currentDeltas>` en Deltas-G
- `<customization>` en DataConnectionCust-Customization-G
- `<customizations>` en Customizations-G
- `<dashboard-extension>` en ExtensionManifest-CT
- `<dashboard-zone-visibility-node>` en DashboardZoneVisibilityNode-G
- `<data-mapper-enabled>` en accelerator-details · requiere `AcceleratorDetails`
- `<data-orientation-item>` en data-orientation
- `<data-orientation>` en DataOrientation-G
- `<data-source-tree>` en DataSourceTree-Wrapper-G
- `<data-spec>` en Encoding-Custom-CT · requiere `VizExtensions`
- `<data-type>` en Data-Type-CT · requiere `VizExtensions`
- `<dataMapperState>` en accelerator-details · requiere `AcceleratorDetails`
- `<database-column-name-map>` en name-persistence-map
- `<database-filter>` en relation
- `<datagraph>` en Datagraph-G
- `<datasource-relationship>` en DataSourceRelationship-DataSourceRelationship-G
- `<default-calendar-type>` en DefaultCalendarType-G, overridable-settings · requiere `ISO8601DefaultCalendarPref`
- `<default-execution-subgraph-guid>` en properties
- `<default-locale>` en Tableau-Extension-CT, Workspace-Extension-CT
- `<default-map-unit-selection>` en DefaultMapUnitSelection-G
- `<default-member>` en hierarchy
- `<default-size>` en Layout-CT
- `<derivedcolumn>` en anova, cluster
- `<dimensionality>` en groupfilter
- `<dimensions-to-sort>` en ShelfSortInfo-DimensionList-G
- `<disable-sorting-ui>` en Tableau-Extension-CT, Workspace-Extension-CT
- `<display-name>` en Encoding-Custom-CT · requiere `VizExtensions`
- `<driver>` en Driver-G
- `<edges>` en Datagraph-Graph-Edges-G
- `<encoding-icon>` en Encoding-Custom-CT · requiere `VizExtensions`
- `<exchange-product-id>` en accelerator-details · requiere `AcceleratorDetails`
- `<exclude-sheet>` en source
- `<excluded-factors>` en trendline
- `<excluded-insight-type>` en TabAgentConfig-Item-CT
- `<excluded-sheets>` en TabAgentConfig-Item-CT
- `<explainability-field>` en explainability
- `<export-button-action>` en Button-CT · requiere `DashboardExportButton`
- `<extend-time-series>` en table · requiere `ExtendTimeSeries`
- `<extended-column>` en extend-time-series · requiere `ExtendTimeSeries`
- `<external>` en Shapes-G
- `<field-reference>` en field-selection
- `<field-selection>` en FieldSelection-G
- `<field-sort-custom-order>` en field-sort-info
- `<filter-alt-text>` en layout-options · requiere `VizKeyboardNavigationSP6_FilterAltText`
- `<filter-fields>` en FilterFields-G
- `<first-rule>` en FlexibleLayoutRoot-DimensionAnchoringRules-CT
- `<format-string-override-node>` en FormatStringOverrideNode-G
- `<geocoding-enhancement>` en GeocodingEnhancement-G
- `<geocoding-enhancements>` en GeocodingEnhancements-G
- `<graph-node>` en Datagraph-Graph-Nodes-GraphNode-G
- `<graph>` en Datagraph-Graph-G
- `<grid-child>` en GridLayout-GridChild-G
- `<grid-layout>` en GridLayout-G
- `<group-child-properties>` en GroupLayout-GroupChildProperties-G
- `<group-layout>` en GroupLayout-G
- `<groups>` en relation
- `<hide-sort-controls>` en ViewSpec-HideSortControls-G
- `<horizontal-rules>` en anchoring-properties
- `<icon>` en Tableau-Extension-CT, Toolbar-Button-CT, Workspace-Extension-CT
- `<image-options>` en MappedImage-Options-G
- `<image-path>` en Button-Visual-State-CT
- `<input>` en Datagraph-Graph-Nodes-GraphNode-Inputs-Inputs-G, analytics-extension-object-node
- `<inputs>` en Datagraph-Graph-Nodes-GraphNode-Inputs-G
- `<insight-enabled>` en TabAgentConfig-Item-CT
- `<instance-settings>` en Extension-CT
- `<is-alive>` en model-patch · requiere `ModelPatchingV1`
- `<is-dissagregate>` en analytic-model-specifications
- `<label-position>` en mark-label
- `<language>` en Language-G
- `<languages>` en Languages-G
- `<layer-control>` en LayerControl-G
- `<layer-number>` en metadata-record
- `<layer>` en Layer-G
- `<layered>` en metadata-record
- `<layers>` en Layers-G
- `<layout-patches>` en ModelPatch-Layout-Patches-G · requiere `ModelPatchingV1`
- `<level-number>` en metadata-record
- `<local-data-typed>` en Workbook-LocalData-G · requiere `LocalDataTyped`
- `<local-data>` en Workbook-LocalData-G
- `<lod-fields>` en LODFields-G
- `<map-attribution2>` en MapAttribution2-G
- `<map-attribution>` en MapAttribution-G
- `<map-layer-style>` en map-style
- `<map-pri>` en MapPri-G
- `<map-scale-visibility>` en MapScaleVisibility-G
- `<map-style>` en MapStyle-G
- `<map-styles>` en MapStyles-G
- `<map-viewport-node>` en MapViewportNode-G
- `<mapped-image>` en MappedImageSpec-G
- `<mapping>` en MappedImage-Mapping-G
- `<mapsource-defaults>` en MapSourceDefaults-G
- `<mark-label>` en mark-labels
- `<max-size>` en Layout-CT
- `<min-api-version>` en Tableau-Extension-CT, Workspace-Extension-CT
- `<min-size>` en Layout-CT
- `<model-patch>` en Model-Patch-G · requiere `ModelPatchingV1`
- `<model-specification>` en UnsupervisedModel-G
- `<model-summary>` en statistical-model
- `<multibucket>` en MultiBucket-Only-G
- `<multidomain>` en MultiDomain-G
- `<name-persistence-map>` en DataSourceTree-NamePersistenceMaps-G
- `<natural-sort>` en Sort-Natural-G · requiere `SortTagCleanup`
- `<nav-action>` en NavAction-G
- `<node-execution-subgraphs>` en Datagraph-Graph-ExecutionSubgraphs-G
- `<node-reference>` en NodeReference-G
- `<node-selection>` en NodeSelection-G
- `<nodes>` en Datagraph-Graph-Nodes-G
- `<nontransacted-state>` en NonTransactedState-G
- `<number-of-desired-clusters>` en NumDesiredClusters-G
- `<object-id-map>` en name-persistence-map
- `<on-click>` en Toolbar-Button-CT
- `<oriented-node-reference>` en OrientedNodeReference-G
- `<output>` en Datagraph-Graph-Nodes-GraphNode-Outputs-Output-G, analytics-extension-object-node
- `<outputs>` en Datagraph-Graph-Nodes-GraphNode-Outputs-G
- `<padded-semantics>` en metadata-record
- `<page-reference>` en PageReference-G
- `<pair>` en Datagraph-Graph-ExecutionSubgraphs-Pair-G
- `<pane-descriptor>` en PaneDescriptor-G
- `<parameter-name-map>` en name-persistence-map
- `<parameter-sink-node>` en ParameterSinkNode-G
- `<parents>` en DataSourceTree-Parents-G
- `<partitionable-measures>` en table-calculations
- `<pds>` en DataSourceTreeNode-G
- `<permission>` en Extension-Permissions-CT
- `<permissions>` en Tableau-Extension-CT, Workspace-Extension-CT
- `<perspective-dimension>` en perspective
- `<perspective>` en groupfilter, perspectives
- `<perspectives>` en Perspective-G
- `<pin-values>` en Datagraph-Graph-PinValues-G
- `<preset>` en Filter-FilterPresets-G
- `<projection>` en groupfilter, visual-coordinate
- `<property-bag-entry>` en property-bag · requiere `ModelPatchingV1`
- `<property-bag>` en Model-Patch-PropertyBag-G · requiere `ModelPatchingV1`
- `<proportional-ratio>` en StackLayout-ProportionalRatio-G
- `<proportions>` en GridLayout-Proportions-G
- `<qa-enabled>` en TabAgentConfig-Item-CT · requiere `TabAgentConfigDashboardQA`
- `<quantitative-color-legend-node>` en QuantitativeColorLegendNode-G
- `<quantitative-domain>` en QuantitativeDomain-G
- `<reference-line-selection>` en ReferenceLineSelection-G
- `<reference-line-value>` en reference-line
- `<referenced-extension>` en ReferencedExtensions-CT
- `<referenced-extensions>` en Workbook-ReferencedExtensions-G
- `<referenced-view>` en ReferencedViews-CT
- `<referenced-views>` en ReferencedExtension-CT
- `<region>` en Toolbar-Button-CT
- `<relation-alias-map>` en name-persistence-map
- `<requires-data>` en Visibility-CT
- `<resource>` en Resources-CT
- `<resources>` en ExtensionManifest-CT
- `<result-fields>` en AnalyticModel-ResultFields-G
- `<role-spec>` en Encoding-Custom-CT · requiere `VizExtensions`
- `<role-type>` en Role-Type-CT · requiere `VizExtensions`
- `<rule-config>` en WorkbookOptimizer-RuleConfig-G
- `<script-code>` en analytics-extension-object-node
- `<second-rule>` en FlexibleLayoutRoot-DimensionAnchoringRules-CT
- `<selectedSourceDataSourceCaption>` en dataMapperState · requiere `AcceleratorDetails`
- `<selectedSourceDataSourceName>` en dataMapperState · requiere `AcceleratorDetails`
- `<selectedTargetDataSourceCaption>` en dataMapperState · requiere `AcceleratorDetails`
- `<selectedTargetDataSourceName>` en dataMapperState · requiere `AcceleratorDetails`
- `<selection-collection>` en SelectionCollection-G
- `<semistruct-schema>` en SchemaSelection-G
- `<semistruct-schemas>` en SchemaSelections-G
- `<shared-view>` en Workbook-SharedView-G
- `<shared-views>` en Workbook-SharedViews-G
- `<shelf-sort-delta>` en ShelfSortDelta-G
- `<shelf-sort-deltas>` en ShelfSortDeltas-G
- `<shelf-sort-v2>` en shelf-sorts
- `<shelf-sort>` en ShelfSort-G
- `<shelf-sorts>` en ShelfSortList-G
- `<should-run>` en model-patch · requiere `ModelPatchingV1`
- `<show-for-dashboard>` en Visibility-CT
- `<show-for-viz>` en Visibility-CT
- `<single-select>` en edit-group-action · requiere `GroupActionSingleSelect`
- `<single-value-field-node>` en SingleValueFieldNode-G
- `<single-value-per-nest-shelf-sort>` en single-value-per-nest-shelf-sorts
- `<single-value-per-nest-shelf-sorts>` en SingleValuePerNestShelfSortList-G
- `<sort-filter-info>` en ShelfSortInfo-FilterInfo-G
- `<sort-filter>` en sort-filter-info
- `<source-location>` en Tableau-Extension-CT, Workspace-Extension-CT
- `<sourceFullyQualifiedFieldName>` en field · requiere `AcceleratorDetails`
- `<stack-child>` en StackLayout-StackChild-G
- `<stack-layout>` en StackLayout-G
- `<statistic>` en statistics
- `<statistical-model>` en StatisticalModel-G
- `<statistics>` en MetadataRecord-Statistics-G
- `<style-override-node>` en StyleOverrideNode-G
- `<style-theme>` en Workbook-StyleTheme-G
- `<subquery>` en SQLSubquery-G
- `<subrange-refresh>` en refresh · requiere `IncrementalRefreshSubRange`
- `<summary-enabled>` en TabAgentConfig-Item-CT
- `<tab-agent-config-item>` en tab-agent-config
- `<tab-agent-config>` en TabAgentConfig-G
- `<table-description>` en object
- `<table-filter>` en relation
- `<tableName>` en targetFields · requiere `AcceleratorDetails`
- `<targetFields>` en dataMapperState · requiere `AcceleratorDetails`
- `<targetFullyQualifiedFieldName>` en field · requiere `AcceleratorDetails`
- `<toggle-action>` en Button-CT · requiere `CollapsiblePane`
- `<toolbar-button>` en Workspace-Extension-CT
- `<tooltip-text>` en Button-Visual-State-CT
- `<top-left>` en annotation
- `<trail-override>` en trail-overrides
- `<trendline-selection>` en TrendLineSelection-G
- `<tuple-descriptor>` en TupleDescriptor-G
- `<tuple-reference>` en TupleReference-G
- `<tuple-selection>` en TupleSelection-G
- `<tuple>` en Tuple-G
- `<tuples>` en groupfilter
- `<type-settings>` en Extension-CT
- `<url-action-target>` en link · requiere `SpecificWebTargetsForActions`
- `<url-action-type>` en link · requiere `SpecificWebTargetsForActions`
- `<user-created-column-name-map>` en name-persistence-map
- `<user-geom-alias>` en metadata-record
- `<utility-dimension>` en utility-dimensions
- `<utility-member>` en ColumnInstance-UtilityMembers-CT, utility-members
- `<utility-members>` en DataSource-UtilityDimension-G, column-instance
- `<vendor>` en Vendor-G
- `<verbosity>` en TabAgentConfig-Item-CT
- `<vertical-rules>` en anchoring-properties
- `<video-link>` en DataOrientation-Item-CT
- `<visibility>` en Toolbar-Button-CT
- `<visual-coordinate>` en VisualCoordinate-G
- `<workbook-optimizer>` en WorkbookOptimizer-G
- `<worksheet-extension>` en ExtensionManifest-CT · requiere `VizExtensions`
- `<worksheet-number>` en Worksheet-WorksheetNumber-G
- `<workspace-extension>` en ExtensionManifest-CT
- `<x-coord>` en visual-coordinate
- `<x-fields>` en pane-descriptor
- `<y-coord>` en visual-coordinate
- `<y-fields>` en pane-descriptor

### Internos (18)

- `<approx-count>` en metadata-record
- `<bucket-selection>` en BucketSelection-G, highlight
- `<color-one-way>` en HighlightSpecification-ColorOneWay-G
- `<default-map-tool-selection>` en DefaultMapToolSelection-G
- `<device-preview>` en Window-DevicePreviewSettings-G
- `<explain-data>` en Workbook-ExplainData-G · requiere `ExplainData_AuthorControls`
- `<explanation-type>` en explanation-types · requiere `ExplainData_AuthorControls`
- `<explanation-types>` en Workbook-ExplanationTypes-G · requiere `ExplainData_AuthorControls`
- `<floating-toolbar-visibility>` en FloatingToolbarVisibility-G
- `<geo-search-visibility>` en GeoSearchVisibility-G
- `<map-navigation>` en MapNavigation-G
- `<precision>` en metadata-record
- `<refresh-event>` en refresh
- `<refresh>` en Refresh-G
- `<scale>` en metadata-record
- `<semantic-value>` en semantic-values
- `<server-captions>` en DataSource-LocalizedServerCaptions-G
- `<thumbnail>` en Thumbnail-G

### Valores que activan una función y tableu no escribe

- `<column-instance derivation>`: `Default`, `StdevP`, `VarP`, `SumXSqr`, `MY`, `MDY`, `Hour`, `Minute`, `Second`, `Percentile`, `Collect`, `Union`, `Hour-Trunc`, `Minute-Trunc`, `Second-Trunc`
- `<encoding attr>`: `alternate-text`, `alt-mark-color`, `animation-on`, `animation-duration`, `animation-style`, `aspect`, `auto-subtitle`, `background-transparency`, `body-type`, `border-color-top`, `border-color-right`, `border-color-bottom`, `border-color-left`, `border-style-top`, `border-style-right`, `border-style-bottom`, `border-style-left`, `border-width-top`, `border-width-right`, `border-width-bottom`, `border-width-left`, `break-on-special`, `cell-w`, `cell-h`, `cell-q`, `cell-qmark`, `col-levels`, `col-vert-levels`, `col-horiz-height`, `col-vert-height`, `col-height`, `corner-radius`, `corner-radius-top-left`, `corner-radius-top-right`, `corner-radius-bottom-right`, `corner-radius-bottom-left`, `density-color`, `density-kernel-size`, `density-intensity`, `density-max-value`, `display-alternate-text`, `fill-color`, `fog-bg-color`, `fog-desaturation-without-selection`, `fog-desaturation-with-selection`, `geo-area-type`, `halign`, `halo-color`, `halo-color-selected`, `has-label`, `has-fill`, `has-halo`, `height-header`, `highlight-legend`, `hnaxis`, `hnlabel`, `in-tooltip`, `level-padding`, `level-width`, `line-end`, `line-end-size`, `line-interpolation`, `line-marker-position`, `line-pattern`, `map-style`, `map-snap-zoom`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`, `mark-markers-mode`, `mark-labels-mode`, `mark-labels-line-first`, `mark-labels-line-last`, `mark-labels-range-min`, `mark-labels-range-max`, `mark-labels-range-scope`, `mark-labels-range-field`, `mark-line-pattern`, `max-font-size`, `max-stroke-width`, `middle-stroke-width`, `min-font-size`, `min-stroke-width`, `nonhighlight-color`, `min-length`, `min-map-size`, `min-size`, `omit-on-special`, `orientation`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`, `render-fold-reversed`, `reverse-palette`, `rounding`, `row-horiz-levels`, `row-horiz-width`, `row-levels`, `row-vert-width`, `show-labels`, `size-bar`, `smart-auto-align`, `text-align-default`, `text-decoration`, `text-indent`, `text-orientation`, `tick-color`, `tick-length`, `tick-spacing`, `total-label`, `width-header`, `valign`, `variable-width-columns-on`, `variable-width-columns-size`, `vertical-align`, `vertical-align-default`, `vnaxis`, `vnlabel`, `whisker-stroke-size`, `whisker-stroke-color`, `whisker-end`, `boxplot-style`
- `<encoding type>`: `diverging`, `catsize`, `cat-highlight`, `quantsize`, `rangesize`, `centersize`, `custom-interpolated`
- `<format attr>`: `alternate-text`, `alt-mark-color`, `animation-on`, `animation-duration`, `animation-style`, `aspect`, `auto-subtitle`, `background-transparency`, `body-type`, `border-color-top`, `border-color-right`, `border-color-bottom`, `border-color-left`, `border-style-top`, `border-style-right`, `border-style-bottom`, `border-style-left`, `border-width-top`, `border-width-right`, `border-width-bottom`, `border-width-left`, `break-on-special`, `cell-w`, `cell-h`, `cell-q`, `cell-qmark`, `col-levels`, `col-vert-levels`, `col-horiz-height`, `col-vert-height`, `col-height`, `corner-radius`, `corner-radius-top-left`, `corner-radius-top-right`, `corner-radius-bottom-right`, `corner-radius-bottom-left`, `density-color`, `density-kernel-size`, `density-intensity`, `density-max-value`, `display-alternate-text`, `fill-color`, `fog-bg-color`, `fog-desaturation-without-selection`, `fog-desaturation-with-selection`, `geo-area-type`, `halign`, `halo-color`, `halo-color-selected`, `has-label`, `has-fill`, `has-halo`, `height-header`, `highlight-legend`, `hnaxis`, `hnlabel`, `in-tooltip`, `level-padding`, `level-width`, `line-end`, `line-end-size`, `line-interpolation`, `line-marker-position`, `line-pattern`, `map-style`, `map-snap-zoom`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`, `mark-markers-mode`, `mark-labels-mode`, `mark-labels-line-first`, `mark-labels-line-last`, `mark-labels-range-min`, `mark-labels-range-max`, `mark-labels-range-scope`, `mark-labels-range-field`, `mark-line-pattern`, `max-font-size`, `max-stroke-width`, `middle-stroke-width`, `min-font-size`, `min-stroke-width`, `nonhighlight-color`, `min-length`, `min-map-size`, `min-size`, `omit-on-special`, `orientation`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`, `render-fold-reversed`, `reverse-palette`, `rounding`, `row-horiz-levels`, `row-horiz-width`, `row-levels`, `row-vert-width`, `show-labels`, `size-bar`, `smart-auto-align`, `text-align-default`, `text-decoration`, `text-indent`, `text-orientation`, `tick-color`, `tick-length`, `tick-spacing`, `total-label`, `width-header`, `valign`, `variable-width-columns-on`, `variable-width-columns-size`, `vertical-align`, `vertical-align-default`, `vnaxis`, `vnlabel`, `whisker-stroke-size`, `whisker-stroke-color`, `whisker-end`, `boxplot-style`
- `<groupfilter function>`: `ancestors`, `crossjoin`, `descendants`, `empty-level`, `hierarchy-members`, `intersection`, `named-set`, `relative-date-range`, `reorder-dimensionality`, `tuples`, `visual-totals`
- `<mark class>`: `Icon`, `Rectangle`, `Heatmap`, `PolyLine`, `Sankey`, `Sunburst`, `VizExtension`
- `<reference-line formula>`: `median`, `quantiles`, `percentile`, `confidence`, `medianconfidence`
- `<reference-line label-type>`: `computation`
- `<reference-line scope>`: `per-cell`, `per-pane`
- `<relation join>`: `inner`
- `<relation type>`: `join`, `subquery`, `stored-proc`, `batch-union`, `pivot`, `project`
- `<style-rule element>`: `animation`, `dropspot`, `field-labels-decoration`, `field-labels-spanner`, `page-card-body`, `basesheet`, `refboxplot`, `mapped-image`, `legend-title`, `annotation`, `dash-text`, `dash-zone`, `scrollbar`, `map-layer`, `map-data-layer`, `quick-filter-title`, `data-highlighter-title`, `parameter-ctrl-title`, `page-card-title`, `story-title`, `story-description`
- `<table-calc type>`: `Difference`, `PctValue`, `PctRank`
- `<zone layout-strategy-id>`: `basic`, `free-form`, `flow`, `trivial`, `stack-equal-size`, `stack-automatic`
- `<zone type>`: `currpage`, `add-in`, `layout-group`, `layout-stack`, `layout-grid`
