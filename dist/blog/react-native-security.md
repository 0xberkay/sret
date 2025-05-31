# React Native Uygulamalarında Güvenlik ve Performans Optimizasyonu

React Native ile geliştirilen uygulamalar hem güvenlik hem de performans açısından optimize edilmelidir. Aşağıda en iyi uygulamaları inceleyin.

## 1. Kod Karıştırma (Obfuscation)

Kod karıştırma, ters mühendislik çabalarını zorlaştırmak için kullanılan önemli bir güvenlik önlemidir. React Native uygulamalarında JavaScript kodunun okunabilirliğini azaltır ve hassas bilgileri korur.

### Yaygın Kod Karıştırma Araçları:

- **react-native-obfuscating-transformer**: JS kodunu karıştırmak için popüler bir çözüm.
  ```javascript
  // metro.config.js
  module.exports = {
    transformer: {
      babelTransformerPath: require.resolve('react-native-obfuscating-transformer')
    },
    obfuscatingTransformer: {
      obfuscatorOptions: {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true
      }
    }
  };
  ```

- **jscrambler**: Daha kapsamlı koruma sağlayan profesyonel bir çözüm.
  ```bash
  npm install jscrambler
  jscrambler -c jscrambler.json -o output_directory input_directory
  ```

- **terser**: Bundle işlemi sırasında kod karıştırma için kullanılabilir.
  ```bash
  npm install terser
  terser input.js --compress --mangle --output output.js
  ```

### Hassas Bilgi Yönetimi:

- **react-native-config**: API anahtarları ve diğer hassas bilgileri `.env` dosyasında saklayın.
  ```javascript
  // .env
  API_URL=https://api.example.com
  API_KEY=your_secret_key

  // Kullanım
  import Config from 'react-native-config';
  fetch(`${Config.API_URL}/data`, {
    headers: { 'Authorization': `Bearer ${Config.API_KEY}` }
  });
  ```

- **react-native-dotenv**: Çevresel değişkenler için alternatif bir çözüm.
  ```javascript
  import { API_URL, API_KEY } from '@env';
  ```

- **Uygulama içi Değişkenler**: En kritik API anahtarları için native kod içinde saklama:
  ```java
  // Android: BuildConfig.java
  public static final String API_KEY = "your_secret_key";
  ```

### Kod Karıştırma için En İyi Uygulamalar:

- **ProGuard/R8**: Android için native kodu karıştırın.
  ```gradle
  // android/app/build.gradle
  buildTypes {
    release {
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
  }
  ```

- **Swift/Objective-C Karıştırma**: iOS için native kodu karıştırın.
  ```
  // xcode build settings
  ENABLE_BITCODE=YES
  SWIFT_OPTIMIZATION_LEVEL=-Owholemodule
  ```

- **Metro Bundler Yapılandırması**: Hermes ile optimize edilmiş bundle üretimi için yapılandırma.

## 2. Güvenli Depolama

Mobil uygulamalarda hassas verilerin güvenli bir şekilde depolanması kritik önem taşır. React Native'de çeşitli güvenli depolama seçenekleri mevcuttur.

### Güvenli Depolama Kütüphaneleri:

- **react-native-keychain**: iOS Keychain ve Android Keystore ile entegre, biyometrik kimlik doğrulama desteği.
  ```javascript
  import * as Keychain from 'react-native-keychain';
  
  // Hassas veri saklama
  await Keychain.setGenericPassword('username', 'password', {
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
    service: 'myService'
  });
  
  // Veri alma
  const credentials = await Keychain.getGenericPassword({service: 'myService'});
  
  // Veri silme
  await Keychain.resetGenericPassword({service: 'myService'});
  ```

- **expo-secure-store**: Expo projelerinde güvenli depolama için.
  ```javascript
  import * as SecureStore from 'expo-secure-store';
  
  await SecureStore.setItemAsync('secure_key', 'secure_value', {
    keychainAccessible: SecureStore.WHEN_UNLOCKED
  });
  
  const value = await SecureStore.getItemAsync('secure_key');
  ```

