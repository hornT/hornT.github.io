const Helper = (function(){

    function parseInt2B(data, start){
        return parseInt(data[start + 1] + data[start], 16);
    }

    function parseInt4B(data, start){
        return parseInt(data[start + 3] + data[start + 2] + data[start + 1] + data[start], 16);
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
        ParseValueTypes: parseValueTypes
    }
}());