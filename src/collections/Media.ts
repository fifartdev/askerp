import type { CollectionConfig } from 'payload'
import { isAdminOrSuperAdmin } from '../access/isAdminOrSuperAdmin'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Αρχείο',
    plural: 'Αρχεία',
  },
  admin: {
    group: 'Σύστημα',
  },
  access: {
    read: () => true,
    create: isAdminOrSuperAdmin,
    update: isAdminOrSuperAdmin,
    delete: isAdminOrSuperAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Εναλλακτικό Κείμενο',
    },
  ],
  upload: true,
}
