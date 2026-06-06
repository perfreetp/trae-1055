import {
  MonitoringPoint,
  Trap,
  Sample,
  WorkOrder,
  WoodRecord,
  Pesticide,
  PesticideBatch,
  PesticideUsage,
  PublicReport,
  EvaluationRecord,
  HistoricalCase,
  InventoryLog,
  MonthlyReport
} from '../types'
import { v4 as uuidv4 } from 'uuid'

export const mockMonitoringPoints: MonitoringPoint[] = [
  {
    id: 'mp001',
    name: '东山林场1号监测点',
    location: '东山林场A区',
    lng: 118.78,
    lat: 32.04,
    pestType: '松材线虫',
    trapCount: 5,
    lastCheckDate: '2026-06-01',
    nextCheckDate: '2026-06-15',
    status: '异常',
    pestCount: 156,
    hazardLevel: '中度'
  },
  {
    id: 'mp002',
    name: '西山林场2号监测点',
    location: '西山林场B区',
    lng: 118.65,
    lat: 32.12,
    pestType: '美国白蛾',
    trapCount: 8,
    lastCheckDate: '2026-06-03',
    nextCheckDate: '2026-06-17',
    status: '正常',
    pestCount: 23,
    hazardLevel: '轻度'
  },
  {
    id: 'mp003',
    name: '南坡林区3号监测点',
    location: '南坡林区C区',
    lng: 118.82,
    lat: 31.98,
    pestType: '松材线虫',
    trapCount: 6,
    lastCheckDate: '2026-05-28',
    nextCheckDate: '2026-06-11',
    status: '异常',
    pestCount: 342,
    hazardLevel: '重度'
  },
  {
    id: 'mp004',
    name: '北沟林区4号监测点',
    location: '北沟林区D区',
    lng: 118.72,
    lat: 32.18,
    pestType: '松褐天牛',
    trapCount: 4,
    lastCheckDate: '2026-06-05',
    nextCheckDate: '2026-06-19',
    status: '待监测',
    pestCount: 0,
    hazardLevel: '轻度'
  },
  {
    id: 'mp005',
    name: '中心林区5号监测点',
    location: '中心林区E区',
    lng: 118.75,
    lat: 32.08,
    pestType: '美国白蛾',
    trapCount: 10,
    lastCheckDate: '2026-06-02',
    nextCheckDate: '2026-06-16',
    status: '正常',
    pestCount: 45,
    hazardLevel: '轻度'
  }
]

export const mockTraps: Trap[] = [
  {
    id: 't001',
    code: 'TRAP-2026-001',
    monitoringPointId: 'mp001',
    monitoringPointName: '东山林场1号监测点',
    location: 'A区东北角',
    installDate: '2026-03-15',
    lastMaintenanceDate: '2026-05-20',
    status: '正常',
    pestType: '松材线虫',
    lureType: '松墨天牛诱芯'
  },
  {
    id: 't002',
    code: 'TRAP-2026-002',
    monitoringPointId: 'mp001',
    monitoringPointName: '东山林场1号监测点',
    location: 'A区西南角',
    installDate: '2026-03-15',
    lastMaintenanceDate: '2026-05-20',
    status: '正常',
    pestType: '松材线虫',
    lureType: '松墨天牛诱芯'
  },
  {
    id: 't003',
    code: 'TRAP-2026-003',
    monitoringPointId: 'mp002',
    monitoringPointName: '西山林场2号监测点',
    location: 'B区入口处',
    installDate: '2026-04-01',
    lastMaintenanceDate: '2026-05-25',
    status: '正常',
    pestType: '美国白蛾',
    lureType: '美国白蛾性诱剂'
  },
  {
    id: 't004',
    code: 'TRAP-2026-004',
    monitoringPointId: 'mp003',
    monitoringPointName: '南坡林区3号监测点',
    location: 'C区半山腰',
    installDate: '2026-03-20',
    lastMaintenanceDate: '2026-05-15',
    status: '损坏',
    pestType: '松材线虫',
    lureType: '松墨天牛诱芯',
    notes: '诱捕器顶盖损坏，需更换'
  }
]

