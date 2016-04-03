// Global variables
// Accessed in parser.js as well
    var tokenStream = [];
    var tokens = "";
    var tokenIndex = 0;
    var currentToken = "";
    var errorCount = 0;
    

    function init() {
        // Clear the message box. Clear the CST Output.
        document.getElementById("taOutput").value = "";
        // Set the initial values for the globals.
        tokenStream = [];
        tokens = "";
        tokenIndex = 0;
        currentToken = "";
        errorCount = 0;     
    }
 
    function btnCompile_click() {     
        init();
        checkVerboseMode();
        putMessage("Compilation Started");
        // Grab the tokens from the lexer . . .
        tokens = lex();
        putMessage("\n" + "------------------------");
        putMessage("Lex returned [" + tokens + "]");
        putMessage("------------------------");
        putMessage("\n");

        if (tokens != ""){
            parse();
                if(isParseError){
                    document.getElementById("taCST").value = "Error found, CST(s) not completed."
                }else{
                    var printCSTs = cstArr.join("");
                    document.getElementById("taCST").value = printCSTs.toString();
                }  
        }else{
            putMessage("Error: No source code to compile.");
        }

        semanticAnalysis(cstArr);
        
        //resetTokenStream();
        //TODO: Clear token array and allow for multiple button clicks
        //reset tokenstream, stillParsing, ...
    }

    /*function resetTokenStream(){
        delete window.tokenStream;
        tokenStream = [];
    }*/

    function putMessage(msg) {
        document.getElementById("taOutput").value += msg + "\n";
    }
    
    function checkVerboseMode(){
        var thisSet = document.getElementById("radioVerbose").checked;
        verboseModeSet = thisSet;
    }
    
   
    