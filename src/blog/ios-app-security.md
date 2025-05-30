# iOS Uygulamalarında Güvenlik Açıkları ve Önlemler

iOS ekosisteminde uygulama güvenliği, hem kullanıcı verilerinin korunması hem de uygulama bütünlüğünün sağlanması açısından kritiktir. Bu yazıda, iOS uygulamalarında sık karşılaşılan güvenlik açıklarını ve bunlara karşı alınabilecek önlemleri ele alıyoruz.

## 1. Kod İmzalama ve Uygulama Bütünlüğü

- Apple'ın **Code Signing** mekanizması, uygulamanın orijinal geliştiriciden geldiğini doğrular.
- Uygulamayı derlerken `CODE_SIGN_IDENTITY` ve `Provisioning Profile` ayarlarını doğru yapılandırın.
- App Store'a yüklemeden önce, manuel olarak **Payload** içindeki **embedded provisioning profile** ve **signature**'ı kontrol edin.

## 2. Hassas Verilerin Korunması

- **Keychain**: Kullanıcı adı, şifre, token gibi verileri saklamak için en güvenli yerdir.
- **UserDefaults** veya dosya sistemine düz metin kaydetmeyin.
- Gerektiğinde **CommonCrypto** veya üçüncü parti kütüphanelerle veritabanı/JSON şifreleme uygulayın.

### Örnek: Keychain'e Şifreli Veri Kaydetme

```swift
import Security

func saveToKeychain(key: String, data: Data) -> Bool {
    let query: [String: Any] = [
        kSecClass as String       : kSecClassGenericPassword,
        kSecAttrAccount as String : key,
        kSecValueData as String   : data
    ]
    SecItemDelete(query as CFDictionary)
    return SecItemAdd(query as CFDictionary, nil) == errSecSuccess
}
```

## 3. Ağ Güvenliği (ATS)

- iOS 9+ ile gelen **App Transport Security (ATS)** sayesinde yalnızca HTTPS çağrıları varsayılan olarak desteklenir.
- Gerektiğinde `Info.plist` içinde istisnalar yapmayın; sunucunuzun TLS 1.2+ sertifikalarını güncel tutun.

### Örnek: ATS Yapılandırması (`Info.plist`)

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>example.com</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
        </dict>
    </dict>
</dict>
```

## 4. Jailbreak Tespiti

- Jailbreak edilmiş cihazlarda sandbox atlatılabilir, Keychain verileri okunabilir.
- Yaygın kontrol yöntemleri:
  - `/Applications/Cydia.app` varlığı
  - `canOpenURL(URL(string: "cydia://")!)`
  - Sistem dosyalarına yazma testi

```swift
func isDeviceJailbroken() -> Bool {
    let paths = ["/Applications/Cydia.app", "/usr/sbin/sshd", "/etc/apt"]
    for path in paths {
        if FileManager.default.fileExists(atPath: path) {
            return true
        }
    }
    return false
}
```

## 5. Sembolleri ve Kaynak Kodunu Gizleme

- **Strip Symbols**: Release derlemesinde sembolleri kaldırın (`Strip Debug Symbols During Copy`).
- **Bitcode** kullanıyorsanız, Apple derleyici optimizasyonları ve kısmen obfuscation sağlar.
- Özelleştirilmiş Swift/Obj-C obfuscation araçlarını değerlendirin.

## 6. Kullanıcı İzinleri

- **Privacy Usage Description** anahtarlarını (`NSCameraUsageDescription`, vb.) eksiksiz yazın.
- Yalnızca gerçekten ihtiyaç duyulan izinleri isteyin, isteği kullanıcının ihtiyaç anına (runtime) ertileyin.

## Sonuç

iOS uygulama güvenliği, çok katmanlı bir yaklaşım gerektirir: kod imzalama, veri şifreleme, ağ güvenliği, jailbreak tespiti ve kodu karıştırma. Yukarıda önerilen yöntemleri uygulayarak, hem son kullanıcıyı hem de fikri mülkiyetinizi koruyabilirsiniz.

---

*Bu yazı eğitim amaçlıdır. iOS uygulama güvenliğini sağlarken Apple'ın resmi belgelerini ve güncel güvenlik rehberlerini takip etmeyi unutmayın.* 