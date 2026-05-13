import type { CollectionConfig } from 'payload'
import { isAdminOrSuperAdmin } from '../access/isAdminOrSuperAdmin'

export const ServiceCategories: CollectionConfig = {
  slug: 'service-categories',
  labels: {
    singular: 'Κατηγορία Υπηρεσίας',
    plural: 'Κατηγορίες Υπηρεσιών',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Ρυθμίσεις',
    defaultColumns: ['name', 'slug'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: isAdminOrSuperAdmin,
    update: isAdminOrSuperAdmin,
    delete: isAdminOrSuperAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.name && !data?.slug) {
          data.slug = data.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\p{L}\p{N}-]+/gu, '')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Όνομα Κατηγορίας',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Δημιουργείται αυτόματα από το όνομα.',
      },
    },
  ],
}
