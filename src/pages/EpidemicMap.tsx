import React, { useState, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Avatar,
  Select,
  Tooltip,
  Modal,
  Descriptions,
  Button,
  Badge,
  Form,
  Input,
  Divider,
  DatePicker,
  InputNumber,
  message,
  Space,
  Checkbox
} from 'antd'
import {
  EnvironmentOutlined,
  WarningOutlined,
  BugOutlined,
  FireOutlined,
  PlusOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { MonitoringPoint, HazardLevel, WorkOrder, WorkOrderStatus, DisposalMethod } from '../types'
import { isOverdue, getWorkOrderDisplayStatus, generateCode, isWorkOrderOverdue } from '../utils'

const { Option } = Select
const { TextArea } = Input

interface FilterState {
  pestType: string
  hazardLevel: string
  isOverdue: boolean
  isDisposed: string
}

const EpidemicMap: React.FC = () => {
  const { monitoringPoints, workOrders, setWorkOrders } = useApp()
  const [selectedPoint, setSelectedPoint] = useState<MonitoringPoint | null>(null)
  const [createOrderVisible, setCreateOrderVisible] = useState(false)
  const [orderForm] = Form.useForm()
  const [filters, setFilters] = useState<FilterState>({
    pestType: 'all',
    hazardLevel: 'all',
    isOverdue: false,
    isDisposed: 'all'
  })

  const totalPoints = monitoringPoints.length
  const normalPoints = monitoringPoints.filter(p => p.status === '正常').length
  const abnormalPoints = monitoringPoints.filter(p => p.status === '异常').length
  const severePoints = monitoringPoints.filter(p => p.hazardLevel === '重度' || p.hazardLevel === '极重度').length

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(w => {
      if (filters.pestType !== 'all' && w.pestType !== filters.pestType) return false
      if (filters.hazardLevel !== 'all' && w.hazardLevel !== filters.hazardLevel) return false
      if (filters.isOverdue && !isWorkOrderOverdue(w)) return false
      if (filters.isDisposed === 'disposed' && w.status !== '已完成') return false
      if (filters.isDisposed === 'notDisposed' && w.status === '已完成') return false
      return true
    })
  }, [workOrders, filters])

  const filteredPoints = useMemo(() => {
    const filteredPointIds = new Set(filteredWorkOrders.map(w => w.monitoringPointId))
    
    return monitoringPoints.filter(p => {
      if (filters.pestType !== 'all' && p.pestType !== filters.pestType) return false
      if (filters.hazardLevel !== 'all' && p.hazardLevel !== filters.hazardLevel) return false
      
      if (filters.isOverdue || filters.isDisposed !== 'all') {
        return filteredPointIds.has(p.id)
      }
      
      return true
    })
  }, [monitoringPoints, filteredWorkOrders, filters])

  const stats = useMemo(() => {
    const orders = filteredWorkOrders
    const overdueCount = orders.filter(w => isWorkOrderOverdue(w)).length
    const completedCount = orders.filter(w => w.status === '已完成').length
    const pendingCount = orders.filter(w => w.status === '待处理' || w.status === '处理中' || w.status === '待复查').length
    const totalArea = orders.filter(w => w.status === '已完成').reduce((sum, w) => sum + w.area, 0)
    return { overdueCount, completedCount, pendingCount, totalArea, total: orders.length }
  }, [filteredWorkOrders])

  const getPointColor = (status: string, hazardLevel: HazardLevel) => {
    if (status === '异常') {
      if (hazardLevel === '重度' || hazardLevel === '极重度') return 'danger'
      return 'warning'
    }
    return 'normal'
  }

  const getPointPosition = (lng: number, lat: number) => {
    const minLng = 118.6
    const maxLng = 118.9
    const minLat = 31.9
    const maxLat = 32.25

    const x = ((lng - minLng) / (maxLng - minLng)) * 100
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100

    return { left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }
  }

  const handleCreateOrder = () => {
    if (!selectedPoint) return
    orderForm.setFieldsValue({
      monitoringPointId: selectedPoint.id,
      monitoringPointName: selectedPoint.name,
      pestType: selectedPoint.pestType,
      hazardLevel: selectedPoint.hazardLevel,
      location: selectedPoint.location,
      area: selectedPoint.pestCount * 0.5,
      deadline: dayjs().add(7, 'day')
    })
    setCreateOrderVisible(true)
  }

  const handleOrderSubmit = () => {
    orderForm.validateFields().then(values => {
      const newOrder: WorkOrder = {
        id: uuidv4(),
        code: generateCode('WO'),
        monitoringPointId: values.monitoringPointId,
        monitoringPointName: values.monitoringPointName,
        pestType: values.pestType,
        hazardLevel: values.hazardLevel,
        location: values.location,
        area: values.area,
        createDate: dayjs().format('YYYY-MM-DD'),
        deadline: values.deadline.format('YYYY-MM-DD'),
        status: '待处理' as WorkOrderStatus,
        assignee: values.assignee || '',
        team: values.team || '',
        disposalMethod: values.disposalMethod || '焚烧',
        woodCount: 0,
        woodRecords: [],
        disposalPhotos: [],
        reviewPhotos: [],
        notes: values.notes
      }
      setWorkOrders(prev => [...prev, newOrder])
      message.success('处置工单创建成功')
      setCreateOrderVisible(false)
      setSelectedPoint(null)
      orderForm.resetFields()
    })
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
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
              title="正常监测点"
              value={normalPoints}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="异常监测点"
              value={abnormalPoints}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="重度危害"
              value={severePoints}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card
            title="疫情分布地图"
            extra={
              <Space wrap>
                <Select
                  value={filters.pestType}
                  style={{ width: 130 }}
                  onChange={(v) => setFilters(prev => ({ ...prev, pestType: v }))}
                >
                  <Option value="all">全部类型</Option>
                  <Option value="松材线虫">松材线虫</Option>
                  <Option value="美国白蛾">美国白蛾</Option>
                  <Option value="松褐天牛">松褐天牛</Option>
                </Select>
                <Select
                  value={filters.hazardLevel}
                  style={{ width: 130 }}
                  onChange={(v) => setFilters(prev => ({ ...prev, hazardLevel: v }))}
                >
                  <Option value="all">全部等级</Option>
                  <Option value="轻度">轻度</Option>
                  <Option value="中度">中度</Option>
                  <Option value="重度">重度</Option>
                  <Option value="极重度">极重度</Option>
                </Select>
                <Checkbox
                  checked={filters.isOverdue}
                  onChange={(e) => setFilters(prev => ({ ...prev, isOverdue: e.target.checked }))}
                >
                  仅看超期
                </Checkbox>
                <Select
                  value={filters.isDisposed}
                  style={{ width: 130 }}
                  onChange={(v) => setFilters(prev => ({ ...prev, isDisposed: v }))}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="disposed">已处置</Option>
                  <Option value="notDisposed">未处置</Option>
                </Select>
              </Space>
            }
          >
            <div className="map-container">
              <svg
                viewBox="0 0 100 100"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2 }}
              >
                <path d="M10,20 Q30,10 50,15 T90,20 L95,50 Q85,80 50,90 T10,70 Z" fill="#81c784" stroke="#4caf50" strokeWidth="0.5" />
                <path d="M20,30 Q40,25 55,30 T80,35 L85,55 Q70,75 45,80 T15,65 Z" fill="#66bb6a" stroke="#43a047" strokeWidth="0.3" />
              </svg>
              
              <div style={{ position: 'absolute', left: '10%', top: '30%', color: '#666', fontSize: 12 }}>西山林场</div>
              <div style={{ position: 'absolute', left: '75%', top: '25%', color: '#666', fontSize: 12 }}>东山林场</div>
              <div style={{ position: 'absolute', left: '50%', top: '75%', color: '#666', fontSize: 12 }}>南坡林区</div>
              <div style={{ position: 'absolute', left: '30%', top: '80%', color: '#666', fontSize: 12 }}>北沟林区</div>
              <div style={{ position: 'absolute', left: '50%', top: '50%', color: '#666', fontSize: 12 }}>中心林区</div>

              {filteredPoints.map(point => {
                const pos = getPointPosition(point.lng, point.lat)
                const colorClass = getPointColor(point.status, point.hazardLevel)
                const pointOrders = filteredWorkOrders.filter(w => w.monitoringPointId === point.id)
                const hasOverdue = pointOrders.some(w => isWorkOrderOverdue(w))
                return (
                  <Tooltip key={point.id} title={
                    <div>
                      <div><strong>{point.name}</strong></div>
                      <div>类型：{point.pestType}</div>
                      <div>等级：{point.hazardLevel}</div>
                      <div>虫口：{point.pestCount}</div>
                      <div>工单：{pointOrders.length}个{hasOverdue && '（含超期）'}</div>
                    </div>
                  }>
                    <div
                      style={{ position: 'absolute', ...pos }}
                    >
                      <Badge count={hasOverdue ? '!' : 0} size="small" offset={[8, 0]}>
                        <div
                          className={`map-point ${colorClass}`}
                          style={{ width: 20, height: 20, borderRadius: '50%', cursor: 'pointer' }}
                          onClick={() => setSelectedPoint(point)}
                        />
                      </Badge>
                    </div>
                  </Tooltip>
                )
              })}

              <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'white', padding: '8px 12px', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <div style={{ marginBottom: 4, fontWeight: 600, fontSize: 12 }}>图例</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 2 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#52c41a' }}></div>
                  <span>正常</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 2 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#faad14' }}></div>
                  <span>异常</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f5222d' }}></div>
                  <span>重度</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="筛选统计" style={{ marginBottom: 16 }}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Statistic title="工单数" value={stats.total} valueStyle={{ fontSize: 20 }} />
              </Col>
              <Col span={12}>
                <Statistic title="超期数" value={stats.overdueCount} valueStyle={{ color: '#ff4d4f', fontSize: 20 }} />
              </Col>
              <Col span={12}>
                <Statistic title="待处置" value={stats.pendingCount} valueStyle={{ color: '#faad14', fontSize: 20 }} />
              </Col>
              <Col span={12}>
                <Statistic title="已完成" value={stats.completedCount} valueStyle={{ color: '#52c41a', fontSize: 20 }} />
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ fontSize: 12, color: '#666' }}>
              <div>累计处置面积：<strong>{stats.totalArea}</strong> 亩</div>
              <div>筛选条件：{filters.pestType === 'all' ? '全部类型' : filters.pestType} · {filters.hazardLevel === 'all' ? '全部等级' : filters.hazardLevel}</div>
            </div>
          </Card>

          <Card title="重点关注区域" style={{ marginBottom: 16 }}>
            <List
              dataSource={filteredPoints.filter(p => p.status === '异常').slice(0, 5)}
              renderItem={item => (
                <List.Item onClick={() => setSelectedPoint(item)} style={{ cursor: 'pointer' }}>
                  <List.Item.Meta
                    avatar={
                      <Badge status="error" count={item.pestCount}>
                        <Avatar icon={<EnvironmentOutlined />} style={{ backgroundColor: '#ff4d4f' }} />
                      </Badge>
                    }
                    title={
                      <span>
                        {item.name}
                        <Tag color="red" style={{ marginLeft: 8 }}>{item.pestType}</Tag>
                      </span>
                    }
                    description={
                      <span>
                        {item.location} · {item.hazardLevel} · {item.pestCount}头
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="相关处置工单">
            <List
              dataSource={filteredWorkOrders.slice(0, 5)}
              renderItem={item => {
                const displayStatus = getWorkOrderDisplayStatus(item)
                const isOverdueFlag = isWorkOrderOverdue(item)
                const showDate = item.status === '待复查' && item.reviewDeadline ? item.reviewDeadline : item.deadline
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar icon={<BugOutlined />} style={{ backgroundColor: isOverdueFlag ? '#ff4d4f' : displayStatus.text === '已完成' ? '#52c41a' : '#faad14' }} />
                      }
                      title={
                        <span>
                          {item.code}
                          <Tag 
                            color={displayStatus.color}
                            style={{ marginLeft: 8 }}
                          >
                            {displayStatus.text}
                          </Tag>
                        </span>
                      }
                      description={
                        <div>
                          <div>{item.monitoringPointName}</div>
                          <div style={{ color: '#999', fontSize: 12 }}>
                            截止：{showDate} · {item.team}
                          </div>
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

      <Modal
        title="监测点详情"
        open={!!selectedPoint}
        onCancel={() => setSelectedPoint(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedPoint(null)}>关闭</Button>,
          <Button key="order" type="primary" icon={<PlusOutlined />} onClick={handleCreateOrder}>
            下发处置工单
          </Button>
        ]}
        width={600}
      >
        {selectedPoint && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="监测点名称" span={2}>
              {selectedPoint.name}
            </Descriptions.Item>
            <Descriptions.Item label="位置">{selectedPoint.location}</Descriptions.Item>
            <Descriptions.Item label="病虫害类型">
              <Tag color={selectedPoint.pestType === '松材线虫' ? 'red' : 'orange'}>
                {selectedPoint.pestType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="危害等级">
              <Tag color={
                selectedPoint.hazardLevel === '轻度' ? 'green' :
                selectedPoint.hazardLevel === '中度' ? 'gold' :
                selectedPoint.hazardLevel === '重度' ? 'orange' : 'red'
              }>
                {selectedPoint.hazardLevel}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="虫口数量">{selectedPoint.pestCount} 头</Descriptions.Item>
            <Descriptions.Item label="诱捕器数量">{selectedPoint.trapCount} 个</Descriptions.Item>
            <Descriptions.Item label="上次检查">{selectedPoint.lastCheckDate}</Descriptions.Item>
            <Descriptions.Item label="下次复查">{selectedPoint.nextCheckDate}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedPoint.status === '正常' ? 'green' : 'red'}>
                {selectedPoint.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="坐标">
              {selectedPoint.lng}, {selectedPoint.lat}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="创建处置工单"
        open={createOrderVisible}
        onOk={handleOrderSubmit}
        onCancel={() => setCreateOrderVisible(false)}
        width={600}
      >
        <Form form={orderForm} layout="vertical">
          <Form.Item name="monitoringPointId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="monitoringPointName" hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pestType" label="病虫害类型">
                <Select disabled>
                  <Option value="松材线虫">松材线虫</Option>
                  <Option value="美国白蛾">美国白蛾</Option>
                  <Option value="松褐天牛">松褐天牛</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hazardLevel" label="危害等级">
                <Select disabled>
                  <Option value="轻度">轻度</Option>
                  <Option value="中度">中度</Option>
                  <Option value="重度">重度</Option>
                  <Option value="极重度">极重度</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="位置">
            <Input disabled />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="area"
                label="防治面积(亩)"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="截止日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="assignee" label="负责人">
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="team" label="防治队伍">
                <Input placeholder="请输入防治队伍" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="disposalMethod" label="处置方式">
            <Select placeholder="请选择处置方式">
              <Option value="焚烧">焚烧</Option>
              <Option value="粉碎">粉碎</Option>
              <Option value="熏蒸">熏蒸</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EpidemicMap
