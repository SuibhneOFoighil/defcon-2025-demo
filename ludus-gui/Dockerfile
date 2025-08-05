FROM node:20-alpine

# Install curl for healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies with npm (avoiding Bun issues)
RUN npm install --legacy-peer-deps --omit=dev --ignore-scripts

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of .next directory
RUN chown -R nextjs:nodejs .next

# Switch to non-root user
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]