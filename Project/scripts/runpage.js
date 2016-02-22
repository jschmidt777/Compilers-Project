// Global variables
    var tokens = "";
    var tokenIndex = 0;
    var currentToken = "";
    var errorCount = 0;
    var EOF = "$";
    var buttonClicksCount = 0;

    function init() {
        // Clear the message box.
        document.getElementById("taOutput").value = "";
        // Set the initial values for our globals.
        tokens = "";
        tokenIndex = 0;
        currentToken = ' ';
        errorCount = 0;    

        if (buttonClicksCount > 0){       
           window.location.reload(true); 
            //putMessage("Cannot compile multiple times yet."); //TODO: Fix this so the user can compile multiple times with a sticky input
        }    
         
    }
    
    function btnCompile_click() {        
        // This is executed as a result of the user pressing the 
        // "compile" button between the two text areas, above.  
        // Note the <input> element's event handler: onclick="btnCompile_click();
       
        init();
        putMessage("Compilation Started");
        // Grab the tokens from the lexer . . .
        tokens = lex();
        putMessage("Lex returned [" + tokens + "]");

        parse();

        //tokenStream = 0;

        buttonClicksCount++;

        //TODO: Clear token array
        // . . . and parse!
        // TODO: Get parse up and running after lexer is solid.
        
        
        
    }

    function putMessage(msg) {
        document.getElementById("taOutput").value += msg + "\n";
    }
    
    
   
    