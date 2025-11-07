# Projekt Technologii Sieciowych – „CoinKick"

## 1. Wstęp

„CoinKick" to nowoczesna aplikacja webowa symulująca system zakładów sportowych, w której użytkownicy obstawiają wyniki meczów piłkarskich oraz przewidują zwycięzców lig przy użyciu wirtualnych monet (coinów). Celem projektu jest stworzenie środowiska przypominającego rzeczywiste platformy bukmacherskie, ale całkowicie pozbawionego ryzyka finansowego i transakcji pieniężnych.

Projekt koncentruje się na wykorzystaniu zaawansowanych technologii sieciowych, bezpiecznej integracji z bazą danych PostgreSQL oraz obsłudze aktualizacji danych w czasie rzeczywistym z wykorzystaniem zewnętrznych API sportowych.

Aplikacja została zaprojektowana z myślą o edukacji i rozrywce, oferując pełnię funkcjonalności profesjonalnych platform zakładów sportowych bez elementów hazardowych i ryzyka finansowego.

## 2. Opis Koncepcyjny

### 2.1 Główne Funkcjonalności

Aplikacja umożliwia użytkownikowi:

- **Rejestrację i logowanie** – bezpieczny system autoryzacji z wykorzystaniem JWT oraz szyfrowanych haseł
- **Przeglądanie wydarzeń sportowych** – dostęp do rozgrywek z top 5 europejskich lig piłkarskich (Premier League, La Liga, Bundesliga, Serie A, Ligue 1)
- **Obstawianie wyników meczów** – przewidywanie dokładnego wyniku meczu z określoną liczbą coinów
- **Obstawianie zwycięzców lig** – długoterminowe zakłady na zespół, który wygra całą ligę
- **Śledzenie meczów na żywo** – karuzela na żywo z bieżącymi spotkaniami
- **System nagród i odznak** – zdobywanie osiągnięć za poprawne typy i aktywność
- **Sklep z personalizacją** – możliwość zakupu awatarów, ramek, efektów wizualnych, tytułów i odznak
- **Ranking globalny** – rywalizacja z innymi graczami na podstawie liczby zdobytych coinów
- **Profile publiczne** – przeglądanie statystyk i osiągnięć innych użytkowników
- **Personalizacja profilu** – możliwość wyposażenia profilu w zakupione elementy wizualne

### 2.2 System Coinów Startowych

Każdy nowo zarejestrowany użytkownik otrzymuje **100 coinów startowych**, które stanowią wirtualną walutę do obstawiania meczów i lig.

### 2.3 Algorytm Zdobywania i Tracenia Coinów

#### Zdobywanie Coinów

**1. Typowanie Meczów (Predictions)**
- Użytkownik stawia określoną liczbę coinów na przewidywany wynik meczu (np. 3:1)
- Po zakończeniu meczu następuje automatyczne rozliczenie:
  - **Dokładne trafienie wyniku** (np. przewidział 3:1, wynik 3:1): 
    - Zwrot stawki + wygrana = `postawione coiny × 2.0`
    - Przykład: 50 coinów × 2.0 = **100 coinów wygranej**
  - **Błędne trafienie**: 
    - Utrata postawionych coinów
    - Przykład: postawiono 50 coinów → **-50 coinów**

**2. Typowanie Zwycięzcy Ligi**
- Użytkownik przewiduje, która drużyna wygra całą ligę (np. Premier League)
- Można postawić tylko raz na daną ligę
- Rozliczenie następuje na koniec sezonu:
  - **Poprawne wytypowanie zwycięzcy ligi**: 
    - Zwrot stawki + wygrana = `postawione coiny × 5.0`
    - Przykład: 100 coinów × 5.0 = **500 coinów wygranej**
  - **Błędne wytypowanie**: 
    - Utrata postawionych coinów
    - Przykład: postawiono 100 coinów → **-100 coinów**

**3. Osiągnięcia i Odznaki**
- Zdobycie odznaki: **+50 coinów**
- Seria 5 poprawnych typów: **+100 coinów (odznaka "Szczęśliwy Typer")**
- Seria 10 poprawnych typów: **+250 coinów (odznaka "Prediction Streak")**
- 100 poprawnych typów w historii: **+500 coinów (odznaka "Football Expert")**

#### Tracenie Coinów

**1. Wydatki w Sklepie**
- Zakup awatarów: **-50 do -200 coinów**
- Zakup teł profilu: **-100 do -500 coinów**
- Zakup ramek: **-150 do -300 coinów**
- Zakup efektów zwycięstwa: **-200 do -400 coinów**
- Zakup tytułów: **-300 do -1000 coinów**
- Zakup odznak: **-500 do -2000 coinów**

**2. Przegrane Zakłady**
- Każdy błędny typ meczu skutkuje utratą postawionych coinów
- Każdy błędny typ zwycięzcy ligi skutkuje utratą postawionych coinów

#### Przykładowy Scenariusz

