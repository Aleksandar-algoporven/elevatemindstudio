import asyncio
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


async def sync_inbox() -> None:
    logging.info("sync_inbox placeholder completed")


async def refresh_analytics() -> None:
    logging.info("refresh_analytics placeholder completed")


async def publishing_tick() -> None:
    logging.info("publishing_tick placeholder completed")


async def run_once() -> None:
    await sync_inbox()
    await refresh_analytics()
    await publishing_tick()


if __name__ == "__main__":
    asyncio.run(run_once())
