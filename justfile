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
        docker build -f packaging/Dockerfile.build -t "$IMAGE" .
    fi
    docker run --rm \
        -v "$(pwd)":/app \
        -v dragit-pnpm-store:/pnpm-store \
        -v dragit-node-modules:/app/node_modules \
        -v dragit-cargo-cache:/root/.cargo/registry \
        -v dragit-cargo-git:/root/.cargo/git \
        -v dragit-target-cache:/app/src-tauri/target \
        -v "$(pwd)/src-tauri/target/release/bundle":/app/src-tauri/target/release/bundle \
        "$IMAGE" bash -c "pnpm install --frozen-lockfile && pnpm tauri build --config '{\"bundle\":{\"createUpdaterArtifacts\":false}}'"

[windows]
build:
    pnpm tauri build

# Build AUR package locally, from latest built .deb (Arch only)
[linux]
build-aur:
    #!/usr/bin/env bash
    set -e
    DEB=$(find src-tauri/target/release/bundle/deb -name "*.deb" | head -1)
    VERSION=$(basename "$DEB" | sed 's/Dragit_\(.*\)_amd64.deb/\1/')
    SHA=$(sha256sum "$DEB" | cut -d' ' -f1)

    TMPDIR=$(mktemp -d)
    sed "s/@VERSION@/$VERSION/; s/@SHA256@/$SHA/" packaging/arch/PKGBUILD.template > "$TMPDIR/PKGBUILD"
    cp packaging/arch/dragit.install "$TMPDIR/"
    cp "$DEB" "$TMPDIR/"

    cd "$TMPDIR"
    makepkg -si

lint:
    pnpm lint
