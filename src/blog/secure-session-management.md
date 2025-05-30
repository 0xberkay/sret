# Android Uygulamalarında Güvenli Oturum Yönetimi

Mobil uygulamalarda güvenli oturum yönetimi, kullanıcı verilerinin korunması ve yetkisiz erişimlerin engellenmesi açısından kritik öneme sahiptir. Bu yazıda, Android uygulamalarında güvenli oturum yönetiminin nasıl sağlanacağını, token tabanlı kimlik doğrulama yöntemlerini ve oturum güvenliğiyle ilgili en iyi uygulamaları detaylıca ele alıyoruz.

## 1. Token Tabanlı Kimlik Doğrulama

- **JWT (JSON Web Token)**: Modern uygulamalarda sıkça kullanılan, içerisinde kullanıcı bilgilerini ve yetkilerini barındırabilen imzalı bir token yapısıdır.
- **OAuth 2.0 ve OpenID Connect**: Güvenli kimlik doğrulama ve yetkilendirme için standart protokollerdir.
- **Access Token ve Refresh Token**: Kısa ömürlü erişim token'ları ve uzun ömürlü yenileme token'ları kullanarak güvenliği artırabilirsiniz.

### Örnek: JWT Token Doğrulama

```java
private boolean validateJwtToken(String token) {
    try {
        Algorithm algorithm = Algorithm.HMAC256("secret");
        JWTVerifier verifier = JWT.require(algorithm)
            .withIssuer("auth0")
            .build();
        DecodedJWT jwt = verifier.verify(token);
        return true;
    } catch (JWTVerificationException exception) {
        // Token geçersiz
        return false;
    }
}
```

## 2. Token'ları Güvenli Şekilde Saklama

- Token'ları düz metin olarak saklamayın.
- **EncryptedSharedPreferences** veya **Android Keystore** kullanarak token'ları şifreli şekilde saklayın.
- Token'ları gereksiz yere uzun süre saklamaktan kaçının.

### Örnek: EncryptedSharedPreferences ile Token Saklama

```java
SharedPreferences sharedPreferences = EncryptedSharedPreferences.create(
    "auth_prefs",
    masterKeyAlias,
    context,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
);

// Token'ı kaydet
sharedPreferences.edit().putString("access_token", accessToken).apply();

// Token'ı oku
String token = sharedPreferences.getString("access_token", null);
```

## 3. Otomatik Oturum Kapatma ve Zaman Aşımı

- Belirli bir süre hareketsizlik sonrası otomatik oturum kapatma mekanizması uygulayın.
- Access token'lara kısa ömür (5-15 dakika) tanımlayın ve refresh token ile gerektiğinde yenileyin.
- Uygulama arka plana alındığında ekranı kilitlemeyi düşünün.

## 4. Oturum Sonlandırma ve Token İptali

- Kullanıcı çıkış yaptığında tüm token'ları güvenli şekilde silin.
- Sunucu tarafında da token'ları geçersiz kılın.
- Kullanıcının tüm cihazlardan çıkış yapabilmesi için bir mekanizma sağlayın.

### Örnek: Güvenli Oturum Kapatma

```java
private void logout() {
    // 1. Yerel token'ları sil
    SharedPreferences sharedPreferences = getEncryptedSharedPreferences();
    sharedPreferences.edit().remove("access_token").remove("refresh_token").apply();
    
    // 2. Sunucuya token iptal isteği gönder
    retrofitService.revokeToken(refreshToken)
        .enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                // Başarılı
            }
            
            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                // Hata durumunda bile yerel oturumu kapat
            }
        });
    
    // 3. Giriş ekranına yönlendir
    navigateToLogin();
}
```

## 5. Cihaz Güvenliğini Kontrol Etme

- Root edilmiş veya jailbreak'li cihazlarda ek güvenlik önlemleri alın.
- Cihazda ekran kilidi olup olmadığını kontrol edin.
- Güvenli olmayan cihazlarda hassas işlemlere sınırlama getirin.

## 6. Çok Faktörlü Kimlik Doğrulama (MFA)

- Hassas bilgiler içeren uygulamalarda MFA desteği sağlayın.
- SMS, e-posta veya kimlik doğrulayıcı uygulamalar aracılığıyla ikinci faktör doğrulaması ekleyin.
- Kullanıcıya MFA'nın faydaları hakkında bilgi verin.

## 7. HTTPS Kullanımı ve Sertifika Doğrulama

- Tüm kimlik doğrulama isteklerini HTTPS üzerinden yapın.
- Sertifika pinning uygulayarak MITM saldırılarını önleyin.
- Güvenli olmayan bağlantılarda kimlik bilgilerini göndermeyin.

## Sonuç

Android uygulamalarında güvenli oturum yönetimi, kapsamlı bir güvenlik stratejisinin temel parçasıdır. Token tabanlı kimlik doğrulama, güvenli token saklama, otomatik oturum kapatma, çok faktörlü kimlik doğrulama ve cihaz güvenliği kontrolü gibi önlemlerle uygulamanızın oturum güvenliğini önemli ölçüde artırabilirsiniz. Unutmayın, güvenlik bir süreçtir ve sürekli güncellenmelidir.

---

*Bu yazı, eğitim amaçlıdır. Uygulamalarınızda güvenlik önlemlerini uygularken güncel kaynakları ve resmi Android dokümantasyonunu takip etmeyi unutmayın.* 