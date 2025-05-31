# Android Uygulamalarında En Sık Görülen Güvenlik Hataları, Riskleri ve Kapsamlı Önlemleri

Android uygulama geliştirme sürecinde, farkında olmadan yapılan bazı yaygın güvenlik hataları, uygulamanızı ve kullanıcı verilerini ciddi risklere maruz bırakabilir. Bu hatalar, veri sızıntılarından yetkisiz erişime, kimlik hırsızlığından uygulamanın tamamen ele geçirilmesine kadar varan sonuçlara yol açabilir. Bu kapsamlı yazıda, Android platformunda en sık karşılaşılan güvenlik hatalarını, bu hataların potansiyel etkilerini ve bunları önlemek için alınması gereken detaylı tedbirleri inceliyoruz.

## 1. Hassas Verilerin Güvensiz Saklanması

### Hata:
- Şifreler, API anahtarları, kullanıcı token'ları, kişisel tanımlayıcı bilgiler (PII) gibi hassas verilerin `SharedPreferences`, SQLite veritabanları, cihaz dosya sistemi (internal/external storage) veya hatta log dosyalarında **şifrelenmemiş (düz metin)** olarak saklanması.
- Hassas verilerin bellekte (in-memory) gereksiz yere uzun süre tutulması ve güvenli bir şekilde temizlenmemesi.

### Riskler:
- Cihaza fiziksel veya root erişimi olan bir saldırganın bu verilere kolayca ulaşabilmesi.
- Diğer uygulamaların (özellikle kötü amaçlı yazılımların) bu verilere erişmeye çalışması.
- Bellek dökümü (memory dump) analizi ile hassas verilerin elde edilmesi.

### Önlem ve En İyi Uygulamalar:
- **EncryptedSharedPreferences**: Android Jetpack Security kütüphanesinin bir parçasıdır. `SharedPreferences` için anahtar ve değerleri şifreleyerek güvenli bir alternatif sunar. Arka planda Android Keystore'u kullanır.
- **Android Keystore Sistemi**: Kriptografik anahtarları donanım destekli güvenli bir alanda (TEE/HSM) saklamak için kullanılır. Anahtarlar uygulama dışına çıkarılamaz ve biyometrik kimlik doğrulama ile erişim şart koşulabilir.
- **SQLCipher veya Benzeri Kütüphaneler**: SQLite veritabanlarını tam disk şifrelemesi ile korumak için kullanılır.
- **Bellek Yönetimi**: Hassas veriler bellekte tutulacaksa, `char[]` veya `byte[]` gibi değiştirilebilir dizilerde tutulmalı ve işleri bittiğinde manuel olarak sıfırlanmalıdır (içeriklerinin üzerine yazılmalıdır). `String` objeleri immutable (değiştirilemez) olduğu için bellekten ne zaman temizlenecekleri Garbage Collector'a bağlıdır ve bu risk oluşturabilir.
- **Klavye Önbelleği**: Hassas bilgi giriş alanlarında (`EditText`), klavye önbelleğinin bu bilgileri saklamasını engellemek için `android:inputType="textNoSuggestions|textVisiblePassword"` gibi flag'ler kullanılabilir.
- **Disk üzerinde saklamak zorunda olmadığınız hassas verileri KESİNLİKLE saklamayın.**

### Örnek: Güvenli Veri Saklama Yaklaşımı

```java
// Hatalı yaklaşım (Düz SharedPreferences)
// SharedPreferences prefs = context.getSharedPreferences("app_prefs", MODE_PRIVATE);
// prefs.edit().putString("api_key", "düz_metin_api_anahtarı").apply();

// Doğru yaklaşım (EncryptedSharedPreferences)
try {
    String masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC);
    SharedPreferences encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "secure_app_prefs",
        masterKeyAlias,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    );
    encryptedPrefs.edit().putString("api_key", "çok_gizli_api_anahtarı").apply();
} catch (GeneralSecurityException | IOException e) {
    // Hata yönetimi
    Log.e("SecureStorage", "Failed to use EncryptedSharedPreferences", e);
}
```

## 2. Güvensiz Ağ İletişimi ve Sertifika Yönetimi Zafiyetleri

### Hata:
- Hassas verilerin (kullanıcı adı, şifre, token, kişisel bilgiler) HTTP üzerinden, yani şifrelenmemiş olarak gönderilmesi.
- SSL/TLS sertifikalarının hiç doğrulanmaması veya zayıf bir şekilde doğrulanması (örn. tüm sertifikalara güvenen özel `TrustManager` implementasyonları).
- Sertifika pinning (certificate pinning veya public key pinning) uygulanmaması veya yanlış uygulanması.
- Zayıf TLS yapılandırmaları kullanılması (eski TLS/SSL protokolleri, güvensiz şifreleme takımları - cipher suites).

### Riskler:
- Ortadaki Adam (Man-in-the-Middle - MitM) saldırıları ile ağ trafiğinin dinlenmesi, değiştirilmesi veya sahte sunuculara yönlendirilmesi.
- Veri sızıntıları ve oturum ele geçirme.

