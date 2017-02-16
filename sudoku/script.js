'use strict';

class SudokuCell{
    constructor(i, j){
        this.row = i;
        this.column = j;
        this.inp = document.querySelector('#inp' + i + j);
        const val = parseInt(this.inp.value);

        console.debug('i: %s, j: %s, val: %s', i, j, val);

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
        this.possibleValues = this.possibleValues.filter(function(val){ return val !== num});

        if(this.possibleValues.length === 1){
            this.num = this.possibleValues[0];
            this.isSolve = true;
            this.inp.value = this.num;
            this.inp.classList.add('solved-num');
        }
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
        // Exclude by row
        for(let i = 0; i < 9; i++){
            excludeNumberFromCell(mainArray[cell.Row][i], cell.Num);
        }
        // Exclude by column
        for(let i = 0; i < 9; i++){
            excludeNumberFromCell(mainArray[i][cell.Column], cell.Num);
        }
        // Exclude by block
    }

    function excludeNumberFromCell(currCell, num){
        if(currCell.IsSolve === true){
            return;
        }
        
        currCell.Exclude(num);
        if(currCell.IsSolve === true){
            excludeNumbers(currCell);
        }
    }

    // Solve sudoku
    function solve(){

        const solvedCells = [];
        // Fill array
        for(let i = 0; i < 9; i++){
            for(let j = 0; j < 9; j++){
                const cell = new SudokuCell(i, j);
                mainArray[i][j] = cell;
                if(cell.IsSolve === true){
                    solvedCells.push(cell);
                }
            }
        }
        console.debug('solvedCells: %s', solvedCells.length);

        solvedCells.forEach(function(element) {
            excludeNumbers(element);
        });

        // Fill not resolved
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
