# Kod Karıştırma Teknikleri ve Etkinliği

Kod karıştırma (obfuscation), uygulamanızın tersine mühendislik ve analizini zorlaştırmak için kullanılan kritik bir güvenlik katmanıdır. Bu yazıda, Android ve iOS dünyasında yaygın obfuscation yöntemlerini ve sınırlamalarını inceliyoruz.

## 1. Obfuscation Nedir?

- Kodunuzun anlaşılmasını güçleştirmek için **sınıf**, **metot** ve **değişken** isimlerini anlamsızlaştırma.
- Statik analiz araçlarının ürettiği çıktıyı boğarak tersine mühendislik maliyetini artırma.

## 2. Android'de ProGuard ve R8

- **ProGuard**: Kod küçültme (shrinking), optimize etme ve obfuscation sağlar.
- **R8**: Android Studio'da varsayılan, ProGuard kurallarını destekleyen hızlı karıştırma aracı.

```groovy
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### İpuçları

- Kütüphane içi kritik sınıfları `-keep` kurallarıyla koruyun.
- Test ve QA aşamasında **release** (karıştırılmış) sürümü mutlaka test edin.

## 3. iOS'ta Symbol Stripping ve Obfuscation

- **Strip Linked Product**: Release derlemesinde sembolleri kaldırın.
- Open-source **Swift Obfuscator** veya benzeri araçlarla metot isimlerini gizleyin.
- **Bitcode** gönderimi, Apple'ın derleyici optimizasyonlarıyla hafif önlem sunar.

## 4. Native (C/C++) Kod Obfuscation

- JNI/NDK tabanlı kütüphaneler için **LLVM Obfuscator**, **Obfuscator-LLVM** gibi araçlar kullanın.
- `__attribute__((optimize("...")))` veya inline assembly ile ek katmanlar ekleyin.

## 5. String Şifreleme

- Kodda düz metin (API endpoint, gizli anahtar) barındırmamak için runtime'da çözülen **AES** veya **XOR** tabanlı şifreleme.

```java
public static String decrypt(String encrypted) {
    // AES decryption…
    return decrypted;
}
```

## 6. Dinamik Yükleme ve Reflection

- Kritik modülleri **dynamic feature**, **dynamic library** olarak sunun.
- Reflection ile kritik metodlarınızı gizleyin; tersine mühendislikte ekstra analiz gerektirir.

## 7. Obfuscation'ın Sınırlamaları

- Dinamik analiz (Frida, Xposed) ve emülatörler obfuscation'ı atlatabilir.
- Sürekli güncelleme, çok katmanlı güvenlik (encryption, runtime integrity) şart.

## Sonuç

Obfuscation, tek başına tam bir güvenlik çözümü değildir; ancak diğer önlemlerle birleştiğinde tersine mühendislik maliyetini ciddi oranda yükseltir. ProGuard/R8, symbol stripping, string şifreleme ve dinamik yükleme yöntemlerini bir arada kullanarak uygulamanızı daha dirençli hale getirebilirsiniz.

---

*Bu yazı eğitim amaçlıdır. Obfuscation yöntemleriyle ilgili daha fazla detay için resmi araç dokümantasyonlarını incelemeniz önerilir.* 