# Mobil Uygulamalarda Güvenli Konfigürasyon ve Kod Karıştırma

Uygulama güvenliğini artırmanın önemli yollarından biri, doğru konfigürasyon ve kod karıştırma (obfuscation) kullanmaktır. Bu yazıda en iyi uygulamaları inceliyoruz.

## 1. Build Konfigürasyonu

- **release vs debug**: Yayın sürümünde hata düzeyini (`minifyEnabled`) true yapın.
- `android:usesCleartextTraffic=false` ayarıyla HTTP trafiğini devre dışı bırakın.

```groovy
android {
  buildTypes {
    release {
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }
}
```

## 2. Network Security Config

- XML ile belirli domain'ler için pinning ve cleartext kontrolü sağlayın.

```xml
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
  <domain-config>
    <domain includeSubdomains="true">api.example.com</domain>
    <pin-set>
      <pin digest="SHA-256">7HIpactkIAq2Y49orFOOQKurWxmmSFZhBCoQYcRhJ3Y=</pin>
    </pin-set>
  </domain-config>
</network-security-config>
```

## 3. ProGuard/R8 Kuralları

- Hassas sınıfları korumak için `-keep` kuralları ekleyin.
- Test sonrası karıştırılmış sürümü mutlaka test edin.

```pro
-keep class com.example.app.security.** { *; }
-dontwarn okhttp3.**
```

## 4. Çevresel Değişkenler ve Secrets

- API anahtarlarını kaynak kodda saklamayın, CI/CD'de environment variable olarak yönetin.
- Mobil uygulama yapılarına dynamic config servisleri entegre edin.

## 5. Sonuç

Güvenli konfigürasyon ve kod karıştırma, uygulamanızın saldırı yüzeyini önemli ölçüde azaltır. Her yeni sürümde yapı ayarlarınızı ve ProGuard kurallarınızı gözden geçirin.

---

*Bu yazı eğitim amaçlıdır. Konfigürasyon ve obfuscation rehberleri için resmi Android belgelerini inceleyin.* 