"""
Module gathering the definition and trigger of the FastAPI application.
"""

import logging
import traceback
from contextlib import asynccontextmanager

# third parties
import uvicorn
from fastapi import FastAPI

from openalea_interpreter import __version__
from openalea_interpreter.environment import Configuration, Environment
from openalea_interpreter.router import router as root_router


def start(configuration: Configuration) -> None:
    """
    Starts the server using the given configuration.

    Parameters:
        configuration: Server's configuration.
    """
    Environment.set_config(configuration)

    app = create_app(configuration=configuration)
    try:
        uvicorn.run(
            app,
            host=configuration.host,
            port=configuration.port,
            log_level=configuration.log_level,
        )
    except BaseException as e:
        print("".join(traceback.format_exception(type(e), value=e, tb=e.__traceback__)))
        raise e


def create_app(configuration: Configuration) -> FastAPI:
    """
    Creates the Fast API application.

    Parameters:
        configuration: Configuration.

    Returns:
        The application.
    """

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        """
        Defines startup and shutdown procedures.

        Parameters:
            _app: Application.
        """
        logger = logging.getLogger("uvicorn.error")
        logger.info(Environment.get_config())
        yield

    root_base = "http://localhost"
    app: FastAPI = FastAPI(
        title="w3gallery_tdse1d",
        root_path=f"{root_base}:{configuration.host_port}/backends/w3gallery_tdse1d/{__version__}",
        lifespan=lifespan,
    )
    app.include_router(root_router)

    return app
