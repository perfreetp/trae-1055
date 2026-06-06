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
  Statistic,
  Alert,
  Descriptions,
  List,
  Popconfirm,
  Tabs,
  Divider,
  Upload
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  WarningOutlined,
  ExportOutlined,
  InboxOutlined,
  ImportOutlined,
  ShoppingCartOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { Pesticide, PesticideBatch, InventoryLog } from '../types'
import { generateBatchNo, generateCode, fileToBase64, handleFileUpload } from '../utils'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const PesticideInventory: React.FC = () => {
  const {
    pesticides,
    setPesticides,
    pesticideUsages,
    setPesticideUsages,
    workOrders,
    inventoryLogs,
    setInventoryLogs
  } = useApp()

  const [modalVisible, setModalVisible] = useState(false)
  const [usageModalVisible, setUsageModalVisible] = useState(false)
  const [editUsageVisible, setEditUsageVisible] = useState(false)
  const [batchModalVisible, setBatchModalVisible] = useState(false)
  const [stockInModalVisible, setStockInModalVisible] = useState(false)
  const [viewDetailVisible, setViewDetailVisible] = useState(false)
  const [editingPesticide, setEditingPesticide] = useState<Pesticide | null>(null)
  const [viewingPesticide, setViewingPesticide] = useState<Pesticide | null>(null)
  const [editingUsage, setEditingUsage] = useState<any>(null)
  const [selectedPesticideForBatch, setSelectedPesticideForBatch] = useState<Pesticide | null>(null)
  const [activeTab, setActiveTab] = useState('inventory')
  const [form] = Form.useForm()
  const [usageForm] = Form.useForm()
  const [editUsageForm] = Form.useForm()
  const [batchForm] = Form.useForm()
  const [stockInForm] = Form.useForm()

  const totalValue = pesticides.reduce((sum, p) => sum + p.stock, 0)
  const lowStockCount = pesticides.filter(p => p.stock < p.warningStock).length
  const expiredSoonCount = pesticides.filter(p => 
    dayjs(p.expiryDate).diff(dayjs(), 'month') <= 3 && dayjs(p.expiryDate).isAfter(dayjs())
  ).length
  const expiredCount = pesticides.filter(p => dayjs(p.expiryDate).isBefore(dayjs())).length
  const activeUsages = pesticideUsages.filter(u => !u.voided)
  const totalUsage = activeUsages.reduce((sum, u) => sum + u.quantity, 0)
  const totalArea = activeUsages.reduce((sum, u) => sum + u.area, 0)

  const purchaseSuggestions = useMemo(() => {
    return pesticides
      .filter(p => p.stock < p.warningStock)
      .map(p => ({
        ...p,
        suggestQuantity: Math.max(p.warningStock * 2 - p.stock, p.warningStock)
      }))
  }, [pesticides])

  const columns: ColumnsType<Pesticide> = [
    {
      title: '药剂名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name, record) => (
        <a onClick={() => handleViewDetail(record)}>{name}</a>
      )
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
        const isExpired = dayjs(record.expiryDate).isBefore(dayjs())
        return (
          <span style={{ color: isExpired ? '#999' : isLow ? '#ff4d4f' : 'inherit', fontWeight: isLow ? 600 : 'normal' }}>
            {stock} {record.unit}
            {isExpired && <Tag color="default" style={{ marginLeft: 8 }}>已过期</Tag>}
            {!isExpired && isLow && <Tag color="red" style={{ marginLeft: 8 }}>库存不足</Tag>}
          </span>
        )
      }
    },
    {
      title: '批次数量',
      key: 'batchCount',
      width: 100,
      render: (_, record) => record.batches?.length || 0
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
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => {
        const diff = dayjs(date).diff(dayjs(), 'month')
        const isExpired = dayjs(date).isBefore(dayjs())
        const isExpiringSoon = diff <= 3 && diff >= 0
        return (
          <span style={{ color: isExpired ? '#999' : isExpiringSoon ? '#faad14' : 'inherit' }}>
            {date}
            {isExpired && <Tag color="default" style={{ marginLeft: 8 }}>已过期</Tag>}
            {!isExpired && isExpiringSoon && <Tag color="orange" style={{ marginLeft: 8 }}>即将过期</Tag>}
          </span>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>详情</Button>
          <Button type="link" size="small" icon={<ImportOutlined />} onClick={() => handleStockIn(record)}>入库</Button>
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAddBatch(record)}>批次</Button>
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

  const logColumns: ColumnsType<InventoryLog> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'in' ? 'green' : 'orange'}>
          {type === 'in' ? '入库' : '出库'}
        </Tag>
      )
    },
    {
      title: '药剂名称',
      dataIndex: 'pesticideName',
      key: 'pesticideName',
      width: 150
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (val, record) => `${val} ${record.unit}`
    },
    {
      title: '操作人员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '关联工单',
      dataIndex: 'workOrderCode',
      key: 'workOrderCode',
      width: 150,
      render: (code) => code || '-'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true
    }
  ]

  const batchColumns: ColumnsType<PesticideBatch> = [
    {
      title: '批次号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 150
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (val, record) => `${val} ${record.unit}`
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
        const isExpiringSoon = dayjs(date).diff(dayjs(), 'month') <= 3
        return (
          <span style={{ color: isExpiringSoon ? '#faad14' : 'inherit' }}>
            {date}
          </span>
        )
      }
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier'
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
      title: '关联工单',
      dataIndex: 'workOrderCode',
      key: 'workOrderCode',
      width: 150,
      render: (code) => code || '-'
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
    },
    {
      title: '状态',
      dataIndex: 'voided',
      key: 'voided',
      width: 80,
      render: (voided: boolean) => (
        <Tag color={voided ? 'default' : 'green'}>
          {voided ? '已作废' : '有效'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {!record.voided && (
            <>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditUsage(record)}>编辑</Button>
              <Popconfirm
                title="确定作废此记录？"
                description="作废后将从库存、工单累计和月报统计中扣回"
                onConfirm={() => handleVoidUsage(record)}
                okText="确定作废"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button type="link" size="small" danger>作废</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ]

  const handleViewDetail = (record: Pesticide) => {
    setViewingPesticide(record)
    setViewDetailVisible(true)
  }

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

  const handleAddBatch = (record: Pesticide) => {
    setSelectedPesticideForBatch(record)
    batchForm.resetFields()
    batchForm.setFieldsValue({
      batchNo: generateBatchNo(),
      purchaseDate: dayjs(),
      expiryDate: dayjs().add(2, 'year')
    })
    setBatchModalVisible(true)
  }

  const handleStockIn = (record: Pesticide) => {
    setSelectedPesticideForBatch(record)
    stockInForm.resetFields()
    stockInForm.setFieldsValue({
      date: dayjs(),
      pesticideId: record.id,
      pesticideName: record.name
    })
    setStockInModalVisible(true)
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
        const initialBatch: PesticideBatch = {
          id: uuidv4(),
          pesticideId: '',
          batchNo: generateBatchNo(),
          quantity: formattedValues.stock,
          unit: formattedValues.unit,
          purchaseDate: formattedValues.purchaseDate,
          expiryDate: formattedValues.expiryDate
        }
        const newPesticide: Pesticide = {
          id: uuidv4(),
          ...formattedValues,
          batches: [initialBatch]
        }
        initialBatch.pesticideId = newPesticide.id
        setPesticides(prev => [...prev, newPesticide])
        
        const log: InventoryLog = {
          id: uuidv4(),
          type: 'in',
          pesticideId: newPesticide.id,
          pesticideName: newPesticide.name,
          batchId: initialBatch.id,
          quantity: newPesticide.stock,
          unit: newPesticide.unit,
          operator: '系统',
          date: dayjs().format('YYYY-MM-DD'),
          remark: '初始入库'
        }
        setInventoryLogs(prev => [...prev, log])
        message.success('药剂入库成功')
      }
      setModalVisible(false)
    })
  }

  const handleBatchSubmit = () => {
    batchForm.validateFields().then(values => {
      if (!selectedPesticideForBatch) return
      
      const newBatch: PesticideBatch = {
        id: uuidv4(),
        pesticideId: selectedPesticideForBatch.id,
        batchNo: values.batchNo,
        quantity: values.quantity,
        unit: selectedPesticideForBatch.unit,
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        supplier: values.supplier,
        price: values.price
      }

      setPesticides(prev =>
        prev.map(p =>
          p.id === selectedPesticideForBatch.id
            ? {
                ...p,
                batches: [...(p.batches || []), newBatch],
                stock: p.stock + values.quantity,
                expiryDate: dayjs(p.expiryDate).isBefore(values.expiryDate.format('YYYY-MM-DD')) 
                  ? values.expiryDate.format('YYYY-MM-DD') 
                  : p.expiryDate
              }
            : p
        )
      )

      const log: InventoryLog = {
        id: uuidv4(),
        type: 'in',
        pesticideId: selectedPesticideForBatch.id,
        pesticideName: selectedPesticideForBatch.name,
        batchId: newBatch.id,
        quantity: values.quantity,
        unit: selectedPesticideForBatch.unit,
        operator: values.operator || '管理员',
        date: dayjs().format('YYYY-MM-DD'),
        remark: `批次入库：${values.batchNo}`
      }
      setInventoryLogs(prev => [...prev, log])
      message.success('批次添加成功')
      setBatchModalVisible(false)
    })
  }

  const handleStockInSubmit = () => {
    stockInForm.validateFields().then(values => {
      if (!selectedPesticideForBatch) return

      setPesticides(prev =>
        prev.map(p =>
          p.id === selectedPesticideForBatch.id
            ? { ...p, stock: p.stock + values.quantity }
            : p
        )
      )

      const log: InventoryLog = {
        id: uuidv4(),
        type: 'in',
        pesticideId: selectedPesticideForBatch.id,
        pesticideName: selectedPesticideForBatch.name,
        quantity: values.quantity,
        unit: selectedPesticideForBatch.unit,
        operator: values.operator || '管理员',
        date: values.date.format('YYYY-MM-DD'),
        remark: values.remark
      }
      setInventoryLogs(prev => [...prev, log])
      message.success('入库成功')
      setStockInModalVisible(false)
    })
  }

  const handleUsageSubmit = () => {
    usageForm.validateFields().then(values => {
      const pesticide = pesticides.find(p => p.id === values.pesticideId)
      if (pesticide && pesticide.stock < values.quantity) {
        message.error('库存不足')
        return
      }

      const workOrder = workOrders.find(w => w.id === values.workOrderId)
      
      const newUsage = {
        id: uuidv4(),
        ...values,
        pesticideName: pesticide?.name || '',
        unit: pesticide?.unit || '',
        workOrderCode: workOrder?.code || '',
        usageDate: values.usageDate.format('YYYY-MM-DD'),
        voided: false
      }

      setPesticideUsages(prev => [...prev, newUsage])
      setPesticides(prev =>
        prev.map(p =>
          p.id === values.pesticideId
            ? { ...p, stock: p.stock - values.quantity }
            : p
        )
      )

      const log: InventoryLog = {
        id: uuidv4(),
        type: 'out',
        pesticideId: values.pesticideId,
        pesticideName: pesticide?.name || '',
        quantity: values.quantity,
        unit: pesticide?.unit || '',
        operator: values.operator,
        date: values.usageDate.format('YYYY-MM-DD'),
        workOrderId: values.workOrderId,
        workOrderCode: workOrder?.code || '',
        remark: values.remark || `防治面积：${values.area}亩`
      }
      setInventoryLogs(prev => [...prev, log])
      message.success('使用记录已登记')
      setUsageModalVisible(false)
      usageForm.resetFields()
    })
  }

  const handleEditUsage = (record: any) => {
    setEditingUsage(record)
    editUsageForm.resetFields()
    editUsageForm.setFieldsValue({
      ...record,
      usageDate: dayjs(record.usageDate),
      pesticideId: record.pesticideId
    })
    setEditUsageVisible(true)
  }

  const handleEditUsageSubmit = () => {
    editUsageForm.validateFields().then(values => {
      if (!editingUsage) return

      const pesticide = pesticides.find(p => p.id === values.pesticideId)
      const workOrder = workOrders.find(w => w.id === values.workOrderId)
      
      const quantityDiff = values.quantity - editingUsage.quantity

      if (quantityDiff > 0 && pesticide && pesticide.stock < quantityDiff) {
        message.error('库存不足，无法增加用量')
        return
      }

      setPesticideUsages(prev =>
        prev.map(u =>
          u.id === editingUsage.id
            ? {
                ...u,
                ...values,
                pesticideName: pesticide?.name || u.pesticideName,
                unit: pesticide?.unit || u.unit,
                workOrderCode: workOrder?.code || u.workOrderCode,
                usageDate: values.usageDate.format('YYYY-MM-DD')
              }
            : u
        )
      )

      if (quantityDiff !== 0) {
        setPesticides(prev =>
          prev.map(p =>
            p.id === editingUsage.pesticideId
              ? { ...p, stock: p.stock - quantityDiff }
              : p
          )
        )
      }

      message.success('使用记录已更新')
      setEditUsageVisible(false)
      setEditingUsage(null)
    })
  }

  const handleVoidUsage = (record: any) => {
    setPesticideUsages(prev =>
      prev.map(u =>
        u.id === record.id ? { ...u, voided: true } : u
      )
    )

    setPesticides(prev =>
      prev.map(p =>
        p.id === record.pesticideId
          ? { ...p, stock: p.stock + record.quantity }
          : p
      )
    )

    setInventoryLogs(prev => [
      ...prev,
      {
        id: uuidv4(),
        type: 'in' as const,
        pesticideId: record.pesticideId,
        pesticideName: record.pesticideName,
        quantity: record.quantity,
        unit: record.unit,
        operator: '系统',
        date: dayjs().format('YYYY-MM-DD'),
        workOrderId: record.workOrderId,
        workOrderCode: record.workOrderCode,
        remark: `作废回库：原记录${record.id}`
      }
    ])

    message.success('使用记录已作废，库存已回退')
  }

  const handleExport = () => {
    const csvContent = [
      ['药剂名称', '规格', '生产厂家', '库存数量', '单位', '预警库存', '采购日期', '有效期至', '批次数量'].join(','),
      ...pesticides.map(p => [
        p.name,
        p.specification,
        p.manufacturer,
        p.stock,
        p.unit,
        p.warningStock,
        p.purchaseDate,
        p.expiryDate,
        p.batches?.length || 0
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
      {(lowStockCount > 0 || expiredSoonCount > 0 || expiredCount > 0) && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {lowStockCount > 0 && (
            <Col xs={24} md={8}>
              <Alert
                message={`有 ${lowStockCount} 种药剂库存不足，请及时采购`}
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            </Col>
          )}
          {expiredSoonCount > 0 && (
            <Col xs={24} md={8}>
              <Alert
                message={`有 ${expiredSoonCount} 种药剂即将过期`}
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            </Col>
          )}
          {expiredCount > 0 && (
            <Col xs={24} md={8}>
              <Alert
                message={`有 ${expiredCount} 种药剂已过期，请及时处理`}
                type="error"
                showIcon
                icon={<WarningOutlined />}
              />
            </Col>
          )}
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="药剂种类"
              value={pesticides.length}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="总库存量"
              value={totalValue}
              suffix="单位"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="库存不足"
              value={lowStockCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="即将过期"
              value={expiredSoonCount}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="累计使用量"
              value={totalUsage}
              suffix="单位"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
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

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="药剂库存" key="inventory">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={16}>
                <Card
                  title="药剂列表"
                  extra={
                    <Space>
                      <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
                      <Button icon={<ImportOutlined />} onClick={() => setUsageModalVisible(true)}>登记使用</Button>
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        新增药剂
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    columns={columns}
                    dataSource={pesticides}
                    rowKey="id"
                    scroll={{ x: 1400 }}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card 
                  title="采购建议" 
                  extra={<ShoppingCartOutlined style={{ color: '#faad14' }} />}
                  style={{ marginBottom: 16 }}
                >
                  {purchaseSuggestions.length > 0 ? (
                    <List
                      dataSource={purchaseSuggestions}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Tag color="red">缺</Tag>}
                            title={item.name}
                            description={
                              <div>
                                <div>当前库存：{item.stock} {item.unit}（预警：{item.warningStock}）</div>
                                <div style={{ color: '#52c41a' }}>建议采购：{item.suggestQuantity} {item.unit}</div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                      暂无采购建议
                    </div>
                  )}
                </Card>

                <Card title="库存预警">
                  <List
                    dataSource={pesticides.filter(p => 
                      p.stock < p.warningStock || 
                      dayjs(p.expiryDate).diff(dayjs(), 'month') <= 3
                    )}
                    renderItem={item => {
                      const isLow = item.stock < item.warningStock
                      const isExpiring = dayjs(item.expiryDate).diff(dayjs(), 'month') <= 3
                      return (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Tag color={isLow ? 'red' : 'orange'}>
                                {isLow ? '缺' : '警'}
                              </Tag>
                            }
                            title={item.name}
                            description={
                              <div>
                                {isLow && <div>库存：{item.stock} {item.unit}（预警：{item.warningStock}）</div>}
                                {isExpiring && <div>有效期至：{item.expiryDate}</div>}
                              </div>
                            }
                          />
                        </List.Item>
                      )
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="出入库流水" key="logs">
            <Card
              extra={
                <Space>
                  <Button icon={<ExportOutlined />}>导出流水</Button>
                </Space>
              }
            >
              <Table
                columns={logColumns}
                dataSource={inventoryLogs}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: true }}
              />
            </Card>
          </TabPane>

          <TabPane tab="使用记录" key="usage">
            <Table
              columns={usageColumns}
              dataSource={pesticideUsages}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingPesticide ? '编辑药剂信息' : '新增药剂'}
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
        title="添加批次"
        open={batchModalVisible}
        onOk={handleBatchSubmit}
        onCancel={() => setBatchModalVisible(false)}
        width={500}
      >
        <Form form={batchForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="batchNo"
                label="批次号"
                rules={[{ required: true, message: '请输入批次号' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
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
          <Form.Item name="supplier" label="供应商">
            <Input placeholder="请输入供应商" />
          </Form.Item>
          <Form.Item name="operator" label="操作人员">
            <Input placeholder="请输入操作人员姓名" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="快速入库"
        open={stockInModalVisible}
        onOk={handleStockInSubmit}
        onCancel={() => setStockInModalVisible(false)}
        width={500}
      >
        <Form form={stockInForm} layout="vertical">
          <Form.Item name="pesticideName" label="药剂名称">
            <Input disabled />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="入库数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="入库日期"
                rules={[{ required: true, message: '请选择' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="operator" label="操作人员">
            <Input placeholder="请输入操作人员姓名" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="登记药剂使用"
        open={usageModalVisible}
        onOk={handleUsageSubmit}
        onCancel={() => setUsageModalVisible(false)}
        width={600}
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
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑药剂使用记录"
        open={editUsageVisible}
        onOk={handleEditUsageSubmit}
        onCancel={() => {
          setEditUsageVisible(false)
          setEditingUsage(null)
        }}
        width={600}
      >
        <Form form={editUsageForm} layout="vertical">
          <Form.Item name="pesticideId" label="选择药剂" rules={[{ required: true }]}>
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
              <Form.Item name="quantity" label="使用数量" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="area" label="防治面积(亩)" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="usageDate" label="使用日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="operator" label="操作人员" rules={[{ required: true }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="使用地点" rules={[{ required: true }]}>
                <Input placeholder="请输入地点" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="workOrderId" label="关联工单">
            <Select placeholder="请选择（可选）" allowClear>
              {workOrders.map(w => (
                <Option key={w.id} value={w.id}>{w.code} - {w.monitoringPointName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="药剂详情"
        open={viewDetailVisible}
        onCancel={() => setViewDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewDetailVisible(false)}>关闭</Button>
        ]}
        width={800}
      >
        {viewingPesticide && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="药剂名称" span={2}>{viewingPesticide.name}</Descriptions.Item>
              <Descriptions.Item label="规格">{viewingPesticide.specification}</Descriptions.Item>
              <Descriptions.Item label="生产厂家">{viewingPesticide.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="当前库存">
                <span style={{ color: viewingPesticide.stock < viewingPesticide.warningStock ? '#ff4d4f' : 'inherit', fontWeight: 600 }}>
                  {viewingPesticide.stock} {viewingPesticide.unit}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="预警库存">{viewingPesticide.warningStock} {viewingPesticide.unit}</Descriptions.Item>
              <Descriptions.Item label="采购日期">{viewingPesticide.purchaseDate}</Descriptions.Item>
              <Descriptions.Item label="有效期至">{viewingPesticide.expiryDate}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{viewingPesticide.notes || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">批次信息</Divider>
            <Table
              columns={batchColumns}
              dataSource={viewingPesticide.batches || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PesticideInventory
