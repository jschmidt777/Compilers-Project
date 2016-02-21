/*parse.js*/ 

//TODO: Verbose functionality


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
                break;
                case "if":
                break;
                case "print":
                break;
                case "int":
                break;
                case "string":
                break;
                case "boolean":
                break;
                default: putMessage("You broke me!");
                break;
            }
        }else{
            matchAndConsume("identifier");
        }
    }

    function matchAndConsume(expectedKind) {
        // Validate that we have the expected token kind and get the next token.
        switch(expectedKind) {
            case "openBlock":
                            putMessage("Expecting an openBlock");
                            if(currentToken.kind == "openBlock"){
                               putMessage("Got an openBlock!"); 
                            }else{
                                errorCount++;
                                putMessage("NOT an openBlock.  Error at position " + tokenIndex + ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "closeBlock":
                            putMessage("Expecting a closeBlock");
                            if(currentToken.kind == "closeBlock"){
                               putMessage("Got an closeBlock!"); 
                            }else{
                                errorCount++;
                                putMessage("NOT closeBlock.  Error at position " + tokenIndex + ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "EOF":
                            putMessage("Expecting EOF");
                            if(currentToken.kind == "EOF"){
                               putMessage("Got EOF!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT EOF  Error at position " + tokenIndex + ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            case "identifier":
                            putMessage("Expecting an identifier");
                            if(currentToken.kind == "identifier"){
                               putMessage("Got an identifier!"); 
                            }else{
                                //create token EOF and put a nonfatal warning in
                                errorCount++;
                                putMessage("NOT identifier  Error at position " + tokenIndex + ". Got a(n) " + currentToken.kind + ".");
                            }
                            break;
            default:        putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + ".");
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
            putMessage("Current token:" + thisToken);
            tokenIndex++;
        }
        return thisToken;
    }
