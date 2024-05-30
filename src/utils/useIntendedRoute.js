import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function useIntendedRoute() {
  const navigate = useNavigate()

  const intendedRouteChecked = useCallback(() => {
    return window.sessionStorage.getItem('intendedRouteChecked') === '1'
  }, [])

  const setIntendedRouteChecked = useCallback(() => {
    window.sessionStorage.setItem('intendedRouteChecked', '1')
  }, [])

  useEffect(() => {
    const intended = window.sessionStorage.getItem('intendedRoute')

    if (intended) {
      window.sessionStorage.removeItem('intendedRoute')
      navigate(intended, { replace: true })
    } else {
      setIntendedRouteChecked()
    }
  }, [])

  return intendedRouteChecked()
}