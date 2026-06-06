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
  Pagination
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
  SearchOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { WorkOrder, WoodRecord, WorkOrderStatus, DisposalMethod } from '../types'
import { isOverdue, getWorkOrderDisplayStatus, handleFileUpload, generateCode } from '../utils'
import WorkOrderPrint from '../components/WorkOrderPrint'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const WorkOrders: React.FC = () => {
  const {
    workOrders,
    setWorkOrders,
    monitoringPoints,
    publicReports,
    setPublicReports
  } = useApp()

  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [resultVisible, setResultVisible] = useState(false)
  const [reviewVisible, setReviewVisible] = useState(false)
  const [printVisible, setPrintVisible] = useState(false)
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<WorkOrder | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [form] = Form.useForm()
  const [resultForm] = Form.useForm()
  const [reviewForm] = Form.useForm()
  const [disposalPhotos, setDisposalPhotos] = useState<string[]>([])
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([])
  const [woodPage, setWoodPage] = useState(1)
  const WOOD_PAGE_SIZE = 10

  const overdueCount = useMemo(() => 
    workOrders.filter(w => isOverdue(w.deadline, w.status)).length,
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
        return workOrders.filter(w => isOverdue(w.deadline, w.status))
      case 'pendingReview':
        return workOrders.filter(w => w.status === '待复查')
      default:
        return workOrders.filter(w => w.status === activeTab)
    }
  }

  const generateWoodRecords = (order: WorkOrder): WoodRecord[] => {
    if (order.woodRecords && order.woodRecords.length > 0) {
      return order.woodRecords
    }
    const species = ['马尾松', '黑松', '湿地松', '火炬松', '黄山松']
    const records: WoodRecord[] = []
    for (let i = 1; i <= order.woodCount; i++) {
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
        const overdue = isOverdue(date, record.status)
        return (
          <span style={{ color: overdue ? '#ff4d4f' : 'inherit' }}>
            {date}
            {overdue && <Tag color="red" style={{ marginLeft: 4 }}>超期</Tag>}
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
              <Button type="link" size="small" icon={<SearchOutlined />} onClick={() => handleReview(record)}>复查</Button>
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
    setWorkOrders(prev =>
      prev.map(w => w.id === record.id ? { ...w, status: '处理中' } : w)
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
          reviewPhotos: []
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
        const woodRecords = generateWoodRecords(viewingOrder)
        setWorkOrders(prev =>
          prev.map(w =>
            w.id === viewingOrder.id
              ? {
                  ...w,
                  status: '待复查' as WorkOrderStatus,
                  disposalResult: values.disposalResult,
                  disposalDate: values.disposalDate.format('YYYY-MM-DD'),
                  disposalMethod: values.disposalMethod,
                  woodCount: values.woodCount || w.woodCount,
                  woodRecords: woodRecords,
                  reviewDeadline: values.reviewDeadline.format('YYYY-MM-DD'),
                  disposalPhotos: disposalPhotos
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
        setWorkOrders(prev =>
          prev.map(w =>
            w.id === viewingOrder.id
              ? {
                  ...w,
                  status: '已完成' as WorkOrderStatus,
                  reviewDate: values.reviewDate.format('YYYY-MM-DD'),
                  reviewResult: values.reviewResult,
                  reviewer: values.reviewer,
                  reviewPhotos: reviewPhotos
                }
              : w
          )
        )
        message.success('复查完成，工单已关闭')
        setReviewVisible(false)
      }
    })
  }

  const handlePrint = (record: WorkOrder) => {
    setViewingOrder(record)
    setPrintVisible(true)
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
              <Descriptions.Item label="截止日期">
                {viewingOrder.deadline}
                {isOverdue(viewingOrder.deadline, viewingOrder.status) && <Tag color="red" style={{ marginLeft: 8 }}>超期</Tag>}
              </Descriptions.Item>
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

            {viewingOrder.woodCount > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 8 }}>
                  疫木清理清单（共 {generateWoodRecords(viewingOrder).length} 株）
                </h4>
                <Table
                  dataSource={generateWoodRecords(viewingOrder).slice(
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
                    total={generateWoodRecords(viewingOrder).length}
                    onChange={setWoodPage}
                    size="small"
                  />
                </div>
              </div>
            )}

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
          </div>
        )}
      </Modal>

      {printVisible && viewingOrder && (
        <WorkOrderPrint
          order={viewingOrder}
          woodRecords={generateWoodRecords(viewingOrder)}
        />
      )}
    </div>
  )
}

export default WorkOrders
