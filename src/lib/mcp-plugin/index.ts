import type { Config } from 'payload'
import { handler } from './mcp'
import type { PayloadPluginMcpTestConfig } from './types'

export const payloadPluginMcpTest =
  (pluginOptions: PayloadPluginMcpTestConfig) =>
  (config: Config): Config => {
    const options: Required<Omit<PayloadPluginMcpTestConfig, 'collections'>> & {
      collections: PayloadPluginMcpTestConfig['collections']
    } = {
      apiKey: pluginOptions.apiKey || process.env.MCP_API_KEY || '',
      collections: pluginOptions.collections || 'all',
      defaultOperations: {
        list: true,
        get: true,
        create: false,
        update: false,
        delete: false,
        ...pluginOptions.defaultOperations,
      },
    }

    // Validate API key
    if (!options.apiKey) {
      console.warn(
        'PayloadCMS MCP Plugin: No API key provided. Set MCP_API_KEY environment variable for authentication.',
      )
    }

    if (!config.collections) {
      config.collections = []
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

    config.endpoints.push({
      handler(req) {
        const request = new Request(req.url || '', {
          method: req.method,
          headers: req.headers,
        })

        return handler(req.payload, config, options)(request)
      },
      method: 'get',
      path: '/plugin/mcp',
    })

    config.endpoints.push({
      handler(req) {
        const request = new Request(req.url || '', {
          method: req.method,
          headers: req.headers,
          body: req.body,
          // Fix for: RequestInit: duplex option is required when sending a body.
          // See: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
          ...(req.body ? { duplex: 'half' } : {}),
        })

        return handler(req.payload, config, options)(request)
      },
      method: 'post',
      path: '/plugin/mcp',
    })

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }
    }

    return config
  }
