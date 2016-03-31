/*parse.js*/ 

//Note: the parse functions are written in order of their production
//so it first looks to see if it's a program, then a block, then a statement... etc.
//See grammar.pdf on labouseur.com under "Compilers" to see the productions in more detail.

//TODO: Verbose functionality
    //Elvish verbose output? (use a plugin?)

    /*Parse Globals*/
    //Some are on runpage.js as well
    var verboseModeSet = false;
    var isParseError = false;
    var warningCount = 0;
    var programCount = 1;

    // Create the CST. If it's used, great. Otherwise, space is cheap, so it just won't be outputted.
    var cst = new Tree();

    function reset(){
        //Call after each program to reset values...
        //After more source code is inputted
    }

    function parse() {
        putMessage("\n" + "-------------------------------------------");
        putMessage( "Parsing "+ tokens.length +" tokens from the lexical analysis.");
        putMessage("-------------------------------------------");
        putMessage("\n");
        // Grab the next token.
        currentToken = getNextToken();
        // A valid parse derives the program production, so begin there.
        parseProgram();
        // Report the results.
        if(isParseError == false){
            putMessage("\n");
            putMessage("Parse Successful!");
            putMessage("Parse found " + warningCount + " warning(s).");
        }else{
            putMessage("\n" + "------------------------");
            putMessage("Parse Unsuccessful.");
            putMessage("Parse found " + errorCount + " error(s)."); //There shouldn't be more than one, but I like having this in
            putMessage("Parse found " + warningCount + " warning(s).");  
        } 
    }
    /*
    {
        string a
        a = "duhduhduh"
        {
            int a
        }
    }*/
    
    function parseProgram() {
        // A program production can only produce a block, so parse the block production.
        if(!isParseError){
            putMessage("\n" + "---------------------------");
            putMessage( "Parsing program "+ programCount +".");
            putMessage("---------------------------");
            putMessage("\n");
        }
        cst.addNode("Program", "branch");
        parseBlock();
        //cst.endChildren();
        matchAndConsume("EOF");
        document.getElementById("taCST").value = "";
        document.getElementById("taCST").value += cst.toString() + "\n";
        if (tokenIndex < tokens.length){
            programCount++;
            //cst = new Tree();
            parseProgram();
        } //Otherwise we're done

    }

    function parseBlock() {
        cst.addNode("Block", "branch");
        matchAndConsume("openBlock");
        parseStatementList();
        // The only thing that can be in a block is a statementlist
        matchAndConsume("closeBlock");
        cst.endChildren();
    }

    function parseStatementList(){
        cst.addNode("Statementlist", "branch");
        if(currentToken.kind == "keyword" || currentToken.kind == "identifier" || currentToken.kind == "openBlock"){
            parseStatement();
            cst.endChildren();
            parseStatementList();
            //could be more statements:
            //go back up the traversal
            //and reinitialize 
        }else{
            //Do nothing. Epsilon production.
        }
    }

    function parseStatement(){
        cst.addNode("Statement", "branch");
        if(currentToken.kind == "openBlock"){
            parseBlock();
            //go back to block since it must be an open block
        }else if (currentToken.kind == "keyword"){
            var keywordLexeme = currentToken.lexeme;
            switch(keywordLexeme){
                case "while":
                        parseWhileStatement();
                break;
                case "if":
                        parseIfStatement();
                break;
                case "print":
                        parsePrintStatement();
                break;
                //we're going to the same place
                //whether we get int, string, or boolean
                case "int":
                case "string":
                case "boolean":
                        parseVarDecl();
                break;
                default: putMessage("You broke me!");
                break;
            }
        }else if (currentToken.kind == "identifier"){
            // must be an identifier, which means an assignment statement
            parseAssignmentStatement();
        }
        cst.endChildren();
    }

    function parseWhileStatement(){
        cst.addNode("WhileStatement", "branch");
        matchAndConsume("while");
        parseBooleanExpr();
        cst.endChildren();
        //would think I need a parseBlock() here right?
        //since parseStatementList() gets called after the boolExpr
        //I actually don't need it
        //Also, there's no block production for a while statement
    }

    function parseIfStatement(){
        cst.addNode("IfStatement", "branch");
        matchAndConsume("if");
        parseBooleanExpr();
        cst.endChildren();
        //would think I need a parseBlock() here right?
        //since parseStatementList() gets called after the boolExpr
        //I actually don't need it
        //Also, there's no block production for an if statement
    }

    function parsePrintStatement(){
        cst.addNode("PrintStatement", "branch");
        matchAndConsume("print");
        matchAndConsume("openParen");
        parseExpr();
        matchAndConsume("closeParen");
        cst.endChildren();
    }

    function parseVarDecl(){
        //could change this to take a parameter to make it more efficient
        cst.addNode("VarDecl" ,"branch");
        matchAndConsume("type");
        matchAndConsume("identifier");
        cst.endChildren();
    }

    function parseAssignmentStatement(){
        cst.addNode("AssignmentStatement" ,"branch");
        matchAndConsume("identifier");
        matchAndConsume("assign");
        parseExpr();
        cst.endChildren();
    }

    function parseExpr(){
        var expressionLexeme = currentToken.kind;
        cst.addNode("Expression", "branch");
        switch(expressionLexeme){
            case "digit":
                    parseIntExpr();
            break;
            case "openQuotation":
                    matchAndConsume("openQuotation");
                    parseStringExpr();
            break;
            case "identifier":
                    matchAndConsume("identifier");
            break;
            case "openParen":
            case "boolval":
                    parseBooleanExpr();
            break;
            default:
                    //putMessage("You broke me!");
            break;
        }
        cst.endChildren();
    }

    function parseIntExpr(){
        cst.addNode("IntExpr", "branch");
        matchAndConsume("digit");
        if(currentToken.kind == "add"){
            matchAndConsume("add");
            parseExpr();
        }else{
           //Just for constistency. No epsilon production. 
        }
        cst.endChildren();
    }


    function parseBooleanExpr(){
        cst.addNode("BooleanExpr" ,"branch");
        if(currentToken.kind == "openParen"){
            matchAndConsume("openParen");
            parseExpr();
            if (currentToken.kind == "testEquality"){
                matchAndConsume("testEquality");
            }else if (currentToken.kind == "testInEquality"){
                matchAndConsume("testInEquality");
            }
            parseExpr();
            matchAndConsume("closeParen");
        }else if (currentToken.kind == "boolval"){
            matchAndConsume("boolval");
        }
        cst.endChildren();
    }

    function parseStringExpr(){  
        cst.addNode("StringExpr" ,"branch");
        if (currentToken.kind == "stringChar"){
            consumeStringChar();
        }else{
            matchAndConsume("closeQuotation");
        }
        cst.endChildren();
    }

    function consumeStringChar(){
        cst.addNode("StringChar" ,"branch");
        matchAndConsume("stringChar"); 
        parseStringExpr();
        cst.endChildren();
    }

    function matchAndConsume(expectedKind) {
        // Validate that we have the expected token kind and get the next token.
        if(!isParseError){
            cst.addNode(currentToken.lexeme, "leaf");
            //May need to change this to see if it's undefined
        switch(expectedKind) {  
            case "EOF":
                            if(currentToken.kind == "closeBlock"){
                                checkExpectedKind(expectedKind);       //Seems odd, but it makes sense since it would be checking for the wrong kind otherwise
                            }else if (tokenIndex == tokens.length && currentToken.kind != expectedKind){ 
                                var lastCloseBlock = tokens[tokenIndex-1];
                                createToken("$", "EOF", lastCloseBlock.lineNum);
                                putMessage("Warning, EOF token not found, added on line " + lastCloseBlock.lineNum);
                                warningCount++;
                            }else{
                                checkExpectedKind(expectedKind);
                            }
                            break;
            case "openBlock":
            case "closeBlock":
            case "identifier":
            case "type":
            case "assign":
            case "add":
            case "digit":
            case "openQuotation":
            case "closeQuotation":
            case "stringChar":
            case "boolval": 
            case "testEquality":
            case "testInEquality":
            case "openParen":
            case "closeParen": 
            case "while":
            case "if":
            case "print":
                            checkExpectedKind(expectedKind);
                            break;                    
            default:        putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + " Line:" + currentToken.lineNum + ".");
                            break;			
        }
       }   
        // Consume another token, having just checked this one, because that 
        // will allow the code to see what's coming next... a sort of "look-ahead".
        currentToken = getNextToken();
    }

    function checkExpectedKind(expectedKind){
        var lineNum = currentToken.lineNum;
        var previousToken = tokens[tokenIndex-1].lineNum;
        if(lineNum == undefined){
            lineNum = previousToken;
        }else{
            //Keep line num as it is
            //This is only for EOF, since it will get a line number of undefined otherwise.
        }
        if(verboseModeSet){
            putMessage("Expecting a(n) " + expectedKind);
            if (expectedKind == "type"){
                if(currentToken.lexeme == "int" || currentToken.lexeme == "string" || currentToken.lexeme == "boolean" ){  //Didn't want to change lex to accomidate for types, so I did it here.
                    putMessage("Got a(n) "+ expectedKind + "!"); 
                }else{
                errorCount++;
                putMessage("NOT a(n) " + expectedKind + ". Error at position " + tokenIndex + " Line:" + 
                             lineNum +  ". Got a(n) " + currentToken.kind + ".");
                isParseError = true;
                }
            }else if(currentToken.kind == expectedKind || currentToken.lexeme == expectedKind){
                putMessage("Got a(n) "+ expectedKind + "!"); 
            }else{
                errorCount++;
                putMessage("NOT a(n) " + expectedKind + ". Error at position " + tokenIndex + " Line:" + 
                             lineNum +  ". Got a(n) " + currentToken.kind + ".");
                isParseError = true;
                }
        }else{
            if (expectedKind == "type"){
                if(currentToken.lexeme == "int" || currentToken.lexeme == "string" || currentToken.lexeme == "boolean" ){
                    //Great! keep on keeping on
                }else{
                errorCount++;
                putMessage("Error at position " + tokenIndex + " Line:" + 
                             lineNum +  " Expected a(n) " + expectedKind + ", but got a(n) " + currentToken.kind + ".");
                isParseError = true;
                }
            }else if(currentToken.kind == expectedKind || currentToken.lexeme == expectedKind){
                //Great! keep on keeping on
            }else{
                errorCount++;
                putMessage("Error at position " + tokenIndex + " Line:" + 
                             lineNum +  ". Expected a(n) " + expectedKind + ", but got a(n) " + currentToken.kind + ".");
                isParseError = true;
                }
        }

    }

    function getNextToken() {
        var thisToken = "";   
        if (tokenIndex < tokens.length){
            thisToken = tokens[tokenIndex];
            tokenIndex++;
        }
        return thisToken;
    }
