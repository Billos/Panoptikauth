FROM node:26.1-alpine AS base
WORKDIR /app
RUN npm install -g corepack
RUN corepack enable

FROM base AS builder
COPY . .
RUN yarn 
RUN yarn build

# Final production image
FROM base AS runtime
WORKDIR /app

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY .yarnrc.yml ./.yarnrc.yml
COPY tsconfig.json ./tsconfig.json
COPY .yarn ./.yarn

RUN yarn workspaces focus --all --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/templates ./templates

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]