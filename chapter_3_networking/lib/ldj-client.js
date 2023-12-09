const EventEmitter = require('events').EventEmitter;
class LDJClient extends EventEmitter {
    constructor(stream) {
        super();
        let buffer = '';
        stream.on('data', data => {
            buffer += data;
            let boundary = buffer.indexOf('\n');
            while(boundary !== -1) {
                const input = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 1);

                try {
                    this.emit('message', JSON.parse(input));
                    
                } catch (error) {
                    // Handle the non-JSON data
                    this.emit('error', {message: 'Invalid JSON', data: input, error})
                }
               boundary = buffer.indexOf('\n');
            }
        });

        stream.on('close', () => {
            // Process the remainder of the buffer on 'close' event
            if(buffer.trim() !== '') {
                try {
                    const parsedData = JSON.parse(buffer);
                    this.emit('message', parsedData);
                } catch (error) {
                    this.emit('error', {message: 'Invalid JSON', data: buffer, error})
                }
            }

            // Emit a 'close' event for the listeners
            this.emit('close');
        })
    }

    static connect(stream) {
        return new LDJClient(stream)
    }
}
module.exports = LDJClient;