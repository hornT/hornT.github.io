'use strict';

function Parse(){
    
    const protocolParsers = {
        'Dlms': DlmsProtocol,
        'Rtu325': Rtu325Protocol,
        'Ecom3000': 3
    }

    const dataStr = document.querySelector('#protocolPacket').value.replace(/[-_ ]/g, '');
    const data_bytes = dataStr.match(/.{2}/g);
    console.log('data_bytes.length: %s', data_bytes.length);

    const protocolType = document.querySelector('input[name="protocol"]:checked').value;
    const parser = protocolParsers[protocolType];

    const protocolLogs = parser.Parse(data_bytes);
    const log = document.querySelector('#log');

    log.appendChild(protocolLogs);
}

