//By Joseph Schmidt
//4-3-2016
//semanticAnalysis.js


var curAST = astArr[0];

//The CST we are currently analyzing
var workingCST = cstArr[0];
var foundRoot = false;

function semanticAnalysis(cstArr){
	for(i = 0; i < cstArr.length; i++){
		workingCST = cstArr[i];
		traverseCST();
	}
	var printASTs = astArr.join("END PROGRAM" + "\n");
	//could add the numbers with a for if I wanted but it's important just to know when a new program is processed.
    document.getElementById("taAST").value = printASTs.toString();
}

function traverseCST(){
	createAST(workingCST.num);
	curAST = astArr[workingCST.num-1];
	//The child of the root for any CST is going to be a block, so add that to the AST
	traverseBlock();
	//workingCST.cur is how the children array will be accessed
}

//I think this needs to work more like parse. Have a global that points to where
//I am at in the curCST, and GET the next node and start comparing.
var cstPtr = null;
var childPtr = 0; //points to the child of what node we're looking at
var stmtListPtr = null; //points to the current Statementlist we're looking at
var curBlock = null;
function traverseBlock(){
	if(!foundRoot){
		cstPtr = workingCST.root.children[childPtr];
		curBlock = workingCST.root.children[childPtr];
		curAST.addNode("BLOCK", "branch");
		foundRoot = true;
		traverseStatementlist();
	}else{
		curAST.addNode("BLOCK", "branch");
		//var temp = curBlock; //notes where we are in the main blocks statmentlists
		//curBlock = curBlock.children[0].children[0].children[1];
		//reset pointer for statement?
		traverseStatementlist();
		//curBlock = temp[childPtr];
		curAST.endChildren();
	}
}
                                    

function traverseStatementlist(){
		childPtr++; //We know the second child of a block will be a statmentlist
		if(curBlock.children[childPtr].name == "Statementlist" && curBlock.children[childPtr].children[0].name == "ε" ){
			//Must be an epsilon production Statementlist, so we're done
		}else{
			stmtListPtr = curBlock;
			curBlock = curBlock.children[childPtr--];
			traverseStatement();
			curBlock = stmtListPtr.children[childPtr+1];
			traverseStatementlist();
		}	
}

var stmtPtr = null; // point to the statment we are at
function traverseStatement(){
		if(curBlock.children[childPtr].name == "Statement"){
			stmtPtr = curBlock.children[childPtr].children[childPtr];
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
				default:
					break;
			}
			//traverseStatementlist();
			//maybe increment childPtr here?
			//cstPtr = stmtListPtr;
		}else if(curBlock.children[childPtr].name == "Statementlist"){
			//a statement can have a child of statementlist
			traverseStatement();
		}else if(curBlock.children[childPtr].name == "Block"){
			traverseBlock();
		}else{
			// the Statementlist could have nothing in it, so do something......
		}
}

var exprPtr = null; // point to the current expression we're looking at

//adds the children of the vardecl statment to the AST
function traverseVarDecl(){
	curAST.addNode(stmtPtr.name, "branch");
	var children = stmtPtr.children;
	for(i = 0; i < children.length; i++){
		curAST.addNode(children[i].name, "leaf");
	}
	curAST.endChildren();
}

function traversePrint(){
	curAST.addNode("Print", "branch");
	exprPtr = stmtPtr.children[2]; //point directly to the expression 
	traverseExpression();
	curAST.endChildren();
}

//travsersePrint same way: return once we meet a condition, in this case, get an expression
// go to traverseExpression, and that's all we need. we can skip the last paren bc well... we don't need it.

//again, this also needs to be modelled like parse, so maybe have separate fucntions for the diff types of expressions


function traverseAssignment(){
	curAST.addNode("Assignment", "branch");
	var children = stmtPtr.children; // get the children of the assignmnet stmt
 //this needs to be done with recurssion. traverse expr will deal with finer details
	var childPtr = 0;
	curAST.addNode(children[childPtr].name, "leaf");
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
			curAST.addNode(children[childPtr].name, "leaf");
		}
	curAST.endChildren();
}
//}else if (children[childPtr+1].name == "StringExpr"){  //these start with ", so skip that and go to the expr
//			traverseStringExpr();

function traverseIntExpr(){
	var children = exprPtr.children[0].children;
	var childPtr = children.length-1;
		if(childPtr > 0){
			curAST.addNode("Add", "branch")
			curAST.addNode(children[0].name, "leaf");	
			exprPtr = children[childPtr];
			traverseExpression(); 
			curAST.endChildren();
		}else{
			curAST.addNode(children[0].name, "leaf");
		}
}


function traverseBooleanExpr(){
	var children = null;
	if(exprPtr.children[0].children[0] != undefined){ //regularly looking at a boolexpr
		children = exprPtr.children[0].children;
		var childPtr = children.length-1;
		if(childPtr > 0){
			var boolOpName = assignBoolOp(children);
			curAST.addNode(boolOpName, "branch");
			if(children[1].children[0].children.length == 0){
				curAST.addNode(children[1].children[0].name, "leaf"); //the first expr before the bool op, though it can be an identfifier, so we check if it is here
			}else{
				curAST.addNode(children[1].children[0].children[0].name, "leaf"); //the first expr; before the boolop	
			}
			exprPtr = children[childPtr-1];	//the second expr; after the boolop
			traverseExpression(); 
			curAST.endChildren();
		}else{
			curAST.addNode(children[0].name, "leaf"); //we just get a boolval and we're done
		}
	}else{ //different pattern if we encounter an if or a while
		if(exprPtr.children.length == 1){
			curAST.addNode(exprPtr.children[0].name, "leaf");
		}else{
			var expr = exprPtr.children[1].children[0];
			var boolOpName = assignBoolOp(exprPtr.children);
			curAST.addNode(boolOpName, "branch");
			
			if (expr.name != "BooleanExpr"){
				curAST.addNode(expr.name, "leaf");
			}else{
				curAST.addNode(expr.children[0].name, "leaf");
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
	curAST.addNode(taOutputStr, "leaf");
	taString = [];
	strExprPtr = null;
	insideStr = false;
}

function traverseWhileExpr(){
	curAST.addNode("While", "branch");
	exprPtr = stmtPtr.children[1]; 
	traverseBooleanExpr(); //goes to booleanExpr, so a little inconsistent, but it's necessary to get the correct pointer
	curAST.endChildren();
}

function traverseIfExpr(){
	curAST.addNode("If", "branch");
	exprPtr = stmtPtr.children[1]; 
	traverseBooleanExpr(); //goes to booleanExpr, so a little inconsistent, but it's necessary to get the correct pointer
	curAST.endChildren();
}