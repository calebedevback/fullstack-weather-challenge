import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Users() {
    const [users, setUsers] = useState<any[]>([])
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get('http://localhost:3000/users', { headers: { Authorization: `Bearer ${token}` } })
            setUsers(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            await axios.post('http://localhost:3000/users', { email, password }, { headers: { Authorization: `Bearer ${token}` } })
            setEmail('')
            setPassword('')
            fetchUsers()
        } catch (err) {
            console.error(err)
            alert('Failed to create user')
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`http://localhost:3000/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            fetchUsers()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <Input
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button type="submit">Create User</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user._id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
