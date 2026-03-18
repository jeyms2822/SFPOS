import { forwardRef, useRef, useState } from 'react';

const SHOP_NAME   = 'Sip Up Coffee';
const SHOP_ADDR_1 = '1410 Kapanalig, Maypajo';
const SHOP_ADDR_2 = 'Caloocan, 1400 Metro Manila';
const SHOP_TIN    = 'TIN: XXX-XXX-XXX-000';
const THANKS      = 'Thank you for visiting!';
const NON_OFFICIAL_NOTE = 'This is not an official receipt';

const BLE_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  'battery_service',
  'device_information',
];

const BLE_CHARACTERISTIC_UUIDS = [
  '0000ffe1-0000-1000-8000-00805f9b34fb',
  '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  '49535343-8841-43f4-a8d4-ecbe34729bb3',
  '49535343-1e4d-4bd9-ba61-23c647249616',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
];

export default function ReceiptModal({ receipt, onClose }) {
  const receiptRef = useRef(null);
  const [printerDevice, setPrinterDevice] = useState(null);
  const [printerCharacteristic, setPrinterCharacteristic] = useState(null);
  const [printerStatus, setPrinterStatus] = useState('Not connected');
  const [btBusy, setBtBusy] = useState(false);

  const canUseBluetooth = typeof navigator !== 'undefined' && !!navigator.bluetooth;

  const handleBrowserPrint = () => {
    const content = receiptRef.current?.outerHTML;
    if (!content) return;

    const popup = window.open('', 'sipup-receipt-print', 'width=420,height=720');
    if (!popup) {
      window.alert('Pop-up blocked. Allow pop-ups to print the receipt.');
      return;
    }

    popup.document.open();
    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Claim Stub</title>
          <style>
            html, body { margin: 0; padding: 0; background: #fff; }
            body { padding: 10px; }
            .receipt {
              width: 80mm;
              max-width: 100%;
              margin: 0 auto;
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.45;
              color: #111;
              background: #fff;
            }
            .rcp-header { text-align: center; margin-bottom: 8px; }
            .rcp-shop-name { font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .rcp-addr { font-size: 11px; color: #444; }
            .rcp-divider { color: #aaa; font-size: 11px; margin: 8px 0; overflow: hidden; white-space: nowrap; }
            .rcp-row { display: flex; justify-content: space-between; gap: 4px; padding: 1px 0; }
            .rcp-items-hdr { display: flex; font-weight: bold; font-size: 11px; border-bottom: 1px dashed #ccc; padding-bottom: 4px; margin-bottom: 4px; }
            .rcp-items-hdr span:nth-child(1) { flex: 1; }
            .rcp-items-hdr span:nth-child(2) { width: 30px; text-align: center; }
            .rcp-items-hdr span:nth-child(3) { width: 70px; text-align: right; }
            .rcp-item { display: flex; align-items: baseline; margin-bottom: 3px; }
            .rcp-item-name { flex: 1; word-break: break-word; }
            .rcp-item-qty { width: 30px; text-align: center; color: #555; }
            .rcp-item-amt { width: 70px; text-align: right; font-weight: bold; }
            .rcp-grand { font-weight: bold; font-size: 14px; border-top: 1px dashed #ccc; padding-top: 4px; margin-top: 4px; }
            .rcp-footer { text-align: center; margin-top: 10px; font-size: 11px; color: #555; }
            .rcp-tin { font-size: 10px; color: #888; margin-top: 2px; }
            @page { size: 80mm auto; margin: 6mm; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    popup.document.close();

    popup.onload = () => {
      popup.focus();
      popup.print();
      popup.close();
    };
  };

  const connectBluetoothPrinter = async () => {
    if (!canUseBluetooth) {
      window.alert('Web Bluetooth is not supported in this browser. Use Chrome/Edge over HTTPS or localhost.');
      return;
    }

    setBtBusy(true);
    try {
      setPrinterStatus('Scanning for printer...');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: BLE_SERVICE_UUIDS,
      });

      const server = await device.gatt.connect();
      const characteristic = await getWritableCharacteristic(server);
      if (!characteristic) {
        throw new Error('No writable BLE characteristic was found on this printer.');
      }

      device.addEventListener('gattserverdisconnected', () => {
        setPrinterDevice(null);
        setPrinterCharacteristic(null);
        setPrinterStatus('Disconnected');
      });

      setPrinterDevice(device);
      setPrinterCharacteristic(characteristic);
      setPrinterStatus(`Connected: ${device.name || 'Thermal Printer'}`);
    } catch (error) {
      setPrinterStatus(error?.message || 'Bluetooth connection failed');
    } finally {
      setBtBusy(false);
    }
  };

  const printViaBluetooth = async () => {
    if (!printerCharacteristic) {
      window.alert('Connect a Bluetooth thermal printer first.');
      return;
    }

    setBtBusy(true);
    try {
      const payload = buildEscPosPayload(receipt);
      await writeChunks(printerCharacteristic, payload, 20);
      setPrinterStatus(`Printed to ${printerDevice?.name || 'printer'}`);
    } catch (error) {
      setPrinterStatus(error?.message || 'Bluetooth print failed');
    } finally {
      setBtBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal receipt-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Claim Stub</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body receipt-body">
          <ReceiptContent ref={receiptRef} receipt={receipt} />

          <div className="printer-tools">
            <p className="printer-status">{printerStatus}</p>
            <p className="printer-note">Bluetooth print is experimental and works only with BLE thermal printers.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-secondary" onClick={connectBluetoothPrinter} disabled={btBusy}>
            {btBusy ? 'Working...' : 'Bluetooth Connect'}
          </button>
          <button className="btn btn-secondary" onClick={printViaBluetooth} disabled={btBusy || !printerCharacteristic}>
            Bluetooth Print
          </button>
          <button className="btn btn-primary" onClick={handleBrowserPrint}>
            Browser Print
          </button>
        </div>
      </div>
    </div>
  );
}

const ReceiptContent = forwardRef(function ReceiptContentInner({ receipt }, ref) {
    const d = new Date(receipt.timestamp);
    const dateStr = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="receipt" ref={ref}>
        <div className="rcp-header">
          <p className="rcp-shop-name">{SHOP_NAME}</p>
          <p className="rcp-addr">{SHOP_ADDR_1}</p>
          <p className="rcp-addr">{SHOP_ADDR_2}</p>
        </div>

        <p className="rcp-divider">{'- '.repeat(22).trim()}</p>

        <div className="rcp-meta">
          <div className="rcp-row"><span>Claim Stub #</span><span>{receipt.receiptNumber}</span></div>
          <div className="rcp-row"><span>Date</span><span>{dateStr}</span></div>
          <div className="rcp-row"><span>Time</span><span>{timeStr}</span></div>
          <div className="rcp-row"><span>Payment</span><span>{receipt.paymentMethod}</span></div>
        </div>

        <p className="rcp-divider">{'- '.repeat(22).trim()}</p>

        <div className="rcp-items">
          <div className="rcp-items-hdr">
            <span>Item</span>
            <span>Cost</span>
            <span>Amt</span>
          </div>
          {receipt.items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="rcp-item">
              <span className="rcp-item-name">{item.name}</span>
              <span className="rcp-item-qty">P{item.price}</span>
              <span className="rcp-item-amt">P{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <p className="rcp-divider">{'- '.repeat(22).trim()}</p>

        <div className="rcp-totals">
          <div className="rcp-row rcp-grand"><span>TOTAL</span><span>P{receipt.total.toFixed(2)}</span></div>

          {receipt.paymentMethod === 'Cash' && (
            <>
              <div className="rcp-row"><span>Cash</span><span>P{Number(receipt.amountReceived).toFixed(2)}</span></div>
              <div className="rcp-row"><span>Change</span><span>P{Number(receipt.change).toFixed(2)}</span></div>
            </>
          )}
        </div>

        <p className="rcp-divider">{'- '.repeat(22).trim()}</p>

        <div className="rcp-footer">
          <p>{THANKS}</p>
          <p>Please come again</p>
          <p>{NON_OFFICIAL_NOTE}</p>
          <p className="rcp-tin">{SHOP_TIN}</p>
        </div>
      </div>
    );
});

async function getWritableCharacteristic(server) {
  for (const serviceId of BLE_SERVICE_UUIDS) {
    try {
      const service = await server.getPrimaryService(serviceId);

      for (const charId of BLE_CHARACTERISTIC_UUIDS) {
        try {
          const c = await service.getCharacteristic(charId);
          if (c.properties.write || c.properties.writeWithoutResponse) return c;
        } catch {
          // Try next candidate characteristic.
        }
      }

      const chars = await service.getCharacteristics();
      const writable = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
      if (writable) return writable;
    } catch {
      // Try next candidate service.
    }
  }

  try {
    const services = await server.getPrimaryServices();
    for (const service of services) {
      const chars = await service.getCharacteristics();
      const writable = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
      if (writable) return writable;
    }
  } catch {
    // No discoverable services.
  }

  return null;
}

function buildEscPosPayload(receipt) {
  const text = buildReceiptText(receipt);
  const encoder = new TextEncoder();
  const start = Uint8Array.from([0x1b, 0x40, 0x1b, 0x61, 0x00]);
  const body = encoder.encode(text);
  const end = Uint8Array.from([0x0a, 0x0a, 0x0a, 0x1d, 0x56, 0x41, 0x00]);

  const output = new Uint8Array(start.length + body.length + end.length);
  output.set(start, 0);
  output.set(body, start.length);
  output.set(end, start.length + body.length);
  return output;
}

function buildReceiptText(receipt) {
  const date = new Date(receipt.timestamp);
  const lines = [];

  lines.push(center('SIP UP COFFEE'));
  lines.push(center('1410 Kapanalig, Maypajo'));
  lines.push(center('Caloocan, 1400 Metro Manila'));
  lines.push(repeat('-', 32));
  lines.push(linePair('Claim Stub', receipt.receiptNumber));
  lines.push(linePair('Date', date.toLocaleDateString('en-PH')));
  lines.push(linePair('Time', date.toLocaleTimeString('en-PH')));
  lines.push(linePair('Payment', receipt.paymentMethod));
  lines.push(repeat('-', 32));

  for (const item of receipt.items) {
    const name = (item.name || '').replace(/[^\x20-\x7E]/g, '').slice(0, 18);
    lines.push(name);
    lines.push(linePair(`  x${item.quantity}`, `P${(item.price * item.quantity).toFixed(2)}`));
  }

  lines.push(repeat('-', 32));
  lines.push(linePair('TOTAL', `P${Number(receipt.total).toFixed(2)}`, 32));
  if (receipt.paymentMethod === 'Cash') {
    lines.push(linePair('Cash', `P${Number(receipt.amountReceived).toFixed(2)}`));
    lines.push(linePair('Change', `P${Number(receipt.change).toFixed(2)}`));
  }
  lines.push(repeat('-', 32));
  lines.push(center('Thank you for visiting!'));
  lines.push(center('Please come again'));
  lines.push(center(NON_OFFICIAL_NOTE));

  return `${lines.join('\n')}\n`;
}

function linePair(left, right, width = 32) {
  const l = String(left ?? '');
  const r = String(right ?? '');
  const space = Math.max(1, width - l.length - r.length);
  return `${l}${repeat(' ', space)}${r}`;
}

function center(text, width = 32) {
  const value = String(text ?? '');
  if (value.length >= width) return value;
  const left = Math.floor((width - value.length) / 2);
  return `${repeat(' ', left)}${value}`;
}

function repeat(char, count) {
  return new Array(Math.max(0, count) + 1).join(char);
}

async function writeChunks(characteristic, bytes, chunkSize = 20) {
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    if (characteristic.properties.writeWithoutResponse && characteristic.writeValueWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
    await delay(12);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
