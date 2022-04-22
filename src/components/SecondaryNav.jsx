import React from 'react'
import PropTypes from 'prop-types'
import Link from './Link'
import classNames from 'classnames'
import { useLocation } from 'react-router-dom'
import canViewPage from '../utils/canViewPage'
import userState from '../state/userState'
import { useRecoilValue } from 'recoil'

function SecondaryNav({ routes }) {
  const location = useLocation()
  const user = useRecoilValue(userState)

  const availableRoutes = routes.filter(({ to }) => canViewPage(user, to))
  if (availableRoutes.length < 2) return null

  return (
    <nav className='bg-gray-700 w-screen px-4 md:px-8 -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-8 py-4 border-b-2 border-b-gray-600 flex justify-between items-center'>
      <ul className='flex space-x-8'>
        {availableRoutes.map(({ title, to }) => (
          <li key={to} className='relative'>
            <Link to={to} className={classNames({ '!text-white': location.pathname === to, '!text-indigo-300': location.pathname !== to })}>{title}</Link>
            {location.pathname === to && <div className='absolute bottom-[-16px] left-0 right-0 h-[2px] bg-white transform translate-y-full' />}
          </li>
        ))}
      </ul>
    </nav>
  )
}

SecondaryNav.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired
  })).isRequired
}

export default SecondaryNav
