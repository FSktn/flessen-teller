# flessen-teller

Eenvoudige webapp in PHP, JS, HTML en CSS om flessen te tellen op basis van motion-events van een Arduino.

## Starten

1. Start een lokale PHP server in de root van dit project:

```bash
php -S localhost:8000
```

2. Open daarna in je browser:

```text
http://localhost:8000/index.php
```

## Arduino koppeling

- Klik op **Verbind met Arduino**.
- Kies de seriele poort van je board.
- Stuur in je Arduino sketch per detectie een regel met bijvoorbeeld `MOTION`, `DETECTED` of `1`.

Voorbeeld in Arduino C++:

```cpp
void setup() {
	Serial.begin(9600);
}

void loop() {
	// Vervang dit met jouw eigen motion sensor check.
	bool motionDetected = false;

	if (motionDetected) {
		Serial.println("MOTION");
		delay(1200); // simpele debounce
	}
}
```

## Opslag

De tellerstand wordt opgeslagen in `data/counter.json`.