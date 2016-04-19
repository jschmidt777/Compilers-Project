//By Joseph Schmidt
//4-3-2016
//semanticAnalysis.js

//Globals
var curAST = null;
var curSymbolTable = null;
var curSymbol = null;
//var curScope = 0; //Keeps track of our current scope. May not need.
//This works similar to parse, in the way that I'm using recursive decent
//to find the patterns I need from a CST to make an AST. I use pointer to do this,
//which point to the key parts of the CST, and allow for extraction of those parts.

var stmtListPtr = null; 
var curBlock = null;
var stmtPtr = null; 
var exprPtr = null; 

//The CST we are currently analyzing
var workingCST = cstArr[0];
var foundRoot = false;

function semanticAnalysis(){
	var cstsLength = cstArr.length;
	for(i = cstsLength; i > 0; i--){
		workingCST = cstArr.shift();
		if(workingCST != undefined){
			createAST(workingCST.num);
			createSymbolTable(workingCST.num);
		}else{
			break;
		}
		curAST = astArr[workingCST.num-1];
		curSymbolTable = symbolTableArr[workingCST.num-1];
		traverseCST(); //Make the AST first, then do scope and type checking
		putMessage("\n"+"Created AST for program " + workingCST.num +"\n");
		curSymbolTable.scypeCheck();
	}
}

function traverseCST(theCST){
	foundRoot = false;
	//The child of the root for any CST is going to be a block, so add that to the AST
	traverseBlock();
}


function traverseBlock(){
	if(!foundRoot){
		curBlock = workingCST.root.children[0];
		curAST.addNode("BLOCK", "branch", curBlock.linenum);
		foundRoot = true;
		//curSymbolTable.createScope(curSymbolTable.curScope); //The curScope is zero at this point.
		traverseStatementlist();
	}else{
		curAST.addNode("BLOCK", "branch", curBlock.linenum);
		//curSymbolTable.curScope++;
		//curSymbolTable.createScope(curSymbolTable.curScope); //Already points at our new scope we create
		traverseStatementlist();
		//curSymbolTable.curScope--;
		curAST.endChildren();
	}
}
                                    

function traverseStatementlist(){
			//We know the second child of a block will be a statmentlist
		if(curBlock.children[1].name == "Statementlist" && curBlock.children[1].children[0].name == "ε" ){
			//Must be an epsilon production Statementlist, so we're done
		}else{
			stmtListPtr = curBlock;
			curBlock = curBlock.children[1];
			traverseStatement();
			curBlock = stmtListPtr.children[1];
			traverseStatementlist();
			curAST.endChildren(); //This closes off the block 
		}	
}


function traverseStatement(){
		if(curBlock.children[0].name == "Statement"){
			stmtPtr = curBlock.children[0].children[0];
			switch(stmtPtr.name){
				case "VarDecl":
						traverseVarDecl();
						break;
				case "AssignmentStatement":
						traverseAssignment();
						break;
				case "PrintStatement":
						traversePrint();
						break;
				case "WhileStatement":
						traverseWhileExpr();
						break;
				case "IfStatement":
						traverseIfExpr();
						break;
				case "Block":
						var temp = curBlock;
						curBlock = stmtPtr;
						traverseBlock();
						curBlock = temp;
						traverseStatementlist();
						break;
				default:
					break;
			}
		}else if(curBlock.children[0].name == "Statementlist"){
			//a statement can have a child of statementlist
			traverseStatement();
		}else{
			// the Statementlist could have nothing in it, so do something......
		}
}


//adds the children of the vardecl statment to the AST
function traverseVarDecl(){
	var children = stmtPtr.children;
	curAST.addNode("VarDecl", "branch", children[0].linenum);
	curAST.addNode(children[0].name, "leaf", children[0].linenum);
	curAST.addNode(children[1].name, "leaf", children[1].linenum);
	curAST.endChildren();
}

function traversePrint(){
	curAST.addNode("Print", "branch", stmtPtr.linenum);
	exprPtr = stmtPtr.children[2]; //point directly to the expression 
	traverseExpression();
	curAST.endChildren();
}

//travsersePrint same way: return once we meet a condition, in this case, get an expression
// go to traverseExpression, and that's all we need. we can skip the last paren bc well... we don't need it.

//again, this also needs to be modelled like parse, so maybe have separate fucntions for the diff types of expressions


function traverseAssignment(){
	curAST.addNode("Assignment", "branch", stmtPtr.linenum);
	var children = stmtPtr.children; // get the children of the assignmnet stmt
	var childPtr = 0;
	curAST.addNode(children[childPtr].name, "leaf", children[childPtr].linenum);
	childPtr = children.length-1;
		if (children[childPtr].name == "Expression"){
			exprPtr = stmtPtr.children[childPtr]; 
			traverseExpression();
		}	
	curAST.endChildren();
}


