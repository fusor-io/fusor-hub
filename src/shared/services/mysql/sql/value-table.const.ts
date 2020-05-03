export const VALUE_TABLE = `
CREATE TABLE IF NOT EXISTS ?? (
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    value int NOT NULL DEFAULT 0,
    PRIMARY KEY (ts)
);`;

export const PARAM_TABLE = `
CREATE TABLE IF NOT EXISTS ?? (
    node CHAR(32),
    param CHAR(32),
    value float,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (node, param)
);`;

export const VALUE_TABLE_PREFIX = 'sensor_';
export const PARAM_TABLE_NAME = 'params';
