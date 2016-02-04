/* lexer.js  */

// Definitions for kinds of tokens so they can be compared 
// with the src code, which will then be added to the token stream.
/*
	var comment = (Not(Eol))*Eol;
*/   
	var tokenStream = [];
	var identifier = /([a-zA-Z]([a-zA-Z]|\d|)*)/;



    function lex()
    {
        // Grab the "raw" source code.
        var sourceCode = document.getElementById("taSourceCode").value;
        // Trim the leading and trailing spaces.
        sourceCode = trim(sourceCode);
        // Removes all spaces in the middle; removes line breaks too.
        
        //sourceCode = sourceCode.replace(/(\r\n|\n|\r|\s)/gm,"");

        /*TODO: Make definitions for each kind of token (possibly with classes?).
        		I can then make some sort of comparison operations within lex.
        */
        
        var currentLineNum = 0;

        switch (sourceCode){
        	//Take the src code that is an id and add it to the tokens stream.
        	
            case 'identifier':
                    /*temp = identifier.exec(sourceCode);*/
                    // lexeme of kind identifier
        			alert("I'm here!");
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
            break;
            //default: return null;
        }
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
        return tokenStream;
        // should return a stream of tokens
    }

    //Makes an instance of a token to be added to the tokenStream
    function createToken() {
        this.lexeme = "";        
        this.kind = ""; //TODO: modify this to be one of only a couple kinds of tokens.
        this.lineNum = -1;
    }


    function grabToken() {
        var ch = '';

        while (isspace(ch)){}
    }