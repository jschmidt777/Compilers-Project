//symbolTables.js
//4/17/16

var isSemanticError = false;
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
			if(program_scope.level > 0){
				program_scope.parentScope = this.scopeArr[level-1];
			}else{
				program_scope.parentScope = null;
			}
			//scopes will be kept in order this way
			//since a new scope will only be added if there's a new block 
			//and there isn't a scope for that level already.
	}


	function scope(){
		this.level = 0; //this is the level of scope
		this.symbols = []; //the array of symbols associated with the scope
		this.parentScope = null;

			this.createSymbol = function(type, id, linenum){
			var scope_symbol = new symbol();
				scope_symbol.type = type;
				scope_symbol.id = id;
				scope_symbol.scope = this.level;
					/*if(scope_symbol.type == "string"){
						scope_symbol.val = "";
					}else if(scope_symbol.type == "int"){
						scope_symbol.val = "";
					}else if(scope_symbol.type == "boolean"){
						scope_symbol.val = "";
					}else{
						//this should never be hit
					}*/
				scope_symbol.line = linenum;
				this.symbols.push(scope_symbol);
			}

				function symbol(){
					this.id = "";
					this.type = "";
					this.scope = 0;
					this.line = 0;
					this.isInitialized = false;
					this.toString = function(){
						var result = "\tID:" + this.id + " TYPE:" + this.type + " LINE#:" + this.line +"\n";
						return result;		
					}
				}
			this.symbols.join("");
		}


	this.scypeCheck = function(){
					var curBlock = null;
					var curBlockChildren = null;
					var foundRoot = false;
					var string = /([a-z]| )/g;
					var integer = /(\d)/;
					var boolval = /(false|true)/;
					var count = 0;
					checkAST();
					checkSymbolTable();
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

					function checkBlock(){
						if(!foundRoot){
							curBlock = curAST.root;
							foundRoot = true;
							curSymbolTable.createScope(curSymbolTable.curScope); //THIS symboltable that we're looking at
							curBlockChildren = curBlock.children;
							checkBlockChildren();
						}else{
							curSymbolTable.curScope++;
							curSymbolTable.createScope(curSymbolTable.curScope);
							checkBlockChildren();
							curSymbolTable.workingScope = curSymbolTable.scopeArr[curSymbolTable.curScope-1];
							curSymbolTable.curScope--;
						}
						
					}

					
					function checkBlockChildren(){
						if(count < curBlockChildren.length){
							if(curBlockChildren[count].name == "VarDecl"){
								var tempPtr = curBlockChildren;
								curBlockChildren = curBlockChildren[count];
								var result = checkVarDecl();
									if(result){
										curBlockChildren = tempPtr;
										curSymbolTable.workingScope.createSymbol(curBlockChildren[count].children[0].name, curBlockChildren[count].children[1].name, curBlockChildren[count].children[1].linenum);
										count++;
										checkBlockChildren();
									}else if(!result){
										curBlockChildren = tempPtr;
										putMessage("Error on line: " +curBlockChildren[count].children[1].linenum +". Redeclared variable: "+curBlockChildren[count].children[1].name+", in the same scope: "+curSymbolTable.workingScope.level+".");
										isSemanticError = true;
									}
							}else if(curBlockChildren[count].name == "Assignment"){
								var tempPtr = curBlockChildren;
								curBlockChildren = curBlockChildren[count];
								//curSymbolTable.workingScope.createSymbol(null, curBlockChildren[count].children[0].name, curBlockChildren[count].children[0].linenum);
								var result = checkAssignment();
									if(result){
										curBlockChildren = tempPtr;
										count++;
										checkBlockChildren();
									}else if(!result){
										curBlockChildren = tempPtr;
										//putMessage("Error on line: " +curBlockChildren[count].children[0].linenum +". Undeclared variable: "+curBlockChildren[count].children[0].name+", in scope: "+curSymbolTable.workingScope.level+".");
										isSemanticError = true;
									}
							}else if(curBlockChildren[count].name == "BLOCK"){
								var tempPtr = curBlockChildren;
								var temp = count;
								curBlockChildren = curBlockChildren[count].children;
								count = 0;
								checkBlock();
								curBlockChildren = tempPtr;
								count = temp;
								count++;
								checkBlockChildren();
							}else{ //Leave this INNNNNN. Until I add checks for other statements!
								count++;
								checkBlockChildren();
							}
						}
						
					}

					var symbolCount = 0;

					function checkVarDecl(){
						if(curSymbolTable.workingScope.symbols.length > 0){// return ture if the length is zero for the symbols
							var taLength = curSymbolTable.workingScope.symbols.length-1;
							while(taLength >= 0){
								if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[1].name){
									return false;
								}else{
									taLength--;
								}
							}
							return true;
						}else{
							return true;
						}
					}

					function checkAssignment(){
						if(curSymbolTable.workingScope.symbols.length > 0){
							var taLength = curSymbolTable.workingScope.symbols.length-1;
							if(taLength > -1){	
								while(taLength >= 0){
									if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[0].name){
										curSymbolTable.workingScope.symbols[taLength].isInitialized = true;
										return true;
									}else{
										taLength--;
									}
								}
							}else{
								return lookToParentScopes();
							}
						}else{
							return lookToParentScopes();
						}
					}

					var parent = curSymbolTable.workingScope.parentScope;

					function lookToParentScopes(){
						if(parent != undefined || parent != null){
							var taLength = parent.symbols.length-1;
							if(taLength > -1){		
								while(taLength >= 0){
									if(parent.symbols[taLength].id == curBlockChildren.children[0].name){
										parent.symbols[taLength].isInitialized = true;
										parent = curSymbolTable.workingScope.parentScope;
										return true;
									}else{
										taLength--;
									}
								}
							}else{
								parent = parent.parentScope;
								lookToParentScopes();
							}
						}else if(parent == undefined || parent == null){
							putMessage("Error on line: " +curBlockChildren.children[0].linenum +". Undeclared variable: "+curBlockChildren.children[0].name+", in scope: "+curSymbolTable.curScope+".");
							return false;
						}
					}

					function checkSymbolTable(){

					}
	}

	this.toString = function(){
				var result = "";
				for(i = 0; i < this.scopeArr.length; i++){
					if(this.scopeArr[i].symbols.length == 0){
						//Don't add anything to the result if there isn't a defined symbol in a scope.
					}else{
						result += "\n"+"Scope" + i + "/" +this.scopeArr[i].symbols + "\n";
					}
				}
				return result;
			}

}
	
	