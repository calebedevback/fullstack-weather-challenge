import { Controller, Get, Post, Body, Res, Header } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Post('logs')
    @ApiOperation({ summary: 'Create a new weather log' })
    create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
        return this.weatherService.create(createWeatherLogDto);
    }

    @Get('logs')
    @ApiOperation({ summary: 'Get recent weather logs' })
    findAll() {
        return this.weatherService.findAll();
    }

    @Post('insights')
    @ApiOperation({ summary: 'Generate weather insights' })
    getInsights() {
        return this.weatherService.generateInsights();
    }

    @Get('export.csv')
    @ApiOperation({ summary: 'Export logs to CSV' })
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', 'attachment; filename=weather_logs.csv')
    async exportCsv(@Res() res: Response) {
        const csv = await this.weatherService.exportCsv();
        res.send(csv);
    }

    @Get('export.xlsx')
    @ApiOperation({ summary: 'Export logs to XLSX' })
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment; filename=weather_logs.xlsx')
    async exportXlsx(@Res() res: Response) {
        const buffer = await this.weatherService.exportXlsx();
        res.send(buffer);
    }
}
