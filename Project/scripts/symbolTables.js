//symbolTables.js
//4/17/16


var symbolTableArr = []; //keeps track of each symboltable for each program

function createSymbolTable(num){
	var symbolTable = new symbolTable();
		symbolTable.num = num;
}

function symbolTable(){

	this.num = 0;
	var scopeArr = [];

	function createScope(level){
		var scope = new scope();
			this.level = level;
			scopeArr.push(scope); 
			//scopes will be kept in order this way
			//since a new scope will only be added if there's a new block 
			//and there isn't a scope for that level already.
	}


	function scope(){
		this.level = 0; //this is the level of scope
		this.symbols = []; //the array of symbols associated with the scope
	}

	function createSymbol(id, type, scope){
		var symbol = new symbol();
			symbol.id = id;
			symbol.type = type;
			symbol.scope = scope;
	}

	function symbol(){
		this.id = "";
		this.type = "";
		this.scope = 0;

	}

}