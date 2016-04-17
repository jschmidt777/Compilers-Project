//symbolTables.js
//4/17/16


var symbolTableArr = []; //keeps track of each symboltable for each program

function createSymbolTable(num){
	var symbolTable = new symbTable();
		symbolTable.num = num;
		symbolTableArr.push(symbolTable);
}

function symbTable(){
	
	this.scopeArr = [];
	this.num = 0;
	this.curScope = 0;
	this.workingScope = null;
	

	this.createScope = function(level){
		var program_scope = new scope();
			program_scope.level = level;
			this.scopeArr.push(program_scope); 
			workingScope = this.scopeArr[level]; //whenever there is a new scope created, it will be pointed to as the workingscope
			//scopes will be kept in order this way
			//since a new scope will only be added if there's a new block 
			//and there isn't a scope for that level already.
	}


	function scope(){
		this.level = 0; //this is the level of scope
		this.symbols = []; //the array of symbols associated with the scope
	}

	this.createSymbol = function(id, type, scope, val){
		var scope_symbol = new symbol();
			scope_symbol.id = id;
			scope_symbol.type = type;
			scope_symbol.scope = scope;
			scope_symbol.val = val;
			workingScope.symbols.push(scope_symbol);
	}

	function symbol(){
		this.id = "";
		this.type = "";
		this.scope = 0;
		this.val = "";

	}

	//TODO: add toString

}