# Android Uygulamalarında Kapsamlı ve Güvenli Oturum Yönetimi

Mobil uygulamalarda güvenli oturum yönetimi, kullanıcı verilerinin gizliliğini korumak, yetkisiz erişimleri engellemek ve genel uygulama güvenliğini sağlamak açısından hayati öneme sahiptir. Kötü yapılandırılmış bir oturum yönetimi, kimlik hırsızlığı, veri sızıntıları ve yetkisiz işlemler gibi ciddi güvenlik açıklarına yol açabilir. Bu yazıda, Android uygulamalarında güvenli oturum yönetiminin nasıl sağlanacağını, modern kimlik doğrulama yöntemlerini, token yönetim stratejilerini ve oturum güvenliğiyle ilgili en iyi uygulamaları derinlemesine ele alıyoruz.

## 1. Token Tabanlı Kimlik Doğrulama: Temel Taşlar

Token tabanlı kimlik doğrulama, durum bilgisi tutmayan (stateless) API'ler ve mikroservis mimarileri için idealdir. Sunucu, her istekte kullanıcının kimliğini yeniden doğrulamak yerine, istemciden gelen geçerli bir token'a güvenir.

- **JWT (JSON Web Token)**: En yaygın kullanılan token formatlarından biridir. Kompakt, kendi kendine yeten (self-contained) bir yapıda olup, içerisinde kullanıcı kimliği, yetkiler ve token geçerlilik süresi gibi bilgileri (claims) barındırabilir. JWT'ler dijital olarak imzalanır (HMAC veya RSA/ECDSA ile) ve isteğe bağlı olarak şifrelenebilir.
    - **Yapısı:** Header (algoritma bilgisi), Payload (claims), Signature (doğrulama).
    - **Önemli Güvenlik Noktaları:**
        - İmza algoritması olarak güçlü bir algoritma seçin (`HS256` yerine `HS512` veya `RS256/ES256` gibi asimetrik algoritmalar).
        - `alg: none` güvenlik açığına karşı sunucu tarafında algoritma kontrolü yapın.
        - Hassas verileri payload içinde şifrelenmemiş olarak saklamayın.
        - Token geçerlilik sürelerini (expiration time - `exp`) kısa tutun.
- **Opaque Token (Referans Token)**: JWT'nin aksine, token içeriği anlamsız bir karakter dizisidir. Token'ın kendisi herhangi bir bilgi taşımaz; bunun yerine sunucu tarafındaki bir veritabanında gerçek kullanıcı oturum bilgileriyle eşleştirilir.
    - **Avantajları:** Token çalınması durumunda sunucudan anında iptal edilebilir. Token içeriği ifşa olmaz.
    - **Dezavantajları:** Her token doğrulaması için veritabanı sorgusu gerekir, bu da performansı etkileyebilir.
- **OAuth 2.0 ve OpenID Connect (OIDC)**:
    - **OAuth 2.0**: Yetkilendirme (authorization) için bir framework'tür. Kullanıcıların, şifrelerini paylaşmadan üçüncü parti uygulamalara kendi hesaplarındaki belirli kaynaklara erişim izni vermesini sağlar. `Access Token` ve `Refresh Token` kavramlarını tanımlar.
    - **OpenID Connect**: OAuth 2.0 üzerine inşa edilmiş bir kimlik doğrulama (authentication) katmanıdır. Kullanıcıların kimliklerini doğrulamak için kullanılır ve JWT formatında bir `ID Token` döndürür.
- **Access Token ve Refresh Token Stratejisi**:
    - **Access Token**: Kısa ömürlüdür (örn. 5-60 dakika). API kaynaklarına erişim için kullanılır. Çalınması durumunda risk süresini sınırlar.
    - **Refresh Token**: Uzun ömürlüdür (örn. günler, haftalar, aylar). Yeni bir Access Token almak için kullanılır. Güvenli bir şekilde saklanmalı ve yalnızca token endpoint'ine gönderilmelidir. Refresh token'ların da çalınmaya karşı periyodik olarak döndürülmesi (rotation) veya tek kullanımlık olması (one-time use) güvenliği artırır.

### Örnek: Güçlü JWT Token Doğrulama (Java/Android)

