'use strict';

class SudokuCell{
    constructor(i, j){
        this.row = i;
        this.column = j;
        this.inp = document.querySelector('#inp' + i + j);
        const val = parseInt(this.inp.value);

        if(isNaN(val)){
            // Empty cell
            this.isSolve = false;
            this.possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
        else{
            // User enter value
            this.num = val;
            this.isSolve = true;
            this.inp.classList.add('user-num');
        }
    }

    /**
     * Исключить из возможных вариантов данное число
     * @param {Number} num 
     */
    Exclude(num){
        if(this.isSolve === true){
            return false;
        }

		const result = this.possibleValues.includes(num);
        this.possibleValues = this.possibleValues.filter(function(val){ return val !== num});

        if(this.possibleValues.length === 1){
            this.SetNum(this.possibleValues[0]);
        }

		return result;
    }

    /**
     * Установить данное число в качестве решения
     * @param {Number} num 
     */
    SetNum(num){
        this.inp.value = this.num = num;
        this.isSolve = true;
        this.inp.classList.add('solved-num');
    }

    /**
     * Заполнить ячейку возможными значениями
     */
    FillNotResolved(){
        this.inp.value = this.possibleValues;
    }

    /**
     * Решена ли ячейка
     */
    get IsSolve() {
        return this.isSolve;
    }

    /**
     * Число в ячейке
     */
    get Num() {
        return this.num;
    }

    /**
     * Строка, на которой располагается ячейка
     */
    get Row() {
        return this.row;
    }

    /**
     * Колонка, на которой располагается ячейка
     */
    get Column() {
        return this.column;
    }

    /**
     * Возможные решения
     */
    get PossibleValues(){
        return this.possibleValues;
    }
}

var Sudoku = (function() {

    const allCells = [];
    // Решаем
    function solve(){

        // Заполняем массив решений значениями пользователя
        for(let i = 0; i < 9; i++){
            for(let j = 0; j < 9; j++){
                const cell = new SudokuCell(i, j);
                allCells.push(cell);
            }
        }

        allCells
            .filter(c => c.IsSolve === true)
            .forEach(c => excludeSimpleCell(c));

        let res = true;
        while(res === true){

            // Исключить самые простые
            res = excludeSimple() ||
            // Установить "последнего героя"(остается единственный в строке, колонке, группе)
            setLastHeroes() ||
            // Исключить числа на одной линии
            excludeNumbersFromBlocksByLines() ||
            // Исключить скрытые пары\тройки
            findHiddenPairsTriples(2) ||
            findHiddenPairsTriples(3);
        }

        // Заполнить нерешенные ячейки для дальнейшего анализа
        allCells
            .filter(c => c.IsSolve === false)
            .forEach(c => c.FillNotResolved());
    }

    /**
     * Исключить самые простые варианты
     */
    function excludeSimple(){
        let res = false;

        allCells
            .filter(c => c.IsSolve === true)
            .forEach(c => res = excludeSimpleCell(c) || res);

        return res;
    }

    /**
     * Исключить для данной ячейки, если она решена, все совпадения по строке, столбцу и блоку
     * @param {SudokuCell} cell 
     */
    function excludeSimpleCell(cell){
        let res = false;

        const row = Math.floor(cell.Row / 3) * 3;
        const column = Math.floor(cell.Column / 3) * 3;

        allCells
            .filter(c => c.IsSolve === false &&
                (
                    c.Row === cell.Row ||       // Все по строке
                    c.Column === cell.Column || // Все по колонке
                    (
                        // Все внутри блока
                        c.Column >= column && c.Column < column + 3 &&
                        c.Row >= row && c.Row < row + 3 
                    )
                )
            )
            .forEach(c => res = excludeNumberFromCell(c, cell.Num) || res);

        return res;
    }

    /**
     * Исключить из указанной ячейки заданное число
     * @param {SudokuCell} checkCell 
     * @param {Number} num 
     */
    function excludeNumberFromCell(checkCell, num){
        if(checkCell.IsSolve === true){
            return false;
        }
        
        const result = checkCell.Exclude(num);
        if(checkCell.IsSolve === true){
            excludeSimpleCell(checkCell);
        }

		return result;
    }

    /**
     * Установить поледнего героя (остается единственный в строке, колонке, группе)
     */
    function setLastHeroes(){
        const processCells = allCells.filter(c => c.IsSolve === false);

        for(let num = 1; num <= 9; num++){
            // Ищем все числа от 1 до 9 в единственном экземпляре по колонке\строке
            let numCells = processCells.filter(c =>c.PossibleValues.includes(num));
            for(let i = 0; i < 9; i ++)
            {
                let rowCells = numCells.filter(c => c.Row === i);
                if(rowCells.length === 1){
                    // Нашли по строке
                    rowCells[0].SetNum(num);
                    return true;
                }

                let colCells = numCells.filter(c => c.Column === i);
                if(colCells.length === 1){
                    // Нашли по столбцу
                    colCells[0].SetNum(num);
                    return true;
                }
            }

            // TODO поиск по блоку
        }

        return false;
    }

    /**
     * Найти скрытые пары\тройки
     * @param {Number} ln 
     */
    function findHiddenPairsTriples(ln){
        let res = false;

        const processCells = allCells.filter(c => c.IsSolve === false);
        const possibleCells = processCells.filter(c => c.PossibleValues.length > 1 && c.PossibleValues.length <= ln)
        //const cells = processCells.filter(c => c.PossibleValues.length === ln);
        return processCells
            .filter(c => c.PossibleValues.length === ln)
            .some(c => findHiddenPairsTriplesForCell(c, possibleCells));
    }

    /**
     * 
     * @param {SudokuCell} checkCell 
     * @param {Array} possibleCells 
     */
    function findHiddenPairsTriplesForCell(checkCell, possibleCells){
        let res = false;

        const processCells = possibleCells
                                .filter(c => c.PossibleValues.every(function(v) { return checkCell.PossibleValues.includes(v); }));

        return findHiddenPairsTriplesForOtherCells(processCells, checkCell,
                function(c1, c2){ return c1.Row === c2.Row}, function(c){ return c.Column; }) ||
            findHiddenPairsTriplesForOtherCells(processCells, checkCell,
                function(c1, c2){ return c1.Column === c2.Column}, function(c){ return c.Row; });
    }

    /**
     * Найти скрытую пару\тройку для указанной ячейки
     * @param {SudokuCell} processCells 
     * @param {SudokuCell} checkCell 
     * @param {function} checkFn 
     * @param {function} excludeFn 
     */
    function findHiddenPairsTriplesForOtherCells(processCells, checkCell, checkFn, excludeFn){
        let res = false;
        const hiddenRowCells = processCells.filter(c => checkFn(c, checkCell));
        // Для пары должны быть 2 ячейки в строке, столбце, блоке (для тройки, соответственно 3)
        if(hiddenRowCells.length === checkCell.PossibleValues.length){
            allCells
                .filter(
                    c => c.IsSolve === false &&
                    checkFn(c, checkCell) === true &&
                    hiddenRowCells.map(h => excludeFn(h)).includes(excludeFn(c)) == false
            )
            .forEach(function(val){
                checkCell.PossibleValues.forEach(num => res = val.Exclude(num) || res );
            });
            
            if(res === true){
                return true;
            }
        }

        return false;
    }

    /**
     * Исключить числа на одной линии
     */
    function excludeNumbersFromBlocksByLines(){
        const processCells = allCells.filter(c => c.IsSolve === false);
        let res = false;

        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j ++){
                let blockCells = processCells
                                    .filter(c => c.Row >= i * 3 && c.Row < (i + 1) * 3
                                        && c.Column >= j * 3 && c.Column < (j + 1) * 3)
                if(blockCells.length === 0){
                    continue;
                }
                
                // Проверяем каждое число. Если оно встречается только в 1 колонке или строке
                // то исключаем его по этой же строке\колонке в соседних блоках
                for(let num = 1; num <= 9; num++){
                    let lineCells = blockCells.filter(c => c.PossibleValues.includes(num));
                    res = checkBlockLines(lineCells, num, i, j) || res;
                }
            }
        }

        return res;
    }

    /**
     * Проверка, в одну ли линию выставлено проверочное число в блоке
     * @param {*} lineCells 
     * @param {Number} num 
     * @param {Number} blockRow 
     * @param {Number} blockColumn 
     */
    function checkBlockLines(lineCells, num, blockRow, blockColumn){
        if(lineCells.length === 0){
            return false;
        }

        let res = false;

        const row = lineCells[0].Row;
        const column = lineCells[0].Column;

        const isRowLine = lineCells.every(c => c.Row === row);
        const isColumnLine = lineCells.every(c => c.Column === column);

        if(isRowLine === true){
            allCells
                .filter(c => c.IsSolve === false &&
                c.Row === row &&
                (c.Column < blockColumn * 3 || c.Column >= (blockColumn + 1) * 3))
                .forEach(c => res = c.Exclude(num) || res);
        }

        if(isColumnLine === true){
            allCells
                .filter(c => c.IsSolve === false &&
                c.Column === column &&
                (c.Row < blockRow * 3 || c.Row >= (blockRow + 1) * 3))
                .forEach(c => res = c.Exclude(num) || res);
        }

        return res;
    }

    return{
        Solve: solve
    }
}());