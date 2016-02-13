/* lexer.js  */
 
    
    //Globals
    var currentLineNum = 0;  //TODO: Figure out this functionality
	var tokenStream = [];
    
    function lex()
    {
        // Grab the "raw" source code.
        var sourceCode = document.getElementById("taSourceCode").value;
        // Trim the leading and trailing spaces.
        sourceCode = sourceCode.trim();

        // Definitions for kinds of tokens so they can be compared 
        // with the src code, which will then be added to the token stream. 
        var keyword = /(while|if|print|int|string|boolean|false|true)/;
        var characterList = /("[a-z ]*")/; //May not need this
        var identifier = /([a-z])/; 
        var digit = /(\d)/;
        var symbol = /(\(|\)|{|}|\$|\"|==|!=|=|\+)/; 

        //Split on any white space, deliminators, and even id, char, and digits. 
        //Basically, split on anything we may find interesting, since that will be tokenized.
        var splitOnVals = /(while|if|print|int|string|boolean|false|true|[a-z]|[0-9]|\"|\(|\)|{|}|\$|==|!=|=|\+|\s|)/;
                            //Keywords                                     id/chars/digits              deliminators

        //Array to go through the source code to split it into possible tokens. Pass 1.
        var sourceCodeArray = sourceCode.split(splitOnVals);
        //Get rid of white space in the sourceCodeArray, as well as any empty array elements
        sourceCodeArray = sourceCodeArray.filter(function(lexeme){ return lexeme.replace(/(\r\n|\n|\r|\s)/gm,"")}); //reference: http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript?rq=1
        var isError = false;
        var insideString = false;

        for (i = 0; i < sourceCodeArray.length; i++){
            var currentLexeme = sourceCodeArray[i]; //Look at each potential token   
            var nextLexeme = sourceCodeArray[i]+1;        
            if(keyword.test(currentLexeme)){
                createToken(currentLexeme, "keyword", currentLineNum);
            }else if (identifier.test(currentLexeme) && !insideString){
                createToken(currentLexeme, "identifier", currentLineNum);
            }else if (identifier.test(currentLexeme) && insideString){
                createToken(currentLexeme, "char", currentLineNum);
            }else if (digit.test(currentLexeme)){
                createToken(currentLexeme, "digit", currentLineNum);
            }else if (symbol.test(currentLexeme)){
                switch(currentLexeme){
                    case "{":
                        createToken(currentLexeme, "openBlock", currentLineNum);
                        //count for these?
                    break;
                    case "}":
                        createToken(currentLexeme, "closeBlock", currentLineNum);
                        //count for these?
                    break;
                    case "(":
                        createToken(currentLexeme, "openParen", currentLineNum);
                        //count for these?
                    break;
                    case ")":
                        createToken(currentLexeme, "closeParen", currentLineNum);
                        //count for these?
                    break;
                    case "\"": //This will need to be based on the quotation count
                        if(!insideString){
                            createToken(currentLexeme, "openQuotation", currentLineNum);
                            insideString = true;
                        }else if(insideString){
                            createToken(currentLexeme, "closeQuotation", currentLineNum);
                            insideString = false;
                        }
                
                    /*  May not even need this
                        if(quotesCount == 0){
                            createToken(currentLexeme, "openQuotation", currentLineNum);
                            quotesCount++;
                        }else if (quotesCount.odd()){
                            createToken(currentLexeme, "closeQuotation", currentLineNum);
                            quotesCount++;
                        }else{
                            createToken(currentLexeme, "openQuotation", currentLineNum);
                            quotesCount++;
                        }*/
                    break;
                    case "==":
                        createToken(currentLexeme, "testEquality", currentLineNum);
                    break;
                    case "!=":
                        createToken(currentLexeme, "testInEquality", currentLineNum);
                    break;
                    case "=":
                        createToken(currentLexeme, "assign", currentLineNum);
                    break;
                    case "+":
                        createToken(currentLexeme, "add", currentLineNum);
                    break;
                    case "$":
                        createToken(currentLexeme, "EOF", currentLineNum);
                    break;
                    default:  createToken(currentLexeme, "symbol", currentLineNum);
                }
            
            }else{
                makeError(currentLineNum, " Invalid or unexpected token.");
                isError = true;
               
        }
    }
        //TODO: error checks for EOF, strings
        //if there was never an assigned EOF, find the last assigned } and add a $, plus a warning saying it was added
        if(insideString){
                    makeError(currentLineNum, " Unclosed quotation.");
                    isError = true;
                }
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

    