export const mockSamples: Sample[] = [
  {
    id: 's001',
    code: 'SAMPLE-2026-001',
    monitoringPointId: 'mp001',
    monitoringPointName: '东山林场1号监测点',
    collectDate: '2026-06-01',
    pestType: '松材线虫',
    pestCount: 45,
    hazardLevel: '中度',
    collector: '张工',
    microPhotos: [],
    status: '已检测',
    labResult: '确认松材线虫感染，需立即处置',
    labDate: '2026-06-03'
  },
  {
    id: 's002',
    code: 'SAMPLE-2026-002',
    monitoringPointId: 'mp003',
    monitoringPointName: '南坡林区3号监测点',
    collectDate: '2026-05-28',
    pestType: '松材线虫',
    pestCount: 128,
    hazardLevel: '重度',
    collector: '李工',
    microPhotos: [],
    status: '送检中'
  },
  {
    id: 's003',
    code: 'SAMPLE-2026-003',
    monitoringPointId: 'mp002',
    monitoringPointName: '西山林场2号监测点',
    collectDate: '2026-06-03',
    pestType: '美国白蛾',
    pestCount: 12,
    hazardLevel: '轻度',
    collector: '王工',
    microPhotos: [],
    status: '待送检'
  }
]

const generateWoodRecords = (workOrderId: string, count: number, location: string, method: string): WoodRecord[] => {
  const records: WoodRecord[] = []
  const species = ['马尾松', '黑松', '湿地松', '火炬松', '黄山松']
  for (let i = 1; i <= count; i++) {
    records.push({
      id: uuidv4(),
      workOrderId,
      no: i,
      location: `${location} - 第${i}号`,
      treeSpecies: species[Math.floor(Math.random() * species.length)],
      diameter: Math.floor(Math.random() * 25 + 10),
      height: Math.floor(Math.random() * 12 + 5),
      disposalMethod: method as any,
      result: '已清理'
    })
  }
  return records
}

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo001',
    code: 'WO-2026-001',
    monitoringPointId: 'mp003',
    monitoringPointName: '南坡林区3号监测点',
    pestType: '松材线虫',
    hazardLevel: '重度',
    location: '南坡林区C区12-18号松树',
    area: 15.5,
    createDate: '2026-05-29',
    deadline: '2026-06-10',
    status: '处理中',
    assignee: '赵队长',
    team: '防治一队',
    disposalMethod: '焚烧',
    woodCount: 25,
    woodRecords: generateWoodRecords('wo001', 25, '南坡林区C区', '焚烧'),
    disposalDate: '2026-06-02',
    disposalResult: '已完成现场清理，疫木全部焚烧处理',
    disposalPhotos: [],
    reviewDeadline: '2026-06-12',
    reviewPhotos: [],
    notes: '重点区域，需加强复查'
  },
  {
    id: 'wo002',
    code: 'WO-2026-002',
    monitoringPointId: 'mp001',
    monitoringPointName: '东山林场1号监测点',
    pestType: '松材线虫',
    hazardLevel: '中度',
    location: '东山林场A区5-10号松树',
    area: 8.2,
    createDate: '2026-06-04',
    deadline: '2026-06-18',
    status: '待处理',
    assignee: '钱队长',
    team: '防治二队',
    disposalMethod: '粉碎',
    woodCount: 32,
    woodRecords: generateWoodRecords('wo002', 32, '东山林场A区', '粉碎'),
    disposalPhotos: [],
    reviewPhotos: []
  },
  {
    id: 'wo003',
    code: 'WO-2026-003',
    monitoringPointId: 'mp002',
    monitoringPointName: '西山林场2号监测点',
    pestType: '美国白蛾',
    hazardLevel: '轻度',
    location: '西山林场B区阔叶树带',
    area: 5.0,
    createDate: '2026-05-20',
    deadline: '2026-06-05',
    status: '待处理',
    assignee: '孙队长',
    team: '防治三队',
    disposalMethod: '熏蒸',
    woodCount: 0,
    woodRecords: [],
    disposalPhotos: [],
    reviewPhotos: []
  },
  {
    id: 'wo004',
    code: 'WO-2026-004',
    monitoringPointId: 'mp005',
    monitoringPointName: '中心林区5号监测点',
    pestType: '美国白蛾',
    hazardLevel: '轻度',
    location: '中心林区E区',
    area: 3.5,
    createDate: '2026-05-15',
    deadline: '2026-05-30',
    status: '已完成',
    assignee: '李队长',
    team: '防治一队',
    disposalMethod: '熏蒸',
    woodCount: 0,
    woodRecords: [],
    disposalDate: '2026-05-22',
    disposalResult: '完成药剂喷洒，虫口密度明显下降',
    disposalPhotos: [],
    reviewDate: '2026-05-28',
    reviewResult: '复查合格，未发现活虫',
    reviewPhotos: [],
    reviewer: '王工'
  }
]

