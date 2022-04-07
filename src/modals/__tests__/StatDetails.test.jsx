import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StatDetails from '../StatDetails'
import api from '../../api/api'
import MockAdapter from 'axios-mock-adapter'
import { RecoilRoot } from 'recoil'
import RecoilObserver from '../../state/RecoilObserver'
import activeGameState from '../../state/activeGameState'
import userState from '../../state/userState'
import userTypes from '../../constants/userTypes'

describe('<StatDetails />', () => {
  const axiosMock = new MockAdapter(api)
  const activeGameValue = { id: 1, name: 'Heart Heist' }

  it('should create a stat', async () => {
    axiosMock.onPost('http://talo.test/game-stats').replyOnce(200, { stat: { id: 2 } })

    const closeMock = jest.fn()
    const mutateMock = jest.fn()

    render(
      <RecoilObserver node={userState} initialValue={{ type: userTypes.ADMIN }}>
        <RecoilObserver node={activeGameState} initialValue={activeGameValue}>
          <StatDetails modalState={[true, closeMock]} mutate={mutateMock} />
        </RecoilObserver>
      </RecoilObserver>,
      { wrapper: RecoilRoot }
    )

    userEvent.type(screen.getByLabelText('Internal name'), 'hearts-collected')
    userEvent.type(screen.getByLabelText('Display name'), 'Hearts collected')
    userEvent.click(screen.getByText('Yes'))
    userEvent.type(screen.getByLabelText('Default value'), '52')

    await waitFor(() => expect(screen.getByText('Create')).toBeEnabled())
    userEvent.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalled()
      expect(mutateMock).toHaveBeenCalled()
    })

    const stats = [
      { id: 1 }
    ]

    const mutator = mutateMock.mock.calls[0][0]
    expect(mutator({ stats })).toStrictEqual({
      stats: [...stats, { id: 2 }]
    })
  })

  it('should display an error if the default value is less than the min value', async () => {
    axiosMock.onPost('http://talo.test/game-stats').replyOnce(200, { stat: { id: 2 } })

    const closeMock = jest.fn()
    const mutateMock = jest.fn()

    render(
      <RecoilObserver node={userState} initialValue={{ type: userTypes.ADMIN }}>
        <RecoilObserver node={activeGameState} initialValue={activeGameValue}>
          <StatDetails modalState={[true, closeMock]} mutate={mutateMock} />
        </RecoilObserver>
      </RecoilObserver>,
      { wrapper: RecoilRoot }
    )

    userEvent.type(screen.getByLabelText('Min value'), '60')
    userEvent.type(screen.getByLabelText('Default value'), '52')

    expect(await screen.findByText('Default value must be more than the min value')).toBeInTheDocument()
  })

  it('should display an error if the default value is more than the max value', async () => {
    axiosMock.onPost('http://talo.test/game-stats').replyOnce(200, { stat: { id: 2 } })

    const closeMock = jest.fn()
    const mutateMock = jest.fn()

    render(
      <RecoilObserver node={userState} initialValue={{ type: userTypes.ADMIN }}>
        <RecoilObserver node={activeGameState} initialValue={activeGameValue}>
          <StatDetails modalState={[true, closeMock]} mutate={mutateMock} />
        </RecoilObserver>
      </RecoilObserver>,
      { wrapper: RecoilRoot }
    )

    userEvent.type(screen.getByLabelText('Max value'), '52')
    userEvent.type(screen.getByLabelText('Default value'), '60')

    expect(await screen.findByText('Default value must be less than the max value')).toBeInTheDocument()
  })

  it('should display an error if the min value is more than the max value', async () => {
    axiosMock.onPost('http://talo.test/game-stats').replyOnce(200, { stat: { id: 2 } })

    const closeMock = jest.fn()
    const mutateMock = jest.fn()

    render(
      <RecoilObserver node={userState} initialValue={{ type: userTypes.ADMIN }}>
        <RecoilObserver node={activeGameState} initialValue={activeGameValue}>
          <StatDetails modalState={[true, closeMock]} mutate={mutateMock} />
        </RecoilObserver>
      </RecoilObserver>,
      { wrapper: RecoilRoot }
    )

    userEvent.type(screen.getByLabelText('Max value'), '52')
    userEvent.type(screen.getByLabelText('Min value'), '60')

    expect(await screen.findByText('Max value must be more than the min value')).toBeInTheDocument()
  })

  it('should close when clicking close', () => {
    const closeMock = jest.fn()

    render(
      <RecoilObserver node={userState} initialValue={{ type: userTypes.ADMIN }}>
        <RecoilObserver node={activeGameState} initialValue={activeGameValue}>
          <StatDetails modalState={[true, closeMock]} mutate={jest.fn()} />
        </RecoilObserver>
      </RecoilObserver>,
      { wrapper: RecoilRoot }
    )

    userEvent.click(screen.getByText('Close'))

    expect(closeMock).toHaveBeenCalled()
  })

  it('should update a stat', async () => {
    const closeMock = jest.fn()
    const mutateMock = jest.fn()

    const initialStat = {
      id: 1,
      internalName: 'hearts-collected',
      name: 'Hearts collected',
      global: false,
      minValue: null,
      defaultValue: 5,
      maxValue: null,
      maxChange: null,
      minTimeBetweenUpdates: 0
    }

    axiosMock.onPatch('http://talo.test/game-stats/1').replyOnce(200, {
      stat: {
        ...initialStat,
        minValue: -10,
        maxValue: 30
      }
    })

    render(
      <RecoilObserver node={userState} initialValue={{ type: userTypes.ADMIN }}>
        <RecoilObserver node={activeGameState} initialValue={activeGameValue}>
          <StatDetails
            modalState={[true, closeMock]}
            mutate={mutateMock}
            editingStat={initialStat}
          />
        </RecoilObserver>
      </RecoilObserver>,
      { wrapper: RecoilRoot }
    )

    expect(await screen.findByDisplayValue('hearts-collected')).toBeDisabled()
    expect(await screen.findByDisplayValue('Hearts collected')).toBeInTheDocument()

    userEvent.type(screen.getByLabelText('Min value'), '-10')
    userEvent.type(screen.getByLabelText('Max value'), '30')

    userEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalled()
      expect(mutateMock).toHaveBeenCalled()
    })

    const mutator = mutateMock.mock.calls[0][0]
    expect(mutator({ stats: [initialStat, { id: 2 }] })).toStrictEqual({
      stats: [
        {
          ...initialStat,
          minValue: -10,
          maxValue: 30
        },
        { id: 2 }
      ]
    })
  })

  it('should delete a stat', async () => {
    const closeMock = jest.fn()
    const mutateMock = jest.fn()

    const initialStat = {
      id: 1,
      internalName: 'hearts-collected',
      name: 'Hearts collected',
      global: false,
      minValue: null,
      defaultValue: 5,
      maxValue: null,
      maxChange: null,
      minTimeBetweenUpdates: 0
    }

    axiosMock.onDelete('http://talo.test/game-stats/1').replyOnce(200)
    window.confirm = jest.fn(() => true)

    render(
      <RecoilObserver node={userState} initialValue={{ type: userTypes.ADMIN }}>
        <RecoilObserver node={activeGameState} initialValue={activeGameValue}>
          <StatDetails
            modalState={[true, closeMock]}
            mutate={mutateMock}
            editingStat={initialStat}
          />
        </RecoilObserver>
      </RecoilObserver>,
      { wrapper: RecoilRoot }
    )

    userEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(closeMock).toHaveBeenCalled()
      expect(mutateMock).toHaveBeenCalled()
    })

    const mutator = mutateMock.mock.calls[0][0]
    expect(mutator({ stats: [initialStat, { id: 2 }] })).toStrictEqual({
      stats: [{ id: 2 }]
    })
  })

  it('should not render the delete button for dev users', () => {
    const initialStat = {
      id: 1,
      internalName: 'hearts-collected',
      name: 'Hearts collected',
      global: false,
      minValue: null,
      defaultValue: 5,
      maxValue: null,
      maxChange: null,
      minTimeBetweenUpdates: 0
    }

    render(
      <RecoilObserver node={userState} initialValue={{ type: userTypes.DEV }}>
        <RecoilObserver node={activeGameState} initialValue={activeGameValue}>
          <StatDetails
            modalState={[true, jest.fn()]}
            mutate={jest.fn()}
            editingStat={initialStat}
          />
        </RecoilObserver>
      </RecoilObserver>,
      { wrapper: RecoilRoot }
    )

    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })
})