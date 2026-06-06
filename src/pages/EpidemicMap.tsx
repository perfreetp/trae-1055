import React, { useState } from 'react'
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
  Badge
} from 'antd'
import {
  EnvironmentOutlined,
  WarningOutlined,
  BugOutlined,
  FireOutlined
} from '@ant-design/icons'
import { useApp } from '../store/AppContext'
import { MonitoringPoint, HazardLevel } from '../types'

const { Option } = Select

const EpidemicMap: React.FC = () => {
  const { monitoringPoints, workOrders } = useApp()
  const [selectedPoint, setSelectedPoint] = useState<MonitoringPoint | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const totalPoints = monitoringPoints.length
  const normalPoints = monitoringPoints.filter(p => p.status === '正常').length
  const abnormalPoints = monitoringPoints.filter(p => p.status === '异常').length
  const severePoints = monitoringPoints.filter(p => p.hazardLevel === '重度' || p.hazardLevel === '极重度').length

  const filteredPoints = filterType === 'all'
    ? monitoringPoints
    : monitoringPoints.filter(p => p.pestType === filterType)

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

  const activeWorkOrders = workOrders.filter(w => w.status === '处理中' || w.status === '待处理')

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
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                onChange={setFilterType}
              >
                <Option value="all">全部类型</Option>
                <Option value="松材线虫">松材线虫</Option>
                <Option value="美国白蛾">美国白蛾</Option>
                <Option value="松褐天牛">松褐天牛</Option>
              </Select>
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
                return (
                  <Tooltip key={point.id} title={
                    <div>
                      <div><strong>{point.name}</strong></div>
                      <div>类型：{point.pestType}</div>
                      <div>等级：{point.hazardLevel}</div>
                      <div>虫口：{point.pestCount}</div>
                    </div>
                  }>
                    <div
                      className={`map-point ${colorClass}`}
                      style={pos}
                      onClick={() => setSelectedPoint(point)}
                    />
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
          <Card title="重点关注区域" style={{ marginBottom: 16 }}>
            <List
              dataSource={monitoringPoints.filter(p => p.status === '异常')}
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

          <Card title="进行中处置任务">
            <List
              dataSource={activeWorkOrders}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<BugOutlined />} style={{ backgroundColor: '#faad14' }} />
                    }
                    title={
                      <span>
                        {item.code}
                        <Tag 
                          color={item.status === '已超期' ? 'red' : 'blue'} 
                          style={{ marginLeft: 8 }}
                        >
                          {item.status}
                        </Tag>
                      </span>
                    }
                    description={
                      <div>
                        <div>{item.monitoringPointName}</div>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          截止：{item.deadline} · {item.team}
                        </div>
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
        title="监测点详情"
        open={!!selectedPoint}
        onCancel={() => setSelectedPoint(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedPoint(null)}>关闭</Button>,
          <Button key="order" type="primary">下发处置工单</Button>
        ]}
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
    </div>
  )
}

export default EpidemicMap
