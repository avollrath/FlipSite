import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { blockDemoMode, showDemoModeToast } from '@/lib/demoMode'

export const useDemoGuard = () => {
  const { isDemoMode } = useAuth()
  const navigate = useNavigate()

  return {
    blockDemoMode: () => blockDemoMode(navigate),
    isDemoMode,
    showDemoToast: () => showDemoModeToast(navigate),
  }
}
