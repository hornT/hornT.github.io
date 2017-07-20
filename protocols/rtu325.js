'use strict';

const Rtu325Protocol = (function(){
    
    // размер служебной информации в пакете ID пакета(2) + адрес(2) + сжатие(1+) + шифрование(1) + код ответа(1)
    const PRIVATE_INFO_SIZE_IN_PACKET = 7;
    // размер служебной инфы в ответе. все остальное - данные
    // начало пакета(1) + размер пакета(2) + служебная инфа в пакете + crc(2)
    const privateInfoSize = 1 + 2 + PRIVATE_INFO_SIZE_IN_PACKET + 2;

    const CRC_SIZE = 2;

    const errorCodes = {
        0: 'Ошибок нет',
        1: 'Ошибка (не спрашивай какая, нет описание)',
        2: 'Нет данных',
        3: 'Соединение не установлено',
    }

    // 
    const requestFunctions = {
        0x04: parseEnergyRequest,
        0x06: parseTimeRequest,
        0x0b: parseMeterParametersRequest,
        0x0f: parseInstantaneousReauest
    }

    // 
    const answerFunctions = {
        7: parseTimeAnswer,
        38: parseMeterParametersAnswer
    }

    function parseHead(){
        AddLog(1, 'Начало пакета');
        let packetSize = Helper.ParseInt2B(data_bytes, index);
        AddLog(2, 'Размер пакета: ' + packetSize + '. Размер данных должен быть: ' + (packetSize - 7));
        AddLog(2, 'Id пакета');
        AddLog(2, 'Адрес: ' + Helper.ParseInt2B(data_bytes, index));
        AddLog(1, 'Вид сжатия');
        AddLog(1, 'Вид шифрования');
    }

    // Разбор функций запроса\ответа
    function parseFunction(funcArray, num){
        const func = funcArray[num];

        if(func){
            func();
        }
        else{
            AddLog(1, 'Неизвестная функция');
        }
    }

    // Разбор непосредственно данных ответа, либо запроса
    function parsePacketData(){

        const code = parseInt(data_bytes[index], 16);
        const text = errorCodes[code];

        if(code === 0){
            AddLog(1, 'Ошибок нет');
            parseData();
        }
        else if(text){
            AddLog(1, text);
        }
        else{
            parseFunction(requestFunctions, code);
        }
    }

    function parseDateTimeMinutes(node){
        AddLog(2, 'Год: ' + Helper.ParseInt2B(data_bytes, index), node);
        AddLog(1, 'Месяц: ' + parseInt(data_bytes[index], 16), node);
        AddLog(1, 'День: ' + parseInt(data_bytes[index], 16), node);
        AddLog(1, 'Часы: ' + parseInt(data_bytes[index], 16), node);
        AddLog(1, 'Минуты: ' + parseInt(data_bytes[index], 16), node);
    }

    function parseDateTimeSeconds(node){
        parseDateTimeMinutes(node);
        AddLog(1, 'Секунды: ' + parseInt(data_bytes[index], 16), node);
    }

    function parseMeterSerial(node){
        AddLog(4, 'Заводской номер счетчика: ' + Helper.ParseInt4B(data_bytes, index), node);
    }

    // Добавить лог с типами значений
    function parseValueTypes(node){
        AddLog(1, 'Типы значений: ' + Helper.ParseValueTypes(data_bytes, index), node);
    }



    // 0x04
    function parseEnergyRequest(){
        const node = AddLog(1, 'Запрос показаний счетчика');

        parseMeterSerial(node);
        parseValueTypes(node);

        parseDateTimeMinutes(node);
    }

    function parseTimeRequest(){
        AddLog(1, 'Запрос чтения времени');
    }

    // Ответ времени
    function parseTimeAnswer(){
        const node = AddTextLog('Чтение времени');

        parseDateTimeMinutes(node);
    }

    // Запрос параметров счетчика
    function parseMeterParametersRequest() {
        const node = AddLog(1, 'Запрос параметров счетчика');

        parseMeterSerial(node);
    }

    // Ответ параметров счетчика
    function parseMeterParametersAnswer(){
        const node = AddTextLog('Памаметры счетчика');

        AddLog(2, 'Идентификатор счетчика: ' + Helper.ParseInt2B(data_bytes, index), node);
        AddLog(8, 'коэф-т преобразования: ', node); // TODO parse double 8
        AddLog(4, 'I1: ' + Helper.ParseInt4B(data_bytes, index), node);
        AddLog(4, 'I2: ' + Helper.ParseInt4B(data_bytes, index), node);
        AddLog(4, 'U1: ' + Helper.ParseInt4B(data_bytes, index), node);
        AddLog(4, 'U2: ' + Helper.ParseInt4B(data_bytes, index), node);
        AddLog(1, 'масштабный множитель RPLSCAL из счетчика: ', node);
        AddLog(4, 'Кмнож с шильда счетчика: ' + Helper.ParseInt4B(data_bytes, index), node);
        AddLog(1, 'интервал профиля, мин: ' + parseInt(data_bytes[index], 16), node);
        AddLog(2, 'подинтервал профиля/мощности, сек: ' + Helper.ParseInt2B(data_bytes, index), node);
        AddLog(2, 'регистрируемые RTU типы значений с данного счетчика (профили): ' + Helper.ParseValueTypes(data_bytes, index), node);
        AddLog(1, 'тип счетчика: ' + parseInt(data_bytes[index], 16), node);
        // todo см. п. 4.5
        AddLog(1, 'идентификатор типа данных профилей счетчика: ' + parseInt(data_bytes[index], 16), node);
    }

    // Запрос параметров электросети
    function parseInstantaneousReauest(){
        const node = AddLog(1, 'Запрос параметров электросети');

        parseMeterSerial(node);
        parseDateTimeMinutes(node);

        AddLog(2, 'Количество замеров: ' + Helper.ParseInt2B(data_bytes, index), node);
    }

    function parseData(){
        // Тип ответа можно понять только по размеру. других признаков нет
        let dataSize = data_bytes.length - index - CRC_SIZE;
        console.log(`Размер данных: ${dataSize}`);

        parseFunction(answerFunctions, dataSize);
    }

    function parse(){
        
        parseHead();
        parsePacketData();

        AddLog(2, 'Crc');
    }

    return{
        Parse: parse
    }
}());