function traverseExpression(){
	var children = exprPtr.children; // get the children of the expression
	var childPtr = 0;
		if(children[childPtr].name == "IntExpr"){
			traverseIntExpr();
		}else if (children[childPtr].name == "BooleanExpr"){
			traverseBooleanExpr();
		}else if (children[childPtr].name == "\""){  //these start with ", so skip that and go to the expr
			traverseStringExpr();
			createString();
		}else{
			//just print what ever the identifier is. could get here from boolexpr or printexpr.
			curAST.addNode(children[childPtr].name, "leaf", children[childPtr].linenum);
		}
}

function traverseIntExpr(){
	var children = exprPtr.children[0].children;
	var childPtr = children.length-1;
		if(childPtr > 0){
			curAST.addNode("Add", "branch", children[0].linenum)
			curAST.addNode(children[0].name, "leaf", children[0].linenum);	
			exprPtr = children[childPtr];
			traverseExpression(); 
			curAST.endChildren();
		}else{
			curAST.addNode(children[0].name, "leaf", children[0].linenum);
		}
}


function traverseBooleanExpr(){
	var children = null;
	if(exprPtr.children[0].children[0] != undefined){ //regularly looking at a boolexpr
		children = exprPtr.children[0].children;
		var childPtr = children.length-1;
		if(childPtr > 0){
			var boolOpName = assignBoolOp(children);
			curAST.addNode(boolOpName, "branch", children[1].linenum);
			if(children[1].children[0].children.length == 0){
				curAST.addNode(children[1].children[0].name, "leaf"); //the first expr before the bool op, though it can be an identfifier, so we check if it is here
			}else{
				curAST.addNode(children[1].children[0].children[0].name, "leaf", children[1].children[0].children[0].linenum); //the first expr; before the boolop	
			}
			exprPtr = children[childPtr-1];	//the second expr; after the boolop
			traverseExpression(); 
			curAST.endChildren();
		}else{
			curAST.addNode(children[0].name, "leaf", children[0].linenum); //we just get a boolval and we're done
		}
	}else{ //different pattern if we encounter an if or a while
		if(exprPtr.children.length == 1){
			curAST.addNode(exprPtr.children[0].name, "leaf", exprPtr.children[0].linenum);
		}else{
			var expr = exprPtr.children[1].children[0];
			var boolOpName = assignBoolOp(exprPtr.children);
			curAST.addNode(boolOpName, "branch", exprPtr.children[1].children[0].linenum);
			
			if (expr.name != "BooleanExpr"){
				curAST.addNode(expr.name, "leaf", expr.linenum);
			}else{
				curAST.addNode(expr.children[0].name, "leaf", expr.children[0].linenum);
			}
			exprPtr = exprPtr.children[3];
			traverseExpression();
			curAST.endChildren();
		}
	}
	
}

function assignBoolOp(ptr){
	var boolOp = ptr[2].name;
	var boolOpName = null;
		if (boolOp == "=="){
			boolOpName = "Equal";
		}else if(boolOp == "!="){
			boolOpName = "NotEqual";
		}
	return boolOpName;
}

var taString = []; //so one leaf node with the entire string can be created
var strExprPtr = null; //this is consistent since we are no longer trying to look at an expr, but rather a strExpr
var insideStr = false;
function traverseStringExpr(){
	if(!insideStr){
    	strExprPtr = exprPtr.children[1].children[0]; // 
    	insideStr = true;
    }else{
    	strExprPtr = strExprPtr.children[0];
    }
    //Do this so we don't overshoot when looking at the last strExpr
    if(strExprPtr.children[0] != undefined){
		var stringChar = strExprPtr.children[0];
			if(stringChar.name != "\""){
				taString.push(stringChar.name);
				strExprPtr = strExprPtr.children[1];
				traverseStringExpr();
			} 
	}else{
		//We're done. Each stringExpr has been processed.
	}
}

//Creates the string to for the strExpr in the tree
function createString(){
	var taOutputStr = "";
	taOutputStr = taString.join("");
	curAST.addNode(taOutputStr, "leaf", exprPtr.linenum);
	taString = [];	
	strExprPtr = null;
	insideStr = false;
}

function traverseWhileExpr(){
	curAST.addNode("While", "branch");
	exprPtr = stmtPtr.children[1]; 
	traverseBooleanExpr(); //goes to booleanExpr, so a little inconsistent, but it's necessary to get the correct pointer
	
}

function traverseIfExpr(){
	curAST.addNode("If", "branch");
	exprPtr = stmtPtr.children[1]; 
	traverseBooleanExpr(); //goes to booleanExpr, so a little inconsistent, but it's necessary to get the correct pointer
}