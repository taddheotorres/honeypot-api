# 🐝 Honeypot API

API señuelo que simula endpoints vulnerables para detectar y registrar intentos de ataque en tiempo real. Proyecto educativo de ciberseguridad.

## Stack

- **Backend:** Java 21, Spring Boot 3.4, JPA, H2, WebSocket
- **Frontend:** Angular 21, STOMP, SockJS
- **Infra:** Docker Compose (backend + nginx)

## Endpoints señuelo

| Método | Ruta | Ataque simulado |
|--------|------|----------------|
| POST | `/api/iniciar-sesion` | Fuerza bruta |
| GET | `/api/productos?id=` | SQL Injection |
| GET | `/api/buscar?q=` | XSS |
| GET | `/api/usuarios` | Sin autenticación |
| POST | `/api/contacto` | Otro |

## Desarrollo

```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend (otra terminal)
cd frontend
npm install
ng serve --open
```

El frontend corre en `http://localhost:4200` con proxy al backend en `8080`.

## Docker

```bash
docker compose up --build
```

Abrir `http://localhost` para ver el dashboard.

## WebSocket

El backend publica en `/tema/ataques` y `/tema/estadisticas` cada vez que se registra un ataque.
