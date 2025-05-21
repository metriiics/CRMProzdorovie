import os
from loguru import logger

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# Удаляем стандартный обработчик
logger.remove()

# Обработчик для access.log
logger.add(
    os.path.join(LOG_DIR, "access.log"),
    level="INFO",
    filter=lambda record: record["level"].name in ("INFO", "SUCCESS", "WARNING"),
    rotation="10 MB",
    retention="10 days",
    compression="zip",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
)

# Обработчик для error.log
logger.add(
    os.path.join(LOG_DIR, "error.log"),
    level="ERROR",
    filter=lambda record: record["level"].name in ("ERROR", "CRITICAL"),
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message} | {exception}"
)
