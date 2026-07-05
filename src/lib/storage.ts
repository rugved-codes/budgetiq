import type { AppData } from '../types'

const STORAGE_KEY = 'budgetiq-data'

const EMPTY_DATA: AppData = { transactions: [], budgets: [], goals: [] }

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as AppData
    }
  } catch {
    // corrupted storage — start fresh
  }
  return { ...EMPTY_DATA }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearData(): AppData {
  saveData({ ...EMPTY_DATA })
  return { ...EMPTY_DATA }
}
