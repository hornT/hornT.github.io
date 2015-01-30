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
	18: parseLongUnsigned, // Unsigned16  0…65 535
	// 19 compact array
	20: parseInteger64,// Integer64 - 2^63 …2^63-1
	21: parseUnsigned64,// Unsigned64 0...2^64-1
	// 22 enum
	23: parseFloat32,// float32 SIZE(4)
	24: parseFloat64,// float64 (SIZE(8)
	25: parseDateTime,// date_time SIZE(12)
	26: parseDate,// date SIZE(5)
	27: parseTime,// time SIZE(4)
};

var index = 0;
var bytes = [];

function parse(s, e){
	var dataStr = s.value;
	index = 0;
	console.log(dataStr);
	
	bytes = dataStr.replace(/\s+/g, ' ').split(/[-_ ]/);
	var type = parseInt(bytes[index], 16);
	var fragment = document.createDocumentFragment();
	parseFuncs[type](fragment);
	
	var logNode = document.querySelector('#log');
	while (logNode.firstChild) {
		logNode.removeChild(logNode.firstChild);
	}
	logNode.appendChild(fragment);
}

// Разбор массивов 01
function parseArray(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	var size = parseInt(bytes[index + 1], 16);
	node.innerHTML = bytes.slice(index, index + 2).join('-') + " - Массив размером " + size;
	
	index += 2;
	
	for(var i = 0; i < size; i++){
		var type = parseInt(bytes[index], 16);
		parseFuncs[type](node);
	}
}

// Разбор структуры 02
function parseStruct(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	var size = parseInt(bytes[index + 1], 16);
	node.innerHTML = bytes.slice(index, index + 2).join('-') + " - Структура размером " + size;
	
	index += 2;
	
	for(var i = 0; i < size; i++){
		var type = parseInt(bytes[index], 16);
		parseFuncs[type](node);
	}
}

// Разбор Integer32 05 (5)
function parseInteger32(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 4).join('-') + " - Integer32 = " + "";
	index += 5;
}

// Разбор Unsigned32 06 (6)
function parseUnsigned32(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 4).join('-') + " - Unsigned32 = " + "";
	index += 5;
}

// Разбор строки 09
function parseString(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	var size = parseInt(bytes[index + 1], 16);
	node.innerHTML = bytes.slice(index, index + 2).join('-') + " - Строка размером " + size + ": " + bytes.slice(index + 2, index + size + 2).join('-');
	index += 2 + size;
}

// Разбор Integer8 0F (15)
function parseInteger8(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index, index + 1).join('-') + " - Integer8 = " + "";
	index += 2;
}

// Разбор Integer16 10 (16)
function parseInteger16(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 2).join('-') + " - Integer16 = " + "";
	index += 3;
}

// Разбор Unsigned8 11 (17)
function parseUnsigned8(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	var val = parseInt(bytes[index + 1], 16);
	node.innerHTML = bytes.slice(index, index + 2).join('-') + " - Unsigned8 = " + val;
	
	index += 2;
}

// Разбор long_unsigned 12 (18)
function parseLongUnsigned(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	var val = parseInt(bytes[index + 1] + bytes[index + 2], 16);
	node.innerHTML = bytes.slice(index, index + 3).join('-') + " - unsigned = " + val;

	index += 3;
}

// Разбор Integer64 14 (20)
function parseInteger64(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 8).join('-') + " - Integer64 = " + "";
	index += 9;
}

// Разбор Unsigned64 15 (21)
function parseUnsigned64(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 8).join('-') + " - Unsigned64 = " + "";
	index += 9;
}

// Разбор float32 17 (23)
function parseFloat32(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 4).join('-') + " - float32 = " + "";
	index += 5;
}

// Разбор float64 18 (24)
function parseFloat64(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 8).join('-') + " - float64 = " + "";
	index += 9;
}

// Разбор date_time 19 (25)
function parseDateTime(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 12).join('-') + " - DateTime = " + "";
	index += 13;
}

// Разбор date 1A (26)
function parseDate(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 5).join('-') + " - Date = " + "";
	index += 6;
}

// Разбор time 1B (27)
function parseTime(element){
	var node = document.createElement('div');
	element.appendChild(node);
	
	node.innerHTML = bytes.slice(index + 1, index + 1 + 4).join('-') + " - Time = " + "";
	index += 5;
}