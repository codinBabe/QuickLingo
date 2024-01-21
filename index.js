// Display current year
let year = new Date().getFullYear();
document.querySelector('.year').innerHTML = year;

// Fecth data for default word on document load
document.addEventListener('DOMContentLoaded', function () {
    const defaultWord = 'hello';
    wordInput.value = defaultWord;
    fetchData(defaultWord);
});

// Create html element
function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    if (textContent) element.textContent = textContent;
    return element;
}

// Grab element from html to display data dynamically
const dictionaryForm = document.getElementById('dictionaryForm');
const wordInput = document.getElementById('wordInput');
const mainContainer = document.getElementById('main-container');

dictionaryForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const word = wordInput.value.trim();

    if (word) {
        fetchData(word);
    }
});

// Fetch data from dictionary.com api
async function fetchData(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();

        if (data && data.length > 0) {
            displayResults(data[0]);
        } else {
            displayError("Word not found");
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        displayError("An error occurred while fetching data");
    }
}

// Display returned data
function displayResults(wordData) {
    // Remove existing content
    mainContainer.innerHTML = '';

    // Loop through phonetics to find the first one with non-empty audio and non-empty text
    let validPhonetic;
    for (const phonetic of wordData.phonetics || []) {
        if (phonetic.audio && phonetic.audio.trim() !== "" && phonetic.text && phonetic.text.trim() !== "") {
            validPhonetic = phonetic;
            break;
        }
    }

    if (validPhonetic) {
        const audioElement = createElement('div', 'audio');
        audioElement.innerHTML = `
            <audio controls>
                <source src="${validPhonetic.audio}" type="audio/mp3">
            </audio>
            <p class="phonetic-text">${validPhonetic.text}</p>
        `;
        mainContainer.appendChild(audioElement);
    }

    // Create and append containers for each part of speech
    wordData.meanings.forEach((meaning) => {
        const partOfSpeechContainer = createElement('div', 'part-of-speech-container');
        mainContainer.appendChild(partOfSpeechContainer);

        const partOfSpeechHeader = createElement('h2', 'part-of-speech-header', meaning.partOfSpeech);
        partOfSpeechContainer.appendChild(partOfSpeechHeader);

        // Create and append the DL element
        const dlElement = createElement('dl', 'results-container');
        partOfSpeechContainer.appendChild(dlElement);

        // Loop through definitions
        meaning.definitions.forEach((definition) => {
            const definitionElement = createElement('dt', 'definition', definition.definition);

            // Check for undefined or empty example before appending
            if (definition.example && definition.example.trim() !== "") {
                const exampleElement = createElement('dd', 'example', definition.example);
                dlElement.appendChild(exampleElement);
            }
            dlElement.appendChild(definitionElement);
        });
    });
}

// Display error
function displayError(errorMessage) {
    mainContainer.innerHTML = '';
    mainContainer.appendChild(createElement('p', 'error-message', errorMessage));
}