### Önlem ve En İyi Uygulamalar:
- **Her Zaman HTTPS (TLS üzerinden HTTP)**: Tüm ağ iletişimleri için TLS 1.2 veya tercihen TLS 1.3 kullanılmalıdır.
- **Network Security Configuration (Ağ Güvenliği Yapılandırması)**: Android 7.0 (API 24) ve üzeri için, `res/xml/network_security_config.xml` dosyası ile uygulamanızın ağ güvenliği politikalarını (cleartext trafiğe izin verilip verilmeyeceği, güvenilen CA'lar, sertifika pinning ayarları) merkezi olarak tanımlayın.
    - `cleartextTrafficPermitted="false"` ayarını varsayılan olarak kullanın.
- **Sertifika Pinning**: Uygulamanızın yalnızca belirli sunucu sertifikalarına veya bu sertifikaların public key'lerine güvenmesini sağlayarak MitM saldırılarını büyük ölçüde engeller.
- **Güçlü TLS Yapılandırması**: Sunucu tarafında ve mümkünse istemci tarafında (OkHttp gibi kütüphanelerle) güçlü şifreleme takımları ve güncel TLS protokolleri zorunlu kılınmalıdır.
- **DNS Güvenliği**: Mümkünse DNS over HTTPS (DoH) veya DNS over TLS (DoT) gibi güvenli DNS çözümleme yöntemlerini destekleyen kütüphaneler veya işletim sistemi özellikleri kullanılabilir.

### Örnek: Network Security Configuration ile Pinning

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" /> <!-- Sistem CA'larına güven -->
            <certificates src="user" />   <!-- Kullanıcı tarafından eklenen CA'lara güven (opsiyonel, dikkatli kullanılmalı) -->
        </trust-anchors>
    </base-config>
    <domain-config>
        <domain includeSubdomains="true">api.example.com</domain>
        <!-- Birden fazla pin ekleyerek yedeklilik sağlanabilir -->
        <pin-set expiration="2025-01-01">
            <pin digest="SHA-256">7HIpactkIAq2Y49orFOOQKurWxmmSFZhBCoQYcRhJ3Y=</pin> 
            <pin digest="SHA-256">fwza0LRMXouZHRC8Ei+4PyuldPDcf3UKgO/04cDM1oE=</pin> <!-- Backup pin -->
        </pin-set>
        <!-- <trustkit-config enforcePinning="true"/> Eğer TrustKit gibi bir kütüphane kullanılıyorsa -->
    </domain-config>
</network-security-config>
```
Uygulamanızın `AndroidManifest.xml` dosyasında bu yapılandırmayı belirtmeyi unutmayın: `android:networkSecurityConfig="@xml/network_security_config"`.

## 3. Yetersiz Giriş Doğrulama ve Sanitizasyon (Input Validation)

### Hata:
- Kullanıcıdan, diğer uygulamalardan (Intent'ler aracılığıyla) veya ağdan gelen girdilerin doğrulanmadan, filtrelenmeden veya sanitize edilmeden doğrudan kullanılması.
- Sadece istemci tarafında (mobil uygulamada) doğrulama yapılıp, sunucu tarafı doğrulamanın ihmal edilmesi.

### Riskler:
- **SQL Injection (SQLi)**: Veritabanı sorgularına zararlı SQL kodları enjekte edilmesi.
- **Cross-Site Scripting (XSS)**: Özellikle WebView'lar aracılığıyla zararlı JavaScript kodlarının çalıştırılması.
- **Command Injection**: Sunucu veya istemci tarafında işletim sistemi komutlarının çalıştırılması.
- **XML External Entity (XXE) Injection**: XML ayrıştırıcılarının zafiyetlerinden faydalanılması.
- **Path Traversal**: Dosya sistemi üzerinde yetkisiz erişim.
- Uygulama çökmesi, beklenmedik davranışlar, veri bozulması.

### Önlem ve En İyi Uygulamalar:
- **Sunucu Tarafı Doğrulama ESASDIR**: İstemci tarafı doğrulama kullanıcı deneyimi için iyidir ancak kolayca atlatılabilir. Tüm kritik doğrulamalar sunucu tarafında yapılmalıdır.
- **İstemci Tarafı Doğrulama**: Kullanıcıya anında geri bildirim sağlamak ve sunucu yükünü azaltmak için yapılmalıdır, ancak tek başına yeterli değildir.
- **Beyaz Liste (Whitelist) Yaklaşımı**: Kabul edilebilir karakterler, formatlar ve değerler tanımlanmalı, bunun dışındaki her şey reddedilmelidir.
- **Tür, Uzunluk, Format ve Aralık Kontrolü**: Gelen verinin beklenen veri tipinde (sayı, string, boolean), maksimum/minimum uzunlukta, doğru formatta (e-posta, tarih) ve geçerli bir aralıkta olup olmadığını kontrol edin.
- **Parametreli Sorgular (Prepared Statements)**: SQL injection'ı önlemek için en etkili yoldur. Kullanıcı girdileri SQL sorgusuna doğrudan birleştirilmemelidir.
- **Çıktı Kodlama (Output Encoding)**: Kullanıcı girdileri bir HTML (WebView), XML veya başka bir formatta görüntülenecekse, özel karakterlerin doğru şekilde kodlanması (örn. `<`, `>`, `&` karakterlerinin `&lt;`, `&gt;`, `&amp;` olarak) XSS'i önler.
- **WebView Güvenliği**: `WebView.evaluateJavascript()` veya `addJavascriptInterface` kullanırken dikkatli olun. Kullanıcı girdilerini JavaScript'e göndermeden önce sanitize edin.

## 4. Yetersiz veya Yanlış Kod Karıştırma (Obfuscation) ve Tersine Mühendislik Koruması

### Hata:
- ProGuard, R8 (Android için varsayılan) gibi kod karıştırma ve küçültme (minification) araçlarının hiç kullanılmaması.
- Bu araçların varsayılan ayarlarla kullanılıp, uygulamanın kritik bölümleri için özel koruma kurallarının eklenmemesi.
- String şifreleme, sınıf şifreleme gibi daha ileri düzey korumaların ihmal edilmesi.

### Riskler:
- Uygulama APK'sının kolayca decompile edilerek (örn. `jadx`, `apktool` ile) kaynak kodunun büyük ölçüde okunabilir hale gelmesi.
- API anahtarları, algoritma mantığı, güvenlik kontrolleri gibi hassas bilgilerin ifşa olması.
- Uygulamanın kopyalanması, değiştirilmesi veya zararlı kod enjekte edilmesi.

### Önlem ve En İyi Uygulamalar:
- **R8/ProGuard Aktifleştirme**: `build.gradle` dosyasında `minifyEnabled true` ayarını release build'ler için mutlaka kullanın.
- **Özel Kurallar (`proguard-rules.pro`)**: Saklanması gereken sınıfları (`-keep class com.example.MyClass`), metodları veya arayüzleri doğru şekilde tanımlayın. Özellikle native metodlar, yansıma (reflection) kullanan sınıflar veya serileştirme yapılan sınıflar için dikkatli olun.
- **Agresif Obfuscation**: Mümkün olduğunca fazla sınıf ve üye adını karıştırın.
- **String Şifreleme**: Kaynak kodundaki önemli string sabitlerini (API endpointleri, hata mesajları) çalışma zamanında deşifre edilecek şekilde şifreleyin.
- **Sınıf Şifreleme/Paketleme**: Bazı ticari araçlar, DEX dosyalarının bölümlerini şifreleyerek daha güçlü koruma sunar.
- **Native Kod (C/C++) Obfuscation**: Eğer uygulamanız native kütüphaneler içeriyorsa, bunlar için de obfuscation teknikleri (sembollerin gizlenmesi, kontrol akışı karıştırma) uygulanmalıdır.
- **Anti-Tamper Kontrolleri**: Uygulamanın çalışma zamanında değiştirilip değiştirilmediğini kontrol eden mekanizmalar eklenebilir.
- **Anti-Debugging/Anti-Emulation**: Uygulamanın bir debugger'a bağlı olup olmadığını veya bir emülatörde çalışıp çalışmadığını tespit etmeye yönelik kontroller.

### Örnek: `build.gradle` R8 Konfigürasyonu

```groovy
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true // Kullanılmayan kaynakları kaldırır
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            // debuggable false // Üretim buildlerinde debuggable false olmalıdır
        }
    }
}
```

## 5. Aşırı ve Gereksiz Uygulama İzinleri (Permissions)

### Hata:
- Uygulamanın temel işlevselliği için gerçekten ihtiyaç duymadığı izinleri manifest dosyasında istemek.
- Tehlikeli (dangerous) izinleri çalışma zamanında (run-time) kullanıcıdan gerekçesini açıklamadan istemek veya her zaman gerekliymiş gibi göstermek.
- "En az ayrıcalık" (Principle of Least Privilege) prensibini ihlal etmek.

### Riskler:
- Kullanıcı güveninin sarsılması.
- Uygulamanın bir güvenlik açığı barındırması durumunda, saldırganın bu gereksiz izinleri kullanarak daha fazla zarar vermesi.
- Google Play Store politikaları ile uyumsuzluk.

### Önlem ve En İyi Uygulamalar:
- **İhtiyaç Analizi**: Her bir izin için gerçekten gerekli olup olmadığını dikkatlice değerlendirin.
- **En Az Ayrıcalık**: Uygulamanıza sadece işini yapması için minimum düzeyde yetki verin.
- **Çalışma Zamanı İzinleri**: Tehlikeli izinler (örn. `CAMERA`, `LOCATION`, `READ_CONTACTS`) için kullanıcıdan çalışma zamanında, iznin neden istendiği açıkça belirtilerek onay alınmalıdır (`requestPermissions()`).
- **Opsiyonel Özellikler İçin İzinler**: Bir özellik opsiyonelse ve bir izin gerektiriyorsa, kullanıcı bu özelliği kullanmak istediğinde izin isteyin.
- **Android 10+ Kapsamlı Depolama (Scoped Storage)**: Cihazın dış depolama alanına erişim için `READ_EXTERNAL_STORAGE` ve `WRITE_EXTERNAL_STORAGE` izinlerinin kullanımı kısıtlanmıştır. Uygulamalar kendi özel dizinlerine izinsiz erişebilir veya MediaStore API'sini kullanabilir.
- **Reddedilen İzinleri Yönetme**: Kullanıcı bir izni reddederse, uygulamanın gracefully (sorunsuz bir şekilde) çalışmaya devam etmesini veya kullanıcıya alternatif bir yol sunmasını sağlayın. `shouldShowRequestPermissionRationale()` metodunu kullanarak kullanıcıya neden bu izne ihtiyaç duyulduğunu tekrar açıklayabilirsiniz.

## 6. Yetersiz ve Güvensiz Günlük (Log) Yönetimi

### Hata:
- Şifreler, API token'ları, oturum kimlikleri, banka hesap bilgileri, kişisel mesajlar gibi hassas verilerin üretim (release) build'lerinde loglanması (`Log.d`, `Log.i`, `Log.e` vb.).
- Hata mesajlarında veya istisna (exception) yığın izlerinde (stack traces) sistemin iç yapısı, dosya yolları, SQL sorguları gibi saldırgana faydalı olabilecek detaylı bilgilerin ifşa edilmesi.

### Riskler:
- Logcat aracılığıyla veya ADB (Android Debug Bridge) kullanılarak bu hassas verilere erişilmesi.
- Çökme raporlama (crash reporting) servislerine bu hassas logların gönderilmesi.
- Uygulama güvenliği hakkında ipuçları verilmesi.

### Önlem ve En İyi Uygulamalar:
- **Üretim Build'lerinde Loglamayı Kapatma/Azaltma**: `BuildConfig.DEBUG` flag'ini kullanarak sadece debug build'lerde detaylı loglama yapın.
- **ProGuard/R8 ile Log Çağrılarını Kaldırma**: ProGuard kuralları ile (`-assumenosideeffects class android.util.Log { public static *** d(...); }`) üretim build'lerinden log çağrılarını tamamen kaldırabilirsiniz.
- **Hassas Veri Maskeleme**: Eğer bir değeri loglamak zorundaysanız (örn. kullanıcı ID'si), bunun tamamını değil, sadece bir kısmını veya maskelenmiş halini loglayın.
- **Genel Hata Mesajları**: Kullanıcıya gösterilen hata mesajları genel olmalı, sistemin iç işleyişi hakkında bilgi vermemelidir.
- **Güvenli Çökme Raporlama**: Kullandığınız çökme raporlama aracının (Firebase Crashlytics, Sentry vb.) loglarda veya özel anahtarlarda hassas veri toplamadığından ve verileri güvenli bir şekilde ilettiğinden emin olun.

### Örnek: Koşullu ve Güvenli Loglama

```java
// Hatalı yaklaşım (Üretimde hassas veri loglama riski)
// Log.d("PaymentService", "Kullanıcı: " + userId + ", Kredi Kartı: " + creditCardNumber);

