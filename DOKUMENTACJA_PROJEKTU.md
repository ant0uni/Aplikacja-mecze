# Projekt – „CoinKick"
## Kompleksowa Dokumentacja Projektu

**Wersja:** 1.0  
**Ostatnia aktualizacja:** Listopad 2024  
**Status:** Gotowy do produkcji

---

## 1. Wstęp

„CoinKick" to nowoczesna aplikacja webowa symulująca system zakładów sportowych, w której użytkownicy obstawiają wyniki meczów piłkarskich oraz przewidują zwycięzców lig przy użyciu wirtualnych monet (coinów). Celem projektu jest stworzenie środowiska przypominającego rzeczywiste platformy bukmacherskie, ale całkowicie pozbawionego ryzyka finansowego i transakcji pieniężnych.

Projekt koncentruje się na wykorzystaniu zaawansowanych technologii sieciowych, bezpiecznej integracji z bazą danych PostgreSQL oraz obsłudze aktualizacji danych w czasie rzeczywistym z wykorzystaniem zewnętrznych API sportowych.

Aplikacja została zaprojektowana z myślą o edukacji i rozrywce, oferując pełnię funkcjonalności profesjonalnych platform zakładów sportowych bez elementów hazardowych i ryzyka finansowego.

### 1.1 Kluczowe Cechy

- **Brak prawdziwych pieniędzy** – wszystkie transakcje używają wirtualnych "coinów"
- **Cel edukacyjny** – nauka o przewidywaniach sportowych i statystykach
- **Gamifikacja** – zdobywanie coinów, odznak i personalizacja profilu
- **Funkcje społecznościowe** – globalny ranking i publiczne profile

---

## 2. Opis Koncepcyjny

### 2.1 Główne Funkcjonalności

Aplikacja umożliwia użytkownikowi:

- **Rejestrację i logowanie** – bezpieczny system autoryzacji z wykorzystaniem JWT oraz szyfrowanych haseł
- **Przeglądanie wydarzeń sportowych** – dostęp do rozgrywek ze wszystkich lig dostępnych w SofaScore API
- **Obstawianie wyników meczów** – przewidywanie dokładnego wyniku meczu z określoną liczbą coinów
- **Obstawianie zwycięzców lig** – długoterminowe zakłady na zespół, który wygra całą ligę
- **Śledzenie meczów na żywo** – karuzela z bieżącymi spotkaniami z auto-odświeżaniem
- **Popup wyjścia** – wyświetlanie trwających meczów gdy użytkownik próbuje opuścić stronę
- **System nagród i odznak** – automatyczne zdobywanie 6 różnych osiągnięć
- **Sklep z personalizacją** – zakup awatarów, ramek, efektów wizualnych, tytułów (50+ przedmiotów)
- **Ranking globalny** – rywalizacja z innymi graczami na podstawie liczby zdobytych coinów
- **Profile publiczne** – przeglądanie statystyk i osiągnięć innych użytkowników
- **Personalizacja profilu** – możliwość wyposażenia profilu w zakupione elementy wizualne
- **Zaawansowane filtrowanie** – filtrowanie meczów po kraju, lidze, drużynie
- **Tabele ligowe** – pełne tabele ze strefami kolorystycznymi
- **Najlepsi strzelcy** – top 20 strzelców każdej ligi
- **Statystyki H2H** – historia meczów bezpośrednich

### 2.2 System Coinów Startowych

Każdy nowo zarejestrowany użytkownik otrzymuje **100 coinów startowych**, które stanowią wirtualną walutę do obstawiania meczów i lig.

### 2.3 Algorytm Zdobywania i Tracenia Coinów

#### Zdobywanie Coinów

**1. Typowanie Meczów (Match Predictions)**
- Użytkownik stawia określoną liczbę coinów na przewidywany dokładny wynik meczu (np. 3:1)
- Minimalna stawka: **10 coinów**
- Po zakończeniu meczu następuje automatyczne lub manualne rozliczenie:
  - **Dokładne trafienie wyniku** (np. przewidział 3:1, wynik 3:1): 
    - Zwrot stawki + wygrana = `postawione coiny × 2.0`
    - Przykład: 50 coinów × 2.0 = **100 coinów wygranej** (50 coinów zwrotu + 50 coinów nagrody)
  - **Błędne trafienie**: 
    - Utrata postawionych coinów
    - Przykład: postawiono 50 coinów → **-50 coinów**

