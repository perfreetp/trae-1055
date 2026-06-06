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
  HistoricalCase
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
  mockHistoricalCases
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

  useEffect(() => {
    const saved = localStorage.getItem('forestPestData')
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
      historicalCases
    }
    localStorage.setItem('forestPestData', JSON.stringify(data))
  }, [monitoringPoints, traps, samples, workOrders, pesticides, pesticideUsages, publicReports, evaluationRecords, historicalCases])

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
        setHistoricalCases
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
