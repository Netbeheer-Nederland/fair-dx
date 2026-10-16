set shell := ["bash", "-uc"]


_default:
    @just --list --unsorted --justfile {{justfile()}}

# Build work and serve website locally
[group("development")]
preview: build serve

# Build all versions as in CI/CD pipeline and serve website locally
[group("development")]
preview-production: build-all serve

# Build website locally
[group("development")]
build:
    npx antora antora-playbook.local.yml

# Build website locally
[group("development")]
build-all:
    npx antora antora-playbook.yml

# Serve the built website locally
[group("development")]
serve:
    npx http-serve dist
