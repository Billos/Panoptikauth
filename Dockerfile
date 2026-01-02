# Use an official Node.js runtime as a parent image
FROM node:25.2-alpine AS builder

WORKDIR /app
COPY . .
RUN yarn 
RUN yarn build

# Final production image
FROM node:25.2-alpine AS runtime
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]