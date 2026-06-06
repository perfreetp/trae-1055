import React, { useEffect } from 'react'
import { WorkOrder, WoodRecord } from '../types'

interface WorkOrderPrintProps {
  order: WorkOrder
  woodRecords: WoodRecord[]
  totalPesticideArea?: number
  totalPesticideQuantity?: number
}

const WorkOrderPrint: React.FC<WorkOrderPrintProps> = ({ 
  order, 
  woodRecords, 
  totalPesticideArea = 0, 
  totalPesticideQuantity = 0 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

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
      color: 'black',
      zIndex: 9999
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
            .print-section table {
              border: 1px solid #000 !important;
              border-collapse: collapse !important;
              width: 100% !important;
              margin-bottom: 10px !important;
            }
            .print-section th, .print-section td {
              border: 1px solid #000 !important;
              padding: 4px 8px !important;
              font-size: 11pt !important;
            }
            .print-section th {
              background: #f5f5f5 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 15 }}>
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
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.assignee || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>防治队伍</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.team || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>处置日期</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.disposalDate || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>复查日期</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{order.reviewDate || order.reviewDeadline || '-'}</td>
            </tr>
            {(totalPesticideArea > 0 || totalPesticideQuantity > 0) && (
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>累计用药面积</td>
                <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{totalPesticideArea} 亩</td>
                <td style={{ border: '1px solid #000', padding: '8px 12px', background: '#f5f5f5' }}>累计用药量</td>
                <td style={{ border: '1px solid #000', padding: '8px 12px' }}>{totalPesticideQuantity} 单位</td>
              </tr>
            )}
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
          <div style={{ marginBottom: 15 }}>
            <h3 style={{ fontSize: '14pt', margin: '0 0 10px 0', fontWeight: 'bold' }}>
              疫木清理清单（共 {woodRecords.length} 株）
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '60px', textAlign: 'center', background: '#f5f5f5' }}>序号</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#f5f5f5' }}>位置</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '100px', background: '#f5f5f5' }}>树种</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '80px', textAlign: 'center', background: '#f5f5f5' }}>胸径(cm)</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '80px', textAlign: 'center', background: '#f5f5f5' }}>树高(m)</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '90px', textAlign: 'center', background: '#f5f5f5' }}>处理方式</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '90px', textAlign: 'center', background: '#f5f5f5' }}>处理结果</th>
                </tr>
              </thead>
              <tbody>
                {woodRecords.map(record => (
                  <tr key={record.id}>
                    <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>{record.no}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{record.location}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{record.treeSpecies}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>{record.diameter}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>{record.height || '-'}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>{record.disposalMethod}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>{record.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
