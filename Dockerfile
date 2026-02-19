# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy prisma schema and migrations (needed for runtime + migrations)
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma client
COPY --from=builder /app/src/generated ./src/generated

# Copy better-sqlite3 native binding
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Copy nodemailer (not bundled by Next.js standalone)
COPY --from=builder /app/node_modules/nodemailer ./node_modules/nodemailer

# Copy @napi-rs/canvas (provides DOMMatrix polyfill for pdf-parse)
COPY --from=builder /app/node_modules/@napi-rs ./node_modules/@napi-rs

# Copy pdf-parse and its dependency pdfjs-dist
COPY --from=builder /app/node_modules/pdf-parse ./node_modules/pdf-parse
COPY --from=builder /app/node_modules/pdfjs-dist ./node_modules/pdfjs-dist

# Copy mammoth and all its transitive dependencies
COPY --from=builder /app/node_modules/mammoth ./node_modules/mammoth
COPY --from=builder /app/node_modules/@xmldom ./node_modules/@xmldom
COPY --from=builder /app/node_modules/argparse ./node_modules/argparse
COPY --from=builder /app/node_modules/base64-js ./node_modules/base64-js
COPY --from=builder /app/node_modules/bluebird ./node_modules/bluebird
COPY --from=builder /app/node_modules/dingbat-to-unicode ./node_modules/dingbat-to-unicode
COPY --from=builder /app/node_modules/jszip ./node_modules/jszip
COPY --from=builder /app/node_modules/lop ./node_modules/lop
COPY --from=builder /app/node_modules/option ./node_modules/option
COPY --from=builder /app/node_modules/duck ./node_modules/duck
COPY --from=builder /app/node_modules/path-is-absolute ./node_modules/path-is-absolute
COPY --from=builder /app/node_modules/underscore ./node_modules/underscore
COPY --from=builder /app/node_modules/xmlbuilder ./node_modules/xmlbuilder
COPY --from=builder /app/node_modules/lie ./node_modules/lie
COPY --from=builder /app/node_modules/immediate ./node_modules/immediate
COPY --from=builder /app/node_modules/pako ./node_modules/pako
COPY --from=builder /app/node_modules/readable-stream ./node_modules/readable-stream
COPY --from=builder /app/node_modules/safe-buffer ./node_modules/safe-buffer
COPY --from=builder /app/node_modules/setimmediate ./node_modules/setimmediate
COPY --from=builder /app/node_modules/string_decoder ./node_modules/string_decoder
COPY --from=builder /app/node_modules/util-deprecate ./node_modules/util-deprecate
COPY --from=builder /app/node_modules/inherits ./node_modules/inherits

# Copy adm-zip (for PPTX extraction, no dependencies)
COPY --from=builder /app/node_modules/adm-zip ./node_modules/adm-zip

# Ensure upload directory exists
RUN mkdir -p /app/public/uploads

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
