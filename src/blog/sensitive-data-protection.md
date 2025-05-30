# Android Uygulamalarında Hassas Veri Koruma

Mobil uygulamalar, kullanıcıların kişisel ve hassas verilerini işlediği için veri güvenliği en önemli önceliklerden biridir. Android ekosisteminde, uygulamanızın güvenliği doğrudan kullanıcı güvenine ve yasal yükümlülüklere bağlıdır. Bu yazıda, Android uygulamalarında hassas verilerin nasıl korunacağına dair en iyi uygulamaları, pratik önerileri ve örnekleri detaylıca bulabilirsiniz.

## 1. Hassas Verileri Şifreleyin

Android uygulamaları genellikle kullanıcı adı, şifre, token, kredi kartı bilgisi gibi hassas verilerle çalışır. Bu verilerin korunması için:

- **SharedPreferences**, **SQLite** veya dosya sisteminde saklanan hassas verileri mutlaka şifreleyin.
- [EncryptedSharedPreferences](https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences) ile anahtar-değer çiftlerini güvenli şekilde saklayın.
- [SQLCipher](https://www.zetetic.net/sqlcipher/) ile SQLite veritabanınızı şifreleyin.
- Dosya sisteminde saklanan dosyalar için `MODE_PRIVATE` kullanın ve gereksiz dosya izinlerinden kaçının.
- Hassas verileri mümkün olduğunca kısa süre saklayın ve işiniz bittiğinde güvenli şekilde silin.

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

## 2. Android Keystore Kullanımı

- Anahtar yönetimi için Android Keystore sistemini kullanın. Şifreleme anahtarlarını uygulama kodunda veya düz metin olarak saklamayın.
- Keystore ile oluşturulan anahtarlar cihazdan dışarı çıkarılamaz ve donanım tabanlı güvenlik sağlar.
- Anahtarlarınızı Keystore ile oluşturduktan sonra, hassas verileri bu anahtarlarla şifreleyin.

### Pratik İpucu
- Anahtar yönetimi ve şifreleme işlemlerini mümkünse donanım destekli (hardware-backed) Keystore ile yapın.

## 3. Hassas Verileri Minimumda Tutun

- Uygulamanızda sadece gerçekten ihtiyaç duyulan hassas verileri saklayın. Gereksiz veri saklamaktan kaçının.
- İşiniz bittiğinde verileri güvenli şekilde silin. Özellikle oturum sonlandırıldığında veya kullanıcı çıkış yaptığında tüm hassas verileri temizleyin.
- Kullanıcıdan alınan verileri, gereksiz yere cihazda veya bellekte tutmayın.

## 4. Güvenli Girdi ve Çıktı

- Kullanıcıdan alınan hassas verileri (örn. şifre, kredi kartı) asla loglamayın.
- Hata mesajlarında veya logcat çıktılarında hassas bilgi bulundurmayın.
- Uygulamanızda debug ve verbose logları üretim ortamında devre dışı bırakın.
- Hata ayıklama sırasında kullanılan test verilerini ve örnek şifreleri uygulama ile birlikte dağıtmayın.

## 5. Güvenli Aktarım

- Hassas verileri ağ üzerinden iletirken mutlaka HTTPS kullanın. HTTP üzerinden iletilen veriler şifrelenmediği için kolayca dinlenebilir.
- Sertifika pinning ile iletilen verilerin üçüncü şahıslarca ele geçirilmesini önleyin.
- API anahtarlarını ve gizli bilgileri istemci tarafında saklamayın, mümkünse sunucu tarafında tutun.

### Örnek: Sertifika Pinning

```java
OkHttpClient client = new OkHttpClient.Builder()
    .certificatePinner(new CertificatePinner.Builder()
        .add("example.com", "sha256/AAAAAAAAAAAAAAAAAAAAA=")
        .build())
    .build();
```

## 6. Yetkisiz Erişime Karşı Koruma

- Uygulamanızda oturum yönetimini güvenli şekilde yapın. Token tabanlı kimlik doğrulama (JWT, OAuth2) kullanın.
- Kullanıcı oturumlarını kısa ömürlü tokenlarla yönetin ve gerektiğinde iptal edin.
- Oturum süresi dolduğunda veya kullanıcı çıkış yaptığında tüm hassas verileri temizleyin.
- Root edilmiş cihazlarda hassas verilerin korunmasına ekstra özen gösterin.

## 7. Güvenli Yedekleme ve Geri Yükleme

- Hassas verilerin yedeklenmesini engellemek için `android:allowBackup="false"` özelliğini kullanın.
- Yedekleme sırasında hassas verilerin şifrelenmiş olduğundan emin olun.

## 8. Üçüncü Parti Kütüphaneler ve SDK'lar

- Kullandığınız üçüncü parti kütüphanelerin güvenli olduğundan ve güncel tutulduğundan emin olun.
- Kütüphanelerin hassas verileri dışarıya sızdırmadığını doğrulayın.

## 9. Kullanıcı Bilgilendirmesi ve İzinler

- Kullanıcıya hangi verilerin neden toplandığını ve nasıl korunduğunu açıkça belirtin.
- Gereksiz izinler istemeyin ve izinleri çalışma zamanında isteyin.

## Sonuç

Hassas veri koruma, Android uygulama güvenliğinin temel taşlarından biridir. Yukarıdaki en iyi uygulamaları takip ederek, kullanıcılarınızın verilerini güvenli bir şekilde saklayabilir ve uygulamanızın güvenliğini artırabilirsiniz. Unutmayın, veri güvenliği bir defaya mahsus bir işlem değil, sürekli bir süreçtir. Yasal düzenlemeleri (KVKK, GDPR vb.) ve güncel güvenlik tehditlerini takip etmek de büyük önem taşır.

Güvenli bir uygulama geliştirmek için hem Android'in sunduğu güvenlik mekanizmalarını hem de topluluk tarafından önerilen en iyi uygulamaları bir arada kullanmalısınız. Kullanıcılarınızın verilerini ve uygulamanızın bütünlüğünü korumak için güvenlik kültürünü geliştirin.

---

*Bu yazı, eğitim amaçlıdır. Uygulamalarınızda güvenlik önlemlerini uygularken güncel kaynakları ve resmi Android dokümantasyonunu takip etmeyi unutmayın. Güvenlik, tüm yazılım geliştirme yaşam döngüsünün ayrılmaz bir parçası olmalıdır.* 