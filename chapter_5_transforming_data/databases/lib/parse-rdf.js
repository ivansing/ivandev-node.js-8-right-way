const cheerio = require('cheerio');


module.exports = rdf => {
    const $ = cheerio.load(rdf)
    const book = {};

    console.log('Starting RDF parsing...')

    book.id = +$('pgterms\\:ebook').attr('rdf:about').replace('ebooks/', '');
    console.log('Book ID:', book.id)

    book.title = $('dcterms\\:title').text();
    console.log('Book Title:',book.title)

    book.authors = $('pgterms\\:agent pgterms\\:name')
        .toArray().map(elem => $(elem).text());
    console.log('Book Authors:', book.authors)

    book.subjects = $('[rdf\\:resource$="/LCSH"]')
        .parent().find('rdf\\:value')
        .toArray().map(elem => $(elem).text());
    console.log('Book Subjects:', book.subjects);    

    // Extract LCC code
    const lccElement = $('[rdf\\:resource$="/LCC"]');
    if(lccElement.length) {
        book.lcc = lccElement.parent().find('rdf\\:value').text();
        console.log('Book code LCC:', book.lcc)
    }  
    
    // Extract download sources
    book.downloadSources = $('dcterms\\:hasFormat pgterms\\:file').toArray().map((fileElem, index) => {
        
        const $file = $(fileElem);

        console.error(`Debugging for download source ${index + 1}`)
        console.error('$file:', $file.html()); 
        return {
            url: $file.attr('rdf:about'),
            format: (() => {
                const formatValue = $file.find('dcterms\\:format rdf\\:Description rdf\\:value').filter((index, elem) => {
                  return $(elem).attr('rdf:datatype') === 'http://purl.org/dc/terms/IMT' && $(elem).text() === 'text/plain';
                }).first();
                return formatValue ? 'text/plain' : null;
              })(),
            size: +$file.find('dcterms\\:extent').text(),
            lastModified: $file.find('dcterms\\:modified').text()
        };
    });
    
    console.log('Parsed book:', book)
    
    return book;
}



// book.id = // Set the book's id.
// + // Unary plus casts the result as a number.
// $('pgterms\\:ebook') // Query for the <pgterms:ebook> tag.
// .attr('rdf:about') // Get the value of the rdf:about attribute.
// .replace('ebooks/', ''); // Strip off the leading 'ebooks/' substring.