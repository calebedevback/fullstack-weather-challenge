import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as json2csv from 'json2csv';
import * as XLSX from 'xlsx';

@Injectable()
export class WeatherService {
    constructor(@InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>) { }

    async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
        const createdLog = new this.weatherModel(createWeatherLogDto);
        return createdLog.save();
    }

    async findAll(): Promise<WeatherLog[]> {
        return this.weatherModel.find().sort({ timestamp: -1 }).limit(100).exec();
    }

    async generateInsights() {
        const logs = await this.weatherModel.find().sort({ timestamp: -1 }).limit(24).exec();
        if (logs.length === 0) return { message: "Not enough data" };

        const avgTemp = logs.reduce((acc, curr) => acc + curr.temperature, 0) / logs.length;
        const maxTemp = Math.max(...logs.map(l => l.temperature));
        const minTemp = Math.min(...logs.map(l => l.temperature));

        let trend = "Stable";
        if (logs[0].temperature > logs[logs.length - 1].temperature) trend = "Rising";
        else if (logs[0].temperature < logs[logs.length - 1].temperature) trend = "Falling";

        return {
            average_temperature: avgTemp.toFixed(1),
            max_temperature: maxTemp,
            min_temperature: minTemp,
            trend: trend,
            comfort_score: avgTemp > 20 && avgTemp < 26 ? "High" : "Moderate",
            summary: `The weather is currently ${logs[0].condition} with a temperature of ${logs[0].temperature}°C.`
        };
    }

    async exportCsv() {
        const logs = await this.weatherModel.find().sort({ timestamp: -1 }).lean().exec();
        const fields = ['timestamp', 'temperature', 'humidity', 'wind_speed', 'condition', 'rain_probability'];
        const opts = { fields };
        try {
            const csv = json2csv.parse(logs, opts);
            return csv;
        } catch (err) {
            console.error(err);
            throw new Error('CSV Export Failed');
        }
    }

    async exportXlsx() {
        const logs = await this.weatherModel.find().sort({ timestamp: -1 }).lean().exec();
        const worksheet = XLSX.utils.json_to_sheet(logs);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "WeatherLogs");
        return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    }
}
