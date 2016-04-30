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
			if(program_scope.level > 0){
				program_scope.parentScope = this.scopeArr[level-1]; //floored?
			}else{
				program_scope.isZeroScope = true;
			}
			this.workingScope = this.scopeArr[level]; //whenever there is a new scope created, it will be pointed to as the workingscope
			
			//scopes will be kept in order this way
			//since a new scope will only be added if there's a new block 
			//and there isn't a scope for that level already.
	}


	function scope(){
		this.level = 0; //this is the level of scope
		this.symbols = []; //the array of symbols associated with the scope
		this.parentScope = null;
		this.isZeroScope = false;

			this.createSymbol = function(type, id, linenum){
			var scope_symbol = new symbol();
				scope_symbol.type = type;
				scope_symbol.id = id;
				scope_symbol.scope = this.level;
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
					this.linesReferencedOn = [];
					this.toString = function(){
						var result = "\tID:" + this.id + " TYPE:" + this.type + " LINE#:" + this.line +" LINES REFERENCED ON:" + this.linesReferencedOn+"\n";
						return result;		
					}
				}
			this.symbols.join("");
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


	function scypeCheck(){ //A recursive decent. TODO: Separate these functions out so this isn't a big god function.
					var curBlock = null;
					var curBlockChildren = null;
					var foundRoot = false;
					var alpha = /(a-z)/;
					var string = /([a-z]| )/g;
					var integer = /(\d)/;
					var boolval = /(false|true)/;
					var count = 0;
					checkBlock();
					

					function checkBlock(){
						//debugger;
						if(!foundRoot){
							curBlock = curAST.root;
							foundRoot = true;
							curSymbolTable.createScope(curSymbolTable.curScope); 
							curBlockChildren = curBlock.children;
							checkBlockChildren();
						}else{
							//may need to add a check here to add a scope change only if there's a block within a block
							//and create a new scope of the curscope.subscopecount otherwise
							//maybe just make a new scope each time, and just set it's parent?
							curSymbolTable.curScope++;
							curSymbolTable.createScope(curSymbolTable.curScope);
							checkBlockChildren();
							curSymbolTable.curScope--;
							reinitializeParent();
							curSymbolTable.workingScope = curSymbolTable.scopeArr[curSymbolTable.curScope];

						}
						
					}

					
					function checkBlockChildren(){
						//debugger;
						if(!isSemanticError){
							if(count < curBlockChildren.length){
								if(curBlockChildren[count].name == "VarDecl"){
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren[count];
									//debugger;
									checkVarDecl();
									curBlockChildren = tempPtr;
									count++;
									checkBlockChildren();
								}else if(curBlockChildren[count].name == "Assignment"){
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren[count];
									//debugger;
									checkAssignment();
									curBlockChildren = tempPtr;
									count++;
									checkBlockChildren();
								}else if(curBlockChildren[count].name == "Print"){
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren[count];
									checkPrint();
									curBlockChildren = tempPtr;
									count++;
									checkBlockChildren();
								}else if(curBlockChildren[count].name == "If" || curBlockChildren[count].name == "While"){
									//debugger;
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren[count];
									checkIfOrWhile();
									var temp = count;
									count = 1;
									curBlockChildren = curBlockChildren.children;
									checkBlockChildren();
									curBlockChildren = tempPtr;
									count = temp;
									count++;
									checkBlockChildren();
								}else if(curBlockChildren[count].name == "BLOCK"){
									debugger;
									var tempPtr = curBlockChildren;
									var temp = count;
									curBlockChildren = curBlockChildren[count].children;
									count = 0;
									checkBlock();
									curBlockChildren = tempPtr;
									count = temp;
									//result = false;
									count++;
									checkBlockChildren();
								}else{ //Leave this INNNNNN. Until I add checks for other statements!
									/*count++;
									checkBlockChildren();*/
								}
							}
						}
							
					}


					function checkVarDecl(){
						if(curSymbolTable.workingScope.symbols.length > 0){// return true if the length is zero for the symbols
							var taLength = curSymbolTable.workingScope.symbols.length-1;
							while(taLength >= 0){
								if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[1].name){
									isSemanticError = true;
									putMessage("Error on line: " +curBlockChildren.children[1].linenum +". Redeclared variable: "+curBlockChildren.children[1].name+", in the same scope: "+curSymbolTable.workingScope.level+".");
									return false;
								}else{
									taLength--;
								}
							}
							curSymbolTable.workingScope.createSymbol(curBlockChildren.children[0].name, curBlockChildren.children[1].name, curBlockChildren.children[1].linenum);
							return true;
						}else{
							curSymbolTable.workingScope.createSymbol(curBlockChildren.children[0].name, curBlockChildren.children[1].name, curBlockChildren.children[1].linenum);
							return true;
						}
					}

					function checkPrint(){ 
						if(curBlockChildren.children[0].name == "Add"){
								longIntPtr = curBlockChildren.children[0];
								checkLongInt(); //returns true if the long integer we're printing is valid.
						}else if(curBlockChildren.children[0].name.match(/([a-z])/) && curBlockChildren.children[0].isString == undefined){ 
								checkAssignment(); 
						}else{
							return true;
						}
					}

					function checkIfOrWhile(){	
							if(curBlockChildren.children[0].children[0] != undefined){
								if(curBlockChildren.children[0].children[0].name.match(/[a-z]/)){
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren.children[0];
									checkAssignment();
									curBlockChildren = tempPtr;
										if(curBlockChildren.children[0].children[1].name.match(/[a-z]/)){
											var tempPtr = curBlockChildren;
											curBlockChildren = curBlockChildren.children[0];
											checkAssignment();
											curBlockChildren = tempPtr;
										}else{
											return true;
										}
								}
							}else if(curBlockChildren.children[0].children[1] != undefined){
									if(curBlockChildren.children[0].children[1].name.match(alpha)){
										var tempPtr = curBlockChildren;
										curBlockChildren = curBlockChildren.children[0];
										checkAssignment();
										curBlockChildren = tempPtr;
									}
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

					var fromLongInt = false; //value to determine if we are checking a longer integer, so 1+2+3 or 1+2+a, as examples.

					function checkAssignment(){ //checks the assignment of an identifier, and not just the assignment statements
						if(curSymbolTable.workingScope.symbols.length > 0 && curSymbolTable.workingScope.level != 0){ //want to fall through to look to zero scopes if we are already at zero scope
							var taLength = curSymbolTable.workingScope.symbols.length-1;
								while(taLength >= 0){
									if(fromLongInt){ 
										if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[1].name){
											curSymbolTable.workingScope.symbols[taLength].linesReferencedOn.push(curBlockChildren.children[0].linenum);
											if(curBlockChildren.children[1] != undefined){
												if(checkType(curSymbolTable.workingScope.symbols[taLength])){
													return true;
												}else{
													isSemanticError = true;
													return false;
												}
											}else{
												curSymbolTable.workingScope.symbols[taLength].isUsed = true;
												return true; //get here from running this in print; we just want to see if the identifier we're printing is declared
											}
										}else{
											taLength--;
										}
									}else if(!fromLongInt){
										if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[0].name){
											curSymbolTable.workingScope.symbols[taLength].linesReferencedOn.push(curBlockChildren.children[0].linenum);
											if(curBlockChildren.children[1] != undefined){
												if(checkType(curSymbolTable.workingScope.symbols[taLength])){
													return true;
												}else{
													isSemanticError = true;
													return false;
												}
											}else{
												curSymbolTable.workingScope.symbols[taLength].isUsed = true;
												return true; //get here from running this in print; we just want to see if the identifier we're printing is declared
											}
										}else{
											taLength--;
										}
									}
								}
							parent = curSymbolTable.workingScope.parentScope;
							lookToParentScopes();
						}else{
							parent = curSymbolTable.workingScope.parentScope;
							lookToParentScopes();
						}
					}

					
					var parent = curSymbolTable.workingScope;
					var tempParent = parent;
					function lookToParentScopes(){
						if(parent != undefined){
								if(parent.level != 0 ){ 
									var taLength = parent.symbols.length-1;	
										while(taLength >= 0){
											if(fromLongInt){
												if(parent.symbols[taLength].id == curBlockChildren.children[1].name){
														parent.symbols[taLength].linesReferencedOn.push(curBlockChildren.children[1].linenum);
														if(checkType(parent.symbols[taLength])){
															reinitializeParent(); //matters a lot that I do this here since I change parent. may not even need two checks here either
															return true;
														}else{
															isSemanticError = true;
															return false;
														}
												}else{
													taLength--;
												}
											}
												if(parent.symbols[taLength].id == curBlockChildren.children[0].name){
														parent.symbols[taLength].linesReferencedOn.push(curBlockChildren.children[0].linenum);
														if(checkType(parent.symbols[taLength])){
															reinitializeParent();
															return true;
														}else{
															isSemanticError = true;
															return false;
														}
											}else{
												taLength--;
											}
										}
									parent = parent.parentScope;
									lookToParentScopes();
							}else{
								lookToZeroScope();
							}
						}else{
							lookToZeroScope();
						}
					}


				function lookToZeroScope(){ 
						var zeroScope = curSymbolTable.scopeArr[0];
						for(i = 0; i < zeroScope.symbols.length; i++){
							if(fromLongInt){
								if(zeroScope.symbols[i].id == curBlockChildren.children[1].name){
									zeroScope.symbols[i].linesReferencedOn.push(curBlockChildren.children[1].linenum);
									if(checkType(zeroScope.symbols[i])){
										reinitializeParent();
										return true;
									}else{
										isSemanticError = true;
										return false;
									}
								}
							}else{
								if(zeroScope.symbols[i].id == curBlockChildren.children[0].name){
									zeroScope.symbols[i].linesReferencedOn.push(curBlockChildren.children[0].linenum);
									if(checkType(zeroScope.symbols[i])){
										reinitializeParent(); 
										return true;
									}else{
										if(isGoodInt){
											fromLongInt = false;
											return true;
										}else{
											isSemanticError = true;
											return false;
										}
										
									}
								}
							
							}
						}
					//If we get out of the for loop without returning, then we have an error. This just says which one we actually output, depending how we got here.
					if(fromLongInt){
						if(curBlockChildren.children[1].name.match(/^([a-zA-Z]| ){1,}$/) && curBlockChildren.children[1].isString == true){//Think this may catch strings that are one letter but an error is thrown so yeah.
							putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type string.");
							isSemanticError = true;
							return false;
						}else if(curBlockChildren.children[1].name.match(/[a-z]/) && curBlockChildren.children[1].isString == undefined){ 
							putMessage("Error on line: " +curBlockChildren.children[1].linenum +". Undeclared variable: "+curBlockChildren.children[1].name+", in scope: "+curSymbolTable.curScope+".");
							isSemanticError = true;
							return false;
						}
					}else{
						putMessage("Error on line: " +curBlockChildren.children[0].linenum +". Undeclared variable: "+curBlockChildren.children[0].name+", in scope: "+curSymbolTable.curScope+".");
						isSemanticError = true;
						return false;
					}
				}


					function reinitializeParent(){
						parent = curSymbolTable.workingScope;
					}

					var longIntPtr = null;
					var isGoodInt = false;
					
					function checkType(id){
						//TODO: make function to handle the innards of these if's, and add in the type of the RHS.
						if(id.type == "int"){
							if(curBlockChildren.children[1] != undefined){
								if(curBlockChildren.children[1].name != "Add"){
									if(!curBlockChildren.children[1].name.match(/[a-z]/)){ 
										if(curBlockChildren.children[1].name.match(integer) || curBlockChildren.children[1].type == "int"){
											id.isInitialized = true;
											id.isUsed = true;
											return true;
										}else{
											putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type.");
											return false;
										}
									}else if(curBlockChildren.children[1].name.match(/[a-z]/) && curBlockChildren.children[1].name == id.id){
											id.isInitialized = true; //in case we got here from checking a long int expr, this will set that id to being used/ initialized
											id.isUsed = true;
										if(fromLongInt){ //this is just defensive in case we got something weird that could change the fromLongInt value.
											isGoodInt = true;
											return true;
										}else{
											return true;
										}
									}else if(curBlockChildren.children[1].name.match(/[a-z]/) && curBlockChildren.children[1].name != id.id){
										fromLongInt = true; //might have to change this to make it more consitent i.e add another bool global for this sit.
										checkAssignment();
									}else if(curBlockChildren.children[1].id == undefined){
										putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Undeclared variable: " +curBlockChildren.children[1].name+".");
										return false;
									}
								}else{
									longIntPtr = curBlockChildren.children[1];
									checkLongInt(id);
									if(isGoodInt){
										fromLongInt = false; //done checking the int, so we need to reinitialize this so it can be used again.
										return true;
									}else{
										putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type.");
										return false;
									}
								}
									
							}else{
								return true; //got here from print most likely
							}	
						}else if(id.type == "string"){
							if(curBlockChildren.children[1] != undefined){	
								if(curBlockChildren.children[1].type == "string" || (curBlockChildren.children[1].name.match(string) && curBlockChildren.children[1].isString)){
									id.isInitialized = true;
									id.isUsed = true;
									return  true;
									//TODO: Add else if to check assignment if we assign a variable to a variable
								}else if(fromLongInt){
									putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type string.");
									return false;
								}else{
									putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type string does not match RHS type.");
									return false;
								}
							}else{
								return true; //got here from print most likely
							}
						}else if(id.type == "boolean"){
							if(curBlockChildren.children[1] != undefined){	
								if(curBlockChildren.children[1].type == "boolean" || (curBlockChildren.children[1].name.match(boolval) && curBlockChildren.children[1].isString == undefined)){
									id.isInitialized = true;
									id.isUsed = true;
									return  true;
									//TODO: Add else if to check assignment if we assign a variable to a variable
								}else if(fromLongInt){
									putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type boolean.");
									return  false;
								}else{
									putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type boolean does not match RHS type.");
									return  false;
								}
							}else{
								return true;
							}
						}

					}

					function checkLongInt(id){ //when used with checkPrint, the id parameter is optional, so we will just be checking to see if there is a variable we need to check
						if(longIntPtr.children[0].name.match(integer)){
							if(longIntPtr.children[1].name == "Add"){ 
								longIntPtr = longIntPtr.children[1];
								checkLongInt(id);
							}else if(longIntPtr.children[1].name.match(/[a-z]/) && id == undefined && longIntPtr.children[1].isString == undefined && !longIntPtr.children[1].name.match(boolval)){ //must have gotten here from print, so check the variable
								var tempPtr = curBlockChildren;
								curBlockChildren = longIntPtr;
								fromLongInt = true;
								checkAssignment();
								curBlockChildren = tempPtr;
							}else if(longIntPtr.children[1].name.match(integer)){ 
								isGoodInt = true;
								return true;
							}else if(longIntPtr.children[1].name.match(boolval)){ 
								isGoodInt = false;
								return false;
							}else if(longIntPtr.children[1].name.match(string) && longIntPtr.children[1].isString == true){ 
								isGoodInt = false;
								return false;
							}else if(longIntPtr.children[1].name == id.id){//no way we get here without getting a defined id parameter
								isGoodInt = false;
								return false;
							}else if(longIntPtr.children[1].name.match(/[a-z]/) && longIntPtr.children[1].name != id.id && longIntPtr.children[1].isString == undefined && !longIntPtr.children[1].name.match(boolval)){ //no way we get here without getting a defined id parameter
								var tempPtr = curBlockChildren;
								curBlockChildren = longIntPtr;
								fromLongInt = true;
								checkAssignment();
								curBlockChildren = tempPtr;
							}
						}else{
							putMessage("Error on line: "+ longIntPtr.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type.");
							return false;
						}
					}
					
	}

	function checkSymbolTableWarns(){ //O(n^3), but if we really want to talk about efficiency, then don't look at this project haha
		for(k = 0; k < symbolTableArr.length; k++){	
			for(i = 0; i < symbolTableArr[k].scopeArr.length; i++){
				for(j = 0; j < symbolTableArr[k].scopeArr[i].symbols.length; j++){
					if(curSymbolTable.scopeArr[i].symbols[j].isInitialized == false){
						putMessage("Program "+k+" Warning: variable "+curSymbolTable.scopeArr[i].symbols[j].id+" on line: "+curSymbolTable.scopeArr[i].symbols[j].line+" is not initialized.");
					}else if(curSymbolTable.scopeArr[i].symbols[j].linesReferencedOn.length > 0 && curSymbolTable.scopeArr[i].symbols[j].isInitialized == false){
						putMessage("Program "+k+" Warning: variable "+curSymbolTable.scopeArr[i].symbols[j].id+" on line: "+curSymbolTable.scopeArr[i].symbols[j].line+" is used before being initialized.");
					}else if(curSymbolTable.scopeArr[i].symbols[j].linesReferencedOn.length == 0){
						putMessage("Program "+k+" Warning: variable "+curSymbolTable.scopeArr[i].symbols[j].id+" on line: "+curSymbolTable.scopeArr[i].symbols[j].line+" is not used.");
					}

				}
			}
		}
	}
	
	