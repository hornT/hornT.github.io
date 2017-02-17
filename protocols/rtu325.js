'use strict';

const Rtu325Protocol = (function(){
    var index = 0;
    var data_bytes = [];

    const errorCodes = {
        0: 'Ошибок нет',
        1: 'Ошибка (не спрашивай какая, нет описание)',
        2: 'Нет данных',
        3: 'Соединение не установлено',
    }

    const parseFuncs = {
        1: parseArray, // Массив
    };

    // Добавляет строку лога с данными разбора
    function addLog(element, size, text){

        const node = document.createElement('div');
        node.classList.add('inner-log');
        element.appendChild(node);
        node.innerHTML = data_bytes.slice(index, index + size).join('-') + " - " + text;
        
        index += size;
    }

    function parseHead(log){
        addLog(log, 1, 'Начало пакета');
        addLog(log, 2, 'Размер пакета: ' + parseInt(data_bytes[2] + data_bytes[1], 16));
        addLog(log, 2, 'Id пакета');
        addLog(log, 2, 'Адрес');
        addLog(log, 1, 'Вид сжатия');
        addLog(log, 1, 'Вид шифрования');
    }

    function parseErrorCode(log){
        const code = parseInt(data_bytes[index]);
        const text = errorCodes[code];

        addLog(log, 1, text);

        return code;
    }

    function parse(packet){
        //
        data_bytes = packet;
        index = 0;
        const log = document.createElement("div");

        parseHead(log);
        const errorCode = parseErrorCode(log);

        if(errorCode === 0){

        }
        
        addLog(log, 2, 'Crc');

        return log;
    }

    // Разбор массивов 01
    function parseArray(element){
        var node = document.createElement('div');
        element.appendChild(node);
        
        var size = parseInt(data_bytes[index + 1], 16);
        node.innerHTML = data_bytes.slice(index, index + 2).join('-') + " - Массив размером " + size;
        
        index += 2;
        
        for(var i = 0; i < size; i++){
            var type = parseInt(data_bytes[index], 16);
            parseFuncs[type](node);
        }
    }

    return{
        Parse: parse
    }
}());