const mockBatches: PesticideBatch[] = [
  {
    id: 'b001',
    pesticideId: 'p001',
    batchNo: 'B20260301',
    quantity: 100,
    unit: 'kg',
    purchaseDate: '2026-03-10',
    expiryDate: '2028-03-10',
    supplier: '某农药厂',
    price: 85
  },
  {
    id: 'b002',
    pesticideId: 'p001',
    batchNo: 'B20260415',
    quantity: 50,
    unit: 'kg',
    purchaseDate: '2026-04-15',
    expiryDate: '2028-04-15',
    supplier: '某农药厂',
    price: 88
  }
]

export const mockPesticides: Pesticide[] = [
  {
    id: 'p001',
    name: '噻虫啉',
    specification: '25%可湿性粉剂',
    manufacturer: '某农药厂',
    stock: 150,
    unit: 'kg',
    warningStock: 50,
    purchaseDate: '2026-03-10',
    expiryDate: '2028-03-10',
    batches: mockBatches.filter(b => b.pesticideId === 'p001')
  },
  {
    id: 'p002',
    name: '氯氰菊酯',
    specification: '10%乳油',
    manufacturer: '某化工公司',
    stock: 80,
    unit: 'L',
    warningStock: 30,
    purchaseDate: '2026-04-05',
    expiryDate: '2027-04-05',
    batches: [
      {
        id: 'b003',
        pesticideId: 'p002',
        batchNo: 'B20260405',
        quantity: 80,
        unit: 'L',
        purchaseDate: '2026-04-05',
        expiryDate: '2027-04-05',
        supplier: '某化工公司',
        price: 65
      }
    ]
  },
  {
    id: 'p003',
    name: '灭幼脲',
    specification: '25%悬浮剂',
    manufacturer: '某生物科技',
    stock: 25,
    unit: 'L',
    warningStock: 40,
    purchaseDate: '2026-02-20',
    expiryDate: '2027-02-20',
    notes: '库存不足，需采购',
    batches: [
      {
        id: 'b004',
        pesticideId: 'p003',
        batchNo: 'B20260220',
        quantity: 25,
        unit: 'L',
        purchaseDate: '2026-02-20',
        expiryDate: '2027-02-20',
        supplier: '某生物科技',
        price: 120
      }
    ]
  }
]

export const mockInventoryLogs: InventoryLog[] = [
  {
    id: 'il001',
    type: 'in',
    pesticideId: 'p001',
    pesticideName: '噻虫啉',
    batchId: 'b001',
    quantity: 100,
    unit: 'kg',
    operator: '库管员',
    date: '2026-03-10',
    remark: '首批入库'
  },
  {
    id: 'il002',
    type: 'in',
    pesticideId: 'p001',
    pesticideName: '噻虫啉',
    batchId: 'b002',
    quantity: 50,
    unit: 'kg',
    operator: '库管员',
    date: '2026-04-15',
    remark: '补充入库'
  },
  {
    id: 'il003',
    type: 'out',
    pesticideId: 'p001',
    pesticideName: '噻虫啉',
    quantity: 25,
    unit: 'kg',
    operator: '赵队长',
    date: '2026-05-30',
    workOrderId: 'wo001',
    workOrderCode: 'WO-2026-001',
    remark: '南坡林区防治用药'
  },
  {
    id: 'il004',
    type: 'out',
    pesticideId: 'p002',
    pesticideName: '氯氰菊酯',
    quantity: 10,
    unit: 'L',
    operator: '李队长',
    date: '2026-05-22',
    workOrderId: 'wo004',
    workOrderCode: 'WO-2026-004',
    remark: '中心林区防治用药'
  }
]

