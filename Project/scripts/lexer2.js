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
        var keyword = /(while|if|print|int|string|boolean|false|true)/;
        var characterList = /("[a-z]*")/; //May not need this
        var identifier = /([a-z])/; 
        var digit = /(\d)/;
        var symbol = /(\(|\)|{|}|\$|\"|==|!=|=|\+)/; //Capture any white space or a symbol

        
        var splitOnVals = /(while|if|print|int|string|boolean|false|true|\(|\)|{|}|\$|\"|==|!=|=|\+|\s)/;

        //Array to go through the source code to split it into possible tokens. Pass 1.
        //Split on any white space or symbol and add them all to an array
        //Split at any keywords as well
        var sourceCodeArray = sourceCode.split(splitOnVals);
        //Get rid of white space in the sourceCodeArray, as well as any empty array elements
        sourceCodeArray = sourceCodeArray.filter(function(lexeme){ return lexeme.replace(/(\r\n|\n|\r|\s)/gm,"")}); //reference: http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript?rq=1
        var isError = false;

        for (i = 0; i < sourceCodeArray.length; i++){
            var currentLexeme = sourceCodeArray[i]; //Look at each potential token            
            if(keyword.test(currentLexeme)){
                createToken(currentLexeme, "keyword", currentLineNum);
            }else if (identifier.test(currentLexeme)){
                createToken(currentLexeme, "identifier", currentLineNum);
            }else if (digit.test(currentLexeme)){
                createToken(currentLexeme, "digit", currentLineNum);
            }else if (symbol.test(currentLexeme)){
                createToken(currentLexeme, "symbol", currentLineNum); //maybe embed a switch case so that the kind of the symbol can be more specific
            }else{
                makeError(currentLineNum, " Invalid or unexpected token.");
                isError = true;
            }
        }
        //TODO: add another check for ==
        //TODO: error checks for EOF, strings, blocks
        //assignKind(tokenStream);

        
        return tokenStream;
        /*if(!isError){
        return tokenStream;
        }else{
        tokenStream = "nothing";
        return tokenStream;    
        //The error message will be displayed depending on what error lex found.  
        // should return a stream of tokens
        }*/
    } 

    //Makes an instance of a token to be added to the tokenStream
    function tokenStruct() {
        this.lexeme = "";        
        this.kind = ""; 
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

    
