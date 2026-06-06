export type MinMax = [number, number] | number[] // 0: min, 1: max
export type MaxMin = [number, number] | number[] // 0: max, 1: min

export type UpdateCheckResult =
  | {
      status: 'available'
      version: string
    }
  | {
      status: 'not-available'
    }
  | {
      status: 'error'
      errorCode: string
    }

export type UpdateStateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'latest'
  | 'updating'
  | 'ready'
  | 'error'

export interface UpdateStateSnapshot {
  status: UpdateStateStatus
  availableVersion: string
  errorMessage: string
  downloadPercent: number | null
}
