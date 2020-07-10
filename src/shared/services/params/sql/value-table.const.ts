import { LIMIT_MAX_NODE_ID_LENGTH, LIMIT_MAX_SENSOR_ID_LENGTH } from 'src/shared/const';

export const LOG_TABLE_DOUBLE = `
CREATE TABLE IF NOT EXISTS \`#\` (
    ts TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    value DOUBLE NOT NULL DEFAULT 0.0,
    PRIMARY KEY (ts)
);`;

export const LOG_TABLE_INT = `
CREATE TABLE IF NOT EXISTS \`#\` (
    ts TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    value INT NOT NULL DEFAULT 0,
    PRIMARY KEY (ts)
);`;

export const PARAM_TABLE = `
CREATE TABLE IF NOT EXISTS \`#\` (
    node CHAR(${LIMIT_MAX_NODE_ID_LENGTH}),
    param CHAR(${LIMIT_MAX_SENSOR_ID_LENGTH}),
    value DOUBLE,
    logging ENUM('no','double','int') NOT NULL DEFAULT 'no',
    export ENUM('no','value','15min','30min','1hour','2hours','1day','2days','1week','10days','1month','3months','1year') NOT NULL DEFAULT 'no',
    ts TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (node, param)
);`;

export const VALUE_TABLE_PREFIX = 'log';
export const PARAM_TABLE_NAME = 'params';
