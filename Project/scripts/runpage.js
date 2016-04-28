// Global variables
// Accessed in parser.js as well
    var tokenStream = [];
    var tokens = "";
    var tokenIndex = 0;
    var currentToken = "";
    var errorCount = 0;
    

    function init() {
        // TODO: with reset, Clear the message box. Clear the CST Output.
        //document.getElementById("taOutput").value = "";
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
       document.getElementById("taOutput").value ="Compilation Started";
        // Grab the tokens from the lexer . . .
        tokens = lex();
        putMessage("\n" + "------------------------");
        putMessage("Lex returned [" + tokens + "]");
        putMessage("------------------------");
        putMessage("\n");

        if (tokens.length > 0){
            parse();
                if(isParseError){
                    document.getElementById("taCST").value = "Error found, CST(s) not completed."
                }else{
                    putMessage("\n"+"Creating CSTs..."+"\n");
                    var printCSTs = cstArr.join("");
                    document.getElementById("taCST").value = printCSTs.toString();
                    putMessage("\n"+"Created CST(s). Performing Semantic Analysis...");
                    putMessage("\n"+"Creating ASTs..."+"\n");
                    semanticAnalysis(); //creates ASTs, symbol tables, and performs scope and type checking on ASTs.
                    var printASTs = astArr.join("END OF PROGRAM \n \n");
                    document.getElementById("taAST").value = printASTs.toString();
                    putMessage("\n"+"Created AST(s).");
                    if(!isSemanticError){
                        //var count = 1;
                        putMessage("\n"+"Creating Symbol Tables...\n")
                        var symbolTables = symbolTableArr.join("-----END OF TABLE-----\n "); //Multiple STs is probably going to have to work like multiple AST
                        document.getElementById("taST").value = symbolTables.toString();
                        checkSymbolTableWarns();
                        //codeGen()
                        //debugger;
                        createCodeBlocks();
                        document.getElementById("taCodeGen").value = "";
                        for(i = 0; i < codeArr.length; i++){
                            document.getElementById("taCodeGen").value += "Program " +(i+1) +"\n" + codeArr[i].toString() +"\n\n";  
                        }

                    }else{
                        document.getElementById("taST").value = "Symbol table(s) not produced due to a semantic error (see log below).";
                    }
                }  
        }else if(tokens.length == 0){
            putMessage("Error: No source code to compile.\n");
        }

        
        
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
    
   
    