#!/usr/bin/env bash
set -e

# === Config ===
CONDA_DIR="$PWD/miniforge"   # local installation inside current folder
CONDA_ENV="openalea"
MINIFORGE_PYTHON="Mambaforge"
CONDA_VERSION="22.11.1-4"

# === Step 1: Install system deps ===
sudo apt-get update --fix-missing
sudo apt-get install --yes --no-install-recommends \
    wget ca-certificates locales libgl1-mesa-glx

# setup locale (avoids UTF-8 issues)
echo "C.UTF-8 UTF-8" | sudo tee /etc/locale.gen
sudo locale-gen

# === Step 2: Install Miniforge (conda + mamba) ===
if [ ! -d "$CONDA_DIR" ]; then
    echo "Installing Miniforge into $CONDA_DIR..."
    miniforge_arch=$(uname -m)
    if [ "$miniforge_arch" == "aarch64" ]; then
        miniforge_arch="arm64"
    fi
    URL="https://github.com/conda-forge/miniforge/releases/download/${CONDA_VERSION}/${MINIFORGE_PYTHON}-${CONDA_VERSION}-$(uname)-${miniforge_arch}.sh"
    wget --quiet ${URL} -O miniforge.sh
    bash miniforge.sh -b -p "$CONDA_DIR"
    rm miniforge.sh
fi

# Add conda to PATH for this script
export PATH="$CONDA_DIR/bin:$PATH"

# === Step 3: Create environment ===
echo "Creating conda environment '$CONDA_ENV'..."
mamba create -n "$CONDA_ENV" -y \
    -c openalea3/label/dev -c openalea3/label/rc -c openalea3 -c conda-forge \
    openalea.plantgl openalea.mtg ipykernel oawidgets k3d openalea.weberpenn

# === Step 4: Activate instructions ===
echo
echo "✅ Environment created!"
echo "To activate it, run:"
echo "source $CONDA_DIR/etc/profile.d/conda.sh && conda activate $CONDA_ENV"

source "$CONDA_DIR/etc/profile.d/conda.sh"
conda activate "$CONDA_ENV"

pip install -e . --find-links ./deps