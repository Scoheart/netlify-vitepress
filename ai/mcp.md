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
