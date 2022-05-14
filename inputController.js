import { Markdown } from './markdownParser.js';

const inputElement = document.getElementById('note-input');
const inputLineNumbersElement = document.getElementById('note-input-line-numbers');
const outputElement = document.getElementById('note-output-container');

let currentLineCount = 1;
inputLineNumbersElement.value = '1\n';

const inputEvents = [
    'change',
    'keyup',
    'keydown',
    'paste',
    'cut',
    'copy'
];

inputEvents.forEach(inputEvent =>
{
    inputElement.addEventListener(inputEvent, inputEventHandler);
});

inputElement.addEventListener('scroll', function()
{
   inputLineNumbersElement.scrollTop = inputElement.scrollTop;
});

function inputEventHandler()
{
    changeLineNumbers(inputElement.value.split('\n').length);
    outputElement.innerHTML = Markdown.parse(inputElement.value);

    let linkArray = document.getElementsByTagName('a');
    for(let index = 0; index < linkArray.length; index++)
    {
        linkArray[index].addEventListener('click', function (event)
        {
            event.preventDefault();
            window.api.send('openExternalLink', linkArray[index].href);
        });
    }
}

function changeLineNumbers(newLineNumberAmount)
{
    if(newLineNumberAmount < currentLineCount)
    {
        let lineNumberArray = inputLineNumbersElement.value.split(/(?<=\n)/);
        inputLineNumbersElement.value = lineNumberArray.slice(0, newLineNumberAmount).join('');
        currentLineCount = newLineNumberAmount;
    }

    if(newLineNumberAmount > currentLineCount)
    {
        /* The current value of the inputLineNumbersElement text area. We modify
         * the value of this instead of modifying the element value directly, in order to
         * batch all the rendering calls to the DOM into one call.
         */
        let lineNumberElementValue = inputLineNumbersElement.value;

        for(let lineNumber = 1; lineNumber <= newLineNumberAmount - currentLineCount; lineNumber++)
        {
            lineNumberElementValue += (currentLineCount + lineNumber) + '\n';
        }

        inputLineNumbersElement.value = lineNumberElementValue;
        currentLineCount = newLineNumberAmount;
    }
}

