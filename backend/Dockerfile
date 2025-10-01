# ========================
# Base image: Micromamba Debian 13 slim
# ========================
FROM mambaorg/micromamba:2.3.2-debian13-slim

LABEL maintainer="OpenAlea"

# ------------------------
# Environment variables
# ------------------------
ENV CONDA_ENV=openalea \
    NB_USER=openalea \
    NB_UID=1000 \
    SHELL=/bin/bash \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    LANGUAGE=C.UTF-8 \
    DEBIAN_FRONTEND=noninteractive \
    NB_PYTHON_PREFIX=/opt/conda/envs/openalea \
    PATH=/opt/conda/envs/openalea/bin:/opt/conda/bin:$PATH \
    HOME=/home/openalea

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# ========================
# Install essential system packages and create user
# ========================
USER root
RUN set -eux; \
    apt-get update --allow-releaseinfo-change && \
    apt-get install -y --no-install-recommends \
    wget \
    ca-certificates \
    sudo \
    locales && \
    # configure UTF-8 locale
    echo "C.UTF-8 UTF-8" > /etc/locale.gen && locale-gen && \
    # create non-root user
    groupadd --gid ${NB_UID} ${NB_USER} && \
    useradd --create-home --gid ${NB_UID} --no-log-init --uid ${NB_UID} ${NB_USER} && \
    # cleanup
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ========================
# Setup micromamba environment
# ========================
RUN micromamba create -y -n ${CONDA_ENV} pip \
    -c openalea3/label/dev \
    -c openalea3/label/rc \
    -c openalea3 \
    -c conda-forge \
    openalea.plantgl \
    openalea.mtg && \
    micromamba clean -afy && \
    find /opt/conda -type f \( -name '*.a' -o -name '*.pyc' -o -name '*.js.map' \) -delete

# ========================
# Setup shell hook for micromamba environment
# ========================
RUN mkdir -p /etc/profile.d/ && \
    echo 'eval "$(micromamba shell hook --shell=bash --root-prefix=/opt/conda)"' > /etc/profile.d/micromamba.sh && \
    echo "micromamba activate ${CONDA_ENV}" >> /etc/profile.d/micromamba.sh

# ========================
# Install Python wheels
# ========================
COPY deps/*.whl /opt/app/deps/
RUN micromamba run -n ${CONDA_ENV} pip install --no-cache-dir /opt/app/deps/*.whl

COPY dist/openalea_interpreter-*.whl /opt/app
RUN micromamba run -n ${CONDA_ENV} pip install --no-cache-dir /opt/app/openalea_interpreter-*.whl && \
    rm -rf /opt/app/*.whl /opt/app/deps/*.whl


# =================================
# Install Custom Micromamba modules
# =================================

# for instance: oawidgets openalea.weberpenn
ARG mambaModules=""

RUN if [ -n "${mambaModules}" ]; then \
    echo "Installing custom Micromamba modules: ${mambaModules}" && \
    micromamba install -n ${CONDA_ENV} -y \ 
    -c openalea3/label/dev \
    -c openalea3/label/rc \
    -c openalea3 \
    -c conda-forge \
    ${mambaModules} && \
    micromamba clean -afy; \
    fi

# ========================
# Switch to non-root user
# ========================
USER ${NB_USER}
WORKDIR ${HOME}

# ========================
# Expose port and entrypoint
# ========================
EXPOSE 8080
ENTRYPOINT ["run_openalea_interpreter"]
