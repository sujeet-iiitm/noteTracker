FROM node:20-alpine
WORKDIR /app

# at top of Dockerfile
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_CLIENT_SECRET
ARG VITE_key_id_razor
ARG VITE_key_secret_razor

ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_GOOGLE_CLIENT_SECRET=$VITE_GOOGLE_CLIENT_SECRET \
    VITE_key_id_razor=$VITE_key_id_razor \
    VITE_key_secret_razor=$VITE_key_secret_razor
    

# Copy root + frontend deps
COPY package*.json turbo.json ./
COPY apps/frontend/package.json apps/frontend/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN npm ci
RUN npm install -g vite typescript

COPY . .

WORKDIR /app/apps/frontend

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
