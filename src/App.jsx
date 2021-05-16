import React, { useState, useEffect } from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useRecoilState, useRecoilValue } from 'recoil'
import refreshAccess from './api/refreshAccess'
import userState from './state/userState'
import Loading from './components/Loading'
import NavBar from './components/NavBar'
import routes from './constants/routes'
import Events from './pages/Events'
import Players from './pages/Players'
import Register from './pages/Register'
import ConfirmEmailBanner from './components/ConfirmEmailBanner'
import gamesState from './state/gamesState'
import activeGameState from './state/activeGameState'
import APIKeys from './pages/APIKeys'
import PlayerProps from './pages/PlayerProps'
import userTypes from './constants/userTypes'
import AuthService from './services/AuthService'

const App = () => {
  const [user, setUser] = useRecoilState(userState)
  const [isRefreshing, setRefreshing] = useState(true)
  const games = useRecoilValue(gamesState)
  const [activeGame, setActiveGame] = useRecoilState(activeGameState)

  const handleRefreshSession = async () => {
    try {
      const res = await refreshAccess()
      const accessToken = res.data.accessToken
      AuthService.setToken(accessToken)
      setUser(res.data.user)
    } catch (err) {
      console.log('User doesn\'t have a session')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    handleRefreshSession()
  }, [])

  useEffect(() => {
    if (!activeGame && games.length > 0) setActiveGame(games[0])
  }, [activeGame, games])

  if (isRefreshing) {
    return (
      <main className='w-full flex items-center justify-center'>
        <Loading />
      </main>
    )
  }

  return (
    <BrowserRouter>
      {!AuthService.getToken() &&
        <main className='bg-gray-800 w-full'>
          <Switch>
            <Route exact path='/' component={Login} />
            <Route exact path={routes.register} component={Register} />
            <Redirect to='/' />
          </Switch>
        </main>
      }

      {AuthService.getToken() &&
        <div className='w-full'>
          <NavBar />
          <main className='bg-gray-800 w-full p-4 md:p-8 text-white'>
            {!user.emailConfirmed && <ConfirmEmailBanner />}

            <Switch>
              <Route exact path='/' component={Dashboard} />
              {activeGame &&
                <>
                  <Route exact path={routes.players} component={Players} />
                  <Route exact path={routes.events} component={Events} />
                  {user.type === userTypes.ADMIN && <Route exact path={routes.apiKeys} component={APIKeys} />}
                  <Route exact path={routes.playerProps} component={PlayerProps} />
                </>
              }
              <Redirect to='/' />
            </Switch>
          </main>
        </div>
      }
    </BrowserRouter>
  )
}

export default App
