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
			this.workingScope = this.scopeArr[level]; //whenever there is a new scope created, it will be pointed to as the workingscope
			//scopes will be kept in order this way
			//since a new scope will only be added if there's a new block 
			//and there isn't a scope for that level already.
	}


	function scope(){
		this.level = 0; //this is the level of scope
		this.symbols = []; //the array of symbols associated with the scope
		this.symbols.join("");

			this.createSymbol = function(type, id, linenum){
			var scope_symbol = new symbol();
				scope_symbol.type = type;
				scope_symbol.id = id;
				scope_symbol.scope = this.level;
					if(scope_symbol.type == "string"){
						scope_symbol.val = "";
					}else if(scope_symbol.type == "int"){
						scope_symbol.val = "";
					}else if(scope_symbol.type == "boolean"){
						scope_symbol.val = "";
					}else{
						//this should never be hit
					}
				scope_symbol.line = linenum;
				this.symbols.push(scope_symbol);
			}

				function symbol(){
					this.id = "";
					this.type = "";
					this.scope = 0;
					this.val = "";
					this.line = 0;
					this.isInitialized = false;
					this.toString = function(){
						var result = "\tID:" + this.id + " TYPE:" + this.type + " LINE#:" + this.line +"\n";
						return result;		
					}
				}
		}


	this.toString = function(){
				var result = "";
				for(i = 0; i < this.scopeArr.length; i++){
					if(this.scopeArr[i].symbols.length == 0){
						result += "\n"+"Scope" + i + "/ Symbol(s) present, but declared in previous scope. \n";
					}else{
						result += "\n"+"Scope" + i + "/" +this.scopeArr[i].symbols + "\n";
					}
				}
				return result;
			}

	this.scypeCheck = function(){
					var curBlock = null;
					checkAST();
					//first, check if there is already an id of the same name declared (error)
						//find the id when it was declared and assign the val
						//only do so if the type is correct (error otherwise)
						//if there is more than one of this id in the symbols, error
						//if the id isn't found, look back a scope and check if it was declared
							//if it's there, assign it the val (error otherwise)
					//then, check if the id being assigned to anything at all (warn)
					//last, some kind of warn if the id is never used

					function checkAST(){
						checkBlock();
					}
				}

}
	
	