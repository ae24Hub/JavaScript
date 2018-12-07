const enocean = require('node-enocean-utils');
const moment = require('moment-timezone');
const fs = require('fs');

// センサー
const sensors = [
  {
    name: 'スイッチ',
    stateOf: message => message.value.pressed,
    messageOf: message => message.value.pressed ? 'ON' : 'OFF',
    subTopic: 'switch'
  },
  {
    name: '磁気センサー',
    stateOf: message => message.value.contact,
    messageOf: message => message.value.contact ? 'CLOSE' : 'OPEN',
    subTopic: 'magnet',
    json: 'magnet.json'
  },
  {
    name: '温度センサー',
    stateOf: message => message.value.temperature,
    messageOf: message => `${message.value.temperature}度`,
    subTopic: 'temperature',
    json: 'temperature.json'
  },
  {
    name: '人感センサー',
    stateOf: message => message.value.contact,
    messageOf: message => message.value.contact ? 'MOVED' : 'STOPPED',
    subTopic: 'occupancy',
    json: 'occupancy.json'
  }
];

// モニタリング開始
enocean.startMonitor().then().catch(error => {
  console.error(error);
});

// センサー登録
sensors.forEach(sensor => {
  sensor.ids.forEach(id => enocean.teach({id, eep: sensor.eep, name: sensor.name}));
});

enocean.on('data-known', telegram => {
  const message = telegram.message;
  const sensor = sensors.find(sensor => sensor.ids.includes(message.device.id));
  console.log(`[${moment().format()}] ${message.device.name}: ${sensor.messageOf(message)}`);
  fs.writeFileSync(sensor.json, JSON.stringify({deviceName: message.device.name, state: sensor.stateOf(message)}));
});
