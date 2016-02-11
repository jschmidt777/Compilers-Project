/* lexer.js  */
 
    //Initialize states for a link list of each kind of token
    /*
    var state0 = new createState0(); //start point of state transition diagram
    var state1 = new createState(1, 4); // accepts id
    var state2 = new createState(2, null); // accepts symbol (might need more for the individual symbols)
    var state3 = new createState(3, null); // accepts digit
    var state4 = new createState(4, null); // accepts keyword
    */
    //Globals
    var currentLineNum = 0;  //TODO: Figure out this functionality
	var tokenStream = [];
    var insideString = false;
    //var currentState = state0.state;
    
/*
    var stateMatrix = [ //  0-9
                           [1], //0
                           [acceptToken] //1






                      ]*/
    //while, if, print, int, string, boolean, false, true
   
    // Definitions for kinds of tokens so they can be compared 
    // with the src code, which will then be added to the token stream. 
    
    var keyword = /(while|if|print|int|string|boolean|false|true)/;
	var identifier = /([a-z])/; 
    var digit = /(\d)/;
    var symbol = /(("[a-z]*")|{|}|\$|\"|==|!=|=|\+|(\s))/; //Capture any white space or a symbol, including strings
    //var matchToken = "/" + identifier + "|" + digit + "|" + symbol + "/gm";


    function lex()
    {
        // Grab the "raw" source code.
        var sourceCode = document.getElementById("taSourceCode").value;
        // Trim the leading and trailing spaces.
        sourceCode = trim(sourceCode);
        

        //Array to go through the source code to split it into possible tokens. Pass 1.
        //Split on any white space or symbol and add them all to an array
        var sourceCodeArray = sourceCode.split(symbol);
        var isError = false;
        var currentLexeme = ""; //Look at each potential token

        for (i = 0; i < sourceCodeArray.length; i++){
            currentLexeme = sourceCodeArray[i];
            var nextLexeme = sourceCodeArray[i]+1;
            var matchToken = /((while|if|print|int|string|boolean|false|true)|([a-z])|(\d)|( |{|}|\$|\"|==|!=|=|\+))/gm;
            
            //breakOn/splitOn array
            //new array that doesn't take whitespace
            //look at white space!
            //add name to kind (not too important)
            //3.7 crafting
            if(matchToken.test(currentLexeme) /*&& identifier.test(nextChar)*/){
                //while there isn't a match, add the next char to possibleKeyWord, and then check it until it finds the longest match.
                createToken(currentLexeme, null, currentLineNum);
                //possibleKeyWord =+ currentChar;
                //checkLongestMatch(possibleKeyWord);
            }else{
                //makeError(currentLineNum, " Invalid or unexpected token.");
                isError = true;
            }
        }
        //TODO: add another check for ==
        //TODO: error checks for EOF, strings, blocks
        //assignKind(tokenStream);

        return sourceCodeArray;
        /*
        if(!isError){
        return tokenStream;
        }else{
        tokenStream = 0;
        return tokenStream;    
        
          //The error message will be displayed depending on what error lex found.  
        }*/
        // should return a stream of tokens
    }   

    //Makes an instance of a token to be added to the tokenStream
    function tokenStruct() {
        this.lexeme = "";        
        this.kind = ""; //TODO: modify this to be one of only a couple kinds of tokens.
        this.lineNum = -1;
        this.toString = function(){
            return "[" + this.lexeme + "," + this.kind + ",line:" + this.lineNum + "]";
        }
    }



    function createState0() {
        this.state = 0;
        this.nextState0 = 1; //id  
        this.nextState1 = 2; //symbol/op
        this.nextState2 = 3; //digit
    }

    function createState(state, nextState) {
        this.state = state;
        this.nextState = nextState;
    }

    function goToNextState(){
        state = state.nextState;
    }

    function createToken(lexeme, kind, lineNum){
        var token = new tokenStruct();
            token.lexeme = lexeme;
            token.kind = kind;
            token.lineNum = lineNum;
            tokenStream.push(token);
    }

    function makeError(lineNum, message){
        document.getElementById("taOutput").value = "Lex error on line " + lineNum + ":" + message;
    }