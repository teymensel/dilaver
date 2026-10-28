<?php
/**
 * Dilaver PHP - Repeater API Proxy & Parser
 * Fetches HTML from radyoamatorleri.com and converts to clean JSON.
 */

header('Content-Type: application/json');

function normalizeText($value) {
    $value = str_replace("\xc2\xa0", ' ', $value); // Handle &nbsp;
    return trim(preg_replace('/\s+/', ' ', $value));
}

function getCellText($node) {
    if (!$node) return '';
    return normalizeText($node->nodeValue);
}

function detectStatus($node) {
    if (!$node) return '-';
    $imgs = $node->getElementsByTagName('img');
    if ($imgs->length > 0) {
        $src = strtolower($imgs->item(0)->getAttribute('src'));
        if (strpos($src, 'antenna') !== false) return 'Çalışıyor';
        if (strpos($src, 'drop') !== false) return 'Çalışmıyor';
        if (strpos($src, 'tamir') !== false) return 'Bakım/Arıza';
        if (strpos($src, 'test') !== false) return 'Testte';
    }
    return getCellText($node) ?: '-';
}

function detectRuhsat($node) {
    if (!$node) return '-';
    $imgs = $node->getElementsByTagName('img');
    if ($imgs->length > 0) {
        $src = strtolower($imgs->item(0)->getAttribute('src'));
        if (strpos($src, 'save') !== false) return 'Var';
    }
    return getCellText($node) ?: '-';
}

$url = 'https://www.radyoamatorleri.com/depo/linkver/html/TA_ROLE.php';
$options = [
    'http' => [
        'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36\r\n" .
                    "Referer: https://www.radyoamatorleri.com/depo/linkver/html/TA_ROLE.html\r\n"
    ]
];
$context = stream_context_create($options);
$html = @file_get_contents($url, false, $context);

if (!$html) {
    echo json_encode(['error' => 'Kaynak verisi alınamadı.']);
    exit;
}

$dom = new DOMDocument();
@$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
$xpath = new DOMXPath($dom);

$rows = $xpath->query("//tr[contains(@class, 'sariarka') or contains(@class, 'pembearka')]");
$results = [];

foreach ($rows as $row) {
    $cells = $row->getElementsByTagName('td');
    if ($cells->length < 11) continue;

    $city = getCellText($cells->item(0));
    $band = getCellText($cells->item(3));
    $location = getCellText($cells->item(5));
    $frequency = getCellText($cells->item(8));

    if (!$city || !$band || !$location || !$frequency) continue;

    $results[] = [
        'city' => $city,
        'taRegion' => getCellText($cells->item(1)) ?: '-',
        'geoRegion' => getCellText($cells->item(2)) ?: '-',
        'band' => $band,
        'altitude' => getCellText($cells->item(4)) ?: '-',
        'location' => $location,
        'power' => getCellText($cells->item(6)) ?: '-',
        'channel' => getCellText($cells->item(7)) ?: '-',
        'frequency' => $frequency,
        'tone' => getCellText($cells->item(9)) ?: '-',
        'sql' => getCellText($cells->item(10)) ?: '-',
        'license' => detectRuhsat($cells->item(11)),
        'status' => detectStatus($cells->item(12)),
        'locator' => getCellText($cells->item(13)) ?: '-',
        'thanks' => getCellText($cells->item(14)) ?: '-',
        'updatedAt' => getCellText($cells->item(15)) ?: '-'
    ];
}

// Sort results
usort($results, function($a, $b) {
    $cmp = strcmp($a['city'], $b['city']);
    return $cmp === 0 ? strcmp($a['location'], $b['location']) : $cmp;
});

echo json_encode($results);
