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
  Popconfirm,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ToolOutlined,
  WarningOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { Trap } from '../types'

const { Option } = Select
const { TextArea } = Input

const TrapRegistration: React.FC = () => {
  const { traps, setTraps, monitoringPoints } = useApp()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTrap, setEditingTrap] = useState<Trap | null>(null)
  const [form] = Form.useForm()

  const totalTraps = traps.length
  const normalTraps = traps.filter(t => t.status === '正常').length
  const damagedTraps = traps.filter(t => t.status === '损坏').length
  const needReplace = traps.filter(t => t.status === '待更换').length

  const columns: ColumnsType<Trap> = [
    {
      title: '诱捕器编号',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: '所属监测点',
      dataIndex: 'monitoringPointName',
      key: 'monitoringPointName'
    },
    {
      title: '安装位置',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: '靶标害虫',
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
      title: '诱芯类型',
      dataIndex: 'lureType',
      key: 'lureType',
      width: 150
    },
    {
      title: '安装日期',
      dataIndex: 'installDate',
      key: 'installDate',
      width: 120
    },
    {
      title: '上次维护',
      dataIndex: 'lastMaintenanceDate',
      key: 'lastMaintenanceDate',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          '正常': 'green',
          '损坏': 'red',
          '待更换': 'orange'
        }
        return <Tag color={colors[status]}>{status}</Tag>
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
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定删除此诱捕器？"
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

  const handleEdit = (record: Trap) => {
    setEditingTrap(record)
    form.setFieldsValue({
      ...record,
      installDate: dayjs(record.installDate),
      lastMaintenanceDate: dayjs(record.lastMaintenanceDate)
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingTrap(null)
    form.resetFields()
    form.setFieldsValue({
      code: `TRAP-${dayjs().format('YYYY')}-${String(traps.length + 1).padStart(3, '0')}`,
      status: '正常'
    })
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    setTraps(prev => prev.filter(t => t.id !== id))
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const mp = monitoringPoints.find(m => m.id === values.monitoringPointId)
      const formattedValues = {
        ...values,
        installDate: values.installDate.format('YYYY-MM-DD'),
        lastMaintenanceDate: values.lastMaintenanceDate.format('YYYY-MM-DD'),
        monitoringPointName: mp?.name || ''
      }

      if (editingTrap) {
        setTraps(prev =>
          prev.map(t => (t.id === editingTrap.id ? { ...t, ...formattedValues } : t))
        )
        message.success('诱捕器信息更新成功')
      } else {
        const newTrap: Trap = {
          id: uuidv4(),
          ...formattedValues
        }
        setTraps(prev => [...prev, newTrap])
        message.success('诱捕器登记成功')
      }
      setModalVisible(false)
    })
  }

  const handleMaintenance = (record: Trap) => {
    setTraps(prev =>
      prev.map(t =>
        t.id === record.id
          ? { ...t, lastMaintenanceDate: dayjs().format('YYYY-MM-DD'), status: '正常' }
          : t
      )
    )
    message.success('维护记录已更新')
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="诱捕器总数"
              value={totalTraps}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="正常运行"
              value={normalTraps}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="损坏"
              value={damagedTraps}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待更换"
              value={needReplace}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="诱捕器管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            登记诱捕器
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={traps}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingTrap ? '编辑诱捕器' : '登记诱捕器'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="诱捕器编号"
                rules={[{ required: true, message: '请输入编号' }]}
              >
                <Input placeholder="自动生成或手动输入" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="monitoringPointId"
                label="所属监测点"
                rules={[{ required: true, message: '请选择监测点' }]}
              >
                <Select placeholder="请选择监测点">
                  {monitoringPoints.map(mp => (
                    <Option key={mp.id} value={mp.id}>{mp.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="location"
            label="具体安装位置"
            rules={[{ required: true, message: '请输入位置' }]}
          >
            <Input placeholder="如：A区东北角" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pestType"
                label="靶标害虫"
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
                name="lureType"
                label="诱芯类型"
                rules={[{ required: true, message: '请输入诱芯类型' }]}
              >
                <Input placeholder="如：松墨天牛诱芯" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="installDate"
                label="安装日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastMaintenanceDate"
                label="上次维护日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择">
                  <Option value="正常">正常</Option>
                  <Option value="损坏">损坏</Option>
                  <Option value="待更换">待更换</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TrapRegistration