// Doğru yaklaşım
if (BuildConfig.DEBUG) {
    Log.d("UserService", "Kullanıcı girişi denemesi: " + username);
} else {
    // Üretimde sadece kritik ve anonimleştirilmiş hataları logla (eğer gerekliyse)
    // Analytics.logEvent("login_attempt_failed");
}

// ProGuard ile üretimde Log.v, Log.d, Log.i çağrılarını kaldırma kuralı:
// -assumenosideeffects class android.util.Log {
//    public static int v(...);
//    public static int d(...);
//    public static int i(...);
// }
```

## 7. Zayıf ve Güvensiz Dosya İzinleri ve Depolama Yönetimi

### Hata:
- Uygulama içi dosyaları (internal storage) oluştururken eski ve güvensiz `MODE_WORLD_READABLE` veya `MODE_WORLD_WRITEABLE` flag'lerini kullanmak.
- Hassas verileri external storage (harici depolama) üzerinde şifresiz saklamak (bu alan diğer uygulamalar tarafından daha kolay erişilebilirdir).
- `FileProvider` kullanmadan veya yanlış yapılandırarak uygulama içi dosyaları diğer uygulamalarla güvensiz bir şekilde paylaşmak.

### Riskler:
- Diğer uygulamaların, uygulamanızın özel dosyalarına yetkisiz erişimi, okunması veya değiştirilmesi.
- Veri sızıntıları.

### Önlem ve En İyi Uygulamalar:
- **`MODE_PRIVATE` Kullanımı**: Uygulama içi dosyaları oluştururken veya `SharedPreferences` alırken varsayılan ve en güvenli mod olan `MODE_PRIVATE` kullanılmalıdır. Bu, dosyaların sadece sahip olan uygulama tarafından erişilebilir olmasını sağlar.
- **Internal Storage Tercihi**: Hassas veriler için her zaman internal storage ( `getFilesDir()`, `getCacheDir()` ) tercih edilmelidir. Bu alan, uygulama kaldırıldığında otomatik olarak temizlenir ve root erişimi olmadan diğer uygulamalar tarafından doğrudan erişilemez.
- **External Storage Kullanımında Dikkat**: Eğer external storage kullanmak zorundaysanız (büyük medya dosyaları vb.), buraya kaydedilen verilerin şifrelenmesi ve Android 10+ için Scoped Storage prensiplerine uyulması önemlidir.
- **`FileProvider`**: Uygulamanızın özel dosyalarını diğer uygulamalarla güvenli bir şekilde paylaşmanın standart yoludur. Dosya URI'leri yerine `content://` URI'leri üretir ve geçici erişim izinleri verir.
- **Geçici Dosyaların Güvenli Yönetimi**: `File.createTempFile()` ile oluşturulan geçici dosyaların işleri bittiğinde güvenli bir şekilde silindiğinden emin olun.