```java
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.security.interfaces.RSAPublicKey; // Asimetrik anahtar için

// ... (RSAPublicKey publicKey objesini güvenli bir şekilde yükleyin)

private boolean validateJwtToken(String token, RSAPublicKey publicKey) {
    try {
        // Asimetrik anahtar kullanılıyorsa (örn: RS256)
        Algorithm algorithm = Algorithm.RSA256(publicKey, null); 
        JWTVerifier verifier = JWT.require(algorithm)
            .withIssuer("https://yourdomain.com") // Beklenen issuer
            .withAudience("your-app-identifier") // Beklenen audience
            // .withSubject("expected-user-id") // Gerekirse subject kontrolü
            .acceptLeeway(3) // Saat senkronizasyon sorunları için küçük bir tolerans (saniye)
            .build();
        DecodedJWT jwt = verifier.verify(token);
        // Ekstra kontroller: Örneğin, token'ın kara listede olup olmadığını kontrol et
        return !isTokenRevoked(jwt.getId()); 
    } catch (JWTVerificationException exception) {
        // Token geçersiz veya doğrulanamadı
        Log.e("JWTAuth", "Token validation failed: " + exception.getMessage());
        return false;
    } catch (Exception e) {
        // Diğer beklenmedik hatalar
        Log.e("JWTAuth", "Unexpected error during token validation: " + e.getMessage());
        return false;
    }
}

private boolean isTokenRevoked(String tokenId) {
    // Sunucu tarafında veya yerel bir cache'de iptal edilmiş token'ları kontrol et
    // Bu örnekte basit bir liste kullanılıyor, gerçek uygulamada daha güvenli bir mekanizma gerekir.
    // Set<String> revokedTokenIds = getRevokedTokenIdsFromServer();
    // return revokedTokenIds.contains(tokenId);
    return false; // Gerçek implementasyon gereklidir
}
```

## 2. Token'ları Android'de Güvenli Şekilde Saklama

Token'lar, yetkisiz erişimi engellemek için Android cihazlarda en güvenli şekilde saklanmalıdır.

- **Android Keystore Sistemi**: Kriptografik anahtarları donanım destekli güvenli bir depoda (Hardware Security Module - HSM veya Trusted Execution Environment - TEE) saklamak için kullanılır. API 23 (Marshmallow) ve üzeri sürümlerde donanım destekli saklama standartlaşmıştır.
    - Anahtarlar uygulama dışına çıkarılamaz.
    - Biyometrik kimlik doğrulama (parmak izi, yüz tanıma) ile anahtar erişimini şart koşabilirsiniz.
