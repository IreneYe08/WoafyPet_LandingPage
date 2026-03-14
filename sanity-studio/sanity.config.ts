import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'WoafyPet Blog',

  projectId: 'jf3pfn1g',
  dataset: 'articles',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