**2. Typowanie Zwycięzcy Ligi (League Predictions)**
- Użytkownik przewiduje, która drużyna wygra całą ligę (np. Premier League)
- Minimalna stawka: **10 coinów**
- Można postawić tylko **raz na daną ligę** (nie można zmienić)
- Rozliczenie następuje na koniec sezonu:
  - **Poprawne wytypowanie zwycięzcy ligi**: 
    - Zwrot stawki + wygrana = `postawione coiny × 5.0`
    - Przykład: 100 coinów × 5.0 = **500 coinów wygranej**
  - **Błędne wytypowanie**: 
    - Utrata postawionych coinów
    - Przykład: postawiono 100 coinów → **-100 coinów**

**3. Osiągnięcia i Odznaki (Badges)**

System automatycznie przyznaje odznaki za osiągnięcia:

| Odznaka | Warunek | Ikona |
|---------|---------|-------|
| Always The Winner | 10 wygranych z rzędu | 🏆 |
| Veteran Predictor | 100+ typów | 🎖️ |
| Sharpshooter | 75%+ skuteczność (min. 20 typów) | 🎯 |
| Coin Millionaire | Zdobycie 10,000+ coinów | 💰 |
| Lucky Streak | 5 wygranych z rzędu | 🍀 |
| Badge Collector | Posiadanie 5+ odznak | 📛 |

*Uwaga: Odznaki są automatycznie przyznawane po spełnieniu warunków, ale nie dają dodatkowych coinów - są tylko osiągnięciami.*

#### Tracenie Coinów

**1. Wydatki w Sklepie**

System sklepu zawiera 50+ przedmiotów w 5 kategoriach:

**Avatary (10 przedmiotów)**
- Zakres cen: 3,000 - 12,000 coinów
- Przykłady: Golden Fan (10,000), Retro Player (7,500), Seasonal Exclusive (12,000)

**Tła Profilu (10 przedmiotów)**
- Zakres cen: 5,000 - 12,000 coinów
- Przykłady: Champions Gold (12,000), Stadium Night (8,000), Ocean Blue (5,000)

**Ramki Awatara (10 przedmiotów)**
- Zakres cen: 7,000 - 15,000 coinów
- Przykłady: Diamond Elite (15,000), Golden Border (8,000), Fire Ring (7,000)

**Efekty Zwycięstwa (10 przedmiotów)**
- Zakres cen: 6,000 - 11,000 coinów
- Przykłady: Gold Rain (11,000), Fireworks (9,000), Confetti (6,000)

**Tytuły Profilowe (10 przedmiotów)**
- Zakres cen: 8,000 - 20,000 coinów
- Przykłady: "Legend" (20,000), "Champion" (18,000), "Master Predictor" (15,000)

**2. Przegrane Zakłady**
- Każdy błędny typ meczu skutkuje utratą postawionych coinów
- Każdy błędny typ zwycięzcy ligi skutkuje utratą postawionych coinów

#### Przykładowy Scenariusz

Użytkownik startuje z **100 coinami**:
1. Stawia 30 coinów na mecz Arsenal vs Chelsea (typ 2:1) → mecz kończy się 2:1 → **+60 coinów** (razem: 160)
2. Stawia 20 coinów na mecz Barcelona vs Real (typ 3:0) → mecz kończy się 2:1 → **-20 coinów** (razem: 140)
3. Zdobywa odznakę "Lucky Streak" (5 wygranych z rzędu) → **+0 coinów** (tylko osiągnięcie) (razem: 140)
4. Kupuje nowy awatar "Retro Player" za 7,500 coinów → nie stać (za mało coinów)
5. Stawia 50 coinów na zwycięzcę Premier League (Man City) → czeka na koniec sezonu
6. Kontynuuje typowanie i zbiera coiny...
7. Na koniec sezonu Man City wygrywa → **+250 coinów** (50 × 5.0) (razem: 390)
8. Kupuje awatar za 3,000 coinów → **-3,000 coinów** (potrzeba więcej wygranych)

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

Aplikacja została zaprojektowana w modelu **client-server** z trzema głównymi warstwami:

1. **Frontend (Next.js)** – interfejs użytkownika z komponentami React
2. **API Layer** – logika biznesowa, autoryzacja, walidacja
3. **Baza danych** – PostgreSQL (Neon) dla danych użytkowników i zakładów
4. **SofaScore API** – zewnętrzne źródło danych sportowych

### 3.3 Aktualizacja Wyników w Czasie Rzeczywistym

Aktualizacja wyników meczów odbywa się poprzez integrację z **SofaScore API**:

1. **Pobieranie danych** – system okresowo odpytuje API o aktualny stan rozgrywek
2. **System cache** – wielopoziomowe cachowanie redukuje liczbę zapytań
3. **Automatyczna synchronizacja** – wyniki są pobierane w czasie rzeczywistym

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

