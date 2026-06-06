import React, { useState } from 'react'
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Statistic,
  List,
  Avatar,
  message
} from 'antd'
import {
  EnvironmentOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  BugOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { MonitoringPoint, PestType, HazardLevel } from '../types'

const { Option } = Select
const { TextArea } = Input

const Dashboard: React.FC = () => {
  const {
    monitoringPoints,
    setMonitoringPoints,
    workOrders,
    publicReports,
    samples
  } = useApp()

  const [modalVisible, setModalVisible] = useState(false)
  const [editingPoint, setEditingPoint] = useState<MonitoringPoint | null>(null)
  const [form] = Form.useForm()

  const totalPoints = monitoringPoints.length
  const abnormalPoints = monitoringPoints.filter(p => p.status === '异常').length
  const pendingOrders = workOrders.filter(w => w.status === '待处理' || w.status === '已超期').length
  const totalPestCount = monitoringPoints.reduce((sum, p) => sum + p.pestCount, 0)
  const overdueOrders = workOrders.filter(w => w.status === '已超期').length

  const columns: ColumnsType<MonitoringPoint> = [
    {
      title: '监测点名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
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
      render: (type: PestType) => (
        <Tag color={type === '松材线虫' ? 'red' : type === '美国白蛾' ? 'orange' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: '虫口数量',
      dataIndex: 'pestCount',
      key: 'pestCount',
      width: 100,
      sorter: (a, b) => a.pestCount - b.pestCount
    },
    {
      title: '危害等级',
      dataIndex: 'hazardLevel',
      key: 'hazardLevel',
      width: 100,
      render: (level: HazardLevel) => {
        const colors: Record<HazardLevel, string> = {
          '轻度': 'green',
          '中度': 'gold',
          '重度': 'orange',
          '极重度': 'red'
        }
        return <Tag color={colors[level]}>{level}</Tag>
      }
    },
    {
      title: '诱捕器数量',
      dataIndex: 'trapCount',
      key: 'trapCount',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          '正常': 'green',
          '异常': 'red',
          '待监测': 'default'
        }
        return <Tag color={colors[status]}>{status}</Tag>
      }
    },
    {
      title: '上次检查',
      dataIndex: 'lastCheckDate',
      key: 'lastCheckDate',
      width: 120
    },
    {
      title: '下次复查',
      dataIndex: 'nextCheckDate',
      key: 'nextCheckDate',
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
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        </Space>
      )
    }
  ]

  const trendChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['松材线虫', '美国白蛾', '松褐天牛'] },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: { type: 'value', name: '虫口密度' },
    series: [
      {
        name: '松材线虫',
        type: 'line',
        data: [12, 18, 25, 22, 28, 32],
        smooth: true,
        itemStyle: { color: '#f5222d' }
      },
      {
        name: '美国白蛾',
        type: 'line',
        data: [8, 12, 15, 10, 14, 16],
        smooth: true,
        itemStyle: { color: '#faad14' }
      },
      {
        name: '松褐天牛',
        type: 'line',
        data: [5, 8, 10, 9, 12, 11],
        smooth: true,
        itemStyle: { color: '#1890ff' }
      }
    ]
  }

  const pestTypeChartOption = {
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

  const handleEdit = (record: MonitoringPoint) => {
    setEditingPoint(record)
    form.setFieldsValue({
      ...record,
      lastCheckDate: dayjs(record.lastCheckDate),
      nextCheckDate: dayjs(record.nextCheckDate)
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingPoint(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const formattedValues = {
        ...values,
        lastCheckDate: values.lastCheckDate.format('YYYY-MM-DD'),
        nextCheckDate: values.nextCheckDate.format('YYYY-MM-DD')
      }

      if (editingPoint) {
        setMonitoringPoints(prev =>
          prev.map(p => (p.id === editingPoint.id ? { ...p, ...formattedValues } : p))
        )
        message.success('监测点更新成功')
      } else {
        const newPoint: MonitoringPoint = {
          id: uuidv4(),
          ...formattedValues,
          lng: 118.75,
          lat: 32.08,
          status: formattedValues.pestCount > 100 ? '异常' : '正常'
        }
        setMonitoringPoints(prev => [...prev, newPoint])
        message.success('监测点添加成功')
      }
      setModalVisible(false)
    })
  }

  const recentActivities = [
    {
      title: '样本检测完成',
      desc: 'SAMPLE-2026-001 检测结果：确认松材线虫感染',
      time: '10分钟前',
      icon: <ExperimentOutlined />,
      color: 'red'
    },
    {
      title: '群众举报核实',
      desc: '东山村后山发现疑似病虫害，已派单处置',
      time: '2小时前',
      icon: <BugOutlined />,
      color: 'orange'
    },
    {
      title: '工单超期提醒',
      desc: 'WO-2026-003 已超期，请及时处理',
      time: '3小时前',
      icon: <WarningOutlined />,
      color: 'red'
    },
    {
      title: '诱捕器维护',
      desc: 'TRAP-2026-004 损坏，已登记待更换',
      time: '5小时前',
      icon: <EnvironmentOutlined />,
      color: 'blue'
    }
  ]

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="监测点总数"
              value={totalPoints}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="异常监测点"
              value={abnormalPoints}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理工单"
              value={pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={overdueOrders > 0 ? <Tag color="red">{overdueOrders}个超期</Tag> : undefined}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月虫口总数"
              value={totalPestCount}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <Card title="虫口密度趋势" extra={<Select defaultValue="year" style={{ width: 120 }}>
            <Option value="month">本月</Option>
            <Option value="quarter">本季度</Option>
            <Option value="year">本年度</Option>
          </Select>}>
            <ReactECharts option={trendChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="病虫害类型分布">
            <ReactECharts option={pestTypeChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <Card
            title="监测点列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加监测点
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={monitoringPoints}
              rowKey="id"
              size="small"
              scroll={{ x: 1000 }}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="最近动态">
            <List
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: item.color }}>
                        {item.icon}
                      </Avatar>
                    }
                    title={item.title}
                    description={
                      <div>
                        <div>{item.desc}</div>
                        <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{item.time}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingPoint ? '编辑监测点' : '添加监测点'}
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
                label="监测点名称"
                rules={[{ required: true, message: '请输入监测点名称' }]}
              >
                <Input placeholder="请输入监测点名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pestType"
                label="主要病虫害类型"
                rules={[{ required: true, message: '请选择病虫害类型' }]}
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
            name="location"
            label="具体位置"
            rules={[{ required: true, message: '请输入具体位置' }]}
          >
            <Input placeholder="请输入具体位置" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="pestCount"
                label="虫口数量"
                rules={[{ required: true, message: '请输入虫口数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="hazardLevel"
                label="危害等级"
                rules={[{ required: true, message: '请选择危害等级' }]}
              >
                <Select placeholder="请选择">
                  <Option value="轻度">轻度</Option>
                  <Option value="中度">中度</Option>
                  <Option value="重度">重度</Option>
                  <Option value="极重度">极重度</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="trapCount"
                label="诱捕器数量"
                rules={[{ required: true, message: '请输入诱捕器数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lastCheckDate"
                label="上次检查日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextCheckDate"
                label="下次复查日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
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

export default Dashboard
