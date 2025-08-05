FROM python:3.11-alpine

# Install curl for healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Copy application files
COPY . .

# Make scripts executable
RUN chmod +x *.sh

EXPOSE 8000

CMD ["python3", "-m", "http.server", "8000"]