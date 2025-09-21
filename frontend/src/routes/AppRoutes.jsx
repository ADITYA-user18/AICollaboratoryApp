import React from 'react'
import {Route,BrowserRouter,Routes} from 'react-router-dom'
import Login from '../screens/login'
import Register from '../screens/register'
import HOME from '../screens/home'
import Project from '../screens/project'
import UserAuth from '../auth/Userauth'


const AppRoutes = () => {
  return (
    <>
    <BrowserRouter>
    <Routes>
        <Route path='/' element={<UserAuth><HOME/></UserAuth>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/project' element={<UserAuth><Project/></UserAuth>}></Route>
        

    </Routes>
    </BrowserRouter>   
    </>
  )
}

export default AppRoutes
