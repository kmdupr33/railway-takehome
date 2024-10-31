import './App.css'
import {
  AuthorizerProvider,
  Authorizer,
  useAuthorizer,
} from '@authorizerdev/authorizer-react'
function App() {
  return (
    <AuthorizerProvider
      config={{
        authorizerURL: import.meta.env.VITE_AUTHORIZER_URL,
        redirectURL: window.location.origin,
        clientID: import.meta.env.VITE_AUTHORIZER_CLIENT_ID, // obtain your client id from authorizer dashboard
      }}
    >
      <LoginSignup />
      <Profile />
    </AuthorizerProvider>
  )
}

function LoginSignup() {
  const { config } = useAuthorizer();
  console.log(`client_id: ${config.client_id}`);
  return <Authorizer/>
}

function Profile() {
  const { user } = useAuthorizer()

 
  if (user) {
    return <div>{user.email}</div>
  }
 
  return null
}

export default App
