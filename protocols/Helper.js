const Helper = (function(){

    function parseInt2B(data, start){
        return parseInt(data[start + 1] + data[start], 16);
    }

    function parseInt4B(data, start){
        return parseInt(data[start + 3] + data[start + 2] + data[start + 1] + data[start], 16);
    }

    return{
        ParseInt2B: parseInt2B,
        ParseInt4B: parseInt4B,
    }
}());