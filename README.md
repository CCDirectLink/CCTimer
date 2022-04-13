# CCTimer

A timer for CrossCode! It can also be used as an AutoSplitter for LiveSplit.

## Installation

1. Install [CCLoader](https://github.com/CCDirectLink/CCLoader).
2. Download and extract [CCTimer](https://github.com/CCDirectLink/CCTimer/archive/master.zip).
3. Put the timer directory in the `assets/mods` directory.
4. To connect LiveSplit to CCTimer to LiveSplit add an AutoSplitter to your layout and set the script path to `<CrossCode Root Directory>/assets/mods/timer/CrossCode.asl`.

## Configuration

The options for the autosplitter are located in the `settings.json` file.

## Time

There are two methods of time tracking:

### IGT

If the `"time"` entry is not set or has the value `"time": "IGT"` the game takes the actual ingame time and sends it to livesplit.

#### Example 
```json
{
    "time": "IGT"
}
```

### State

The time can be tracked using the states of the game if `"time": "state"`. If this method is used, the time is independent of the ingame time and continues even after restarts or different saves.

The possible values for the state filter (`"filter"`) can are:
* RUNNING
* TELEPORT
* LOADING
* NEWGAME
* RESET
* LOADGAME
* MENU
* PAUSE
* LEVELUP
* QUICK
* ONMAPMENU
* QUESTSOLVED

These values can be either used inclusive or exclusive (or both)

#### Example
```json
{
    "time": "state",
	"filter": {
		"include": [
			"RUNNING",
			"MENU",
			"LEVELUP",
			"QUICK",
			"ONMAPMENU",
			"QUESTSOLVED"
		],
		"exclude": []
    }
}
```

## Splits

The splits that are automatically triggered are stored as an array in `"splits"`. If the split contains `"once": true` it is only triggered once gamestart. Otherwise it is triggered on every frame the condition is valid. There are four types of splits:

### Start

The `"start"` split is a special split that starts the timer when any map is loaded.

#### Example
```json
{
	"splits": [{
		"type": "start"
	}]
}
```

### Conditional start

The `"start"` split may include a condition that causes the run to start.

#### Example
```json
{
	"splits": [{
		"type": "start",
		"on": {
			"type": "loadmap",
			"name": "rhombus-sqr.central-inner",
		}
	}]
}
```

### Loadmap

`"loadmap"` checks if the map that is loaded is the same that is in `"name"`.

#### Example
```json
{
	"splits": [{
		"type": "loadmap",
		"name": "rookie-harbor.south"
	}]
}
```

### Event triggered

`"eventtriggered"` checks if a var condition is valid. To see which var conditions are possible enable `Print all events` in the options menu.

#### Example
```json
{
	"splits": [{
		"type": "eventtriggered",
		"name": "maps.cargoShip/cabins1.kitchenScene",
		"value": true
	}]
}
```


### Damage

`"damage"` checks if an entity is damaged. HP ranges can be filtered using `"above"` and/or `below`.

#### Example
```json
{
	"splits": [{
		"type": "damage",
		"name": "shredder-alpha",
		"below": 0
	}]
}
```

### Combined

The `"combined"` split is triggered if all `"conditions"` apply. Every condition is a split and can contain `"once": true`.

#### Example
```json
{
	"splits": [{
		"type": "combined",
		"conditions": [{
			"type": "loadmap",
			"name": "rookie-harbor.south",
			"once": true
		}, {
			"type": "eventtriggered",
			"name": "maps.cargoShip/cabins1.kitchenScene",
			"value": true
		}]
	}]
}
```

## Full example
```json
{
	"time": "state",
	"filter": {
		"include": [
			"RUNNING",
			"TELEPORT",
			"LOADING",
			"NEWGAME",
			"RESET",
			"LOADGAME",
			"MENU",
			"PAUSE",
			"LEVELUP",
			"QUICK",
			"ONMAPMENU",
			"QUESTSOLVED"
		],
		"exclude": []
	},
	"splits": [{
		"type": "start"
	}, {
		"type": "loadmap",
		"name": "rookie-harbor.south",
		"once": true
	}, {
		"type": "eventtriggered",
		"name": "maps.cargoShip/cabins1.kitchenScene",
		"value": true,
		"once": true
	}, {
		"type": "damage",
		"name": "shredder-alpha",
		"below": 0
	}, {
		"type": "combined",
		"once": true,
		"conditions": [{
			"type": "loadmap",
			"name": "rookie-harbor.south",
			"once": true
		}, {
			"type": "eventtriggered",
			"name": "maps.cargoShip/cabins1.kitchenScene",
			"value": true,
			"once": true
		}]
	}]
}
```