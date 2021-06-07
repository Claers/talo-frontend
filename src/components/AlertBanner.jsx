import React from 'react'
import PropTypes from 'prop-types'
import { IconAlertCircle } from '@tabler/icons'
import classNames from 'classnames'

const AlertBanner = (props) => {
  return (
    <div className={classNames('bg-yellow-600 p-4 rounded flex items-center space-x-2', props.className)}>
      <IconAlertCircle size={24} />
      <span>{props.text}</span>
    </div>
  )
}

AlertBanner.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string
}

export default AlertBanner