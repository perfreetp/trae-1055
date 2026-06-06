import React, { useState } from 'react'
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
  Divider
} from 'antd'
import {
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  ExportOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { PublicReport, HistoricalCase, EvaluationRecord, PestType } from '../types'

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
    pesticideUsages
  } = useApp()

  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [handleModalVisible, setHandleModalVisible] = useState(false)
  const [viewingReport, setViewingReport] = useState<PublicReport | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [reportForm] = Form.useForm()
  const [handleForm] = Form.useForm()
  const [reportPhotos, setReportPhotos] = useState<string[]>([])

  const totalCases = historicalCases.length
  const totalReports = publicReports.length
  const pendingReports = publicReports.filter(r => r.status === '待核实').length
  const totalArea = workOrders.filter(w => w.status === '已完成').reduce((sum, w) => sum + w.area, 0)

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

  const handleExportMonthly = () => {
    const monthData = evaluationRecords.find(r => r.year === 2026 && r.month === 5)
    if (!monthData) {
      message.error('无本月数据')
      return
    }

    const content = `
林业病虫害监测月报
${monthData.year}年${monthData.month}月

一、监测概况
- 监测点数量：${monthData.monitoringPointCount} 个
- 诱捕器数量：${monthData.trapCount} 个

二、虫情监测
- 病虫害类型：${monthData.pestType}
- 虫口总数：${monthData.totalPestCount} 头
- 平均虫口密度：${monthData.avgDensity}
- 去年同期密度：${monthData.lastYearAvgDensity}
- 同比变化：${((monthData.avgDensity - monthData.lastYearAvgDensity) / monthData.lastYearAvgDensity * 100).toFixed(1)}%

三、处置情况
- 处置面积：${monthData.disposalArea} 亩
- 处置次数：${monthData.disposalCount} 次
- 清理疫木：${monthData.woodCount} 株
- 药剂使用：${monthData.pesticideUsage} 单位

四、群众举报
- 本月收到举报：${publicReports.filter(r => r.reportDate.startsWith(`${monthData.year}-${String(monthData.month).padStart(2, '0')}`)).length} 起
- 已处置：${publicReports.filter(r => r.status === '已处置').length} 起

报告生成时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `林业病虫害月报_${monthData.year}${String(monthData.month).padStart(2, '0')}.txt`
    link.click()
    message.success('月报导出成功')
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
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="历史病例"
              value={totalCases}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="累计处置面积"
              value={totalArea}
              suffix="亩"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月完成工单"
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
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
              <Col xs={24} md={16}>
                <Card title="月度评估数据" extra={
                  <Button icon={<ExportOutlined />} onClick={handleExportMonthly}>
                    导出月报
                  </Button>
                }>
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
              </Col>
            </Row>
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
    </div>
  )
}

export default Evaluation
