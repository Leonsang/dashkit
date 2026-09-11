# Attributions

dashkit installs other people's work into your tools. It does not own any of the skills.

## Skills and plugins

| Project | Author | Licence | How dashkit uses it |
|---|---|---|---|
| [skills-for-fabric](https://github.com/microsoft/skills-for-fabric) | Microsoft | MIT | Downloads a pinned tag and writes the skills into each tool's native format. Skill descriptions in [docs/bundles.md](docs/bundles.md) are quoted from its `SKILL.md` files. |
| [power-bi-agentic-development](https://github.com/data-goblin/power-bi-agentic-development) | Kurt Buhler, Data Goblins | GPL-3.0 | **Not copied or redistributed.** dashkit asks Claude Code or Copilot CLI to install selected plugins from that marketplace; the plugins, their hooks and their updates stay the project's. dashkit's docs list skill names with links to the source; the bundle descriptions are dashkit's own words. |
| [pbir-cli](https://github.com/data-goblin/pbir-cli) | Kurt Buhler, Maxim Anatsko | Proprietary, non-commercial | **Never installed by dashkit.** `dashkit doctor` reports whether it is present and explains its licence. |
| [@microsoft/powerbi-modeling-mcp](https://www.npmjs.com/package/@microsoft/powerbi-modeling-mcp) | Microsoft | see package | Registered as an MCP server; your tool starts it with `npx`. |

## In the dashkit binary

| Component | Licence |
|---|---|
| [Bubble Tea](https://github.com/charmbracelet/bubbletea), [Lip Gloss](https://github.com/charmbracelet/lipgloss) | MIT |
| [Cobra](https://github.com/spf13/cobra) | Apache-2.0 |

## In the artwork

The banner (`media/banner.svg`, drawn by `media/banner.py`) embeds subsets of two fonts, both under
the [SIL Open Font License 1.1](https://openfontlicense.org), with their licences in `media/fonts/`:

- [Instrument Serif](https://github.com/Instrument/instrument-serif) — The Instrument Serif Project Authors
- [Geist Mono](https://github.com/vercel/geist-font) — The Geist Project Authors

Power BI, Microsoft Fabric and the names of the AI tools are trademarks of their owners. dashkit is
not affiliated with or endorsed by any of them.
