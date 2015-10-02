var parseFuncs = {
	1: parseArray, // Массив
	2: parseStruct, // Структура
	// 3 bool
	// 4 bit-string
	5: parseInteger32,// Integer32 -2 147 483 648… 2 147 483 647
	6: parseUnsigned32,// Unsigned32 0…4 294 967 295
	9: parseString, // Строка
	// 10 visible-string An ordered sequence of ASCII characters
	// 12 UTF8-string
	// 13 binary coded decimal
	15: parseInteger8,// Integer8 -128…127
	16: parseInteger16,// Integer16 -32 768…32 767
	17: parseUnsigned8, // Unsigned8 0…255
	18: parseUnsigned16, // Unsigned16  0…65 535
	// 19 compact array
	20: parseInteger64,// Integer64 - 2^63 …2^63-1
	21: parseUnsigned64,// Unsigned64 0...2^64-1
	// 22 enum
	23: parseFloat32,// float32 SIZE(4)
	24: parseFloat64,// float64 (SIZE(8)
	25: parseDateTime,// date_time SIZE(12)
	26: parseDate,// date SIZE(5)
	27: parseTime,// time SIZE(4)
	
	126: fullPacket, // 7E
};

var index = 0;
var data_bytes = [];

// Добавляет строку лога с данными разбора
function addLog(element, dataIndex, size, text){

	var node = document.createElement('div');
	element.appendChild(node);
	var start = index;
	node.innerHTML = data_bytes.slice(index, index + size + dataIndex).join('-') + " - " + text;
	//node.onclick = function(){ selectPacket(start, size + dataIndex); };
	
	index += dataIndex + size;
}

// Выделение конкретного пакета по нажатию на лог
function selectPacket(start, size){
	
	console.log('selectPacket. start: %s, size: %s', start, size);
	document.getElementById('dlmsPacket').focus();
    document.getElementById('dlmsPacket').setSelectionRange(start * 3, (start + size) * 3 - 1);
}

function parse(){
	var dPacket = document.querySelector('#dlmsPacket');
	var dataStr = dPacket.value;
	index = 0;
	//console.log(dataStr);
	
	dataStr = dataStr.replace(/[-_ ]/g, '');
	//dPacket.value = dataStr;
	//data_bytes = dataStr.split(/[-_ ]/);
	data_bytes = dataStr.match(/.{2}/g);
	dPacket.value = data_bytes.join('-');
	console.log('data_bytes.length: %s', data_bytes.length);
	
	var type = parseInt(data_bytes[index], 16);
	var fragment = document.createDocumentFragment();
	
	parseFuncs[type](fragment);
	
	// Очистка старого лога и добавление нового
	var logNode = document.querySelector('#log');
	while (logNode.firstChild) {
		logNode.removeChild(logNode.firstChild);
	}
	logNode.appendChild(fragment);
}

// Разбор пакета целиком
function fullPacket(element){
	// Выделить из пакетов данные и разобрать
	
	// разобрать заголовок пакета
	// 1 и последний элементы 7E
	// 2 - Формат -- A0
	// 3 длина
	// 4+5 адрес получателя
	// 6 адрес отправителя
	// 7 = 93 - control field (SNRM - Set normal response mode)
	// 8+9 CRC заголовка
	addLog(element, 1, 4, 'Integer32 = ' + val);
	
	// разобрать данные
	var type = parseInt(data_bytes[index], 16);
	parseFuncs[type](fragment);
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

// Разбор структуры 02
function parseStruct(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	var size = parseInt(data_bytes[index + 1], 16);
	node.innerHTML = data_bytes.slice(index, index + 2).join('-') + " - Структура размером " + size;
	
	index += 2;
	
	for(var i = 0; i < size; i++){
		var type = parseInt(data_bytes[index], 16);
		parseFuncs[type](node);
	}
}

// Разбор Integer32 05 (5)
function parseInteger32(element){
	
	var val = parseInt(data_bytes[index + 1], 16);
	addLog(element, 1, 4, 'Integer32 = ' + val);
}

// Разбор Unsigned32 06 (6)
function parseUnsigned32(element){

	var val = parseInt(data_bytes[index + 1], 16);
	addLog(element, 1, 4, 'Unsigned32 = ' + val);
}

// Разбор строки 09
function parseString(element){

	var size = parseInt(data_bytes[index + 1], 16);
	addLog(element, 2, size, 'Строка');
}

// Разбор Integer8 0F (15)
function parseInteger8(element){

	var val = parseInt(data_bytes[index + 1], 16);
	addLog(element, 1, 1, 'Integer8 = ' + val);
}

// Разбор Integer16 10 (16)
function parseInteger16(element){

	var val = parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 2, 'Integer16 = ' + val);
}

// Разбор Unsigned8 11 (17)
function parseUnsigned8(element){
	
	var val = parseInt(data_bytes[index + 1], 16);
	addLog(element, 1, 1, 'Unsigned8 = ' + val);
}

// Разбор long_unsigned 12 (18)
function parseUnsigned16(element){

	var val = parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 2, 'Unsigned16 = ' + val);
}

// Разбор Integer64 14 (20)
function parseInteger64(element){
	
	var val = 'hz'; //parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 8, 'Integer64 = ' + val);
}

// Разбор Unsigned64 15 (21)
function parseUnsigned64(element){

	var val = 'hz'; //parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 8, 'Unsigned64 = ' + val);
}

// Разбор float32 17 (23)
function parseFloat32(element){

	var val = 'hz'; //parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 4, 'Float32 = ' + val);
}

// Разбор float64 18 (24)
function parseFloat64(element){

	var val = 'hz'; //parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 8, 'Float64 = ' + val);
}

// Разбор date_time 19 (25)
function parseDateTime(element){

	var val = 'hz'; //parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 12, 'DateTime = ' + val);
}

// Разбор date 1A (26)
function parseDate(element){

	var val = 'hz'; //parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 5, 'Date = ' + val);
}

// Разбор time 1B (27)
function parseTime(element){

	var val = 'hz'; //parseInt(data_bytes[index + 1] + data_bytes[index + 2], 16);
	addLog(element, 1, 4, 'Time = ' + val);
}