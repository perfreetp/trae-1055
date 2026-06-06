export type PestType = '松材线虫' | '美国白蛾' | '松褐天牛' | '其他'

export type HazardLevel = '轻度' | '中度' | '重度' | '极重度'

export type WorkOrderStatus = '待处理' | '处理中' | '已完成' | '已超期'

export type DisposalMethod = '焚烧' | '粉碎' | '熏蒸' | '其他'

export interface MonitoringPoint {
  id: string
  name: string
  location: string
  lng: number
  lat: number
  pestType: PestType
  trapCount: number
  lastCheckDate: string
  nextCheckDate: string
  status: '正常' | '异常' | '待监测'
  pestCount: number
  hazardLevel: HazardLevel
}

export interface Trap {
  id: string
  code: string
  monitoringPointId: string
  monitoringPointName: string
  location: string
  installDate: string
  lastMaintenanceDate: string
  status: '正常' | '损坏' | '待更换'
  pestType: PestType
  lureType: string
  notes?: string
}

export interface Sample {
  id: string
  code: string
  monitoringPointId: string
  monitoringPointName: string
  collectDate: string
  pestType: PestType
  pestCount: number
  hazardLevel: HazardLevel
  collector: string
  microPhotos: string[]
  status: '待送检' | '送检中' | '已检测'
  labResult?: string
  labDate?: string
  notes?: string
}

export interface WorkOrder {
  id: string
  code: string
  monitoringPointId: string
  monitoringPointName: string
  pestType: PestType
  hazardLevel: HazardLevel
  location: string
  area: number
  createDate: string
  deadline: string
  status: WorkOrderStatus
  assignee: string
  team: string
  disposalMethod: DisposalMethod
  woodCount: number
  disposalResult?: string
  disposalDate?: string
  photos: string[]
  notes?: string
}

export interface Pesticide {
  id: string
  name: string
  specification: string
  manufacturer: string
  stock: number
  unit: string
  warningStock: number
  purchaseDate: string
  expiryDate: string
  notes?: string
}

export interface PesticideUsage {
  id: string
  pesticideId: string
  pesticideName: string
  workOrderId: string
  quantity: number
  unit: string
  area: number
  usageDate: string
  operator: string
  location: string
}

export interface PublicReport {
  id: string
  reporter: string
  phone: string
  location: string
  pestType: PestType
  description: string
  reportDate: string
  status: '待核实' | '已核实' | '已处置' | '已驳回'
  photos: string[]
  handler?: string
  handleDate?: string
  handleResult?: string
}

export interface EvaluationRecord {
  id: string
  year: number
  month: number
  pestType: PestType
  monitoringPointCount: number
  trapCount: number
  totalPestCount: number
  avgDensity: number
  lastYearAvgDensity: number
  disposalArea: number
  disposalCount: number
  woodCount: number
  pesticideUsage: number
  notes?: string
}

export interface HistoricalCase {
  id: string
  date: string
  location: string
  pestType: PestType
  hazardLevel: HazardLevel
  area: number
  disposalMethod: DisposalMethod
  result: string
  cost: number
}
