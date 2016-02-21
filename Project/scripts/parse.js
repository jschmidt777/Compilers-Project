 function parse() {
        putMessage("\n" + "------------------------");
        putMessage(" Parsing [" + tokens + "]");              
        putMessage("------------------------");
        // Grab the next token.
        currentToken = getNextToken();
        // A valid parse derives the G(oal) production, so begin there.
        parseG();
        // Report the results.
        putMessage("Parsing found " + errorCount + " error(s).");        
    }
    
    function parseG() {
        // A G(oal) production (or program production) can only be an block, so parse the block production.
        parseBlock();
    }

    function parseBlock() {
        matchAndConsume("openBlock");
        //parseStatementList();
        //Does not exist yet
        matchAndConsume("closeBlock");
        matchAndConsume("EOF");
        // Look ahead 1 char (which is now in currentToken because matchAndConsume 
        // consumes another one) and see which E production to follow.
        if (currentToken != EOF) {
            // We're not done, we expect to have an op.
            matchAndConsume("op");
            parseBlock();
        } else {
            // There is nothing else in the token stream, 
            // and that's cool since E --> digit is valid.
            putMessage("EOF reached");
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
                                putMessage("NOT an openBlock.  Error at position " + tokenIndex + ".");
                            }
                            break;
            case "closeBlock":
                            putMessage("Expecting a closeBlock");
                            if(currentToken.kind == "closeBlock"){
                               putMessage("Got an closeBlock!"); 
                            }else{
                                errorCount++;
                                putMessage("NOT closeBlock.  Error at position " + tokenIndex + ".");
                            }
                            break;
            case "digit":   putMessage("Expecting a digit");
                            if (currentToken=="0" || currentToken=="1" || currentToken=="2" || 
                                currentToken=="3" || currentToken=="4" || currentToken=="5" || 
                                currentToken=="6" || currentToken=="7" || currentToken=="8" || 
                                currentToken=="9")
                            {
                                putMessage("Got a digit!");
                            }
                            else
                            {
                                errorCount++;
                                putMessage("NOT a digit.  Error at position " + tokenIndex + ".");
                            }
                            break;
            case "op":      putMessage("Expecting an operator");
                            if (currentToken=="+" || currentToken=="-")
                            {
                                putMessage("Got an operator!");
                            }
                            else
                            {
                                errorCount++;
                                putMessage("NOT an operator.  Error at position " + tokenIndex + ".");
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
        var thisToken = EOF;    // Let's assume that we're at the EOF.
        if (tokenIndex < tokens.length)
        {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
            putMessage("Current token:" + thisToken);
            tokenIndex++;
        }
        return thisToken;
    }
