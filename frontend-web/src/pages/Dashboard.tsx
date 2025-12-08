import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Thermometer, Droplets, Wind, CloudRain, Download } from 'lucide-react'

export default function Dashboard() {
    const [logs, setLogs] = useState<any[]>([])
    const [insights, setInsights] = useState<any>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const [logsRes, insightsRes] = await Promise.all([
                axios.get('http://localhost:3000/weather/logs', { headers: { Authorization: `Bearer ${token}` } }),
                axios.post('http://localhost:3000/weather/insights', {}, { headers: { Authorization: `Bearer ${token}` } })
            ])
            setLogs(logsRes.data)
            setInsights(insightsRes.data)
        } catch (err) {
            console.error(err)
        }
    }

    const exportData = (type: 'csv' | 'xlsx') => {
        const token = localStorage.getItem('token')
        window.open(`http://localhost:3000/weather/export.${type}?token=${token}`, '_blank')
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground">Real-time weather monitoring and AI insights.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportData('xlsx')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export XLSX
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{insights?.average_temperature || 0}°C</div>
                        <p className="text-xs text-muted-foreground">Based on recent readings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trend Analysis</CardTitle>
                        <CloudRain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{insights?.trend || '-'}</div>
                        <p className="text-xs text-muted-foreground">Temperature direction</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comfort Score</CardTitle>
                        <Wind className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{insights?.comfort_score || '-'}</div>
                        <p className="text-xs text-muted-foreground">0-100 Scale</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Summary</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium leading-none">{insights?.summary || 'No data'}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Temperature History</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={logs.slice().reverse()}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}°C`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorTemp)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Temperature</TableHead>
                                <TableHead>Humidity</TableHead>
                                <TableHead>Wind Speed</TableHead>
                                <TableHead>Condition</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log._id}>
                                    <TableCell className="font-medium">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                                            {log.temperature}°C
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Droplets className="h-4 w-4 text-muted-foreground" />
                                            {log.humidity}%
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Wind className="h-4 w-4 text-muted-foreground" />
                                            {log.wind_speed} km/h
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                            {log.condition}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
