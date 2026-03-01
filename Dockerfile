ARG NODE_VERSION=20.14.0

################################################################################

# Étape 1 : Construction
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS builder

# Set working directory for all build stages.
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm install

COPY . .
RUN npm run build

#RUN npm install && npm run build

# Étape 2 : Image de production
FROM node:${NODE_VERSION}-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt \
  -subj "/C=FR/ST=State/L=Paris/O=Sancci/OU=Main/CN=localhost"

# Run the application.
CMD  [ "node", "dist/index.js" ]
