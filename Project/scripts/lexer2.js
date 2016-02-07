/* lexer.js  */
 
    //Initialize states for a link list of each kind of token

    var state0 = new createState0(); //start point of state transition diagram
    var state1 = new createState(1, 4); // accepts id
    var state2 = new createState(2, null); // accepts symbol (might need more for the individual symbols)
    var state3 = new createState(3, null); // accepts digit
    var state4 = new createState(4, null); // accepts keyword

    //Globals
    var currentLineNum = 0;  //TODO: Figure out this functionality
	var tokenStream = [];
    var insideString = false;
    var currentState = state0.state;
    
/*
    var stateMatrix = [ //  0-9
                           [1], //0
                           [acceptToken] //1






                      ]*/
    //while, if, print, int, string, boolean, false, true
   
    // Definitions for kinds of tokens so they can be compared 
    // with the src code, which will then be added to the token stream. 
	var identifier = /([a-z])/; // followed by an assign
    var digit = /(\d)/;


    function lex()
    {
        // Grab the "raw" source code.
        var sourceCode = document.getElementById("taSourceCode").value;
        // Trim the leading and trailing spaces.
        sourceCode = trim(sourceCode);
        // Removes line breaks, tabs, and unnecessary spaces.
        sourceCode = sourceCode.replace(/(\r\n|\n|\r|)/gm,"");
        sourceCode = sourceCode.replace(/  +/g, ' ');

        //Array to go through the source code character by character.
        var sourceCodeArray = sourceCode.split("");

        var currentChar = "";

        for (i = 0; i < sourceCodeArray.length; i++){
            currentChar = sourceCodeArray[i];
            var nextChar = sourceCodeArray[i]+1;
            
            if(digit.test(currentChar)){
                currentState = state0.nextState2;
            }else{
                currentChar = nextChar;
            }

            if(currentState === 3){                                 //checks to see if the char is a digit
                createToken(currentChar, "digit", currentLineNum);  
                currentState = state0.state;                        // restart the state transition diagram for the next character
            }
            
        }
        

        return tokenStream;
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

        
//look at each char in the src code and see what the state needs to be changed to
//TODO: Find out how to go through char by char and store into a variable for comparison
        
    function grabToken() {
        var ch = '';

        while (isspace(ch)){}
    }