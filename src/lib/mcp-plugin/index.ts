import type { CollectionSlug, Config } from 'payload'

// import { startEmbeddedServer } from './server'
import { POST, GET, DELETE } from './endpoints'

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

    // config.endpoints.push({
    //   handler: POST,
    //   method: 'post',
    //   path: '/mcp',
    // })

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
