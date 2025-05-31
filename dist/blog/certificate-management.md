# Android ve iOS İçin Sertifika Yönetimi ve Kod İmzalama

Mobil uygulamalarda sertifika yönetimi ve kod imzalama, kaynağın doğruluğunu ve bütünlüğünü sağlamak için kritik adımlardır. Bu yazıda iş akışını ve en iyi uygulamaları ele alıyoruz.

## 1. Android Kod İmzalama

- **Keystore**: Uygulamanızın imza anahtarlarını güvenle saklar.
- `key.properties` dosyası ile CI/CD ortamında şifreli anahtar yönetimi.
- `gradle.properties` yerine environment variable kullanın.

```groovy
signingConfigs {
  release {
    keyAlias keystoreProperties['keyAlias']
    keyPassword keystoreProperties['keyPassword']
    storeFile file(keystoreProperties['storeFile'])
    storePassword keystoreProperties['storePassword']
  }
}
```

## 2. iOS Kod İmzalama

- **Certificates & Provisioning Profiles**: Apple Developer portal üzerinden yönetilir.
- **Automatic vs Manual Signing**: Xcode'da otomatize veya elle imzalama seçenekleri.
- CI/CD için `fastlane match` kullanarak sertifika paylaşımı.

## 3. Sertifika Yenileme ve Rotasyon

- Sertifikalarınızın geçerlilik süresini takip edin.
- CI/CD pipeline'da sertifika yenileme adımlarını otomatize edin.
- Kullanılmayan eski sertifikaları iptal edin.

## 4. Üçüncü Parti Kitaplıkların İmzalanması

- Native kütüphanelerin (`.so`, `.framework`) imza bütünlüğünü kontrol edin.
- 3rd party SDK'ları güncel tutun, imzalarını doğrulayın.

## 5. Sonuç

Doğru sertifika yönetimi ve kod imzalama, uygulamanızın kaynağının güvenilirliğini garanti eder. CI/CD entegrasyonu ile bu süreci otomatikleştirerek riskleri azaltabilirsiniz.

---

*Bu yazı eğitim amaçlıdır. Sertifika yönetimi ve kod imzalama süreçleri için resmi Android ve Apple belgelerini inceleyin.* 