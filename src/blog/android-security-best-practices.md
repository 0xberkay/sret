# Android Uygulamalarında Güvenlik: En İyi Uygulamalar

Android uygulamalarının güvenliği, hem geliştiriciler hem de kullanıcılar için kritik öneme sahiptir. Mobil uygulamalar, hassas kullanıcı verilerini işlediği ve cihaz üzerinde çeşitli izinlerle çalıştığı için saldırganların hedefi haline gelebilir. Bu nedenle, uygulama geliştiricilerinin güvenlik konusunda bilinçli olması ve en iyi uygulamaları takip etmesi gerekmektedir. Bu yazıda, Android uygulamalarınızı daha güvenli hale getirmek için uygulayabileceğiniz en iyi güvenlik uygulamalarını (best practices) detaylı olarak ele alıyoruz.

## 1. Hassas Verileri Güvende Tutun

Android uygulamaları genellikle kullanıcı adı, şifre, token, kişisel bilgiler gibi hassas verilerle çalışır. Bu verilerin korunması için aşağıdaki önlemleri alın:

- **SharedPreferences** gibi depolama alanlarında hassas verileri düz metin olarak saklamayın. Bunun yerine, Android'in [EncryptedSharedPreferences](https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences) veya [Android Keystore](https://developer.android.com/training/articles/keystore) sistemini kullanın.
- Veritabanı ve dosya sisteminde saklanan hassas verileri şifreleyin. [SQLCipher](https://www.zetetic.net/sqlcipher/) gibi araçlarla SQLite veritabanınızı şifreleyebilirsiniz.
- Dosya sisteminde saklanan dosyalar için `MODE_PRIVATE` kullanın ve gereksiz dosya izinlerinden kaçının.
- Hassas verileri mümkün olduğunca kısa süre saklayın ve işiniz bittiğinde silin.

### Örnek: EncryptedSharedPreferences Kullanımı

```java
SharedPreferences sharedPreferences = EncryptedSharedPreferences.create(
    "secret_shared_prefs",
    masterKeyAlias,
    context,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
);
```

## 2. Güçlü Kimlik Doğrulama ve Yetkilendirme

Kimlik doğrulama ve yetkilendirme, uygulamanızın en zayıf halkası olabilir. Güçlü bir kimlik doğrulama sistemi için:

- OAuth 2.0 veya OpenID Connect gibi modern kimlik doğrulama protokollerini tercih edin. Kendi kimlik doğrulama mekanizmanızı yazmak yerine, güvenilir servis sağlayıcıları kullanın.
- Kullanıcı oturumlarını güvenli şekilde yönetin, token'ları kısa ömürlü yapın ve gerektiğinde iptal edin.
- Refresh token'ları güvenli şekilde saklayın ve erişim token'larını asla istemci tarafında uzun süreli saklamayın.
- Çok faktörlü kimlik doğrulama (MFA) desteği sunun.

### Pratik İpucu
- Kimlik doğrulama işlemlerini her zaman sunucu tarafında gerçekleştirin. İstemci tarafında yapılan kontroller kolayca atlatılabilir.

## 3. Ağ Güvenliği

Ağ üzerinden iletilen veriler, saldırganlar tarafından kolayca ele geçirilebilir. Aşağıdaki önlemleri alın:

- Tüm ağ trafiğini HTTPS üzerinden gerçekleştirin. Sertifika pinning uygulayarak MITM (Man-in-the-Middle) saldırılarına karşı koruma sağlayın.
- API anahtarlarını ve gizli bilgileri istemci tarafında saklamayın. Bunları sunucu tarafında tutun ve istemciye sadece gerekli minimum bilgiyi iletin.
- Güvenli olmayan HTTP bağlantılarını engellemek için `android:usesCleartextTraffic="false"` özelliğini kullanın.
- WebView kullanıyorsanız, JavaScript'i sadece gerektiğinde etkinleştirin ve güvenilmeyen kaynaklardan içerik yüklemeyin.

### Örnek: Sertifika Pinning

```java
OkHttpClient client = new OkHttpClient.Builder()
    .certificatePinner(new CertificatePinner.Builder()
        .add("example.com", "sha256/AAAAAAAAAAAAAAAAAAAAA=")
        .build())
    .build();
```

## 4. Kodunuzu Karıştırın (Obfuscation)

Kodunuzu karıştırmak, tersine mühendisliği zorlaştırır ve saldırganların uygulamanızın mantığını anlamasını engeller.

- ProGuard veya R8 gibi araçlarla kodunuzu karıştırarak, değişken ve metot isimlerini anlamsız hale getirin.
- Sadece gerekli izinleri isteyin ve gereksiz izinlerden kaçının. Gereksiz izinler saldırı yüzeyini artırır.
- Native kod (C/C++) kullanıyorsanız, native kütüphaneleri de obfuscate edin.

### ProGuard Kullanımı

`proguard-rules.pro` dosyanızı dikkatlice yapılandırın ve hassas sınıfları koruma altına alın.

## 5. Güvenlik Açıklarını Düzenli Olarak Test Edin

Uygulamanızda güvenlik açıklarını tespit etmek için hem statik hem de dinamik analiz araçları kullanın:

- **Statik analiz** için: [SonarQube](https://www.sonarqube.org/), [FindBugs](http://findbugs.sourceforge.net/), [Checkmarx](https://www.checkmarx.com/)
- **Dinamik analiz** için: [MobSF](https://mobsf.github.io/), [Frida](https://frida.re/), [Burp Suite](https://portswigger.net/burp)
- Üçüncü parti kütüphaneleri güncel tutun ve güvenlik açıklarını takip edin. [Snyk](https://snyk.io/) gibi araçlarla bağımlılıklarınızı tarayın.
- Uygulamanızın farklı sürümlerini düzenli olarak test edin.

## 6. Root/Jailbreak Tespiti

Root edilmiş cihazlar, uygulamanızın güvenliğini tehlikeye atabilir. Root tespiti için:

- Root/Jailbreak tespit kütüphaneleri kullanın (ör. [RootBeer](https://github.com/scottyab/rootbeer)).
- Uygulamanızın root edilmiş cihazlarda çalışıp çalışmayacağını belirleyin ve gerekirse root tespiti uygulayın.
- Root tespitini atlatmaya yönelik tekniklere karşı uygulamanızı güncel tutun.

## 7. Hata ve Log Yönetimi

Hatalı log yönetimi, hassas bilgilerin sızmasına neden olabilir. Güvenli log yönetimi için:

- Hata mesajlarında ve loglarda hassas bilgi bulundurmayın. Özellikle kullanıcı adı, şifre, token gibi bilgileri loglamayın.
- Logcat çıktılarında kullanıcı verilerinin görünmemesine dikkat edin. Yayın öncesi uygulamanızda log seviyesini minimuma indirin.
- Üretim ortamında debug ve verbose logları devre dışı bırakın.

## 8. Uygulama İzinlerini Minimumda Tutun

- Uygulamanızın gerçekten ihtiyaç duymadığı izinleri istemeyin.
- Kullanıcıya izinlerin neden istendiğini açıkça belirtin ve izinleri çalışma zamanında isteyin.

## 9. Kod ve API Anahtarlarını Gizli Tutun

- API anahtarlarını, gizli anahtarları ve diğer hassas bilgileri kodda veya kaynak dosyalarında saklamayın.
- Gerekirse, bu tür bilgileri sunucu tarafında tutun ve istemciye sadece gerekli minimum bilgiyi iletin.

## Sonuç

Android uygulama güvenliği, çok katmanlı ve sürekli bir süreçtir. Yukarıdaki en iyi uygulamaları takip ederek, uygulamanızın güvenliğini önemli ölçüde artırabilirsiniz. Unutmayın, güvenlik bir defaya mahsus bir işlem değil, sürekli bir süreçtir. Ayrıca, güvenlik açıklarını düzenli olarak test etmek ve güncel tehditleri takip etmek de büyük önem taşır.

Güvenli bir uygulama geliştirmek için hem Android'in sunduğu güvenlik mekanizmalarını hem de topluluk tarafından önerilen en iyi uygulamaları bir arada kullanmalısınız. Kullanıcılarınızın verilerini ve uygulamanızın bütünlüğünü korumak için güvenlik kültürünü geliştirin.

---

*Bu yazı, eğitim amaçlıdır. Uygulamalarınızda güvenlik önlemlerini uygularken güncel kaynakları ve resmi Android dokümantasyonunu takip etmeyi unutmayın. Güvenlik, tüm yazılım geliştirme yaşam döngüsünün ayrılmaz bir parçası olmalıdır.* 