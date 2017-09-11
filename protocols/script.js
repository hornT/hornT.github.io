'use strict';

const log = document.querySelector('#log');

const protocolParsers = {
    'Dlms': DlmsProtocol,
    'Rtu325': Rtu325Protocol,
    'Ecom3000': Ecom3000Protocol
}

var index = 0;
var data_bytes = [];
var parserlog;

function Parse() {

    const dataStr = document.querySelector('#protocolPacket').value.replace(/[-_ ]/g, '');
    data_bytes = dataStr.match(/.{2}/g);
    console.log('data_bytes.length: %s', data_bytes.length);

    const protocolType = document.querySelector('input[name="protocol"]:checked').value;
    const parser = protocolParsers[protocolType];

    while (log.firstChild) {
        log.removeChild(log.firstChild);
    }

    parserlog = document.createElement("div");
    
    index = 0;

    parser.Parse();

    log.appendChild(parserlog);
}

function AddDataTextLog(dataText, text, element){
    element = element || parserlog;

    const node = document.createElement('div');
    node.classList.add('inner-log');
    
    if(dataText)
    {
        const dataSpan = document.createElement('span');
        dataSpan.classList.add('data-log');
        dataSpan.innerHTML = dataText;
        node.appendChild(dataSpan);
    }
    
    const textSpan = document.createElement('span');
    textSpan.classList.add('text-log');
    textSpan.innerHTML = text;
    node.appendChild(textSpan);

    element.appendChild(node);

    return node;
}

function AddTextLog(text, element) {

    return AddDataTextLog(null, text, element);
}

// Добавляет строку лога с данными разбора
function AddLog(size, text, element) {
    const packetText = data_bytes.slice(index, index + size).join('-') + " - ";
    const node = AddDataTextLog(packetText, text, element);

    index += size;

    return node;
}