System automatycznie rozlicza zakłady po zakończeniu meczu lub sezonu ligowego:

**Zakłady Meczowe:**
- Dokładne trafienie wyniku → wygrana 2.0x stawki
- Błędny typ → utrata postawionych coinów

**Zakłady Ligowe:**
- Poprawne wytypowanie zwycięzcy → wygrana 5.0x stawki
- Błędne wytypowanie → utrata postawionych coinów

W przypadku:
- **Wygranej zakładu meczowego** – zwrot stawki + wygrana (2.0x stawki)
- **Wygranej zakładu ligowego** – zwrot stawki + wygrana (5.0x stawki)
- **Przegranej** – utrata postawionych coinów
- **Meczu anulowanego** – stawka jest zwracana w całości

### 4.5 System Sklepu i Personalizacji

Aplikacja oferuje rozbudowany sklep z elementami personalizacji:

#### Kategorie Produktów

Sklep oferuje 50+ przedmiotów w 5 kategoriach:

1. **Awatary** – zakres cen: 3,000–12,000 coinów
2. **Tła profilu** – zakres cen: 5,000–12,000 coinów
3. **Ramki awatarów** – zakres cen: 7,000–15,000 coinów
4. **Efekty zwycięstwa** – zakres cen: 6,000–11,000 coinów
5. **Tytuły profilowe** – zakres cen: 8,000–20,000 coinów

Wszystkie zakupione elementy trafiają do inwentarza użytkownika i mogą być dowolnie wyposażane lub zdejmowane z profilu.

## 5. Nagrody i System Osiągnięć

### 5.1 System Odznak

Aplikacja oferuje 6 automatycznych odznak za osiągnięcia:
- Always The Winner (10 wygranych z rzędu)
- Veteran Predictor (100+ typów)
- Sharpshooter (75%+ skuteczność)
- Coin Millionaire (10,000+ coinów)
- Lucky Streak (5 wygranych z rzędu)
- Badge Collector (5+ odznak)

Odznaki są automatycznie przyznawane i widoczne na profilu użytkownika.

## 6. Model Rozgrywki Online i Ranking

### 6.1 Ranking Globalny

Aplikacja prowadzi globalny ranking użytkowników bazujący na:
- **Liczbie coinów** – podstawowe kryterium rankingowe
- **Liczbie poprawnych typów** – drugie kryterium przy równej liczbie coinów
- **Wskaźnik skuteczności** – procent wygranych zakładów

Ranking jest aktualizowany w czasie rzeczywistym i dostępny publicznie dla wszystkich użytkowników.

### 6.2 Profile Publiczne

Każdy użytkownik ma publiczny profil zawierający:
- Awatar i personalizacje wizualne
- Statystyki (całkowite coiny, poprawne/błędne typy)
- Zdobyte odznaki
- Historię ostatnich zakładów
- Pozycję w rankingu

Profil można przeglądać bez logowania, co sprzyja rywalizacji społecznościowej.

## 7. Architektura Bazy Danych

Aplikacja wykorzystuje PostgreSQL (Neon DB) z trzema głównymi tabelami:

### 7.1 Tabele

**Tabela Users** – przechowuje dane użytkowników:
- Informacje logowania (email, hasło)
- Saldo coinów
- Posiadane przedmioty i odznaki
- Aktualnie wyposażone elementy personalizacji

**Tabela Predictions** – przechowuje zakłady:
- Typ zakładu (mecz lub liga)
- Przewidywane wyniki
- Postawione coiny
- Status rozliczenia

**Tabela Fixtures** – cache danych meczowych:
- Informacje o meczach z SofaScore
- Drużyny, wyniki, ligi
- Czasy rozpoczęcia

## 8. Bezpieczeństwo i Walidacja

### 8.1 Mechanizmy Bezpieczeństwa

1. **Haszowanie haseł** – bcryptjs z 12 rundami saltingu
2. **JWT Tokens** – HttpOnly cookies z 7-dniową ważnością
3. **Middleware ochronne** – weryfikacja tokenów na chronionych trasach
4. **Walidacja danych** – Zod schemas dla wszystkich inputów użytkownika
5. **Ochrona przed SQL Injection** – Drizzle ORM z parametryzowanymi zapytaniami
6. **Rate limiting** – ochrona przed nadmiernym ruchem (gotowe do wdrożenia)
7. **CORS policy** – ograniczenie dozwolonych origin'ów
8. **XSS protection** – sanityzacja wszystkich danych wejściowych

### 8.2 Walidacja

