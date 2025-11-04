# Projekt Technologii Sieciowych – „CoinBet"

## 1. Wstęp

„CoinBet" to nowoczesna aplikacja webowa symulująca system zakładów sportowych, w której użytkownicy obstawiają wyniki meczów piłkarskich przy użyciu wirtualnych monet (coinów). Celem projektu jest stworzenie środowiska przypominającego rzeczywiste platformy bukmacherskie, ale całkowicie pozbawionego ryzyka finansowego i transakcji pieniężnych.

Projekt koncentruje się na wykorzystaniu zaawansowanych technologii sieciowych, bezpiecznej integracji z bazą danych PostgreSQL oraz obsłudze aktualizacji danych w czasie rzeczywistym z wykorzystaniem zewnętrznych API sportowych.

Aplikacja została zaprojektowana z myślą o edukacji i rozrywce, oferując pełnię funkcjonalności profesjonalnych platform zakładów sportowych bez elementów hazardowych i ryzyka finansowego.

## 2. Opis Koncepcyjny

### 2.1 Główne Funkcjonalności

Aplikacja umożliwia użytkownikowi:

- **Rejestrację i logowanie** – bezpieczny system autoryzacji z wykorzystaniem JWT oraz szyfrowanych haseł
- **Przeglądanie wydarzeń sportowych** – dostęp do rozgrywek z top 5 europejskich lig piłkarskich (Premier League, La Liga, Bundesliga, Serie A, Ligue 1)
- **Obstawianie wyników** – przewidywanie wyniku meczu (zwycięzca, remis) z określoną liczbą coinów
- **Śledzenie meczów na żywo** – karuzela na żywo z bieżącymi spotkaniami
- **System nagród i odznak** – zdobywanie osiągnięć za poprawne typy i aktywność
- **Sklep z personalizacją** – możliwość zakupu awatarów, ramek, efektów wizualnych, tytułów i odznak
- **Ranking globalny** – rywalizacja z innymi graczami na podstawie liczby zdobytych coinów
- **Profile publiczne** – przeglądanie statystyk i osiągnięć innych użytkowników
- **Personalizacja profilu** – możliwość wyposażenia profilu w zakupione elementy wizualne

### 2.2 System Coinów Startowych

Każdy nowo zarejestrowany użytkownik otrzymuje **1000 coinów startowych**, które stanowią wirtualną walutę do obstawiania meczów. Coiny można zdobywać poprzez:

- Wygrane zakłady (mnożnik: 1.5x–2.5x w zależności od rodzaju zakładu)
- Codzienne logowanie (bonus aktywności)
- Zdobywanie osiągnięć i odznak
- Uczestnictwo w turniejach tygodniowych

System został zaprojektowany tak, aby użytkownik mógł przez dłuższy czas korzystać z aplikacji bez "bankructwa", a jednocześnie odczuwał wartość podejmowanych decyzji.

## 3. Technologie Sieciowe i Architektura

### 3.1 Stack Technologiczny

Projekt został zbudowany w oparciu o nowoczesne technologie webowe:

#### Frontend
- **Next.js 15** – framework React z server-side rendering i app router
- **TypeScript** – statyczne typowanie dla większej niezawodności kodu
- **Tailwind CSS** – utility-first CSS framework dla responsywnego designu
- **Shadcn UI** – komponenty UI oparte na Radix UI
- **Framer Motion** – biblioteka do płynnych animacji i przejść

#### Backend
- **Next.js API Routes** – RESTful API zbudowane w Next.js
- **Drizzle ORM** – type-safe ORM do zarządzania bazą danych
- **PostgreSQL (Neon DB)** – skalowalna baza danych w chmurze
- **JWT (jsonwebtoken)** – bezpieczna autoryzacja oparta na tokenach
- **bcryptjs** – haszowanie haseł (12 rund)

#### Integracje Zewnętrzne
- **SofaScore API** – dostawca danych sportowych w czasie rzeczywistym
- **System proxy** – własna warstwa proxy do obsługi żądań do SofaScore z pominięciem ochrony anti-bot

### 3.2 Architektura Aplikacji

Aplikacja została zaprojektowana w modelu **client-server** z następującymi warstwami:

