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

    Exclude(num){
		const result = this.possibleValues.includes(num);
        this.possibleValues = this.possibleValues.filter(function(val){ return val !== num});

        if(this.possibleValues.length === 1){
            this.SetNum(this.possibleValues[0]);
        }

		return result;
    }

    SetNum(num){
        this.inp.value = this.num = num;
        this.isSolve = true;
        this.inp.classList.add('solved-num');
		console.debug('setnum. row: %s, column: %s, num: %s', this.row, this.column, num);
    }

    FillNotResolved(){
        if(this.isSolve === true){
            return;
        }
        this.inp.value = this.possibleValues;
    }

    get IsSolve() {
        return this.isSolve;
    }

    get Num() {
        return this.num;
    }

    get Row() {
        return this.row;
    }

    get Column() {
        return this.column;
    }

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
        // Исключаем по строке
        for(let i = 0; i < 9; i++){
            result = excludeNumberFromCell(mainArray[cell.Row][i], cell.Num) || result;
        }

        // Исключаем по колонке
        for(let i = 0; i < 9; i++){
            result = excludeNumberFromCell(mainArray[i][cell.Column], cell.Num) || result;
        }

        // Исключаем внутри блока
        const row = Math.floor(cell.Row / 3) * 3;
        const column = Math.floor(cell.Column / 3) * 3;
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                result = excludeNumberFromCell(mainArray[row + i][column + j], cell.Num) || result;
            }
        }

		return result;
    }

    function excludeNumberFromCell(currCell, num){
        if(currCell.IsSolve === true){
            return false;
        }
        
        const result = currCell.Exclude(num);
        if(currCell.IsSolve === true){
            excludeNumbers(currCell);
        }

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

	// Исключаем все повторения
	function excludeAllNumbers(){
		let res = false;
		for(let i = 0; i < 9; i++){
				for(let j = 0; j < 9; j++){
					res = excludeNumbers(mainArray[i][j]) || res;
				}
			}

		return res;
	}

    // Решаем
    function solve(){

        const solvedCells = [];
        // Заполняем массив решений значениями пользователя
        for(let i = 0; i < 9; i++){
            for(let j = 0; j < 9; j++){
                const cell = new SudokuCell(i, j);
                mainArray[i][j] = cell;
                if(cell.IsSolve === true){
                    solvedCells.push(cell);
                }
            }
        }

        let res = true;
        while(res === true){
			//res = false;
			// Исключить повторения
			res = excludeAllNumbers();
			// for(let i = 0; i < 9; i++){
				// for(let j = 0; j < 9; j++){
					// res = excludeNumbers(mainArray[i][j]) || res;
				// }
			// }
			// Установить "последнего героя"(остается единственный в строке, колонке, группе)
            res = setLastHeroes() || res;
        }

        // Заполнить нерешенные ячейки для дальнейшего анализа
        for(let i = 0; i < 9; i++){
            for(let j = 0; j < 9; j++){
                mainArray[i][j].FillNotResolved();
            }
        }
    }

    return{
        Solve: solve
    }
}());

