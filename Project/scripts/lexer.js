/* lexer.js  */

/*
	var comment = (Not(Eol))*Eol;
*/   
    //Globals
    var currentLineNum = 0;
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
    var digit = /(0-9)/;


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

        for (i = 0; i < sourceCodeArray.length; i++){
            var ch = sourceCodeArray[i];
            var nextChar = sourceCodeArray[i]+1;
            
            if(digit.test(ch)){
                state = state0.nextState2;
            }
        }
        /*TODO: Make definitions for each kind of token (possibly with classes?).
        		I can then make some sort of comparison operations within lex.
        */
        


        	//Take the src code that is an id and add it to the tokens stream.
        	
        
                    /*temp = identifier.exec(sourceCode);*/
                    // lexeme of kind identifier
                    if (identifier === sourceCode){
                        var token_id = new createToken();
                        token_id.frag = "";
                        token_id.lineNum = currentLineNum++;
                        tokenStream.push(token_id);                      
                    }
                    /*
                    if (temp !== null){
        			 if (temp.index === identifier.lastIndex){
                        tokenStream = sourceCode;
                     }
                    }*/
            //default: return null;
        
/*          
        if (sourceCode === ('('|')'|';'|',')){
        	tokens = sourceCode;
        	tokenIndex++;
        }
/*
        if ([a-z A-Z], [a-z A-Z]|[0-9]){
        	new identifier 
        }
*/
        return sourceCodeArray;
        // should return a stream of tokens
    }

    //Makes an instance of a token to be added to the tokenStream
    function createToken() {
        this.lexeme = "";        
        this.kind = ""; //TODO: modify this to be one of only a couple kinds of tokens.
        this.lineNum = -1;
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

    //Initialize states for a link list of each

    var state0 = new createState0();
    var state1 = new createState(1, 4); //accepts digit
    var state2 = new createState(2, null); //accepts id
    var state3 = new createState(3, null); //accepts symbol/op
    var state4 = new createState(4, null); //accepts keyword

        
//look at each char in the src code and see what the state needs to be changed to
//TODO: Find out how to go through char by char and store into a variable for comparison
        
    function grabToken() {
        var ch = '';

        while (isspace(ch)){}
    }