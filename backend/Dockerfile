ARG ROOT_CONTAINER=ubuntu:20.04
FROM $ROOT_CONTAINER

LABEL maintainer="OpenAlea"

# Fix DL4006
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

USER root

# Package Manager and Python implementation to use (https://github.com/conda-forge/miniforge)
# - conda only: either Miniforge3 to use Python or Miniforge-pypy3 to use PyPy
# - conda + mamba: either Mambaforge to use Python or Mambaforge-pypy3 to use PyPy
ARG miniforge_python=Mambaforge

# Configure environment
ENV CONDA_VERSION=22.11.1-4 \
    CONDA_DIR=/opt/conda \
    CONDA_ENV=openalea \
    NB_USER=openalea \
    NB_UID=1000 \
    SHELL=/bin/bash \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    LANGUAGE=C.UTF-8

ENV NB_PYTHON_PREFIX=${CONDA_DIR}/envs/${CONDA_ENV} \
    PATH=${NB_PYTHON_PREFIX}/bin:${CONDA_DIR}/bin:${PATH} \
    HOME=/home/${NB_USER}

ENV DEBIAN_FRONTEND noninteractive

# Create NB_USER with name openalea user with UID=1000 and in the 'users' group
# and make sure these dirs are writable by the `users` group.
RUN echo "Creating ${NB_USER} user..." && \
    groupadd --gid ${NB_UID} ${NB_USER} && \
    useradd --create-home --gid ${NB_UID} --no-log-init --uid ${NB_UID} ${NB_USER} && \
    echo ". ${CONDA_DIR}/etc/profile.d/conda.sh ; conda activate ${CONDA_ENV}" > /etc/profile.d/init_conda.sh && \
    mkdir -p ${CONDA_DIR} && \
    chown -R ${NB_USER}:${NB_USER} ${CONDA_DIR}/.. && \
    chmod g+w /etc/passwd

# SEE: https://github.com/phusion/baseimage-docker/issues/58
ARG DEBIAN_FRONTEND=noninteractive

# Install all OS dependencies
# install  OpenGL driver required for openalea installation
RUN echo "Installing Apt-get packages..." && \
    apt-get update --fix-missing && \
    apt-get install --yes --no-install-recommends \
    wget ca-certificates sudo locales libgl1-mesa-glx run-one && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    echo "C.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen

RUN echo "auth requisite pam_deny.so" >> /etc/pam.d/su && \
    sed -i.bak -e 's/^%admin/#%admin/' /etc/sudoers && \
    sed -i.bak -e 's/^%sudo/#%sudo/' /etc/sudoers


# Prerequisites installation: conda, mamba
RUN echo "Installing Miniforge..." && \
    set -x && \
    # Miniforge installer
    miniforge_arch=$(uname -m) && \
    export miniforge_arch && \
    if [ "$miniforge_arch" == "aarm64" ]; then \
      miniforge_arch="arm64"; \
    fi; \
    URL="https://github.com/conda-forge/miniforge/releases/download/${CONDA_VERSION}/${miniforge_python}-${CONDA_VERSION}-$(uname)-${miniforge_arch}.sh" && \
    wget --quiet ${URL} -O miniforge.sh && \
    /bin/bash miniforge.sh -f -b -p ${CONDA_DIR} && \
    rm miniforge.sh && \
    # Conda configuration see https://conda.io/projects/conda/en/latest/configuration.html
    echo "conda ${CONDA_VERSION}" >> "${CONDA_DIR}/conda-meta/pinned" && \
    conda config --system --set auto_update_conda false && \
    conda config --system --set show_channel_urls true && \
    conda update --all --quiet --yes && \
    mamba clean -afy && \
    rm -rf "/home/${NB_USER}/.cache/yarn"

RUN mkdir -p /etc/jupyter/ && \
    echo "c.CondaKernelSpecManager.env_filter = f'.*envs/{os.environ["CONDA_ENV"]}.*'" >> /etc/jupyter/jupyter_notebook_config.py

# Create "notebook" conda environment
RUN  mamba env create --name ${CONDA_ENV} -y -c openalea3/label/dev -c openalea3/label/rc -c openalea3 -c conda-forge \
	openalea.plantgl openalea.mtg ipykernel jupyterlab oawidgets k3d openalea.weberpenn \
        && mamba clean -yaf \
        && find ${CONDA_DIR} -follow -type f -name '*.a' -delete \
        && find ${CONDA_DIR} -follow -type f -name '*.pyc' -delete \
        && find ${CONDA_DIR} -follow -type f -name '*.js.map' -delete 

COPY --chown=openalea:openalea ./weberpenn.ipynb /home/openalea

WORKDIR ${HOME}
USER ${NB_USER}

ENV BASH_ENV=/etc/profile.d/init_conda.sh

EXPOSE 8888
##ENTRYPOINT ["/opt/start"]
CMD ["bash", "-c", "source /opt/conda/etc/profile.d/conda.sh && conda activate openalea && jupyter lab --ip=0.0.0.0 --port=8888"]

