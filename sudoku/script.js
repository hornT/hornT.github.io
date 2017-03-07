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

        // TODO for test
        this.FillNotResolved();

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

		console.debug('setnum %s row: %s, column: %s', num, this.row, this.column);
    }

    /**
     * Заполнить ячейку возможными значениями
     */
    FillNotResolved(){
        // if(this.isSolve === true){
        //     return;
        // }
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

    const mainArray = [
            [], // 1
            [], // 2
            [], // 3
            [], // 4
            [], // 5
            [], // 6
            [], // 7
            [], // 8
            [], // 9
        ];

    function excludeNumbers(cell){
		if(!cell.Num){
			return false;
		}

		let result = false;
        

		return result;
    }

    

    function checkLastHeroUniqueByRow(value, row, column){
        for(let i = 0; i < 9; i++){
            if(column === i){
                continue;
            }

            let checkCell = mainArray[row][i];
            if(checkCell.IsSolve === true){
                continue;
            }

            if(checkCell.PossibleValues.includes(value) === true){
                return false;
            }
        }

        return true;
    }

    function checkLastHeroUniqueByColumn(value, row, column){
        for(let i = 0; i < 9; i++){
            if(row === i){
                continue;
            }

            let checkCell = mainArray[i][column];
            if(checkCell.IsSolve === true){
                continue;
            }

            if(checkCell.PossibleValues.includes(value) === true){
                return false;
            }
        }

        return true;
    }

    function checkLastHeroUniqueByBlock(value, row, column){
        const beginRow = Math.floor(row / 3) * 3;
        const beginColumn = Math.floor(column / 3) * 3;

        for(let i = 0; i < 3; i++){
            let currRow = beginRow + i;
            for(let j = 0; j < 3; j++){
                let currColumn = beginColumn + j;
                if(row === currRow && column === currColumn){
                    continue;
                }
                
                let checkCell = mainArray[currRow][currColumn];
                if(checkCell.IsSolve === true){
                    continue;
                }

                if(checkCell.PossibleValues.includes(value) === true){
                    return false;
                }
            }
        }

        return true;
    }

    function setLastHeroes(){

        let isSetValueExists = false;
        for(let i = 0; i < 9; i++){
            for(let j = 0; j < 9; j++){
                const checkCell = mainArray[i][j];
                if(checkCell.isSolve === true){
                    continue;
                }

                const res = checkCell.PossibleValues.some(function(val, index, array){
                    const valExists = checkLastHeroUniqueByRow(val, i, j) || checkLastHeroUniqueByColumn(val, i, j) || checkLastHeroUniqueByBlock(val, i, j);
                    if(valExists === true){
                        checkCell.SetNum(val);
						isSetValueExists = excludeNumbers(checkCell) || isSetValueExists;
                    }
                    return valExists;
                });

                isSetValueExists = isSetValueExists || res;
            }
        }

        return isSetValueExists;
    }

	function excludeNumbersFromBlocksByLine(){
		let result = false;

		for(let i = 0; i < 3; i++){
			for(let j = 0; j < 3; j++){
                // ячейки внутри блока
                let cells = mainArray
                            .slice(i * 3, (i + 1) * 3)
                            .reduce(function(prev, curr){ return [...prev, ...curr.slice(j * 3, (j + 1) * 3)] }, [])
                            .filter(function(cell){ return cell.IsSolve == false; });
				
				result = processNumbersInBlock(cells, i, j) || result;
			}
		}

		return result;
	}

    function processNumbersInBlock(cells, blockRow, blockColumn){
        let result = false;

        for(let i = 1; i <= 9; i++){
            // Ячейки, содержащие проверочное число
			let currCells = cells.filter(function(cell){
				return cell.PossibleValues.includes(i) === true;
			});
			// Если ячейки на одной строке\колонке, то исключем все остальные в этой строке других блоков
			if(currCells.length < 2){ // для 1 и менее ячеек нет смысла проверки
				continue;
			}

            const row = currCells[0].Row;
            const column = currCells[0].Column;

            const isRowLine = currCells.every(function(cell){ return cell.Row === row; });
            const isColumnLine = currCells.every(function(cell){ return cell.Column === column; });

            if(isRowLine === true){
                console.debug('exclude %s by row %s', i, row);
                mainArray[row]
                    .filter(function(cell, ind){ return ind < blockColumn * 3 || ind >= (blockColumn + 1) * 3 })
                    .forEach(function(cell){ result = cell.Exclude(i) || result; });
            }

            if(isColumnLine === true){
                console.debug('exclude %s by column %s', i, column);
                mainArray
                    .filter(function(cell, ind){ return ind < blockRow * 3 || ind >= (blockRow + 1) * 3 })
                    .forEach(function(arr){ result = arr[column].Exclude(i) || result; });
            }
        }

        return result;
    }

    function excludeHiddenPairsTriples(cell, ln){
        if(cell.PossibleValues.length !== ln){
            return false;
        }

        let result = false;

        //console.debug('поиск скрытых пар\троек(%s) для (%s, %s): %s', ln, cell.Row, cell.Column, cell.PossibleValues);

        // Поиск в строке
        result = excludeHiddenPairsTriplesFromCells(mainArray[cell.Row], cell, ln, function(cell){ return cell.Column; }) || result;

        // Поиск в столбце
        //excludeHiddenPairsTriplesFromColumn(cell, ln);
        // result = excludeHiddenPairsTriplesFromCells(mainArray.map(function(arr){
        //     return arr[cell.Column];
        // }), cell, ln, 
        // function(cell){ return cell.Row; }) || result;
        // Поиск в блоке
        
        return result;
    }

    function excludeHiddenPairsTriplesFromCells(cells, checkCell, ln, checkFn){
        let result = false;

        const hiddenCells = cells.filter(function(val){
            return val.IsSolve == false
                    && val.PossibleValues.length > 1
                    && val.PossibleValues.length <= checkCell.PossibleValues.length
                    && val.PossibleValues.every(function(v) { return checkCell.PossibleValues.includes(v); })
        });

        if(hiddenCells.length === ln){
            const excludeColumns = hiddenCells.map(checkFn);
            cells
            .filter(function(val){
                return val.IsSolve === false && excludeColumns.includes(checkFn(val)) === false;
            })
            .forEach(function(val){
                checkCell.PossibleValues.forEach(function(num){ result = val.Exclude(num) || result; });
            });
        }

        return result;
    }

	// Исключаем все повторения
	function excludeAllNumbers(){
		let res = false;
		// Исключаем для каждой ячейки
		for(let i = 0; i < 9; i++){
			for(let j = 0; j < 9; j++){
				res = excludeNumbers(mainArray[i][j]) || res;
			}
		}

		// Исключаем внутри блоков - если внутри блока все доступные двойки строятся в 1 линию, то в этой линии исключаем все двойки внутри других блоков
		res = excludeNumbersFromBlocksByLine() || res;

        // Ищем скрытые пары\тройки
		for(let i = 0; i < 9; i++){
			for(let j = 0; j < 9; j++){
                if(mainArray[i][j].IsSolve === true){
                    continue;
                }

				res = excludeHiddenPairsTriples(mainArray[i][j], 2) || res;
                res = excludeHiddenPairsTriples(mainArray[i][j], 3) || res;
			}
		}

		return res;
	}

    



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

        let res = true;
        while(res === true){

            // Исключить самые простые
            res = excludeSimple();
			// // Исключить повторения
			// res = excludeAllNumbers();
			// // Установить "последнего героя"(остается единственный в строке, колонке, группе)
            // res = setLastHeroes() || res;
        }

        // //excludeHiddenPairsTriples(mainArray[0][6], 2);
        // let c = mainArray[0][1];
        // excludeHiddenPairsTriplesFromCells(mainArray.map(function(arr){
        //     return arr[c.Column];
        // }), c, 2, 
        // function(cell){ return cell.Row; });

        // // Заполнить нерешенные ячейки для дальнейшего анализа
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
                        c.Column >= column * 3 && c.Column < (column + 1) * 3 &&
                        c.Row >= row * 3 && c.Row < (row + 1) * 3
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

    return{
        Solve: solve
    }
}());