```
┌─────────────────────────────────────────────┐
│           Frontend (Next.js Client)          │
│  - React Components                          │
│  - State Management (React Hooks)            │
│  - Client-side Routing                       │
└─────────────────┬───────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────┐
│        API Layer (Next.js API Routes)        │
│  - Authentication (JWT)                      │
│  - Business Logic                            │
│  - Validation (Zod)                          │
│  - Caching (ApiCache)                        │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐  ┌────────▼──────────┐
│  PostgreSQL DB  │  │  SofaScore API    │
│  (Neon)         │  │  (via Proxy)      │
│  - Users        │  │  - Fixtures       │
│  - Predictions  │  │  - Standings      │
│  - Shop Items   │  │  - Statistics     │
└─────────────────┘  └───────────────────┘
```

### 3.3 Aktualizacja Wyników w Czasie Rzeczywistym

Aktualizacja wyników meczów odbywa się poprzez integrację z **SofaScore API**, które dostarcza dane sportowe z minimalnym opóźnieniem:

1. **Pobieranie danych** – system okresowo odpytuje API o aktualny stan rozgrywek
2. **System cache** – implementacja wielopoziomowego cachowania (2 minuty, 1 godzina, 24 godziny) redukuje liczbę zapytań
3. **Proxy server** – własna warstwa proxy zapewnia:
   - Omijanie ochrony anti-bot SofaScore
   - Unikanie problemów z CORS
   - Centralizację logowania i obsługi błędów
4. **Automatyczna synchronizacja** – wyniki są pobierane według potrzeby podczas nawigacji użytkownika

#### Endpointy API

System wykorzystuje następujące endpointy SofaScore:
- `/sport/football/scheduled-events/{date}` – mecze zaplanowane na dany dzień
- `/api/v1/unique-tournament/{id}/seasons` – sezony dla danej ligi
- `/api/v1/unique-tournament/{id}/season/{seasonId}/standings/total` – tabela ligowa
- `/api/v1/team/{id}/statistics` – statystyki drużyny
- `/api/v1/player/{id}/transfers` – historia transferów zawodnika

## 4. System Coinów i Mechanizm Zakładów

### 4.1 Rodzaje Zakładów

Użytkownik może obstawiać wyniki meczów w trzech podstawowych kategoriach:

1. **Zwycięstwo gospodarzy** – stawka x2.2
2. **Remis** – stawka x3.0 (wyższy współczynnik ze względu na niższą częstotliwość)
3. **Zwycięstwo gości** – stawka x2.2

Każdy zakład wymaga postawienia określonej liczby coinów (minimalnie 10, maksymalnie 500).

### 4.2 Proces Obstawiania

1. Użytkownik przegląda dostępne mecze na dashboardzie
2. Klika na mecz, aby zobaczyć szczegóły
3. Wybiera przewidywany wynik (1, X, 2)
4. Określa liczbę coinów do postawienia
5. Zatwierdza zakład – coiny są natychmiast odejmowane z salda
6. Po zakończeniu meczu system automatycznie rozlicza zakład

### 4.3 Rozliczanie Zakładów

System przewiduje automatyczne rozliczanie zakładów:

```typescript
// Pseudokod logiki rozliczania
if (prediction.outcome === match.finalResult) {
  // Poprawny typ
  userCoins += prediction.amount * multiplier;
  updateUserStatistics(userId, 'win');
  checkForBadges(userId);
} else {
  // Błędny typ
  updateUserStatistics(userId, 'loss');
}
```

W przypadku:
- **Wygranej** – użytkownik otrzymuje zwrot stawki + wygraną (np. 100 coinów × 2.2 = 220 coinów)
- **Przegranej** – użytkownik traci postawione coiny
- **Meczu anulowanego** – stawka jest zwracana w całości

### 4.4 System Sklepu i Personalizacji

Aplikacja oferuje rozbudowany sklep z elementami personalizacji:

#### Kategorie Produktów

1. **Awatary** (50–200 coinów)
   - Graficzne reprezentacje użytkownika
   - Różne style i motywy piłkarskie

2. **Tła profilu** (100–500 coinów)
   - Gradienty inspirowane klubami
   - Tematyczne tła (Champions Gold, Ocean Blue, Fire Red, etc.)

3. **Ramki awatarów** (150–300 coinów)
   - Dekoracyjne obramowania
   - Efekty premium dla aktywnych graczy

