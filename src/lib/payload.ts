import config from '@/payload.config'
import { getPayload as _getPayload } from 'payload'

export const getPayload = () => _getPayload({ config })
