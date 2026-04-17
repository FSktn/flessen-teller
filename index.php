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
      <p class="kicker">Arduino + USB Bridge + PHP</p>
      <h1>Flessen Teller</h1>
      <p class="subtitle">
        Deze pagina telt automatisch op zodra je bridge script een fles-detectie doorstuurt.
      </p>
    </section>

    <section class="card counter-card">
      <p class="label">Totaal getelde flessen</p>
      <p id="count" class="count">0</p>
      <p id="lastEvent" class="meta">Wachten op nieuwe fles-detecties.</p>
    </section>

    <section class="card controls">
      <h2>Besturing</h2>
      <div class="button-grid">
        <button id="testEventBtn" class="btn" type="button">Test: simuleer fles</button>
        <button id="resetBtn" class="btn btn-danger" type="button">Reset teller</button>
      </div>
      <p id="bridgeStatus" class="meta">Bridge status: run bridge.py op je computer om events door te sturen.</p>
      <p class="hint">
        Verwachte Arduino seriele regel naar bridge: <strong>BOTTLE</strong>.
      </p>
    </section>
  </main>

  <script src="script.js"></script>
</body>
</html>