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
  Alert,
  Descriptions,
  List,
  Popconfirm
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  WarningOutlined,
  ExportOutlined,
  InboxOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { Pesticide } from '../types'

const { Option } = Select
const { TextArea } = Input

const PesticideInventory: React.FC = () => {
  const { pesticides, setPesticides, pesticideUsages, setPesticideUsages, workOrders } = useApp()
  const [modalVisible, setModalVisible] = useState(false)
  const [usageModalVisible, setUsageModalVisible] = useState(false)
  const [editingPesticide, setEditingPesticide] = useState<Pesticide | null>(null)
  const [form] = Form.useForm()
  const [usageForm] = Form.useForm()

  const totalValue = pesticides.reduce((sum, p) => sum + p.stock, 0)
  const lowStockCount = pesticides.filter(p => p.stock < p.warningStock).length
  const expiredSoonCount = pesticides.filter(p => 
    dayjs(p.expiryDate).diff(dayjs(), 'month') <= 3
  ).length
  const totalUsage = pesticideUsages.reduce((sum, u) => sum + u.quantity, 0)
  const totalArea = pesticideUsages.reduce((sum, u) => sum + u.area, 0)

  const columns: ColumnsType<Pesticide> = [
    {
      title: '药剂名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 150
    },
    {
      title: '生产厂家',
      dataIndex: 'manufacturer',
      key: 'manufacturer'
    },
    {
      title: '库存数量',
      dataIndex: 'stock',
      key: 'stock',
      width: 120,
      render: (stock: number, record) => {
        const isLow = stock < record.warningStock
        return (
          <span style={{ color: isLow ? '#ff4d4f' : 'inherit', fontWeight: isLow ? 600 : 'normal' }}>
            {stock} {record.unit}
            {isLow && <Tag color="red" style={{ marginLeft: 8 }}>库存不足</Tag>}
          </span>
        )
      }
    },
    {
      title: '预警库存',
      dataIndex: 'warningStock',
      key: 'warningStock',
      width: 100,
      render: (value: number, record) => `${value} ${record.unit}`
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80
    },
    {
      title: '采购日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 120
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => {
        const diff = dayjs(date).diff(dayjs(), 'month')
        const isExpiringSoon = diff <= 3
        return (
          <span style={{ color: isExpiringSoon ? '#faad14' : 'inherit' }}>
            {date}
            {isExpiringSoon && <Tag color="orange" style={{ marginLeft: 8 }}>即将过期</Tag>}
          </span>
        )
      }
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定删除此药剂？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const usageColumns: ColumnsType<typeof pesticideUsages[0]> = [
    {
      title: '使用日期',
      dataIndex: 'usageDate',
      key: 'usageDate',
      width: 120
    },
    {
      title: '药剂名称',
      dataIndex: 'pesticideName',
      key: 'pesticideName',
      width: 120
    },
    {
      title: '使用数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (val, record) => `${val} ${record.unit}`
    },
    {
      title: '防治面积',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      render: (val) => `${val} 亩`
    },
    {
      title: '使用地点',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: '操作人员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    }
  ]

  const handleEdit = (record: Pesticide) => {
    setEditingPesticide(record)
    form.setFieldsValue({
      ...record,
      purchaseDate: dayjs(record.purchaseDate),
      expiryDate: dayjs(record.expiryDate)
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingPesticide(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    setPesticides(prev => prev.filter(p => p.id !== id))
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const formattedValues = {
        ...values,
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate.format('YYYY-MM-DD')
      }

      if (editingPesticide) {
        setPesticides(prev =>
          prev.map(p => (p.id === editingPesticide.id ? { ...p, ...formattedValues } : p))
        )
        message.success('药剂信息更新成功')
      } else {
        const newPesticide: Pesticide = {
          id: uuidv4(),
          ...formattedValues
        }
        setPesticides(prev => [...prev, newPesticide])
        message.success('药剂入库成功')
      }
      setModalVisible(false)
    })
  }

  const handleUsageSubmit = () => {
    usageForm.validateFields().then(values => {
      const pesticide = pesticides.find(p => p.id === values.pesticideId)
      if (pesticide && pesticide.stock < values.quantity) {
        message.error('库存不足')
        return
      }

      const newUsage = {
        id: uuidv4(),
        ...values,
        pesticideName: pesticide?.name || '',
        usageDate: values.usageDate.format('YYYY-MM-DD')
      }

      setPesticideUsages(prev => [...prev, newUsage])
      setPesticides(prev =>
        prev.map(p =>
          p.id === values.pesticideId
            ? { ...p, stock: p.stock - values.quantity }
            : p
        )
      )
      message.success('使用记录已登记')
      setUsageModalVisible(false)
      usageForm.resetFields()
    })
  }

  const handleExport = () => {
    const csvContent = [
      ['药剂名称', '规格', '生产厂家', '库存数量', '单位', '采购日期', '有效期至'].join(','),
      ...pesticides.map(p => [
        p.name,
        p.specification,
        p.manufacturer,
        p.stock,
        p.unit,
        p.purchaseDate,
        p.expiryDate
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `药剂库存_${dayjs().format('YYYYMMDD')}.csv`
    link.click()
    message.success('导出成功')
  }

  return (
    <div>
      {(lowStockCount > 0 || expiredSoonCount > 0) && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {lowStockCount > 0 && (
            <Col xs={24} md={12}>
              <Alert
                message={`有 ${lowStockCount} 种药剂库存不足，请及时采购`}
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            </Col>
          )}
          {expiredSoonCount > 0 && (
            <Col xs={24} md={12}>
              <Alert
                message={`有 ${expiredSoonCount} 种药剂即将过期`}
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            </Col>
          )}
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="药剂种类"
              value={pesticides.length}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总库存量"
              value={totalValue}
              suffix="单位"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="累计使用量"
              value={totalUsage}
              suffix="单位"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="累计防治面积"
              value={totalArea}
              suffix="亩"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card
            title="药剂库存"
            extra={
              <Space>
                <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
                <Button icon={<PlusOutlined />} onClick={() => setUsageModalVisible(true)}>登记使用</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  入库登记
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={pesticides}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="库存预警">
            <List
              dataSource={pesticides.filter(p => p.stock < p.warningStock || dayjs(p.expiryDate).diff(dayjs(), 'month') <= 3)}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Tag color={item.stock < item.warningStock ? 'red' : 'orange'}>
                        {item.stock < item.warningStock ? '缺' : '警'}
                      </Tag>
                    }
                    title={item.name}
                    description={
                      <div>
                        <div>库存：{item.stock} {item.unit}（预警：{item.warningStock}）</div>
                        <div>有效期至：{item.expiryDate}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="使用记录" style={{ marginTop: 16 }}>
        <Table
          columns={usageColumns}
          dataSource={pesticideUsages}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPesticide ? '编辑药剂信息' : '药剂入库登记'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="药剂名称"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="请输入药剂名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specification"
                label="规格"
                rules={[{ required: true, message: '请输入规格' }]}
              >
                <Input placeholder="如：25%可湿性粉剂" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="manufacturer"
            label="生产厂家"
            rules={[{ required: true, message: '请输入生产厂家' }]}
          >
            <Input placeholder="请输入生产厂家" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="库存数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Select placeholder="请选择">
                  <Option value="kg">kg</Option>
                  <Option value="L">L</Option>
                  <Option value="瓶">瓶</Option>
                  <Option value="袋">袋</Option>
                  <Option value="箱">箱</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="warningStock"
                label="预警库存"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="采购日期"
                rules={[{ required: true, message: '请选择' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="有效期至"
                rules={[{ required: true, message: '请选择' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="登记药剂使用"
        open={usageModalVisible}
        onOk={handleUsageSubmit}
        onCancel={() => setUsageModalVisible(false)}
        width={500}
      >
        <Form form={usageForm} layout="vertical">
          <Form.Item
            name="pesticideId"
            label="选择药剂"
            rules={[{ required: true, message: '请选择药剂' }]}
          >
            <Select placeholder="请选择药剂">
              {pesticides.map(p => (
                <Option key={p.id} value={p.id}>
                  {p.name} ({p.specification}) - 库存: {p.stock}{p.unit}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="使用数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="area"
                label="防治面积(亩)"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="usageDate"
            label="使用日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operator"
                label="操作人员"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="使用地点"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input placeholder="请输入地点" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="workOrderId"
            label="关联工单"
          >
            <Select placeholder="请选择（可选）" allowClear>
              {workOrders.map(w => (
                <Option key={w.id} value={w.id}>{w.code} - {w.monitoringPointName}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PesticideInventory
