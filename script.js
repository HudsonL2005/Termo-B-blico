// Palavra secreta
const secretWord = listaDePalavras[Math.floor(Math.random() * listaDePalavras.length)].toUpperCase();
const maxAttempts = 6;
let currentAttempt = 0;
let currentBoxIndex = 0; // Índice do quadrado atual na linha

// Referências aos elementos HTML
const gameBoard = document.getElementById("game-board");
const hiddenInput = document.getElementById("hidden-input");

// Inicializar a grade de tentativas
function initBoard() {
    for (let i = 0; i < maxAttempts; i++) {
        for (let j = 0; j < secretWord.length; j++) {
            const letterBox = document.createElement("div");
            letterBox.classList.add("letter-box", "box", "empty");
            letterBox.setAttribute("id", `box-${i}-${j}`);
            gameBoard.appendChild(letterBox);
        }
    }
    highlightBox(currentAttempt, currentBoxIndex);
    hiddenInput.focus();
}

// Adiciona destaque ao quadrado ativo
function highlightBox(attempt, index) {
    document.querySelectorAll(".letter-box").forEach(box => box.classList.remove("active"));
    const activeBox = document.getElementById(`box-${attempt}-${index}`);
    if (activeBox) {
        activeBox.classList.add("active");
    }
}

// Atualizar as caixas de letras à medida que o jogador digita
hiddenInput.addEventListener("input", () => {
    const guess = hiddenInput.value.toUpperCase();
    if (guess.length > 0 && currentBoxIndex < secretWord.length) {
        const currentLetter = guess[0]; // Pega a primeira letra do input
        const box = document.getElementById(`box-${currentAttempt}-${currentBoxIndex}`);
        box.textContent = currentLetter; // Atualiza a letra na caixa
        currentBoxIndex++;

        // Limpa o campo de entrada para o próximo caractere
        hiddenInput.value = "";

        if (currentBoxIndex < secretWord.length) {
            highlightBox(currentAttempt, currentBoxIndex);
        } else {
            // Remover destaque ao preencher toda a linha
            document.querySelectorAll(".letter-box").forEach(box => box.classList.remove("active"));
        }
    }
});

// Lidar com a tecla "Backspace" para apagar letras
hiddenInput.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
        if (currentBoxIndex > 0 && !hiddenInput.value.length) {
            // Voltar para o quadrado anterior e apagar a letra
            currentBoxIndex--;
            const box = document.getElementById(`box-${currentAttempt}-${currentBoxIndex}`);
            box.textContent = "";
            highlightBox(currentAttempt, currentBoxIndex);
        }
    }

    // Verificar se a tecla "Enter" foi pressionada e se a palavra foi completamente digitada
    if (event.key === "Enter" && currentBoxIndex === secretWord.length) {
        checkGuess();
    }
});