Wszystkie endpointy API używają schematów Zod do walidacji:
- Rejestracja: email, hasło (min. 6 znaków), nickname (3-20 znaków)
- Zakłady: weryfikacja ID meczu/ligi, kwoty (10-500 dla meczów, 50-1000 dla lig)
- Sklep: weryfikacja ID przedmiotu, dostępności coinów

## 9. Komponenty Aplikacji

### 9.1 Network Manager

Odpowiada za:
- Komunikację z SofaScore API poprzez warstwę proxy
- Obsługę błędów sieciowych i retry logic
- Logowanie szczegółowych informacji debugowych
- Omijanie ochrony anti-bot z wykorzystaniem randomizowanych User-Agent

### 9.2 Match Manager

Zarządza:
- Pobieraniem listy meczów z SofaScore
- Filtrowaniem według lig i dat
- Sortowaniem wyników
- Cache'owaniem danych w PostgreSQL dla optymalizacji

### 9.3 Bet Manager

Obsługuje:
- Tworzenie nowych zakładów
- Walidację dostępności coinów
- Zapis do bazy danych
- Rozliczanie zakładów

### 9.4 User Manager

Przechowuje:
- Logikę rejestracji i logowania
- Generowanie i weryfikację JWT
- Pobieranie danych zalogowanego użytkownika
- Aktualizację profilu i statystyk

### 9.5 Cache Manager

System cachowania z trzema poziomami czasu życia:
- SHORT (2 minuty) – mecze live
- MEDIUM (10 minut) – nadchodzące mecze
- LONG (30 minut) – dane statyczne (ligi, drużyny)

## 10. Zarządzanie Stanem i Cache

System cachowania aplikacji działa na trzech poziomach:
- SHORT (2 minuty) – mecze live
- MEDIUM (10 minut) – nadchodzące mecze
- LONG (30 minut) – dane statyczne (ligi, drużyny)
- VERY_LONG (24 godziny) – statystyki

## 11. Zasady Projektowe

1. **Brak mikropłatności** – coinów nie można kupić za realne pieniądze
2. **Charakter edukacyjno-rozrywkowy** – aplikacja nie promuje hazardu
3. **Reset konta** – użytkownik może w każdej chwili zresetować postęp
4. **Architektura cloud-native** – brak serwerów dedykowanych, pełna skalowalność
5. **Responsywność** – pełna obsługa urządzeń mobilnych i desktopowych
6. **Minimalistyczny design** – inspiracja aplikacjami bukmacherskimi bez agresywnych elementów
7. **Open data** – rankingi i profile publiczne dostępne bez logowania

## 12. Struktura API Endpoints

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

Projekt realizowany jest w modelu full-stack z podziałem na:

**Backend Developer** – API, baza danych, autoryzacja, integracja z SofaScore  
**Frontend Developer** – komponenty UI, zarządzanie stanem, responsywny design  
**UI/UX Designer** – interfejs użytkownika, system designu, grafiki  
**DevOps Engineer** – wdrożenie, monitoring, optymalizacja

## 13. Roadmap Rozwoju
- Responsywny design i animacje
- Optymalizacja UX

## 13. Roadmap Rozwoju

### Faza 1: MVP (Zakończona) ✅
- System rejestracji i logowania
- Podstawowe obstawianie meczów
- Integracja z SofaScore API
- Sklep z personalizacją
- Ranking globalny

### Faza 2: Rozbudowa (W trakcie)
- System odznak i osiągnięć
- Turnieje tygodniowe
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

### Deployment
Aplikacja wykorzystuje Next.js i może być wdrożona na platformach takich jak Vercel, Railway, lub dowolnym serwerze VPS z obsługą Node.js.

Podstawowe operacje:
- Build produkcyjny
- Migracje bazy danych (push/generate)
- Start produkcyjny

## 15. Podsumowanie

**Projekt CoinKick** łączy w sobie najlepsze praktyki tworzenia aplikacji webowych z unikalnym, angażującym modelem gamifikacji zakładów sportowych. System oferuje:

- **Typowanie meczów** – przewidywanie dokładnych wyników z współczynnikiem 2.0x
- **Typowanie lig** – długoterminowe zakłady na zwycięzców całych rozgrywek z współczynnikiem 5.0x
- **System nagród** – odznaki i osiągnięcia za aktywność
- **Personalizacja** – rozbudowany sklep z elementami wizualnymi
- **Ranking globalny** – rywalizacja z innymi graczami

Aplikacja stanowi doskonałe środowisko do nauki, rozrywki i rywalizacji bez ryzyka finansowego, oferując pełnię funkcjonalności profesjonalnych platform zakładów sportowych w bezpiecznej, edukacyjnej formie.
