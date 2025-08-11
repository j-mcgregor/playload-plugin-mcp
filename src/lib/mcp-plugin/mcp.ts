import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import { BasePayload, Config } from 'payload'
// import { baseTools } from './tools/base-tools'
import { defaultOperations, getCollectionsToExpose } from './utils/get-collections-to-expose'
import { executeTool, generateToolDescriptors } from './utils/tool-generator'
import type { PayloadPluginMcpTestConfig } from './types'
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'

export const handler = (
  payload: BasePayload,
  config: Config,
  options: PayloadPluginMcpTestConfig,
) =>
  createMcpHandler(
    (server) => {
      // baseTools(server, payload)

      const collectionsToExpose = getCollectionsToExpose(
        config.collections || [],
        options.collections || 'all',
        options.defaultOperations || defaultOperations,
      )

      // Generate tool descriptors from collections
      const toolDescriptors = generateToolDescriptors(collectionsToExpose)
      // map over toolDescriptors and add them to the server
      toolDescriptors.forEach((tool) => {
        if (tool.name === 'posts_create') {
          console.log('tool', tool)
        }

        // server.registerTool(
        //   tool.name,
        //   {
        //     title: tool.name,
        //     description: tool.description,
        //     inputSchema: tool.inputSchema,
        //     outputSchema: tool.outputSchema,
        //   },
        //   async (input: unknown) => {
        //     console.log('input', input)

        //     const result = await executeTool(tool, input, payload)
        //     return {
        //       content: [{ type: 'text', text: JSON.stringify(result) }],
        //     }
        //   },
        // )
        server.tool(
          tool.name,
          tool.description,
          {
            collection: tool.collection,
            data: tool.outputSchema.properties,
          },
          async (input: unknown) => {
            // console.log('inputSchema', tool.inputSchema)
            // console.log('outputSchema', tool.outputSchema)
            console.log('input', input)

            const result = await executeTool(tool, input, payload)
            return {
              content: [{ type: 'text', text: JSON.stringify(result) }],
            }
          },
        )
      })
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

// Wrap your handler with authorization
const verifyToken = async (req: Request, bearerToken?: string): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined

  // Replace this example with actual token verification logic
  // Return an AuthInfo object if verification succeeds
  // Otherwise, return undefined
  const isValid = bearerToken === process.env.MCP_API_KEY

  if (!isValid) return undefined

  return {
    token: bearerToken,
    scopes: ['read:all'], // Add relevant scopes
    clientId: 'mcp-plugin', // Add user/client identifier
    extra: {
      // Optional extra information
      userId: 'mcp-plugin',
    },
  }
}

// Make authorization required
export const authHandler = (_handler: ReturnType<typeof handler>) =>
  withMcpAuth(_handler, verifyToken, {
    required: true, // Make auth required for all requests
    // requiredScopes: ['read:stuff'], // Optional: Require specific scopes
    // resourceMetadataPath: '/.well-known/oauth-protected-resource', // Optional: Custom metadata path
  })
