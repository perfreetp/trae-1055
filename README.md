# 林业病虫害监测管理系统

一个基于 Electron + React + TypeScript + Ant Design 构建的桌面客户端，用于林业站管理松材线虫、美国白蛾等病虫害监测和处置。

## 功能模块

### 1. 监测点看板
- 统计概览：监测点总数、异常监测点、待处理工单、本月虫口总数
- 虫口密度趋势图
- 病虫害类型分布图
- 监测点列表管理（新增、编辑）
- 最近动态提醒

### 2. 诱捕器登记
- 诱捕器信息管理（登记、编辑、删除）
- 状态跟踪（正常/损坏/待更换）
- 维护记录更新
- 诱捕器统计概览

### 3. 样本送检
- 样本登记与管理
- 显微照片上传
- 送检流程跟踪（待送检/送检中/已检测）
- 检测结果登记
- 样本详情查看

### 4. 疫情地图
- 可视化疫情分布地图
- 按病虫害类型筛选
- 重点关注区域列表
- 进行中处置任务跟踪
- 监测点详情弹窗

### 5. 处置工单
- 工单创建与管理
- 疫木清理清单生成
- 处置结果登记（焚烧/粉碎/熏蒸）
- 超期任务提醒
- 现场处置单打印
- 防治队伍跟踪

### 6. 药剂库存
- 药剂入库登记
- 库存预警（库存不足、即将过期）
- 使用记录登记
- 用药面积统计
- 库存数据导出

### 7. 成效评估
- 同期虫口密度对比
- 处置趋势分析
- 历史病例查询
- 群众举报登记与处理
- 月报导出功能

## 技术栈

- **框架**: Electron 28
- **前端**: React 18 + TypeScript
- **UI组件**: Ant Design 5
- **构建工具**: Vite 5
- **图表**: ECharts
- **路由**: React Router v6
- **状态管理**: React Context + localStorage

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
# 方式一：同时启动 Vite 开发服务器和 Electron
npm run electron:dev

# 方式二：分别启动
# 1. 启动 Vite 开发服务器
npm run dev
# 2. 另开终端启动 Electron
npm run electron
```

### 构建生产版本

```bash
# 构建 React 应用和 Electron 主进程
npm run build

# 打包为桌面应用（Windows）
npm run electron:build

# 仅打包不生成安装包
npm run package
```

## 项目结构

```
├── electron/                 # Electron 主进程代码
│   ├── main.ts              # 主进程入口
│   └── preload.ts           # 预加载脚本
├── src/                     # React 前端代码
│   ├── components/          # 通用组件
│   │   └── Layout/         # 布局组件
│   ├── data/               # 模拟数据
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 监测点看板
│   │   ├── TrapRegistration.tsx  # 诱捕器登记
│   │   ├── SampleTesting.tsx     # 样本送检
│   │   ├── EpidemicMap.tsx       # 疫情地图
│   │   ├── WorkOrders.tsx        # 处置工单
│   │   ├── PesticideInventory.tsx # 药剂库存
│   │   └── Evaluation.tsx        # 成效评估
│   ├── store/              # 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 应用入口组件
│   ├── main.tsx            # React 入口
│   └── index.css           # 全局样式
├── index.html              # HTML 模板
├── package.json
├── tsconfig.json           # React 类型配置
├── tsconfig.electron.json  # Electron 类型配置
├── tsconfig.node.json
└── vite.config.ts          # Vite 配置
```

## 数据存储

当前版本使用 localStorage 进行数据持久化，所有数据保存在浏览器本地存储中。

## 注意事项

1. 首次运行需要安装依赖，Electron 包较大，可能需要较长时间
2. 打印功能使用浏览器原生打印 API
3. 文件上传功能在当前版本仅支持本地预览
4. 地图为简化的示意地图，实际项目可接入高德/百度地图 API
