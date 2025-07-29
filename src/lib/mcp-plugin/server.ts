/* eslint-disable @typescript-eslint/no-explicit-any */

import type { GetPromptResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { BasePayload, CollectionSlug } from 'payload'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import fastify from 'fastify'
import { z } from 'zod'

const getServer = (payload: BasePayload) => {
  // console.error(payload.collections)
  // Create an MCP server with implementation details
  const server = new McpServer(
    {
      name: 'stateless-streamable-http-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        logging: {},
        tools: {
          draw_a_card: {
            description: 'Rolls an N-sided die',
            parameters: {
              sides: { type: 'number', description: 'The number of sides on the die' },
            },
          },
        },
      },
    },
  )

  // Register a simple prompt
  server.prompt(
    'greeting-template',
    'A simple greeting prompt template',
    {
      // @ts-expect-error - zod types are not compatible with mcp-server types
      name: z.string().describe('Name to include in greeting'),
    },
    async ({ name }: { name: string }): Promise<GetPromptResult> => {
      return {
        messages: [
          {
            content: {
              type: 'text',
              text: `Please greet ${name} in a friendly manner.`,
            },
            role: 'user',
          },
        ],
      }
    },
  )

  // Register a tool specifically for testing resumability
  // // @ts-expect-error - zod types are not compatible with mcp-server types
  // server.tool(
  //   'start-notification-stream',
  //   'Starts sending periodic notifications for testing resumability',
  //   {
  //     count: z.number().describe('Number of notifications to send (0 for 100)').default(10),
  //     interval: z.number().describe('Interval in milliseconds between notifications').default(100),
  //   },
  //   async (
  //     { count, interval }: { count: number; interval: number },
  //     { sendNotification }: { sendNotification: any },
  //   ): Promise<CallToolResult> => {
  //     const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  //     let counter = 0

  //     while (count === 0 || counter < count) {
  //       counter++
  //       try {
  //         await sendNotification({
  //           method: 'notifications/message',
  //           params: {
  //             data: `Periodic notification #${counter} at ${new Date().toISOString()}`,
  //             level: 'info',
  //           },
  //         })
  //       } catch (error) {
  //         console.error('Error sending notification:', error)
  //       }
  //       // Wait for the specified interval
  //       await sleep(interval)
  //     }

  //     return {
  //       content: [
  //         {
  //           type: 'text',
  //           text: `Started sending periodic notifications every ${interval}ms`,
  //         },
  //       ],
  //     }
  //   },
  // )

  server.tool('random_post', 'Draws a random post from the database', {}, async () => {
    const { totalDocs } = await payload.count({
      collection: 'posts' as CollectionSlug,
    })
    const randomIndex = Math.floor(Math.random() * totalDocs)

    const posts = await payload.find({
      collection: 'posts' as CollectionSlug,
    })

    const post = posts.docs[randomIndex]

    return {
      content: [{ type: 'text', text: JSON.stringify(post) }],
    }
  })

  // Create a simple resource at a fixed URI
  server.resource(
    'greeting-resource',
    'https://example.com/greetings/default',
    { mimeType: 'text/plain' },
    async (): Promise<ReadResourceResult> => {
      return {
        contents: [
          {
            text: 'Hello, world!',
            uri: 'https://example.com/greetings/default',
          },
        ],
      }
    },
  )
  return server
}

const app = fastify({
  logger: true,
})

// Configure CORS to expose Mcp-Session-Id header for browser-based clients
await app.register(import('@fastify/cors'), {
  exposedHeaders: ['Mcp-Session-Id'],
  origin: '*', // Allow all origins - adjust as needed for production
})

// Start the server
const PORT = 3001
export const startEmbeddedServer = async (payload: BasePayload) => {
  try {
    app.post('/mcp', async (req: FastifyRequest, reply: FastifyReply) => {
      const server = getServer(payload)
      try {
        const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        })
        await server.connect(transport)
        await transport.handleRequest(req.raw, reply.raw, req.body as any)
        reply.raw.on('close', () => {
          console.error('Request closed')
          void transport.close()
          void server.close()
        })
      } catch (error) {
        console.error('Error handling MCP request:', error)
        if (!reply.sent) {
          return reply.status(500).send({
            id: null,
            error: {
              code: -32603,
              message: 'Internal server error',
            },
            jsonrpc: '2.0',
          })
        }
      }
    })

    app.get('/mcp', async (req: FastifyRequest, reply: FastifyReply) => {
      console.error('Received GET MCP request')
      return reply.status(405).send({
        id: null,
        error: {
          code: -32000,
          message: 'Method not allowed.',
        },
        jsonrpc: '2.0',
      })
    })

    app.delete('/mcp', async (req: FastifyRequest, reply: FastifyReply) => {
      console.error('Received DELETE MCP request')
      return reply.status(405).send({
        id: null,
        error: {
          code: -32000,
          message: 'Method not allowed.',
        },
        jsonrpc: '2.0',
      })
    })

    await app.listen({ host: '0.0.0.0', port: PORT })
    console.error(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`)
  } catch (err: any) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Handle server shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down server...')
  await app.close()
  process.exit(0)
})