- **react-native-encrypted-storage**: AsyncStorage üzerinde şifreleme katmanı sağlar.
  ```javascript
  import EncryptedStorage from 'react-native-encrypted-storage';
  
  await EncryptedStorage.setItem(
    'user_session',
    JSON.stringify({
      token: 'ACCESS_TOKEN',
      userId: 'USER_ID'
    })
  );
  ```

- **react-native-mmkv**: Yüksek performanslı, şifreleme destekli yerli depolama.
  ```javascript
  import { MMKV } from 'react-native-mmkv';
  
  const storage = new MMKV({
    id: 'user-storage',
    encryptionKey: 'encryption-key'
  });
  
  storage.set('user', JSON.stringify({id: 1, name: 'Test'}));
  const user = JSON.parse(storage.getString('user'));
  ```

### AsyncStorage Güvenliği:

- **AsyncStorage** tek başına güvenli değildir, hassas verileri saklamak için ek şifreleme gerekir:
  ```javascript
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import CryptoJS from 'crypto-js';
  
  // Şifrelenmiş veri saklama
  const secureStore = async (key, value) => {
    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      'encryption-key'
    ).toString();
    await AsyncStorage.setItem(key, encryptedValue);
  };
  
  // Şifrelenmiş veri alma
  const secureRetrieve = async (key) => {
    const encryptedValue = await AsyncStorage.getItem(key);
    if (encryptedValue) {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedValue, 'encryption-key');
      return JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
    }
    return null;
  };
  ```

## 3. Ağ Güvenliği ve TLS

Ağ iletişiminin güvenliği, mobil uygulamalarda veri güvenliğinin temel bir bileşenidir.

### HTTPS ve TLS:

- Tüm ağ isteklerinde HTTPS kullanımı zorunludur:
  ```javascript
  // config.js
  export const API_BASE_URL = 'https://api.yourservice.com';
  
  // APIService.js
  import { API_BASE_URL } from './config';
  
  export const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  ```

### Sertifika Pinning Kütüphaneleri:

- **react-native-ssl-pinning**: MITM saldırılarını önlemek için özel sertifika pinning.
  ```javascript
  import { fetch } from 'react-native-ssl-pinning';
  
  fetch('https://api.example.com/data', {
    method: 'GET',
    sslPinning: {
      certs: ['cert1', 'cert2']
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(response => {
    console.log(response.json());
  });
  ```

- **react-native-pinch**: Alternatif bir sertifika pinning çözümü.
  ```javascript
  import { fetch } from 'react-native-pinch';
  
  fetch('https://api.example.com/data', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    pkPinning: [
      {
        hostname: 'api.example.com',
        publicKeyHashes: [
          'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
        ]
      }
    ]
  }).then(response => response.json())
  ```

- **TrustKit** Entegrasyonu: Native sertifika pinning sağlar.
  ```javascript
  // iOS için AppDelegate.m
  #import "TrustKit/TrustKit.h"
  
  NSDictionary *trustKitConfig = @{
    kTSKSwizzleNetworkDelegates: @YES,
    kTSKPinnedDomains: @{
      @"api.example.com": @{
        kTSKPublicKeyHashes: @[
          @"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        ],
      },
    }
  };
  [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
  ```

### Ağ Güvenliği için Ek Önlemler:

- **react-native-network-logger**: Ağ trafiğini izleme ve güvenlik sorunlarını tespit etme.
  ```javascript
  import { NetworkLogger, ResponseType } from 'react-native-network-logger';
  
  NetworkLogger.start();
  ```

- **axios-cache-adapter**: İsteklerin önbelleğe alınması ve tekrar eden isteklerin engellenmesi.
  ```javascript
  import axios from 'axios';
  import { setupCache } from 'axios-cache-adapter';
  
  const cache = setupCache({
    maxAge: 15 * 60 * 1000 // 15 dakika
  });
  
  const api = axios.create({
    adapter: cache.adapter,
    baseURL: 'https://api.example.com'
  });
  ```

