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
function traverseBlock(){
	if(!foundRoot){
		cstPtr = workingCST.root.children[childPtr];
		curAST.addNode("BLOCK", "branch");
		foundRoot = true;
		traverseStatementlist();
	}else{
		curAST.addNode("BLOCK", "branch");
		traverseStatementlist();
	}
	
	//go to the block's children and traverse them
}
                                    

function traverseStatementlist(){
		childPtr++; //We know the second child of a block will be a statmentlist
		if(cstPtr.children[childPtr].name == "Statementlist" && cstPtr.children[childPtr].children[0].name == "ε" ){
			//Must be an epsilon production Statementlist, so we're done
		}else{
			stmtListPtr = cstPtr;
			cstPtr = cstPtr.children[childPtr--];
			traverseStatement();
			cstPtr = stmtListPtr.children[childPtr+1];
			traverseStatementlist();
		}	
}

var stmtPtr = null; // point to the statment we are at
function traverseStatement(){
		if(cstPtr.children[childPtr].name == "Statement"){
			stmtPtr = cstPtr.children[childPtr].children[childPtr];
			switch(stmtPtr.name){
				case "VarDecl":
						traverseVarDecl();
						break;
				case "AssignmentStatement":
						traverseAssignment();
						//traverseVarDecl();
						break;
				case "PrintStatement":
						traversePrint();
						//traverseVarDecl();
					//This will change, but for testing, the thing that matters is that I see an output.
					break;
				default:
					break;
			}
			//traverseStatementlist();
			//maybe increment childPtr here?
			//cstPtr = stmtListPtr;
		}else if(cstPtr.children[childPtr].name == "Statementlist"){
			//a statement can have a child of statementlist
			traverseStatement();

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
		}else if (children[childPtr].name == "StringExpr"){  //these start with ", so skip that and go to the expr
			traverseStringExpr();
		}else{
			//just print what ever the identifier is. could get here from boolexpr or printexpr.
			curAST.addNode(children[childPtr].name, "leaf");
		}
	curAST.endChildren();
}

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
	var children = exprPtr.children[0].children;
	var childPtr = children.length-1;
		if(childPtr > 0){
			var boolOp = children[2].name;
			var boolOpName = null;
			if (boolOp == "=="){
				boolOpName = "Equal";
			}else if(boolOp == "!="){
				boolOpName = "NotEqual";
			}
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
}

var taString = []; //so one leaf node with the entire string can be created
function traverseStringExpr(){
	var children = exprPtr.children[1].children[0]; // looks at the stringchar child, which is a child of the string expr
	
		if(children.children[0].name != "\""){
			taString.push(children.children[0]);
			exprPtr = children.children[1]; //points to the next char 
			traverseExpression(); 
		}else{
			//must be an end quotation and we don't care about that so we're done
		}
	taString.join("");
	curAST.addNode(taString.toString(), "leaf");
	taString = "";
}


function traverseWhileExpr(){

}

function traverseIfExpr(){

}