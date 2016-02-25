/*parse.js*/ 

//Uses the globals on runpage.js
//Note: the parse functions go in order of traversal
//so it first looks to see if it's a program, then a block, then a statement... etc.
//See grammar.pdf on labouseur.com under "Compilers" to see the order of traversal in more detail.

//TODO: Verbose functionality
    //Elvish verbose output? (use a plugin?)

    var programCounter = 1;


 function parse() {
        putMessage("\n" + "------------------------");
        putMessage(" Parsing [" + tokens + "]");              
        putMessage("------------------------");
        putMessage("\n");
        // Grab the next token.
        currentToken = getNextToken();
        // A valid parse derives the program production, so begin there.
        parseProgram();
        // Report the results.
        putMessage("Parsing found " + errorCount + " error(s). For program " + programCounter + ".");  
        programCounter++; 

    /*var lookAhead = tokenIndex[tokenIndex + 1];
        if (lookAhead.kind == "openBlock"){
            parseProgram();
        }else{
            
        }     */
    }
    
    function parseProgram() {
        // A program production can only produce a block, so parse the block production.
        parseBlock();
        var lookAhead = tokenIndex[tokenIndex + 2];
        if (currentToken.kind != "EOF" && lookAhead.kind != "openBlock"){
            var lastCloseBlock = tokens[tokenIndex-1]; 
            //this is the last closblock in the ENTIRE source code file.
            createToken("$", "EOF", lastCloseBlock.lineNum);
            putMessage("Warning, EOF token not found, added on line " + lastCloseBlock.lineNum);
        }else{
            matchAndConsume("EOF");
        }  

        if (lookAhead.kind == "openBlock"){
            parseBlock();
        }else{
            
        }  
    }

    function parseBlock() {
        matchAndConsume("openBlock");
        parseStatementList();
        // The only thing that can be in a block is a statementlist
        // Though statementlist is more complex
        matchAndConsume("closeBlock");
        parseStatementList();

        // Look ahead 1 char (which is now in currentToken because matchAndConsume 
        // consumes another one) and see which E production to follow.
        /*if (currentToken != EOF) {
            // We're not done, we expect to have another program
            //parseBlock();
        } else {
            // There is nothing else in the token stream, 
            putMessage("EOF reached");
        }*/
    }

    function parseStatementList(){
        if(currentToken.kind == "keyword" || currentToken.kind == "identifier" || currentToken.kind == "openBlock"){
            parseStatement();
        }else{
            //Do nothing. Epsilon production.
        }
    }

    function parseStatement(){
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
    }

    function parseWhileStatement(){
        matchAndConsume("while");
        parseBooleanExpr();
        //would think I need a parseBlock() here right?
        //since parseStatementList() gets called after the boolExpr
        //I actually don't need it
        parseStatementList();
    }

    function parseIfStatement(){
        matchAndConsume("if");
        parseBooleanExpr();
        //would think I need a parseBlock() here right?
        //since parseStatementList() gets called after the boolExpr
        //I actually don't need it
        parseStatementList();
    }

    function parsePrintStatement(){
        matchAndConsume("print");
        matchAndConsume("openParen");
        parseExpr();
        matchAndConsume("closeParen");
        parseStatementList();
    }

    function parseVarDecl(){
        //could change this to take a parameter to make it more efficient
        matchAndConsume("type");
        matchAndConsume("identifier");
        parseStatementList();
        //could not be the only statement:
        //go back up the traversal
        //and reinitialize at statementList
    }

    function parseAssignmentStatement(){
        matchAndConsume("identifier");
        matchAndConsume("assign");
        parseExpr();
        parseStatementList();
        //could not be the only statement:
        //go back up the traversal
        //and reinitialize at statementList
    }

    function parseExpr(){
        var expressionLexeme = currentToken.kind;
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
                    putMessage("You broke me!");
            break;
        }
    }

    function parseIntExpr(){
        matchAndConsume("digit");
        if(currentToken.kind == "add"){
            matchAndConsume("add");
            parseExpr();
            parseStatementList();
        }else{
            parseStatementList();
            //could not be the only statement:
            //go back up the traversal
            //and reinitialize at statementList
        }
    }

    function parseStringExpr(){  
        if (currentToken.kind == "stringChar"){
            consumeStringChar();
        }else{
            matchAndConsume("closeQuotation");
            parseStatementList();
            //could not be the only statement:
            //go back up the traversal
            //and reinitialize at statementList
        }
    }

    function parseBooleanExpr(){
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
            parseStatementList();
        }else if (currentToken.kind == "boolval"){
            matchAndConsume("boolval");
            parseStatementList();
        }
    }

    function consumeStringChar(){
        matchAndConsume("stringChar"); //Called recursively with parseStringExpr
        parseStringExpr();
    }

    function matchAndConsume(expectedKind) {
        // Validate that we have the expected token kind and get the next token.

        //TODO: Make a function for what I do in the cases, and use this to check if I do verbose output
        //Maybe go back if I get an error?
        switch(expectedKind) {
            case "openBlock":
                            checkExpectedKind(expectedKind);
                            break;
            case "closeBlock":
                            checkExpectedKind(expectedKind);
                            break;
                            
            case "EOF":
                            checkExpectedKind(expectedKind);
                            break;
            case "identifier":
                           checkExpectedKind(expectedKind);
                            break;
            case "type":
                            checkExpectedKind(expectedKind);
                            break;
            case "assign":
                            checkExpectedKind(expectedKind);
                            break;
            case "add":
                            checkExpectedKind(expectedKind);
                            break;
            case "digit":
                            checkExpectedKind(expectedKind);
                            break;
            case "openQuotation":
                            checkExpectedKind(expectedKind);
                            break;
            case "closeQuotation":
                            checkExpectedKind(expectedKind);
                            break;
            case "stringChar":
                            checkExpectedKind(expectedKind);
                            break;
            case "boolval":
                            checkExpectedKind(expectedKind);
                            break;  
            case "testEquality":
                            checkExpectedKind(expectedKind);
                            break;
            case "testInEquality":
                            checkExpectedKind(expectedKind);
                            break; 
            case "openParen":
                            checkExpectedKind(expectedKind);
                            break;
            case "closeParen":
                            checkExpectedKind(expectedKind);
                            break;     
            case "while":
                            checkExpectedKind(expectedKind);
                            break;
            case "if":
                            checkExpectedKind(expectedKind);
                            break;
            case "print":
                            checkExpectedKind(expectedKind);
                            break;                    
            default:        putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + " Line:" + currentToken.lineNum + ".");
                            break;			
        }
        // Consume another token, having just checked this one, because that 
        // will allow the code to see what's coming next... a sort of "look-ahead".
        currentToken = getNextToken();
    }

    var verboseModeSet = true;
    //TODO: make this change if verbose mode is checked or not
    var isErrorParse = false;

    function checkExpectedKind(expectedKind){
        if(verboseModeSet){
            putMessage("Expecting a(n) " + expectedKind);
            if(currentToken.kind == expectedKind || currentToken.lexeme == expectedKind){
                putMessage("Got a(n) "+ expectedKind + "!"); 
            }else{
                errorCount++;
                putMessage("NOT a(n) " + expectedKind + " .Error at position " + tokenIndex + " Line:" + 
                            currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
            }
        }else{
            //Do the check, but don't print to the output, and if there's an error, increment error and print the error statment(?)
        }

    }

    function getNextToken() {
        var thisToken = "";    // Let's assume that we're not at the EOF.
        if (tokenIndex < tokens.length)
        {
            thisToken = tokens[tokenIndex];
            tokenIndex++;
        }
        return thisToken;
    }
