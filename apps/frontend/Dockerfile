# --- deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/frontend/package.json apps/frontend/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN npm ci

# --- build only frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm run build --workspace=@notes/frontend

# --- serve static
FROM nginx:alpine AS runner
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
