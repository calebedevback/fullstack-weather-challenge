import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Explore from './pages/Explore'
import Layout from './components/Layout'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token')
    return token ? <>{children}</> : <Navigate to="/login" />
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<Layout />}>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute>
                                <Users />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/explore"
                        element={
                            <PrivateRoute>
                                <Explore />
                            </PrivateRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
