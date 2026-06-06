import React, { useState, useMemo, useRef } from 'react'
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
  Statistic,
  Tabs,
  List,
  Avatar,
  Descriptions,
  Upload,
  Divider,
  Empty
} from 'antd'
import {
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  ExportOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { PublicReport, HistoricalCase, EvaluationRecord, PestType, MonthlyReport } from '../types'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const Evaluation: React.FC = () => {
  const {
    evaluationRecords,
    historicalCases,
    publicReports,
    setPublicReports,
    workOrders,
    pesticideUsages,
    samples,
    monthlyReports,
    setMonthlyReports
  } = useApp()

  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [handleModalVisible, setHandleModalVisible] = useState(false)
  const [viewingReport, setViewingReport] = useState<PublicReport | null>(null)
  const [viewingMonthlyReport, setViewingMonthlyReport] = useState<MonthlyReport | null>(null)
  const [viewReportModalVisible, setViewReportModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [reportForm] = Form.useForm()
  const [handleForm] = Form.useForm()
  const [reportPhotos, setReportPhotos] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year())
  const printRef = useRef<HTMLDivElement>(null)

  const totalCases = historicalCases.length
  const totalReports = publicReports.length
  const pendingReports = publicReports.filter(r => r.status === '待核实').length
  const totalArea = workOrders.filter(w => w.status === '已完成').reduce((sum, w) => sum + w.area, 0)

  const monthlyStats = useMemo(() => {
    const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
    const monthStart = dayjs(monthStr + '-01')
    const monthEnd = monthStart.endOf('month')

    const isInMonth = (dateStr: string) => {
      const date = dayjs(dateStr)
      return date.isAfter(monthStart.subtract(1, 'day')) && date.isBefore(monthEnd.add(1, 'day'))
    }

    const newSamples = samples.filter(s => isInMonth(s.collectDate)).length
    const newReports = publicReports.filter(r => isInMonth(r.reportDate)).length
    const completedOrders = workOrders.filter(w => 
      w.status === '已完成' && w.reviewDate && isInMonth(w.reviewDate)
    ).length
    const totalWood = workOrders
      .filter(w => w.status === '已完成' && w.reviewDate && isInMonth(w.reviewDate))
      .reduce((sum, w) => sum + w.woodCount, 0)
    const disposalArea = workOrders
      .filter(w => w.status === '已完成' && w.reviewDate && isInMonth(w.reviewDate))
      .reduce((sum, w) => sum + w.area, 0)
    const pesticideUsage = pesticideUsages
      .filter(u => isInMonth(u.usageDate))
      .reduce((sum, u) => sum + u.quantity, 0)

    const currentRecord = evaluationRecords.find(r => r.year === selectedYear && r.month === selectedMonth)
    const lastYearRecord = evaluationRecords.find(r => r.year === selectedYear - 1 && r.month === selectedMonth)
    
    const avgDensity = currentRecord?.avgDensity || 0
    const lastYearAvgDensity = lastYearRecord?.avgDensity || avgDensity
    const densityChange = lastYearAvgDensity > 0 
      ? ((avgDensity - lastYearAvgDensity) / lastYearAvgDensity * 100).toFixed(1)
      : '0'

    return {
      newSamples,
      newReports,
      completedOrders,
      totalWood,
      disposalArea,
      pesticideUsage,
      avgDensity,
      lastYearAvgDensity,
      densityChange,
      monthStr
    }
  }, [selectedYear, selectedMonth, samples, publicReports, workOrders, pesticideUsages, evaluationRecords])

  const densityCompareOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['今年平均密度', '去年同期密度'] },
    xAxis: {
      type: 'category',
      data: evaluationRecords.map(r => `${r.year}-${String(r.month).padStart(2, '0')}`)
    },
    yAxis: { type: 'value', name: '虫口密度' },
    series: [
      {
        name: '今年平均密度',
        type: 'bar',
        data: evaluationRecords.map(r => r.avgDensity),
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '去年同期密度',
        type: 'bar',
        data: evaluationRecords.map(r => r.lastYearAvgDensity),
        itemStyle: { color: '#faad14' }
      }
    ]
  }

  const disposalTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['处置面积(亩)', '疫木清理数量'] },
    xAxis: {
      type: 'category',
      data: evaluationRecords.map(r => `${r.year}-${String(r.month).padStart(2, '0')}`)
    },
    yAxis: [
      { type: 'value', name: '面积(亩)' },
      { type: 'value', name: '数量(株)' }
    ],
    series: [
      {
        name: '处置面积(亩)',
        type: 'line',
        yAxisIndex: 0,
        data: evaluationRecords.map(r => r.disposalArea),
        smooth: true,
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '疫木清理数量',
        type: 'line',
        yAxisIndex: 1,
        data: evaluationRecords.map(r => r.woodCount),
        smooth: true,
        itemStyle: { color: '#f5222d' }
      }
    ]
  }

  const pestTypeStatsOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 58, name: '松材线虫' },
          { value: 25, name: '美国白蛾' },
          { value: 12, name: '松褐天牛' },
          { value: 5, name: '其他' }
        ],
        color: ['#f5222d', '#faad14', '#1890ff', '#52c41a']
      }
    ]
  }

  const monthlyDensityChangeOption = {
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        const change = data.data
        return `${data.name}<br/>同比变化: ${change > 0 ? '+' : ''}${change}%`
      }
    },
    xAxis: {
      type: 'category',
      data: evaluationRecords.map(r => `${r.year}-${String(r.month).padStart(2, '0')}`)
    },
    yAxis: { 
      type: 'value', 
      name: '同比变化(%)',
      axisLabel: { formatter: '{value}%' }
    },
    series: [
      {
        type: 'bar',
        data: evaluationRecords.map(r => {
          if (r.lastYearAvgDensity === 0) return 0
          return ((r.avgDensity - r.lastYearAvgDensity) / r.lastYearAvgDensity * 100).toFixed(1)
        }),
        itemStyle: {
          color: (params: any) => params.data >= 0 ? '#f5222d' : '#52c41a'
        }
      }
    ]
  }

  const historicalColumns: ColumnsType<HistoricalCase> = [
    {
      title: '发生日期',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location'
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
      title: '面积(亩)',
      dataIndex: 'area',
      key: 'area',
      width: 100
    },
    {
      title: '处置方式',
      dataIndex: 'disposalMethod',
      key: 'disposalMethod',
      width: 100
    },
    {
      title: '处置结果',
      dataIndex: 'result',
      key: 'result',
      ellipsis: true
    },
    {
      title: '费用(元)',
      dataIndex: 'cost',
      key: 'cost',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: () => <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
    }
  ]

  const reportColumns: ColumnsType<PublicReport> = [
    {
      title: '举报人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location'
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
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '举报时间',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          '待核实': 'default',
          '已核实': 'processing',
          '已处置': 'success',
          '已驳回': 'error'
        }
        return <Tag color={colors[status]}>{status}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewReport(record)}>查看</Button>
          {record.status === '待核实' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleVerify(record)}>处理</Button>
          )}
        </Space>
      )
    }
  ]

  const monthlyReportColumns: ColumnsType<MonthlyReport> = [
    {
      title: '年月',
      key: 'month',
      width: 120,
      render: (_, record) => `${record.year}年${record.month}月`
    },
    {
      title: '新增样本',
      dataIndex: 'newSamples',
      key: 'newSamples',
      width: 100
    },
    {
      title: '群众上报',
      dataIndex: 'publicReports',
      key: 'publicReports',
      width: 100
    },
    {
      title: '完成工单',
      dataIndex: 'completedOrders',
      key: 'completedOrders',
      width: 100
    },
    {
      title: '清理疫木',
      dataIndex: 'woodCount',
      key: 'woodCount',
      width: 100
    },
    {
      title: '处置面积(亩)',
      dataIndex: 'disposalArea',
      key: 'disposalArea',
      width: 120
    },
    {
      title: '药剂使用',
      dataIndex: 'pesticideUsage',
      key: 'pesticideUsage',
      width: 100
    },
    {
      title: '平均密度',
      dataIndex: 'avgDensity',
      key: 'avgDensity',
      width: 100
    },
    {
      title: '同比变化',
      key: 'change',
      width: 100,
      render: (_, record) => {
        if (record.lastYearAvgDensity === 0) return '-'
        const change = ((record.avgDensity - record.lastYearAvgDensity) / record.lastYearAvgDensity * 100).toFixed(1)
        return (
          <span style={{ color: Number(change) > 0 ? '#f5222d' : '#52c41a' }}>
            {Number(change) > 0 ? '+' : ''}{change}%
          </span>
        )
      }
    },
    {
      title: '生成时间',
      dataIndex: 'generatedDate',
      key: 'generatedDate',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewMonthlyReport(record)}>查看</Button>
          <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => handlePrintMonthlyReport(record)}>打印</Button>
        </Space>
      )
    }
  ]

  const handleViewReport = (record: PublicReport) => {
    setViewingReport(record)
    setReportModalVisible(true)
  }

  const handleVerify = (record: PublicReport) => {
    setViewingReport(record)
    handleForm.resetFields()
    setHandleModalVisible(true)
  }

  const handleHandleSubmit = () => {
    handleForm.validateFields().then(values => {
      if (viewingReport) {
        setPublicReports(prev =>
          prev.map(r =>
            r.id === viewingReport.id
              ? {
                  ...r,
                  status: values.status,
                  handler: values.handler,
                  handleDate: dayjs().format('YYYY-MM-DD'),
                  handleResult: values.handleResult
                }
              : r
          )
        )
        message.success('处理完成')
        setHandleModalVisible(false)
      }
    })
  }

  const handleAddReport = () => {
    reportForm.resetFields()
    setReportPhotos([])
    setViewingReport(null)
    setReportModalVisible(true)
  }

  const handleReportSubmit = () => {
    reportForm.validateFields().then(values => {
      const newReport: PublicReport = {
        id: uuidv4(),
        ...values,
        reportDate: dayjs().format('YYYY-MM-DD'),
        status: '待核实',
        photos: reportPhotos
      }
      setPublicReports(prev => [...prev, newReport])
      message.success('举报记录已登记')
      setReportModalVisible(false)
    })
  }

  const handleViewMonthlyReport = (record: MonthlyReport) => {
    setViewingMonthlyReport(record)
    setViewReportModalVisible(true)
  }

  const handleGenerateMonthlyReport = () => {
    const existing = monthlyReports.find(r => r.year === selectedYear && r.month === selectedMonth)
    if (existing) {
      message.warning('该月月报已存在')
      return
    }

    const newReport: MonthlyReport = {
      id: uuidv4(),
      year: selectedYear,
      month: selectedMonth,
      newSamples: monthlyStats.newSamples,
      publicReports: monthlyStats.newReports,
      completedOrders: monthlyStats.completedOrders,
      woodCount: monthlyStats.totalWood,
      disposalArea: monthlyStats.disposalArea,
      pesticideUsage: monthlyStats.pesticideUsage,
      avgDensity: monthlyStats.avgDensity,
      lastYearAvgDensity: monthlyStats.lastYearAvgDensity,
      newMonitoringPoints: 0,
      activeTraps: 0,
      generatedDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      generatedBy: '管理员'
    }

    setMonthlyReports(prev => [...prev, newReport])
    message.success('月报生成成功')
  }

  const handleExportMonthly = () => {
    const stats = monthlyStats
    const densityChangeText = Number(stats.densityChange) > 0 
      ? `上升 ${stats.densityChange}%` 
      : `下降 ${Math.abs(Number(stats.densityChange))}%`

    const content = `
林业病虫害监测月报
${selectedYear}年${selectedMonth}月

一、总体概况
- 报告周期：${selectedYear}年${selectedMonth}月
- 生成时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}

二、监测数据
- 本月新增样本：${stats.newSamples} 份
- 本月群众上报：${stats.newReports} 起
- 本月完成工单：${stats.completedOrders} 单

三、处置情况
- 清理疫木数量：${stats.totalWood} 株
- 累计处置面积：${stats.disposalArea} 亩
- 药剂使用量：${stats.pesticideUsage} 单位

四、虫情分析
- 本月平均虫口密度：${stats.avgDensity}
- 去年同期密度：${stats.lastYearAvgDensity}
- 同比变化：${densityChangeText}

五、工作总结
[此处可填写本月工作总结]

六、下月计划
[此处可填写下月工作计划]

报告生成单位：林业站
报告生成人：管理员
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `林业病虫害月报_${selectedYear}${String(selectedMonth).padStart(2, '0')}.txt`
    link.click()
    message.success('月报导出成功')
  }

  const handlePrintMonthlyReport = (record: MonthlyReport) => {
    const densityChange = record.lastYearAvgDensity > 0 
      ? ((record.avgDensity - record.lastYearAvgDensity) / record.lastYearAvgDensity * 100).toFixed(1)
      : '0'
    const densityChangeText = Number(densityChange) > 0 
      ? `上升 ${densityChange}%` 
      : `下降 ${Math.abs(Number(densityChange))}%`

    const printContent = `
      <div style="font-family: 'Microsoft YaHei', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 10px;">林业病虫害监测月报</h1>
        <h2 style="text-align: center; font-size: 18px; color: #666; margin-bottom: 30px;">${record.year}年${record.month}月</h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #1890ff; padding-bottom: 5px; margin-bottom: 15px;">一、总体概况</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; width: 30%; background: #f5f5f5;">报告周期</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${record.year}年${record.month}月</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">生成时间</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${record.generatedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">生成人</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${record.generatedBy}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #1890ff; padding-bottom: 5px; margin-bottom: 15px;">二、监测数据</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; width: 30%; background: #f5f5f5;">本月新增样本</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${record.newSamples} 份</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">本月群众上报</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${record.publicReports} 起</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">本月完成工单</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${record.completedOrders} 单</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #1890ff; padding-bottom: 5px; margin-bottom: 15px;">三、处置情况</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; width: 30%; background: #f5f5f5;">清理疫木数量</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${record.woodCount} 株</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">累计处置面积</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${record.disposalArea} 亩</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">药剂使用量</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${record.pesticideUsage} 单位</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #1890ff; padding-bottom: 5px; margin-bottom: 15px;">四、虫情分析</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; width: 30%; background: #f5f5f5;">本月平均虫口密度</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${record.avgDensity}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">去年同期密度</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${record.lastYearAvgDensity}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">同比变化</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: ${Number(densityChange) > 0 ? '#f5222d' : '#52c41a'};">${densityChangeText}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #000; width: 150px; padding-top: 5px; font-size: 12px;">报告人签字</div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #000; width: 150px; padding-top: 5px; font-size: 12px;">审核人签字</div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #000; width: 150px; padding-top: 5px; font-size: 12px;">单位盖章</div>
          </div>
        </div>
      </div>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>林业病虫害月报_${record.year}${String(record.month).padStart(2, '0')}</title>
          <style>
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${printContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const getCurrentMonthStats = () => {
    return {
      completedOrders: workOrders.filter(w => w.status === '已完成').length,
      totalArea: totalArea,
      totalWood: workOrders.filter(w => w.status === '已完成').reduce((sum, w) => sum + w.woodCount, 0),
      totalPesticide: pesticideUsages.reduce((sum, u) => sum + u.quantity, 0),
      handledReports: publicReports.filter(r => r.status === '已处置' || r.status === '已核实').length
    }
  }

  const stats = getCurrentMonthStats()

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="历史病例"
              value={totalCases}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="群众举报"
              value={totalReports}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={pendingReports > 0 ? <Tag color="red">{pendingReports}待处理</Tag> : undefined}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="累计处置面积"
              value={totalArea}
              suffix="亩"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="本月完成工单"
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="累计清理疫木"
              value={stats.totalWood}
              suffix="株"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="累计药剂使用"
              value={stats.totalPesticide}
              suffix="单位"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="总体成效" key="overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="虫口密度对比（今年vs去年同期）">
                  <ReactECharts option={densityCompareOption} style={{ height: 300 }} />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="处置趋势">
                  <ReactECharts option={disposalTrendOption} style={{ height: 300 }} />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={8}>
                <Card title="病虫害类型分布">
                  <ReactECharts option={pestTypeStatsOption} style={{ height: 280 }} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card title="虫口密度同比变化">
                  <ReactECharts option={monthlyDensityChangeOption} style={{ height: 280 }} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card 
                  title="月度概览" 
                  extra={
                    <Space>
                      <Select
                        value={selectedYear}
                        style={{ width: 100 }}
                        onChange={setSelectedYear}
                      >
                        {[2024, 2025, 2026, 2027].map(y => (
                          <Option key={y} value={y}>{y}年</Option>
                        ))}
                      </Select>
                      <Select
                        value={selectedMonth}
                        style={{ width: 80 }}
                        onChange={setSelectedMonth}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <Option key={m} value={m}>{m}月</Option>
                        ))}
                      </Select>
                    </Space>
                  }
                >
                  <List
                    dataSource={[
                      { label: '新增样本', value: monthlyStats.newSamples, unit: '份' },
                      { label: '群众上报', value: monthlyStats.newReports, unit: '起' },
                      { label: '完成工单', value: monthlyStats.completedOrders, unit: '单' },
                      { label: '清理疫木', value: monthlyStats.totalWood, unit: '株' },
                      { label: '处置面积', value: monthlyStats.disposalArea, unit: '亩' },
                      { label: '药剂使用', value: monthlyStats.pesticideUsage, unit: '单位' },
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <span>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.value} {item.unit}</span>
                      </List.Item>
                    )}
                  />
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ fontSize: 12, color: '#666' }}>
                    虫口密度同比：
                    <span style={{ 
                      color: Number(monthlyStats.densityChange) > 0 ? '#f5222d' : '#52c41a',
                      fontWeight: 600,
                      marginLeft: 8
                    }}>
                      {Number(monthlyStats.densityChange) > 0 ? '+' : ''}{monthlyStats.densityChange}%
                    </span>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card 
              title="月度评估数据" 
              style={{ marginTop: 16 }}
              extra={
                <Space>
                  <Button icon={<BarChartOutlined />} onClick={handleGenerateMonthlyReport}>
                    生成月报
                  </Button>
                  <Button icon={<ExportOutlined />} onClick={handleExportMonthly}>
                    导出月报
                  </Button>
                </Space>
              }
            >
              <Table
                dataSource={evaluationRecords}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: '年月', key: 'month', render: (_, r) => `${r.year}-${String(r.month).padStart(2, '0')}` },
                  { title: '病虫害类型', dataIndex: 'pestType', key: 'pestType' },
                  { title: '监测点', dataIndex: 'monitoringPointCount', key: 'mpc' },
                  { title: '诱捕器', dataIndex: 'trapCount', key: 'tc' },
                  { title: '虫口总数', dataIndex: 'totalPestCount', key: 'tpc' },
                  { 
                    title: '平均密度', 
                    dataIndex: 'avgDensity', 
                    key: 'ad',
                    render: (val, record) => (
                      <span>
                        {val}
                        {val < record.lastYearAvgDensity 
                          ? <Tag color="green" style={{ marginLeft: 4 }}>↓下降</Tag>
                          : <Tag color="red" style={{ marginLeft: 4 }}>↑上升</Tag>
                        }
                      </span>
                    )
                  },
                  { title: '去年同期', dataIndex: 'lastYearAvgDensity', key: 'lyad' },
                  { title: '处置面积(亩)', dataIndex: 'disposalArea', key: 'da' },
                  { title: '清理疫木', dataIndex: 'woodCount', key: 'wc' }
                ]}
              />
            </Card>
          </TabPane>

          <TabPane tab="月报管理" key="monthly">
            <Card
              extra={
                <Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleGenerateMonthlyReport}>
                    生成月报
                  </Button>
                </Space>
              }
            >
              {monthlyReports.length > 0 ? (
                <Table
                  columns={monthlyReportColumns}
                  dataSource={monthlyReports.sort((a, b) => 
                    b.year * 12 + b.month - (a.year * 12 + a.month)
                  )}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="暂无月报数据，请点击上方按钮生成月报" />
              )}
            </Card>
          </TabPane>

          <TabPane tab="历史病例" key="cases">
            <Table
              columns={historicalColumns}
              dataSource={historicalCases}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span>群众举报 {pendingReports > 0 && <Tag color="red">{pendingReports}</Tag>}</span>} key="reports">
            <Card
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddReport}>
                  登记举报
                </Button>
              }
            >
              <Table
                columns={reportColumns}
                dataSource={publicReports}
                rowKey="id"
                scroll={{ x: 1000 }}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={viewingReport ? '举报详情' : '登记群众举报'}
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={viewingReport ? null : [
          <Button key="cancel" onClick={() => setReportModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleReportSubmit}>提交</Button>
        ]}
        width={600}
      >
        {viewingReport ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="举报人">{viewingReport.reporter}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{viewingReport.phone}</Descriptions.Item>
            <Descriptions.Item label="地点">{viewingReport.location}</Descriptions.Item>
            <Descriptions.Item label="病虫害类型">{viewingReport.pestType}</Descriptions.Item>
            <Descriptions.Item label="描述">{viewingReport.description}</Descriptions.Item>
            <Descriptions.Item label="举报时间">{viewingReport.reportDate}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={
                viewingReport.status === '已处置' ? 'green' :
                viewingReport.status === '已核实' ? 'blue' :
                viewingReport.status === '已驳回' ? 'red' : 'default'
              }>
                {viewingReport.status}
              </Tag>
            </Descriptions.Item>
            {viewingReport.handler && (
              <Descriptions.Item label="处理人">{viewingReport.handler}</Descriptions.Item>
            )}
            {viewingReport.handleDate && (
              <Descriptions.Item label="处理时间">{viewingReport.handleDate}</Descriptions.Item>
            )}
            {viewingReport.handleResult && (
              <Descriptions.Item label="处理结果">{viewingReport.handleResult}</Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <Form form={reportForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="reporter"
                  label="举报人姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入举报人姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入电话' }]}
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="location"
              label="发现地点"
              rules={[{ required: true, message: '请输入地点' }]}
            >
              <Input placeholder="请输入具体地点" />
            </Form.Item>
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
            </Row>
            <Form.Item
              name="description"
              label="情况描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <TextArea rows={4} placeholder="请详细描述发现的情况" />
            </Form.Item>
            <Form.Item label="现场照片">
              <Upload listType="picture-card" beforeUpload={() => false}>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </Upload>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="处理举报"
        open={handleModalVisible}
        onOk={handleHandleSubmit}
        onCancel={() => setHandleModalVisible(false)}
        width={500}
      >
        <Form form={handleForm} layout="vertical">
          <Form.Item
            name="status"
            label="处理状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择">
              <Option value="已核实">已核实</Option>
              <Option value="已处置">已处置</Option>
              <Option value="已驳回">已驳回</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="handler"
            label="处理人"
            rules={[{ required: true, message: '请输入处理人' }]}
          >
            <Input placeholder="请输入处理人姓名" />
          </Form.Item>
          <Form.Item
            name="handleResult"
            label="处理结果"
            rules={[{ required: true, message: '请输入处理结果' }]}
          >
            <TextArea rows={4} placeholder="请输入处理结果说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="月报详情"
        open={viewReportModalVisible}
        onCancel={() => setViewReportModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setViewReportModalVisible(false)}>关闭</Button>,
          <Button key="print" icon={<PrinterOutlined />} onClick={() => viewingMonthlyReport && handlePrintMonthlyReport(viewingMonthlyReport)}>
            打印
          </Button>
        ]}
      >
        {viewingMonthlyReport && (
          <div ref={printRef}>
            <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
              林业病虫害监测月报 - {viewingMonthlyReport.year}年{viewingMonthlyReport.month}月
            </h2>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="生成时间">{viewingMonthlyReport.generatedDate}</Descriptions.Item>
              <Descriptions.Item label="生成人">{viewingMonthlyReport.generatedBy}</Descriptions.Item>
              <Descriptions.Item label="新增样本">{viewingMonthlyReport.newSamples} 份</Descriptions.Item>
              <Descriptions.Item label="群众上报">{viewingMonthlyReport.publicReports} 起</Descriptions.Item>
              <Descriptions.Item label="完成工单">{viewingMonthlyReport.completedOrders} 单</Descriptions.Item>
              <Descriptions.Item label="清理疫木">{viewingMonthlyReport.woodCount} 株</Descriptions.Item>
              <Descriptions.Item label="处置面积">{viewingMonthlyReport.disposalArea} 亩</Descriptions.Item>
              <Descriptions.Item label="药剂使用">{viewingMonthlyReport.pesticideUsage} 单位</Descriptions.Item>
              <Descriptions.Item label="本月平均密度">{viewingMonthlyReport.avgDensity}</Descriptions.Item>
              <Descriptions.Item label="去年同期密度">{viewingMonthlyReport.lastYearAvgDensity}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Evaluation
