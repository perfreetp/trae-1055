import {
  MonitoringPoint,
  Trap,
  Sample,
  WorkOrder,
  Pesticide,
  PesticideUsage,
  PublicReport,
  EvaluationRecord,
  HistoricalCase
} from '../types'

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
    microPhotos: ['/images/sample1.jpg'],
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
    microPhotos: ['/images/sample2.jpg', '/images/sample3.jpg'],
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
    woodCount: 86,
    photos: ['/images/wo1-1.jpg']
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
    photos: []
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
    status: '已超期',
    assignee: '孙队长',
    team: '防治三队',
    disposalMethod: '熏蒸',
    woodCount: 0,
    photos: []
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
    expiryDate: '2028-03-10'
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
    expiryDate: '2027-04-05'
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
    notes: '库存不足，需采购'
  }
]

export const mockPesticideUsages: PesticideUsage[] = [
  {
    id: 'pu001',
    pesticideId: 'p001',
    pesticideName: '噻虫啉',
    workOrderId: 'wo001',
    quantity: 25,
    unit: 'kg',
    area: 15.5,
    usageDate: '2026-05-30',
    operator: '赵队长',
    location: '南坡林区C区'
  },
  {
    id: 'pu002',
    pesticideId: 'p002',
    pesticideName: '氯氰菊酯',
    workOrderId: 'wo003',
    quantity: 10,
    unit: 'L',
    area: 5.0,
    usageDate: '2026-05-22',
    operator: '孙队长',
    location: '西山林场B区'
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
    photos: ['/images/report1.jpg'],
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