## 4. Performans Optimizasyonu

React Native uygulamalarında performans optimizasyonu, kullanıcı deneyimi ve pil ömrü için hayati önem taşır.

### JavaScript Motor Optimizasyonu:

- **Hermes Engine**: JavaScript yürütme motoru.
  ```javascript
  // android/app/build.gradle
  project.ext.react = [
    enableHermes: true
  ]
  
  // iOS için Podfile
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true
  )
  ```

### Bundle Optimizasyonu:

- **inlineRequires**: Modüllerin yüklenmesini optimize eder.
  ```javascript
  // metro.config.js
  module.exports = {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true
        }
      })
    }
  };
  ```

- **RAM Bundles**: Büyük uygulamalar için daha hızlı başlatma süresi.
  ```javascript
  // metro.config.js
  module.exports = {
    serializer: {
      createModuleIdFactory: require('metro/src/lib/createModuleIdFactory'),
      processModuleFilter: () => true,
      /* ram bundling için: */
      getModulesRunBeforeMainModule: () => [],
      getPolyfills: require('react-native/rn-get-polyfills')
    }
  };
  ```

- **CodePush**: OTA güncellemeleri için Microsoft App Center çözümü.
  ```javascript
  import codePush from 'react-native-code-push';
  
  const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.ON_APP_START,
    installMode: codePush.InstallMode.ON_NEXT_RESTART
  };
  
  export default codePush(codePushOptions)(App);
  ```

### UI Performans İyileştirmeleri:

- **react-native-reanimated**: Donanım hızlandırmalı animasyonlar.
  ```javascript
  import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring 
  } from 'react-native-reanimated';
  
  function AnimatedComponent() {
    const offset = useSharedValue(0);
    
    const animatedStyles = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: offset.value }]
      };
    });
    
    const startAnimation = () => {
      offset.value = withSpring(100);
    };
    
    return (
      <Animated.View style={[styles.box, animatedStyles]} onTouchStart={startAnimation} />
    );
  }
  ```

- **react-native-fast-image**: Image bileşeni için önbelleğe alma ve performans iyileştirmeleri.
  ```javascript
  import FastImage from 'react-native-fast-image';
  
  <FastImage
    style={{ width: 200, height: 200 }}
    source={{
      uri: 'https://example.com/image.jpg',
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable
    }}
    resizeMode={FastImage.resizeMode.contain}
  />
  ```

- **FlashList**: FlatList'ten çok daha iyi performans sağlayan alternatif liste bileşeni.
  ```javascript
  import { FlashList } from '@shopify/flash-list';
  
  <FlashList
    data={items}
    renderItem={({ item }) => <Item {...item} />}
    estimatedItemSize={100}
    onEndReachedThreshold={0.5}
    onEndReached={loadMoreItems}
  />
  ```

### Bellek Yönetimi:

- **useMemo** ve **useCallback** kullanarak gereksiz render'ları önleyin:
  ```javascript
  import React, { useMemo, useCallback } from 'react';
  
  function ExpensiveComponent({ data, onItemPress }) {
    // Veri değiştiğinde yeniden hesapla
    const processedData = useMemo(() => {
      return data.map(item => ({
        ...item,
        computed: expensiveComputation(item)
      }));
    }, [data]);
    
    // Fonksiyonu yeniden oluşturmayı önle
    const handlePress = useCallback((id) => {
      onItemPress(id);
    }, [onItemPress]);
    
    return (
      // Bileşen render'ı
    );
  }
  ```

- **InteractionManager** ile ağır işlemleri geciktirin:
  ```javascript
  import { InteractionManager } from 'react-native';
  
  function ComponentWithHeavyTask() {
    useEffect(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        // Animasyonlar ve etkileşimler tamamlandıktan sonra çalışacak ağır işlem
        heavyComputationTask();
      });
      
      return () => task.cancel();
    }, []);
  }
  ```

