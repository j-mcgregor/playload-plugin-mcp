import type { PayloadRequest } from 'payload'
import { getServer } from './server'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

export const MCP = async (req: PayloadRequest) => {
  const server = getServer(req.payload)
  try {
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    })
    await server.connect(transport)
    return Response.json({
      message: 'MCP server connected',
      jsonrpc: '2.0',
    })
  } catch (error) {
    console.error('Error handling MCP request:', error)
    return Response.json({
      message: 'MCP server connected',
      jsonrpc: '2.0',
    })
  }
}

// // SSE specific types
// export interface SseEvent {
//   event?: string
//   data: string
//   id?: string
//   retry?: number
// }
// /**
//  * Format an SSE event
//  */
// function formatSseEvent(event: SseEvent): string {
//   let formatted = ''

//   if (event.event) {
//     formatted += `event: ${event.event}\n`
//   }

//   if (event.id) {
//     formatted += `id: ${event.id}\n`
//   }

//   if (event.retry) {
//     formatted += `retry: ${event.retry}\n`
//   }

//   formatted += `data: ${event.data}\n\n`

//   return formatted
// }

// /**
//  * Handle Server-Sent Events endpoint for HTTP transport
//  */
// export async function handleSSE(req: PayloadRequest, config: any): Promise<Response> {
//   const headers = {
//     'Content-Type': 'text/event-stream',
//     'Cache-Control': 'no-cache',
//     Connection: 'keep-alive',
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'Cache-Control',
//   }

//   const encoder = new TextEncoder()

//   const stream = new ReadableStream({
//     start(controller) {
//       // Send initial endpoint event
//       const endpointUrl = `http://${req.headers.get('host')}/mcp/invoke`
//       const endpointEvent: SseEvent = {
//         event: 'endpoint',
//         data: JSON.stringify({ uri: endpointUrl }),
//       }

//       controller.enqueue(encoder.encode(formatSseEvent(endpointEvent)))

//       // Send server capabilities
//       const initResponse = {
//         protocolVersion: '2024-11-05',
//         capabilities: {
//           tools: {
//             listChanged: false,
//           },
//         },
//         serverInfo: {
//           name: config.serverName,
//           version: '1.0.0',
//         },
//       }

//       const messageEvent: SseEvent = {
//         event: 'message',
//         data: JSON.stringify({
//           jsonrpc: '2.0',
//           method: 'initialize',
//           result: initResponse,
//         }),
//       }

//       controller.enqueue(encoder.encode(formatSseEvent(messageEvent)))

//       // Keep connection alive with periodic ping
//       const keepAlive = setInterval(() => {
//         try {
//           const pingEvent: SseEvent = {
//             event: 'ping',
//             data: JSON.stringify({ timestamp: Date.now() }),
//           }
//           controller.enqueue(encoder.encode(formatSseEvent(pingEvent)))
//         } catch (error) {
//           clearInterval(keepAlive)
//           controller.close()
//         }
//       }, 30000) // 30 seconds

//       // Clean up on close
//       req.signal?.addEventListener('abort', () => {
//         clearInterval(keepAlive)
//         controller.close()
//       })
//     },
//   })

//   return new Response(stream, { headers })
// }

// export const POST = async (req: PayloadRequest) => {
//   const server = getServer(req.payload)
//   try {
//     const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
//       sessionIdGenerator: undefined,
//     })
//     await server.connect(transport)
//     console.log('Connected to MCP server')

//     // return handleSSE(req, server)
//     return Response.json({
//       message: 'MCP server connected',
//       jsonrpc: '2.0',
//     })
//   } catch (error) {
//     console.error('Error handling MCP request:', error)
//     // if (!reply.sent) {
//     //   return reply.status(500).send({
//     //     id: null,
//     //     error: {
//     //       code: -32603,
//     //       message: 'Internal server error',
//     //     },
//     //     jsonrpc: '2.0',
//     //   })
//     // }

//     return Response.json({
//       id: 1,
//       result: {
//         message: 'MCP server connected',
//       },
//       jsonrpc: '2.0',
//     })
//   }
// }

// export const GET: PayloadHandler = async ({ payload, body }) => {
//   const server = getServer(payload)
//   try {
//     const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
//       sessionIdGenerator: undefined,
//     })
//     await server.connect(transport)

//     return Response.json({
//       id: 1,
//       result: {
//         message: 'MCP server connected',
//       },
//       jsonrpc: '2.0',
//     })
//   } catch (error) {
//     console.error('Error handling MCP request:', error)
//     return Response.json({
//       id: null,
//       error: {
//         code: -32603,
//         message: 'Internal server error',
//       },
//       jsonrpc: '2.0',
//     })
//   }
// }

// export const DELETE: PayloadHandler = async ({ payload, body }) => {
//   const server = getServer(payload)
//   try {
//     const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
//       sessionIdGenerator: undefined,
//     })
//     await server.connect(transport)

//     return Response.json({
//       id: 1,
//       result: {
//         message: 'MCP server connected',
//       },
//       jsonrpc: '2.0',
//     })
//   } catch (error) {
//     console.error('Error handling MCP request:', error)
//     return Response.json({
//       id: null,
//       error: {
//         code: -32603,
//         message: 'Internal server error',
//       },
//       jsonrpc: '2.0',
//     })
//   }
// }
