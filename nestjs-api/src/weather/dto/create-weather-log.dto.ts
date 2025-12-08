import { IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeatherLogDto {
    @ApiProperty()
    @IsDateString()
    timestamp: string;

    @ApiProperty()
    @IsNumber()
    temperature: number;

    @ApiProperty()
    @IsNumber()
    humidity: number;

    @ApiProperty()
    @IsNumber()
    wind_speed: number;

    @ApiProperty()
    @IsString()
    condition: string;

    @ApiProperty()
    @IsNumber()
    rain_probability: number;
}