## 5. Üçüncü Parti Kitaplık Denetimi

Üçüncü parti kütüphanelerin güvenliği, uygulamanızın genel güvenliği için önemlidir.

### Bağımlılık Denetimi Araçları:

- **npm audit**: Node.js bağımlılıklarını güvenlik açıkları için denetleyin.
  ```bash
  npm audit
  npm audit fix
  ```

- **yarn audit**: Yarn bağımlılıklarını güvenlik açıkları için denetleyin.
  ```bash
  yarn audit
  yarn audit fix
  ```

- **Snyk**: Daha kapsamlı güvenlik denetimi için profesyonel bir çözüm.
  ```bash
  npm install -g snyk
  snyk test
  ```

- **OWASP Dependency-Check**: Açık kaynaklı bir güvenlik denetim aracı.
  ```bash
  dependency-check --project "React Native App" --scan node_modules
  ```

### Bağımlılık Yönetimi:

- **Yarn Resolutions**: Belirli bağımlılık sürümlerini zorlamak için.
  ```json
  // package.json
  "resolutions": {
    "lodash": "^4.17.21",
    "minimist": "^1.2.6"
  }
  ```

- **npm-check-updates**: Güncel, güvenli paket sürümlerini bulmak için.
  ```bash
  npx npm-check-updates
  npx npm-check-updates -u
  ```

## 6. Jailbreak/Root Algılama ve Emülatör Kontrolü

Cihazın güvenliğini tehlikeye atan durumları tespit etmek için önlemler alabilirsiniz.

### Jailbreak/Root Algılama:

- **react-native-device-info**: Cihaz bilgilerini ve güvenlik durumunu kontrol edin.
  ```javascript
  import DeviceInfo from 'react-native-device-info';
  
  const checkDeviceSecurity = async () => {
    const isJailBroken = await DeviceInfo.isJailBroken();
    
    if (isJailBroken) {
      // Güvenlik uyarısı göster veya belirli özellikleri devre dışı bırak
      Alert.alert('Güvenlik Uyarısı', 'Bu cihaz jailbreak/root edilmiş görünüyor.');
    }
  };
  ```

- **react-native-jailbreak-detection**: Özel jailbreak/root algılama.
  ```javascript
  import JailbreakDetection from 'react-native-jailbreak-detection';
  
  JailbreakDetection.isJailBroken()
    .then(jailbroken => {
      if (jailbroken) {
        console.log('Cihaz jailbreak/root edilmiş');
        // Güvenlik önlemleri al
      }
    });
  ```

### Emülatör Algılama:

- Emülatörde çalışan uygulamalara karşı önlem alın:
  ```javascript
  import DeviceInfo from 'react-native-device-info';
  
  const checkIfEmulator = async () => {
    const isEmulator = await DeviceInfo.isEmulator();
    
    if (isEmulator && !__DEV__) {
      // Üretim ortamında emülatörde çalışmayı engelle
      Alert.alert(
        'Güvenlik Uyarısı',
        'Bu uygulama emülatörde çalışamaz.'
      );
    }
  };
  ```

## 7. Ekran Görüntüsü Koruması ve Güvenli UI

Hassas bilgiler içeren ekranları korumak için çeşitli önlemler alınabilir.

### Ekran Görüntüsü Engelleme:

- **react-native-privacy-snapshot**: iOS ve Android'de ekran görüntüsü almayı engeller.
  ```javascript
  import PrivacySnapshot from 'react-native-privacy-snapshot';
  
  // Hassas ekranlarda ekran görüntüsü koruması etkinleştir
  useEffect(() => {
    PrivacySnapshot.enabled(true);
    return () => {
      PrivacySnapshot.enabled(false);
    };
  }, []);
  ```

- Platform özgü koruma:
  ```javascript
  // Android
  import { Platform, View } from 'react-native';
  
  function SecureScreen() {
    useEffect(() => {
      if (Platform.OS === 'android') {
        android.view.WindowManager.LayoutParams.FLAG_SECURE
      }
    }, []);
    
    return <View>{/* Hassas içerik */}</View>
  }
  ```

