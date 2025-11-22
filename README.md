# ESP32 MCP Server — Connect LLMs with IoT Devices

A lightweight **Model Context Protocol (MCP)** bridge that lets **large language models (LLMs)** directly communicate with an **ESP32** running **Tasmota** or similar firmware.

This project demonstrates how an AI assistant (like ChatGPT or Copilot) can **reason about user intent** and execute physical actions — such as toggling relays or reading sensors — in real time, using standard HTTP commands.

---

## 📖 Overview

Traditional IoT automation relies on fixed rules, MQTT topics, or REST endpoints.  
This project replaces all that with a simple concept:

> **The LLM talks to your ESP32 through a universal protocol — MCP.**

No firmware rebuilds, no MQTT brokers, no cloud dependencies.  
Just plain human language turned into structured, executable commands.

You can read the full article here:  
👉 **[Connecting LLMs and IoT: How an ESP32 Can Speak MCP and Follow AI Commands](https://tinkeriot.com/esp32-mcp-llm-ai-integration)**

And watch the walkthrough video:  
🎥 **[ESP32 + MCP + LLM Integration Demo](https://www.youtube.com/watch?v=NOaVn795Aic)**

---

## 🧠 What It Does

- Bridges **MCP (Model Context Protocol)** and your ESP32 firmware (e.g., **Tasmota**)
- Exposes a single tool: `tasmota-cmd`, letting LLMs send commands like:
  ```bash
  /tasmota-cmd {"command": "Power1 1"}
  ```
- Works locally — no API keys or external services required
- Compatible with **Visual Studio Code Copilot Chat** or any LLM supporting MCP

---

## ⚙️ How It Works

```
LLM (Copilot/ChatGPT)
        ↓
     MCP Protocol
        ↓
 Node.js MCP Server
        ↓
  ESP32 (Tasmota)
```

The MCP server receives structured requests, converts them into Tasmota commands (e.g. `Power1 ON`, `Backlog PulseTime1 400; Power1 1`), and sends them via HTTP to your ESP32 device.  
The responses are returned to the model as plain text for reasoning and follow-up actions.

---

## 🚀 Quick Start

### 1. Clone this repo
```bash
git clone https://github.com/<your-username>/esp32-mcp-server.git
cd esp32-mcp-server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure your device IP
Edit the constant inside `index.js`:
```js
const DEVICE_IP = "192.168.1.xxx";
```

### 4. Run the server
```bash
node index.js
```

You’ll see output similar to:
```
MCP HTTP server:  http://localhost:3000/mcp
Health:           http://localhost:3000/health
Debug:            http://localhost:3000/debug?command=Power1%201
```

---

## 💬 MCP Server in VS Code

To connect with **GitHub Copilot Chat** or compatible tools, add this configuration in your `.config/github-copilot/` file:

```json
{
  "servers": {
    "esp32-mcp": {
      "url": "http://localhost:3000/mcp",
      "type": "http"
    }
  }
}
```

Reload Copilot, and you’ll see your new MCP tool:
```bash
/tasmota-cmd {"command": "Power1 1"}
```

---

## 🧩 Dependencies

- Node.js 18+  
- `@modelcontextprotocol/sdk`  
- `express`  
- `zod`

---

## 🧰 Compatible Firmwares

| Firmware | Compatibility | Notes |
|-----------|----------------|-------|
| **Tasmota** | ✅ | Full command support (HTTP, MQTT, Serial) |
| **ESP-AT** | ⚙️ | Limited GPIO access (requires Driver AT build) |
| **ESPHome** | ⚠️ | Static configuration — not ideal for real-time control |

---

## 📺 Reference & Resources

- 📰 [Full Article on Tinkeriot.com](https://tinkeriot.com/esp32-mcp-llm-ai-integration)  
- 🎥 [YouTube Demo — ESP32 + MCP + LLM Integration](https://www.youtube.com/watch?v=NOaVn795Aic)  
- 📘 [Tasmota Commands Documentation](https://tasmota.github.io/docs/Commands/)  
- 🧩 [Model Context Protocol (MCP) SDK](https://github.com/modelcontextprotocol)

---

## 🧠 Concept Summary

This project proves that **intelligence in IoT doesn’t need more APIs — it needs context**.

By combining:
- **Tasmota’s readable command interface**,  
- **MCP’s standardized AI communication layer**, and  
- **ESP32’s hardware flexibility**,  

you get a device that can understand and act on intent, not just follow hardcoded rules.

---

## 📜 License

MIT License © 2025 [Your Name or tinkeriot.com]
