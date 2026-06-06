import dayjs from 'dayjs'
import { WorkOrder } from '../types'

export const isOverdue = (deadline: string, status?: string): boolean => {
  if (status === '已完成') return false
  if (!deadline) return false
  return dayjs(deadline).isBefore(dayjs(), 'day')
}

export const isWorkOrderOverdue = (order: WorkOrder): boolean => {
  if (order.status === '已完成') return false
  
  if (order.status === '待复查' && order.reviewDeadline) {
    return isOverdue(order.reviewDeadline, order.status)
  }
  
  return isOverdue(order.deadline, order.status)
}

export const getWorkOrderDisplayStatus = (order: WorkOrder): {
  text: string
  color: string
  isOverdue: boolean
} => {
  const isReviewOverdue = order.status === '待复查' && order.reviewDeadline && isOverdue(order.reviewDeadline, order.status)
  const isDisposalOverdue = order.status !== '待复查' && isOverdue(order.deadline, order.status)
  
  if (order.status === '已完成') {
    return { text: '已完成', color: 'success', isOverdue: false }
  }
  
  if (isReviewOverdue) {
    return { text: '复查超期', color: 'error', isOverdue: true }
  }
  
  if (isDisposalOverdue) {
    return { text: '已超期', color: 'error', isOverdue: true }
  }
  
  const statusMap: Record<string, { text: string; color: string }> = {
    '待处理': { text: '待处理', color: 'default' },
    '处理中': { text: '处理中', color: 'processing' },
    '待复查': { text: '待复查', color: 'warning' }
  }
  
  return { ...statusMap[order.status], isOverdue: false }
}

export const getOverdueCount = (orders: WorkOrder[]): number => {
  return orders.filter(o => isWorkOrderOverdue(o)).length
}

export const getPendingReviewCount = (orders: WorkOrder[]): number => {
  return orders.filter(o => o.status === '待复查').length
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

export const handleFileUpload = async (file: File): Promise<string> => {
  try {
    const base64 = await fileToBase64(file)
    return base64
  } catch (error) {
    console.error('File upload error:', error)
    return ''
  }
}

export const formatDate = (date: string | dayjs.Dayjs | undefined, format = 'YYYY-MM-DD'): string => {
  if (!date) return ''
  return dayjs(date).format(format)
}

export const generateBatchNo = (prefix = 'B'): string => {
  return `${prefix}${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
}

export const generateCode = (prefix: string, index?: number): string => {
  const idx = index ?? Math.floor(Math.random() * 1000)
  return `${prefix}-${dayjs().format('YYYY')}-${String(idx).padStart(3, '0')}`
}
