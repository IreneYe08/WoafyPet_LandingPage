import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'jf3pfn1g',
  dataset: 'articles',
  apiVersion: '2024-01-01',
  useCdn: true,
})