Użytkownik startuje z **100 coinami**:
1. Stawia 30 coinów na mecz Arsenal vs Chelsea (typ 2:1) → mecz kończy się 2:1 → **+60 coinów** (razem: 130)
2. Stawia 20 coinów na mecz Barcelona vs Real (typ 3:0) → mecz kończy się 2:1 → **-20 coinów** (razem: 110)
3. Zdobywa odznakę "Pierwszy Typ" → **+50 coinów** (razem: 160)
4. Kupuje nowy awatar za 80 coinów → **-80 coinów** (razem: 80)
5. Stawia 50 coinów na zwycięzcę Premier League (Man City) → czeka na koniec sezonu
6. Na koniec sezonu Man City wygrywa → **+250 coinów** (50 × 5.0) (razem: 330)

System został zaprojektowany tak, aby użytkownik mógł przez dłuższy czas korzystać z aplikacji, a jednocześnie odczuwał wartość podejmowanych decyzji.

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

#### Zakłady na Mecze
Użytkownik może typować dokładny wynik meczu (np. 2:1, 3:0, 1:1):
- Postawienie coinów na przewidywany dokładny wynik
- Minimalna stawka: **10 coinów**
- Maksymalna stawka: **500 coinów**
- Współczynnik wygranej: **2.0x** (dokładne trafienie)

#### Zakłady na Zwycięzców Lig
Użytkownik może typować, która drużyna wygra całą ligę:
- Dostępne dla wszystkich głównych lig (Premier League, La Liga, Bundesliga, etc.)
- Można postawić tylko **raz na daną ligę**
- Minimalna stawka: **50 coinów**
- Maksymalna stawka: **1000 coinów**
- Współczynnik wygranej: **5.0x** (poprawne wytypowanie)
- Rozliczenie następuje automatycznie po zakończeniu sezonu

### 4.2 Proces Obstawiania Meczów

1. Użytkownik przegląda dostępne mecze na dashboardzie
2. Klika na mecz, aby zobaczyć szczegóły
3. Otwiera dialog przewidywania
4. Wybiera przewidywany dokładny wynik (np. 2:1)
5. Określa liczbę coinów do postawienia
6. Zatwierdza zakład – coiny są natychmiast odejmowane z salda
7. Po zakończeniu meczu system automatycznie rozlicza zakład

### 4.3 Proces Obstawiania Zwycięzcy Ligi

1. Użytkownik wchodzi na stronę ligi (np. Premier League)
2. Przegląda tabelę i drużyny
3. Klika przycisk "Predict Winner" (Przewiduj Zwycięzcę)
4. Wybiera drużynę z listy (z funkcją wyszukiwania)
5. Określa liczbę coinów do postawienia
6. Zatwierdza zakład – coiny są natychmiast odejmowane z salda
7. Zakład jest widoczny w profilu jako "Pending" do końca sezonu

### 4.4 Rozliczanie Zakładów

System automatycznie rozlicza zakłady zgodnie z następującą logiką:

**Rozliczanie Zakładów Meczowych:**
```typescript
// Automatyczne rozliczanie po zakończeniu meczu
if (prediction.predictedHomeScore === match.homeScore && 
    prediction.predictedAwayScore === match.awayScore) {
  // Dokładne trafienie wyniku
  const winAmount = prediction.coinsWagered * 2.0;
  userCoins += winAmount;
  prediction.status = 'won';
  prediction.coinsWon = winAmount;
} else {
  // Błędny typ
  prediction.status = 'lost';
  prediction.coinsWon = 0;
}
```

**Rozliczanie Zakładów Ligowych:**
```typescript
// Automatyczne rozliczanie po zakończeniu sezonu
if (prediction.predictedWinnerId === league.championTeamId) {
  // Poprawne wytypowanie zwycięzcy
  const winAmount = prediction.coinsWagered * 5.0;
  userCoins += winAmount;
  prediction.status = 'won';
  prediction.coinsWon = winAmount;
} else {
  // Błędne wytypowanie
  prediction.status = 'lost';
  prediction.coinsWon = 0;
}
```

W przypadku:
- **Wygranej zakładu meczowego** – zwrot stawki + wygrana (2.0x stawki)
- **Wygranej zakładu ligowego** – zwrot stawki + wygrana (5.0x stawki)
- **Przegranej** – utrata postawionych coinów
- **Meczu anulowanego** – stawka jest zwracana w całości

### 4.5 System Sklepu i Personalizacji

Aplikacja oferuje rozbudowany sklep z elementami personalizacji:

#### Kategorie Produktów i Ceny

1. **Awatary** (50–200 coinów)
   - `default` – Domyślny (darmowy)
   - `golden-ball` – Złota Piłka (100 coinów)
   - `champion` – Mistrz (150 coinów)
   - `legend` – Legenda (200 coinów)