// Verificar o palpite do jogador e atualizar o teclado
function checkGuess() {
    const guess = Array.from({ length: secretWord.length }, (_, i) => 
        document.getElementById(`box-${currentAttempt}-${i}`).textContent
    ).join("").toUpperCase();

    if (guess.length !== secretWord.length) {
        showModal("Por favor, preencha todas as caixas antes de enviar!");
        return;
    }

    // Contar quantas vezes cada letra aparece na palavra secreta
    const letterCount = {};
    for (let i = 0; i < secretWord.length; i++) {
        const letter = secretWord[i];
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    // Primeiro, marcaremos todas as letras que estão no lugar correto (verde)
    const correctIndexes = [];
    for (let i = 0; i < guess.length; i++) {
        const box = document.getElementById(`box-${currentAttempt}-${i}`);
        if (guess[i] === secretWord[i]) {
            setTimeout(() => {
                box.classList.remove("empty");
                box.classList.add("correct", "animated");
            }, 150 * i); // Aplica o atraso para a animação
            letterCount[guess[i]]--; // Reduzir a contagem da letra correta
            correctIndexes.push(i); // Salvar o índice das letras que estão corretas
        }
    }

    // Em seguida, marcaremos as letras que estão presentes, mas fora de posição (amarelo)
    for (let i = 0; i < guess.length; i++) {
        const box = document.getElementById(`box-${currentAttempt}-${i}`);

        // Pular as letras que já foram marcadas como corretas
        if (correctIndexes.includes(i)) {
            continue;
        }

        setTimeout(() => {
            // Verificar se a letra está presente na palavra e se ainda há ocorrências dessa letra restantes
            if (secretWord.includes(guess[i]) && letterCount[guess[i]] > 0) {
                box.classList.remove("empty");
                box.classList.add("present", "animated");
                letterCount[guess[i]]--; // Reduzir a contagem de ocorrências dessa letra
            } else {
                box.classList.remove("empty");
                box.classList.add("absent", "animated");
            }
        }, 150 * i); // Aplica o atraso para a animação
    }

    // Verificar se o jogador acertou a palavra secreta
    if (guess === secretWord) {
        setTimeout(() => {
            showModal("Parabéns! Você acertou!");
            hiddenInput.disabled = true;
        }, 150 * guess.length); // Aplica um atraso após a última animação
        return;
    }

    // Avançar para a próxima tentativa
    setTimeout(() => {
        currentAttempt++;
        currentBoxIndex = 0; // Reiniciar o índice para a nova linha
        hiddenInput.value = ""; // Limpar o campo de entrada
        highlightBox(currentAttempt, currentBoxIndex); // Destacar o primeiro quadrado da nova linha
        hiddenInput.focus();

        if (currentAttempt >= maxAttempts) {
            showModal(`Você perdeu! A palavra correta era: ${secretWord}`);
            hiddenInput.disabled = true;
        }
    }, 150 * guess.length); // Aguardar a finalização das animações para mudar de linha
}


// Função para exibir o modal com mensagens personalizadas
function showModal(messageText) {
    const modal = document.getElementById("rules-modal");
    const modalContent = modal.querySelector(".modal-content");
    modalContent.innerHTML = `
        <span class="close-button">&times;</span>
        <h2>${messageText}</h2>
        <button id="play-again-button" class="play-again-btn">Jogar Novamente</button>
    `;
    modal.style.display = "flex";

    // Fechar o modal ao clicar no botão de fechar
    modal.querySelector(".close-button").addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Evento para o botão "Jogar Novamente" recarregar a página
    const playAgainButton = document.getElementById("play-again-button");
    playAgainButton.addEventListener("click", () => {
        location.reload(); // Recarrega a página para começar um novo jogo
    });
}


// Adicionar evento de clique para as teclas do teclado virtual
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const letter = key.getAttribute('data-letter');

        if (letter === "BACKSPACE") {
            hiddenInput.value = hiddenInput.value.slice(0, -1);
            hiddenInput.dispatchEvent(new Event('input')); // Atualiza o grid
        } else if (letter === "ENTER") {
            hiddenInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); // Aciona o evento de Enter
        } else {
            hiddenInput.value += letter; // Adiciona a letra ao input
            hiddenInput.dispatchEvent(new Event('input')); // Atualiza o grid
        }
    });
});

// Atualizar cores das teclas conforme o status
function updateKeyboard(guess) {
    guess.split('').forEach((letter, index) => {
        const key = document.querySelector(`.key[data-letter="${letter}"]`);
        if (key) {
            if (letter === secretWord[index]) {
                key.classList.add('correct');
            } else if (secretWord.includes(letter)) {
                // Verifica se já foi marcada como correta
                const alreadyCorrect = guess.slice(0, index).filter(l => l === letter).length;
                const presentCount = guess.filter(l => l === letter).length;

                if (alreadyCorrect < presentCount) {
                    key.classList.add('present');
                }
            } else {
                key.classList.add('absent');
            }
        }
    });
    
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // Quando a aba sai do foco
        console.log("A página está em segundo plano.");
        // Aqui você pode pausar qualquer lógica que precise ser pausada
    } else {
        // Quando a aba volta ao foco
        console.log("A página voltou ao primeiro plano.");
        hiddenInput.focus(); // Forçar o foco novamente no input invisível
    }
});

// Inicializar o jogo
initBoard();

