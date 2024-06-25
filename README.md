# Projekt klon X/Twitter

### Wymagane zmienne środowiskowe

- `DB_CONNECTION_STRING` - string wymagany do połączenia z bazą postgres w formacie `postgres[ql]://[username[:password]@][host[:port],]/database`
- `SESSION_LENGTH` - długość ważności tokena JWT w ms
- `SECRET` - klucz prywatny, wykorzystywany do enkrypcji JWT
- `NODE_ENV` - w trybie production express obsluguje statyczne pliki frontendu

### Komendy do uruchomienia projektu

- npm install
- npm start

### Przykładowy pipeline CI/CD

- npm install
- npm run test
- npm run build
- NODE_ENV=production && node dist/index.js
