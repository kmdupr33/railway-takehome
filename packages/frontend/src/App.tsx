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
  // There's a bug in authorizer. :(
  // Setting clientID above is not sufficient for it to be set in the config used by this
  // component.
  config.client_id = import.meta.env.VITE_AUTHORIZER_CLIENT_ID;
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
