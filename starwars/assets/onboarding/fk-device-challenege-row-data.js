
export const sensorRows = new Map();

sensorRows.set('top', {
    sensor: 0,
    startingX: 250,
    startingY: 300,
    color: '#2299FC',
    indicatorId: 'indicator-a',
    nodes: [
        {
            x: -40,
            y: 0,
            r: 10,
        },
        {
            x: 40,
            y: -25,
            r: 10,
        },
        {
            x: -40,
            y: -25,
            r: 25,
        },
        {
            x: 40,
            y: -25,
            r: 20,
        },
        {
            x: -40,
            y: -25,
            r: 15,
        },
        {
            x: 40,
            y: -25,
            r: 20,
        },
        {
            x: -40,
            y: -25,
            r: 10,
        },
        {
            x: 40,
            y: -25,
            r: 25,
        },
        {
            x: -40,
            y: -25,
            r: 10,
        },
        {
            x: 40,
            y: -25,
            r: 15,
        },
    ],
});

sensorRows.set('right', {
    sensor: 1,
    startingX: 430,
    startingY: 370,
    indicatorId: 'indicator-b',
    nodes: [
        {
            x: -40,
            y: 0,
            r: 25,
        },
        {
            x: 40,
            y: -25,
            r: 15,
        },
        {
            x: -40,
            y: -25,
            r: 20,
        },
        {
            x: 40,
            y: -25,
            r: 20,
        },
        {
            x: -40,
            y: -25,
            r: 10,
        },
        {
            x: 40,
            y: -25,
            r: 25,
        },
        {
            x: -40,
            y: -25,
            r: 15,
        },
        {
            x: 40,
            y: -25,
            r: 15,
        },
        {
            x: -40,
            y: -25,
            r: 20,
        },
        {
            x: 40,
            y: -25,
            r: 20,
        },
    ],
});

sensorRows.set('bottom', {
    sensor: 2,
    startingX: 250,
    startingY: 450,
    indicatorId: 'indicator-b',
    nodes: [
        {
            x: -40,
            y: 0,
            r: 25,
        },
        {
            x: 40,
            y: -25,
            r: 15,
        },
        {
            x: -40,
            y: -25,
            r: 20,
        },
        {
            x: 40,
            y: -25,
            r: 25,
        },
        {
            x: -40,
            y: -25,
            r: 15,
        },
        {
            x: 40,
            y: -25,
            r: 10,
        },
        {
            x: -40,
            y: -25,
            r: 15,
        },
        {
            x: 40,
            y: -25,
            r: 20,
        },
        {
            x: -40,
            y: -25,
            r: 20,
        },
        {
            x: 40,
            y: -25,
            r: 15,
        },
    ],
});

sensorRows.set('left', {
    sensor: 3,
    startingX: 100,
    startingY: 370,
    indicatorId: 'indicator-a',
    nodes: [
        {
            x: -40,
            y: 0,
            r: 20,
        },
        {
            x: 40,
            y: -25,
            r: 15,
        },
        {
            x: -40,
            y: -25,
            r: 10,
        },
        {
            x: 40,
            y: -25,
            r: 15,
        },
        {
            x: -40,
            y: -25,
            r: 25,
        },
        {
            x: 40,
            y: -25,
            r: 10,
        },
        {
            x: -40,
            y: -25,
            r: 15,
        },
        {
            x: 40,
            y: -25,
            r: 20,
        },
        {
            x: -40,
            y: -25,
            r: 20,
        },
        {
            x: 40,
            y: -25,
            r: 15,
        },
    ],
});

export const sensorCounters = [
    {
        color: '#2299FC',
    },
    {
        color: '#EE3836',
    },
    {
        color: '#EE3836',
    },
    {
        color: '#2299FC',
    },
];
