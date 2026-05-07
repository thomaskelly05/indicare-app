export type RuntimeSurface = 'standalone' | 'operational_os'

export interface RuntimeSurfaceConfig {
  surface: RuntimeSurface
  persistentMemory: boolean
  operationalRetrieval: boolean
  chronologyRuntime: boolean
  workflowContinuity: boolean
}

export const STANDALONE_SURFACE: RuntimeSurfaceConfig = {
  surface: 'standalone',
  persistentMemory: false,
  operationalRetrieval: false,
  chronologyRuntime: false,
  workflowContinuity: false,
}

export const OPERATIONAL_OS_SURFACE: RuntimeSurfaceConfig = {
  surface: 'operational_os',
  persistentMemory: true,
  operationalRetrieval: true,
  chronologyRuntime: true,
  workflowContinuity: true,
}

export function assertSurfaceIsolation(
  source: RuntimeSurfaceConfig,
  target: RuntimeSurfaceConfig,
): boolean {
  if (source.surface === target.surface) {
    return true
  }

  if (
    source.persistentMemory !== target.persistentMemory ||
    source.operationalRetrieval !== target.operationalRetrieval ||
    source.chronologyRuntime !== target.chronologyRuntime
  ) {
    return false
  }

  return true
}