## 8. WebView Güvenlik Açıkları ve Yanlış Yapılandırmalar

### Hata:
- `WebView` ayarlarında JavaScript'i (`setJavaScriptEnabled(true)`) gereksiz yere veya güvenlik önlemleri almadan etkinleştirmek.
- `WebView`'a rastgele URL'lerin veya güvenilmeyen web içeriğinin yüklenmesine izin vermek.
- `addJavascriptInterface` metodunu dikkatli kullanmamak ve potansiyel olarak tehlikeli Java metodlarını JavaScript'e ifşa etmek.
- Dosya sistemi erişimine (`setAllowFileAccess(true)`) veya evrensel dosya erişimine (`setAllowUniversalAccessFromFileURLs(true)`) kontrolsüz bir şekilde izin vermek.
- SSL hatalarını `onReceivedSslError` içinde `handler.proceed()` çağırarak görmezden gelmek.
- `mixed content` (HTTPS bir sayfada HTTP üzerinden kaynak yüklenmesi) yüklenmesine izin vermek.

### Riskler:
- **XSS (Cross-Site Scripting)**: Güvenilmeyen web sayfaları veya girdiler aracılığıyla `WebView` içinde zararlı JavaScript kodlarının çalıştırılması, oturum token'larının çalınması, kullanıcı arayüzünün manipüle edilmesi.
- **Yerel Dosya Hırsızlığı**: Yanlış yapılandırılmış dosya erişim izinleri ile uygulamanın özel dosyalarına erişilmesi.
- **Phishing (Oltalama) Saldırıları**: Kullanıcıların sahte sayfalara yönlendirilmesi.
- MitM saldırılarına karşı savunmasız kalma (SSL hataları görmezden gelinirse).

