import { createMcpHandler } from 'mcp-handler'
import { BasePayload, CollectionSlug } from 'payload'
import { z } from 'zod'

// import { startEmbeddedServer } from './server'
export const handler = (payload: BasePayload) =>
  createMcpHandler(
    (server) => {
      server.tool('get_collections', 'Get all collections from payload', {}, async () => {
        const collections = Object.keys(payload.collections)

        return {
          content: [{ type: 'text', text: `Collections: ${collections.join(', ')}` }], // TODO: return a list of collections
        }
      })

      /**
       * Get collection by name
       */
      server.tool(
        'get_collection_by_name',
        'Get collection by name',
        {
          name: z
            .enum(Object.keys(payload.collections) as [CollectionSlug, ...CollectionSlug[]])
            .describe('Name of the collection to get'),
        },
        async ({ name }) => {
          const collection = await payload.find({
            collection: name,
          })

          return {
            content: [{ type: 'text', text: `Collection: ${collection.docs.length} documents` }],
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