4. **Efekty zwycięstwa** (200–400 coinów)
   - Animacje wyświetlane po wygranych zakładach
   - Particle effects, glow, shimmer

5. **Tytuły** (300–1000 coinów)
   - Unikalne miana wyświetlane pod nazwą użytkownika
   - "Mistrz Typowania", "Król Zakładów", etc.

6. **Odznaki** (500–2000 coinów)
   - Osiągnięcia i wyróżnienia
   - "Big Winner", "Prediction Streak", "VIP Member"

Wszystkie zakupione elementy trafiają do inwentarza użytkownika i mogą być dowolnie wyposażane lub zdejmowane z profilu.

## 5. Nagrody i System Osiągnięć

### 5.1 Typy Odznak

System odznak motywuje użytkowników do aktywności:

- **„Szczęśliwy Typer"** – 5 poprawnych zakładów z rzędu
- **„Big Winner"** – wygrana powyżej 1000 coinów w jednym zakładzie
- **„Prediction Streak"** – 10 poprawnych typów pod rząd
- **„Early Adopter"** – rejestracja we wczesnej fazie projektu
- **„Football Expert"** – 100 poprawnych typów w historii
- **„Lucky Charm"** – wygrana zakładu z współczynnikiem 3.0+
- **„VIP Member"** – posiadanie ponad 10000 coinów
- **„Top 10"** – obecność w pierwszej dziesiątce rankingu

### 5.2 Poziomy Doświadczenia

Użytkownik zdobywa punkty doświadczenia (XP) za:
- Każdy obstawiony mecz (+10 XP)
- Poprawny typ (+50 XP)
- Zdobycie odznaki (+100 XP)
- Codzienne logowanie (+5 XP)

Poziomy odblokowują specjalne nagrody i tytuły.

## 6. Model Rozgrywki Online i Ranking

### 6.1 Ranking Globalny

Aplikacja prowadzi globalny ranking użytkowników bazujący na:
- **Liczbie coinów** – podstawowe kryterium rankingowe
- **Liczbie poprawnych typów** – drugie kryterium przy równej liczbie coinów
- **Wskaźnik skuteczności** – procent wygranych zakładów

Ranking jest aktualizowany w czasie rzeczywistym i dostępny publicznie dla wszystkich użytkowników.

### 6.2 Ranking Tygodniowy

Co tydzień uruchamiany jest mini-turniej:
- Resetowanie punktów tygodniowych
- 10 najlepszych graczy otrzymuje bonus coinów (1000, 500, 250, etc.)
- Specjalne odznaki dla zwycięzców

### 6.3 Profile Publiczne

Każdy użytkownik ma publiczny profil zawierający:
- Awatar i personalizacje wizualne
- Statystyki (całkowite coiny, poprawne/błędne typy)
- Zdobyte odznaki
- Historię ostatnich zakładów
- Pozycję w rankingu

Profil można przeglądać bez logowania, co sprzyja rywalizacji społecznościowej.

## 7. Architektura Bazy Danych

### 7.1 Schemat Tabel

