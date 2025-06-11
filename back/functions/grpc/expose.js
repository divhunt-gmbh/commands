// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import commands from '../addon.js';

import commands from '#commands/load.js';

commands.Fn('grpc.expose', function(port = 50000)
{
    const grpcServers = require('#servers/grpc/load.js');
    const server = grpcServers.Item({
        port: port,
        onError: (message) => 
        {
            console.log(`gRPC Server Error: ${message}`);
        },
        onStart: function()
        {
            console.log(`gRPC server exposed on port ${port}`);
        },
        onStreamConnect: (stream) => 
        {
            console.log(`Stream ${stream.id} connected`);
            
            const availableCommands = commands.Items()
                .filter(cmd => !cmd.remote)
                .map(cmd => cmd.id);
                
            stream.request({
                type: 'commands',
                commands: availableCommands
            });
        },
        onStreamData: async (stream, payload) => 
        {
            if(payload.type === 'execute')
            {
                const command = commands.ItemGet(payload.name);

                if(!command)
                {
                    return stream.respond(null, 'Command does not exist.', 404, payload.id);
                }

                if(command.remote)
                {
                    return stream.respond(null, 'Cannot execute remote commands.', 403, payload.id);
                }

                try 
                {
                    const response = await command.Fn('run', payload.data);
                    stream.respond(response.data, response.message, response.code, payload.id);
                }
                catch(error)
                {
                    console.log(`Command execution error: ${error.message}`);
                    stream.respond(null, 'Server error.', 500, payload.id);
                }
            }
        },
        onStreamClose: (stream) => 
        {
            console.log(`Stream ${stream.id} closed`);
        },
        onStreamEnd: (stream) => 
        {
            console.log(`Stream ${stream.id} ended`);
        }
    });
    
    return server;
});