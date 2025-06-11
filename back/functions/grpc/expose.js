// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import commands from '../../addon.js';

commands.Fn('grpc.expose', async function(port = 50000, debug = true)
{
    const grpcServers = (await import('#servers/grpc/load.js')).default;
    const server = grpcServers.Item({
        port: port,
        onError: (message) => 
        {
            console.log(`gRPC Server Error: ${message}`);
        },
        onStart: function()
        {
            console.log(`gRPC commands server exposed on port ${port}`);
        },
        onStreamConnect: (stream) => 
        {
            console.log(`Stream ${stream.id} connected`);
        },
        onStreamData: async (stream, payload) => 
        {
            if(payload.type !== 'request')
            {
                return;
            }

            const command = commands.ItemGet(payload.name);

            if(!command)
            {
                return stream.respond(null, 'Command doesn\'t exist.', 404, payload.id);
            }

            try 
            {
                const result = await command.Fn('run', payload.data);
                stream.respond(result.data, result.message, result.code, payload.id);
            }
            catch(error)
            {
                return stream.respond(null, error.message, 500, payload.id);
            }
        },
        onStreamError: function(stream)
        {
            console.log('onStreamError.');
        },
        onStreamEnd: function(stream)
        {
            console.log('onStreamEnd.');
        }
    });
    
    return server;
});