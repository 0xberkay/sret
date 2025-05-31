# Mobil Güvenli Yazılım Geliştirme: DevSecOps Uygulamaları

DevSecOps, güvenliği yazılım geliştirme yaşam döngüsünün her aşamasına entegre etme yaklaşımıdır. Mobil projelerde nasıl uygulanacağına dair öneriler:

## 1. Planlama ve Tehdit Modelleme

- **Threat Modeling**: OWASP MASM veya Microsoft SDL metodolojileriyle erken aşamada tehdit haritaları çıkarın.  
- **Gereksinim Analizi**: Veri sınıflandırması yaparak hangi verinin ne düzeyde korunacağını belirleyin.  
- **Risk Değerlendirmesi**: CVSS puanlarına göre risk önceliklendirmesi ve mitigasyon planları oluşturun.

## 2. Otomatik Güvenlik Testleri

- **SAST (Static Application Security Testing)**  
  - Araçlar: Semgrep, MobSF, SonarQube Security, Checkmarx  
  - GitHub Actions örneği:
    ```yaml
    name: SAST
    on: [push, pull_request]
    jobs:
      semgrep:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v2
          - name: Run Semgrep
            uses: returntocorp/semgrep-action@v1
    ```
- **DAST (Dynamic Application Security Testing)**  
  - ZAP veya MobSF Dynamic ile API ve uygulama testleri  
  - Jenkins işi: Docker içinde ZAP taraması, raporu S3’e gönderme  
- **IAST (Interactive Application Security Testing)**  
  - Contrast Security, Seeker ile runtime veri akış analizleri  
- **Fuzzing**: MobSF fuzz testi veya custom HTTP mutator script’leri

## 3. Güvenlik ve Kod İnceleme

- **Kod Standartları**: OWASP Mobile Top 10 ve şirket içi güvenlik kılavuzlarına uyum.  
- **PR Kontrolleri**:  
  - Zorunlu kod incelemesi (%100 coverage, security lint)  
  - Danger veya GitHub Super-Linter ile otomatik uyarılar  
- **Statik Analiz**:  
  - SwiftLint, ESLint, detekt, lintTool CI aşamasında çalıştırılsın.  
  - Hatalı kullanım (crypto, webview) tespit eden kurallar.

## 4. Kütüphane ve Tedarik Zinciri Güvenliği

- **Bağımlılık Tarama**: `npm audit`, `yarn audit`, Snyk CLI, OWASP Dependency-Check  
- **SBOM (Software Bill of Materials)**: CycloneDX veya SPDX formatlarında otomatik SBOM üretimi  
- **Imza Doğrulama**: Maven Central PGP imzaları ve NPM package signatures kontrolü  
- **Supply Chain Attacks**: Dependabot/GitHub Dependabot alerts ile otomatik PR’ler  

## 5. Konteyner ve Sanallaştırma

- **Docker Image Hardening**:  
  - Minimal base görüntüler (Alpine, distroless)  
  - `Trivy`, `Clair` ile günlük görüntü taramaları  
- **Emülatör İzolasyonu**:  
  - Podman veya Docker içinde Android Emulator kullanımı  
  - iOS Simulator için macOS worker’ları sandbox içinde çalıştırma

## 6. Sürekli İzleme ve Bildirim

### Log Merkezi ve Olay Yakalama

