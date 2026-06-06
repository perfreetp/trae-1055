import React, { useEffect } from 'react'
import { WorkOrder, WoodRecord } from '../types'
import { Table, Image } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface WorkOrderPrintProps {
  order: WorkOrder
  woodRecords: WoodRecord[]
}

const WorkOrderPrint: React.FC<WorkOrderPrintProps> = ({ order, woodRecords }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const woodColumns: ColumnsType<WoodRecord> = [
    {
      title: '序号',
      dataIndex: 'no',
      key: 'no',
      width: 60,
      align: 'center'
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: '树种',
      dataIndex: 'treeSpecies',
      key: 'treeSpecies',
      width: 100
    },
    {
      title: '胸径(cm)',
      dataIndex: 'diameter',
      key: 'diameter',
      width: 90,
      align: 'center'
    },
    {
      title: '树高(m)',
      dataIndex: 'height',
      key: 'height',
      width: 80,
      align: 'center'
    },
    {
      title: '处理方式',
      dataIndex: 'disposalMethod',
      key: 'disposalMethod',
      width: 100,
      align: 'center'
    },
    {
      title: '处理结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      align: 'center'
    }
  ]

  return (
    <div style={{
      position: 'fixed',
      left: '-9999px',
      top: 0,
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm',
      background: 'white',
      fontFamily: 'SimSun, serif',
      fontSize: '12pt',
      color: 'black'
    }}>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 20mm;
            }
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .ant-table {
              border: 1px solid #000 !important;
            }
            .ant-table th, .ant-table td {
              border: 1px solid #000 !important;
              padding: 4px 8px !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <div className="print-section">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: '20pt', margin: 0, fontWeight: 'bold' }}>林业病虫害现场处置单</h1>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', width: '15%', background: '#f5f5f5' }}>工单编号</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', width: '35%' }}>{order.code}</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', width: '15%', background: '#f5f5f5' }}>创建日期</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', width: '35%' }}>{order.createDate}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>监测点</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }} colSpan={3}>{order.monitoringPointName}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>具体位置</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }} colSpan={3}>{order.location}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>病虫害类型</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.pestType}</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>危害等级</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.hazardLevel}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>处置方式</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.disposalMethod}</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>防治面积</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.area} 亩</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>责任人</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.assignee}</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>防治队伍</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.team}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>处置日期</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.disposalDate || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>复查日期</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.reviewDate || order.reviewDeadline || '-'}</td>
            </tr>
            {order.disposalResult && (
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>处置结果</td>
                <td style={{ border: '1px solid #000', padding: '8px 12px' }} colSpan={3}>{order.disposalResult}</td>
              </tr>
            )}
            {order.reviewResult && (
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>复查结论</td>
                <td style={{ border: '1px solid #000', padding: '8px 12px' }} colSpan={3}>{order.reviewResult}</td>
              </tr>
            )}
          </tbody>
        </table>

        {woodRecords.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '14pt', margin: '0 0 10px 0', fontWeight: 'bold' }}>
              疫木清理清单（共 {woodRecords.length} 株）
            </h3>
            <Table
              dataSource={woodRecords}
              columns={woodColumns}
              rowKey="id"
              pagination={false}
              size="small"
              bordered
            />
          </div>
        )}

        {order.disposalPhotos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '14pt', margin: '0 0 10px 0', fontWeight: 'bold' }}>现场照片</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {order.disposalPhotos.slice(0, 6).map((photo, index) => (
                <div key={index} style={{ border: '1px solid #000' }}>
                  <Image src={photo} alt={`现场照片${index + 1}`} width="100%" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: 40 }}>
              <span style={{ borderBottom: '1px solid #000', padding: '0 60px 2px 0' }}></span>
            </div>
            <div style={{ fontSize: '10pt' }}>处置人签字：</div>
          </div>
          <div>
            <div style={{ marginBottom: 40 }}>
              <span style={{ borderBottom: '1px solid #000', padding: '0 60px 2px 0' }}></span>
            </div>
            <div style={{ fontSize: '10pt' }}>复查人签字：</div>
          </div>
          <div>
            <div style={{ marginBottom: 40 }}>
              <span style={{ borderBottom: '1px solid #000', padding: '0 60px 2px 0' }}></span>
            </div>
            <div style={{ fontSize: '10pt' }}>林业站负责人：</div>
          </div>
          <div>
            <div style={{ marginBottom: 40 }}>
              <span style={{ borderBottom: '1px solid #000', padding: '0 80px 2px 0' }}></span>
            </div>
            <div style={{ fontSize: '10pt' }}>日期：</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkOrderPrint
