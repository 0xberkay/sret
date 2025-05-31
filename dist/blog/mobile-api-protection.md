# Mobil Uygulamalarda API Koruması

## Giriş
Mobil uygulamalarınızın API'lerini tersine mühendislik saldırılarından korumak, uygulamanızın güvenliğini sağlamak için kritik bir adımdır. API'ler, uygulamanızın backend ile iletişimini sağlar ve bu nedenle güvenlik açıklarına karşı korunmalıdır. Bu yazıda, mobil uygulamalarınızın API'lerini nasıl koruyabileceğinizi detaylı bir şekilde ele alacağız.

## Tehdit Modeli ve Saldırı Senaryoları
Mobil API'ler, aşağıdaki saldırı türlerine karşı savunmasız olabilir:
- **Tersine Mühendislik (Reverse Engineering)**: Saldırganlar, uygulamanın APK veya IPA dosyasını analiz ederek API endpointlerini, anahtarlarını ve işleyişini ortaya çıkarabilir.
- **Man-in-the-Middle (MitM) Saldırıları**: Ağ trafiği dinlenerek hassas veriler ele geçirilebilir veya değiştirilebilir.
- **Yetkisiz Erişim**: Kimlik doğrulama eksikliği veya zayıf token yönetimi nedeniyle API'ye izinsiz erişim sağlanabilir.
- **Replay Attack**: Eski isteklerin tekrar gönderilmesiyle sistem kandırılabilir.
- **Brute Force ve Rate Limiting İhlalleri**: Saldırganlar, API anahtarlarını veya kullanıcı hesaplarını brute force ile ele geçirmeye çalışabilir.

## Derinlemesine Teknik İnceleme
API koruması için aşağıdaki alanlara dikkat etmek gerekir:
- **Kimlik Doğrulama**: API isteklerinin kimlik doğrulaması, token tabanlı kimlik doğrulama (JWT, OAuth2) ve HMAC gibi güvenli yöntemlerle sağlanmalıdır. Token'lar kısa ömürlü olmalı ve refresh mekanizması güvenli şekilde uygulanmalıdır.
- **Veri Şifreleme**: API isteklerinde ve yanıtlarında hassas verilerin şifrelenmesi, veri sızıntısını önler. Tüm iletişim HTTPS üzerinden yapılmalı, TLS 1.2 ve üzeri kullanılmalıdır.
- **Rate Limiting**: API isteklerinin sayısını sınırlandırarak, brute force saldırılarına karşı koruma sağlanır. IP, kullanıcı veya cihaz bazlı rate limiting uygulanabilir.
- **Input Validation**: API isteklerinde gelen verilerin doğrulanması, injection saldırılarına (SQL Injection, XSS, Command Injection vb.) karşı kritik bir koruma sağlar. Sunucu tarafında mutlaka kapsamlı input validation (tip, uzunluk, format, regex kontrolü) yapılmalıdır. Kullanıcıdan gelen tüm veriler güvensiz kabul edilmeli ve sanitize edilmelidir.
- **API Gateway**: API isteklerini yönetmek ve güvenlik önlemlerini uygulamak için API Gateway kullanılabilir. Gateway üzerinde authentication, rate limiting, logging ve monitoring gibi ek güvenlik katmanları eklenebilir.
- **Device Binding**: API token'larını cihaza özel hale getirerek, token'ın başka bir cihazda kullanılmasını engelleyebilirsiniz. Cihaz ID'si, IMEI veya benzeri benzersiz tanımlayıcılar kullanılabilir.
- **Certificate Pinning**: Mobil uygulama ile sunucu arasındaki iletişimde, sadece belirli sertifikalara güvenilmesini sağlayarak MitM saldırılarını önleyebilirsiniz.
- **HMAC (Hash-based Message Authentication Code)**: API isteklerinin bütünlüğünü ve kimliğini doğrulamak için HMAC kullanılabilir. Her istekte, istemci ve sunucu arasında paylaşılan bir anahtar ile imza oluşturulur ve doğrulanır.
- **JWT (JSON Web Token)**: Kullanıcı kimliğini ve yetkilerini güvenli şekilde taşımak için JWT kullanılabilir. JWT'nin imzası doğrulanmalı ve payload şifrelenmemişse hassas veri taşınmamalıdır.
- **Loglama ve İzleme**: API erişimlerini, başarısız girişimleri ve şüpheli aktiviteleri loglayarak anomali tespiti yapabilirsiniz. Loglarda hassas veri bulundurulmamalıdır.
- **Büyük Dosya Yükleme Güvenliği**: Eğer API'niz dosya yüklemeye izin veriyorsa, dosya tipi ve boyutu mutlaka kontrol edilmelidir. Yüklenen dosyalar, web root dizini dışında, erişimi kısıtlı bir alanda saklanmalı ve doğrudan çalıştırılabilir olmamalıdır. Dosya adları sanitize edilmeli ve mümkünse rastgele bir isimle kaydedilmelidir. Yüklenen dosyaların içeriği de (örneğin, antivirüs taraması) kontrol edilebilir.

## Gerçek Saldırı Senaryosu: Tersine Mühendislik ve API Anahtarı Çalınması
Bir saldırgan, mobil uygulamanın APK dosyasını indirip decompile ederek API anahtarlarını veya endpointlerini bulabilir. Bu nedenle:
- API anahtarlarını uygulama içinde düz metin olarak saklamayın.
- Anahtarları sunucu tarafında yönetin ve uygulamaya sadece kısa ömürlü token gönderin.
- Uygulama ile API arasında mutual TLS (mTLS) kullanarak iki yönlü kimlik doğrulama sağlayın.

## Örnek Kod ve Uygulama
Aşağıda, API isteklerini güvenli bir şekilde yapmak için örnek bir kod snippet'i bulunmaktadır:

```swift
import Foundation

func secureAPICall(url: URL, token: String) {
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    // Certificate pinning örneği için ek kodlar eklenebilir
    let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
        if let error = error {
            print("API isteği hatası: \(error)")
            return
        }
        
        if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
            print("API isteği başarılı.")
        } else {
            print("API isteği başarısız.")
        }
    }
    task.resume()
}
```

Ek olarak, HMAC ile imzalı bir istek örneği:

```python
import hmac
import hashlib
import requests

def hmac_signed_request(url, payload, secret_key):
    message = payload.encode('utf-8')
    signature = hmac.new(secret_key.encode('utf-8'), message, hashlib.sha256).hexdigest()
    headers = {'X-Signature': signature}
    response = requests.post(url, data=payload, headers=headers)
    return response
```

## Araçlar & Kaynaklar
- **Postman**: API isteklerini test etmek ve yönetmek için kullanılan bir araç.
- **OWASP API Security Top 10**: API güvenliği için en iyi uygulamalar ve riskler.
- **Burp Suite**: API isteklerini analiz etmek ve güvenlik testleri yapmak için kullanılan bir araç.
- **API Gateway**: AWS API Gateway, Kong gibi araçlar ile API isteklerini yönetmek ve güvenlik önlemlerini uygulamak.
- **MobSF (Mobile Security Framework)**: Mobil uygulama ve API güvenlik testleri için kapsamlı bir araç.
- **Charles Proxy**: Mobil uygulama trafiğini analiz etmek ve MitM saldırılarını simüle etmek için kullanılır.

## Güvenlik Testleri ve Sürekli İzleme
- API'lerinizi düzenli olarak pen-test ve otomatik güvenlik taramaları ile test edin.
- Logları ve erişim kayıtlarını merkezi bir sistemde toplayarak anomali tespiti yapın.
- API anahtarlarının ve token'ların sızıp sızmadığını tespit etmek için monitoring araçları kullanın.
- Uygulama güncellemelerinde güvenlik yamalarını hızlıca yayınlayın.

## Özet & Kontrol Listesi
- [ ] API isteklerini kimlik doğrulama ile koruyun.
- [ ] Hassas verileri şifreleyin ve güvenli bir şekilde iletişim kurun.
- [ ] Rate limiting uygulayarak brute force saldırılarına karşı koruma sağlayın.
- [ ] API isteklerinde gelen verileri doğrulayın.
- [ ] API Gateway kullanarak istekleri yönetin ve güvenlik önlemlerini uygulayın.
- [ ] Device binding ve certificate pinning uygulayın.
- [ ] HMAC veya JWT ile istekleri imzalayın.
- [ ] Düzenli güvenlik testleri yapın ve güncel güvenlik açıklarını takip edin.

---

*Bu yazı eğitim amaçlıdır. API güvenliği hakkında daha fazla bilgi için OWASP API Security Top 10, MASTG ve resmi belgeleri inceleyin.* 