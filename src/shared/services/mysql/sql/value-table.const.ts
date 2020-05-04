import { LIMIT_MAX_NODE_ID_LENGTH, LIMIT_MAX_SENSOR_ID_LENGTH } from 'src/shared/const';

export const VALUE_TABLE = `
CREATE TABLE IF NOT EXISTS ?? (
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    value int NOT NULL DEFAULT 0,
    PRIMARY KEY (ts)
);`;

export const PARAM_TABLE = `
CREATE TABLE IF NOT EXISTS ?? (
    node CHAR(${LIMIT_MAX_NODE_ID_LENGTH}),
    param CHAR(${LIMIT_MAX_SENSOR_ID_LENGTH}),
    value float,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (node, param)
);`;

export const VALUE_TABLE_PREFIX = 'sensor';
export const PARAM_TABLE_NAME = 'params';
