import React, { useState, useMemo } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  message,
  InputNumber,
  Row,
  Col,
  Tabs,
  Descriptions,
  Popconfirm,
  Upload,
  Statistic,
  Alert,
  Image,
  Pagination,
  Divider,
  Timeline
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  FileTextOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { WorkOrder, WoodRecord, WorkOrderStatus, DisposalMethod, WorkOrderAction } from '../types'
import { isOverdue, getWorkOrderDisplayStatus, handleFileUpload, generateCode, isWorkOrderOverdue } from '../utils'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const WorkOrders: React.FC = () => {
  const {
    workOrders,
    setWorkOrders,
    monitoringPoints,
    publicReports,
    setPublicReports,
    pesticideUsages
  } = useApp()

  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [resultVisible, setResultVisible] = useState(false)
  const [reviewVisible, setReviewVisible] = useState(false)
  const [reviewPlanVisible, setReviewPlanVisible] = useState(false)
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<WorkOrder | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [form] = Form.useForm()
  const [resultForm] = Form.useForm()
  const [reviewForm] = Form.useForm()
  const [reviewPlanForm] = Form.useForm()
  const [disposalPhotos, setDisposalPhotos] = useState<string[]>([])
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([])
  const [woodPage, setWoodPage] = useState(1)
  const WOOD_PAGE_SIZE = 10

  const overdueCount = useMemo(() => 
    workOrders.filter(w => isWorkOrderOverdue(w)).length,
    [workOrders]
  )
  
  const pendingCount = useMemo(() => 
    workOrders.filter(w => w.status === '待处理').length,
    [workOrders]
  )
  
  const processingCount = useMemo(() => 
    workOrders.filter(w => w.status === '处理中').length,
    [workOrders]
  )
  
  const pendingReviewCount = useMemo(() => 
    workOrders.filter(w => w.status === '待复查').length,
    [workOrders]
  )
  
  const completedCount = useMemo(() => 
    workOrders.filter(w => w.status === '已完成').length,
    [workOrders]
  )

  const getFilteredData = (): WorkOrder[] => {
    switch (activeTab) {
      case 'all':
        return workOrders
      case 'overdue':
        return workOrders.filter(w => isWorkOrderOverdue(w))
      case 'pendingReview':
        return workOrders.filter(w => w.status === '待复查')
      default:
        return workOrders.filter(w => w.status === activeTab)
    }
  }

  const generateWoodRecords = (order: WorkOrder, count?: number): WoodRecord[] => {
    const targetCount = count ?? order.woodCount
    if (targetCount <= 0) return []
    
    if (order.woodRecords && order.woodRecords.length === targetCount && targetCount > 0) {
      return order.woodRecords
    }
    
    if (order.woodRecords && order.woodRecords.length > 0 && count === undefined) {
      return order.woodRecords
    }
    
    const species = ['马尾松', '黑松', '湿地松', '火炬松', '黄山松']
    const records: WoodRecord[] = []
    for (let i = 1; i <= targetCount; i++) {
      records.push({
        id: uuidv4(),
        workOrderId: order.id,
        no: i,
        location: `${order.location} - 第${i}号`,
        treeSpecies: species[Math.floor(Math.random() * species.length)],
        diameter: Math.floor(Math.random() * 25 + 10),
        height: Math.floor(Math.random() * 12 + 5),
        disposalMethod: order.disposalMethod,
        result: '已清理'
      })
    }
    return records
  }

  const columns: ColumnsType<WorkOrder> = [
    {
      title: '工单编号',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left'
    },
    {
      title: '监测点',
      dataIndex: 'monitoringPointName',
      key: 'monitoringPointName',
      width: 180
    },
    {
      title: '病虫害类型',
      dataIndex: 'pestType',
      key: 'pestType',
      width: 120,
      render: (type: string) => {
        const colors: Record<string, string> = {
          '松材线虫': 'red',
          '美国白蛾': 'orange',
          '松褐天牛': 'blue'
        }
        return <Tag color={colors[type] || 'default'}>{type}</Tag>
      }
    },
    {
      title: '危害等级',
      dataIndex: 'hazardLevel',
      key: 'hazardLevel',
      width: 100,
      render: (level: string) => {
        const colors: Record<string, string> = {
          '轻度': 'green',
          '中度': 'gold',
          '重度': 'orange',
          '极重度': 'red'
        }
        return <Tag color={colors[level]}>{level}</Tag>
      }
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true
    },
    {
      title: '面积(亩)',
      dataIndex: 'area',
      key: 'area',
      width: 90
    },
    {
      title: '疫木数量',
      dataIndex: 'woodCount',
      key: 'woodCount',
      width: 100
    },
    {
      title: '处置方式',
      dataIndex: 'disposalMethod',
      key: 'disposalMethod',
      width: 100
    },
    {
      title: '责任人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100
    },
    {
      title: '防治队伍',
      dataIndex: 'team',
      key: 'team',
      width: 120
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (date: string, record) => {
        const display = getWorkOrderDisplayStatus(record)
        const showDate = record.status === '待复查' && record.reviewDeadline ? record.reviewDeadline : date
        return (
          <span style={{ color: display.isOverdue ? '#ff4d4f' : 'inherit' }}>
            {showDate}
            {display.isOverdue && <Tag color="red" style={{ marginLeft: 4 }}>{display.text}</Tag>}
          </span>
        )
      }
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const display = getWorkOrderDisplayStatus(record)
        return <Tag color={display.color}>{display.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, record) => {
        const display = getWorkOrderDisplayStatus(record)
        return (
          <Space size="small">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
            {record.status === '待处理' && (
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
            )}
            {record.status === '待处理' && (
              <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => handleStartProcessing(record)}>开始处理</Button>
            )}
            {(record.status === '处理中') && (
              <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleRecordResult(record)}>登记结果</Button>
            )}
            {record.status === '待复查' && (
              <>
                <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => handleAdjustReviewPlan(record)}>调整计划</Button>
                <Button type="link" size="small" icon={<SearchOutlined />} onClick={() => handleReview(record)}>复查</Button>
              </>
            )}
            <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>打印</Button>
          </Space>
        )
      }
    }
  ]

  const woodColumns: ColumnsType<WoodRecord> = [
    { title: '序号', dataIndex: 'no', key: 'no', width: 60, align: 'center' },
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '树种', dataIndex: 'treeSpecies', key: 'treeSpecies', width: 100 },
    { title: '胸径(cm)', dataIndex: 'diameter', key: 'diameter', width: 100, align: 'center' },
    { title: '树高(m)', dataIndex: 'height', key: 'height', width: 90, align: 'center' },
    { title: '处置方式', dataIndex: 'disposalMethod', key: 'disposalMethod', width: 100, align: 'center' },
    { title: '处理结果', dataIndex: 'result', key: 'result', width: 100, align: 'center' }
  ]

  const handleView = (record: WorkOrder) => {
    setViewingOrder(record)
    setWoodPage(1)
    setDetailVisible(true)
  }

  const handleEdit = (record: WorkOrder) => {
    setEditingOrder(record)
    form.setFieldsValue({
      ...record,
      createDate: dayjs(record.createDate),
      deadline: dayjs(record.deadline)
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingOrder(null)
    form.resetFields()
    form.setFieldsValue({
      code: generateCode('WO', workOrders.length + 1),
      createDate: dayjs(),
      status: '待处理'
    })
    setModalVisible(true)
  }

  const handleStartProcessing = (record: WorkOrder) => {
    const newAction: WorkOrderAction = {
      id: uuidv4(),
      type: 'started',
      title: '开始处理',
      operator: '管理员',
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      description: '工单已转入处理中状态'
    }
    setWorkOrders(prev =>
      prev.map(w => w.id === record.id ? { 
        ...w, 
        status: '处理中',
        actions: [...(w.actions || []), newAction]
      } : w)
    )
    message.success('已开始处理')
  }

  const handleRecordResult = (record: WorkOrder) => {
    setViewingOrder(record)
    setDisposalPhotos([])
    resultForm.resetFields()
    resultForm.setFieldsValue({
      disposalDate: dayjs(),
      disposalMethod: record.disposalMethod,
      reviewDeadline: dayjs().add(10, 'day')
    })
    setResultVisible(true)
  }

  const handleReview = (record: WorkOrder) => {
    setViewingOrder(record)
    setReviewPhotos([])
    reviewForm.resetFields()
    reviewForm.setFieldsValue({
      reviewDate: dayjs()
    })
    setReviewVisible(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const mp = monitoringPoints.find(m => m.id === values.monitoringPointId)
      const formattedValues = {
        ...values,
        createDate: values.createDate.format('YYYY-MM-DD'),
        deadline: values.deadline.format('YYYY-MM-DD'),
        monitoringPointName: mp?.name || ''
      }

      if (editingOrder) {
        setWorkOrders(prev =>
          prev.map(w => (w.id === editingOrder.id ? { ...w, ...formattedValues } : w))
        )
        message.success('工单更新成功')
      } else {
        const newOrder: WorkOrder = {
          id: uuidv4(),
          ...formattedValues,
          woodRecords: [],
          disposalPhotos: [],
          reviewPhotos: [],
          actions: [
            {
              id: uuidv4(),
              type: 'created',
              title: '创建工单',
              operator: '管理员',
              time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              description: `工单已创建，处置截止日期：${formattedValues.deadline}`
            }
          ]
        }
        setWorkOrders(prev => [...prev, newOrder])
        message.success('工单创建成功')
      }
      setModalVisible(false)
    })
  }

  const handleResultSubmit = () => {
    resultForm.validateFields().then(values => {
      if (viewingOrder) {
        const actualWoodCount = values.woodCount !== undefined ? values.woodCount : viewingOrder.woodCount
        const woodRecords = actualWoodCount > 0 ? generateWoodRecords(viewingOrder, actualWoodCount) : []
        
        const actions: WorkOrderAction[] = [
          ...(viewingOrder.actions || []),
          {
            id: uuidv4(),
            type: 'result_registered',
            title: '登记处置结果',
            operator: '管理员',
            time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            description: `登记处置结果：${values.disposalResult || '已完成处置'}，实际清理疫木${actualWoodCount}株`
          },
          {
            id: uuidv4(),
            type: 'pending_review',
            title: '进入待复查',
            operator: '系统',
            time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            description: `复查截止日期：${values.reviewDeadline.format('YYYY-MM-DD')}`
          }
        ]

        setWorkOrders(prev =>
          prev.map(w =>
            w.id === viewingOrder.id
              ? {
                  ...w,
                  status: '待复查' as WorkOrderStatus,
                  disposalResult: values.disposalResult,
                  disposalDate: values.disposalDate.format('YYYY-MM-DD'),
                  disposalMethod: values.disposalMethod,
                  woodCount: actualWoodCount,
                  woodRecords: woodRecords,
                  reviewDeadline: values.reviewDeadline.format('YYYY-MM-DD'),
                  disposalPhotos: disposalPhotos,
                  actions
                }
              : w
          )
        )
        message.success('处置结果已登记，已进入待复查')
        setResultVisible(false)
      }
    })
  }

  const handleReviewSubmit = () => {
    reviewForm.validateFields().then(values => {
      if (viewingOrder) {
        const newAction: WorkOrderAction = {
          id: uuidv4(),
          type: 'review_completed',
          title: '完成复查',
          operator: values.reviewer || '管理员',
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          description: `复查结论：${values.reviewResult || '复查通过'}`
        }
        setWorkOrders(prev =>
          prev.map(w =>
            w.id === viewingOrder.id
              ? {
                  ...w,
                  status: '已完成' as WorkOrderStatus,
                  reviewDate: values.reviewDate.format('YYYY-MM-DD'),
                  reviewResult: values.reviewResult,
                  reviewer: values.reviewer,
                  reviewPhotos: reviewPhotos,
                  actions: [...(w.actions || []), newAction]
                }
              : w
          )
        )
        message.success('复查完成，工单已关闭')
        setReviewVisible(false)
      }
    })
  }

  const handleAdjustReviewPlan = (record: WorkOrder) => {
    setViewingOrder(record)
    reviewPlanForm.resetFields()
    reviewPlanForm.setFieldsValue({
      reviewDeadline: record.reviewDeadline ? dayjs(record.reviewDeadline) : dayjs().add(7, 'day'),
      reviewer: record.reviewer || '',
      reviewMethod: '现场复查'
    })
    setReviewPlanVisible(true)
  }

  const handleReviewPlanSubmit = () => {
    reviewPlanForm.validateFields().then(values => {
      if (viewingOrder) {
        const newAction: WorkOrderAction = {
          id: uuidv4(),
          type: 'review_plan_adjusted',
          title: '调整复查计划',
          operator: '管理员',
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          description: `复查截止日期调整为${values.reviewDeadline.format('YYYY-MM-DD')}，复查人：${values.reviewer || '未指定'}，复查方式：${values.reviewMethod || '未指定'}`
        }
        setWorkOrders(prev =>
          prev.map(w =>
            w.id === viewingOrder.id
              ? {
                  ...w,
                  reviewDeadline: values.reviewDeadline.format('YYYY-MM-DD'),
                  reviewer: values.reviewer,
                  reviewMethod: values.reviewMethod,
                  actions: [...(w.actions || []), newAction]
                }
              : w
          )
        )
        message.success('复查计划已更新')
        setReviewPlanVisible(false)
      }
    })
  }

  const handlePrint = (record: WorkOrder) => {
    const woodRecords = generateWoodRecords(record)
    const usages = pesticideUsages.filter(u => u.workOrderId === record.id && !u.voided)
    const totalPesticideArea = usages.reduce((sum, u) => sum + u.area, 0)
    const totalPesticideQuantity = usages.reduce((sum, u) => sum + u.quantity, 0)
    
    setViewingOrder(record)
    
    const printKey = Date.now()
    const printWindow = window.open('', `print_${record.id}_${printKey}`)
    if (printWindow) {
      const woodRowsHtml = woodRecords.map(r => `
        <tr>
          <td style="border:1px solid #000;padding:4px 8px;text-align:center;">${r.no}</td>
          <td style="border:1px solid #000;padding:4px 8px;">${r.location}</td>
          <td style="border:1px solid #000;padding:4px 8px;">${r.treeSpecies}</td>
          <td style="border:1px solid #000;padding:4px 8px;text-align:center;">${r.diameter}</td>
          <td style="border:1px solid #000;padding:4px 8px;text-align:center;">${r.height || '-'}</td>
          <td style="border:1px solid #000;padding:4px 8px;text-align:center;">${r.disposalMethod}</td>
          <td style="border:1px solid #000;padding:4px 8px;text-align:center;">${r.result}</td>
        </tr>
      `).join('')
      
      const photosHtml = (record.disposalPhotos || []).slice(0, 6).map((photo, i) => `
        <div style="border:1px solid #000;display:inline-block;margin:4px;">
          <img src="${photo}" alt="现场照片${i + 1}" style="width:150px;height:100px;object-fit:cover;" />
        </div>
      `).join('')

      const pesticideHtml = (totalPesticideArea > 0 || totalPesticideQuantity > 0) ? `
        <tr>
          <td style="border:1px solid #000;padding:8px 12px;width:15%;background:#f5f5f5;">累计用药面积</td>
          <td style="border:1px solid #000;padding:8px 12px;">${totalPesticideArea} 亩</td>
          <td style="border:1px solid #000;padding:8px 12px;width:15%;background:#f5f5f5;">累计用药量</td>
          <td style="border:1px solid #000;padding:8px 12px;">${totalPesticideQuantity} 单位</td>
        </tr>
      ` : ''

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>现场处置单_${record.code}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { font-family: SimSun, serif; font-size: 12pt; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; }
            th { background: #f5f5f5; }
            h1 { text-align: center; font-size: 20pt; margin: 0 0 20px 0; font-weight: bold; }
            h3 { font-size: 14pt; margin: 0 0 10px 0; font-weight: bold; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature-item { text-align: center; }
            .signature-line { border-bottom: 1px solid #000; padding: 0 60px 2px 0; margin-bottom: 40px; display: inline-block; }
          </style>
        </head>
        <body>
          <h1>林业病虫害现场处置单</h1>
          <table>
            <tbody>
              <tr>
                <td style="border:1px solid #000;padding:8px 12px;width:15%;background:#f5f5f5;">工单编号</td>
                <td style="border:1px solid #000;padding:8px 12px;width:35%;">${record.code}</td>
                <td style="border:1px solid #000;padding:8px 12px;width:15%;background:#f5f5f5;">创建日期</td>
                <td style="border:1px solid #000;padding:8px 12px;width:35%;">${record.createDate}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">监测点</td>
                <td style="border:1px solid #000;padding:8px 12px;" colspan="3">${record.monitoringPointName}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">具体位置</td>
                <td style="border:1px solid #000;padding:8px 12px;" colspan="3">${record.location}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">病虫害类型</td>
                <td style="border:1px solid #000;padding:8px 12px;">${record.pestType}</td>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">危害等级</td>
                <td style="border:1px solid #000;padding:8px 12px;">${record.hazardLevel}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">处置方式</td>
                <td style="border:1px solid #000;padding:8px 12px;">${record.disposalMethod}</td>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">防治面积</td>
                <td style="border:1px solid #000;padding:8px 12px;">${record.area} 亩</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">责任人</td>
                <td style="border:1px solid #000;padding:8px 12px;">${record.assignee || '-'}</td>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">防治队伍</td>
                <td style="border:1px solid #000;padding:8px 12px;">${record.team || '-'}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">处置日期</td>
                <td style="border:1px solid #000;padding:8px 12px;">${record.disposalDate || '-'}</td>
                <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">复查日期</td>
                <td style="border:1px solid #000;padding:8px 12px;">${record.reviewDate || record.reviewDeadline || '-'}</td>
              </tr>
              ${pesticideHtml}
              ${record.disposalResult ? `
                <tr>
                  <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">处置结果</td>
                  <td style="border:1px solid #000;padding:8px 12px;" colspan="3">${record.disposalResult}</td>
                </tr>
              ` : ''}
              ${record.reviewResult ? `
                <tr>
                  <td style="border:1px solid #000;padding:8px 12px;background:#f5f5f5;">复查结论</td>
                  <td style="border:1px solid #000;padding:8px 12px;" colspan="3">${record.reviewResult}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          
          ${woodRecords.length > 0 ? `
            <div style="margin-bottom:15px;">
              <h3>疫木清理清单（共 ${woodRecords.length} 株）</h3>
              <table>
                <thead>
                  <tr>
                    <th style="width:60px;text-align:center;">序号</th>
                    <th>位置</th>
                    <th style="width:100px;">树种</th>
                    <th style="width:80px;text-align:center;">胸径(cm)</th>
                    <th style="width:80px;text-align:center;">树高(m)</th>
                    <th style="width:90px;text-align:center;">处理方式</th>
                    <th style="width:90px;text-align:center;">处理结果</th>
                  </tr>
                </thead>
                <tbody>
                  ${woodRowsHtml}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${(record.disposalPhotos || []).length > 0 ? `
            <div style="margin-bottom:20px;">
              <h3>现场照片</h3>
              ${photosHtml}
            </div>
          ` : ''}
          
          <div class="signature">
            <div class="signature-item">
              <span class="signature-line"></span>
              <div style="font-size:10pt;">处置人签字：</div>
            </div>
            <div class="signature-item">
              <span class="signature-line"></span>
              <div style="font-size:10pt;">复查人签字：</div>
            </div>
            <div class="signature-item">
              <span class="signature-line"></span>
              <div style="font-size:10pt;">林业站负责人：</div>
            </div>
            <div class="signature-item">
              <span class="signature-line" style="padding-right:80px;"></span>
              <div style="font-size:10pt;">日期：</div>
            </div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 300)
    }
  }

  const customDisposalUploadProps = {
    listType: 'picture-card' as const,
    multiple: true,
    beforeUpload: async (file: File) => {
      try {
        const base64 = await handleFileUpload(file)
        if (base64) {
          setDisposalPhotos(prev => [...prev, base64])
        }
      } catch (e) {
        message.error('图片上传失败')
      }
      return false
    },
    onRemove: (file: any) => {
      const index = disposalPhotos.indexOf(file.url)
      if (index >= 0) {
        setDisposalPhotos(prev => prev.filter((_, i) => i !== index))
      }
    },
    fileList: disposalPhotos.map((url, index) => ({
      uid: String(index),
      name: `照片${index + 1}`,
      status: 'done' as const,
      url: url
    }))
  }

  const customReviewUploadProps = {
    listType: 'picture-card' as const,
    multiple: true,
    beforeUpload: async (file: File) => {
      try {
        const base64 = await handleFileUpload(file)
        if (base64) {
          setReviewPhotos(prev => [...prev, base64])
        }
      } catch (e) {
        message.error('图片上传失败')
      }
      return false
    },
    onRemove: (file: any) => {
      const index = reviewPhotos.indexOf(file.url)
      if (index >= 0) {
        setReviewPhotos(prev => prev.filter((_, i) => i !== index))
      }
    },
    fileList: reviewPhotos.map((url, index) => ({
      uid: String(index),
      name: `照片${index + 1}`,
      status: 'done' as const,
      url: url
    }))
  }

  return (
    <div>
      {overdueCount > 0 && (
        <Alert
          message={`有 ${overdueCount} 个工单已超期，请及时处理`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="待处理"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="处理中"
              value={processingCount}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="待复查"
              value={pendingReviewCount}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="已完成"
              value={completedCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="已超期"
              value={overdueCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="处置工单管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            创建工单
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="待处理" key="待处理" />
          <TabPane tab="处理中" key="处理中" />
          <TabPane tab="待复查" key="pendingReview" />
          <TabPane tab="已完成" key="已完成" />
          <TabPane tab={<span style={{ color: '#ff4d4f' }}>已超期 ({overdueCount})</span>} key="overdue" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={getFilteredData()}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingOrder ? '编辑工单' : '创建处置工单'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="工单编号"
                rules={[{ required: true, message: '请输入编号' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="monitoringPointId"
                label="监测点"
                rules={[{ required: true, message: '请选择监测点' }]}
              >
                <Select placeholder="请选择">
                  {monitoringPoints.map(mp => (
                    <Option key={mp.id} value={mp.id}>{mp.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pestType"
                label="病虫害类型"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择">
                  <Option value="松材线虫">松材线虫</Option>
                  <Option value="美国白蛾">美国白蛾</Option>
                  <Option value="松褐天牛">松褐天牛</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hazardLevel"
                label="危害等级"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择">
                  <Option value="轻度">轻度</Option>
                  <Option value="中度">中度</Option>
                  <Option value="重度">重度</Option>
                  <Option value="极重度">极重度</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="location"
            label="具体位置"
            rules={[{ required: true, message: '请输入位置' }]}
          >
            <Input placeholder="请输入具体位置" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="area"
                label="面积(亩)"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="woodCount"
                label="预计疫木数量"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="disposalMethod"
                label="处置方式"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择">
                  <Option value="焚烧">焚烧</Option>
                  <Option value="粉碎">粉碎</Option>
                  <Option value="熏蒸">熏蒸</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="责任人"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input placeholder="请输入责任人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="team"
                label="防治队伍"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input placeholder="如：防治一队" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="createDate"
                label="创建日期"
                rules={[{ required: true, message: '请选择' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="截止日期"
                rules={[{ required: true, message: '请选择' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select placeholder="请选择">
              <Option value="待处理">待处理</Option>
              <Option value="处理中">处理中</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="登记处置结果"
        open={resultVisible}
        onOk={handleResultSubmit}
        onCancel={() => setResultVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={resultForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="disposalDate"
                label="处置日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reviewDeadline"
                label="复查截止日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="disposalMethod"
                label="实际处置方式"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择">
                  <Option value="焚烧">焚烧</Option>
                  <Option value="粉碎">粉碎</Option>
                  <Option value="熏蒸">熏蒸</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="woodCount"
                label="实际清理疫木数量"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="disposalResult"
            label="处置结果说明"
            rules={[{ required: true, message: '请输入处置结果' }]}
          >
            <TextArea rows={4} placeholder="请详细描述处置结果" />
          </Form.Item>
          <Form.Item label="现场照片">
            <div className="photo-grid" style={{ marginBottom: 12 }}>
              {disposalPhotos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <Image src={photo} alt={`照片${index + 1}`} preview={false} />
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white'
                    }}
                    onClick={() => setDisposalPhotos(prev => prev.filter((_, i) => i !== index))}
                  >
                    <DeleteOutlined style={{ fontSize: 12 }} />
                  </div>
                </div>
              ))}
            </div>
            <Upload {...customDisposalUploadProps}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>添加照片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="复查登记"
        open={reviewVisible}
        onOk={handleReviewSubmit}
        onCancel={() => setReviewVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={reviewForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reviewDate"
                label="复查日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reviewer"
                label="复查人"
                rules={[{ required: true, message: '请输入复查人' }]}
              >
                <Input placeholder="请输入复查人姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="reviewResult"
            label="复查结论"
            rules={[{ required: true, message: '请输入复查结论' }]}
          >
            <TextArea rows={4} placeholder="请详细描述复查结果，如是否有活虫、是否需要二次处置等" />
          </Form.Item>
          <Form.Item label="复查照片">
            <div className="photo-grid" style={{ marginBottom: 12 }}>
              {reviewPhotos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <Image src={photo} alt={`照片${index + 1}`} preview={false} />
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white'
                    }}
                    onClick={() => setReviewPhotos(prev => prev.filter((_, i) => i !== index))}
                  >
                    <DeleteOutlined style={{ fontSize: 12 }} />
                  </div>
                </div>
              ))}
            </div>
            <Upload {...customReviewUploadProps}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>添加照片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="调整复查计划"
        open={reviewPlanVisible}
        onOk={handleReviewPlanSubmit}
        onCancel={() => setReviewPlanVisible(false)}
        width={500}
      >
        <Form form={reviewPlanForm} layout="vertical">
          <Form.Item
            name="reviewDeadline"
            label="复查截止日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="reviewer"
            label="指定复查人"
          >
            <Input placeholder="请输入复查人姓名" />
          </Form.Item>
          <Form.Item
            name="reviewMethod"
            label="复查方式"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select>
              <Option value="现场复查">现场复查</Option>
              <Option value="照片复查">照片复查</Option>
              <Option value="无人机巡查">无人机巡查</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item label="说明">
            <TextArea rows={2} placeholder="请输入调整说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="工单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={850}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button key="print" icon={<PrinterOutlined />} onClick={() => viewingOrder && handlePrint(viewingOrder)}>
            打印处置单
          </Button>
        ]}
      >
        {viewingOrder && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="工单编号" span={2}>
                {viewingOrder.code}
              </Descriptions.Item>
              <Descriptions.Item label="监测点">{viewingOrder.monitoringPointName}</Descriptions.Item>
              <Descriptions.Item label="病虫害类型">{viewingOrder.pestType}</Descriptions.Item>
              <Descriptions.Item label="危害等级">{viewingOrder.hazardLevel}</Descriptions.Item>
              <Descriptions.Item label="处置方式">{viewingOrder.disposalMethod}</Descriptions.Item>
              <Descriptions.Item label="位置" span={2}>{viewingOrder.location}</Descriptions.Item>
              <Descriptions.Item label="面积">{viewingOrder.area} 亩</Descriptions.Item>
              <Descriptions.Item label="疫木数量">{viewingOrder.woodCount} 株</Descriptions.Item>
              <Descriptions.Item label="责任人">{viewingOrder.assignee}</Descriptions.Item>
              <Descriptions.Item label="防治队伍">{viewingOrder.team}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{viewingOrder.createDate}</Descriptions.Item>
              {viewingOrder.status === '待复查' ? (
                <>
                  <Descriptions.Item label="复查截止日期">
                    <span style={{ color: isOverdue(viewingOrder.reviewDeadline || '', viewingOrder.status) ? '#ff4d4f' : 'inherit', fontWeight: 600 }}>
                      {viewingOrder.reviewDeadline}
                      {isOverdue(viewingOrder.reviewDeadline || '', viewingOrder.status) && <Tag color="red" style={{ marginLeft: 8 }}>复查超期</Tag>}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="原处置截止">{viewingOrder.deadline}</Descriptions.Item>
                </>
              ) : (
                <Descriptions.Item label="处置截止日期">
                  {viewingOrder.deadline}
                  {isOverdue(viewingOrder.deadline, viewingOrder.status) && viewingOrder.status !== '已完成' && <Tag color="red" style={{ marginLeft: 8 }}>超期</Tag>}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="状态">
                <Tag color={getWorkOrderDisplayStatus(viewingOrder).color}>
                  {getWorkOrderDisplayStatus(viewingOrder).text}
                </Tag>
              </Descriptions.Item>
              {viewingOrder.disposalDate && (
                <Descriptions.Item label="处置日期">{viewingOrder.disposalDate}</Descriptions.Item>
              )}
              {viewingOrder.reviewDeadline && (
                <Descriptions.Item label="复查截止">{viewingOrder.reviewDeadline}</Descriptions.Item>
              )}
              {viewingOrder.reviewDate && (
                <Descriptions.Item label="复查日期">{viewingOrder.reviewDate}</Descriptions.Item>
              )}
              {viewingOrder.disposalResult && (
                <Descriptions.Item label="处置结果" span={2}>
                  {viewingOrder.disposalResult}
                </Descriptions.Item>
              )}
              {viewingOrder.reviewResult && (
                <Descriptions.Item label="复查结论" span={2}>
                  {viewingOrder.reviewResult}
                </Descriptions.Item>
              )}
              {viewingOrder.reviewer && (
                <Descriptions.Item label="复查人">{viewingOrder.reviewer}</Descriptions.Item>
              )}
            </Descriptions>

            {(() => {
              const usages = pesticideUsages.filter(u => u.workOrderId === viewingOrder.id && !u.voided)
              const totalArea = usages.reduce((sum, u) => sum + u.area, 0)
              const totalQuantity = usages.reduce((sum, u) => sum + u.quantity, 0)
              if (usages.length > 0) {
                return (
                  <>
                    <Divider orientation="left">用药记录</Divider>
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="累计用药面积">{totalArea} 亩</Descriptions.Item>
                      <Descriptions.Item label="累计用药量">{totalQuantity} 单位</Descriptions.Item>
                    </Descriptions>
                    <Table
                      dataSource={usages}
                      columns={[
                        { title: '日期', dataIndex: 'usageDate', key: 'date', width: 120 },
                        { title: '药剂名称', dataIndex: 'pesticideName', key: 'name' },
                        { title: '用量', dataIndex: 'quantity', key: 'qty', width: 100, render: (v, r) => `${v} ${r.unit}` },
                        { title: '面积(亩)', dataIndex: 'area', key: 'area', width: 100 },
                        { title: '操作人员', dataIndex: 'operator', key: 'op', width: 100 }
                      ]}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      style={{ marginTop: 8 }}
                    />
                  </>
                )
              }
              return null
            })()}

            {(() => {
              const woodRecords = generateWoodRecords(viewingOrder)
              if (woodRecords.length === 0) return null
              return (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ marginBottom: 8 }}>
                    疫木清理清单（共 {woodRecords.length} 株）
                  </h4>
                  <Table
                    dataSource={woodRecords.slice(
                      (woodPage - 1) * WOOD_PAGE_SIZE,
                      woodPage * WOOD_PAGE_SIZE
                    )}
                    columns={woodColumns}
                    size="small"
                    pagination={false}
                    rowKey="id"
                    bordered
                  />
                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <Pagination
                      current={woodPage}
                      pageSize={WOOD_PAGE_SIZE}
                      total={woodRecords.length}
                      onChange={setWoodPage}
                      size="small"
                    />
                  </div>
                </div>
              )
            })()}

            {viewingOrder.disposalPhotos && viewingOrder.disposalPhotos.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 8 }}>现场照片</h4>
                <div className="photo-grid">
                  <Image.PreviewGroup>
                    {viewingOrder.disposalPhotos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <Image src={photo} alt={`现场照片${index + 1}`} />
                      </div>
                    ))}
                  </Image.PreviewGroup>
                </div>
              </div>
            )}

            {viewingOrder.reviewPhotos && viewingOrder.reviewPhotos.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 8 }}>复查照片</h4>
                <div className="photo-grid">
                  <Image.PreviewGroup>
                    {viewingOrder.reviewPhotos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <Image src={photo} alt={`复查照片${index + 1}`} />
                      </div>
                    ))}
                  </Image.PreviewGroup>
                </div>
              </div>
            )}

            {viewingOrder.actions && viewingOrder.actions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Divider orientation="left">操作时间线</Divider>
                <Timeline
                  items={viewingOrder.actions.map(action => ({
                    color: action.type === 'created' ? 'blue' 
                          : action.type === 'started' ? 'cyan'
                          : action.type === 'result_registered' ? 'green'
                          : action.type === 'pending_review' ? 'orange'
                          : action.type === 'review_plan_adjusted' ? 'purple'
                          : action.type === 'review_completed' ? 'success'
                          : 'gray',
                    children: (
                      <div>
                        <div style={{ fontWeight: 500 }}>{action.title}</div>
                        <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                          {action.operator} · {action.time}
                        </div>
                        {action.description && (
                          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                            {action.description}
                          </div>
                        )}
                      </div>
                    )
                  }))}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WorkOrders
