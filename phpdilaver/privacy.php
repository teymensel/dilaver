<?php
/**
 * Dilaver - Gizlilik Politikası (Privacy Policy)
 * Google Play Store uyumluluğu için oluşturulmuştur.
 */
$appName = "Dilaver";
$lastUpdated = date("d.m.Y");
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $appName; ?> - Gizlilik Politikası</title>
    <style>
        :root {
            --background: #000000;
            --surface: #121212;
            --primary: #007aff;
            --text-primary: #ffffff;
            --text-secondary: #8e8e93;
            --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        body {
            background-color: var(--background);
            color: var(--text-primary);
            font-family: var(--font-family);
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 800px;
            background: var(--surface);
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            margin-top: 40px;
            margin-bottom: 40px;
        }
        h1 { color: var(--primary); margin-top: 0; font-weight: 800; letter-spacing: -1px; }
        h2 { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-top: 30px; font-weight: 700; color: #fff; }
        p { color: var(--text-secondary); font-size: 0.95rem; }
        ul { color: var(--text-secondary); }
        li { margin-bottom: 8px; }
        .footer { margin-top: 40px; font-size: 0.8rem; opacity: 0.5; text-align: center; }
        strong { color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Gizlilik Politikası</h1>
        <p>Son Güncelleme: <?php echo $lastUpdated; ?></p>

        <p><strong><?php echo $appName; ?></strong> uygulaması ("biz", "bize" veya "bizim"), gizliliğinize saygı duyar ve verilerinizi korumayı taahhüt eder.</p>

        <h2>1. Bilgi Toplama ve Kullanım</h2>
        <p>Uygulamamız, amatör telsizcilik eğitim ve kayıt süreçlerini kolaylaştırmak amacıyla tasarlanmıştır. Temel işlevsellik için aşağıdaki veriler gerekebilir:</p>
        <ul>
            <li><strong>Hesap Bilgileri:</strong> İsim, soyisim ve çağrı işareti (callsign).</li>
            <li><strong>Log Kayıtları:</strong> Telsiz görüşmelerinizi kaydettiğinizde girilen frekans ve istasyon bilgileri.</li>
        </ul>

        <h2>2. Çerezler ve Yerel Depolama</h2>
        <p>Uygulama, tercihlerinizi (tema seçimi vb.) hatırlamak için cihazınızdaki yerel depolamayı (localStorage) kullanır.</p>

        <h2>3. Üçüncü Taraf Servisler</h2>
        <p>Dilaver uygulaması, telsiz verilerini sorgulamak için kamuya açık API'leri (DMR, Brandmeister vb.) kullanabilir.</p>

        <h2>4. Veri Güvenliği</h2>
        <p>Verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz.</p>

        <h2>5. Değişiklikler</h2>
        <p>Gizlilik politikamızı zaman zaman güncelleyebiliriz.</p>

        <div class="footer">
            &copy; <?php echo date("Y"); ?> <?php echo $appName; ?> - Tüm Hakları Saklıdır.
        </div>
    </div>
</body>
</html>
