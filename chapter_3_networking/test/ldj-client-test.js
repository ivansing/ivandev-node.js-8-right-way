const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const LDJClient = require('../lib/ldj-client.js');

describe('LDJClient', () => {
    let stream = null;
    let client = null;

    beforeEach(() => {
        stream = new EventEmitter();
        client = new LDJClient(stream);
    });
    it('should emit a message event from a single data event', done => {
        client.on('message', message => {
            assert.deepEqual(message, {foo: 'bar'});
            done();
        });
        stream.emit('data', '{"foo":"bar"}\n');
    })
    it('should emit a message event from split data events', done => {
        client.on('message', message => {
            assert.deepEqual(message, {foo: "bar"})
            done();
        })
        stream.emit('data', '"foo":');
        process.nextTick(() => stream.emit('data', '"bar"}\n'));
    })
    it('should throw an error when constructor is passed null', () => {
        assert.throws(() => {
            new LDJClient(null);
        }, /^Error: Stream instance required$/);
    })
    it('should emit an error event for invalid JSON data', done => {
        const invalidData = 'This is not a valid JSON string\n';

        client.on('error', errorDetails => {
            assert.strictEqual(errorDetails.message, 'Invalid JSON');
            assert.strictEqual(errorDetails.data, invalidData.trim());
            assert(errorDetails.error instanceof SyntaxError);
            done();
        });

        stream.emit('data', invalidData);
    })
    it('should emit an error event for non-JSON data', done => {
        const nonJsonData = 'This is not a JSON string';

        client.on('error', errorDetails => {
            assert.strictEqual(errorDetails.message, 'Invalid JSON');
            assert.strictEqual(errorDetails.data, nonJsonData);
            assert(errorDetails.error instanceof SyntaxError);
            done();
        })

        stream.emit('data', nonJsonData);
    })
    it('should emit a message event for JSON without trailing newline', done => {
        const incompleteJsonData = '{"foo":"bar"}';

        client.on('message', message => {
            assert.deepEqual(message, {foo: 'bar'});
            done();
        })

        stream.emit('data', incompleteJsonData);
    })
})