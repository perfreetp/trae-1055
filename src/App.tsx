import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import Dashboard from './pages/Dashboard'
import TrapRegistration from './pages/TrapRegistration'
import SampleTesting from './pages/SampleTesting'
import EpidemicMap from './pages/EpidemicMap'
import WorkOrders from './pages/WorkOrders'
import PesticideInventory from './pages/PesticideInventory'
import Evaluation from './pages/Evaluation'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="traps" element={<TrapRegistration />} />
        <Route path="samples" element={<SampleTesting />} />
        <Route path="map" element={<EpidemicMap />} />
        <Route path="workorders" element={<WorkOrders />} />
        <Route path="pesticides" element={<PesticideInventory />} />
        <Route path="evaluation" element={<Evaluation />} />
      </Route>
    </Routes>
  )
}

export default App
