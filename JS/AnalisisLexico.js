document.addEventListener('DOMContentLoaded', function () {
    //FUNCIONES ----------------------------------------------------------------------------------------
    function analizarLexico(texto) {
        const tokens = [];
        const errores = [];
        let lineaActual = 1;
        let indexLineaActual = 0; // Indica el índice del inicio de la línea actual en el texto completo
        const regexPatterns = [
            { tipo: 'comentarios', regex: /\/\/[^\n]*\n?/g}, // Asegúrate de que la regex maneja los comentarios correctamente
            { tipo: 'nuevaLinea', regex: /(\r\n|\n|\r)/g }, // Asegúrate de manejar nuevaLinea antes que otros tokens
            { tipo: 'palabrasClave', regex: /\b(BANDERIN|ANOTAR|GOL|VASCULACION|DISPARO|PENALTI|TARJETA_ROJA|TARJETA_AMARILLA|REMATE|ALCANSA_BOLA|SAQUE_DE_ESQUINA|SAQUE_DE_PORTERIA|LOCAL|FISICO|CONTRA_ATAQUE|BLOQUEO|MARCAR|GOL_OLIMPICO|JUGADA|ESQUINA|CABEZAZO|BICICLETA|REPETIR|CARRERA)\b/g },
            { tipo: 'palabraReservada_tiposDatos', regex: /\b(BANDERIN|DELANTERO|CENTROCAMPISTA|DEFENSA|PORTERO|EXTREMO|VOLANTE|TECNICO|LATERAL|ARBITRO)\b/g },
            { tipo: 'controlJuego', regex: /\b(PASE|RECHAZO|PASE_FILTRADO|OPCION|FALTA|DEFECTO|DRIBLE|REGATEO|TIRO_REGATEO)\b/g },
            { tipo: 'numeros', regex: /\b\d+\b/g },
            { tipo: 'identificadores', regex: /\b[a-zA-Z][_a-zA-Z0-9]*\b/g },
            { tipo: 'simbolos', regex: /[!@#%&*()_\-=+\[\]{}\\|:;'<>.\/]+/g },
            { tipo: 'mensajeSalida', regex: /"[^"]*"/g }  // Añadir esta nueva línea para manejar los mensajes de salida entre comillas
        ];

        let pos = 0;
        let lastPos = 0;

        while (pos < texto.length) {
            console.log(`Inicio del bucle - pos: ${pos}, lastPos: ${lastPos}, indexLineaActual: ${indexLineaActual}, lineaActual: ${lineaActual}`);
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
            let startCh = match.index - indexLineaActual; // Posición de inicio relativa al inicio de la línea
            let endCh = startCh + match[0].length; // Posición de final relativa al inicio de la línea
            let from = { line: lineaActual - 1, ch: startCh };
            let to = { line: lineaActual - 1, ch: endCh };
            console.log(`from: ${from} , to: ${to}`);
            if (match) {
                console.log(`Match encontrado - Tipo: ${match.type}, Valor: ${match[0]}, startCh: ${startCh}, endCh: ${endCh}`);
                if (match.index > lastPos) {
                    // Hay texto que no coincide entre lastPos y match.index
                    const unknownText = texto.substring(lastPos, match.index).trim();
                    if (unknownText) {
                        errores.push({ linea: lineaActual, tipo: "Símbolo o letra no reconocido", valor: unknownText });
                        // Resaltar la línea que contiene el error
                        editor.addLineClass(lineaActual - 1, 'background', 'linea-con-error');
                    }
                }
                if (match.type === 'nuevaLinea') {
                    console.log(`Antes del salto de línea - lineaActual: ${lineaActual}, indexLineaActual: ${indexLineaActual}`);
                    lineaActual++;
                    indexLineaActual = pos + matchLength; // Actualizar el índice del inicio de la nueva línea
                    console.log(`Después del salto de línea - lineaActual: ${lineaActual}, indexLineaActual: ${indexLineaActual}`);
                } else {
                    tokens.push({ tipo: match.type, valor: match[0].trim(), linea: lineaActual });
                    if (match.type === 'comentarios') {
                        console.log(`Antes del comentario - lineaActual: ${lineaActual}, indexLineaActual: ${indexLineaActual}`);
                        lineaActual++;
                        indexLineaActual = pos + matchLength; // Actualizar el índice del inicio de la nueva línea
                        editor.markText(from, to, { className: 'comentario' });
                        console.log(`Después del comentario - lineaActual: ${lineaActual}, indexLineaActual: ${indexLineaActual}`);
                    } else if (match.type === 'palabrasClave' || match.type === 'palabraReservada_tiposDatos' || match.type === 'controlJuego') {
                        editor.markText(from, to, { className: 'palabraReservada' });
                    } else if (match.type === 'numeros') {
                        editor.markText(from, to, { className: 'numero' });
                    } else if (match.type === 'mensajeSalida') {
                        editor.markText(from, to, { className: 'mensajeSalida' });
                    }
                }
                pos = lastPos = match.index + matchLength;
            } else {
                pos++;
            }
            console.log(`Fin del bucle - pos: ${pos}, lastPos: ${lastPos}`);
        }

        // Verificar si hay texto no reconocido al final del archivo
        if (lastPos < texto.length) {
            const unknownText = texto.substring(lastPos).trim();
            if (unknownText) {
                errores.push({ linea: lineaActual, tipo: "Símbolo o letra no reconocido", valor: unknownText });
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
            tr.innerHTML = `<td>${error.linea}</td><td>${error.tipo}</td><td>${error.valor}</td>`;
            tbody.appendChild(tr);
        });
    }

    //FIN FUNCIONES -----------------------------------------------------------------------------------
    //BOTONES -----------------------------------------------------------------------------------------
    // BOTON ANALIZADOR LEXICO
    document.getElementById('lexicalAnalysisButton').addEventListener('click', function () {
        for (let i = 0; i < editor.lineCount(); i++) {
            editor.removeLineClass(i, 'background', 'linea-con-error');
        }

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