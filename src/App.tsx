import './App.css';
import React, { SyntheticEvent, useState } from 'react';
import { App, Page, Navbar, Button, Block, BlockTitle, Link, Icon } from 'konsta/react';
import AmpelStatusIcon, { AmpelStatus } from './AmpelStatusIcon';


// https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html
// An implementation of Nordic Semicondutor's UART/Serial Port Emulation over Bluetooth low energy
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

// Allows the micro:bit to transmit a byte array
const UART_TX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

// Allows a connected client to send a byte array
const UART_RX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let uBitDevice;
let rxCharacteristic;

function receive(event: Event, setStatus: (status: AmpelStatus) => void)  {
  let ev = event as unknown as SyntheticEvent<BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTCharacteristic>;
  var enc = new TextDecoder(); // always utf-8

  console.log(enc.decode(ev.currentTarget.value.buffer));
  let status = AmpelStatus.AUS;
  switch (enc.decode(ev.currentTarget.value.buffer)) {
    case 'ON': status = AmpelStatus.AN; break;
    case 'OFF': status = AmpelStatus.AUS; break;
    case 'ROT': status = AmpelStatus.ROT; break;
    case 'GELB': status = AmpelStatus.GELB; break;
    case 'GRUN': status = AmpelStatus.GRÜN; break;
    case 'ROTUNDGELB': status = AmpelStatus.ROTGELB; break;
  }
  setStatus(status);
}

async function connectBLE(props: {service: BluetoothRemoteGATTService, setService: (service: BluetoothRemoteGATTService) => void, setStatus: (status: AmpelStatus) => void}) {
    try {
      if (props.service !== undefined) {
        props.service.device.gatt.disconnect();
        props.setService(undefined);
      } else {
        console.log("Requesting Bluetooth Device...");
        uBitDevice = await navigator.bluetooth.requestDevice({
          filters: [{ namePrefix: "BBC micro:bit" }],
          optionalServices: [UART_SERVICE_UUID]
        });
    
        console.log("Connecting to GATT Server...");
        const server = await uBitDevice.gatt.connect();
    
        console.log("Getting Service...");
        const service = await server.getPrimaryService(UART_SERVICE_UUID);
        props.setService(service);
    
        console.log("Getting Characteristics...");
        const txCharacteristic = await service.getCharacteristic(
          UART_TX_CHARACTERISTIC_UUID
        );
        txCharacteristic.startNotifications();
        txCharacteristic.addEventListener(
          "characteristicvaluechanged",
          (event) => {receive(event, props.setStatus);}
        );
        service.device.ongattserverdisconnected = (event: Event) => {
          props.setStatus(AmpelStatus.AUS);
        }
        props.setStatus(AmpelStatus.AN);
      }
    } catch (error) {
      console.log(error);
    }
  }

async function sendCommand(cmd: string, service: BluetoothRemoteGATTService) {
  console.log("sende: " + cmd);
  try {
    rxCharacteristic = await service.getCharacteristic(
      UART_RX_CHARACTERISTIC_UUID
    );
    let encoder = new TextEncoder();
    rxCharacteristic.writeValue(encoder.encode(cmd + ";"))
  } catch (error) {
    console.log(error);
  }
}

function BLEApp() {
  let [service, setService] = useState<BluetoothRemoteGATTService>();
  let [ampelStatus, setAmpelStatus] = useState<AmpelStatus>(AmpelStatus.AUS);
  return (
      <App theme="ios" dark safeAreas>
        <Page>
          <Navbar title="Ampel" left={
          <Link navbar iconOnly>
            <Icon
              ios={<img src="favicon-32x32.png" alt='' />}
            />
          </Link>
        } />
          <BlockTitle>BBC micro:bit</BlockTitle>
          <Block><Button className='k-color-brand-orange' onClick={() => connectBLE({service, setService, setStatus: setAmpelStatus})}>{service === undefined ? "Verbinden" : "Trennen" }</Button></Block>
          <BlockTitle>Status</BlockTitle>
          <Block style={{alignContent: 'center', justifyItems: 'center'}}>
            <AmpelStatusIcon status={ampelStatus}/>
          </Block>
          <BlockTitle>Farben</BlockTitle>
          <Block strong outlineIos className="space-y-2">
            <Button className='k-color-brand-red' rounded onClick={() => sendCommand("ROT", service)} disabled={service === undefined}>ROT</Button>
            <Button className='k-color-brand-yellow' rounded onClick={() => sendCommand("GELB", service)} disabled={service === undefined}>GELB</Button>
            <Button className='k-color-brand-green' rounded onClick={() => sendCommand("GRUN", service)} disabled={service === undefined}>GRÜN</Button>
          </Block>
          <BlockTitle>Automatik</BlockTitle>
          <Block strong outlineIos className="space-y-2">
            <Button className='k-color-brand-yellow' onClick={() => sendCommand("bLINK", service)} disabled={service === undefined}>BLINKEN</Button>
            <Button className='k-color-brand-orange' onClick={() => sendCommand("AUTOMATIK", service)} disabled={service === undefined}>AUTOMATIK</Button>
          </Block>
        </Page>
        </App>
  );
}

export default BLEApp;
