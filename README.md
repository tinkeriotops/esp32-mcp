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
