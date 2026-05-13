import type { CollectionConfig } from 'payload'
import { isAdminOrSuperAdmin } from '../access/isAdminOrSuperAdmin'

export const Clients: CollectionConfig = {
  slug: 'clients',
  labels: {
    singular: 'Πελάτης',
    plural: 'Πελάτες',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Διαχείριση',
    defaultColumns: ['name', 'mobile', 'landline'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as any).role
      if (role === 'superadmin' || role === 'admin') return true
      if (role === 'client') return { linkedUser: { equals: user.id } }
      return false
    },
    create: isAdminOrSuperAdmin,
    update: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as any).role
      return role === 'superadmin' || role === 'admin'
    },
    delete: isAdminOrSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Ονοματεπώνυμο / Επωνυμία',
      required: true,
    },
    {
      name: 'landline',
      type: 'text',
      label: 'Σταθερό Τηλέφωνο',
    },
    {
      name: 'mobile',
      type: 'text',
      label: 'Κινητό Τηλέφωνο',
    },
    {
      name: 'location',
      type: 'group',
      label: 'Τοποθεσία',
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Διεύθυνση',
          admin: {
            components: {
              Field: '/components/MapPickerField#MapPickerField',
            },
          },
        },
        {
          name: 'lat',
          type: 'number',
          label: 'Γεωγραφικό Πλάτος',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'lng',
          type: 'number',
          label: 'Γεωγραφικό Μήκος',
          admin: {
            hidden: true,
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Σημειώσεις',
      access: {
        update: ({ req: { user } }) => {
          const role = (user as any)?.role
          return role === 'superadmin' || role === 'admin'
        },
      },
    },
    {
      name: 'linkedUser',
      type: 'relationship',
      label: 'Λογαριασμός Χρήστη',
      relationTo: 'users',
      hasMany: false,
      admin: {
        description: 'Ο λογαριασμός σύνδεσης του πελάτη (για μελλοντική χρήση).',
      },
      access: {
        update: ({ req: { user } }) => {
          const role = (user as any)?.role
          return role === 'superadmin' || role === 'admin'
        },
      },
    },
    {
      name: 'orders',
      type: 'join',
      label: 'Εντολές Εργασίας',
      collection: 'service-orders',
      on: 'client',
    },
  ],
}
