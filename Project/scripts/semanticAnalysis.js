




var curAST = astArr[0];

//The CST we are currently analyzing
var workingCST = cstArr[0];

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
	var rootBlock = workingCST.cur.name;
	curAST.addNode(""+rootBlock+"", "branch");
	//traverseBlock();
	//workingCST.cur is how the children array will be accessed
}

function traverseBlock(){
	for(i = 0; i < workingCST.length; i++){
		if(workingCST[i].name == "Block"){
			//go to the blocks children and traverse them
			//curAST.addNode("BLOCK", "branch");
			//traverseStatements();
		}
	}
}