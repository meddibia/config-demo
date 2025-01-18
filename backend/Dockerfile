# use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# install curl to enable healthchecks
RUN apt update && apt install curl -y

# install the project into `/app`
WORKDIR /app

# enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# copy from the cache instead of linking since it's a mounted volume
ENV UV_LINK_MODE=copy

# install the project's dependencies using the lockfile and settings
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

# Installing separately from its dependencies allows optimal layer caching
ADD . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Reset the entrypoint, don't invoke `uv`
ENTRYPOINT []

# run the FastAPI application by default
ENV PORT=8000
EXPOSE $PORT
CMD fastapi dev --host 0.0.0.0 --port ${PORT} src/main.py
