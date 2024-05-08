document.addEventListener('DOMContentLoaded', function () {
    //FUNCIONES ----------------------------------------------------------------------------------------
    function analizarLexico(texto) {
        const tokens = [];
        const errores = [];
        let lineaActual = 1;
        const regexPatterns = [
            { tipo: 'comentarios', regex: /\/\/[^\n]*\n?/g }, // Asegúrate de que la regex maneja los comentarios correctamente
             // Asegúrate de manejar nuevaLinea antes que otros tokens            
            { tipo: 'palabrasClave', regex: /\b(BANDERIN|ANOTAR|GOL|VASCULACION|DISPARO|PENALTI|TARJETA_ROJA|TARJETA_AMARILLA|REMATE|ALCANSA_BOLA|SAQUE_DE_ESQUINA|SAQUE_DE_PORTERIA|LOCAL|FISICO|CONTRA_ATAQUE|BLOQUEO|MARCAR|GOL_OLIMPICO|JUGADA|ESQUINA|CABEZAZO|BICICLETA|REPETIR|CARRERA)\b/g },
            { tipo: 'tiposDatos', regex: /\b(DELANTERO|CENTROCAMPISTA|DEFENSA|PORTERO|EXTREMO|VOLANTE|TECNICO|LATERAL|ARBITRO)\b/g },
            { tipo: 'controlJuego', regex: /\b(PASE|RECHAZO|PASE_FILTRADO|OPCION|FALTA|DEFECTO|DRIBLE|REGATEO|TIRO_REGATEO)\b/g },
            { tipo: 'numeros', regex: /\b\d+\b/g },
            { tipo: 'identificadores', regex: /\^\b[a-zA-Z][_a-zA-Z0-9]*\b\$/g },
            { tipo: 'simbolos', regex: /[!@#%&*()_\-=+\[\]{}\\|:;'<>.\/]+/g }
        ];

        let pos = 0;

        while (pos < texto.length) {
            let match = null;
            let matchLength = 0;

            regexPatterns.forEach(pattern => {
                pattern.regex.lastIndex = pos;
                const found = pattern.regex.exec(texto);
                if (found && (!match || found.index < match.index)) {
                    match = found;
                    match.type = pattern.tipo;
                    matchLength = found[0].length;
                }
            });

            if (match) {
                if (match.index === pos) {  // Asegurar que el match comience donde estamos buscando
                    if (match.type === 'nuevaLinea') {
                        lineaActual++;
                    } else {
                        tokens.push({ tipo: match.type, valor: match[0].trim(), linea: lineaActual });
                    }
                    pos += matchLength;  // Mover posición sólo después de procesar un match válido
                } else {
                    pos = match.index;
                }
            } else {
                pos++;
            }
        }

        return { tokens, errores };
    }


    function updateTokenTable(tokens) {
        var tbody = document.getElementById('tokenTableBody');
        tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos tokens

        tokens.forEach(function (token) {
            var tr = document.createElement('tr');
            tr.innerHTML = `<td>${token.linea}</td><td>${token.valor}</td><td>${token.tipo}</td><td>${token.valor}</td>`;
            tbody.appendChild(tr);
        });
    }

    function updateErrorTable(errores) {
        var tbody = document.getElementById('errorTableBody');
        tbody.innerHTML = '';  // Limpiar la tabla antes de agregar nuevos errores

        errores.forEach(function (error) {
            var tr = document.createElement('tr');
            tr.innerHTML = `<td>${error.linea}</td><td>${error.tipo}</td><td>${error.mensaje}</td>`;
            tbody.appendChild(tr);
        });
    }
    //FIN FUNCIONES -----------------------------------------------------------------------------------
    //BOTONES -----------------------------------------------------------------------------------------
    // BOTON ANALIZADOR LEXICO
    document.getElementById('lexicalAnalysisButton').addEventListener('click', function () {
        const codigo = editor.getValue();
        const resultado = analizarLexico(codigo);
        console.log("Análisis léxico completado.");
        alert("Análisis léxico completado.");
        window.tokensGlobal = resultado.tokens; // Guardar tokens en una variable global
        window.erroresLexicosGlobal = resultado.errores; // Guardar errores en una variable global
    });

    //BOTON TABLA DE ERRORES
    document.getElementById('displayErrorTableButton').addEventListener('click', function () {
        if (!window.erroresLexicosGlobal || window.erroresLexicosGlobal.length === 0) {
            alert("No hay errores para mostrar. Por favor, realiza primero el análisis léxico.");
            return;
        }
        updateErrorTable(window.erroresLexicosGlobal);
        document.getElementById('errorTableModal').style.display = 'block';  // Mostrar la tabla
    });

    //BOTON TABLA DE TOKENS
    document.getElementById('displayTokenTableButton').addEventListener('click', function () {
        if (!window.tokensGlobal || window.tokensGlobal.length === 0) {
            alert("No hay tokens para mostrar. Por favor, realiza primero el análisis léxico.");
            return;
        }
        updateTokenTable(window.tokensGlobal);
        document.getElementById('tokenTableModal').style.display = 'block';  // Mostrar la tabla
    });

    //BOTON ANALISIS SINTACTICO
    document.getElementById('syntaxAnalysisButton').addEventListener('click', function () {
        console.log("Análisis Sintáctico activado");
        alert("Análisis Sintáctico activado");
    });

    //FIN BOTONES---------------------------------------------------------------------------------------

});

