CREATE TABLE ataques (
    id BIGSERIAL PRIMARY KEY,
    ip VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    payload VARCHAR(1024),
    tipo VARCHAR(50) NOT NULL,
    severidad VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    user_agent VARCHAR(512),
    detalles TEXT
);

CREATE INDEX idx_ataques_timestamp ON ataques(timestamp DESC);
CREATE INDEX idx_ataques_tipo ON ataques(tipo);
CREATE INDEX idx_ataques_ip ON ataques(ip);
