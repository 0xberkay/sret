# Flutter ile Geliştirilen Uygulamalarda Güvenlik İpuçları ve Derinlemesine İnceleme

Flutter, çapraz platform mobil uygulama geliştirme imkânı sunar. Ancak, uygulamanızın güvenliğini sağlamak için yalnızca temel önlemlerle yetinmek yeterli değildir. Flutter uygulamalarında güvenlik, hem Dart kodu hem de native (Android/iOS) tarafı kapsayan çok katmanlı bir süreçtir. Bu yazıda, Flutter uygulamalarında güvenliği artırmak için uygulayabileceğiniz ileri düzey yöntemleri ve dikkat edilmesi gereken noktaları detaylıca ele alacağız.

## 1. Kod Karıştırma (Obfuscation) ve Derleme Sonrası Dosyalar

Flutter ile yazılan uygulamalar derlendiğinde, Dart kodunuz native koda dönüştürülür ve Android için `.so` (shared object) dosyaları, iOS için ise benzer şekilde native kütüphaneler oluşturulur. Bu dosyalar, uygulamanızın APK veya IPA paketinin içinde yer alır. Saldırganlar, bu dosyaları tersine mühendislik ile analiz ederek uygulamanızın işleyişi hakkında bilgi edinebilirler.

- Kodunuzu karıştırmak için:
  ```bash
  flutter build apk --obfuscate --split-debug-info=/<project>/debug-info
  ```
- `--split-debug-info` ile oluşturulan debug sembol dosyalarını güvenli bir yerde saklayın. Bu dosyalar, hata ayıklama ve crash analizi için gereklidir.
- `.so` dosyalarını analiz etmek isteyen saldırganlara karşı, kod karıştırma ve native taraf için ProGuard/R8 gibi araçlarla ek obfuscation uygulayın.
- Android tarafında, `proguard-rules.pro` dosyasını özelleştirerek native kütüphanelerinizi de koruyabilirsiniz.

## 2. Şifreleme ve Güvenli Depolama

- **flutter_secure_storage** gibi paketlerle hassas verileri (token, şifre, kullanıcı bilgisi) şifrelenmiş olarak saklayın.
- Android'de veriler genellikle `SharedPreferences` veya dosya sistemi üzerinde saklanır. Bunlar root edilmiş cihazlarda kolayca okunabilir. Bu yüzden mutlaka şifreleme kullanın.
- iOS'ta Keychain kullanımı güvenlik için önemlidir.

```dart
final storage = new FlutterSecureStorage();
await storage.write(key: 'token', value: 'SECRET_TOKEN');
```

- Kendi şifreleme algoritmanızı yazmak yerine, güvenilir ve test edilmiş kütüphaneleri tercih edin (ör. `encrypt`, `pointycastle`).

## 3. Ağ Güvenliği

- Tüm ağ isteklerini HTTPS üzerinden yapın. HTTP üzerinden yapılan istekler, araya giren saldırganlar tarafından dinlenebilir.
- Sertifika pinning uygulayarak, uygulamanızın yalnızca belirli sunuculara bağlanmasını sağlayın. Bunun için `dio` ve `dio_http2_adapter` gibi paketler kullanılabilir.
- API anahtarlarını ve hassas endpoint bilgilerini uygulama içinde düz metin olarak saklamayın. Bunları mümkünse sunucu tarafında yönetin.
- Ağ trafiğini izlemek için güvenlik testleri (ör. Burp Suite, Charles Proxy) ile uygulamanızı test edin.

## 4. Platform Kanalı Güvenliği

- Flutter ile native kod arasında iletişim için MethodChannel ve EventChannel kullanılır. Bu kanallar üzerinden gönderilen verilerin tipini ve içeriğini mutlaka doğrulayın.
- Native tarafta, gelen veriler üzerinde ek güvenlik kontrolleri (ör. input validation, authentication) uygulayın.
- Özellikle root/jailbreak tespiti, emulator tespiti gibi kontrolleri native kodda yaparak uygulamanızın güvenliğini artırabilirsiniz.

## 5. Üçüncü Parti Paketler ve Bağımlılıklar

- Kullandığınız tüm paketlerin güncel ve güvenli olduğundan emin olun. Eski sürümlerde bilinen güvenlik açıkları olabilir.
- Paketlerin Pub.dev üzerindeki sürüm notlarını ve güvenlik uyarılarını düzenli olarak kontrol edin.
- Mümkünse, yalnızca güvenilir ve topluluk tarafından desteklenen paketleri tercih edin.
- Paketlerin native tarafında (ör. Android .so dosyaları, iOS frameworkleri) zararlı kod barındırmadığından emin olmak için analiz araçları kullanın.

## 6. Derleme Sonrası Dosyaların (APK, IPA, .so) Korunması

- APK veya IPA dosyanız dağıtıma çıkmadan önce, içeriğini analiz edin. `apktool`, `jadx`, `class-dump` gibi araçlarla uygulamanızın ne kadarının erişilebilir olduğunu test edin.
- Android'de, APK içindeki `.so` dosyalarını ve kaynakları şifrelemek için ek araçlar (ör. DexGuard, Allatori) kullanılabilir.
- iOS tarafında, uygulama binary'sini şifrelemek ve jailbreak tespiti yapmak için ek önlemler alın.

## 7. Güvenlik Testleri ve Sürekli İzleme

- Uygulamanızın güvenliğini düzenli olarak test edin. Mobil uygulama güvenlik testleri için OWASP MASVS ve MASTG rehberlerini inceleyin.
- Crash ve hata raporlarını toplarken, hassas verilerin loglanmadığından emin olun.
- Kullanıcıdan gelen verileri her zaman doğrulayın ve sunucu tarafında da güvenlik kontrolleri uygulayın.

## Sonuç

Flutter uygulamalarında güvenlik, sadece Dart kodunu değil, aynı zamanda native kütüphaneleri, derleme sonrası dosyaları ve üçüncü parti bağımlılıkları da kapsayan çok katmanlı bir süreçtir. Kod karıştırma, şifreleme, güvenli ağ iletişimi, platform kanalı güvenliği ve paket yönetimi ile uygulamanızı daha güvenli hale getirebilirsiniz. Ayrıca, derleme sonrası oluşan `.so` gibi dosyaların da analiz edilip korunması, uygulamanızın tersine mühendisliğe karşı dayanıklılığını artırır.

Unutmayın, güvenlik bir defaya mahsus bir işlem değil, sürekli bir süreçtir. Uygulamanızı düzenli olarak test edin, güncel tutun ve güvenlik rehberlerini takip edin.

---

*Bu yazı eğitim amaçlıdır. Flutter güvenlik rehberleri, OWASP MASVS/MASTG ve paket dokümantasyonlarını inceleyin.* 