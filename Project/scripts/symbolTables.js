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
				program_scope.parentScope = undefined;
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
					this.isUsed = false;
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
					var alpha = /(a-z)/;
					var string = /([a-z]| )/g;
					var integer = /(\d)/;
					var boolval = /(false|true)/;
					var count = 0;
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
							curSymbolTable.workingScope = curSymbolTable.scopeArr[curSymbolTable.curScope];
							
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
								var result = checkAssignment();
									if(result){
										curBlockChildren = tempPtr;
										count++;
										checkBlockChildren();
									}else if(!result){
										curBlockChildren = tempPtr;
										isSemanticError = true;
									}
							}else if(curBlockChildren[count].name == "Print"){
								var tempPtr = curBlockChildren;
								curBlockChildren = curBlockChildren[count];
								var result = checkPrint();
									if(result){
										curBlockChildren = tempPtr;
										count++;
										checkBlockChildren();
									}else if(!result){
										curBlockChildren = tempPtr;
										isSemanticError = true;
									}
							}else if(curBlockChildren[count].name == "If" || curBlockChildren[count].name == "While"){
								var tempPtr = curBlockChildren;
								curBlockChildren = curBlockChildren[count];
								var result = checkIfOrWhile();
									if(result){
										var temp = count;
										count = 1;
										curBlockChildren = curBlockChildren.parent;
										checkBlockChildren();
										count = temp;
										curBlockChildren = tempPtr;
										count++;
										checkBlockChildren();
									}else if(!result){
										curBlockChildren = tempPtr;
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


					function checkVarDecl(){
						if(curSymbolTable.workingScope.symbols.length > 0){// return ttue if the length is zero for the symbols
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

					function checkPrint(){
						if(curBlockChildren.children[0].name.match(/[a-z]/)){
							return checkAssignment(); 
						}else{
							return true;
						}
					}

					function checkIfOrWhile(){	
							if(curBlockChildren.children[0].children[0].name.match(alpha)){
								var tempPtr = curBlockChildren;
								curBlockChildren = curBlockChildren.children[0];
								checkAssignment();
								curBlockChildren = tempPtr;
									if(curBlockChildren.children[0].children[1].name.match(alpha)){
										var tempPtr = curBlockChildren;
										curBlockChildren = curBlockChildren.children[0];
										checkAssignment();
										curBlockChildren = tempPtr;
									}else{
										return true;
									}
							}
							if(curBlockChildren.children[0].children[1].name.match(alpha)){
								var tempPtr = curBlockChildren;
								curBlockChildren = curBlockChildren.children[0];
								checkAssignment();
								curBlockChildren = tempPtr;
							}else{
								return true;
							}
						/*if(curBlockChildren.children[0].children[0].name.match(alpha)){
							curBlockChildren = curBlockChildren.children[0].children[0];
							checkAssignment();
						}*/
						/*if(!curBlockChildren.children[0].children[1].name.match(alpha)){
							alert("Hi");
							if(curBlockChildren.children[0].children[0].name.match(alpha)){
								alert("Hi1");
								checkAssignment();

								if(curBlockChildren.children[0].children[1].children.length != 0){
									curBlockChildren = curBlockChildren.children[0].children[1].children;
									checkIforWhile();
								}
								
							}
								
						}else if(curBlockChildren.children[0].children[1].name.match(alpha)){
							checkAssignment();
							if(curBlockChildren.children[0].children[0].name.match(alpha)){
								return checkAssignment();
							}
						}*/
					}

					function checkAssignment(){ //checks the assignment of an identifier, and not just the assignment statments
						if(curSymbolTable.workingScope.symbols.length > 0){
							var taLength = curSymbolTable.workingScope.symbols.length-1;
								while(taLength >= 0){
									if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[0].name){
										if(curBlockChildren.children[1] != undefined){
											if(checkType(curSymbolTable.workingScope.symbols[taLength])){
												return true;
											}else{
												return false;
											}
										}else{
											curSymbolTable.workingScope.symbols[taLength].isUsed = true;
											return true; //get here from running this in print; we just want to see if the identifier we're printing is declared
										}
									}else{
										taLength--;
										if(taLength == -1){
											lookToParentScopes();
										}
									}
								}
						}else{
							lookToParentScopes();
						}
					}

					var parent = curSymbolTable.scopeArr[curSymbolTable.curScope].parentScope;
					var tempParent = parent;

					function lookToParentScopes(){
						if(parent != undefined){
							var taLength = parent.symbols.length-1;	
								while(taLength >= 0){
									if(parent.symbols[taLength].id == curBlockChildren.children[0].name){
										//parent.symbols[taLength].isInitialized = true;
										parent = tempParent;
										return true;
									}else{
										taLength--;
									}
								}
								if(parent.parentScope == undefined){
									lookToZeroScope();
								}else{
									parent = parent.parentScope;
									if(parent == undefined){
										lookToZeroScope();
									}else{
										lookToParentScopes();
									}
								}
						}else if(parent == undefined){
							/*var taLength = parent.symbols.length-1;
							if(taLength > -1){		
								while(taLength >= 0){
									if(parent.symbols[taLength].id == curBlockChildren.children[0].name){
										//parent.symbols[taLength].isInitialized = true;
										parent = tempParent;
										return true;
									}else{
										taLength--;
									}
								}
							}*/
							lookToZeroScope();
						}else{
							putMessage("Error on line: " +curBlockChildren.children[0].linenum +". Undeclared variable: "+curBlockChildren.children[0].name+", in scope: "+curSymbolTable.curScope+".");
							return false;
						}
					}

					function lookToZeroScope(){
						var zeroScope = curSymbolTable.scopeArr[0];
						for(i = 0; i < zeroScope.symbols.length; i++){
							if(zeroScope.symbols[i].id == curBlockChildren.children[0].name){
								parent = tempParent;
								return true;
							}else{
							putMessage("Error on line: " +curBlockChildren.children[0].linenum +". Undeclared variable: "+curBlockChildren.children[0].name+", in scope: "+curSymbolTable.curScope+".");
							return false;
							}
						}
					}


					function checkType(id){
						//TODO: make function to handle the innards of these if's, and add in the type of the RHS.
						if(id.type == "int"){
							if(curBlockChildren.children[1].name.match(integer)){
								//TODO: get this to work if there are more than one int (end can be either an id or an int)
								id.isInitialized = true;
								id.isUsed = true;
								return true;
							}else{
								putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type.");
								return false;
							}
						}else if(id.type == "string"){//will change to check for each type
							if(curBlockChildren.children[1].name.match(string)){
								id.isInitialized = true;
								id.isUsed = true;
								return true;
							}else{
								putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type string does not match RHS type.");
								return false;
							}
						}else if(id.type == "boolean"){//will change to check for each type
							if(curBlockChildren.children[1].name.match(boolval)){
								id.isInitialized = true;
								id.isUsed = true;
								return true;
							}else{
								putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type boolean does not match RHS type.");
								return false;
							}
						}

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

	function checkSymbolTableWarns(){ //O(n^3), but if we really want to talk about efficiency, then don't look at this project haha
		for(k = 0; k < symbolTableArr.length; k++){	
			for(i = 0; i < symbolTableArr[k].scopeArr.length; i++){
				for(j = 0; j < symbolTableArr[k].scopeArr[i].symbols.length; j++){
					if(curSymbolTable.scopeArr[i].symbols[j].isInitialized == false){
						putMessage("Program "+k+" Warning: variable on line: "+curSymbolTable.scopeArr[i].symbols[j].line+" is not initialized.");
					}
					if(curSymbolTable.scopeArr[i].symbols[j].isUsed == false){
						putMessage("Program "+k+" Warning: variable on line: "+curSymbolTable.scopeArr[i].symbols[j].line+" is not used.");
					}
				}
			}
		}
	}
	
	