const fs = require('fs');
const expect = require('chai').expect;
const parseRDF = require('../lib/parse-rdf')

const rdf = fs.readFileSync(`${__dirname}/pg132.rdf`);

describe('parseRDF', () => {
    it('should be a function', () => {
        expect(parseRDF).to.be.a('function');
    });
    it('should parse RDF content', () => {
        const book = parseRDF(rdf);
        expect(book).to.be.an('object');
        expect(book).to.have.a.property('id', 132);
        expect(book).to.have.a.property('title', 'The Art of War');
        expect(book).to.have.a.property('authors')
            .that.is.an('array').with.lengthOf(2)
            .and.contains('Sunzi, active 6th century B.C.')
            .and.contains('Giles, Lionel');
        expect(book).to.have.a.property('subjects')
            .that.is.an('array').with.lengthOf(2)
            .and.contains('Military art and science -- Early works to 1800')
            .and.contains('War -- Early works to 1800'); 
        expect(book.lcc).to.be.a('string')
            .to.have.length.greaterThan(0)
            .to.match(/^[A-HJ-NP-VZ]/)

        // Test download sources    
        expect(book.downloadSources).to.be.an('array').with.length.greaterThan(0) 
        
        // Test for each download source
        book.downloadSources.forEach((source, index) => {
            const sourcePrefix = `Download Source ${index + 1}:`;

            expect(source, sourcePrefix + 'should have a "url" property')
                .to.have.property('url').that.is.a('string').to.have.length.greaterThan(0);

            expect(source, sourcePrefix + 'should have a "format" property')
                .to.have.property('format').that.is.a('string')
                .to.have.length.greaterThan(0);
               
                
            expect(source, sourcePrefix + 'should have a "size" property')
                .to.have.property('size').that.is.a('number').to.be.greaterThan(0);
                
            expect(source, sourcePrefix + 'should have a "lastModified" property')
                .to.have.property('lastModified').that.is.a('string').to.have.length.greaterThan(0)    
        })

            
    });
});