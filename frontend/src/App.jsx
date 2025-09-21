import { useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'
function App() {
 

  return (
    <>
    <UserProvider>
    <AppRoutes/>
    </UserProvider>
    
         
    </>
  )
}

export default App