### Hassas Bilgi Görüntüleme:

- **react-native-masked-text**: Kredi kartı, şifre vb. içerikler için maskeleme.
  ```javascript
  import { MaskService } from 'react-native-masked-text';
  
  const maskedCreditCard = MaskService.toMask('credit-card', '4111111111111111');
  // Çıktı: "4111 1111 1111 1111"
  ```

## 8. Deep Linking Güvenliği

Deep link'ler, kötü amaçlı saldırılar için potansiyel bir giriş noktasıdır.

### Güvenli Deep Linking:

- URL Doğrulama ve Sanitizasyon:
  ```javascript
  // Deep link işleyici
  const handleDeepLink = (url) => {
    // URL yapısını doğrula
    const isValidUrl = /^myapp:\/\/(section)\/([\w-]+)\/?$/.test(url);
    
    if (!isValidUrl) {
      console.warn('Geçersiz deep link formatı');
      return;
    }
    
    // URL'i parse et
    const matches = url.match(/^myapp:\/\/(section)\/([\w-]+)\/?$/);
    if (matches && matches.length === 3) {
      const [_, section, id] = matches;
      // Doğrulanmış bölüm ve ID ile işlem yap
      navigateToSection(section, id);
    }
  };
  ```

- **react-native-app-auth**: OAuth akışları için güvenli deep link işleme.
  ```javascript
  import { authorize } from 'react-native-app-auth';
  
  const config = {
    issuer: 'https://auth.example.com',
    clientId: 'CLIENT_ID',
    redirectUrl: 'myapp://callback',
    scopes: ['openid', 'profile', 'email']
  };
  
  const handleLogin = async () => {
    try {
      const result = await authorize(config);
      // result.accessToken ile işlem yap
    } catch (error) {
      console.error('Auth error:', error);
    }
  };
  ```

## 9. CI/CD ve Sürekli Güvenlik Testleri

Sürekli entegrasyon ve dağıtım süreçlerinize güvenlik testleri eklemek, güvenlik açıklarını erken tespit etmenize yardımcı olur.

### Güvenlik Test Araçları:

- **MobSF** (Mobile Security Framework): Statik ve dinamik analiz için.
  ```bash
  # CI/CD pipeline entegrasyonu
  mobsfscan --output json --output-file mobsf-results.json /path/to/source
  ```

- **Detox**: E2E testleriyle güvenlik testlerini entegre edin.
  ```javascript
  // e2e/security.test.js
  describe('Security Tests', () => {
    it('should not allow unauthorized access to protected screen', async () => {
      await device.reloadReactNative();
      await element(by.id('navigate-to-protected')).tap();
      await expect(element(by.text('Login Required'))).toBeVisible();
    });
  });
  ```

## Sonuç

React Native uygulamalarında güvenlik ve performans optimizasyonu, sürekli gelişen bir süreçtir. Bu yazıda ele aldığımız teknikleri uygulayarak, hem güvenli hem de performanslı uygulamalar geliştirebilirsiniz.

Kod karıştırma, güvenli depolama, sertifika pinning, performans optimizasyonları ve diğer güvenlik önlemleri, her React Native projesinin önemli bileşenleri olmalıdır. Bu önlemleri projenizin başlangıcından itibaren dahil ederek, güvenlik sorunlarını önlemek ve en iyi kullanıcı deneyimini sağlamak için proaktif bir yaklaşım benimseyebilirsiniz.

Unutmayın ki, hiçbir uygulama %100 güvenli değildir. Bu yüzden güncel kalmak, yeni güvenlik tehditlerini takip etmek ve uygulamanızı sürekli olarak güvenlik testlerine tabi tutmak önemlidir.

---

*Bu yazı eğitim amaçlıdır. React Native güvenlik ve performans rehberlerini ve resmi platformlar tarafından sağlanan en güncel güvenlik önerilerini incelemenizi öneririz.*