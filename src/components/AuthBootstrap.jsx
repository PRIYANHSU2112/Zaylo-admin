import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetMeQuery } from '../store/api/auth.api'
import { setBootstrapped } from '../store/slices/authSlice'

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch()
  const token = useSelector((s) => s.auth.token)
  const bootstrapped = useSelector((s) => s.auth.bootstrapped)

  const { isFetching, isError, isSuccess } = useGetMeQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (!token) {
      dispatch(setBootstrapped())
      return
    }
    if (!isFetching && (isSuccess || isError)) {
      dispatch(setBootstrapped())
    }
  }, [token, isFetching, isSuccess, isError, dispatch])

  if (!bootstrapped || (token && isFetching && !isSuccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium">
        Loading admin…
      </div>
    )
  }

  return children
}
