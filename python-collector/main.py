import os
import time
import json
import logging
import requests
import pika
import schedule
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'weather_data')
LATITUDE = os.getenv('LATITUDE', '-23.5505') # Sao Paulo
LONGITUDE = os.getenv('LONGITUDE', '-46.6333')
COLLECTION_INTERVAL = int(os.getenv('COLLECTION_INTERVAL', '1')) # Minutes

def get_weather_data():
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,precipitation_probability,rain,weather_code,wind_speed_10m"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        current = data.get('current', {})
        
        # Map WMO weather code to string condition
        # https://open-meteo.com/en/docs
        weather_code = current.get('weather_code', 0)
        condition = "Unknown"
        if weather_code == 0: condition = "Clear sky"
        elif weather_code in [1, 2, 3]: condition = "Partly cloudy"
        elif weather_code in [45, 48]: condition = "Fog"
        elif weather_code in [51, 53, 55]: condition = "Drizzle"
        elif weather_code in [61, 63, 65]: condition = "Rain"
        elif weather_code in [71, 73, 75]: condition = "Snow"
        elif weather_code in [95, 96, 99]: condition = "Thunderstorm"
        
        payload = {
            "timestamp": datetime.now().isoformat(),
            "temperature": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "wind_speed": current.get('wind_speed_10m'),
            "condition": condition,
            "rain_probability": current.get('precipitation_probability', 0) # Note: Open-Meteo 'current' might not have prob, using 0 as fallback or check hourly
        }
        
        return payload
    except Exception as e:
        logger.error(f"Error fetching weather data: {e}")
        return None

def publish_message(channel, queue_name, message):
    try:
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            ))
        logger.info(f" [x] Sent weather data: {message['timestamp']}")
    except Exception as e:
        logger.error(f"Error publishing message: {e}")

def job():
    logger.info("Starting collection job...")
    weather_data = get_weather_data()
    
    if weather_data:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
            channel = connection.channel()
            channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
            
            publish_message(channel, RABBITMQ_QUEUE, weather_data)
            
            connection.close()
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")

def main():
    logger.info("Weather Collector Service Started")
    
    # Wait for RabbitMQ to be ready
    time.sleep(10) 
    
    # Run immediately once
    job()
    
    schedule.every(COLLECTION_INTERVAL).minutes.do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()
