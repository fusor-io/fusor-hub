import { LIMIT_MAX_NODE_ID_LENGTH } from 'src/shared/const';

export const DEFINITIONS_TABLE = `
CREATE TABLE IF NOT EXISTS ?? (
    node CHAR(${LIMIT_MAX_NODE_ID_LENGTH}),
    definition JSON,
    version INT DEFAULT 0,
    ts TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (node)
);`;

export const DEFINITIONS_TABLE_NAME = 'definitions';
