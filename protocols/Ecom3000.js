'use strict';

const Ecom3000Protocol = (function(){
    
    const CRC_SIZE = 2;

    /**
     * Сопоставление номера функции запроса с функцией разбора
     */
    const requestFunctions = {
        0x4E: parseOpenSession,  //78
        0x60: parseVersion,  //96
        0x73: parseCurrentEnergy,  //115
        0x7F: parseArchive,  //127
    }

    /**
     * Время без миллисекунд
     * @param {any} node
     */
    function parseDateTimeT1(node){
        AddLog(1, 'Секунды: ' + parseInt(data_bytes[index], 16), node);
        AddLog(1, 'Минуты: ' + parseInt(data_bytes[index], 16), node);
        AddLog(1, 'Часы: ' + parseInt(data_bytes[index], 16), node);
        AddLog(1, 'День: ' + parseInt(data_bytes[index], 16), node);
        AddLog(1, 'Месяц: ' + parseInt(data_bytes[index], 16), node);
        AddLog(2, 'Год: ' + Helper.ParseInt2B(data_bytes, index), node);
    }

    /**
     * Время без сезона
     * @param {any} node
     */
    function parseDateTimeT2(node) {
        AddLog(2, 'Миллисекунды: ' + Helper.ParseInt2B(data_bytes, index), node);
        parseDateTimeT1(node);
    }

    /**
     * Полное время
     * @param {any} node
     */
    function parseDateTimeT3(node) {
        parseDateTimeT2(node);
        AddLog(1, 'Сезон: (1 - лето)' + parseInt(data_bytes[index], 16), node);
    }

    /**
     * Распарсить статус данных 1
     * @param {any} node
     */
    function parseDataStatus1(node) {
        const code = parseInt(data_bytes[index], 16);
        let status = '';

        if (code & 0x01)
            status += 'выключенное питание, отказ платы  преобразователя. '
        if (code & 0x02)
            status += 'выход значения за пределы. '
        if (code & 0x04)
            status += 'ошибка при преобразовании по формуле. '
        if (code & 0x08)
            status += 'ошибка в значении по ссылке формулы. '
        if (code & 0x10)
            status += 'первый интервал после инициализации архивов. '
        if (code & 0x20)
            status += 'сдвиг времени (по команде ЦК). '
        if (code & 0x40)
            status += 'данные пока не готовы, опрос следует повторить позже. '
        if (code & 0x80)
            status += 'канал не описан (некорректно описан) в конфигурации. '

        AddLog(1, `Статус 1: ` + status, node);
    }

    /**
     * Распарсить статус данных 2
     * @param {any} node
     */
    function parseDataStatus2(node) {
        const code = parseInt(data_bytes[index], 16);
        let status = '';

        if (code & 0x01)
            status += 'перезагрузка по команде. '
        if (code & 0x02)
            status += 'временный характер отказа (на интервале были достоверные измерения). '
        if (code & 0x04)
            status += 'выход за пределы применимости формулы. '
        if (code & 0x08)
            status += 'выход за верхний предел. '
        if (code & 0x10)
            status += 'выход за нижний предел. '
        if (code & 0x20)
            status += 'специальный режим (глобальная авария). '

        AddLog(1, `Статус 2: ` + status, node);
    }

    /**
     * 78(0x4E)Открытие сессии
     * @param {number} dataSize
     */
    function parseOpenSession(dataSize) {
        AddLog(1, 'Открытие сессии');
    }

    /**
     * 96(0x60). Версия ПО
     * @param {number} dataSize 
     */
    function parseVersion(dataSize){
        AddLog(1, 'Версия ПО');

        if(dataSize === 1)
            return;

        AddLog(1, 'major номер версии: ' + parseInt(data_bytes[index], 16));
        AddLog(1, 'minor номер версии: ' + parseInt(data_bytes[index], 16));

        const dtNode = AddTextLog('Время');
        parseDateTimeT1(dtNode);
    }

    /**
     * 115(0x73). Текущие показания
     * @param {number} dataSize 
     */
    function parseCurrentEnergy(dataSize) {
        AddLog(1, 'Чтение привязанных к границе интервала накопительных итогов (Текущие показания)');

        AddLog(1, 'Тип: ' + parseInt(data_bytes[index], 16));
        AddLog(1, 'Начальный канал: ' + parseInt(data_bytes[index], 16));
        AddLog(1, 'Последний канал: ' + parseInt(data_bytes[index], 16));
        AddLog(1, 'Интервал: (0 - короткий, 1 - основной, 2 - сутки, 3 - месяц, 4 - год)' + parseInt(data_bytes[index], 16));


        if (dataSize === 5)
            return;

        let i = 1;
        while (index + 16 < data_bytes.length) {
            const dtNode = AddTextLog(`Канал ${i++}`);
            parseDateTimeT3(dtNode);
            AddLog(6, `Значение интервала: ${Helper.ParseFloat48(data_bytes, index)}`, dtNode);
        }
    }

    /**
     * 127(0x7F). Архивные значения по нескольким каналам за несколько интервалов времени
     * @param {number} dataSize
     */
    function parseArchive(dataSize) {
        AddLog(1, 'Архивные значения по нескольким каналам за несколько интервалов времени (фиксированные показания)');

        AddLog(1, 'Тип: ' + parseInt(data_bytes[index], 16));
        AddLog(1, 'Начальный канал: ' + parseInt(data_bytes[index], 16));
        AddLog(1, 'Последний канал: ' + parseInt(data_bytes[index], 16));

        const dtNode = AddTextLog('Время');
        parseDateTimeT3(dtNode);

        AddLog(1, 'Интервал: (0 - короткий, 1 - основной, 2 - сутки, 3 - месяц, 4 - год)' + parseInt(data_bytes[index], 16));
        AddLog(1, 'Количество интервалов: ' + parseInt(data_bytes[index], 16));

        if (dataSize === 16)
            return;

        const node = AddLog(2, 'Продолжительность интервала в минутах: ' + Helper.ParseInt2B(data_bytes, index));

        let i = 1;
        while (index + 8 < data_bytes.length) {
            parseDataStatus1(node);
            parseDataStatus2(node);
            AddLog(6, `Значение интервала ${i++}: ${Helper.ParseFloat48(data_bytes, index)}`, node);
        }
    }

    /**
     * Распарсить запрос или ответ
     */
    function parse(){
        
        AddLog(1, 'Номер УСПД: ' + parseInt(data_bytes[index], 16));
        const funcNum = parseInt(data_bytes[index], 16);
        // AddLog(1, 'Функция: ' + funcNum);

        const func = requestFunctions[funcNum];
        const dataSize = data_bytes.length - index - CRC_SIZE;
        if(func){
            func(dataSize);
        }
        else{
            AddLog(1, 'Неизвестная функция');
        }

        AddLog(2, 'Crc');
    }

    return{
        Parse: parse
    }

}());