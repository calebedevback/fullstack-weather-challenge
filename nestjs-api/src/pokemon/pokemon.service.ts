import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokemonService {
    private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

    async findAll(limit: number = 20, offset: number = 0) {
        try {
            const response = await axios.get(`${this.baseUrl}?limit=${limit}&offset=${offset}`);
            return response.data;
        } catch (error) {
            throw new HttpException('Failed to fetch pokemons', HttpStatus.BAD_GATEWAY);
        }
    }

    async findOne(name: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/${name}`);
            return {
                id: response.data.id,
                name: response.data.name,
                height: response.data.height,
                weight: response.data.weight,
                types: response.data.types.map((t: any) => t.type.name),
                sprites: response.data.sprites,
                stats: response.data.stats.map((s: any) => ({
                    name: s.stat.name,
                    value: s.base_stat
                }))
            };
        } catch (error) {
            throw new HttpException('Pokemon not found', HttpStatus.NOT_FOUND);
        }
    }
}
