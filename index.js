#!/usr/bin/env node
import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

// --- Config ---
const PORT = process.env.PORT || 3000;
const FETCH_TIMEOUT_MS = 4000; // 4s
const DEVICE_IP = "192.168.1.212"; // <— hardcoded device IP

// Small helper with timeout
async function fetchWithTimeout(url, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
        const resp = await fetch(url, { signal: ctrl.signal });
        const text = await resp.text();
        return { ok: true, text, status: resp.status };
    } catch (e) {
        return { ok: false, error: e.message || String(e) };
    } finally {
        clearTimeout(t);
    }
}

// Create high-level MCP server
const server = new McpServer({ name: "tasmota-mcp", version: "0.4.0" });

// Register tool (no IP parameter now)
server.registerTool(
    "tasmota-cmd",
    {
        description: "Send a Tasmota command to the ESP32 via HTTP. Example: Backlog PulseTime1 400; Power1 1",
        inputSchema: z.object({
            command: z.string().describe("Tasmota command string")
        })
    },
    async ({ command }) => {
        console.log(`[tool] tasmota.cmd start ip=${DEVICE_IP} cmd=${command}`);

        const url = `http://${DEVICE_IP}/cm?cmnd=${encodeURIComponent(command)}`;
        const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);

        if (!res.ok) {
            console.log(`[tool] fetch error: ${res.error}`);
            return {
                content: [{ type: "text", text: `Error contacting device: ${res.error}` }],
                isError: true
            };
        }

        console.log(`[tool] tasmota.cmd done status=${res.status} body=${res.text}`);
        return { content: [{ type: "text", text: res.text }] };
    }
);

// Quick reference body
const TASMOTA_QR_MD = `
# Tasmota Quick Reference (ESP32)

## Power
- \`Power1 1\` — ON
- \`Power1 0\` — OFF
- \`Power1 TOGGLE\` — toggle

## Timers
- \`PulseTime1 <val>\`
  - >11.1s encoded as 100 + seconds (e.g., 400 = 300s = 5 min)

## Backlog
- \`Backlog PulseTime1 400; Power1 1\`

## HTTP
- \`http://<device-ip>/cm?cmnd=<url-encoded-command>\`

## Official docs
- Commands: https://tasmota.github.io/docs/Commands/
- Rules: https://tasmota.github.io/docs/Rules/
- HTTP: https://tasmota.github.io/docs/Commands/#http
- Template/GPIO: https://tasmota.github.io/docs/Template-and-GPIO/
`.trim();

// 1) Embedded text resource
server.registerResource(
    "tasmota://quickref",
    {
        title: "Tasmota Quick Reference",
        description: "Common commands and patterns for this device.",
        mimeType: "text/markdown"
    },
    async () => ({
        contents: [
            { uri: "tasmota://quickref", mimeType: "text/markdown", text: TASMOTA_QR_MD }
        ]
    })
);

// 2) External link resources
server.registerResource(
    "https://tasmota.github.io/docs/Commands/",
    { title: "Tasmota Commands" },
    async () => ({ contents: [{ uri: "https://tasmota.github.io/docs/Commands/" }] })
);

server.registerResource(
    "https://tasmota.github.io/docs/Rules/",
    { title: "Tasmota Rules" },
    async () => ({ contents: [{ uri: "https://tasmota.github.io/docs/Rules/" }] })
);

server.registerResource(
    "https://tasmota.github.io/docs/Commands/#http",
    { title: "Tasmota HTTP API" },
    async () => ({ contents: [{ uri: "https://tasmota.github.io/docs/Commands/#http" }] })
);

server.registerResource(
    "https://tasmota.github.io/docs/Template-and-GPIO/",
    { title: "Templates and GPIO Mapping" },
    async () => ({ contents: [{ uri: "https://tasmota.github.io/docs/Template-and-GPIO/" }] })
);

// Streamable HTTP transport
const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    enableDnsRebindingProtection: true
});
await server.connect(transport);

// Express app
const app = express();

// (Optional) CORS / preflight
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return res.end();
    next();
});

// MCP endpoint (Streamable HTTP spec: POST to init; GET for SSE)
app.all("/mcp", async (req, res) => {
    try {
        await transport.handleRequest(req, res);
    } catch (e) {
        if (!res.headersSent) {
            res
                .writeHead(500, { "Content-Type": "application/json" })
                .end(JSON.stringify({
                    jsonrpc: "2.0",
                    error: { code: -32000, message: `Internal error: ${e.message}` },
                    id: null
                }));
        }
    }
});

// Health + debug
app.get("/health", (req, res) => res.json({ ok: true }));

// Debug direct device call (defaults to hardcoded IP)
app.get("/debug", async (req, res) => {
    const ip = req.query.ip || DEVICE_IP;
    const command = req.query.command;
    if (!command) return res.status(400).json({ error: "missing command" });
    const url = `http://${ip}/cm?cmnd=${encodeURIComponent(command)}`;
    const out = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    res.json({ url, ...out });
});

app.listen(PORT, () => {
    console.log(`MCP HTTP server:  http://localhost:${PORT}/mcp`);
    console.log(`Health:           http://localhost:${PORT}/health`);
    console.log(`Debug:            http://localhost:${PORT}/debug?command=Power1%201`);
});