- **Mobil Telemetri ve Güvenlik Logları**:  
  - Crashlytics, Firebase Analytics ve Sentry gibi araçlarla güvenlik olaylarını izleyin.
  - Özel güvenlik kategorileri oluşturun:
    ```swift
    // iOS örneği - Güvenlik olayı kaydı
    import FirebaseCrashlytics
    
    enum SecurityEventType: String {
        case invalidJWT = "SECURITY_INVALID_JWT"
        case jailbreakDetected = "SECURITY_JAILBREAK"
        case tamperDetected = "SECURITY_APP_TAMPER"
        case suspiciousNetwork = "SECURITY_SUSPICIOUS_NETWORK"
    }
    
    func logSecurityEvent(type: SecurityEventType, details: [String: Any]) {
        Crashlytics.crashlytics().setCustomValue(type.rawValue, forKey: "security_event_type")
        for (key, value) in details {
            Crashlytics.crashlytics().setCustomValue(value, forKey: key)
        }
        // Non-fatal olayı raporlama
        let error = NSError(domain: "SecurityEventDomain", 
                           code: 900, 
                           userInfo: details as? [String: NSObject])
        Crashlytics.crashlytics().record(error: error)
    }
    ```
    
    ```kotlin
    // Android örneği - Güvenlik olayı kaydı
    import com.google.firebase.crashlytics.FirebaseCrashlytics
    
    enum class SecurityEventType(val value: String) {
        INVALID_JWT("SECURITY_INVALID_JWT"),
        ROOT_DETECTED("SECURITY_ROOT"),
        TAMPER_DETECTED("SECURITY_APP_TAMPER"),
        SUSPICIOUS_NETWORK("SECURITY_SUSPICIOUS_NETWORK")
    }
    
    fun logSecurityEvent(type: SecurityEventType, details: Map<String, Any>) {
        val crashlytics = FirebaseCrashlytics.getInstance()
        crashlytics.setCustomKey("security_event_type", type.value)
        
        for ((key, value) in details) {
            when (value) {
                is String -> crashlytics.setCustomKey(key, value)
                is Int -> crashlytics.setCustomKey(key, value)
                is Boolean -> crashlytics.setCustomKey(key, value)
                else -> crashlytics.setCustomKey(key, value.toString())
            }
        }
        
        val exception = SecurityException("${type.value}: ${details["message"] ?: "No details"}")
        crashlytics.recordException(exception)
    }
    ```

- **Merkezi Log Yönetimi Sistemleri**:
  - **ELK Stack** (Elasticsearch, Logstash, Kibana) entegrasyonu:
    - Mobil uygulamadan HTTPS üzerinden Logstash'e güvenli log aktarımı
    - Log rotasyon ve saklama politikaları (GDPR uyumlu)
    - Gecikme toleranslı log gönderimi (offline-first yaklaşım)
  
  - **Splunk** entegrasyonu:
    - HTTP Event Collector (HEC) ile güvenli log aktarımı
    - Dashboard örnekleri: "Mobil Güvenlik Olayları", "API Erişim Denetimleri"
    - SPL (Splunk Processing Language) ile güvenlik insight'ları
  
  - **Datadog** APM ve Log entegrasyonu:
    - Real User Monitoring (RUM) ile güvenlik ve performans korelasyonu
    - Anormal davranış tespiti ve ilgili logları yakalama
    - Mobil SDK için düşük-overhead konfigürasyonu

### SIEM & SOAR Entegrasyonları

- **SIEM (Security Information and Event Management) Entegrasyonları**:
  - **IBM QRadar** entegrasyonu:
    - Universal DSM yapılandırması ile mobil güvenlik olaylarını tanımlama
    - QRadar API ile otomatik olay kategorileme ve zenginleştirme
    - Korelasyon kuralları:
      ```
      # QRadar Korelasyon Kuralı Örneği - Jailbreak Tespiti + Hassas İşlem
      (eventCategory='SECURITY_JAILBREAK' OR eventCategory='SECURITY_ROOT') 
      AND applicationName='YourMobileApp' 
      AND (activityType='PAYMENT' OR activityType='LOGIN' OR activityType='DATA_EXPORT')
      ```
  
  - **Splunk Enterprise Security** entegrasyonu:
    - Notable Events yapılandırması
    - Risk skorlama framework'ü ile mobil güvenlik olaylarını derecelendirme
    - Gerçek zamanlı korelasyon ile potansiyel tehditleri belirleme
  
  - **Microsoft Sentinel** entegrasyonu:
    - Log Analytics workspace konfigürasyonu
    - Kusto Query Language (KQL) ile tehdit algılama sorgularını oluşturma:
      ```kql
      // Microsoft Sentinel KQL örneği - Şüpheli Mobil Aktivite Analizi
      MobileAppEvents
      | where EventType == "SECURITY_SUSPICIOUS_NETWORK" or EventType == "SECURITY_INVALID_JWT"
      | extend UserId = tostring(parse_json(EventProperties).user_id)
      | extend DeviceId = tostring(parse_json(EventProperties).device_id)
      | extend NetworkInfo = tostring(parse_json(EventProperties).network_info)
      | summarize SuspiciousCount=count() by UserId, DeviceId, bin(TimeGenerated, 1h)
      | where SuspiciousCount > 5
      ```

