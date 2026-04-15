# --- Stage 1: Build Stage (Yahan sara heavy kaam hoga) ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Build tools install kar rahe hain taki libraries sahi se compile ho jayein
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Requirements copy karke install kar rahe hain
COPY requirements.txt .
# --user flag use kar rahe hain taki binaries ek specific folder mein jayein
RUN pip install --user --no-cache-dir -r requirements.txt


# --- Stage 2: Final Stage (Sirf running files rakehenge) ---
FROM python:3.11-slim

WORKDIR /app

# Builder stage se sirf installed libraries copy kar rahe hain (Kachra peeche chodh diya)
COPY --from=builder /root/.local /root/.local
# Ab apna main code copy kar rahe hain
COPY . .

# Environment variables set kar rahe hain taki Python ko sab mil jaye
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app/src

# Port 8000 expose kar diya backend ke liye
EXPOSE 8000

# App start karne ki command
CMD ["python", "-m", "api"]