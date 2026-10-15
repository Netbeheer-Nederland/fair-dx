set shell := ["bash", "-uc"]

name := "nbnl-dataset"
fname := replace(name, "-", "_")
title := "NBNL Dataset"
site_title := title
# ref_name := env("REF_NAME", shell("git rev-parse --abbrev-ref HEAD")) 
ref_name := "main"
version := if ref_name == "main" { "upcoming" } else { replace(ref_name, "/", "-") }  # draft/ -> draft-
base_iri := "https://modellen.netbeheernederland.nl"
schema_id := base_iri + "/" + name + "/" + version

_default:
    @just --list --unsorted --justfile {{justfile()}}

# Cleans the output directory
_clean target="":
    #!/bin/bash
    set -e
    echo "Cleaning up…"
    echo
    if [ -d output/{{target}} ]; then \
        rm -rf output/{{target}}; \
    fi
    echo "… OK."
    echo

# Build work and serve website locally
[group("development")]
preview: build serve

# Build all versions as in CI/CD pipeline and serve website locally
[group("development")]
preview-production: && serve
    #!/bin/bash
    CI=true just build

_generate-schemas:
    #!/bin/bash
    set -e
    echo -e "Generating artifacts…"
    echo "Generating SHACL (JSON-LD)…"
    mkdir -p output/model/
    cat src/model/dataset.metadata.shacl.ymld | yq -o json > output/model/dataset.metadata.shacl.jsonld
    echo "… OK."
    echo "Generated SHACL schema files at: output/schemas/shacl/"
    echo

# Build processing logic called by Antora Collector.
[group("development")]
_build: _clean _generate-schemas
    mkdir -p output/docs/adoc
    cp -r src/docs/* output/docs/adoc

_assemble:
    touch output/docs/html/.nojekyll

# Build website
[group("development")]
build: && _assemble
    #!/bin/bash
    echo "Generating site using Antora…"
    if [[ $CI == "true" ]]; then \
        npx antora --fetch antora-playbook.yml; \
    else \
        npx antora --fetch antora-playbook.local.yml; \
    fi
    echo
    echo -e "Generated documentation files at: output/docs/html"
    echo

# Serve the built website locally
[group("development")]
serve:
    @echo -e "Serving website from output/docs/html…"
    @echo
    python -m http.server -d output/docs/html
