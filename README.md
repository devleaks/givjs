## To do:

Gantt: n

Temporary disabled features:

Heading Vector
Track (last n points in trail)

Idle points that first turn grey then disappear (fade away?)


## Message Format


```JavScript
export const FLIGHTBOARD_MSG = "flightboard"
export const MOVEMENTBOARD_MSG = "movement"
export const FLIGHTBOARD_UPDATE_MSG = "flightboard-update"
export const MOVEMENTBOARD_UPDATE_MSG = "movement-update"
export const PARKING_MSG = "parking"
export const PARKING_UPDATE_MSG = "parking-update"
export const MAP_MSG = "map"
export const WIRE_MSG = "wire"
export const DARK_MSG = "dark"
export const FOOTER_MSG = "footer"
export const SOLARI_MSG = "solari"
export const CLOCK_MSG = "clock"
export const SIMULATION_MSG = "siminfo"
```


### FLIGHTBOARD_MSG

Arrival and departure information from AODB.

```JavScript
{
    type: 'flightboard',
    timestamp: '2020-05-29T11:12:00.000+02:00',
    payload: {
      info: 'scheduled',
      move: 'arrival',
      flight: 'CFT1004',
      airport: 'CAG',
      date: '2020-05-29',
      time: '17:12',
      parking: 'L17',
      timestamp: '2020-05-29T11:12:00.000+02:00'
    }
}
```


### PARKING_MSG

Arrival and departure information from movement observation.

```JavScript
{
    type: 'parking',
    timestamp: '2020-05-29T17:08:35.254+02:00',
    payload: { name: 'G2', available: 'busy', flight: 'CCK1018' }
}
```


### MAP_MSG

```JavScript
{
  type: 'map',
  timestamp: '2020-05-29T16:48:35.254+02:00',
  payload: {
    type: 'Feature',
    properties: {
      name: 'ADAE0B',
      type: 'AIRCRAFT',
      heading: 73.8,
      speed: 816.14,
      group_name: 'AIRCRAFTS',
      status: 'ACTIVE',
      _style: {
        markerColor: '#00a',
        weight: 1,
        opacity: 0.8,
        fillColor: 'rgb(0,0,0)',
        fillOpacity: 0.4,
        markerSymbol: 'plane',
        markerRotationOffset: 0
      },
      payload: '{"emit":true,"marker-color":"#ff2600","marker-size":"medium","marker-symbol":"","nojitter":[3.9250842233644656,50.59347822900452],"elapsed":30,"vertex":0,"sequence":1,"category":"e","speed":816.1439541760683,"bearing":73.8,"note":"en route","device":"ADAE0B"}'
    }
  }
}
```


### WIRE_MSG

```JavScript
{
    type: 'wire',
    timestamp: '2020-05-29T11:12:00.000+02:00',
    payload: {
      source: 'aodb',
      type: 'flightboard',
      subject: 'Arrival CFT1004 from CAG',
      body: 'Scheduled 17:12',
      created_at: '2020-05-29T11:12:00.000+02:00',
      priority: 2,
      icon: 'la-plane-arrival',
      'icon-color': 'info'
    }
}
```

```JavScript
{
  type: 'wire',
  timestamp: '2020-05-29T14:57:48.204Z',
  payload: {
    source: 'aodb',
    type: 'metar',
    subject: 'METAR EBLG 2020-05-29T14:50:00Z',
    body: 'EBLG 291450Z 04010KT 350V090 CAVOK 22/02 Q1024 NOSIG',
    created_at: '2020-05-29T14:57:48.204Z',
    priority: 2,
    icon: 'fa-cloud',
    'icon-color': 'info'
  }
}
```


### SIMULATION_MSG

Contains information about the current simulation to set some appearance accordingly (clock, etc.)

```JavScript
{
  type: 'siminfo',
  timestamp: '2020-05-29T11:12:00.000+02:00',
  payload: {
    timestamp: '2020-05-29T11:12:00.000+02:00',
    speed: 'undefined',
    rate: '1',
    delay: '5'
  }
}
```


## Internal Messages

```JavScript
```


### DARK_MSG

```JavScript
{ DARK | LIGHT }
```

Word "light" or "dark".


### FOOTER_MSG

```JavScript
"Footer innerHTML Text"
```

HTML formatted message to display in footer. (Watch out for XSS.)


### CLOCK_MSG

```JavScript
"2020-05-29T13:02:00.000+02:00"
```

Timestamp in ISO 8601 format.


### PARKING_UPDATE_MSG

```JavScript
{
  busy: [0, 1, 2],
  max: [6, 8, 6]
}
```

Current and maximum parking area occupancies.
