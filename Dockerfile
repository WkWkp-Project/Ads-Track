# ---- Ad Ops Dashboard ----
FROM node:20-alpine

# เขตเวลาไทย (ให้ "วันนี้" ตรงกับเวลาไทย)
ENV TZ=Asia/Bangkok
RUN apk add --no-cache tzdata

WORKDIR /app

# ติดตั้ง dependency ก่อน (cache layer)
COPY package*.json ./
RUN npm install --omit=dev

# คัดลอกซอร์ส
COPY src ./src
COPY public ./public

# เก็บข้อมูลใน volume นี้
ENV DATA_DIR=/app/data
VOLUME ["/app/data"]

EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://localhost:3200/healthz || exit 1

CMD ["node", "src/server.js"]
