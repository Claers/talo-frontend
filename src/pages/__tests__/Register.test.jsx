import React from 'react'
import MockAdapter from 'axios-mock-adapter'
import api from '../../api/api'
import { render, screen, waitFor } from '@testing-library/react'
import KitchenSink from '../../utils/KitchenSink'
import userState from '../../state/userState'
import userEvent from '@testing-library/user-event'
import Register from '../Register'

describe('<Register />', () => {
  const axiosMock = new MockAdapter(api)

  it('should let users register', async () => {
    const user = {
      id: 1,
      username: 'Talo'
    }

    const postMock = jest.fn(() => [
      200,
      {
        accessToken: 'ey...',
        user
      }
    ])

    const changeMock = jest.fn()

    axiosMock.onPost('http://talo.test/public/users/register').replyOnce(postMock)

    render(
      <KitchenSink states={[{ node: userState, onChange: changeMock }]}>
        <Register />
      </KitchenSink>
    )

    expect(screen.getByText('Sign up')).toBeDisabled()

    userEvent.type(screen.getByLabelText('Team name'), 'Sleepy Studios')
    userEvent.type(screen.getByLabelText('Username'), 'Talo')
    userEvent.type(screen.getByLabelText('Email'), 'hello@trytalo.com')
    userEvent.type(screen.getByLabelText('Password'), 'p@ssw0rd')

    expect(screen.getByText('Sign up')).toBeDisabled()

    userEvent.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(screen.getByText('Sign up')).toBeEnabled()
    })

    userEvent.click(screen.getByText('Sign up'))

    await waitFor(() => {
      expect(JSON.parse(postMock.mock.calls[0][0].data)).toStrictEqual({
        organisationName: 'Sleepy Studios',
        username: 'Talo',
        email: 'hello@trytalo.com',
        password: 'p@ssw0rd'
      })
    })

    await waitFor(() => {
      expect(changeMock).toHaveBeenCalledWith(user)
    })
  })

  it('should not let users register without a valid email address', async () => {
    render(
      <KitchenSink>
        <Register />
      </KitchenSink>
    )

    expect(screen.getByText('Sign up')).toBeDisabled()

    userEvent.type(screen.getByLabelText('Team name'), 'Sleepy Studios')
    userEvent.type(screen.getByLabelText('Username'), 'Talo')
    userEvent.type(screen.getByLabelText('Email'), 'hello@trytalo')
    userEvent.type(screen.getByLabelText('Password'), 'p@ssw0rd')
    userEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByText('Sign up')).toBeDisabled()
    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('should let users register with an invite code', async () => {
    const user = {
      id: 1,
      username: 'Talo'
    }

    const invite = {
      organisation: {
        name: 'Sleepy Studios'
      },
      token: 'abc123',
      email: 'dev@trytalo.com'
    }

    const postMock = jest.fn(() => [
      200,
      {
        accessToken: 'ey...',
        user
      }
    ])

    const changeMock = jest.fn()

    axiosMock.onPost('http://talo.test/public/users/register').replyOnce(postMock)

    render(
      <KitchenSink
        states={[{ node: userState, onChange: changeMock }]}
        initialEntries={[{ pathname: '/', state: { invite } }]}
      >
        <Register />
      </KitchenSink>
    )

    expect(screen.getByText('Sign up')).toBeDisabled()

    expect(screen.getByText(invite.organisation.name)).toBeInTheDocument()
    expect(screen.getByText('has invited you to join them on Talo')).toBeInTheDocument()

    userEvent.type(screen.getByLabelText('Username'), 'Talo')
    expect(screen.getByLabelText('Email')).toHaveValue('dev@trytalo.com')
    userEvent.type(screen.getByLabelText('Password'), 'p@ssw0rd')

    expect(screen.getByText('Sign up')).toBeDisabled()

    userEvent.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(screen.getByText('Sign up')).toBeEnabled()
    })

    userEvent.click(screen.getByText('Sign up'))

    await waitFor(() => {
      expect(JSON.parse(postMock.mock.calls[0][0].data)).toStrictEqual({
        username: 'Talo',
        email: 'dev@trytalo.com',
        password: 'p@ssw0rd',
        inviteToken: invite.token
      })
    })

    await waitFor(() => {
      expect(changeMock).toHaveBeenCalledWith(user)
    })
  })


  it('should render registration errors', async () => {
    axiosMock.onPost('http://talo.test/public/users/register').networkErrorOnce()

    render(
      <KitchenSink>
        <Register />
      </KitchenSink>
    )

    expect(screen.getByText('Sign up')).toBeDisabled()

    userEvent.type(screen.getByLabelText('Team name'), 'Sleepy Studios')
    userEvent.type(screen.getByLabelText('Username'), 'Talo')
    userEvent.type(screen.getByLabelText('Email'), 'hello@trytalo.com')
    userEvent.type(screen.getByLabelText('Password'), 'p@ssw0rd')

    expect(screen.getByText('Sign up')).toBeDisabled()

    userEvent.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(screen.getByText('Sign up')).toBeEnabled()
    })

    userEvent.click(screen.getByText('Sign up'))

    expect(await screen.findByText('Network Error')).toBeInTheDocument()
  })

  it('should not display the pricing plan banner if the chosen plan is the indie plan', () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation((key) => {
      if (key === 'plan') return 'indie'
      return null
    })

    render(
      <KitchenSink>
        <Register />
      </KitchenSink>
    )

    expect(screen.queryByText('Indie Plan')).not.toBeInTheDocument()
  })

  it('should display the pricing plan banner if the chosen plan is not the indie plan', () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation((key) => {
      if (key === 'plan') return 'team'
      return null
    })

    render(
      <KitchenSink>
        <Register />
      </KitchenSink>
    )

    expect(screen.getByText('Team Plan')).toBeInTheDocument()
    expect(screen.getByText(/To upgrade to the/)).toBeInTheDocument()
  })

  it('should display different copy for the enterprise plan', () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation((key) => {
      if (key === 'plan') return 'enterprise'
      return null
    })

    render(
      <KitchenSink>
        <Register />
      </KitchenSink>
    )

    expect(screen.getByText('Enterprise Plans')).toBeInTheDocument()
    expect(screen.getByText(/To learn more about/)).toBeInTheDocument()
  })
})
