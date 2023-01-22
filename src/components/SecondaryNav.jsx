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
    <nav className='bg-gray-700 w-screen px-4 md:px-8 -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-8 py-4 border-b-2 border-b-gray-600 flex justify-between items-center overflow-x-scroll'>
      <ul className='flex space-x-6 md:space-x-8'>
        {availableRoutes.map(({ title, to }) => {
          const active = location.pathname === to

          return <li
            key={to}
            className={classNames('shrink-0 relative after:content-[""] after:absolute after:top-[38px] after:left-0 after:h-0.5 after:w-full', {
              'after:bg-white': active,
              'hover:after:bg-indigo-300': !active
            })}
          >
            <Link
              to={to}
              className={classNames('!no-underline', { '!text-white': active, '!text-indigo-300': !active })}
            >
              {title}
            </Link>
          </li>
        })}
        <li className='md:hidden w-6' />
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
