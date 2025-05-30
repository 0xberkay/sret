# OneSignal API Anahtarlarının Korunması ve Bildirim Güvenliği

Bildirim servisleri, mobil uygulamaların kullanıcıyla etkileşim kurması için kritik öneme sahiptir. OneSignal gibi popüler bildirim platformları, Android uygulamalarında yaygın olarak kullanılmaktadır. Ancak, OneSignal API anahtarlarının güvenliği sağlanmazsa, kötü niyetli kişiler tarafından istismar edilebilir. Bu yazıda, OneSignal API anahtarlarının nasıl korunacağını ve bildirim sistemlerinde güvenliği nasıl sağlayacağınızı detaylıca ele alıyoruz.

## 1. OneSignal API Anahtarları Nedir?

- **App ID**: OneSignal uygulamanızı tanımlayan benzersiz kimlik.
- **REST API Key**: Sunucu tarafından kullanılan ve bildirimleri göndermeye yarayan API anahtarı.
- **User Auth Key**: Kullanıcı doğrulama için kullanılan anahtar.

## 2. API Anahtarlarını Koruma Yöntemleri

- **Anahtarları İstemci Tarafında Saklamayın**: REST API Key'i asla mobil uygulama kodunuzda saklamayın. Bu anahtarlar, yalnızca sunucu tarafında kullanılmalıdır.
- **Obfuscation Kullanın**: App ID gibi istemci tarafında gerekli olan anahtarlar için ProGuard veya R8 ile kod karıştırma uygulayın.
- **Doğrulama Ekleyin**: Bildirim gönderme işlemlerinde ek doğrulama katmanları ekleyin.

### Örnek: Güvenli OneSignal Entegrasyonu

```java
// Güvenli olmayan yaklaşım (YAPMAYIN!)
// String apiKey = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"; // REST API Key

// Güvenli yaklaşım
// Yalnızca App ID'yi istemci tarafında saklayın
OneSignal.initWithContext(this);
OneSignal.setAppId("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"); // Yalnızca App ID
```

## 3. Bildirim İsteklerini Sunucu Üzerinden Yapın

- REST API Key ile bildirim gönderme işlemlerini her zaman kendi sunucunuz üzerinden gerçekleştirin.
- İstemci uygulamanızdan direkt OneSignal REST API'ye istek göndermeyin.

### Örnek: Sunucu Tarafında Bildirim Gönderme

```java
// Sunucu tarafı (Node.js) örneği
const https = require('https');
const options = {
  hostname: 'onesignal.com',
  path: '/api/v1/notifications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic YOUR_REST_API_KEY'
  }
};

const data = {
  app_id: 'YOUR_APP_ID',
  contents: { en: 'Bildirim içeriği' },
  included_segments: ['All']
};

const req = https.request(options, (res) => {
  // Yanıt işleme
});

req.write(JSON.stringify(data));
req.end();
```

## 4. Bildirim İçeriğini Şifreleyin

- Hassas bilgi içeren bildirimlerin içeriğini şifreleyin.
- İstemci tarafında, bildirim içeriğini alıp çözerek kullanıcıya gösterin.

## 5. Bildirimlerde Derin Bağlantıları (Deep Links) Güvenli Hale Getirin

- Bildirimlerde derin bağlantı (deep link) kullanıyorsanız, bu bağlantıları doğrulayın.
- Kötü niyetli derin bağlantılardan korunmak için, bildirimlerde yalnızca izin verilen URL şemalarını kullanın.

## 6. Kullanıcı Kimlik Doğrulaması Ekleyin

- Önemli bildirimleri almadan önce kullanıcı kimliğini doğrulayın.
- Kullanıcı oturumu kapattığında, ilgili bildirim aboneliklerini kaldırın veya güncelleyin.

## 7. Düzenli Güvenlik Denetimi Yapın

- OneSignal dashboard'unuzu düzenli olarak kontrol edin ve şüpheli aktiviteleri takip edin.
- API anahtarlarınızın kullanımını izleyin ve herhangi bir güvenlik ihlali şüphesi durumunda hemen yenileyin.

## Sonuç

OneSignal ve diğer bildirim servislerinin API anahtarlarını korumak, mobil uygulamanızın güvenliği için kritik öneme sahiptir. API anahtarlarını sunucu tarafında tutarak, bildirimleri güvenli bir şekilde göndererek ve ek doğrulama katmanları ekleyerek, bildirim sisteminizi kötü niyetli saldırılara karşı koruyabilirsiniz. Unutmayın, bir güvenlik zinciri en zayıf halkası kadar güçlüdür.

---

*Bu yazı, eğitim amaçlıdır. Uygulamalarınızda güvenlik önlemlerini uygularken güncel kaynakları ve resmi OneSignal dokümantasyonunu takip etmeyi unutmayın.* 