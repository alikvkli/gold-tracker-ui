# Gold Tracker API Documentation

Bu döküman, Gold Tracker mobil uygulamasının önyüz geliştirmesi için referans olması amacıyla hazırlanmıştır. Tüm API istekleri `/api` prefix'i ile yapılmalıdır.

---

## Genel Bilgiler

- **Base URL:** `https://altin.kiracilarim.com/api`
- **İçerik Tipi:** `application/json`
- **Kimlik Doğrulama:** Bearer Token (Sanctum)

---

## 1. Kimlik Doğrulama (Authentication)

### Kayıt Ol (Register)
Yeni bir kullanıcı oluşturur.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Request Body:**
```json
{
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "onesignal_id": "optional-uuid"
}
```
- **Response (200 OK):**
```json
{
    "user": {
        "user_id": 1,
        "name": "John",
        "surname": "Doe",
        "email": "john@example.com",
        "onesignal_id": "optional-uuid",
        "encrypted": false
    },
    "token": "1|abcdef123456..."
}
```

### Giriş Yap (Login)
Kullanıcı girişi yapar ve token döndürür.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123",
    "onesignal_id": "optional-uuid"
}
```
- **Response (200 OK):**
```json
{
    "user": { ... },
    "token": "..."
}
```

### Şifremi Unuttum (Forgot Password)
Belirtilen e-posta adresine 5 haneli doğrulama kodu gönderir.

- **URL:** `/auth/forgot-password`
- **Method:** `POST`
- **Request Body:**
```json
{
    "email": "john@example.com"
}
```

### Şifre Sıfırla (Reset Password)
E-posta ile gelen kod ile şifreyi sıfırlar.

- **URL:** `/auth/reset-password`
- **Method:** `POST`
- **Request Body:**
```json
{
    "verification_code": "12345",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

---

## 2. Kullanıcı İşlemleri (Giriş Gereklidir)

> **Header:** `Authorization: Bearer <token>`

### Şifre Değiştir (Change Password)
Oturum açmış kullanıcının şifresini günceller.

- **URL:** `/auth/change-password`
- **Method:** `POST`
- **Request Body:**
```json
{
    "current_password": "oldpassword123",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

### Hesap Sil (Delete Account)
Kullanıcı hesabını ve tüm verilerini siler.

- **URL:** `/auth/delete-account`
- **Method:** `DELETE`
- **Request Body:**
```json
{
    "password": "password123"
}
```

### Şifreleme/Anonimlik Ayarı (Toggle Encryption)
Varlık sahipliğinin anonimleştirilmesini sağlar.

- **URL:** `/auth/encryption/toggle`
- **Method:** `POST`
- **Request Body:**
```json
{
    "status": true,
    "password": "encryption-password"
}
```
> [!IMPORTANT]
> Şifreleme aktif edildiğinde, artık varlık işlemlerinde `X-Encryption-Key` header'ı gönderilmelidir.

---

## 3. Kur Bilgileri (Currencies)

### Altın Kurlarını Listele
Sadece altın tipi kurları döndürür.

- **URL:** `/currencies`
- **Method:** `GET`
- **Response (200 OK):**
```json
[
    {
        "id": 1,
        "code": "gram_altin",
        "name": "Gram Altın",
        "type": "Altın",
        "buying": "5897.7000",
        "selling": "5898.4900",
        "last_updated_at": "2025-12-13 09:00:51"
    },
    ...
]
```

---

## 4. Varlıklarım (Assets)

> [!NOTE]
> Kullanıcının hesabı şifreli ise, isteklerde `X-Encryption-Key: <encryption-password>` header'ı bulunmalıdır.

### Varlıkları Listele (Paginated)
Kullanıcının sahip olduğu varlık geçmişini listeler.

- **URL:** `/assets?page=1`
- **Method:** `GET`
- **Response (200 OK):**
```json
{
    "data": [
        {
            "id": 1,
            "currency_id": 1,
            "type": "buy",
            "amount": "10.0000",
            "price": "5000.0000",
            "date": "2025-12-13",
            "place": "Banka x",
            "note": "Açıklama",
            "currency": { "id": 1, "name": "Gram Altın", "code": "gram_altin" }
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 20,
        "total": 100
    }
}
```

### Varlık Ekle (Alım/Satım)
Yeni bir alım veya satım kaydı ekler.

- **URL:** `/assets`
- **Method:** `POST`
- **Request Body:**
```json
{
    "currency_id": 1,
    "type": "buy",
    "amount": 2.5,
    "price": 5800.0,
    "date": "2025-12-13",
    "place": "Kuyumcu",
    "note": "Yatırımlık"
}
```
> [!WARNING]
> Satış (`type: "sell"`) işlemlerinde, kullanıcının o kurda yeterli bakiyesi olmalıdır. Aksi halde 422 hatası döner.

### Varlık Sil
Belirtilen varlık kaydını siler.

- **URL:** `/assets/{id}`
- **Method:** `DELETE`

---

## 5. Hata Yapısı (Common Error Response)

Doğrulama hataları veya diğer hatalar genellikle aşağıdaki yapıda döner:

- **Validation Error (400 or 422):**
```json
{
    "errors": [
        "Lütfen e-posta adresinizi giriniz.",
        "Şifreniz en az 6 karakter olmalıdır."
    ]
}
```
- **Unauthorized (401):** Token geçersiz veya eksik.
- **Forbidden (403):** Başka bir kullanıcıya ait varlık silinmeye çalışıldığında.
