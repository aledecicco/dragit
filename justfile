init:
    corepack enable
    pnpm install

dev:
    pnpm tauri dev

# Build inside Docker
[linux]
build:
    #!/usr/bin/env bash
    set -e
    IMAGE="dragit-builder"
    if ! docker image inspect "$IMAGE" &>/dev/null; then
        echo "Building Docker image..."
        docker build -f Dockerfile.build -t "$IMAGE" .
    fi
    docker run --rm \
        -v "$(pwd)":/app \
        -v dragit-pnpm-store:/pnpm-store \
        -v dragit-node-modules:/app/node_modules \
        -v dragit-cargo-cache:/root/.cargo/registry \
        -v dragit-cargo-git:/root/.cargo/git \
        -v dragit-target-cache:/app/src-tauri/target \
        "$IMAGE" bash -c "pnpm install --frozen-lockfile && pnpm tauri build --config '{\"bundle\":{\"createUpdaterArtifacts\":false}}'"

[windows]
build:
    pnpm tauri build

lint:
    pnpm lint
