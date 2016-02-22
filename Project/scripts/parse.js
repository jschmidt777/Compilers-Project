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
        matchAndConsume("EOF");
        //TODO: have a check here to execute parseBlock again if theres more tokens
    }

    function parseBlock() {
        matchAndConsume("openBlock");
        parseStatementList();
        // The only thing that can be in a block is a statementlist
        // Though statementlist is more complex
        matchAndConsume("closeBlock");
        
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

    function matchAndConsume(expectedKind) {
        // Validate that we have the expected token kind and get the next token.

        //TODO: Make a function for what I do in the cases, and use this to check if I do verbose output
        //Maybe go back if I get an error?
        switch(expectedKind) {
            case "openBlock":
                            putMessage("Expecting an openBlock");
                            if(currentToken.kind == "openBlock"){
                               putMessage("Got an openBlock!"); 
                            }else{
                                errorCount++;
                                putMessage("NOT an openBlock. Error at position " + tokenIndex + " Line:" + currentToken.lineNum + ". Got a(n) " + currentToken.kind + ".");
                            }
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
                            if(currentToken.lexeme == "int" || currentToken.lexeme == "string" || currentToken.lexeme == "boolean" ){
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
            default:        putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + " Line:" + currentToken.lineNum + ".");
                            break;			
        }
        // Consume another token, having just checked this one, because that 
        // will allow the code to see what's coming next... a sort of "look-ahead".
        currentToken = getNextToken();
    }

    function getNextToken() {
        var thisToken = "";    // Let's assume that we're not at the EOF.
        if (tokenIndex < tokens.length)
        {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
            //putMessage("Current token:" + thisToken);
            tokenIndex++;
        }
        return thisToken;
    }