2. **Tła profilu** (100–500 coinów)
   - `default` – Domyślne (darmowe)
   - `champions-gold` – Champions Gold (200 coinów)
   - `ocean-blue` – Ocean Blue (150 coinów)
   - `fire-red` – Fire Red (250 coinów)
   - `emerald-green` – Emerald Green (200 coinów)
   - `royal-purple` – Royal Purple (300 coinów)

3. **Ramki awatarów** (150–300 coinów)
   - `none` – Brak (darmowa)
   - `gold-frame` – Złota Ramka (200 coinów)
   - `diamond-frame` – Diamentowa Ramka (300 coinów)
   - `fire-frame` – Ognista Ramka (250 coinów)

4. **Efekty zwycięstwa** (200–400 coinów)
   - `none` – Brak (darmowy)
   - `sparkle` – Iskry (250 coinów)
   - `confetti` – Konfetti (300 coinów)
   - `fireworks` – Fajerwerki (400 coinów)

5. **Tytuły** (300–1000 coinów)
   - `prediction-master` – Mistrz Typowania (500 coinów)
   - `bet-king` – Król Zakładów (800 coinów)
   - `legend-status` – Status Legendy (1000 coinów)

6. **Odznaki** (500–2000 coinów)
   - `big-winner` – Wielki Zwycięzca (1000 coinów)
   - `streak-master` – Mistrz Serii (1500 coinów)
   - `vip-member` – Członek VIP (2000 coinów)

Wszystkie zakupione elementy trafiają do inwentarza użytkownika (`ownedItems`) i mogą być dowolnie wyposażane lub zdejmowane z profilu.

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
- predictionType (VARCHAR) -- 'match' lub 'league'
-- Dla zakładów meczowych:
- fixtureId (INTEGER, FOREIGN KEY, nullable)
- fixtureApiId (INTEGER, nullable)
- predictedHomeScore (INTEGER, nullable)
- predictedAwayScore (INTEGER, nullable)
-- Dla zakładów ligowych:
- leagueId (INTEGER, nullable)
- leagueName (TEXT, nullable)
- predictedWinnerId (INTEGER, nullable)
- predictedWinnerName (TEXT, nullable)
- predictedWinnerLogo (TEXT, nullable)
-- Wspólne pola:
- coinsWagered (INTEGER) -- liczba postawionych coinów
- coinsWon (INTEGER, DEFAULT 0) -- wygrana
- verdict (VARCHAR) -- 'pending', 'win', 'lose'
- isSettled (BOOLEAN) -- czy rozliczony
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### Tabela `fixtures`
```sql
- id (SERIAL PRIMARY KEY)
- apiId (INTEGER, UNIQUE) -- SofaScore ID
- homeTeamId (INTEGER)
- homeTeamName (TEXT)
- homeTeamLogo (TEXT)
- awayTeamId (INTEGER)
- awayTeamName (TEXT)
- awayTeamLogo (TEXT)
- startingAt (TIMESTAMP)
- leagueId (INTEGER)
- leagueName (TEXT)
- seasonId (INTEGER)
- stateName (VARCHAR) -- 'NS', 'LIVE', 'FT'
- homeScore (INTEGER, nullable)
- awayScore (INTEGER, nullable)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
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
- `GET /api/predictions` – zakłady użytkownika (meczowe i ligowe)
- `POST /api/predictions` – nowy zakład (match lub league type)
  - Dla zakładu meczowego: `{ predictionType: "match", fixtureApiId, predictedHomeScore, predictedAwayScore, coinsWagered }`
  - Dla zakładu ligowego: `{ predictionType: "league", leagueId, leagueName, predictedWinnerId, predictedWinnerName, predictedWinnerLogo, coinsWagered }`
- `POST /api/predictions/settle` – rozliczenie zakładów (automatyczne)

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
- **Neon DB** – serverless baza danych PostgreSQL w chmurze
  - Automatyczne backupy
  - Skalowanie na żądanie
  - Bezpieczne połączenie SSL
  - Region: AWS (configurable)

### Komendy Deployment
```bash
# Build produkcyjny
npm run build

# Migracje bazy danych
npm run db:push

# Generowanie migracji
npm run db:generate

# Start produkcyjny
npm start
```

## 15. Podsumowanie

**Projekt CoinKick** łączy w sobie najlepsze praktyki tworzenia aplikacji webowych z unikalnym, angażującym modelem gamifikacji zakładów sportowych. System oferuje:

- **Typowanie meczów** – przewidywanie dokładnych wyników z współczynnikiem 2.0x
- **Typowanie lig** – długoterminowe zakłady na zwycięzców całych rozgrywek z współczynnikiem 5.0x
- **System nagród** – odznaki i osiągnięcia za aktywność
- **Personalizacja** – rozbudowany sklep z elementami wizualnymi
- **Ranking globalny** – rywalizacja z innymi graczami

Aplikacja stanowi doskonałe środowisko do nauki, rozrywki i rywalizacji bez ryzyka finansowego, oferując pełnię funkcjonalności profesjonalnych platform zakładów sportowych w bezpiecznej, edukacyjnej formie.
