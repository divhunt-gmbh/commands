// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import commands from '../../addon.js';

commands.Fn('grpc.client', async function(host, prefix = 'remote', port = 50000, debug = true)
{
    const grpcClients = (await import('#clients/grpc/load.js')).default;
    const store = new Set();

    const client = grpcClients.Item({
        host,
        port,
        onConnect: function(client)
        {
            if(debug)
            {
                console.log('gRPC client connected to :1::2', host, port);
            }

            this.Fn('stream');
        },
        onStream: async function(stream)
        {
            const result = await stream.request('commands:get:many');
            
            if(result.code !== 200)
            {
                return stream.terminate();                
            }

            const list = result.data.commands;

            list.forEach((command) => 
            {
                const id = prefix + ':' + command.id;

                commands.Item({
                    id,
                    in: command.data.in,
                    out: command.data.out,
                    callback: async (properties, resolve) => 
                    {
                        const result = await stream.request(command.id, properties);
                        resolve(result.data, result.message, result.code);
                    }
                });

                store.add(id);
            })
        },
   
        onStreamError: function(stream, message)
        {
            console.error('onStreamError');
        },
        
        onStreamEnd: function(stream)
        {
            store.forEach(id => 
            {
                console.log(id);
                commands.ItemRemove(id);
            });
            
            store.clear();
        },

        onError: function(message)
        {
            console.log(`stream error`);
        }
    });

    return client;
});