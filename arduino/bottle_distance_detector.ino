const int trigPin = 9;
const int echoPin = 10;

long duration;
int distance;
int lastDistance = 0;

int threshold = 10;   // minimaal verschil in cm voor nieuwe fles
bool bottleDetected = false;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  // Trigger ultrasone meting
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH, 30000);

  // geen geldige meting ontvangen
  if (duration == 0) return;

  distance = duration * 0.034 / 2;

  // detecteer sterke afstandswijziging
  if (abs(distance - lastDistance) > threshold && !bottleDetected) {
    Serial.println("BOTTLE");
    bottleDetected = true;
  }

  // reset detectie wanneer sensor weer stabiel is
  if (abs(distance - lastDistance) < 3) {
    bottleDetected = false;
  }

  lastDistance = distance;

  delay(200);
}
