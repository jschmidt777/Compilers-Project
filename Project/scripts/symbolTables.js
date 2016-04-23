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
				program_scope.isZeroScope = true;
			}
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


	function scypeCheck(){
					var curBlock = null;
					var curBlockChildren = null;
					var foundRoot = false;
					var alpha = /(a-z)/;
					var string = /([a-z]| )/g;
					var integer = /(\d)/;
					var boolval = /(false|true)/;
					var count = 0;
					checkBlock();
					//first, check if there is already an id of the same name declared (error)
						//find the id when it was declared and assign the val
						//only do so if the type is correct (error otherwise)
						//if there is more than one of this id in the symbols, error
						//if the id isn't found, look back a scope and check if it was declared
							//if it's there, assign it the val (error otherwise)
					//then, check if the id being assigned to anything at all (warn)
					//last, some kind of warn if the id is never used

					function checkBlock(){
						if(!foundRoot){
							curBlock = curAST.root;
							foundRoot = true;
							curSymbolTable.createScope(curSymbolTable.curScope); 
							curBlockChildren = curBlock.children;
							checkBlockChildren();
						}else{
							curSymbolTable.curScope++;
							curSymbolTable.createScope(curSymbolTable.curScope);
							checkBlockChildren();
							curSymbolTable.curScope--;
							reinitializeParent();
							curSymbolTable.workingScope = curSymbolTable.scopeArr[curSymbolTable.curScope];

						}
						
					}

					
					function checkBlockChildren(){
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
									count--;
									curBlockChildren = curBlockChildren.children;
									checkBlockChildren();
									curBlockChildren = tempPtr;
									count = temp;
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
						if(curSymbolTable.workingScope.symbols.length > 0){// return ttue if the length is zero for the symbols
							var taLength = curSymbolTable.workingScope.symbols.length-1;
							while(taLength >= 0){
								if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[1].name){
									isSemanticError = true;
									putMessage("Error on line: " +curBlockChildren.children[1].linenum +". Redeclared variable: "+curBlockChildren.children[1].name+", in the same scope: "+curSymbolTable.workingScope.level+".");
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

					function checkPrint(){ //Fix so this sees that a declared var is referenced on whatever line this is on 
						if(curBlockChildren.children[0].name.match(/([a-z])/) && curBlockChildren.children[0].name.length == 1){ //&& !curBlockChildren.children[0].name.match(string)
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

					

					function checkAssignment(){ //checks the assignment of an identifier, and not just the assignment statments
						if(curSymbolTable.workingScope.symbols.length > 0){
							var taLength = curSymbolTable.workingScope.symbols.length-1;
								//debugger;
								while(taLength >= 0){
									/*if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[1].name){
										curSymbolTable.workingScope.symbols[taLength].linesReferencedOn.push(curBlockChildren.children[0].linenum);
										if(curBlockChildren.children[1] != undefined){
											if(checkType(curSymbolTable.workingScope.symbols[taLength])){
												return true;
											}else{
												isSemanticError = true;
											}
										}else{
											curSymbolTable.workingScope.symbols[taLength].isUsed = true;
											return true; //get here from running this in print; we just want to see if the identifier we're printing is declared
										}*/
									if(curSymbolTable.workingScope.symbols[taLength].id == curBlockChildren.children[0].name){
										curSymbolTable.workingScope.symbols[taLength].linesReferencedOn.push(curBlockChildren.children[0].linenum);
										if(curBlockChildren.children[1] != undefined){
											if(checkType(curSymbolTable.workingScope.symbols[taLength])){
												return true;
											}else{
												isSemanticError = true;
											}
										}else{
											curSymbolTable.workingScope.symbols[taLength].isUsed = true;
											return true; //get here from running this in print; we just want to see if the identifier we're printing is declared
										}
									}else{
										taLength--;
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
						if(parent.level != 0 ){ 
							var taLength = parent.symbols.length-1;	
								while(taLength >= 0){
									if(parent.symbols[taLength].id == curBlockChildren.children[1].name){
										parent.symbols[taLength].linesReferencedOn.push(curBlockChildren.children[1].linenum);
										reinitializeParent();
											if(checkType(parent.symbols[taLength])){
												return true;
											}else{
												isSemanticError = true;
											}
									}else if(parent.symbols[taLength].id == curBlockChildren.children[0].name){
										parent.symbols[taLength].linesReferencedOn.push(curBlockChildren.children[0].linenum);
										reinitializeParent();
											if(checkType(parent.symbols[taLength])){
												return true;
											}else{
												isSemanticError = true;
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
					}


				function lookToZeroScope(){ //WARN: this might be weird if I get something weird...
						//debugger;
						var zeroScope = curSymbolTable.scopeArr[0];
						for(i = 0; i < zeroScope.symbols.length; i++){
							if(zeroScope.symbols[i].id == curBlockChildren.children[0].name){
								//TYPECHECK
								zeroScope.symbols[i].linesReferencedOn.push(curBlockChildren.children[0].linenum);
								reinitializeParent();
								if(checkType(zeroScope.symbols[i])){
									return true;
								}else{
									isSemanticError = true;
								}
							}else if(zeroScope.symbols[i].id != curBlockChildren.children[1].name){
								putMessage("Error on line: " +curBlockChildren.children[1].linenum +". Undeclared variable: "+curBlockChildren.children[1].name+", in scope: "+curSymbolTable.curScope+".");
								isSemanticError = true;
								return false;
							}else if(zeroScope.symbols[i].id == curBlockChildren.children[1].name){
								//TYPECHECK
								zeroScope.symbols[i].linesReferencedOn.push(curBlockChildren.children[1].linenum);
								reinitializeParent();
								if(checkType(zeroScope.symbols[i])){
									return true;
								}else{
									isSemanticError = true;
								}
							}else if(zeroScope.symbols[i].id != curBlockChildren.children[0].name){
								putMessage("Error on line: " +curBlockChildren.children[0].linenum +". Undeclared variable: "+curBlockChildren.children[0].name+", in scope: "+curSymbolTable.curScope+".");
								isSemanticError = true;
								return false;
							}
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
							//debugger;
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
										return true;	
									}else if(curBlockChildren.children[1].id == undefined){
										putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Undeclared variable: " +curBlockChildren.children[1].name+".");
										return false;
									}else if(curBlockChildren.children[1].id != id.id){
										putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type.");
										return false;
									}	
								}else{
									longIntPtr = curBlockChildren.children[1];
									checkLongInt(id);
									if(isGoodInt){
										return true;
									}else{
										return false;
									}
								}
									
							}else{
								return true; //got here from print most likely
							}	
						}else if(id.type == "string"){//will change to check for each type
							if(curBlockChildren.children[1] != undefined){	
								if(curBlockChildren.children[1].name.match(string) || curBlockChildren.children[1].type == "string"){
									id.isInitialized = true;
									id.isUsed = true;
									return  true;
								}else{
									putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type string does not match RHS type.");
									return false;
								}
							}else{
								return true; //got here from print most likely
							}
						}else if(id.type == "boolean"){//will change to check for each type
							if(curBlockChildren.children[1] != undefined){	
								if(curBlockChildren.children[1].name.match(boolval) || curBlockChildren.children[1].type == "boolean"){
									id.isInitialized = true;
									id.isUsed = true;
									return  true;
								}else{
									putMessage("Error on line: "+ curBlockChildren.children[1].linenum + ", Type mismatch. LHS of type boolean does not match RHS type.");
									return  false;
								}
							}else{
								return true;
							}
						}

					}

					function checkLongInt(id){
						//debugger;
						if(longIntPtr.children[0].name.match(integer)){
							if(longIntPtr.children[1].name == "Add"){ 
								longIntPtr = longIntPtr.children[1];
								checkLongInt(id);
							}else if(longIntPtr.children[1].name.match(/[a-z]/) && longIntPtr.children[1].name != id.id){
								/*if(id.type == "int"){
										id.isInitialized = true;
										id.isUsed = true;
										isGoodInt = true;
										return true;
								}else{
									putMessage("Error on line: "+ longIntPtr.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type.");
									return false;
								}*/
								var tempPtr = curBlockChildren;
								curBlockChildren = longIntPtr;
								checkAssignment();
								curBlockChildren = tempPtr;
							}else if(longIntPtr.children[1].name == id.id){
								isGoodInt = true;
								return true;
							}else if(longIntPtr.children[1].name.match(integer)){
								isGoodInt = true;
								return true;
							}
						}else{
							putMessage("Error on line: "+ longIntPtr.children[1].linenum + ", Type mismatch. LHS of type int does not match RHS type.");
							return false;
						}
					}


					function checkVarAssigned(variable){ //checks if the variable we are assigning is declared and of the same type

					}
					
	}

	function checkSymbolTableWarns(){ //O(n^3), but if we really want to talk about efficiency, then don't look at this project haha
		for(k = 0; k < symbolTableArr.length; k++){	
			for(i = 0; i < symbolTableArr[k].scopeArr.length; i++){
				for(j = 0; j < symbolTableArr[k].scopeArr[i].symbols.length; j++){
					if(curSymbolTable.scopeArr[i].symbols[j].isInitialized == false){
						putMessage("Program "+k+" Warning: variable on line: "+curSymbolTable.scopeArr[i].symbols[j].line+" is not initialized.");
					}else if(curSymbolTable.scopeArr[i].symbols[j].linesReferencedOn.length > 0 && curSymbolTable.scopeArr[i].symbols[j].isInitialized == false){
						putMessage("Program "+k+" Warning: variable on line: "+curSymbolTable.scopeArr[i].symbols[j].line+" is used before being initialized.");
					}else if(curSymbolTable.scopeArr[i].symbols[j].isUsed == false || curSymbolTable.scopeArr[i].symbols[j].linesReferencedOn.length == 0){
						putMessage("Program "+k+" Warning: variable on line: "+curSymbolTable.scopeArr[i].symbols[j].line+" is not used.");
					}

				}
			}
		}
	}
	
	