import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Explore() {
    const [pokemons, setPokemons] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [offset, setOffset] = useState(0)
    const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()
    const limit = 20

    useEffect(() => {
        fetchPokemons()
    }, [offset])

    const fetchPokemons = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`http://localhost:3000/pokemon?limit=${limit}&offset=${offset}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setPokemons(res.data.results)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPokemonDetails = async (name: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`http://localhost:3000/pokemon/${name}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSelectedPokemon(res.data)
            setIsModalOpen(true)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Explore Pokémon</h1>
                <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pokemons.map((poke) => (
                    <Card key={poke.name} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => fetchPokemonDetails(poke.name)}>
                        <CardHeader>
                            <CardTitle className="capitalize text-center">{poke.name}</CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center space-x-4 mt-8">
                <Button
                    variant="outline"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0 || loading}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setOffset(offset + limit)}
                    disabled={loading}
                >
                    Next
                </Button>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="capitalize text-2xl">{selectedPokemon?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedPokemon && (
                        <div className="flex flex-col items-center space-y-4">
                            <img
                                src={selectedPokemon.sprites.front_default}
                                alt={selectedPokemon.name}
                                className="w-32 h-32"
                            />
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="text-center">
                                    <p className="font-bold">Height</p>
                                    <p>{selectedPokemon.height}</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold">Weight</p>
                                    <p>{selectedPokemon.weight}</p>
                                </div>
                            </div>
                            <div className="w-full">
                                <p className="font-bold mb-2">Types</p>
                                <div className="flex gap-2">
                                    {selectedPokemon.types.map((t: string) => (
                                        <span key={t} className="px-2 py-1 bg-primary text-primary-foreground rounded-md text-sm capitalize">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
