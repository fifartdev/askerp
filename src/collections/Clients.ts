import type { CollectionConfig } from 'payload'
import { isAdminOrSuperAdmin } from '../access/isAdminOrSuperAdmin'

export const ADDRESS_TYPE_OPTIONS = [
  { label: 'Κατοικία', value: 'home' },
  { label: 'Εργασία', value: 'work' },
  { label: 'Γραφείο', value: 'office' },
  { label: 'Αποθήκη', value: 'warehouse' },
  { label: 'Άλλο', value: 'other' },
]

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
      name: 'addresses',
      type: 'array',
      label: 'Διευθύνσεις',
      admin: {
        description: 'Προσθέστε μία ή περισσότερες διευθύνσεις για τον πελάτη.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Τύπος Διεύθυνσης',
          required: true,
          defaultValue: 'home',
          options: ADDRESS_TYPE_OPTIONS,
        },
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
          admin: { hidden: true },
        },
        {
          name: 'lng',
          type: 'number',
          label: 'Γεωγραφικό Μήκος',
          admin: { hidden: true },
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
