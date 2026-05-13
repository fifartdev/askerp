import type { CollectionConfig } from 'payload'
import { isAdminOrSuperAdmin } from '../access/isAdminOrSuperAdmin'

export const STATUS_OPTIONS = [
  { label: 'Ανοιχτή', value: 'open' },
  { label: 'Σε Εξέλιξη', value: 'in_progress' },
  { label: 'Ολοκληρώθηκε', value: 'completed' },
  { label: 'Ακυρώθηκε', value: 'cancelled' },
]

export const ServiceOrders: CollectionConfig = {
  slug: 'service-orders',
  labels: {
    singular: 'Εντολή Εργασίας',
    plural: 'Εντολές Εργασίας',
  },
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Διαχείριση',
    defaultColumns: ['orderNumber', 'client', 'category', 'status', 'date', 'price'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as any).role
      if (role === 'superadmin' || role === 'admin') return true
      // Client role — future: filter by their linked client record
      return false
    },
    create: isAdminOrSuperAdmin,
    update: isAdminOrSuperAdmin,
    delete: isAdminOrSuperAdmin,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data && !data.orderNumber) {
          const { totalDocs } = await req.payload.count({
            collection: 'service-orders',
            overrideAccess: true,
          })
          data.orderNumber = `EE-${String(totalDocs + 1).padStart(4, '0')}`
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        const now = new Date().toISOString()

        if (operation === 'create') {
          data.statusHistory = [
            {
              status: data.status ?? 'open',
              note: 'Δημιουργία εντολής.',
              changedAt: now,
            },
          ]
        }

        if (
          operation === 'update' &&
          originalDoc?.status &&
          data?.status &&
          originalDoc.status !== data.status
        ) {
          data.statusHistory = [
            ...(originalDoc.statusHistory ?? []),
            {
              status: data.status,
              changedAt: now,
            },
          ]
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      label: 'Αριθμός Εντολής',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Δημιουργείται αυτόματα.',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Κατάσταση',
      required: true,
      defaultValue: 'open',
      options: STATUS_OPTIONS,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      label: 'Πελάτης',
      relationTo: 'clients',
      hasMany: false,
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      label: 'Κατηγορία Υπηρεσίας',
      relationTo: 'service-categories',
      hasMany: false,
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      label: 'Ημερομηνία',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Τιμή (€)',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Σύντομη Περιγραφή',
    },
    {
      name: 'serviceAddress',
      type: 'group',
      label: 'Διεύθυνση Εργασίας',
      admin: {
        description: 'Η διεύθυνση όπου θα εκτελεστεί η εργασία.',
      },
      fields: [
        {
          name: 'addressType',
          type: 'text',
          label: 'Τύπος',
          admin: { readOnly: true },
        },
        {
          name: 'address',
          type: 'text',
          label: 'Διεύθυνση',
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
      name: 'statusHistory',
      type: 'array',
      label: 'Ιστορικό Καταστάσεων',
      admin: {
        readOnly: true,
        description: 'Καταχωρείται αυτόματα κάθε φορά που αλλάζει η κατάσταση.',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          label: 'Κατάσταση',
          required: true,
          options: STATUS_OPTIONS,
        },
        {
          name: 'note',
          type: 'textarea',
          label: 'Σημείωση',
        },
        {
          name: 'changedAt',
          type: 'date',
          label: 'Ημερομηνία Αλλαγής',
          required: true,
          admin: {
            date: {
              displayFormat: 'dd/MM/yyyy HH:mm',
            },
          },
        },
      ],
    },
  ],
}
