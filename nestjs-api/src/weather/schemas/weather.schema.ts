import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema()
export class WeatherLog {
    @Prop({ required: true })
    timestamp: Date;

    @Prop({ required: true })
    temperature: number;

    @Prop({ required: true })
    humidity: number;

    @Prop({ required: true })
    wind_speed: number;

    @Prop({ required: true })
    condition: string;

    @Prop({ required: true })
    rain_probability: number;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
