/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload'
import { analyzeCollection } from './tool-generator'
import type { CollectionMcpConfig, ToolOperations, CollectionAnalysis } from '../types/index'

export const defaultOperations: ToolOperations = {
  list: true,
  get: true,
  create: false,
  update: false,
  delete: false,
}

export function getCollectionsToExpose(
  allCollections: CollectionConfig[],
  collectionsOption: CollectionMcpConfig[] | 'all',
  defaultOperations: ToolOperations,
): CollectionAnalysis[] {
  console.log(collectionsOption)
  if (collectionsOption === 'all') {
    // Return all collections with default operations, properly analyzed
    return allCollections.map((collection) =>
      analyzeCollection(collection, {
        operations: defaultOperations,
      }),
    )
  }

  // Process configured collections
  const result: CollectionAnalysis[] = []

  for (const configItem of collectionsOption) {
    let collection: CollectionConfig
    let mcpOptions: any = {}

    if ('collection' in configItem && 'options' in configItem) {
      // { collection: CollectionConfig, options: CollectionMcpOptions }
      collection = configItem.collection
      mcpOptions = {
        operations: { ...defaultOperations, ...configItem.options.operations },
        ...configItem.options,
      }
    } else {
      // Direct CollectionConfig
      collection = configItem as CollectionConfig
      mcpOptions = {
        operations: defaultOperations,
      }
    }

    // Find the collection in allCollections to ensure it's registered
    const registeredCollection = allCollections.find((c) => c.slug === collection.slug)
    if (registeredCollection) {
      // Use the registered collection for analysis to ensure we have the complete config
      result.push(analyzeCollection(registeredCollection, mcpOptions))
    } else {
      console.warn(
        `PayloadCMS MCP Plugin: Collection '${collection.slug}' not found in registered collections`,
      )
    }
  }

  return result
}
