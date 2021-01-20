import { useState } from 'react'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import Link from '../components/Link'
import { useRecoilState } from 'recoil'
import accessState from '../atoms/accessState'
import userState from '../atoms/userState'
import getMe from '../api/getMe'
import ErrorMessage from '../components/ErrorMessage'
import login from '../api/login'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [, setAccessToken] = useRecoilState(accessState)
  const [, setUser] = useRecoilState(userState)
  const [error, setError] = useState(null)

  const containerSize = 'w-full md:w-2/3 xl:w-1/3'

  const onLoginClick = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      let res = await login({ email, password })
      const accessToken = res.data.accessToken
      res = await getMe(accessToken)
      setUser(res.data.user)
      setAccessToken(accessToken)
    } catch (err) {
      setError(err)
    }
  }

  return (
    <div className='h-full p-8 flex flex-col md:items-center md:justify-center'>
      <form className={`text-white rounded-md flex flex-col space-y-8 ${containerSize}`}>
        <h1 className='text-4xl font-bold'>Welcome back</h1>

        <TextInput
          id='email'
          label='Email'
          type='email'
          placeholder='Email'
          onChange={setEmail}
          value={email}
        />

        <TextInput
          id='password'
          label='Password'
          placeholder='Password'
          type='password'
          onChange={setPassword}
          value={password}
        />

        <ErrorMessage error={error} />

        <Button
          disabled={!email || !password}
          onClick={onLoginClick}
        >
          Login
        </Button>
      </form>

      <div className={containerSize}>
        <p className='mt-4 text-white'>Need an account? <Link to='/register'>Register here</Link></p>
      </div>
    </div>
  )
}

export default Login
