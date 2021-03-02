import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import activeGameState from '../state/activeGameState'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import PlayerAliases from '../components/PlayerAliases'
import { format } from 'date-fns'
import Title from '../components/Title'
import { IconArrowRight } from '@tabler/icons'
import Button from '../components/Button'
import { useHistory } from 'react-router-dom'
import routes from '../constants/routes'
import TextInput from '../components/TextInput'
import TableHeader from '../components/tables/TableHeader'
import TableCell from '../components/tables/TableCell'
import TableBody from '../components/tables/TableBody'
import usePlayers from '../api/usePlayers'
import { useDebouncedCallback } from 'use-debounce'

const Players = () => {
  const [search, setSearch] = useState('')
  const activeGame = useRecoilValue(activeGameState)
  const history = useHistory()
  const { players, loading, error } = usePlayers(activeGame, search)

  const debouncedSearch = useDebouncedCallback(setSearch, 300)

  const goToPlayerProps = (player) => {
    history.push({
      pathname: routes.playerProps.replace(':id', player.id),
      state: { player }
    })
  }

  return (
    <div className='space-y-4 md:space-y-8'>
      <Title>Players {players?.length > 0 && `(${players.length})`}</Title>
 
      <div className='rounded overflow-hidden border-2 border-gray-700'>
        <div className='p-4'>
          <div className='w-1/2 lg:w-1/4'>
            <TextInput
              id='players-search'
              placeholder='Search...'
              onChange={debouncedSearch.callback}
              value={debouncedSearch.value}
            />
          </div>
        </div>

        {loading &&
          <div className='flex justify-center'>
            <Loading />
          </div>
        }

        {players?.length === 0 &&
          <p>{activeGame.name} doesn't have any players yet.</p>
        }

        {error && <ErrorMessage error={error} />}

        {players?.length > 0 &&
          <div className='overflow-x-scroll'>
            <table className='table-auto w-full'>
              <TableHeader columns={['Aliases', 'Properties', 'Registered', 'Last seen']} />
              <TableBody iterator={players}>
                {(player) => (
                  <>
                    <TableCell><PlayerAliases aliases={player.aliases} /></TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        <span className='min-w-5'>{Object.keys(player.props).length}</span>
                        <Button
                          variant='icon'
                          className='ml-2 p-1 rounded-full bg-indigo-900'
                          onClick={() => goToPlayerProps(player)}
                          icon={<IconArrowRight size={16} />}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(player.createdAt), 'do MMM Y')}</TableCell>
                    <TableCell>{format(new Date(player.lastSeenAt), 'do MMM Y')}</TableCell>
                  </>
                )}
              </TableBody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}

export default Players
