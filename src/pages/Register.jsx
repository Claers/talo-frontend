import { useState } from 'react'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import Link from '../components/Link'
import { useRecoilState } from 'recoil'
import accessState from '../atoms/accessState'
import userState from '../atoms/userState'
import getMe from '../api/getMe'
import register from '../api/register'
import ErrorMessage from '../components/ErrorMessage'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [, setAccessToken] = useRecoilState(accessState)
  const [, setUser] = useRecoilState(userState)
  const [error, setError] = useState(null)

  const containerSize = 'w-full md:w-2/3 xl:w-1/3'

  const onRegisterClick = async (e) => {
    e.preventDefault()

    setError(null)

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password !== password2) {
      setError('Your password and confirmed password don\'t match')
      return
    }

    try {
      let res = await register({ email, password })
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
        <h1 className='text-4xl font-bold'>Let's get started</h1>

        <TextInput
          id='email'
          label='Email'
          type='email'
          placeholder='Purely for functional uses'
          onChange={setEmail}
          value={email}
        />

        <TextInput
          id='password'
          label='Password'
          placeholder='Keep it secure'
          type='password'
          onChange={setPassword}
          value={password}
        />

        <TextInput
          id='password2'
          label='Confirm password'
          placeholder='Repeat the password above'
          type='password'
          onChange={setPassword2}
          value={password2}
        />

        <ErrorMessage error={error} />

        <Button
          disabled={!email || !password || !password2}
          onClick={onRegisterClick}
        >
          Sign up
        </Button>
      </form>

      <div className={containerSize}>
        <p className='mt-4 text-white'>Already have an account? <Link to='/'>Log in here</Link></p>
      </div>
    </div>
  )
}

export default Register
