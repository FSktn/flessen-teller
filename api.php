<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';
$add = $_POST['add'] ?? null;
$dataDir = __DIR__ . '/data';
$dataFile = $dataDir . '/counter.json';

// zorg dat de data map bestaat zodat de tellerstand kan worden bewaard
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

// maak telleropslag aan bij de eerste start
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode(['count' => 0], JSON_PRETTY_PRINT));
}

function readCount(string $filePath): int
{
    // gebruik nul als opslag niet leesbaar of ongeldig is
    $raw = file_get_contents($filePath);
    if ($raw === false || $raw === '') {
        return 0;
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['count'])) {
        return 0;
    }

    return (int) $data['count'];
}

function writeCount(string $filePath, int $count): bool
{
    // lock_ex voorkomt kapotte writes bij gelijktijdig schrijven
    $payload = json_encode(['count' => $count], JSON_PRETTY_PRINT);
    if ($payload === false) {
        return false;
    }

    return file_put_contents($filePath, $payload, LOCK_EX) !== false;
}

// compatibele route voor bridge scripts die POST add=1 sturen zonder action
if ($add !== null) {
    $incrementBy = (int) $add;
    if ($incrementBy <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Waarde voor add moet groter dan 0 zijn']);
        exit;
    }

    $count = readCount($dataFile) + $incrementBy;
    if (!writeCount($dataFile, $count)) {
        http_response_code(500);
        echo json_encode(['error' => 'Kon teller niet opslaan']);
        exit;
    }

    echo json_encode(['count' => $count]);
    exit;
}

switch ($action) {
    case 'get':
        // geef huidige tellerstand terug zonder wijziging
        echo json_encode(['count' => readCount($dataFile)]);
        break;

    case 'increment':
        // verhoog met een bij elke gevalideerde motion event
        $count = readCount($dataFile) + 1;
        if (!writeCount($dataFile, $count)) {
            http_response_code(500);
            echo json_encode(['error' => 'Kon teller niet opslaan']);
            break;
        }
        echo json_encode(['count' => $count]);
        break;

    case 'reset':
        // handmatige reset vanuit de ui
        if (!writeCount($dataFile, 0)) {
            http_response_code(500);
            echo json_encode(['error' => 'Kon teller niet resetten']);
            break;
        }
        echo json_encode(['count' => 0]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Ongeldige actie']);
        break;
}
