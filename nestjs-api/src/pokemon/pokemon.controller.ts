import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('pokemon')
@Controller('pokemon')
export class PokemonController {
    constructor(private readonly pokemonService: PokemonService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List pokemons with pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    findAll(@Query('limit') limit: number, @Query('offset') offset: number) {
        return this.pokemonService.findAll(limit, offset);
    }

    @Get(':name')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get pokemon details' })
    findOne(@Param('name') name: string) {
        return this.pokemonService.findOne(name);
    }
}
