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
  Upload,
  Row,
  Col,
  Image
} from 'antd'
import {
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../store/AppContext'
import { Sample } from '../types'

const { Option } = Select
const { TextArea } = Input

const SampleTesting: React.FC = () => {
  const { samples, setSamples, monitoringPoints } = useApp()
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingSample, setEditingSample] = useState<Sample | null>(null)
  const [viewingSample, setViewingSample] = useState<Sample | null>(null)
  const [form] = Form.useForm()
  const [photoList, setPhotoList] = useState<string[]>([])

  const columns: ColumnsType<Sample> = [
    {
      title: '样本编号',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: '监测点',
      dataIndex: 'monitoringPointName',
      key: 'monitoringPointName'
    },
    {
      title: '采集日期',
      dataIndex: 'collectDate',
      key: 'collectDate',
      width: 120
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
      title: '虫口数量',
      dataIndex: 'pestCount',
      key: 'pestCount',
      width: 100
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
      title: '采集人',
      dataIndex: 'collector',
      key: 'collector',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          '待送检': 'default',
          '送检中': 'blue',
          '已检测': 'green'
        }
        return <Tag color={colors[status]}>{status}</Tag>
      }
    },
    {
      title: '显微照片',
      dataIndex: 'microPhotos',
      key: 'microPhotos',
      width: 100,
      render: (photos: string[]) => (
        <Tag color={photos.length > 0 ? 'green' : 'default'}>
          {photos.length}张
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          {record.status === '待送检' && (
            <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => handleSendToLab(record)}>送检</Button>
          )}
          {record.status === '送检中' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleRecordResult(record)}>登记结果</Button>
          )}
        </Space>
      )
    }
  ]

  const uploadProps: UploadProps = {
    listType: 'picture-card',
    beforeUpload: () => false,
    onChange: (info) => {
      if (info.fileList) {
        const newPhotos = info.fileList.map((f: any) => f.url || f.name)
        setPhotoList(newPhotos)
      }
    }
  }

  const handleView = (record: Sample) => {
    setViewingSample(record)
    setDetailVisible(true)
  }

  const handleEdit = (record: Sample) => {
    setEditingSample(record)
    setPhotoList(record.microPhotos || [])
    form.setFieldsValue({
      ...record,
      collectDate: dayjs(record.collectDate),
      labDate: record.labDate ? dayjs(record.labDate) : undefined
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingSample(null)
    setPhotoList([])
    form.resetFields()
    form.setFieldsValue({
      code: `SAMPLE-${dayjs().format('YYYY')}-${String(samples.length + 1).padStart(3, '0')}`,
      collectDate: dayjs(),
      status: '待送检'
    })
    setModalVisible(true)
  }

  const handleSendToLab = (record: Sample) => {
    setSamples(prev =>
      prev.map(s => s.id === record.id ? { ...s, status: '送检中' } : s)
    )
    message.success('已标记为送检中')
  }

  const handleRecordResult = (record: Sample) => {
    setEditingSample(record)
    setPhotoList(record.microPhotos || [])
    form.setFieldsValue({
      ...record,
      collectDate: dayjs(record.collectDate)
    })
    setModalVisible(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const mp = monitoringPoints.find(m => m.id === values.monitoringPointId)
      const formattedValues = {
        ...values,
        collectDate: values.collectDate.format('YYYY-MM-DD'),
        labDate: values.labDate ? values.labDate.format('YYYY-MM-DD') : undefined,
        monitoringPointName: mp?.name || '',
        microPhotos: photoList
      }

      if (editingSample) {
        setSamples(prev =>
          prev.map(s => (s.id === editingSample.id ? { ...s, ...formattedValues } : s))
        )
        message.success('样本信息更新成功')
      } else {
        const newSample: Sample = {
          id: uuidv4(),
          ...formattedValues,
          microPhotos: photoList
        }
        setSamples(prev => [...prev, newSample])
        message.success('样本登记成功')
      }
      setModalVisible(false)
    })
  }

  return (
    <div>
      <Card
        title="样本送检管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            登记样本
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={samples}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingSample ? '编辑样本信息' : '登记样本'}
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
                label="样本编号"
                rules={[{ required: true, message: '请输入编号' }]}
              >
                <Input placeholder="自动生成或手动输入" />
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
                name="collectDate"
                label="采集日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="collector"
                label="采集人"
                rules={[{ required: true, message: '请输入采集人' }]}
              >
                <Input placeholder="请输入采集人姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="pestCount"
                label="虫口数量"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
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
          <Form.Item label="显微照片">
            <Upload {...uploadProps}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传照片</div>
              </div>
            </Upload>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择">
                  <Option value="待送检">待送检</Option>
                  <Option value="送检中">送检中</Option>
                  <Option value="已检测">已检测</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="labDate" label="检测日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="labResult" label="检测结果">
            <TextArea rows={3} placeholder="请输入实验室检测结果" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="样本详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {viewingSample && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div><strong>样本编号：</strong>{viewingSample.code}</div>
              </Col>
              <Col span={12}>
                <div><strong>监测点：</strong>{viewingSample.monitoringPointName}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div><strong>采集日期：</strong>{viewingSample.collectDate}</div>
              </Col>
              <Col span={12}>
                <div><strong>采集人：</strong>{viewingSample.collector}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <div><strong>病虫害类型：</strong>{viewingSample.pestType}</div>
              </Col>
              <Col span={8}>
                <div><strong>虫口数量：</strong>{viewingSample.pestCount}</div>
              </Col>
              <Col span={8}>
                <div><strong>危害等级：</strong>{viewingSample.hazardLevel}</div>
              </Col>
            </Row>
            {viewingSample.microPhotos && viewingSample.microPhotos.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>显微照片：</strong>
                <div className="photo-grid" style={{ marginTop: 8 }}>
                  {viewingSample.microPhotos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <Image src={photo} alt={`照片${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {viewingSample.labResult && (
              <div style={{ marginBottom: 16 }}>
                <strong>检测结果：</strong>
                <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{viewingSample.labResult}</p>
              </div>
            )}
            {viewingSample.notes && (
              <div>
                <strong>备注：</strong>
                <p style={{ marginTop: 8 }}>{viewingSample.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SampleTesting
