import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'
import routes from '../constants/routes'

// 1. user hits dashboard.trytalo.com/leaderboards but is logged out
// 2. user is redirected to dashboard.trytalo.com/?next=%2Fleaderboards
// 3. "next" search param is put into sessionStorage
// 4. useIntendedRoute hook picks up logic to redirect based on the sessionStorage
export default function IntendedRouteHandler({ intendedRoute }) {
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get('next')
    if (next) {
      window.sessionStorage.setItem('intendedRoute', next)
    }
  }, [])

  if (!intendedRoute) {
    <Navigate to={routes.login} replace />
  }

  return (
    <Navigate to={`${routes.login}?next=${encodeURIComponent(intendedRoute)}`} replace />
  )
}

IntendedRouteHandler.propTypes = {
  intendedRoute: PropTypes.string.isRequired
}