- **EncryptedSharedPreferences**: Hassas verileri (token'lar dahil) şifrelenmiş olarak `SharedPreferences` içinde saklamak için Android Jetpack Security kütüphanesinin bir parçasıdır. Arka planda Android Keystore'u kullanarak anahtar yönetimini ve şifrelemeyi basitleştirir.
    - **Kullanımı**: `MasterKeys` sınıfı ile bir ana anahtar oluşturulur ve bu anahtar `EncryptedSharedPreferences`'ı başlatmak için kullanılır.
- **Kaçınılması Gerekenler**:
    - Token'ları `SharedPreferences`'a **doğrudan (şifresiz)** kaydetmek.
    - Token'ları SQLite veritabanında **şifresiz** saklamak.
    - Token'ları cihazın dosya sisteminde **şifresiz** metin dosyalarında tutmak.
    - Token'ları loglara yazdırmak.
- **Bellekte (In-Memory) Saklama**: Token'lar sadece kullanıldıkları süre boyunca bellekte tutulmalı ve işleri bittiğinde temizlenmelidir. Değişkenlerin `final` olmamasına ve referanslarının null yapılarak Garbage Collector tarafından temizlenmesine yardımcı olunabilir. Ancak bu, root edilmiş cihazlarda bellek dökümü (memory dump) analizine karşı tam koruma sağlamaz.

### Örnek: EncryptedSharedPreferences ile Güvenli Token Saklama

```java
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKeys;
import android.content.Context;
import android.content.SharedPreferences;
import java.io.IOException;
import java.security.GeneralSecurityException;

// ...

private SharedPreferences getEncryptedPrefs(Context context) throws GeneralSecurityException, IOException {
    String masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC);

    return EncryptedSharedPreferences.create(
        context,
        "secure_auth_prefs", // Dosya adı
        masterKeyAlias,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    );
}

public void saveTokens(Context context, String accessToken, String refreshToken) {
    try {
        SharedPreferences sharedPreferences = getEncryptedPrefs(context);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("access_token", accessToken);
        editor.putString("refresh_token", refreshToken);
        editor.apply();
    } catch (GeneralSecurityException | IOException e) {
        Log.e("TokenStorage", "Failed to save tokens securely", e);
        // Hata yönetimi: Örneğin, kullanıcıya bilgi verilebilir veya oturum sonlandırılabilir.
    }
}

public String getAccessToken(Context context) {
    try {
        SharedPreferences sharedPreferences = getEncryptedPrefs(context);
        return sharedPreferences.getString("access_token", null);
    } catch (GeneralSecurityException | IOException e) {
        Log.e("TokenStorage", "Failed to retrieve access token", e);
        return null;
    }
}

// refreshToken için benzer bir get metodu
```

## 3. Otomatik Oturum Kapatma ve Akıllı Zaman Aşımları

Kullanıcı etkinliğini izleyerek ve uygun zaman aşımları ayarlayarak unutulmuş veya terk edilmiş oturumların riskini azaltın.

- **Idle Timeout (Boşta Kalma Zaman Aşımı)**: Kullanıcı belirli bir süre (örn. 5-15 dakika) uygulama içinde herhangi bir etkileşimde bulunmazsa oturum otomatik olarak sonlandırılır veya uygulama kilitlenir (örn. PIN/biyometrik doğrulama gerektirir).
- **Absolute Timeout (Mutlak Zaman Aşımı)**: Oturumun toplam süresini sınırlar (örn. 8-24 saat), kullanıcı aktif olsa bile bu süre sonunda yeniden kimlik doğrulaması gerekir.
- **Dinamik Zaman Aşımları**: Hassas işlemlerde (örn. ödeme, profil güncelleme) daha kısa zaman aşımları uygulanabilir.
- **Uygulama Arka Plana Alındığında/Kapatıldığında**:
    - Uygulama arka plana alındığında ( `onPause()`, `onStop()` ) hassas verilerin ekrandan temizlenmesi veya bir "gizlilik ekranı" gösterilmesi.
    - Belirli bir süre sonra (veya hemen) oturumun sonlandırılması veya yeniden kimlik doğrulama istenmesi.
    - `ActivityLifecycleCallbacks` ile uygulama genelinde oturum yönetimi merkezi olarak yapılabilir.

## 4. Güvenli Oturum Sonlandırma ve Kapsamlı Token İptali

Kullanıcı bilinçli olarak çıkış yaptığında veya şüpheli bir durumda oturumun güvenli bir şekilde sonlandırılması gerekir.

- **İstemci Tarafında Token Silme**:
    - `EncryptedSharedPreferences`'tan access ve refresh token'ları silin.
    - Bellekteki token kopyalarını temizleyin.
- **Sunucu Tarafında Token İptali (Revocation)**: Bu, özellikle token'ların çalınması durumunda kritik öneme sahiptir.
    - **Access Token İptali**: Kısa ömürlü oldukları için genellikle sunucu tarafında aktif iptal edilmezler, ancak gerekirse token ID'lerini bir kara listeye (blacklist) ekleyerek yapılabilir.
    - **Refresh Token İptali**: Kullanıcı çıkış yaptığında veya şüpheli bir aktivite tespit edildiğinde refresh token sunucu tarafında mutlaka iptal edilmelidir. Bu, çalınan bir refresh token ile yeni access token'lar üretilmesini engeller.
    - **Tüm Oturumları Sonlandırma ("Revoke All Sessions")**: Kullanıcının, hesabına bağlı tüm aktif oturumları (farklı cihazlardaki) tek bir yerden sonlandırabilmesi için bir mekanizma sunulmalıdır. Bu, genellikle kullanıcının şifresini değiştirdiğinde veya hesabının ele geçirildiğini düşündüğünde kullanılır. Sunucu, kullanıcıya ait tüm refresh token'ları veya oturum tanımlayıcılarını geçersiz kılar.

### Örnek: Kapsamlı Oturum Kapatma (Java/Android)

```java
// (Retrofit veya benzeri bir ağ kütüphanesi kullandığınızı varsayalım)
// public interface AuthService {
//     @POST("auth/revoke")
//     Call<Void> revokeToken(@Body RevokeRequest body); 
//     // RevokeRequest: Hangi token'ın (örn. refresh_token) iptal edileceğini içerir.
// }

private void secureLogout(Context context) {
    // 1. Yerel token'ları güvenli bir şekilde sil
    try {
        SharedPreferences sharedPreferences = getEncryptedPrefs(context);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.remove("access_token");
        editor.remove("refresh_token");
        editor.apply();
    } catch (GeneralSecurityException | IOException e) {
        Log.e("Logout", "Failed to delete local tokens", e);
    }
    
    // Bellekteki token'ları da temizle (varsa)
    // currentAccessToken = null;
    // currentRefreshToken = null;

    // 2. Sunucuya token iptal isteği gönder (Refresh token'ı iptal et)
    String refreshToken = getRefreshTokenFromStorage(); // Önceki saklama yerinden al
    if (refreshToken != null) {
        // authService.revokeToken(new RevokeRequest(refreshToken))
        //     .enqueue(new Callback<Void>() { ... });
        // ÖNEMLİ: Bu isteğin başarılı olup olmamasından bağımsız olarak istemci tarafı oturumu kapatılmalıdır.
    }

    // 3. Kullanıcı arayüzünü güncelle, giriş ekranına yönlendir
    // clearApplicationData(); // Uygulama verilerini temizlemeyi düşünün (opsiyonel)
    // navigateToLoginScreen();
    
    // 4. Varsa, biyometrik kimlik doğrulama ile ilişkili anahtarları sıfırla/temizle
}
```

## 5. Cihaz Güvenliği Durumunu Değerlendirme

Uygulamanızın çalıştığı cihazın güvenlik durumunu değerlendirmek, ek riskleri azaltmaya yardımcı olabilir.

- **Root/Jailbreak Tespiti**: Root edilmiş (Android) veya jailbreak yapılmış (iOS) cihazlar, normal güvenlik mekanizmalarının devre dışı bırakıldığı ve uygulamaların daha savunmasız olduğu ortamlardır.
    - %100 güvenilir tespit mümkün olmasa da, çeşitli kontroller (dosya sistemi kontrolleri, bilinen root uygulamalarının varlığı vb.) yapılabilir.
    - Tespit durumunda: Kullanıcıyı bilgilendirebilir, uygulamanın bazı hassas özelliklerini kısıtlayabilir veya uygulamayı tamamen engelleyebilirsiniz.
- **SafetyNet Attestation API / Play Integrity API (Android)**:
    - Google tarafından sunulan bu API'ler, cihazın orijinalliğini, yazılım bütünlüğünü ve zararlı uygulamaların varlığını değerlendirmenize olanak tanır.
    - Sunucu tarafında bu API'lerden gelen yanıtı doğrulamak önemlidir.
    - Sonuçlara göre oturum açmaya izin verebilir, ek güvenlik adımları isteyebilir veya erişimi kısıtlayabilirsiniz.
- **Emulator Tespiti**: Uygulamanızın bir emülatörde mi yoksa gerçek bir cihazda mı çalıştığını tespit etmeye çalışabilirsiniz. Emülatörler, tersine mühendislik ve saldırı denemeleri için kullanılabilir.
- **Debugger Tespiti**: Bir debugger'ın uygulamaya bağlı olup olmadığını kontrol etmek, tersine mühendislik çabalarını zorlaştırabilir.
- **Ekran Kilidi Kontrolü**: Cihazda bir ekran kilidi (PIN, desen, şifre, biyometrik) olup olmadığını kontrol ederek, fiziksel erişime karşı bir miktar koruma sağlayabilirsiniz. `KeyguardManager.isDeviceSecure()` kullanılabilir.

## 6. Çok Faktörlü Kimlik Doğrulama (MFA) ile Güvenliği Katmanlandırma

MFA, yalnızca şifreye dayalı kimlik doğrulamanın ötesine geçerek ek bir güvenlik katmanı ekler. Kullanıcının bildiği bir şey (şifre), sahip olduğu bir şey (telefon, donanım token) veya olduğu bir şey (biyometrik veri) kombinasyonunu gerektirir.

- **MFA Yöntemleri**:
    - **SMS/E-posta ile Tek Kullanımlık Kodlar (OTP)**: Yaygın ama en güvenli yöntem değildir (SIM swapping, e-posta ele geçirme riskleri).
    - **Kimlik Doğrulayıcı Uygulamalar (TOTP/HOTP)**: Google Authenticator, Authy gibi uygulamalar zaman tabanlı (TOTP) veya sayaç tabanlı (HOTP) tek kullanımlık şifreler üretir. Daha güvenlidir.
    - **Push Bildirimleri**: Kullanıcının kayıtlı cihazına "Girişi Onayla/Reddet" şeklinde bir bildirim gönderilir. Kullanıcı dostudur.
    - **Donanım Token'ları (U2F/FIDO2)**: YubiKey gibi fiziksel USB/NFC/Bluetooth token'ları, en yüksek güvenlik seviyelerinden birini sunar.
    - **Biyometrik Doğrulama**: Parmak izi, yüz tanıma gibi biyometrik veriler, MFA'nın bir parçası olarak veya cihaz kilidini açmada kullanılabilir.
- **MFA Entegrasyonu**:
    - Kullanıcılar için MFA'yı etkinleştirme ve yönetme seçenekleri sunun.
    - Kurtarma kodları (recovery codes) sağlayın ve kullanıcıların bunları güvenli bir yerde saklamasını önerin.
    - MFA'nın başarısız olduğu durumlarda (örn. cihaz kaybı) hesap kurtarma süreçlerini dikkatlice planlayın.

## 7. HTTPS Her Zaman ve Her Yerde: İletişim Güvenliği

Tüm kimlik doğrulama ve oturumla ilgili iletişimler şifrelenmiş kanallar üzerinden yapılmalıdır.

- **TLS (Transport Layer Security)**: HTTP yerine HTTPS (TLS üzerinden HTTP) kullanın. TLS 1.2 veya tercihen TLS 1.3 kullanın. Eski SSL/TLS sürümleri güvensizdir.
- **Sertifika Pinning (Certificate Pinning / Public Key Pinning)**: Man-in-the-Middle (MitM) saldırılarına karşı ek bir koruma katmanıdır. Uygulamanızın yalnızca belirli sunucu sertifikalarına (veya bu sertifikaların public key'lerine) güvenmesini sağlar.
    - **Android Network Security Configuration**: API 24+ için sertifika pinning'i XML tabanlı bir yapılandırma dosyasıyla kolayca tanımlamanızı sağlar. (`res/xml/network_security_config.xml`)
    - **TrustManager ile Özel Implementasyon**: Daha düşük API seviyeleri veya daha karmaşık senaryolar için özel `TrustManager` implementasyonları gerekebilir. (Dikkatli olunmalı, yanlış implementasyonlar güvenlik açığı yaratabilir.)
    - **Kütüphaneler**: OkHttp gibi popüler ağ kütüphaneleri sertifika pinning için yerleşik destek sunar.
- **HSTS (HTTP Strict Transport Security)**: Sunucu tarafında ayarlanarak tarayıcıların (veya uygulamaların) siteye yalnızca HTTPS ile bağlanmasını zorunlu kılar. Mobil uygulamalarda, Network Security Configuration ile benzer bir etki sağlanabilir.

## 8. Oturum Sabitleme (Session Fixation) Saldırıları ve Korunma

Session fixation, bir saldırganın bir kullanıcı için geçerli bir oturum kimliği belirleyip, kullanıcıyı bu oturum kimliği ile kimlik doğrulamaya ikna ettiği bir saldırı türüdür. Kullanıcı kimlik doğruladığında, saldırgan da aynı oturum kimliğini kullanarak yetkili erişim elde eder.

- **Korunma Yöntemleri**:
    - **Kimlik Doğrulamadan Sonra Oturum Kimliğini Yenileme**: Kullanıcı başarılı bir şekilde giriş yaptığında, mevcut oturum kimliğini geçersiz kılın ve tamamen yeni bir oturum kimliği oluşturun. Bu, en etkili yöntemdir.
    - Token tabanlı sistemlerde, girişten sonra yeni bir access ve refresh token çifti üretmek bu prensibe uyar.
    - Sunucu tarafında, eski oturumla ilişkili tüm verilerin yeni oturuma güvenli bir şekilde aktarıldığından emin olun.

## 9. Biyometrik Kimlik Doğrulama ile Oturum Güvenliği

Android'in `BiometricPrompt` API'si, parmak izi, yüz veya iris tanıma gibi biyometrik yöntemlerle kullanıcı kimliğini doğrulamak için standart ve güvenli bir yol sunar.

- **Kullanım Alanları**:
    - Uygulama kilidini açma.
    - Oturum zaman aşımından sonra yeniden kimlik doğrulama.
    - Hassas işlemleri (örn. ödeme onayı, ayar değişikliği) onaylama.
    - Android Keystore'daki anahtarlara erişimi koruma.
- **Güvenlik Hususları**:
    - Biyometrik veriler cihazda güvenli bir şekilde saklanır ve uygulamaların doğrudan erişimi yoktur. `BiometricPrompt` sadece başarılı/başarısız sonucunu döndürür.
    - Kullanıcıya biyometriyi ayarlama ve iptal etme seçeneği sunun.
    - Biyometrik doğrulama başarısız olursa veya mevcut değilse, bir geri düşme (fallback) mekanizması (örn. PIN, şifre) sağlayın.

## 10. Oturum Verilerinin Güvenliği

Oturum sırasında kullanılan (kullanıcı tercihleri, geçici ayarlar, alışveriş sepeti gibi) verilerin de güvenliğine dikkat edilmelidir.

- Hassas oturum verilerini mümkün olduğunca sunucu tarafında tutun.
- İstemci tarafında saklanması gerekiyorsa, `EncryptedSharedPreferences` gibi güvenli depolama yöntemleri kullanın.
- Oturum sonlandığında bu verileri güvenli bir şekilde temizleyin.

## 11. API Güvenliği ile Entegrasyon

Mobil uygulama oturum yönetimi, backend API güvenliği ile sıkı bir şekilde entegre olmalıdır.

- **API Gateway**: Oturum token'larının doğrulanması, rate limiting, loglama gibi görevleri API Gateway'e devredebilirsiniz.
- **Yetkilendirme**: API endpoint'leri, gelen token'daki yetkileri (scopes, roles) kontrol ederek doğru yetkilendirme yapmalıdır.
- **Token Geçerliliği**: API'ler, token'ın geçerlilik süresini ve iptal durumunu her istekte kontrol etmelidir.

## Sonuç: Sürekli Bir Güvenlik Yatırımı

Android uygulamalarında güvenli oturum yönetimi, tek seferlik bir görev değil, sürekli dikkat ve güncelleme gerektiren dinamik bir süreçtir. Bu yazıda ele alınan token tabanlı kimlik doğrulama, token'ların güvenli saklanması, otomatik oturum kapatma, kapsamlı token iptali, cihaz güvenliği kontrolleri, çok faktörlü kimlik doğrulama, HTTPS kullanımı, oturum sabitleme önlemleri ve biyometrik entegrasyon gibi prensipler, uygulamanızın oturum güvenliğini önemli ölçüde artıracaktır.

Güvenlik en iyi uygulamalarını takip etmek, güncel tehditler hakkında bilgi sahibi olmak ve düzenli güvenlik testleri yapmak, kullanıcılarınızın verilerini ve uygulamanızın bütünlüğünü korumanın anahtarıdır. Unutmayın, güvenlik zincirinin en zayıf halkası kadar güçlüdür.

---

*Bu yazı, Android uygulamalarında güvenli oturum yönetimi konusunda kapsamlı bir rehber sunmak amacıyla eğitim amaçlı hazırlanmıştır. Uygulamalarınızda güvenlik önlemlerini uygularken her zaman güncel Android resmi dokümantasyonunu, OWASP Mobil Güvenlik Test Rehberi (MASTG) gibi standartları ve sektördeki en iyi uygulamaları takip etmeyi unutmayın.* 