### Önlem ve En İyi Uygulamalar:
- **JavaScript'i Sadece Gerekliyse Etkinleştirin**: Eğer `WebView` sadece statik içerik gösteriyorsa, JavaScript'i kapalı tutun.
- **Güvenilir Kaynaklar**: `WebView`'a sadece kendi kontrolünüzdeki veya güvendiğiniz URL'leri yükleyin.
- **`addJavascriptInterface` Güvenliği**: JavaScript'e ifşa edilen Java metodlarını minimumda tutun, `@JavascriptInterface` ile işaretlenmiş metodların tehlikeli işlemler yapmadığından emin olun ve API 17 altı için ek önlemler alın (örn. `removeJavascriptInterface("searchBoxJavaBridge_")`).
- **Dosya Erişimini Kısıtlayın**: `setAllowFileAccess(false)` ve `setAllowContentAccess(false)` ayarlarını varsayılan olarak kullanın. Gerekliyse, sadece belirli ve güvenli yollara erişim izni verin.
- **SSL Hatalarını Doğru Yönetin**: `onReceivedSslError` içinde asla doğrudan `handler.proceed()` çağırmayın. Kullanıcıyı bilgilendirin ve bağlantıyı iptal edin.
- **Cleartext Trafiği Engelleme**: `WebView` için de Network Security Configuration ayarları geçerlidir. `WebView`'ın HTTP üzerinden içerik yüklemesini engelleyin.
- **URL Yüklemesini Kontrol Etme**: `shouldOverrideUrlLoading` metodunu kullanarak `WebView` içinde gezinmeyi kontrol edin ve sadece güvenli URL'lere izin verin.

## 9. Zayıf veya Yanlış Uygulanmış Kriptografik Yaklaşımlar

### Hata:
- Artık güvenli kabul edilmeyen veya kırılmış şifreleme algoritmalarını (MD5, SHA-1, DES, RC4) kullanmak.
- Şifreleme anahtarlarını kaynak koduna sabit (hardcoded) olarak gömmek veya güvensiz bir şekilde saklamak/iletmek.
- Kendi kriptografik algoritmalarınızı veya protokollerinizi tasarlamaya çalışmak ("Don't roll your own crypto" prensibi).
- IV (Initialization Vector) veya Nonce'ları statik, tahmin edilebilir veya tekrar kullanır şekilde kullanmak.
- Şifre hash'leme için tuzlama (salting) kullanmamak veya yetersiz iterasyon sayısı (iteration count) kullanmak.
- Kriptografik işlemler sırasında oluşan hataları (padding oracle vb.) doğru yönetmemek.

### Riskler:
- Şifrelenmiş verilerin kolayca deşifre edilmesi.
- Anahtarların çalınması ve tüm şifreli verilerin ifşa olması.
- Zayıf algoritmalar nedeniyle veri bütünlüğünün veya gizliliğinin sağlanamaması.

