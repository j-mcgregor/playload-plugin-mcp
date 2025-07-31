import type { CollectionSlug, Config } from 'payload'
import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

// import { startEmbeddedServer } from './server'
const handler = createMcpHandler(
  (server) => {
    server.tool(
      'roll_dice',
      'Rolls an N-sided die',
      {
        sides: z.number().int().min(2),
      },
      async ({ sides }) => {
        const value = 1 + Math.floor(Math.random() * sides)
        return {
          content: [{ type: 'text', text: `🎲 You rolled a ${value}!` }],
        }
      },
    )
  },
  {
    // Optional server options
  },
  {
    // Optional redis config
    // redisUrl: process.env.REDIS_URL,
    basePath: '/api/plugin', // this needs to match where the [transport] (mcp) is located.
    maxDuration: 60,
    verboseLogs: true,
  },
)

export type PayloadPluginMcpTestConfig = {
  /**
   * List of collections to add a custom field
   */
  collections?: Partial<Record<CollectionSlug, true>>
  disabled?: boolean
  /**
   * MCP server configuration
   */
  mcp?: {
    /**
     * API key for authentication
     */
    apiKey?: string
    /**
     * Output path for MCP config file
     */
    configPath?: string
    /**
     * PayloadCMS URL for API access
     */
    payloadUrl?: string
    /**
     * Port for sidecar server (ignored for embedded)
     */
    port?: number
    /**
     * Server type: 'embedded' (runs within Payload process) or 'sidecar' (runs as separate executable)
     */
    type: 'embedded' | 'sidecar'
  }
}

export const payloadPluginMcpTest =
  (pluginOptions: PayloadPluginMcpTestConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = []
    }

    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.endpoints) {
      config.endpoints = []
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    // config.endpoints.push({
    //   handler: (req) => {
    //     return new Response('Hello, world!')
    //   },
    //   method: 'get',
    //   path: '/test',
    // })

    // payload custom endpoints can't be dynamic like nextjs api routes eg /api/mcp/[transport]
    // but a transport is either HTTP or SSE
    // config.endpoints.push({
    //   handler: MCP,
    //   method: 'post',
    //   path: '/plugin-mcp/http',
    // })

    // config.endpoints.push({
    //   handler: MCP,
    //   method: 'post',
    //   path: '/plugin-mcp/sse',
    // })

    config.endpoints.push({
      async handler(req) {
        // req is a PayloadRequest but to use the remote-mcp it needs to be a Request
        // so we need to convert it to a Request
        const request = new Request(req.url || '', {
          method: req.method,
          headers: req.headers,
        })

        const response = await handler(request)

        return response
      },
      method: 'get',
      path: '/plugin/mcp',
    })

    config.endpoints.push({
      async handler(req) {
        // req is a PayloadRequest but to use the remote-mcp it needs to be a Request
        // so we need to convert it to a Request
        const request = new Request(req.url || '', {
          method: req.method,
          headers: req.headers,
          body: req.body,
          // Fix for: RequestInit: duplex option is required when sending a body.
          // See: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
          ...(req.body ? { duplex: 'half' } : {}),
        })

        return await handler(request)
      },
      method: 'post',
      path: '/plugin/mcp',
    })

    // config.endpoints.push({
    //   handler: GET,
    //   method: 'get',
    //   path: '/mcp',
    // })

    // config.endpoints.push({
    //   handler: DELETE,
    //   method: 'delete',
    //   path: '/mcp',
    // })

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      // Start MCP server based on configuration
      // const mcpConfig = pluginOptions.mcp || { type: 'embedded' }

      // if (mcpConfig.type === 'embedded') {
      //   await startEmbeddedServer(payload)
      // }
    }

    return config
  }
