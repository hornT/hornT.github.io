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
        1: 'Ошибка (не спрашивай какая, нет описания)',
        2: 'Нет данных',
        3: 'Соединение не установлено',
    }

    /**
     * Сопоставление номера функции запроса с функцией разбора
     */
    const requestFunctions = {
        0x03: parseCommercialProfileRequest,
        0x04: parseEnergyRequest,
        0x06: parseTimeRequest,
        0x0b: parseMeterParametersRequest,
        0x0f: parseInstantaneousReauest
    }

    /**
     * Сопоставление длины ответа с функцией разбора
     */
    const answerFunctions = {
        7: parseTimeAnswer,
        37: parseMeterParametersAnswer37,
        38: parseMeterParametersAnswer38
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

    /**
     * Разбор функций запроса
     * @param {Number} num - номер функции
     */
    function parseRequestFunction(num){
        const func = requestFunctions[num];

        if(func){
            func();
        }
        else{
            AddLog(1, 'Неизвестная функция');
        }
    }

    /**
     * Разбор данных ответа
     * Однозначно определить что за ответ пришел нельзя, можно понять только по длине данных
     * @param {Number} dataSize - длина данных
     */
    function parseAnswerData(dataSize){
        const func = answerFunctions[dataSize];

        if(func){
            func();
        }
        else if ((dataSize - 6) % 9 === 0) { // Ответ на запрос профиля коммерческих интервалов в именованных величинах кратен 9ми + 6
            parseCommercialProfileAnswer();
        }
        else if(dataSize % 8 === 0){ // Ответ на запрос показаний счетчика кратен 8ми
            parseEnergyAnswer();
        }
        else if ((dataSize - 2 - 13) % 8 === 0) { // Ответ на запрос мгновенок 2x(13 + 8y). число замеров (x) предполагаем = 1
            parseInstantaneousAnswer();
        }
        else{
            AddLog(1, 'Неизвестная функция');
        }
    }

    /**
     * Разбор пакета
     */
    function parsePacketData(){

        const code = parseInt(data_bytes[index], 16);
        const text = errorCodes[code];

        if(code === 0){
            AddLog(1, 'Ошибок нет');
            parseData();
        }
        else if (text && (data_bytes.length - index === 3)){// если после кода ответа есть данные (их больше 3 crc) значит это запрос
            AddLog(1, text);
        }
        else{
            parseRequestFunction(code);
        }
    }

    /**
     * Получить дату
     */
    function getDate() {

        return {
            year: Helper.ParseInt2B(data_bytes, index),
            month: Helper.ParseInt(data_bytes, index + 2),
            day: Helper.ParseInt(data_bytes, index + 3),
            hour: Helper.ParseInt(data_bytes, index + 4),
            minutes: Helper.ParseInt(data_bytes, index + 5),
            seconds: Helper.ParseInt(data_bytes, index + 6)
        }
    }

    /**
     * Распарсить дату без секунд
     * @param {any} node
     */
    function parseDateTimeMinutes(node) {

        const { year, month, day, hour, minutes } = getDate();

        AddLog(6, `${year}.${month}.${day} ${hour}:${minutes}`, node);
    }

    /**
     * Распарсить дату с секундами
     * @param {any} node
     */
    function parseDateTimeSeconds(node){
        
        const { year, month, day, hour, minutes, seconds } = getDate();

        AddLog(6, `${year}.${month}.${day} ${hour}:${minutes}:${seconds}`, node);
    }

    function parseMeterSerial(node){
        AddLog(4, 'Заводской номер счетчика: ' + Helper.ParseInt4B(data_bytes, index), node);
    }

    /**
     * Добавить лог с типами значений
     * @param {any} node
     */
    function parseValueTypes(node){
        AddLog(1, 'Типы значений: ' + Helper.ParseValueTypes(data_bytes, index), node);
    }

    /**
     * Распарсить статус данных
     * @param {any} node
     */
    function parseDataStatus(node) {
        const code = parseInt(data_bytes[index], 16);
        let status;

        switch (code) {
            case 0:
                status = 'нормальные данные';
                break;
            case 1:
                status = 'событие повлияло на профиль (коррекция времени, пропадание питания)';
                break;
            case 2:
                status = 'переполнение пульсов';
                break;
            case 3:
                status = 'счетчик не измерял пульсы';
                break;
            default:
                status = 'Неизвестно';
        }

        AddLog(1, `Статус данных: ` + status, node);
    }

    /**
     * Разбор функции запроса Профиль коммерческих интервалов в именованных величинах (кВт*ч/кВар*ч) (0x03)
     */
    function parseCommercialProfileRequest() {
        const node = AddLog(1, 'Запрос профиля коммерческих интервалов в именованных величинах (кВт*ч/кВар*ч)');

        parseMeterSerial(node);
        parseValueTypes(node);
        const dtNode = AddTextLog('Начало первого интервала');
        parseDateTimeMinutes(dtNode);
        AddLog(2, `Количество интервалов ${Helper.ParseInt2B(data_bytes, index)}`, node);
    }

    /**
     * Разбор ответа Профиль коммерческих интервалов в именованных величинах (кВт*ч/кВар*ч) (0x03)
     */
    function parseCommercialProfileAnswer() {
        const node = AddTextLog('Профиль коммерческих интервалов в именованных величинах (кВт*ч/кВар*ч)');

        const dtNode = AddTextLog('Начало первого интервала', node);
        parseDateTimeMinutes(dtNode);

        let i = 1;
        while (index + 8 < data_bytes.length) {
            let dataNode = AddLog(8, `Интервал ${i++}: ${Helper.ParseDouble(data_bytes, index, true)}`, node);
            parseDataStatus(dataNode);
        }
    }

    /**
     * Разбор функции запроса показаний счетчика (0x04)
     */
    function parseEnergyRequest(){
        const node = AddLog(1, 'Запрос показаний счетчика');

        parseMeterSerial(node);
        parseValueTypes(node);

        parseDateTimeMinutes(node);
    }

    /**
     * Разбор ответа показаний счетчика (0x04)
     */
    function parseEnergyAnswer(){
        const node = AddTextLog('Показания счетчика, кВт*ч/кВар*ч');

        let i = 1;
        while(index + 8 < data_bytes.length){
            AddLog(8, `Параметр ${i++}: ${Helper.ParseDouble(data_bytes, index, true)}`, node);
        }
    }

    // Запрос времени
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

    /**
     * Ответ параметров счетчика. Новая версия протокола для 37 байт
     */
    function parseMeterParametersAnswer37(){
        const node = AddTextLog('Памаметры счетчика');

        AddLog(2, 'Идентификатор счетчика: ' + Helper.ParseInt2B(data_bytes, index), node);
        //AddLog(8, 'коэф-т преобразования: ', node); // TODO parse double 8
        AddLog(8, `коэф-т преобразования:  ${Helper.ParseDouble(data_bytes, index, true)}, КВт*час/импульс`, node);
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

        return node;
    }

    /**
     * Ответ параметров счетчика. Старая версия протокола для 38 байт
     */
    function parseMeterParametersAnswer38(){

        const node = parseMeterParametersAnswer37();

        // todo см. п. 4.5
        AddLog(1, 'идентификатор типа данных профилей счетчика: ' + parseInt(data_bytes[index], 16), node);
    }


    /**
     * Разбор функции запроса параметров электросети (мгновенки)
     */
    function parseInstantaneousReauest(){
        const node = AddLog(1, 'Запрос параметров электросети');

        parseMeterSerial(node);
        parseDateTimeSeconds(node);

        AddLog(2, 'Количество замеров: ' + Helper.ParseInt2B(data_bytes, index), node);
    }

    /**
     * Разбор ответа параметров электросети (мгновенки)
     */
    function parseInstantaneousAnswer() {
        const node = AddTextLog('Мгновенные величины');

        const count = Helper.ParseInt2B(data_bytes, index);
        const node2 = AddLog(2, `Количество замеров: ${count}`, node);
        for (let i = 0; i < count; i++) {
            parseDateTimeSeconds(node2);
            AddLog(4, 'типы значений (битовая маска)', node2);

            let measures = Helper.ParseInt4B(data_bytes, index);
            const node3 = AddLog(2, `Количество измерений: ${measures}`, node2);
            for (let j = 0; j < measures; j++) {
                AddLog(8, `значение одного параметра по фазам А/В/С/общий ${Helper.ParseDouble(data_bytes, index, true)}`, node3);
            }
        }
    }

    /**
     * Разбор данных
     */
    function parseData(){
        // Тип ответа можно понять только по размеру. других признаков нет
        const dataSize = data_bytes.length - index - CRC_SIZE;
        console.log(`Размер данных: ${dataSize}`);

        parseAnswerData(dataSize);
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