- **SOAR (Security Orchestration, Automation and Response) Entegrasyonu**:
  - **Palo Alto XSOAR** (eski Demisto) playbook örnekleri:
    - Olay sınıflandırma ve önceliklendirme otomasyonu
    - Etkilenen kullanıcıların tespiti ve geçici erişim kısıtlaması
    - Olay yanıt ekibinin mobilizasyonu ve iletişim protokolleri

  - **Swimlane** ile iş akışı otomasyonu:
    - Mobil security incident'larını otomatik triaj etme
    - Case yönetimi ve dokümantasyon
    - Post-incident analiz ve öğrenilen dersler

  - **Playbook Örnekleri**:
    ```yaml
    # Otomatikleştirilmiş Yanıt Playbook Yapısı
    name: Mobile_Security_Incident_Response
    description: Suspicious activity detected in mobile applications
    triggers:
      - type: security_event
        conditions:
          - field: event_type
            operator: equals
            value: SECURITY_SUSPICIOUS_NETWORK
    
    actions:
      - name: Enrich_User_Context
        module: identity_provider
        parameters:
          user_id: ${event.user_id}
          fetch: [groups, last_login, location_history]
    
      - name: Risk_Assessment
        module: risk_engine
        parameters:
          user_data: ${steps.Enrich_User_Context.output}
          event_data: ${event}
        
      - name: Notification_Decision
        condition: ${steps.Risk_Assessment.risk_score} > 70
        actions:
          - name: Alert_Security_Team
            module: communication
            parameters:
              channel: slack
              room: security-alerts
              message: "High risk mobile security event detected: ${event.type} for user ${event.user_id} with risk score ${steps.Risk_Assessment.risk_score}"
              
          - name: Create_Incident_Ticket
            module: jira
            parameters:
              project: SEC
              issue_type: Incident
              summary: "Mobile Security Incident: ${event.type}"
              description: "User: ${event.user_id}\nDevice: ${event.device_id}\nRisk Score: ${steps.Risk_Assessment.risk_score}\nDetails: ${event.details}"
              priority: High
    ```

- **Otomatik Tetikleme ve Notifikasyon Kanalları**:
  - **PagerDuty** entegrasyonu:
    - Severity tabanlı incident oluşturma ve rotasyon yönetimi
    - SLA izleme ve eskalasyon politikaları
    - Post-mortem rapor otomasyonu

  - **Slack/Teams** güvenlik kanalları entegrasyonu:
    - Formatlı ve kategorize edilmiş güvenlik olayı bildirimleri:
    ```json
    {
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "🚨 Mobil Güvenlik Alarmı"
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Olay Tipi:*\nGüvenlik İhlali Şüphesi"
            },
            {
              "type": "mrkdwn",
              "text": "*Risk Skoru:*\n85/100 (Kritik)"
            },
            {
              "type": "mrkdwn",
              "text": "*Etkilenen Kullanıcı:*\nuser123@example.com"
            },
            {
              "type": "mrkdwn",
              "text": "*Etkilenen Cihaz:*\niPhone 13, iOS 16.2"
            }
          ]
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Detaylar:* Cihazda root tespiti sonrasında API erişimi denemesi tespit edildi."
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Olayı Görüntüle"
              },
              "url": "https://securityconsole.example.org/incidents/12345",
              "style": "primary"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Kullanıcıyı Engelle"
              },
              "style": "danger",
              "value": "block_user_123"
            }
          ]
        }
      ]
    }
    ```
  
  - **E-posta Bildirimleri**:
    - HTML formatlı template'ler ve risk seviyesi kodlaması
    - Alıcı gruplandırma ve eskalasyon zincirleri
    - İnteraktif eylem butonları ve deep linking

