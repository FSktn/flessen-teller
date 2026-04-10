<!doctype html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flessen Teller</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="page">
    <section class="card hero">
      <p class="kicker">Motion Sensor + Arduino</p>
      <h1>Flessen Teller</h1>
      <p class="subtitle">
        Deze pagina telt flessen wanneer je sensor een beweging meldt.
      </p>
    </section>

    <section class="card counter-card">
      <p class="label">Totaal getelde flessen</p>
      <p id="count" class="count">0</p>
      <p id="lastEvent" class="meta">Nog geen events ontvangen.</p>
    </section>

    <section class="card controls">
      <h2>Besturing</h2>
      <div class="button-grid">
        <button id="connectSerialBtn" class="btn btn-primary" type="button">Verbind met Arduino</button>
        <button id="testEventBtn" class="btn" type="button">Test: simuleer fles</button>
        <button id="resetBtn" class="btn btn-danger" type="button">Reset teller</button>
      </div>
      <p id="serialStatus" class="meta">Seriele status: niet verbonden.</p>
      <p class="hint">
        Verwachte seriele berichten: <strong>MOTION</strong>, <strong>DETECTED</strong> of <strong>1</strong> op een aparte regel.
      </p>
    </section>
  </main>

  <script src="script.js"></script>
</body>
</html>