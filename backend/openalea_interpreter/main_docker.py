"""
Module gathering implementation facilitating starting the server within a container.
"""

import os
import socket

from openalea_interpreter.app import start
from openalea_interpreter.environment import Configuration


host_port = os.getenv("HOST_PORT") or ""
host_name = os.getenv("HOST_NAME") or ""

if not host_port or not host_name:
    raise RuntimeError(
        "Environment variable 'HOST_PORT' & 'HOST_NAME' should be defined"
    )


def main():
    """
    Starts the server on localhost.

    The w3nest server host and port should be provided as environment variables
    (using `HOST_NAME` and `HOST_PORT` respectively).

    This function is used as the script `run_w3gallery_tdse1d` entry point within the
    `project.toml` file.
    """
    start(
        configuration=Configuration(
            host="0.0.0.0",
            port=8080,  # Port must be 8080 when running within a container.
            host_port=int(host_port),
            host_name=host_name,
            instance_name=socket.gethostname(),  # Map to container ID by default.
            log_level="debug",
        )
    )
