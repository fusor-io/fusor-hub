## ROADMAP

- Accept blobs
- Build client library
- MQTT support. Subscribe and Emit messages.
- Log cutoff time. Cleanup older records.

## Components

Fusor Node StateMachine (C++ Arduino library) - v1.0

- JSON based configuration to run State Machine on IOT node (eg. ESP series) +

Fusor Node Connector (C++ Arduino library) - v1.0

- provides connectivity to Fusor Hub +

Fusor Node Configurator (C++ Arduino library) - v1.0

- provides basic web server for Node configuration over browser (WiFi settings, etc.) +

Fusor Node Lora, Plugin for Fusor StateMachine (C++ Arduino library)

- provides connectivity to between two Lora Nodes
- provides nodes addressing
- provides data packet encryption

Fusor Hub, - v1.0

- runs in a local network, preferably on something small, like Pi +
- collects data from IOT nodes over non secure protocols +
- saves data to logs +
- provides aggregations service +
- provides repository for configurations of Fusor Node StateMachines +
- pushes data to external service (eg. FireBase) using secure protocols +
- pulls configurations from external service (eg. FireBase)
- serves as a proxy of MQTT (emits received data, collects and logs subscribed topics)
- serves as a proxy of IFTTT (emits events, handles actions)

Fusor Hub Admin

- provides UI for controlling Fusor Hub and all connected nodes

Fusor Hub Client

- library for creating extensions to Fusor Hub
- uses Fusor Hub as micro-service

Fusor Collector (uses Fusor Hub Client)

- reads data from REST API, scraps Web pages, executes shell scripts and extracts data
- stores collected data to Fusor Hub
- eg. collect data from stock tickers, weather stations, any API endpoints
- extractors: CSS from HTML
- transformer: JSONata queries (mainly for handling API results)

Fusor Mobile App (needs full refactoring)

- mobile app for managing, monitoring all Nodes
- reads data from FireBase
- displays data as configurable tiles
- supports dynamically loadable plugins
- displays data visualizations
- writes data to FireBse (config parameters)
