'use strict';

const log = document.querySelector('#log');

const protocolParsers = {
    'Dlms': DlmsProtocol,
    'Rtu325': Rtu325Protocol,
    'Ecom3000': 3
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

function AddTextLog(text, element) {

    element = element || parserlog;

    const node = document.createElement('div');
    node.classList.add('inner-log');
    element.appendChild(node);
    node.innerHTML = text;

    return node;
}

// Добавляет строку лога с данными разбора
function AddLog(size, text, element) {
    const logText = data_bytes.slice(index, index + size).join('-') + " - " + text;
    const node = AddTextLog(logText, element);

    index += size;

    return node;
}