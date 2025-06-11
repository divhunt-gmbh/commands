// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import commands from '#commands/load.js';

commands.Fn('grpc.connect', async function(ip, port = 50000, prefix = '')
{
    const grpcClients = (await import('#servers/grpc/clients/load.js')).default;
    const connectedCommands = new Set();
    
    const client = grpcClients.Item({
        ip: ip,
        port: port,
        onConnect: function(stream)
        {
            console.log(`gRPC client connected to ${ip}:${port}`);
        },
        onData: function(stream, data)
        {
            if(data.type === 'commands')
            {
                data.commands.forEach(commandId => 
                {
                    const fullCommandId = prefix ? `${prefix}:${commandId}` : commandId;
                    
                    if(!connectedCommands.has(fullCommandId))
                    {
                        commands.Item({
                            id: fullCommandId,
                            remote: true,
                            stream: stream,
                            originalId: commandId,
                            callback: async function(properties, resolve)
                            {
                                const requestId = Date.now().toString();
                                
                                const timeout = setTimeout(() => 
                                {
                                    resolve(null, 'Request timeout.', 500);
                                }, 30000);
                                
                                const responseHandler = (responseData) => 
                                {
                                    if(responseData.id === requestId)
                                    {
                                        clearTimeout(timeout);
                                        stream.removeDataListener(responseHandler);
                                        resolve(responseData.data, responseData.message, responseData.code);
                                    }
                                };
                                
                                stream.addDataListener(responseHandler);
                                
                                stream.request({
                                    type: 'execute',
                                    id: requestId,
                                    name: commandId,
                                    data: properties
                                });
                            }
                        });
                        
                        connectedCommands.add(fullCommandId);
                    }
                });
                
                console.log(`Added ${data.commands.length} remote commands with prefix "${prefix}"`);
            }
        },
        onClose: function(stream)
        {
            connectedCommands.forEach(commandId => 
            {
                commands.ItemRemove(commandId);
            });
            
            console.log(`Disconnected from ${ip}:${port} - Removed ${connectedCommands.size} remote commands`);
            connectedCommands.clear();
        },
        onError: function(stream, error)
        {
            console.log(`gRPC Client Error: ${error}`);
            
            connectedCommands.forEach(commandId => 
            {
                commands.ItemRemove(commandId);
            });
            
            connectedCommands.clear();
        }
    });
    
    await client.Fn('connect');
    
    return client;
});