#### Tabela `users`
```sql
- id (SERIAL PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- password (TEXT) -- bcrypt hash
- nickname (VARCHAR)
- coins (INTEGER, DEFAULT 1000)
- ownedItems (TEXT[]) -- ID posiadanych przedmiotów
- badges (TEXT[]) -- ID zdobytych odznak
- avatar (TEXT) -- ID aktywnego awatara
- profileBackground (TEXT)
- avatarFrame (TEXT)
- victoryEffect (TEXT)
- profileTitle (TEXT)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### Tabela `predictions`
```sql
- id (SERIAL PRIMARY KEY)
- userId (INTEGER, FOREIGN KEY)
- fixtureId (INTEGER, FOREIGN KEY)
- predictedOutcome (VARCHAR) -- '1', 'X', '2'
- amount (INTEGER) -- liczba postawionych coinów
- odds (DECIMAL) -- współczynnik
- status (VARCHAR) -- 'pending', 'won', 'lost'
- createdAt (TIMESTAMP)
```

#### Tabela `fixtures`
```sql
- id (SERIAL PRIMARY KEY)
- homeTeam (VARCHAR)
- awayTeam (VARCHAR)
- startingAt (TIMESTAMP)
- league (VARCHAR)
- status (VARCHAR) -- 'scheduled', 'live', 'finished'
- homeScore (INTEGER)
- awayScore (INTEGER)
- sofascoreId (INTEGER, UNIQUE) -- ID z API SofaScore
```

### 7.2 Relacje

- Użytkownik → Predictions (1:N)
- Fixture → Predictions (1:N)
- Cascade delete: usunięcie użytkownika usuwa jego zakłady

## 8. Bezpieczeństwo i Walidacja

### 8.1 Mechanizmy Bezpieczeństwa

1. **Haszowanie haseł** – bcryptjs z 12 rundami saltingu
2. **JWT Tokens** – HttpOnly cookies z 7-dniową ważnością
3. **Middleware ochronne** – weryfikacja tokenów na chronionych trasach
4. **Walidacja danych** – Zod schemas dla wszystkich inputów użytkownika
5. **Ochrona przed SQL Injection** – Drizzle ORM z parametryzowanymi zapytaniami
6. **Rate limiting** – ochrona przed nadmiernym ruchem (gotowe do wdrożenia)
7. **CORS policy** – ograniczenie dozwolonych origin'ów
8. **XSS protection** – sanitizacja wszystkich danych wejściowych

### 8.2 Przykład Walidacji

```typescript
// Walidacja rejestracji
const registerSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string()
    .min(6, "Hasło musi mieć minimum 6 znaków")
    .max(100),
  nickname: z.string()
    .min(3, "Nickname musi mieć minimum 3 znaki")
    .max(20)
});
```

## 9. Komponenty Aplikacji

### 9.1 Network Manager (`lib/sofascore-proxy.ts`)

Odpowiada za:
- Komunikację z SofaScore API poprzez warstwę proxy
- Obsługę błędów sieciowych i retry logic
- Logowanie szczegółowych informacji debugowych
- Omijanie ochrony anti-bot z wykorzystaniem randomizowanych User-Agent

### 9.2 Match Manager (`app/api/fixtures/route.ts`)

Zarządza:
- Pobieraniem listy meczów z SofaScore
- Filtrowaniem według lig i dat
- Sortowaniem wyników
- Cache'owaniem danych w PostgreSQL dla optymalizacji

### 9.3 Bet Manager (`app/api/predictions/route.ts`)

Obsługuje:
- Tworzenie nowych zakładów
- Walidację dostępności coinów
- Zapis do bazy danych
- Rozliczanie zakładów (endpoint `/api/predictions/settle`)

### 9.4 User Manager (`lib/auth.ts`)

Przechowuje:
- Logikę rejestracji i logowania
- Generowanie i weryfikację JWT
- Pobieranie danych zalogowanego użytkownika (`getCurrentUser()`)
- Aktualizację profilu i statystyk

### 9.5 Cache Manager (`lib/cache.ts`)

System cachowania z trzema poziomami czasu życia:
```typescript
DURATIONS = {
  SHORT: 2 * 60 * 1000,      // 2 minuty (mecze live)
  LONG: 60 * 60 * 1000,      // 1 godzina (tabele)
  VERY_LONG: 24 * 60 * 60 * 1000  // 24 godziny (statystyki)
}
```

## 10. Zasady Projektowe

1. **Brak mikropłatności** – coinów nie można kupić za realne pieniądze
2. **Charakter edukacyjno-rozrywkowy** – aplikacja nie promuje hazardu
3. **Reset konta** – użytkownik może w każdej chwili zresetować postęp
4. **Architektura cloud-native** – brak serwerów dedykowanych, pełna skalowalność
5. **Responsywność** – pełna obsługa urządzeń mobilnych i desktopowych
6. **Minimalistyczny design** – inspiracja aplikacjami bukmacherskimi bez agresywnych elementów
7. **Open data** – rankingi i profile publiczne dostępne bez logowania

## 11. Struktura API Endpoints

### Autentykacja
- `POST /api/auth/register` – rejestracja nowego użytkownika
- `POST /api/auth/login` – logowanie
- `POST /api/auth/logout` – wylogowanie

### Użytkownik
- `GET /api/user/me` – dane zalogowanego użytkownika
- `GET /api/users/{id}` – publiczny profil użytkownika
- `GET /api/users/ranking` – globalny ranking

### Mecze i Ligi
- `GET /api/fixtures` – lista meczów z filtrami
- `GET /api/fixtures/{id}` – szczegóły meczu
- `GET /api/leagues` – lista dostępnych lig
- `GET /api/leagues/{id}/standings` – tabela ligowa
- `GET /api/teams/{id}/statistics` – statystyki drużyny

### Zakłady
- `GET /api/predictions` – zakłady użytkownika
- `POST /api/predictions` – nowy zakład
- `POST /api/predictions/settle` – rozliczenie zakładu (admin)

### Sklep
- `GET /api/shop` – lista przedmiotów w sklepie
- `POST /api/shop` – zakup przedmiotu
- `POST /api/shop/equip` – wyposażenie przedmiotu

### Odznaki
- `GET /api/user/badges` – zdobyte odznaki użytkownika

### Proxy
- `GET /api/proxy/sofascore` – uniwersalny proxy do SofaScore API

## 12. Podział Prac i Role

### Backend Developer
- Implementacja logiki zakładów i rozliczania
- Integracja z SofaScore API
- Konfiguracja bazy danych PostgreSQL
- System autoryzacji JWT
- Implementacja walidacji i bezpieczeństwa
- Optymalizacja cache i wydajności

### Frontend Developer
- Implementacja komponentów UI w React/Next.js
- Zarządzanie stanem aplikacji
- Integracja z API backend
- Responsywny design i animacje
- Optymalizacja UX

### UI/UX Designer
- Projekt interfejsu użytkownika
- Opracowanie systemu designu
- Tworzenie ikon, awatarów i grafik
- Prototypowanie przepływów użytkownika
- Zapewnienie spójności wizualnej

### QA Tester
- Weryfikacja poprawności synchronizacji danych
- Testowanie mechanizmu zakładów i rozliczania
- Testy bezpieczeństwa (auth, SQL injection, XSS)
- Testy wydajnościowe i obciążeniowe
- Testowanie responsywności na różnych urządzeniach

### DevOps Engineer
- Konfiguracja środowiska produkcyjnego
- CI/CD pipeline
- Monitoring i logging
- Backup bazy danych
- Optymalizacja wydajności serwera

## 13. Roadmap Rozwoju

### Faza 1: MVP (Zakończona) ✅
- System rejestracji i logowania
- Podstawowe obstawianie meczów
- Integracja z SofaScore API
- Sklep z personalizacją
- Ranking globalny

### Faza 2: Rozbudowa (W trakcie)
- System odznak i osiągnięć
- Turniejów tygodniowe
- Statystyki zaawansowane
- Powiadomienia push

### Faza 3: Social Features (Planowane)
- System znajomych
- Prywatne ligi między znajomymi
- Chat w czasie rzeczywistym
- Udostępnianie zakładów

### Faza 4: Gamifikacja (Planowane)
- System questów dziennych
- Sezonowe eventy
- Limitowane odznaki
- Tryb treningowy z AI

## 14. Wdrożenie i Hosting

### Platforma Produkcyjna
- **Vercel** – hosting aplikacji Next.js
- **Neon DB** – baza danych PostgreSQL
- **Custom domain** – własna domena (do skonfigurowania)

### Zmienne Środowiskowe
```bash
DATABASE_URL=           # Connection string do Neon DB
JWT_SECRET=             # Klucz do podpisywania JWT
NODE_ENV=production
```

### Komendy Deployment
```bash
# Build produkcyjny
npm run build

# Deploy na Vercel
vercel --prod

# Migracje bazy danych
npm run db:push
```

## 15. Metryki Sukcesu

- **Engagement** – średni czas spędzony w aplikacji > 10 minut/sesja
- **Retention** – powracający użytkownicy > 40% po 7 dniach
- **Aktywność** – średnio 5+ zakładów na aktywnego użytkownika/tydzień
- **Stabilność** – uptime > 99.5%
- **Performance** – czas ładowania strony < 2s

---

**Projekt CoinBet** łączy w sobie najlepsze praktyki tworzenia aplikacji webowych z unikalnym, angażującym modelem gamifikacji zakładów sportowych, stanowiąc doskonałe środowisko do nauki, rozrywki i rywalizacji bez ryzyka finansowego.
