#!/bin/bash

echo "Generating SHACL (JSON-LD)…"
mkdir -p built/modules/ROOT/attachments
cat src/modules/ROOT/attachments/dataset.metadata.shacl.ymld | yq -o json > built/modules/ROOT/attachments/dataset.metadata.shacl.jsonld
echo "… OK."
