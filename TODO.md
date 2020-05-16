## ROADMAP

- Accept blobs
- Build client library
- MQTT support. Subscribe and Emit messages.
- Log cutoff time. Cleanup older records.

## Components

StateMachine (C++ Arduino library) - v1.0

- JSON based configuration to run State Machine on IOT node (eg. ESP series)

IOT Wifi Node, Plugin for StateMachine (C++ Arduino library)

- provides connectivity to IOT Gateway

IOT Node Configurator (C++ Arduino library)

- provides basic web server for Node configuration over browser (wifi settings, etc.)

IOT Lora Node, Plugin for StateMachine (C++ Arduino library)

- provides connectivity to between two Lora Nodes
- provides nodes addressing
- provides data packet encryption

IOT Gateway Server, - alfa

- runs in a local network, preferably on something small, like Pi
- collects data from IOT nodes over non secure protocols +
- saves data to logs +
- provides aggregations service +
- provides repository for IOT node StateMachines
- pushes data to external service (eg. FireBase), using secure protocols
- pulls configurations from external service (eg. FireBase)
- serves as a gateway of MQTT (emits received data, collects and logs subscribed topics)

IOT Gateway Client

- library for creating extensions to IOT Gateway
- uses IOT Gateway as micro-service

HTTP Collector (uses IOT Gateway Client)

- reads HTTP sources, extracts data and stores to IOT Gateway as params
- eg. collect data from stock tickers, weather stations, any API endpoints
- extractors: CSS, XPATH selectors from HTML
- transformer: JSONata queries (mainly for handling API results)

IOT Control App - old version, needs upgrade

- mobile app for managing, monitoring all Nodes
- reads data from FireBase
- displays data as configurable tiles
- displays data visualizations
- writes data to FireBse (config parameters)
