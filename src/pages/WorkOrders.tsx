import React, { useState, useRef } from 'react'
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
  Alert
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  FileTextOutlined,
  WarningOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { WorkOrder, DisposalMethod } from '../types'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const WorkOrders: React.FC = () => {
  const { workOrders, setWorkOrders, monitoringPoints, publicReports, setPublicReports } = useApp()
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [resultVisible, setResultVisible] = useState(false)
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<WorkOrder | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [form] = Form.useForm()
  const [resultForm] = Form.useForm()
  const printRef = useRef<HTMLDivElement>(null)

  const pendingCount = workOrders.filter(w => w.status === '待处理').length
  const processingCount = workOrders.filter(w => w.status === '处理中').length
  const completedCount = workOrders.filter(w => w.status === '已完成').length
  const overdueCount = workOrders.filter(w => w.status === '已超期').length

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
      render: (date: string) => {
        const isOverdue = dayjs(date).isBefore(dayjs())
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            {date}
          </span>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          '待处理': 'default',
          '处理中': 'processing',
          '已完成': 'success',
          '已超期': 'error'
        }
        return <Tag color={colors[status]}>{status}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === '待处理' && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          )}
          {(record.status === '待处理' || record.status === '处理中') && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleRecordResult(record)}>登记结果</Button>
          )}
          <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>打印</Button>
        </Space>
      )
    }
  ]

  const getFilteredData = () => {
    if (activeTab === 'all') return workOrders
    if (activeTab === 'overdue') return workOrders.filter(w => w.status === '已超期')
    return workOrders.filter(w => w.status === activeTab)
  }

  const handleView = (record: WorkOrder) => {
    setViewingOrder(record)
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
      code: `WO-${dayjs().format('YYYY')}-${String(workOrders.length + 1).padStart(3, '0')}`,
      createDate: dayjs(),
      status: '待处理'
    })
    setModalVisible(true)
  }

  const handleRecordResult = (record: WorkOrder) => {
    setViewingOrder(record)
    resultForm.resetFields()
    resultForm.setFieldsValue({
      disposalDate: dayjs(),
      disposalMethod: record.disposalMethod
    })
    setResultVisible(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const mp = monitoringPoints.find(m => m.id === values.monitoringPointId)
      const formattedValues = {
        ...values,
        createDate: values.createDate.format('YYYY-MM-DD'),
        deadline: values.deadline.format('YYYY-MM-DD'),
        monitoringPointName: mp?.name || '',
        photos: []
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
          photos: []
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
        setWorkOrders(prev =>
          prev.map(w =>
            w.id === viewingOrder.id
              ? {
                  ...w,
                  status: '已完成',
                  disposalResult: values.disposalResult,
                  disposalDate: values.disposalDate.format('YYYY-MM-DD'),
                  disposalMethod: values.disposalMethod,
                  woodCount: values.woodCount || w.woodCount
                }
              : w
          )
        )
        message.success('处置结果已登记')
        setResultVisible(false)
      }
    })
  }

  const handlePrint = (record: WorkOrder) => {
    setViewingOrder(record)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const generateWoodList = (order: WorkOrder) => {
    const trees = []
    for (let i = 1; i <= Math.min(order.woodCount, 10); i++) {
      trees.push({
        no: i,
        location: `${order.location} - 第${i}号`,
        diameter: Math.floor(Math.random() * 20 + 10),
        height: Math.floor(Math.random() * 10 + 5),
        status: order.disposalMethod
      })
    }
    return trees
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
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="处理中"
              value={processingCount}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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
                label="疫木数量"
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
        width={500}
      >
        <Form form={resultForm} layout="vertical">
          <Form.Item
            name="disposalDate"
            label="处置日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
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
          <Form.Item
            name="woodCount"
            label="实际清理疫木数量"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="disposalResult"
            label="处置结果说明"
            rules={[{ required: true, message: '请输入处置结果' }]}
          >
            <TextArea rows={4} placeholder="请详细描述处置结果" />
          </Form.Item>
          <Form.Item label="现场照片">
            <Upload listType="picture-card" beforeUpload={() => false}>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="工单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button key="print" icon={<PrinterOutlined />} onClick={() => viewingOrder && handlePrint(viewingOrder)}>打印处置单</Button>
        ]}
        width={700}
      >
        {viewingOrder && (
          <div ref={printRef} className="print-content">
            <Descriptions bordered title="现场处置单" column={2}>
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
              <Descriptions.Item label="截止日期">{viewingOrder.deadline}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={
                  viewingOrder.status === '已完成' ? 'green' :
                  viewingOrder.status === '处理中' ? 'blue' :
                  viewingOrder.status === '已超期' ? 'red' : 'default'
                }>
                  {viewingOrder.status}
                </Tag>
              </Descriptions.Item>
              {viewingOrder.disposalDate && (
                <Descriptions.Item label="处置日期">{viewingOrder.disposalDate}</Descriptions.Item>
              )}
              {viewingOrder.disposalResult && (
                <Descriptions.Item label="处置结果" span={2}>
                  {viewingOrder.disposalResult}
                </Descriptions.Item>
              )}
            </Descriptions>

            {viewingOrder.woodCount > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 8 }}>疫木清理清单</h4>
                <Table
                  dataSource={generateWoodList(viewingOrder)}
                  size="small"
                  pagination={false}
                  rowKey="no"
                  columns={[
                    { title: '序号', dataIndex: 'no', key: 'no', width: 60 },
                    { title: '位置', dataIndex: 'location', key: 'location' },
                    { title: '胸径(cm)', dataIndex: 'diameter', key: 'diameter', width: 100 },
                    { title: '树高(m)', dataIndex: 'height', key: 'height', width: 100 },
                    { title: '处置方式', dataIndex: 'status', key: 'status', width: 100 }
                  ]}
                />
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div>处置人签字：_______________</div>
              </div>
              <div>
                <div>日期：{dayjs().format('YYYY年MM月DD日')}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WorkOrders
