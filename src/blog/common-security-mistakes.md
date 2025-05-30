# Android Uygulamalarında En Yaygın Güvenlik Hataları ve Önlemleri

Android uygulaması geliştirirken, kodunuzda bazı yaygın güvenlik hatalarını yapmak oldukça kolaydır. Bu hatalar, veri sızıntılarına, yetkisiz erişime ve hatta kullanıcı hesaplarının ele geçirilmesine yol açabilir. Bu yazıda, Android uygulamalarında en sık karşılaşılan güvenlik hatalarını ve bunları önlemek için alınabilecek tedbirleri detaylıca ele alıyoruz.

## 1. Hassas Verileri Düz Metin Olarak Saklama

### Hata:
- Şifreleri, API anahtarlarını veya kişisel bilgileri SharedPreferences, SQLite veya dosya sisteminde şifrelenmemiş olarak saklamak.

### Önlem:
- **EncryptedSharedPreferences** kullanın.
- Hassas verileri **Android Keystore** ile şifreleyin.
- Disk üzerinde saklamak zorunda olmadığınız hassas verileri bellekte geçici olarak tutun.

### Örnek: Düzeltilmiş Yaklaşım

```java
// Hatalı yaklaşım
SharedPreferences prefs = context.getSharedPreferences("app_prefs", MODE_PRIVATE);
prefs.edit().putString("password", userPassword).apply();

// Doğru yaklaşım
SharedPreferences encryptedPrefs = EncryptedSharedPreferences.create(
    "secure_prefs",
    masterKeyAlias,
    context,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
);
encryptedPrefs.edit().putString("password", userPassword).apply();
```

## 2. Güvensiz Ağ İletişimi

### Hata:
- HTTP kullanarak veri iletmek.
- SSL/TLS sertifikalarını doğrulamamak.
- Sertifika pinning uygulamamak.

### Önlem:
- Her zaman HTTPS kullanın.
- Sertifika pinning uygulayın.
- Network Security Configuration ile güvensiz bağlantıları önleyin.

### Örnek: Network Security Configuration

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config>
        <domain includeSubdomains="true">example.com</domain>
        <pin-set>
            <pin digest="SHA-256">7HIpactkIAq2Y49orFOOQKurWxmmSFZhBCoQYcRhJ3Y=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

## 3. Yetersiz Giriş Doğrulama

### Hata:
- Kullanıcı girdilerini doğrulamadan kullanmak.
- SQL sorguları veya WebView gibi bileşenlerde doğrulanmamış girdileri kullanmak.

### Önlem:
- Tüm kullanıcı girdilerini hem istemci hem de sunucu tarafında doğrulayın.
- Prepared statement'lar kullanarak SQL injection'ı önleyin.
- WebView'da JavaScript enjeksiyonunu önlemek için girdileri filtreleme ve temizleme yapın.

## 4. Yetersiz Kod Karıştırma (Obfuscation)

### Hata:
- ProGuard veya R8 gibi kod karıştırma araçlarını kullanmamak.
- Karıştırma kurallarını eksik veya hatalı yapılandırmak.

### Önlem:
- ProGuard veya R8 ile kodunuzu karıştırın.
- Özellikle hassas sınıflar ve metodlar için özel kurallar ekleyin.

### Örnek: build.gradle Konfigürasyonu

```groovy
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 5. Gereksiz Uygulama İzinleri

### Hata:
- Uygulamanın gerçekten ihtiyaç duymadığı izinleri istemek.
- Tehlikeli izinleri çalışma zamanında istememek.

### Önlem:
- Yalnızca gerçekten ihtiyaç duyulan izinleri isteyin.
- Tehlikeli izinleri çalışma zamanında ve kullanım sırasında isteyin.
- İzin istenirken kullanıcıya açık bir gerekçe sunun.

## 6. Eksik Günlük (Log) Yönetimi

### Hata:
- Üretim ortamında hassas bilgileri loglamak.
- Hata mesajlarında fazla detay vermek.

### Önlem:
- Üretim sürümünde hassas logları devre dışı bırakın.
- ProGuard kurallarıyla log çağrılarını kaldırın.
- Loglarda asla şifre, token gibi hassas bilgileri kaydetmeyin.

### Örnek: Güvenli Loglama

```java
// Hatalı yaklaşım
Log.d("AUTH", "Kullanıcı: " + username + ", Şifre: " + password);

// Doğru yaklaşım
if (BuildConfig.DEBUG) {
    Log.d("AUTH", "Kullanıcı girişi başarılı: " + username);
}
```

## 7. Zayıf Dosya İzinleri

### Hata:
- Dosyaları MODE_WORLD_READABLE veya MODE_WORLD_WRITEABLE olarak oluşturmak.
- External storage'da hassas veri saklamak.

### Önlem:
- MODE_PRIVATE kullanarak dosyaları oluşturun.
- Hassas verileri her zaman internal storage'da saklayın.
- FileProvider kullanarak dosya paylaşımını güvenli hale getirin.

## 8. WebView Güvenlik Açıkları

### Hata:
- WebView'da JavaScript'i güvenlik önlemleri almadan etkinleştirmek.
- Dosya erişimini kontrolsüz şekilde izin vermek.

### Önlem:
- Yalnızca güvenilir içeriği görüntülemek için WebView kullanın.
- JavaScript'i mümkün olduğunca kapalı tutun, gerekiyorsa özel bir köprü (bridge) ile kısıtlayın.
- addJavascriptInterface metodunu dikkatli kullanın.

## 9. Eksik Kriptografik Yaklaşımlar

### Hata:
- Zayıf veya artık güvenli olmayan şifreleme algoritmalarını kullanmak (MD5, SHA-1, DES).
- Sabit (hardcoded) şifreleme anahtarları kullanmak.

### Önlem:
- Güçlü ve modern şifreleme algoritmaları kullanın (AES-256, SHA-256 veya üzeri).
- Android Keystore'u kullanarak anahtarları güvenli şekilde saklayın.
- Sabit anahtarlar yerine dinamik anahtar üretimi ve yönetimi yapın.

## 10. Yetersiz Oturum Yönetimi

### Hata:
- Token'ları güvensiz bir şekilde saklamak.
- Uzun süreli ve yenilenmeyen oturum token'ları kullanmak.

### Önlem:
- Kısa ömürlü access token'lar ve refresh token mekanizması kullanın.
- Token'ları şifrelenmiş bir şekilde saklayın.
- Hareketsizlik zaman aşımı ve otomatik oturum kapatma mekanizmaları ekleyin.

## Sonuç

Android uygulamalarında güvenlik, ihmal edilmemesi gereken en önemli konulardan biridir. Yukarıda belirtilen yaygın hataları anlamak ve önlemlerini uygulamak, uygulamanızın ve kullanıcılarınızın verilerinin güvende kalmasını sağlayacaktır. Güvenlik bir kerelik değil, sürekli bir süreçtir. Uygulamanızı düzenli olarak güncelleyin, güvenlik açıklarını test edin ve güncel güvenlik standartlarını takip edin.

---

*Bu yazı, eğitim amaçlıdır. Uygulamalarınızda güvenlik önlemlerini uygularken güncel kaynakları ve resmi Android dokümantasyonunu takip etmeyi unutmayın.* 