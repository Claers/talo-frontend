import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { IconArrowLeft } from '@tabler/icons'
import Button from './Button'
import { useLocation } from 'react-router'

const MobileMenu = (props) => {
  const location = useLocation()
  const [pathname, setPathname] = useState(location.pathname)

  useEffect(() => {
    setPathname(location.pathname)
  }, [props.visible])

  useEffect(() => {
    if (props.visible && location.pathname !== pathname) {
      props.onClose()
    }
  }, [location.pathname, pathname, props.visible])

  return (
    <div className={classNames(
      'fixed transition-transform transform top-0 left-0 bg-gray-900 p-4 w-full h-full z-[999] ',
      {
        'translate-x-0': props.visible,
        '-translate-x-full': !props.visible
      }
    )}>
        <Button
          variant='icon'
          onClick={props.onClose}
        >
          <span className='text-white bg-indigo-600 rounded-full p-1 flex'>
            <IconArrowLeft size={32} />
          </span>
        </Button>

      <ul className='md:hidden mt-8 space-y-8 text-xl'>
        {props.children}
      </ul>
    </div>
  )
}

MobileMenu.propTypes = {
  children: PropTypes.node.isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default MobileMenu
