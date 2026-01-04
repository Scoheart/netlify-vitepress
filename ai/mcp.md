# MCP

## MCP Server 和 Tools

- MCP Server 是容器和运行环境
- Tools 是具体的功能和能力

## 实现一个简单 MCP server

安装依赖

::: code-group

```bash [npm]
npm install @modelcontextprotocol/sdk
```

```bash [pnpm]
pnpm add @modelcontextprotocol/sdk
```

```bash [yarn]
yarn add @modelcontextprotocol/sdk
```

```bash [bun]
bun add @modelcontextprotocol/sdk
```

:::

```js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// 1. 初始化服务器
const server = new McpServer({
  name: "qq-mcp-server",
  version: "1.0.0",
});

// 2. 注册工具: send_message_to_someone
server.registerTool(
  "send_message_to_someone",
  {
    inputSchema: {
      to: {
        type: "string",
        description: "消息接收者",
      },
      message: {
        type: "string",
        description: "消息内容",
      },
    },
  },
  async (input) => {
    console.error(`[Mock] Sending message to ${input.to}: ${input.message}`);
    return {
      content: [{ type: "text", text: `已经发送消息给 ${input.to}` }],
    };
  },
);

// 3. 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("QQ Mock MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
```

## Agent 工具如何使用 MCP Server

不同的 AI agent 工具都可以通过集成 MCP Server，来扩展它们的能力。

### Claude Code

**推荐方式：使用 CLI 命令**

```bash
# 添加 MCP 服务器（用户级别）
claude mcp add your-server --scope user

# 添加 MCP 服务器（项目级别）
claude mcp add your-server --scope project

# 列出已配置的服务器
claude mcp list

# 移除服务器
claude mcp remove your-server
```

**手动配置文件方式**

在项目根目录创建 `.mcp.json` (项目级别) 或编辑 `~/.claude.json` (用户级别)：

```json
{
  "mcpServers": {
    "your-mcp-server": {
      "command": "node",
      "args": ["/path/to/your/mcp-server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

支持三种作用域：

- `user`: 跨多个项目的个人工具
- `project`: 团队共享的项目特定工具
- `local`: 个人实验性配置或敏感凭证

### Cursor

**通过设置界面**

1. 打开 Cursor，进入 Settings → Developer → Edit Config
2. 选择 MCP Tools，点击 Add Custom MCP
3. 或使用快捷键 `Cmd/Ctrl + Shift + P` 搜索 "Cursor Settings"

**配置文件方式**

编辑 `~/.cursor/mcp.json` (全局) 或 `.cursor/mcp.json` (项目)：

```json
{
  "mcpServers": {
    "your-mcp-server": {
      "command": "npx",
      "args": ["-y", "mcp-server"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

**注意事项**：

- Cursor 默认只会向 Agent 发送前 40 个工具
- 支持 OAuth 认证
- 可以设置 auto-run 允许 Agent 自动运行 MCP 工具

### Gemini CLI

**推荐方式：使用 CLI 命令**

```bash
# 添加 MCP 服务器（用户级别）
gemini mcp add your-server --scope user

# 添加 MCP 服务器（项目级别）
gemini mcp add your-server --scope project

# 在会话中查看 MCP 服务器
/mcp
```

**使用 FastMCP (v2.12.3+)**

```bash
# 自动安装和配置 FastMCP 服务器
fastmcp install gemini-cli
```

**手动配置文件方式**

编辑 `~/.gemini/settings.json` (用户级别) 或 `.gemini/settings.json` (项目级别)：

```json
{
  "mcpServers": {
    "your-mcp-server": {
      "command": "node",
      "args": ["/path/to/your/mcp-server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

支持 OAuth 2.0 认证和 SSE/HTTP 传输方式。

### Codex CLI

**使用 CLI 命令**

```bash
# 管理 MCP 服务器配置
codex mcp add your-server
codex mcp list
codex mcp remove your-server
```

**配置文件方式**

编辑 `~/.codex/config.toml` (**注意：使用 TOML 格式，不是 JSON**)：

```toml
[mcp_servers.your-mcp-server]
command = "node"
args = ["/path/to/your/mcp-server.js"]

[mcp_servers.your-mcp-server.env]
API_KEY = "your-api-key"
```

Codex 会在会话启动时自动启动配置的 MCP 服务器，支持 STDIO 和 streaming HTTP 传输方式。

**常见 MCP 服务器**：

- Context7：访问最新开发者文档
- Figma Local/Remote：访问 Figma 设计
- Playwright：控制和检查浏览器
- Chrome Developer Tools：控制和检查 Chrome

### Antigravity

**通过 UI 界面**

1. 打开 Antigravity，进入 Agent 窗口
2. 点击下拉菜单，选择 "MCP servers"
3. 点击 "Manage MCP Servers"
4. 选择 "View raw config" 编辑配置

**配置文件方式**

编辑 `mcp_config.json`：

```json
{
  "mcpServers": {
    "your-mcp-server": {
      "command": "node",
      "args": ["/path/to/your/mcp-server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

**使用预构建的 MCP 服务器**

Antigravity 提供了 MCP Store，可以直接安装预构建的服务器：

- Firebase
- AlloyDB for PostgreSQL
- BigQuery
- Spanner
- Cloud SQL
- Looker

在 MCP Store 中搜索并点击 Install 即可。

### 通用配置说明

所有 MCP 服务器配置都遵循类似的模式：

- `command`: 启动 MCP 服务器的命令（如 `node`、`python`、`npx` 或可执行文件路径）
- `args`: 传递给命令的参数数组
- `env`: (可选) 环境变量对象，用于传递 API keys 等敏感信息
- `enabled`/`disabled`: (可选) 控制是否启用该服务器

**传输方式**：

- **STDIO**: 本地开发，通过标准输入输出通信
- **SSE (Server-Sent Events)**: 分布式团队，基于 HTTP 的单向流
- **HTTP**: 支持双向通信的 HTTP 传输

配置完成后，重启对应的 agent 工具，MCP 服务器提供的 tools 就会自动加载并可供 AI 使用。