### Önlem ve En İyi Uygulamalar:
- **Güçlü ve Modern Algoritmalar**: Simetrik şifreleme için AES-256 (GCM veya CBC modu ile), asimetrik şifreleme için RSA (2048 bit veya üzeri) veya ECDSA, hash için SHA-256 veya üzeri kullanılmalıdır.
- **Android Keystore**: Şifreleme anahtarlarını oluşturmak, saklamak ve yönetmek için en güvenli yerdir.
- **Güvenilir Kütüphaneler**: Google Tink, Bouncy Castle gibi test edilmiş ve güvenilir kriptografi kütüphanelerini kullanın.
- **Rastgele ve Benzersiz IV/Nonce**: Her şifreleme işlemi için kriptografik olarak güvenli, rastgele ve benzersiz bir IV/Nonce üretilmelidir. IV'ler genellikle şifreli metinle birlikte saklanabilir, gizli olmaları gerekmez ama benzersiz olmaları kritiktir.
- **Güvenli Şifre Hash'leme**: Kullanıcı şifrelerini saklarken PBKDF2, bcrypt veya scrypt gibi adaptif hash fonksiyonları kullanılmalı, her şifre için benzersiz bir tuz (salt) üretilmeli ve yeterli sayıda iterasyon uygulanmalıdır.
- **Anahtar Yönetimi**: Anahtar üretimi, dağıtımı, saklanması ve rotasyonu için sağlam bir strateji oluşturulmalıdır.

## 10. Yetersiz ve Güvensiz Oturum Yönetimi

### Hata:
- Oturum token'larını (access token, refresh token) `SharedPreferences` gibi yerlerde şifresiz saklamak.
- Çok uzun ömürlü ve otomatik olarak yenilenmeyen oturum token'ları kullanmak.
- Oturum sonlandırmada (logout) token'ları sadece istemci tarafından silip, sunucu tarafında geçersiz kılmamak.
- Oturum token'larını URL parametreleri gibi güvensiz yerlerde taşımak.
- Oturum sabitleme (session fixation) saldırılarına karşı önlem almamak (giriş sonrası token yenilememek).
- Refresh token'ların çalınması durumunda yeterli önlem almamak (örn. refresh token rotation uygulamamak).

### Riskler:
- Oturum ele geçirme (session hijacking).
- Yetkisiz API erişimi.
- Kullanıcı adına işlemler yapılması.

### Önlem ve En İyi Uygulamalar:
- **Güvenli Token Saklama**: Token'lar `EncryptedSharedPreferences` veya Android Keystore ile korunarak saklanmalıdır.
- **Kısa Ömürlü Access Token, Uzun Ömürlü Refresh Token**: Access token'lar kısa ömürlü (5-60 dakika) olmalı, refresh token'lar ise yeni access token almak için kullanılmalı ve daha uzun ömürlü (ama yine de süreli) olmalıdır.
- **Sunucu Taraflı Token İptali**: Logout işleminde veya şüpheli bir durumda refresh token sunucu tarafında mutlaka iptal edilmelidir.
- **HTTPS Kullanımı**: Token'lar her zaman HTTPS üzerinden iletilmelidir.
- **Giriş Sonrası Token Yenileme**: Başarılı bir kimlik doğrulama sonrası yeni token'lar üretilerek session fixation önlenmelidir.
- **Refresh Token Rotasyonu**: Her refresh token kullanıldığında yeni bir refresh token üretilerek çalınan bir refresh token'ın tekrar kullanılma riski azaltılır.
- **Hareketsizlik Zaman Aşımı**: Belirli bir süre işlem yapılmadığında oturum otomatik olarak sonlandırılmalıdır.

## 11. Güvensiz Intent Kullanımı ve Bileşen İfşası

### Hata:
- Hassas verileri içeren Intent'leri diğer uygulamalara korumasız bir şekilde göndermek.
- `PendingIntent` oluştururken `FLAG_IMMUTABLE` veya `FLAG_MUTABLE` flag'lerini doğru kullanmamak, gereksiz yere mutable `PendingIntent` oluşturmak.
- Uygulama bileşenlerini (Activity, Service, BroadcastReceiver, ContentProvider) gereksiz yere `android:exported="true"` olarak ayarlamak ve uygun erişim kontrolleri (izinler) uygulamamak.
- Implicit (örtük) Intent'leri güvenlik açığı oluşturacak şekilde kullanmak (örn. hassas bir eylemi tetiklemek için genel bir action string'i kullanmak).

### Riskler:
- **Veri Sızıntısı**: Diğer uygulamaların hassas verilere erişmesi.
- **Yetkisiz İşlem Yaptırma (Privilege Escalation)**: Kötü amaçlı bir uygulamanın, uygulamanızın export edilmiş bileşenlerini kullanarak yetkisi olmayan işlemler yapması.
- **Intent Spoofing/Sniffing**: Gönderilen veya alınan Intent'lerin manipüle edilmesi veya dinlenmesi.

### Önlem ve En İyi Uygulamalar:
- **Explicit Intent Tercihi**: Mümkün olduğunca uygulama içi iletişim için explicit (açık) Intent'ler (hedef bileşeni doğrudan belirten) kullanılmalıdır.
- **`android:exported` Kontrolü**: Bir bileşenin diğer uygulamalar tarafından başlatılmasına gerek yoksa `android:exported="false"` olarak ayarlanmalıdır. Eğer `true` ise, `android:permission` ile özel bir izin tanımlanmalı veya Android'in standart izinleri kullanılmalıdır.
- **`PendingIntent` Güvenliği**: Android 12 (API 31) ve üzeri için `PendingIntent` oluştururken `FLAG_IMMUTABLE` veya `FLAG_MUTABLE` açıkça belirtilmelidir. Çoğu durumda `FLAG_IMMUTABLE` tercih edilmelidir.
- **BroadcastReceiver Güvenliği**: Hassas bilgi içeren broadcast'ler için `LocalBroadcastManager` (uygulama içi) kullanılmalı veya gönderilen broadcast'lere özel izinler eklenmelidir. Alıcılar için de `exported="false"` veya izin kontrolü önemlidir.
- **ContentProvider İzinleri**: `android:readPermission` ve `android:writePermission` ile Content Provider'lara erişim kontrol edilmelidir. URI bazlı geçici izinler için `grantUriPermission` kullanılabilir.
- **Intent Filtrelerini Dikkatli Kullanma**: Implicit Intent filtreleri çok genel olmamalı, belirli action, data ve category'leri hedeflemelidir.

