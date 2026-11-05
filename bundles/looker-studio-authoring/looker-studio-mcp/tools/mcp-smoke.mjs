// Starts a built server over stdio and checks it answers the MCP handshake:
// initialize, then tools/list, prompts/list and resources/list. No browser
// needed — a server that cannot even list its tools fails here, before a user
// ever sees it.
//
//   node tools/mcp-smoke.mjs [path/to/index.js]   (default: dist/index.js)
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const entry = resolve(process.argv[2] ?? join(root, 'dist', 'index.js'));

const client = new Client({ name: 'smoke', version: '0.0.0' });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [entry], env: { ...process.env }, stderr: 'ignore' }));
const { tools } = await client.listTools();
const { prompts } = await client.listPrompts();
const { resources } = await client.listResources();
const skill = resources.find((r) => r.uri === 'skill://ls-kpi-scorecards');
const text = skill ? (await client.readResource({ uri: skill.uri })).contents[0].text : '';
await client.close();

const problems = [];
if (tools.length === 0) problems.push('no tools');
if (prompts.length === 0) problems.push('no prompts');
if (!text.startsWith('# Skill:')) problems.push(`skill resource unreadable: ${String(text).slice(0, 80)}`);
console.log(`${entry}: ${tools.length} tools, ${prompts.length} prompts, ${resources.length} resources`);
if (problems.length) {
  console.error('FAIL: ' + problems.join('; '));
  process.exit(1);
}
