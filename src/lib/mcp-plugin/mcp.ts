import { createMcpHandler } from 'mcp-handler'
import { BasePayload, Config } from 'payload'
import { baseTools } from './tools/base-tools'
import { defaultOperations, getCollectionsToExpose } from './utils/get-collections-to-expose'
import { executeTool, generateToolDescriptors } from './utils/tool-generator'
import type { PayloadPluginMcpTestConfig } from './types'
import { z, ZodRawShape, ZodTypeAny } from 'zod'

export const handler = (
  payload: BasePayload,
  config: Config,
  options: PayloadPluginMcpTestConfig,
) =>
  createMcpHandler(
    (server) => {
      baseTools(server, payload)

      const collectionsToExpose = getCollectionsToExpose(
        config.collections || [],
        options.collections || 'all',
        options.defaultOperations || defaultOperations,
      )

      // Generate tool descriptors from collections
      const toolDescriptors = generateToolDescriptors(collectionsToExpose)

      // map over toolDescriptors and add them to the server
      toolDescriptors.forEach((toolDescriptor) => {
        server.tool(
          toolDescriptor.name,
          toolDescriptor.description,
          toolDescriptor.inputSchema as ZodRawShape,
          async (input: z.objectOutputType<ZodRawShape, ZodTypeAny>) => {
            const result = await executeTool(toolDescriptor, input, payload)
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
