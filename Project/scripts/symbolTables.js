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
									}else{
										putMessage("Error on line: " +curBlockChildren[count].children[1].linenum +". Redeclared variable "+curBlockChildren[count].children[1].name+" in the same scope "+curSymbolTable.workingScope.level+".");
										//isSemanticError
									}
							}else if(curBlockChildren[count].name == "Assignment"){
								var tempPtr = curBlockChildren;
								curBlockChildren = curBlockChildren[count];
								//curSymbolTable.workingScope.createSymbol(null, curBlockChildren[count].children[0].name, curBlockChildren[count].children[0].linenum);
								checkAssignment();
								curBlockChildren = tempPtr;
								count++;
								checkBlockChildren();
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
							}/*else{ //temporary... just wanted to see if this is doing what I think it's doing.
								count++;
								checkBlockChildren();
							}*/
						}
						
					}

					var symbolCount = 0;

					function checkVarDecl(){
					if(curSymbolTable.workingScope.symbols.length > 0){// return ture if the length is zero for the symbols
						alert("Hi!1");
						if(curBlockChildren.children[1].name == curSymbolTable.workingScope.symbols[symbolCount].id){
										alert("Hi!0");
										return false;
									}else if(symbolCount < curSymbolTable.workingScope.symbols.length) {
										symbolCount++;
										alert("Hi!2");
										checkVarDecl();
									}else{
										alert("Hi!3");
										symbolCount = 0;
										return true;
									}
						}else{
							alert("Hi!4");
							return true;
						}
					}

					function checkAssignment(){
						//Nested while loops? One for the scope, the other for symbol?
						var taSymbol = curBlockChildren.children[0];
						/*if(!curSymbolTable.workingScope.symbols.filter()){
								if(lookToParentScopes(curBlockChildren.children[0])){
									//We're good
								}else{
									putMessage("Error on line: "+ curBlockChildren.children[0].linenum +". Undeclared variable: "+curBlockChildren.children[0].name +"." );
								}		
						}else if(curSymbolTable.workingScope.symbols.indexOf(curBlockChildren.children[0]) == -1){//has to change, indexOf doesn't work for this kind of shit
							//we're good
						}*/
						/*for(i = 0; i < curSymbolTable.workingScope.symbols.length; i++){
							if(curBlockChildren.children[0].name == curSymbolTable.workingScope.symbols[i].id){
								if(!curSymbolTable.workingScope.symbols[i].isInitialized){
									curSymbolTable.workingScope.symbols[i].isInitialized = true;
								}
							}else{

							} 
														
						}*/
						
					}

					var levelCount = 1;

					function lookToParentScopes(id){
						var parent = curSymbolTable.scopeArr[curSymbolTable.workingScope.level-levelCount];
						if(parent != undefined){
							var result = parent.symbols.indexOf(id); //has to change, indexOf doesn't work for this kind of shit
							if(result > -1){
								parent.symbols[result].isInitialized = true;
								levelCount = 1;
								return true;
							}else{
								levelCount++;
								lookToParentScope(id);
							}
						}else{
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
						result += "\n"+"Scope" + i + "/ \n";
					}else{
						result += "\n"+"Scope" + i + "/" +this.scopeArr[i].symbols + "\n";
					}
				}
				return result;
			}

}
	
	