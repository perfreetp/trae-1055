import React, { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  BgColorsOutlined,
  ExperimentOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  BarChartOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer }
  } = theme.useToken()

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '监测点看板' },
    { key: '/traps', icon: <BgColorsOutlined />, label: '诱捕器登记' },
    { key: '/samples', icon: <ExperimentOutlined />, label: '样本送检' },
    { key: '/map', icon: <EnvironmentOutlined />, label: '疫情地图' },
    { key: '/workorders', icon: <FileTextOutlined />, label: '处置工单' },
    { key: '/pesticides', icon: <MedicineBoxOutlined />, label: '药剂库存' },
    { key: '/evaluation', icon: <BarChartOutlined />, label: '成效评估' }
  ]

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return '/dashboard'
    return path
  }

  return (
    <Layout className="app-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{ background: '#001529' }}
      >
        <div className="sidebar-logo">
          {collapsed ? '林防' : '林业病虫害监测'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            {menuItems.find(item => item.key === getSelectedKey())?.label || '系统首页'}
          </h2>
          <div style={{ color: '#666' }}>
            林业站 · 管理员
          </div>
        </Header>
        <Content className="page-container" style={{ background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
