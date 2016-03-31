// Global variables
// Accessed in parser.js as well
    var tokens = "";
    var tokenIndex = 0;
    var currentToken = "";
    var errorCount = 0;

    function init() {
        // Clear the message box.
        document.getElementById("taOutput").value = "";
        // Set the initial values for the globals.
        tokens = "";
        tokenIndex = 0;
        currentToken = ' ';
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

        parse();
        if(isParseError){
           document.getElementById("taCST").value = "Error found, CST not completed."
        }else{
            document.getElementById("taCST").value = cst.toString();
        }
        
        //TODO: Clear token array and allow for multiple button clicks
    }

    function putMessage(msg) {
        document.getElementById("taOutput").value += msg + "\n";
    }
    
    function checkVerboseMode(){
        var thisSet = document.getElementById("radioVerbose").checked;
        verboseModeSet = thisSet;
    }
    
   
    