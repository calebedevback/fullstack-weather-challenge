package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/streadway/amqp"
)

type WeatherData struct {
	Timestamp       string  `json:"timestamp"`
	Temperature     float64 `json:"temperature"`
	Humidity        float64 `json:"humidity"`
	WindSpeed       float64 `json:"wind_speed"`
	Condition       string  `json:"condition"`
	RainProbability float64 `json:"rain_probability"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	rabbitMQHost := os.Getenv("RABBITMQ_HOST")
	if rabbitMQHost == "" {
		rabbitMQHost = "rabbitmq"
	}
	rabbitMQQueue := os.Getenv("RABBITMQ_QUEUE")
	if rabbitMQQueue == "" {
		rabbitMQQueue = "weather_data"
	}
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "http://nestjs-api:3000/weather/logs"
	}

	// Retry connection logic
	var conn *amqp.Connection
	var err error
	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(fmt.Sprintf("amqp://guest:guest@%s:5672/", rabbitMQHost))
		if err == nil {
			break
		}
		log.Printf("Failed to connect to RabbitMQ, retrying in 5s... (%d/10)", i+1)
		time.Sleep(5 * time.Second)
	}
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		rabbitMQQueue, // name
		true,          // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (we will manual ack)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)

			var data WeatherData
			err := json.Unmarshal(d.Body, &data)
			if err != nil {
				log.Printf("Error decoding JSON: %s", err)
				d.Nack(false, false) // Reject message
				continue
			}

			// Validate data (basic example)
			if data.Temperature < -100 || data.Temperature > 100 {
				log.Printf("Invalid temperature: %f", data.Temperature)
				d.Nack(false, false)
				continue
			}

			// Send to NestJS API
			jsonData, _ := json.Marshal(data)
			resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
			if err != nil {
				log.Printf("Error sending to API: %s", err)
				// Basic retry logic could go here, or Nack with requeue=true
				// For now, we Nack with requeue=true to try again later
				d.Nack(false, true) 
				time.Sleep(2 * time.Second) // simple backoff
				continue
			}
			defer resp.Body.Close()

			if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				log.Printf("Successfully sent to API")
				d.Ack(false)
			} else {
				log.Printf("API returned error: %s", resp.Status)
				d.Nack(false, true) // Requeue to try again
			}
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
