/*parse.js*/ 

//Uses the globals on runpage.js
//Note: the parse functions go in order of traversal
//so it first looks to see if it's a program, then a block, then a statement... etc.
//See grammar.pdf on labouseur.com under "Compilers" to see the order of traversal in more detail.

//TODO: Verbose functionality
    //Elvish verbose output? (use a plugin?)


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
        putMessage("Parsing found " + errorCount + " error(s).");        
    }
    
    function parseProgram() {
        // A program production can only produce a block, so parse the block production.
        parseBlock();
        if (currentToken.kind != "EOF"){
            var lastCloseBlock = tokens[tokenIndex-1]; 
            createToken("$", "EOF", lastCloseBlock.lineNum);
            putMessage("Warning, EOF token not found, added on line " + lastCloseBlock.lineNum);
        }else{
            matchAndConsume("EOF");
        }   
        

        //TODO: have a check here to execute parseBlock again if there are more tokens
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
                            /*putMessage("Expecting an openBlock");
                            if(currentToken.kind == "openBlock"){
                               putMessage("Got an openBlock!"); 
                            }else{
                                errorCount++;
                                putMessage("NOT an openBlock. Error at position " + tokenIndex + " Line:" + currentToken.lineNum + ". Got a(n) " + currentToken.kind + ".");
                            }*/
                            break;
            case "closeBlock":
                            putMessage("Expecting a closeBlock");
                            if(currentToken.kind == "closeBlock"){
                               putMessage("Got an closeBlock!"); 
                            }else{
                                errorCount++;
                                putMessage("NOT a closeBlock. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "EOF":
                            putMessage("Expecting EOF");
                            if(currentToken.kind == "EOF"){
                               putMessage("Got EOF!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT EOF. Error at position " + tokenIndex + " Line:" + currentToken.lineNum + ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "identifier":
                            putMessage("Expecting an identifier");
                            if(currentToken.kind == "identifier"){
                               putMessage("Got an identifier!"); 
                            }else{
                                //TODO:create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT an identifier. Error at position " + tokenIndex + " Line:" + currentToken.lineNum + ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "type":
                            putMessage("Expecting a type declaration");
                            if(currentToken.lexeme == "int" || currentToken.lexeme == "string" || currentToken.lexeme == "boolean"){
                               putMessage("Got a type declaration!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a type declaration. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "assign":
                            putMessage("Expecting an assign operator");
                            if(currentToken.kind == "assign"){
                               putMessage("Got an assign operator!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT an assign operator. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "add":
                            putMessage("Expecting an add operator");
                            if(currentToken.kind == "add"){
                               putMessage("Got an add operator!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT an add operator. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "digit":
                            putMessage("Expecting a digit");
                            if(currentToken.kind == "digit"){
                               putMessage("Got a digit!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a digit. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "openQuotation":
                            putMessage("Expecting an openQuotation");
                            if(currentToken.kind == "openQuotation"){
                               putMessage("Got an openQuotation!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT an openQuotation. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "closeQuotation":
                            putMessage("Expecting a closeQuotation");
                            if(currentToken.kind == "closeQuotation"){
                               putMessage("Got a closeQuotation!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a closeQuotation. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "stringChar":
                            putMessage("Expecting a stringChar");
                            if(currentToken.kind == "stringChar"){
                               putMessage("Got a stringChar!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a stringChar. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break; 
            case "boolval":
                            putMessage("Expecting a boolval");
                            if(currentToken.kind == "boolval"){
                               putMessage("Got a boolval!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a boolval. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;    
            case "testEquality":
                            putMessage("Expecting a testEquality operator");
                            if(currentToken.kind == "testEquality"){
                               putMessage("Got a testEquality operator!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a testEquality. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;  
            case "testInEquality":
                            putMessage("Expecting a testInEquality operator");
                            if(currentToken.kind == "testInEquality"){
                               putMessage("Got a testInEquality operator!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a testInEquality. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;   
            case "openParen":
                            putMessage("Expecting an openParen");
                            if(currentToken.kind == "openParen"){
                               putMessage("Got an openParen!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT an openParen. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;   
            case "closeParen":
                            putMessage("Expecting a closeParen");
                            if(currentToken.kind == "closeParen"){
                               putMessage("Got a closeParen!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a closeParen. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;      
            case "while":
                            putMessage("Expecting a while keyword");
                            if(currentToken.lexeme == "while"){
                               putMessage("Got a while keyword!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a while keyword. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;  
            case "if":
                            putMessage("Expecting a if keyword");
                            if(currentToken.lexeme == "if"){
                               putMessage("Got a if keyword!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a if keyword. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
                            break; 
            case "print":
                            putMessage("Expecting a print keyword");
                            if(currentToken.lexeme == "print"){
                               putMessage("Got a print keyword!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT a print keyword. Error at position " + tokenIndex + " Line:" + currentToken.lineNum +  ". Got a(n) " + currentToken.kind + ".");
                            }
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
            if(currentToken.kind == expectedKind){
                putMessage("Got a(n) "+ expectedKind + "!"); 
            }else{
                errorCount++;
                putMessage("NOT a(n) " + expectedKind + "Error at position " + tokenIndex + " Line:" + 
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
