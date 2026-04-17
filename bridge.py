#!/usr/bin/env python3
"""Lees Arduino serial events en verhoog de PHP teller via HTTP."""

from __future__ import annotations

import argparse
import sys
import time

import requests
import serial


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bridge tussen Arduino serial events en PHP teller API"
    )
    parser.add_argument(
        "--port",
        required=True,
        help="Seriele poort van Arduino, bv. /dev/ttyACM0 of COM3",
    )
    parser.add_argument(
        "--baudrate",
        type=int,
        default=9600,
        help="Baudrate van de Arduino serial verbinding (default: 9600)",
    )
    parser.add_argument(
        "--api-url",
        required=True,
        help="Volledige URL naar api.php, bv. http://localhost:8000/api.php",
    )
    parser.add_argument(
        "--cooldown",
        type=float,
        default=1.2,
        help="Minimum tijd tussen twee tellers (seconden)",
    )
    return parser.parse_args()


def increment_counter(api_url: str) -> None:
    response = requests.post(api_url, data={"add": 1}, timeout=5)
    response.raise_for_status()
    payload = response.json()
    count = payload.get("count")
    print(f"Counter updated: {count}")


def main() -> int:
    args = parse_args()

    try:
        ser = serial.Serial(args.port, args.baudrate, timeout=1)
    except serial.SerialException as exc:
        print(f"Could not open serial port: {exc}", file=sys.stderr)
        return 1

    print(
        f"Listening on {args.port} @ {args.baudrate}. Waiting for BOTTLE events..."
    )

    last_event_at = 0.0

    try:
        while True:
            line = ser.readline().decode(errors="ignore").strip().upper()
            if not line:
                continue

            if line != "BOTTLE":
                continue

            now = time.monotonic()
            if now - last_event_at < args.cooldown:
                print("Event ignored due to cooldown")
                continue

            last_event_at = now
            print("Bottle detected")

            try:
                increment_counter(args.api_url)
            except requests.RequestException as exc:
                print(f"API request failed: {exc}", file=sys.stderr)
            except ValueError as exc:
                print(f"Invalid API response: {exc}", file=sys.stderr)
    except KeyboardInterrupt:
        print("\nBridge stopped")
    finally:
        ser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
