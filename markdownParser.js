/* The Markdown class is a Markdown parser that can be used to
 * parse Markdown language strings into valid HTML.
 */
export class Markdown
{
    static #CACHED_OUTPUT_DATA = '';        // Cache to hold the last outputted HTML data.
    static #CACHED_INPUT_DATA = '';         // Cache to hold the last inputted Markdown data.
    static #CURRENT_OPEN_TAGS = [];         // Array that holds all the currently opened HTML tags.

    static parse(data)
    {
        /* Seeing if the cached CACHED_INPUT_DATA is still current. If it is
         * parse returns CACHED_OUTPUT_DATA to improve performance, instead of recalculating
         * new Output Data.
         */
        if(data === this.#CACHED_INPUT_DATA)
        {
            return this.#CACHED_OUTPUT_DATA;
        }

        this.#CACHED_INPUT_DATA = data;
        this.#CURRENT_OPEN_TAGS = [];

        let outputHTML = '';
        let lines = data.split('\n');

        lines.forEach(line =>
        {
            /* Closing the currently open tag(s) if there is a blank line.
             */
            if(line.trim().length === 0)
            {
                while(this.#CURRENT_OPEN_TAGS.length > 0)
                {
                    outputHTML += `</${this.#CURRENT_OPEN_TAGS.pop()}>`;
                }
            }

            line = this.#parseHorizontalRule(line);
            line = this.#parseCodeBlocks(line);
            line = this.#parseLineBreaks(line);
            line = this.#parseHeadings(line);

            line = this.#parseInlineTags(line);

            line = this.#parseBlockQuotes(line);
            line = this.#parseLinksAndImages(line);

            outputHTML += line;
        });

        this.#CACHED_OUTPUT_DATA = outputHTML;
        return outputHTML;
    }

    /* The parseHorizontalRule static function parses a line of markdown into a
     * HTML Horizontal Rule. If the passed line is NOT a valid Horizontal Rule
     * syntax, the unmodified line data is returned.
     *
     * lineData:            The passed data from a single line of Markdown to parse.
     */
    static #parseHorizontalRule(lineData)
    {
        if(lineData === '***' || lineData === '___' || lineData === '---')
        {
            return '<hr>';
        }

        return lineData;
    }

    /* The parseInlineTags static function parses different inline text effects such as italics,
     * bold, and strikethrough from Markdown syntax into valid HTML syntax.
     * Returns the parsed HTML data as a string.
     *
     * lineData:            The passed data from a single line of Markdown to parse.
     */
    static #parseInlineTags(lineData)
    {
        replaceCustomPattern('~~', 'strike');
        replaceCustomPattern('==', 'mark');

        replaceCustomPattern('**', 'strong');
        replaceCustomPattern('__', 'strong');

        replaceCustomPattern('*', 'em');
        replaceCustomPattern('_', 'em');

        replaceCustomPattern('`', 'code');

        return lineData;

        function replaceCustomPattern(pattern, tag)
        {
            let tagOpen = false;
            while(lineData.includes(pattern))
            {
                if(tagOpen)
                {
                    lineData = lineData.replace(pattern, `</${tag}>`)
                }
                else
                {
                    lineData = lineData.replace(pattern, `<${tag}>`)
                }

                tagOpen = !tagOpen;
            }

            /* Ensuring that all tags have an accompanying closing tag.
             */
            if(tagOpen)
            {
                lineData += `</${tag}>`;
            }
        }
    }

    /* The parseLineBreaks static function checks to see if there are
     * two or more whitespace characters at the end of a line. If the
     * line does have a line break at the end, parseLineBreaks appends a <br>
     * tag to the end of the lineData and returns it. Otherwise, the lineData
     * is returned, unmodified.
     *
     * lineData:            The passed data from a single line of Markdown to parse.
     */
    static #parseLineBreaks(lineData)
    {
        if(lineData.slice(-2) === '  ')
        {
            return lineData.slice(0, -1) + '<br>';
        }

        return lineData;
    }

    /* The parseBlockQuotes static function checks to see if tx
     *
     */
    static #parseBlockQuotes(lineData)
    {
        let lineArray = lineData.split(' ');
        let output = '';

        if(lineArray[0] === '>')
        {
            if(!this.#CURRENT_OPEN_TAGS.includes('blockquote'))
            {
                this.#CURRENT_OPEN_TAGS.push('blockquote');
                output += '<blockquote>';
            }

            output += lineData.substring(1);
            return output;
        }

        return lineData;
    }

    /* The parseHeadings static function parses any Markdown headings, indicated by
     * the '#' character, into HTML headings.
     *
     * lineData:            The passed data from a single line of Markdown to parse.
     */
    static #parseHeadings(lineData)
    {
        let lineArray = lineData.split(' ');

        if(/^#+$/.test(lineArray[0]))
        {
            return `<h${lineArray[0].length}>` + lineData.substring(lineArray[0].length) + `</h${lineArray[0].length}>`
        }

        return lineData;
    }

    static #parseLinksAndImages(lineData)
    {
        while(
            lineData.includes('[')
            && lineData.includes(']')
            && lineData.includes('(')
            && lineData.includes(')')
        )
        {
            let text = lineData.substring(lineData.indexOf('[') + 1, lineData.indexOf(']'));
            let src = lineData.substring(lineData.indexOf('(') + 1, lineData.indexOf(')'));

            if(lineData.includes('!['))
            {
                let link = `<img src="${src}" alt="${text}">`;
                lineData = lineData.slice(0, lineData.indexOf('![')) + link + lineData.slice(lineData.indexOf(')') + 1);
            }
            else
            {
                let link = `<a target="_blank" class="external-link" href=${src}>${text}</a>`;
                lineData = lineData.slice(0, lineData.indexOf('[')) + link + lineData.slice(lineData.indexOf(')') + 1);
            }
        }

        return lineData;
    }

    static #parseCodeBlocks(lineData)
    {
        if(lineData === '```')
        {
            if(this.#CURRENT_OPEN_TAGS.includes('code'))
            {

                return '</code>';
            }

            this.#CURRENT_OPEN_TAGS.push('code');
            return '<code class="code-block">';
        }

        return lineData;
    }
}
