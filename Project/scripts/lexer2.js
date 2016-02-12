/* lexer.js  */
 
    
    //Globals
    var currentLineNum = 0;  //TODO: Figure out this functionality
	var tokenStream = [];
    var insideString = false;
    
    //while, if, print, int, string, boolean, false, true
   
    
    
    
    //"[a-z ]*" like this idea, but can't use it since a string is not a token. 
    //TODO: Make count of quotation marks and test if there is an even amount of them.
   
    function lex()
    {
        // Grab the "raw" source code.
        var sourceCode = document.getElementById("taSourceCode").value;
        // Trim the leading and trailing spaces.
        sourceCode = sourceCode.trim();

        // Definitions for kinds of tokens so they can be compared 
        // with the src code, which will then be added to the token stream. 
        var keyword = /(while|if|print|int|string|boolean|false|true)/gm;
        var character = /("[a-z]*")/gm; //May not need this
        var identifier = /([a-z])/gm; 
        var digit = /(\d)/gm;
        var symbol = /(\(|\)|{|}|\$|\"|==|!=|=|\+)/gm; //Capture any white space or a symbol, including strings
        
        var splitOnVals = /(while|if|print|int|string|boolean|false|true|\(|\)|{|}|\$|\"|==|!=|=|\+|\s)/;

        //Array to go through the source code to split it into possible tokens. Pass 1.
        //Split on any white space or symbol and add them all to an array
        //Split at any keywords as well
        var sourceCodeArray = sourceCode.split(splitOnVals);
        var isError = false;
        var currentLexeme = ""; //Look at each potential token

        for (i = 0; i < sourceCodeArray.length; i++){
            currentLexeme = sourceCodeArray[i];
            var nextLexeme = sourceCodeArray[i]+1;
            //var matchToken = /((while|if|print|int|string|boolean|false|true)|([a-z])|(\d)|({|}|\$|\"|==|!=|=|\+))/gm;
            
            //breakOn/splitOn array
            //new array that doesn't take whitespace
            //look at white space!
            //add name to kind (not too important)
            //3.7 crafting
            if(keyword.test(currentLexeme)){
                createToken(currentLexeme, "keyword", currentLineNum);
            }else if (identifier.test(currentLexeme)){
                createToken(currentLexeme, "identifier", currentLineNum);
            }else if (digit.test(currentLexeme)){
                createToken(currentLexeme, "digit", currentLineNum);
            }else if (symbol.test(currentLexeme)){
                createToken(currentLexeme, "symbol", currentLineNum);
            }else{
                makeError(currentLineNum, " Invalid or unexpected token.");
                isError = true;
            }
        }
        //TODO: add another check for ==
        //TODO: error checks for EOF, strings, blocks
        //assignKind(tokenStream);

        return tokenStream;
        
        if(!isError){
        return tokenStream;
        }else{
        tokenStream = "nothing";
        return tokenStream;    
        //The error message will be displayed depending on what error lex found.  
        // should return a stream of tokens
        }
    } 

    //Makes an instance of a token to be added to the tokenStream
    function tokenStruct() {
        this.lexeme = "";        
        this.kind = ""; //TODO: modify this to be one of only a couple kinds of tokens.
        this.lineNum = -1;
        this.toString = function(){
            return "<" + this.lexeme + "," + this.kind + ",line:" + this.lineNum + ">";
        }
    }


    function createToken(lexeme, kind, lineNum){
        var token = new tokenStruct();
            token.lexeme = lexeme;
            token.kind = kind;
            token.lineNum = lineNum;
            tokenStream.push(token);
    }

    function makeError(lineNum, message){
        document.getElementById("taOutput").value = "Lex error on line " + lineNum + ":" + message + "\n";
    }