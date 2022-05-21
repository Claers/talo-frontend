import React, { useState, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import activeGameState from '../state/activeGameState'
import ErrorMessage from '../components/ErrorMessage'
import PlayerAliases from '../components/PlayerAliases'
import { format } from 'date-fns'
import { IconArrowRight, IconBolt, IconChartBar } from '@tabler/icons'
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'
import routes from '../constants/routes'
import TextInput from '../components/TextInput'
import TableCell from '../components/tables/TableCell'
import TableBody from '../components/tables/TableBody'
import usePlayers from '../api/usePlayers'
import { useDebounce } from 'use-debounce'
import Pagination from '../components/Pagination'
import DateCell from '../components/tables/cells/DateCell'
import classNames from 'classnames'
import Page from '../components/Page'
import Table from '../components/tables/Table'

const Players = () => {
  const [search, setSearch] = useState(new URLSearchParams(window.location.search).get('search') ?? '')
  const [debouncedSearch] = useDebounce(search, 300)
  const activeGame = useRecoilValue(activeGameState)
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const { players, count, loading, error } = usePlayers(activeGame, debouncedSearch, page)

  const goToPlayerProps = (player) => {
    navigate(routes.playerProps.replace(':id', player.id), {
      state: { player }
    })
  }

  const goToPlayerEvents = (player) => {
    navigate(routes.playerEvents.replace(':id', player.id), {
      state: { player }
    })
  }

  const goToPlayerStats = (player) => {
    navigate(routes.playerStats.replace(':id', player.id), {
      state: { player }
    })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  return (
    <Page title='Players' isLoading={loading}>
      {(players.length > 0 || debouncedSearch.length > 0) &&
        <div className='flex items-center'>
          <div className='w-1/2 flex-grow md:flex-grow-0 lg:w-1/4'>
            <TextInput
              defaultValue=''
              id='players-search'
              placeholder='Search...'
              onChange={setSearch}
              value={search}
            />
          </div>
          {Boolean(count) && <span className='ml-4'>{count} {count === 1 ? 'player' : 'players'}</span>}
        </div>
      }

      {players.length === 0 && !loading &&
        <>
          {debouncedSearch.length > 0
            ? <p>No players match your query</p>
            : <p>{activeGame.name} doesn&apos;t have any players yet</p>
          }
        </>
      }

      {error && <ErrorMessage error={error} />}

      {players.length > 0 &&
        <>
          <Table columns={['Aliases', 'Properties', 'Registered', 'Last seen', '', '']}>
            <TableBody
              iterator={players}
              configureClassNames={(player, idx) => ({
                'bg-orange-600': player.devBuild && idx % 2 !== 0,
                'bg-orange-500': player.devBuild && idx % 2 === 0
              })}
            >
              {(player) => (
                <>
                  <TableCell className='min-w-80 md:min-w-0'><PlayerAliases aliases={player.aliases} /></TableCell>
                  <TableCell className='w-40'>
                    <div className='flex items-center'>
                      <span>{player.props.length}</span>
                      <Button
                        variant='icon'
                        className={classNames('ml-2 p-1 rounded-full bg-indigo-900', { 'bg-orange-900': player.devBuild })}
                        onClick={() => goToPlayerProps(player)}
                        icon={<IconArrowRight size={16} />}
                      />
                    </div>
                  </TableCell>
                  <DateCell>{format(new Date(player.createdAt), 'do MMM Y')}</DateCell>
                  <DateCell>{format(new Date(player.lastSeenAt), 'do MMM Y')}</DateCell>
                  <TableCell className='w-40'>
                    <Button
                      variant='grey'
                      onClick={() => goToPlayerEvents(player)}
                      icon={<IconBolt size={16} />}
                    >
                      <span>Events</span>
                    </Button>
                  </TableCell>
                  <TableCell className='w-40'>
                    <Button
                      variant='grey'
                      onClick={() => goToPlayerStats(player)}
                      icon={<IconChartBar size={16} />}
                    >
                      <span>Stats</span>
                    </Button>
                  </TableCell>
                </>
              )}
            </TableBody>
          </Table>

          {Boolean(count) && <Pagination count={count} pageState={[page, setPage]} />}
        </>
      }
    </Page>
  )
}

export default Players