### Kullanıcı Geribildirim Mekanizmaları

- **Güvenlik Olay Bildirimleri**:
  - Özel bug bounty programı ve vulnerability disclosure policy (VDP)
  - Mobil uygulama içi güvenlik geri bildirim formu:
    ```swift
    // iOS - Güvenlik bildirim form yapısı
    struct SecurityReport {
        let reportType: String // "vulnerability", "suspicious_activity", "phishing"
        let description: String
        let screenshotData: Data?
        let contactEmail: String?
        let deviceInfo: [String: String]
    }
    ```

- **Beta Test ve Erken Uyarı Sistemi**:
  - **Google Play Console** beta testing ve staged rollouts
    - Güvenlik odaklı test grupları ve geri bildirim toplama
    - Aşamalı dağıtım ile güvenlik sorunlarını izole etme
  
  - **TestFlight** güvenlik odaklı test grupları:
    - Dahili ve harici test grupları için özelleştirilmiş build'ler
    - Güvenlik feedback'i için özel anketler ve raporlama
  
  - **Firebase App Distribution** ile kontrollü dağıtım:
    - Farklı güvenlik profilleri için build varyasyonları
    - A/B testleri ile güvenlik önlemlerinin etkinliğini ölçme

- **Feedback SDK'ları ve Entegrasyonları**:
  - **Instabug** ile kullanıcı bildirimleri:
    ```java
    // Android - Instabug entegrasyonu
    new Instabug.Builder(this, "YOUR_INSTABUG_TOKEN")
        .setInvocationEvents(InstabugInvocationEvent.SHAKE, InstabugInvocationEvent.SCREENSHOT)
        .setReportCategories("Performans", "Çökme", "Güvenlik Endişesi", "Diğer")
        .build();
    
    // Güvenlik olayında Instabug'ı programatik tetiklemek için
    Map<String, String> securityData = new HashMap<>();
    securityData.put("event_type", "security_concern");
    securityData.put("timestamp", System.currentTimeMillis() + "");
    Instabug.reportIssue("Güvenlik İhlali Şüphesi", securityData);
    ```
  
  - **UserVoice** ile güvenlik endişelerini toplama:
    - Tema-bazlı feedback kategorileri
    - Güvenlik insight'ları için oylanabilir özellikler
  
  - **Özel Hackerone/BugCrowd** entegrasyonları:
    - Responsible disclosure programı
    - Güvenlik araştırmacıları ağı ve ödüllendirme sistemi

### Sürekli Güvenlik Analizi ve Performans Korelasyonu

- **Trend Analizi ve Raporlama**:
  - Haftalık güvenlik olayı trend raporları
  - Korelasyon analizi: Güvenlik olayları vs. uygulama sürümleri/özellikleri
  - Endüstri kıyaslama (benchmarking)

- **Real-User Security Monitoring (RUSM)**:
  - Kullanıcı davranışı anomali tespiti
  - Sürekli kimlik doğrulama ve risk tabanlı erişim kontrolleri
  - Milisaniye cinsinden güvenlik olayı tespiti ve yanıt süresi takibi

## 7. Sürekli Eğitim ve Güvenlik Kültürü

- **DevSecOps Eğitimleri**: OWASP Mobile, Threat Modeling workshop’ları  
- **Hackathon / Capture The Flag** yarışmaları  
- **Güvenlik Sahnesi**: Haftalık kısa güvenlik bültenleri, Slack kanal bildirimleri  
- **Görev Rotasyonu**: Geliştirici–güvenlik ekibi eşleştirme (pair-programming)

## Sonuç

DevSecOps ile mobil uygulama geliştirme sürecine güvenlik odaklı adımlar ekleyerek, riskleri azaltabilir ve kaliteli yazılımlar üretebilirsiniz. Otomasyon, izleme ve iş birliği DevSecOps'un temel taşlarıdır.

---

*Bu yazı eğitim amaçlıdır. DevSecOps uygulamaları ve araçları hakkında daha fazla bilgi için resmi kaynakları inceleyin.*