import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Χρήστης',
    plural: 'Χρήστες',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Διαχείριση',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Ονοματεπώνυμο',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Ρόλος',
      required: true,
      defaultValue: 'admin',
      saveToJWT: true,
      options: [
        { label: 'Super Admin', value: 'superadmin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Πελάτης', value: 'client' },
      ],
      access: {
        update: ({ req: { user } }) => (user as any)?.role === 'superadmin',
      },
    },
  ],
}
