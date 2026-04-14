# Multi-stage build for Axum API

# Stage 1: Build
FROM rust:1.75 as builder

WORKDIR /build

# Copy workspace root and all crates
COPY Cargo.toml Cargo.lock ./
COPY shared ./shared
COPY api ./api

# Build the API binary
RUN cargo build --release -p orchestra-box-office-api

# Stage 2: Runtime
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/target/release/orchestra-box-office-api ./

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run on port 8080 (Fly.io will proxy requests)
ENV RUST_LOG=orchestra_box_office_api=debug
EXPOSE 8080

CMD ["./orchestra-box-office-api"]
