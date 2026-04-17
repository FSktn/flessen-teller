# flessen-teller

Eenvoudige webapp in PHP, JS, HTML en CSS om flessen te tellen op basis van afstandsverandering van een Arduino + ultrasone sensor.

## Starten

1. Start een lokale PHP server in de root van dit project:

```bash
php -S localhost:8000
```

2. Open daarna in je browser:

```text
http://localhost:8000/index.php
```

## Werking

1. Arduino meet afstand met HC-SR04.
2. Bij een grote afstandsverandering stuurt Arduino `BOTTLE` via USB serial.
3. `bridge.py` leest serial en roept `api.php` aan met `add=1`.
4. De webpagina pollt elke seconde en laat de nieuwe tellerstand direct zien.

## Arduino uploaden

- Open [arduino/bottle_distance_detector.ino](arduino/bottle_distance_detector.ino) in de Arduino IDE.
- Upload naar je Arduino Uno.
- Baudrate in sketch is `9600`.

## Bridge script starten

1. Installeer Python dependencies:

```bash
pip install -r requirements.txt
```

2. Start de bridge (Linux voorbeeld):

```bash
python3 bridge.py --port /dev/ttyACM0 --api-url http://localhost:8000/api.php
```

Als jouw board op een andere poort zit, pas `--port` aan.

Windows voorbeeld:

```bash
python bridge.py --port COM3 --api-url http://localhost:8000/api.php
```

## Opslag

De tellerstand wordt opgeslagen in `data/counter.json`.