## 12. Üçüncü Parti Kütüphane (Dependency) Güvenlik Açıkları

### Hata:
- Bilinen güvenlik açıkları içeren eski veya güvenilmeyen üçüncü parti kütüphaneleri (SDK'lar, JAR'lar, AAR'lar) kullanmak.
- Kütüphaneleri düzenli olarak güncellememek.
- Kütüphanelerin talep ettiği izinleri veya ağ erişimlerini kontrol etmemek.

### Riskler:
- Kütüphanedeki bir zafiyet yoluyla uygulamanın ele geçirilmesi.
- Hassas verilerin sızdırılması.
- Uygulamanın beklenmedik şekilde davranması veya çökmesi.

### Önlem ve En İyi Uygulamalar:
- **Güvenilir Kaynaklar**: Kütüphaneleri her zaman resmi repolarından (Maven Central, Google Maven) veya güvenilir kaynaklardan indirin.
- **Düzenli Güncelleme**: Kütüphanelerin yeni sürümlerini ve güvenlik yamalarını takip ederek uygulamanızı güncel tutun.
- **Bağımlılık Analizi Araçları**: OWASP Dependency-Check, Snyk, GitHub Dependabot gibi araçlar kullanarak projenizdeki kütüphanelerin bilinen güvenlik açıklarını tarayın.
- **İzin Kontrolü**: Bir kütüphaneyi eklemeden önce manifest dosyasını inceleyerek hangi izinleri talep ettiğini ve bunların projeniz için makul olup olmadığını değerlendirin.
- **Minimum Gerekli Kütüphane**: Sadece gerçekten ihtiyaç duyduğunuz kütüphaneleri projenize dahil edin.

## 13. Yetersiz Hata Yönetimi ve Aşırı Bilgi Sızdırma

### Hata:
- Kullanıcıya gösterilen hata mesajlarında veya loglarda sistemin iç yapısı, dosya yolları, tam SQL sorguları, sunucu IP adresleri, stack trace'ler gibi hassas veya teknik detayları ifşa etmek.
- Genel `try-catch (Exception e)` blokları ile hataları yakalayıp, özel durumları ele almamak ve bu sırada hassas bilgileri loglamak veya kullanıcıya yansıtmak.

### Riskler:
- Saldırganlara uygulamanın veya sunucu altyapısının zafiyetleri hakkında değerli bilgiler sunulması.
- Hata durumlarından faydalanarak sistemin manipüle edilmesi.

### Önlem ve En İyi Uygulamalar:
- **Genel ve Kullanıcı Dostu Hata Mesajları**: Son kullanıcıya gösterilen hata mesajları basit, anlaşılır olmalı ve teknik detay içermemelidir (örn. "Bir hata oluştu, lütfen daha sonra tekrar deneyin.").
- **Detaylı Loglar Sadece Debug Modunda**: Ayrıntılı hata logları ve stack trace'ler sadece `BuildConfig.DEBUG` true iken veya özel bir geliştirici modunda aktif edilmelidir.
- **Hata Kodları**: Kullanıcıya genel bir mesaj gösterilirken, arka planda loglanan veya sunucuya gönderilen hata raporlarına benzersiz bir hata kodu eklenebilir. Bu, sorunun daha sonra analiz edilmesine yardımcı olur.
- **Hassas Bilgileri Filtreleme**: Hata raporlama sistemlerine gönderilen verilerden (loglar, cihaz bilgileri) hassas olabilecek kısımlar filtrelenmeli veya anonimleştirilmelidir.

## 14. Deep Link (Derin Bağlantı) ve App Link Güvenlik Zafiyetleri

### Hata:
- Uygulamaya gelen deep link URI'larını (scheme, host, path, parametreler) yeterince doğrulamadan işlemek.
- Deep link parametreleri aracılığıyla hassas işlemleri tetiklemeye veya hassas verilere erişmeye izin vermek.
- App Links (Android 6.0+) için alan adı sahipliğini (`assetlinks.json` dosyası) doğru yapılandırmamak veya doğrulamamak.

### Riskler:
- **Yetkisiz Erişim**: Kötü amaçlı bir web sitesi veya uygulama, özel olarak hazırlanmış bir deep link ile uygulamanızda istenmeyen bir sayfayı açabilir veya bir işlemi tetikleyebilir.
- **Veri Sızıntısı**: Deep link parametreleri ile gelen veriler yeterince doğrulanmazsa, bu veriler uygulamanın beklenmedik bir şekilde hassas bilgileri ifşa etmesine neden olabilir.
- **Phishing**: Kullanıcılar sahte deep link'lerle kandırılabilir.

### Önlem ve En İyi Uygulamalar:
- **Parametre Doğrulama**: Deep link ile gelen tüm parametreleri (veri tipleri, uzunlukları, geçerli değer aralıkları) sıkı bir şekilde doğrulayın. Beklenmedik veya zararlı olabilecek girdileri reddedin.
- **Yetkilendirme Kontrolü**: Deep link bir işlemi tetikliyorsa, kullanıcının bu işlemi yapmaya yetkisi olup olmadığını kontrol edin.
- **App Links Kullanımı**: Mümkün olduğunca standart deep link'ler yerine Android App Links kullanın. Bu, web sitenizin sahipliğini doğrulayarak uygulamanızın sadece sizin tarafınızdan gönderilen linkleri otomatik olarak açmasını sağlar (`autoVerify="true"`).
- **Host ve Scheme Kontrolü**: Gelen Intent'in action'ını (`Intent.ACTION_VIEW`), data URI'sını, host'unu ve scheme'ini beklediğiniz değerlerle karşılaştırın.
- **Hassas İşlemler İçin Ek Onay**: Deep link ile hassas bir işlem başlatılıyorsa (örn. ödeme, hesap silme), kullanıcıdan ek bir onay (örn. şifre, biyometrik) isteyin.

## 15. Ekran Görüntüsü, Pano ve Erişilebilirlik Servisi Zafiyetleri

### Hata:
- Hassas bilgilerin (şifre alanları, kredi kartı numaraları, özel mesajlar) görüntülendiği ekranlarda ekran görüntüsü alınmasına veya video kaydı yapılmasına izin vermek.
- Hassas verilerin kopyala-yapıştır panosuna (clipboard) kopyalanmasına izin vermek ve panoyu zamanında temizlememek.
- Erişilebilirlik servislerinin (Accessibility Services) kötüye kullanılarak hassas kullanıcı arayüzü elemanlarından veri çalmasına karşı savunmasız olmak.

### Riskler:
- Hassas verilerin ekran görüntüleri veya kayıtlar yoluyla sızması.
- Panoya kopyalanan verilerin diğer uygulamalar (özellikle zararlı olanlar) tarafından okunması.
- Kötü amaçlı erişilebilirlik servislerinin kullanıcı girdilerini dinlemesi veya ekran içeriğini çalması.

### Önlem ve En İyi Uygulamalar:
- **Ekran Görüntüsü ve Kaydını Engelleme**: Hassas içerik gösteren Activity'lerde `getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);` kullanarak ekran görüntüsü alınmasını ve ekranın diğer uygulamalar tarafından (video kaydı dahil) görülmesini engelleyebilirsiniz.
- **Pano Güvenliği**: Şifre alanları gibi çok hassas alanlarda kopyalama özelliğini devre dışı bırakın (`android:longClickable="false"`, `setCustomSelectionActionModeCallback`). Eğer panoya hassas veri kopyalanıyorsa, uygulama arka plana gittiğinde veya belirli bir süre sonra panoyu temizleyin.
- **Erişilebilirlik Servislerine Karşı Dikkat**: Uygulamanızdaki `EditText` gibi alanların `android:contentDescription` attribute'larını dikkatli kullanın, çünkü bu bilgiler erişilebilirlik servisleri tarafından okunabilir. `View.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS)` gibi metodlarla hassas view hiyerarşilerini erişilebilirlik servislerinden gizleyebilirsiniz, ancak bu, gerçek erişilebilirlik kullanıcıları için sorun yaratabilir, bu yüzden dikkatli kullanılmalıdır.
- **Custom View'lerde `onProvideStructure`**: Eğer custom view'leriniz varsa ve autofill veya erişilebilirlik için içerik sağlıyorsanız, hassas verileri ifşa etmediğinizden emin olun.

## Sonuç: Güvenlik Sürekli Bir Yolculuktur

Android uygulamalarında güvenlik, geliştirme yaşam döngüsünün her aşamasında dikkate alınması gereken, ihmal edilemeyecek kritik bir unsurdur. Bu yazıda ele alınan yaygın hatalar ve önlemleri, buzdağının sadece görünen kısmıdır. Geliştiriciler olarak, sürekli güncellenen tehdit ortamına karşı tetikte olmalı, güvenlik en iyi uygulamalarını benimsemeli, kodumuzu düzenli olarak güvenlik testlerinden geçirmeli ve kullanıcılarımızın verilerini korumak için proaktif bir yaklaşım sergilemeliyiz.

Unutmayın, güvenlik bir hedef değil, sürekli devam eden bir yolculuktur. Uygulamanızı ve kullanıcılarınızı güvende tutmak için sürekli öğrenmeye ve adapte olmaya devam edin.

---

*Bu yazı, Android geliştiricilerine yaygın güvenlik hataları konusunda farkındalık kazandırmak ve daha güvenli uygulamalar oluşturmalarına yardımcı olmak amacıyla eğitim amaçlı hazırlanmıştır. Uygulamalarınızda güvenlik önlemlerini uygularken her zaman güncel Android resmi dokümantasyonunu, OWASP Mobil Güvenlik Projesi (MASVS, MASTG) gibi standartları ve sektördeki en iyi uygulamaları referans almanız önerilir.*

</rewritten_file> 