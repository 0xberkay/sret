# Firebase Güvenliği: API Anahtarları ve En İyi Uygulamalar

Firebase, mobil ve web uygulamaları için güçlü bir backend hizmeti sunsa da, yanlış yapılandırıldığında ciddi güvenlik açıklarına neden olabilir. Bu yazıda, Firebase kullanırken API anahtarlarının nasıl korunacağını ve Firebase hizmetlerini kullanırken dikkat edilmesi gereken güvenlik önlemlerini detaylıca ele alıyoruz.

## 1. Firebase API Anahtarları ve Yapılandırma Dosyaları

- **google-services.json**: Android uygulamaları için Firebase yapılandırma dosyasıdır ve API anahtarları içerir.
- **GoogleService-Info.plist**: iOS uygulamaları için Firebase yapılandırma dosyasıdır.
- **Web API Anahtarı**: Web uygulamaları için Firebase'e erişim sağlayan anahtardır.

## 2. API Anahtarlarını Koruma Yöntemleri

- **İstemci Tarafında Güvenlik Sağlanamaz**: Firebase yapılandırma dosyaları uygulamanızla birlikte dağıtıldığı için, bu anahtarların tamamen güvende olması mümkün değildir.
- **Güvenlik Kuralları Kullanın**: Firebase hizmetlerinize erişimi kısıtlamak için Firebase Güvenlik Kuralları'nı yapılandırın.
- **API Anahtarı Kısıtlamaları**: Firebase Console üzerinden API anahtarlarınızın kullanım sınırlamalarını yapılandırın.

### Örnek: Firebase Realtime Database Güvenlik Kuralları

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "public_data": {
      ".read": true,
      ".write": false
    }
  }
}
```

## 3. Firebase Authentication Güvenliği

- Güçlü kimlik doğrulama yöntemlerini tercih edin (örn. Email/Şifre + SMS doğrulama, Google, Apple gibi sağlayıcılar).
- Şifre güvenlik politikalarını güçlendirin (minimum uzunluk, karmaşıklık).
- Kimlik doğrulama oturumlarını sınırlı süreli yapın ve gerektiğinde iptal edin.

## 4. Firebase Realtime Database ve Firestore Güvenliği

- Veri modelinizi güvenlik odaklı tasarlayın.
- Kullanıcıların yalnızca kendi verilerine erişebilmesini sağlayın.
- Veri doğrulama kurallarını uygulayın ve kötü niyetli girdileri reddedin.

### Örnek: Firestore Güvenlik Kuralları

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 5. Firebase Storage Güvenliği

- Dosya yükleme sınırlamaları ve doğrulamaları uygulayın.
- Depolama alanınıza erişimi kısıtlayın ve yalnızca yetkili kullanıcıların dosya yüklemesine izin verin.
- Yüklenen dosyaların tipini ve boyutunu kontrol edin.

## 6. Firebase Cloud Functions Güvenliği

- Cloud Functions'ı yetkilendirme ile koruyun.
- İstemci tarafından gelen tüm girdileri doğrulayın.
- Hassas işlemleri yalnızca sunucu tarafında gerçekleştirin.

## 7. Firebase Projelerinizi Düzenli Olarak Denetleyin

- Firebase kullanım istatistiklerini ve günlüklerini düzenli olarak kontrol edin.
- Şüpheli aktiviteleri izleyin ve gerektiğinde API anahtarlarını yenileyin.
- Firebase Güvenlik Kurallarınızı düzenli olarak gözden geçirin ve güncelleyin.

## Sonuç

Firebase, güçlü ve kullanımı kolay bir backend hizmeti sunsa da, güvenliği sağlamak tamamen geliştiricinin sorumluluğundadır. API anahtarlarının sınırlandırılması, güvenlik kurallarının doğru yapılandırılması ve düzenli güvenlik denetimleri ile Firebase projelerinizi kötü niyetli saldırılara karşı koruyabilirsiniz. Unutmayın, istemci tarafında tam güvenlik sağlanamaz, bu nedenle her zaman "güvenme, doğrula" prensibini uygulayın.

---

*Bu yazı, eğitim amaçlıdır. Uygulamalarınızda güvenlik önlemlerini uygularken güncel kaynakları ve resmi Firebase dokümantasyonunu takip etmeyi unutmayın.* 