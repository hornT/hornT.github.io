const Helper = (function(){

    /**
     * Преобразование массива байт в целое
     * @param {array} data - массив данных
     * @param {number} start - начало чтения
     */
    function parseInt2B(data, start){
        return parseInt(data[start + 1] + data[start], 16);
    }

    /**
     * Преобразование массива байт в целое
     * @param {array} data - массив данных
     * @param {number} start - начало чтения
     */
    function parseInt4B(data, start){
        return parseInt(data[start + 3] + data[start + 2] + data[start + 1] + data[start], 16);
    }

    /**
     * Преобразование массива байт в double
     * @param {*} dataArr - массив данных
     * @param {*} start - начало чтения
     */
    function parseDouble(dataArr, start){
        // https://stackoverflow.com/questions/8361086/convert-byte-array-to-numbers-in-javascript
        const data = [
            parseInt(dataArr[start + 7], 16),
            parseInt(dataArr[start + 6], 16),
            parseInt(dataArr[start + 5], 16),
            parseInt(dataArr[start + 4], 16),
            parseInt(dataArr[start + 3], 16),
            parseInt(dataArr[start + 2], 16),
            parseInt(dataArr[start + 1], 16),
            parseInt(dataArr[start + 0], 16),
        ];

        const sign = (data[0] & 1 <<7 ) >> 7;
        const exponent = (((data[0] & 127) << 4) | (data[1] & ( 15 <<4 )) >>4);

        if(exponent == 0)
            return 0;

        if(exponent == 0x7ff)
            return (sign) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
        
        const mul = Math.pow(2, exponent - 1023 - 52);

        var mantissa = data[7] +
            data[6] * Math.pow(2, 8 * 1) +
            data[5] * Math.pow(2, 8 * 2) +
            data[4] * Math.pow(2, 8 * 3) +
            data[3] * Math.pow(2, 8 * 4) +
            data[2] * Math.pow(2, 8 * 5) +
            (data[1] & 15) * Math.pow(2, 8 * 6) +
            Math.pow(2, 52);

        return Math.pow(-1, sign) * mantissa * mul;
    }

    // 
    function parseValueTypes(data, start) {
        let val = parseInt(data[start], 16);
        let valTypes = [];

        if (val & 0x01)
            valTypes.push('A+');
        if (val & 0x02)
            valTypes.push('A-');
        if (val & 0x04)
            valTypes.push('R+');
        if (val & 0x08)
            valTypes.push('R-');
        if (val & 0x10)
            valTypes.push('Q1');
        if (val & 0x20)
            valTypes.push('Q2');
        if (val & 0x40)
            valTypes.push('Q3');
        if (val & 0x80)
            valTypes.push('Q4');

        return valTypes.join(', ');
    }

    return{
        ParseInt2B: parseInt2B,
        ParseInt4B: parseInt4B,
        ParseDouble: parseDouble,
        ParseValueTypes: parseValueTypes
    }
}());