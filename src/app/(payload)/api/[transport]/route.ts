// app/api/[transport]/route.ts
import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

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
    basePath: '/api', // this needs to match where the [transport] is located.
    maxDuration: 60,
    verboseLogs: true,
  },
)

const GET = async (req: Request, { params }: { params: Promise<{ transport: string }> }) => {
  const { transport } = await params
  console.log(transport)
  return handler(req)
}

const POST = async (req: Request, { params }: { params: Promise<{ transport: string }> }) => {
  const { transport } = await params
  console.log(transport)
  return handler(req)
}

export { GET, POST }
