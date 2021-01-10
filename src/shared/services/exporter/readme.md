`Exporter` module is responsible for data collection, transformation and export.

1. `Broker` service orchestrates all the process. It hooks to Params service to handle instant `Parameter` updates
   and handles scheduled exports. `Broker` calls `Exporter` for actual data export.

2. `Exporter` interprets rule definitions and instantiates `Exporter Instances` for each `Parameter` matching a rule.
   This allows to reduce the number of the rules when a big number of `Parameters` is handled by the `Gateway`.
   Each time `Parameter` is updates all `Parameter` related rules are invoked and `Collector` is called to prepare data
   for export. After data is ready specific data saver is invoked. Out of the box `Exporter` currently support
   two data destinations:

- FireBase
- Google Sheet

3. `Collector` is responsible for data collection rule interpretation and data extraction from the `Gateway` database.
   It can be just current `Parameter` value or some aggregation.

```JSON

{
    // "collection" defines how data is collected
    "collection":
        {
            // "type" defines do we want just Parameter value or some time based aggregation
            "type": "single-value" | "aggregate",
            // "filter" defines how parameters are selected for export
            "filter":
            {
                // when one specific parameter is exported
                "node": <node id>,
                "param": <param id>,
                // when regex used to match many parameters
                "nodeMatch": <regex expression>,
                "paramMatch": <regex expression>
            },
            // "config" is used when "type" is  "aggregate"
            "config":
            {
                // "grouping" defines time block scope for aggregation operation to be performed
                "grouping": "1min" | "15min" | "30min" | "1h" | "3h" | "6h" | "12h" | "1d" | "1w" | "1mon" | "3mon" | "6mon" | "1y",
                // "operation" defines what aggregation function to be applied for data in a time block
                "operation": "avg" | "min" | "max",
                // "startOffset" defines beginning of aggregation time frame. Beginning is defined by offset from the current time
                "startOffset":
                {
                    "unit": "min" | "h" | "d" | "w" | "mon" | "yr",
                    "value": <number of units>
                    // supported values are:
                    // "1min" | "15min" | "30min" | "1h" | "3h" | "6h" | "12h" | "1d" | "1w" | "1mon" | "3mon" | "6mon" | "1y"
                }
            }
        },
    // "target" defines where data should be exported
    "target": "firebase" | "google-sheet",
    "output":
    {
        // for firebase
        "path": <path inside firebase database to store values>,
        // for goole sheets
        "spreadsheetId": <spreadsheet file id>,
        "sheetId": <sheet name>,
        "type": "cell-address" | "cell-lookup" | "range-address",
        "destination": 
        {
            // for cell-address (single cell)
            "range": <specific cell, eg. A1>

            // for cell-lookup (fill 2d table)
            //   lookup in a row, eg. "1:1" to lookup in a first row
            "lookupRangeX": <range>,
            //   expression to calculate what to lookup
            "lookupKeyX": <jsonata expression>,
            //   lookup in a column, eg. "A:A" to lookup in a first column
            "lookupRangeY": <range>,
            "lookupKeyY": <jsonata expression>,

            // for range-address when aggregation is exported as a column
            "startCell": <column-range>,
            //   if true, date is added to the column next to the value
            "appendDate": true | false
        },
    },
    "schedule": 
    {
        "type": "on-update" | "cron",
        // for "cron"
        "config":
        {
            "schedule": <cron-expression>
        }
    }
}


```
