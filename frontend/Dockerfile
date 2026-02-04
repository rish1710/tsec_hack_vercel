FROM node:25-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
