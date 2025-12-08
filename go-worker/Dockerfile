FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install git for fetching dependencies
RUN apk add --no-cache git

COPY . .

# Resolve dependencies
RUN go mod tidy

RUN go build -o worker main.go

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/worker .

CMD ["./worker"]
