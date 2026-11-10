FROM oven/bun:1-alpine
WORKDIR /app
COPY server.js .
EXPOSE 3000
CMD ["bun", "server.js"]
