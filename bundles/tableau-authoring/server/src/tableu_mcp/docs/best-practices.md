# Tableau best practices for agents

Compiled from official Tableau documentation (read 2026-11-03). Rule IDs match `workbook_operations Lint`.
Tableau gives few hard numbers. Where a rule has no published threshold, the linter's default is our own choice and is marked *(tableu default)*.

Sources:
- **WBO**: Workbook Optimizer: https://help.tableau.com/current/pro/desktop/en-us/wbo_overview.htm
- **PERF**: Performance checklist: https://help.tableau.com/current/pro/desktop/en-us/perf_checklist.htm
- **DASH**: Best practices for effective dashboards: https://help.tableau.com/current/pro/desktop/en-us/dashboards_best_practices.htm
- **A11Y**: Designing accessible views (WCAG 2.2 AA): https://help.tableau.com/current/pro/desktop/en-us/accessibility_best_practice.htm
- **VIS**: Tableau Blueprint visual best practices: https://help.tableau.com/current/blueprint/en-us/bp_visual_best_practices.htm

## 1. Before building: audience and question
- Know the audience's knowledge level and the decisions they need to make (VIS).
- Each view should answer one question. Pick the chart for the question:
  - comparison across categories: **bar** (sorted)
  - change over time: **line**, with a continuous date such as `MONTH_TRUNC(Order Date)`
  - part-to-whole with few parts: stacked bar (use pie only for 2–3 slices)
  - correlation: scatter (`circle` marks)
  - geography: symbol map for totals, filled/area map for rates (VIS)
  - exact values: text table, best kept as a secondary view

## 2. Dashboard design
| Rule | Guidance |
|---|---|
| DASH-NUM-VIEWS | "Limit the number of views … to two or three" (DASH). Split into more dashboards or use navigation. |
| WBO-DASH-SIZE | Prefer **fixed size**: fixed dashboards can be cached (WBO). Range sizing is acceptable when the layout must flex (VIS). Avoid Automatic. |
| Layout | Put the most important view in the **upper-left corner** (DASH). Use a Z / newspaper layout, white space rather than heavy grid lines, and give bigger zones to more important content (VIS). |
| WBO-LAYOUT-CONTAINERS | Too many layout containers complicate rendering (WBO); default limit 20 *(tableu default)*. |
| Titles | Add a title, plus a subtitle that explains how to interact with the dashboard (VIS). |
| Filters | Give filters clear titles. Choose the control type (dropdown, list, slider) to match the field (DASH). |

## 3. Performance
| Rule | Guidance |
|---|---|
| WBO-LIVE | Prefer extracts; use aggregated, filtered extracts and hide unused fields first (WBO/PERF). |
| PERF-CUSTOMSQL | Avoid Custom SQL (PERF). |
| WBO-MULTICONN | Cross-database joins can't be computed locally (WBO). |
| WBO-BLENDING | Prefer relationships to blending, and aggregate before you blend (WBO/PERF). |
| WBO-UNUSED-DS | Close data sources that aren't in use (WBO). |
| WBO-NUM-DS | Every data source adds load time; default limit 5 *(tableu default)*. |
| WBO-NUM-FILTERS | Too many filters produce complex queries; default limit 5 per sheet *(tableu default)*. |
| WBO-RELEVANT-VALUES | "Only Relevant Values" re-queries whenever another filter changes; use dashboard filter actions instead (WBO/PERF). |
| PERF-EXCLUDE-FILTER | Keep Only / Exclude on discrete items is expensive; a range is faster than a long list (PERF). |
| Show Apply button | Turn on "Show Apply Button" for multi-select filters (PERF). |
| WBO-NUM-SHEETS | Every visible sheet has to load; hide sheets that only appear on dashboards (WBO). Default limit 20 *(tableu default)*. |
| Marks | Reduce the number of marks. More than 1000 marks can force server-side rendering (A11Y/PERF). |
| Query batching | Use the same level of detail on sheets that share a dashboard so their queries can batch (PERF). |

## 4. Calculations
| Rule | Guidance |
|---|---|
| Data types | Booleans and integers are faster than strings and dates (PERF). |
| Aggregations | MIN/MAX perform better than AVG/ATTR (PERF). |
| PERF-COUNTD | COUNTD is one of the slowest functions; avoid it when possible (PERF). |
| WBO-CALC-LENGTH | Long calculations hurt performance, and comments count toward the length (WBO). Default limit 500 characters *(tableu default)*. |
| WBO-NESTED-CALC | Nested calculations add complexity (WBO). |
| WBO-CALC-MULTI-DS | A calculation that uses fields from several data sources is computed locally (WBO). |
| WBO-NUM-LOD | LOD expressions are expensive. Try a table calculation instead, or the reverse (WBO/PERF). |
| WBO-DATE-CALCS | Minimize date calculations; prefer DATEPARSE, MAKEDATE and DATEDIFF (WBO/PERF). |
| WBO-GROUPS | Native groups load the field's entire domain; prefer CASE or sets (WBO). |
| Native features | Prefer groups, sets, bins, date parts and aliases to custom calculations where they do the job (PERF). |
| Conditional logic | Use ELSEIF/CASE and test the most frequent outcome first (WBO). |

## 5. Accessibility (WCAG 2.2 AA)
| Rule | Guidance |
|---|---|
| NAME-DEFAULT | Rename "Sheet 1" and "Dashboard 1": the name becomes the default title and alt text. |
| A11Y-ONE-WORD-TITLE | "A one-word title isn't descriptive enough." Avoid jargon and abbreviations. |
| A11Y-CAPS-TITLE | "Avoid all capital letters" in titles (A11Y). |
| A11Y-LINE-COLOR-ONLY | Don't rely on color alone. For lines, add shapes, size or labels, and use a color-blind palette (A11Y). |
| Contrast | Text contrast of at least 4.5:1, or 3:1 for large text (A11Y). |
| Alt text | Describe each visualization; Tableau auto-generates alt text starting in 2023.1 (A11Y). |
| Links | Avoid link text such as "Click here" or "More" (A11Y). |
| A11Y-DASH-TITLE | Every dashboard needs a title or a text object (A11Y/VIS). |

## 6. Visual style
- Keep a small font hierarchy and reserve the largest fonts for KPIs and titles. Use grays and black for text (VIS). **VIS-FONTS**: default limit 3 families *(tableu default)*.
- Use neutral main colors and only a few accent colors, and account for color blindness (VIS). **VIS-PALETTE**: default limit 10 colors *(tableu default)*.
- Keep tooltips minimal and useful (VIS).

## 7. Agent workflow
1. `desktop_operations Status`. If the API is off, run `desktop_operations EnableApi` and then `desktop_operations Launch`.
2. `workbook_operations Info`, then `field_operations List`.
3. Build with `dry_run=true` first and read the validation issues.
4. Run `export_image` on the dashboard and look at the result.
5. Run `workbook_operations Lint`, fix warnings, and repeat until the score is at least 90.
6. If something breaks, `workbook_operations Restore` undoes the last live edit (`ListBackups` shows what is there).
