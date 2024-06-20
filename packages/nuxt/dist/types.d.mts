
import type { ModuleOptions } from './module.js'


declare module '@nuxt/schema' {
  interface NuxtConfig { ['vaxee']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['vaxee']?: ModuleOptions }
}

declare module 'nuxt/schema' {
  interface NuxtConfig { ['vaxee']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['vaxee']?: ModuleOptions }
}


export type { ModuleOptions, default } from './module.js'
