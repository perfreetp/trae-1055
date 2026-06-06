import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  MonitoringPoint,
  Trap,
  Sample,
  WorkOrder,
  Pesticide,
  PesticideUsage,
  PublicReport,
  EvaluationRecord,
  HistoricalCase,
  PesticideBatch,
  InventoryLog,
  MonthlyReport
} from '../types'
import {
  mockMonitoringPoints,
  mockTraps,
  mockSamples,
  mockWorkOrders,
  mockPesticides,
  mockPesticideUsages,
  mockPublicReports,
  mockEvaluationRecords,
  mockHistoricalCases,
  mockInventoryLogs,
  mockMonthlyReports
} from '../data/mockData'

interface AppContextType {
  monitoringPoints: MonitoringPoint[]
  setMonitoringPoints: React.Dispatch<React.SetStateAction<MonitoringPoint[]>>
  traps: Trap[]
  setTraps: React.Dispatch<React.SetStateAction<Trap[]>>
  samples: Sample[]
  setSamples: React.Dispatch<React.SetStateAction<Sample[]>>
  workOrders: WorkOrder[]
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>
  pesticides: Pesticide[]
  setPesticides: React.Dispatch<React.SetStateAction<Pesticide[]>>
  pesticideUsages: PesticideUsage[]
  setPesticideUsages: React.Dispatch<React.SetStateAction<PesticideUsage[]>>
  publicReports: PublicReport[]
  setPublicReports: React.Dispatch<React.SetStateAction<PublicReport[]>>
  evaluationRecords: EvaluationRecord[]
  setEvaluationRecords: React.Dispatch<React.SetStateAction<EvaluationRecord[]>>
  historicalCases: HistoricalCase[]
  setHistoricalCases: React.Dispatch<React.SetStateAction<HistoricalCase[]>>
  inventoryLogs: InventoryLog[]
  setInventoryLogs: React.Dispatch<React.SetStateAction<InventoryLog[]>>
  monthlyReports: MonthlyReport[]
  setMonthlyReports: React.Dispatch<React.SetStateAction<MonthlyReport[]>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [monitoringPoints, setMonitoringPoints] = useState<MonitoringPoint[]>(mockMonitoringPoints)
  const [traps, setTraps] = useState<Trap[]>(mockTraps)
  const [samples, setSamples] = useState<Sample[]>(mockSamples)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders)
  const [pesticides, setPesticides] = useState<Pesticide[]>(mockPesticides)
  const [pesticideUsages, setPesticideUsages] = useState<PesticideUsage[]>(mockPesticideUsages)
  const [publicReports, setPublicReports] = useState<PublicReport[]>(mockPublicReports)
  const [evaluationRecords, setEvaluationRecords] = useState<EvaluationRecord[]>(mockEvaluationRecords)
  const [historicalCases, setHistoricalCases] = useState<HistoricalCase[]>(mockHistoricalCases)
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(mockInventoryLogs)
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>(mockMonthlyReports)

  useEffect(() => {
    const saved = localStorage.getItem('forestPestData_v2')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.monitoringPoints) setMonitoringPoints(data.monitoringPoints)
        if (data.traps) setTraps(data.traps)
        if (data.samples) setSamples(data.samples)
        if (data.workOrders) setWorkOrders(data.workOrders)
        if (data.pesticides) setPesticides(data.pesticides)
        if (data.pesticideUsages) setPesticideUsages(data.pesticideUsages)
        if (data.publicReports) setPublicReports(data.publicReports)
        if (data.evaluationRecords) setEvaluationRecords(data.evaluationRecords)
        if (data.historicalCases) setHistoricalCases(data.historicalCases)
        if (data.inventoryLogs) setInventoryLogs(data.inventoryLogs)
        if (data.monthlyReports) setMonthlyReports(data.monthlyReports)
      } catch (e) {
        console.error('Failed to load saved data:', e)
      }
    }
  }, [])

  useEffect(() => {
    const data = {
      monitoringPoints,
      traps,
      samples,
      workOrders,
      pesticides,
      pesticideUsages,
      publicReports,
      evaluationRecords,
      historicalCases,
      inventoryLogs,
      monthlyReports
    }
    localStorage.setItem('forestPestData_v2', JSON.stringify(data))
  }, [monitoringPoints, traps, samples, workOrders, pesticides, pesticideUsages, publicReports, evaluationRecords, historicalCases, inventoryLogs, monthlyReports])

  return (
    <AppContext.Provider
      value={{
        monitoringPoints,
        setMonitoringPoints,
        traps,
        setTraps,
        samples,
        setSamples,
        workOrders,
        setWorkOrders,
        pesticides,
        setPesticides,
        pesticideUsages,
        setPesticideUsages,
        publicReports,
        setPublicReports,
        evaluationRecords,
        setEvaluationRecords,
        historicalCases,
        setHistoricalCases,
        inventoryLogs,
        setInventoryLogs,
        monthlyReports,
        setMonthlyReports
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