export const mockPesticideUsages: PesticideUsage[] = [
  {
    id: 'pu001',
    pesticideId: 'p001',
    pesticideName: '噻虫啉',
    workOrderId: 'wo001',
    workOrderCode: 'WO-2026-001',
    quantity: 25,
    unit: 'kg',
    area: 15.5,
    usageDate: '2026-05-30',
    operator: '赵队长',
    location: '南坡林区C区',
    batchId: 'b001'
  },
  {
    id: 'pu002',
    pesticideId: 'p002',
    pesticideName: '氯氰菊酯',
    workOrderId: 'wo004',
    workOrderCode: 'WO-2026-004',
    quantity: 10,
    unit: 'L',
    area: 3.5,
    usageDate: '2026-05-22',
    operator: '李队长',
    location: '中心林区E区'
  }
]

export const mockPublicReports: PublicReport[] = [
  {
    id: 'pr001',
    reporter: '刘村民',
    phone: '138****1234',
    location: '东山村后山',
    pestType: '松材线虫',
    description: '发现多棵松树枯死，疑似病虫害',
    reportDate: '2026-06-02',
    status: '已核实',
    photos: [],
    handler: '张工',
    handleDate: '2026-06-03',
    handleResult: '确认为松材线虫感染，已派单处置'
  },
  {
    id: 'pr002',
    reporter: '陈先生',
    phone: '139****5678',
    location: '西坡果园',
    pestType: '美国白蛾',
    description: '果树上发现大量白色毛虫',
    reportDate: '2026-06-05',
    status: '待核实',
    photos: []
  }
]

export const mockEvaluationRecords: EvaluationRecord[] = [
  {
    id: 'e001',
    year: 2026,
    month: 5,
    pestType: '松材线虫',
    monitoringPointCount: 12,
    trapCount: 58,
    totalPestCount: 1256,
    avgDensity: 21.7,
    lastYearAvgDensity: 28.3,
    disposalArea: 156.8,
    disposalCount: 24,
    woodCount: 586,
    pesticideUsage: 320
  },
  {
    id: 'e002',
    year: 2026,
    month: 5,
    pestType: '美国白蛾',
    monitoringPointCount: 8,
    trapCount: 42,
    totalPestCount: 358,
    avgDensity: 8.5,
    lastYearAvgDensity: 12.1,
    disposalArea: 89.5,
    disposalCount: 15,
    woodCount: 0,
    pesticideUsage: 180
  },
  {
    id: 'e003',
    year: 2026,
    month: 4,
    pestType: '松材线虫',
    monitoringPointCount: 12,
    trapCount: 58,
    totalPestCount: 987,
    avgDensity: 17.0,
    lastYearAvgDensity: 22.5,
    disposalArea: 124.3,
    disposalCount: 18,
    woodCount: 412,
    pesticideUsage: 265
  }
]

export const mockMonthlyReports: MonthlyReport[] = [
  {
    id: 'mr001',
    year: 2026,
    month: 5,
    newSamples: 36,
    publicReports: 8,
    completedOrders: 24,
    woodCount: 586,
    disposalArea: 246.3,
    pesticideUsage: 500,
    avgDensity: 15.1,
    lastYearAvgDensity: 20.2,
    newMonitoringPoints: 2,
    activeTraps: 100,
    generatedDate: '2026-06-01',
    generatedBy: '系统管理员'
  },
  {
    id: 'mr002',
    year: 2026,
    month: 4,
    newSamples: 28,
    publicReports: 5,
    completedOrders: 18,
    woodCount: 412,
    disposalArea: 180.5,
    pesticideUsage: 385,
    avgDensity: 13.8,
    lastYearAvgDensity: 18.6,
    newMonitoringPoints: 1,
    activeTraps: 95,
    generatedDate: '2026-05-01',
    generatedBy: '系统管理员'
  }
]

export const mockHistoricalCases: HistoricalCase[] = [
  {
    id: 'hc001',
    date: '2025-08-15',
    location: '东山林场A区',
    pestType: '松材线虫',
    hazardLevel: '重度',
    area: 23.5,
    disposalMethod: '焚烧',
    result: '彻底清除，未扩散',
    cost: 45000
  },
  {
    id: 'hc002',
    date: '2025-06-20',
    location: '西山林场B区',
    pestType: '美国白蛾',
    hazardLevel: '中度',
    area: 15.0,
    disposalMethod: '熏蒸',
    result: '有效控制，虫口密度下降85%',
    cost: 22000
  }
]
