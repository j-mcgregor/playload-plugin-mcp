/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload'

// JSONSchema7 type definition (since json-schema package doesn't have proper types)
export interface JSONSchema7 {
  type?: string | string[]
  properties?: Record<string, JSONSchema7>
  items?: JSONSchema7
  required?: string[]
  enum?: any[]
  oneOf?: JSONSchema7[]
  description?: string
  format?: string
  minimum?: number
  maximum?: number
  minItems?: number
  maxItems?: number
  default?: any
  examples?: any[]
  additionalProperties?: boolean | JSONSchema7
  [key: string]: any
}

export interface ToolDescriptor {
  name: string
  description: string
  inputSchema: JSONSchema7
  outputSchema: JSONSchema7
  collection: string
  operation: ToolOperation
}

export type ToolOperation = 'list' | 'get' | 'create' | 'update' | 'delete'

export interface ToolOperations {
  list?: boolean
  get?: boolean
  create?: boolean
  update?: boolean
  delete?: boolean
}

// Collection-specific configuration
export interface CollectionMcpOptions {
  /**
   * Operations to enable for this collection
   */
  operations?: ToolOperations
  /**
   * Custom tool naming prefix (defaults to collection slug)
   */
  toolPrefix?: string
  /**
   * Custom description for this collection's tools
   */
  description?: string
  /**
   * Fields to exclude from schemas
   */
  excludeFields?: string[]
  /**
   * Additional metadata for this collection
   */
  metadata?: Record<string, any>
}

// Collection configuration can be either:
// 1. Direct collection config
// 2. Object with collection and options
export type CollectionMcpConfig =
  | CollectionConfig
  | {
      collection: CollectionConfig
      options: CollectionMcpOptions
    }

// Collection field analysis (updated to include options)
export interface FieldAnalysis {
  name: string
  type: string
  required: boolean
  hasDefault: boolean
  description?: string
  options?: any[]
  validation?: any
}

export interface CollectionAnalysis {
  slug: string
  fields: FieldAnalysis[]
  hasUpload: boolean
  hasAuth: boolean
  timestamps: boolean
  mcpOptions?: CollectionMcpOptions
}

export type PayloadPluginMcpTestConfig = {
  /**
   * Collections to expose via MCP tools
   * Can be:
   * - 'all' to expose all collections with default operations
   * - Array of CollectionConfig (imported collections)
   * - Array of { collection: CollectionConfig, options: CollectionMcpOptions }
   */
  collections?: CollectionMcpConfig[] | 'all'
  /**
   * API key for authentication
   */
  apiKey: string
  /**
   * Default operations to enable for all collections
   */
  defaultOperations?: ToolOperations
}
