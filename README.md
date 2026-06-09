# Honeypot API

API señuelo que simula endpoints vulnerables para detectar y registrar intentos de ataque en tiempo real.

## Stack

- **Backend:** Java 21, Spring Boot 3.4, JPA, H2/PostgreSQL, WebSocket (STOMP)
- **Frontend:** Angular 21, STOMP, SockJS
- **Infra:** Docker Compose, nginx
- **Testing:** JUnit 5, Mockito, Vitest
- **CI/CD:** GitHub Actions

## Endpoints señuelo

| Método | Ruta | Ataque simulado |
|--------|------|----------------|
| POST | `/api/iniciar-sesion` | Fuerza bruta |
| GET | `/api/productos?id=` | SQL Injection |
| GET | `/api/buscar?q=` | XSS |
| GET | `/api/usuarios` | Sin autenticación |
| POST | `/api/contacto` | Otro |
| POST | `/api/simular?tipo=` | Simulación manual |

## Perfiles

| Perfil | Base de datos | Uso |
|--------|---------------|-----|
| `dev` (default) | H2 en memoria | Desarrollo local sin dependencias externas |
| `prod` | PostgreSQL 17 | Producción con datos persistentes |

```bash
# Dev (H2)
mvn spring-boot:run

# Prod (PostgreSQL)
SPRING_PROFILES_ACTIVE=prod mvn spring-boot:run
```

## Desarrollo

```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend (otra terminal)
cd frontend
npm install
ng serve
```

El frontend corre en `http://localhost:4200` con proxy al backend en `8080`.

## Docker

```bash
docker compose up --build
```

Incluye PostgreSQL 17 persistente, backend con perfil `prod` y frontend servido por nginx. Abrir `http://localhost`.

## Tests

```bash
# Backend (24 tests)
cd backend && mvn test

# Frontend (11 tests)
cd frontend && npm test
```

## WebSocket

El backend publica en `/tema/ataques` y `/tema/estadisticas` cada vez que se registra un ataque. Endpoint SockJS en `/ws`.
