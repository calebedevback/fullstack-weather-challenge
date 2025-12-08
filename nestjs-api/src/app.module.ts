import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PokemonModule } from './pokemon/pokemon.module';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://mongodb:27017/weatherdb'),
        WeatherModule,
        UsersModule,
        AuthModule,
        PokemonModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
