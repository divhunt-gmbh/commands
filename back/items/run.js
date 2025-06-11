// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import commands from '../addon.js';

commands.Item({
    id: 'commands:run',
    method: 'POST',
    endpoint: '/api/commands/run',
    type: 'JSON',
    in: {
        id: ['string', null, true],
        data: ['object']
    },
    out: {
        data: ['string|object|boolean|number|array'],
        message: ['string'],
        code: ['number']
    },
    callback: async function(properties, resolve)
    {
        console.log(properties.id);
        
        const command = commands.ItemGet(properties.id);

        if(!command)
        {
            return resolve(null, 'Command does not exist.', 404);
        }

        if(!command.Get('exposed'))
        {
            return resolve(null, 'Command is not exposed.', 403);
        }

        try 
        {
            const result = await commands.Item(properties.id).Fn('run', (properties.data || {}));

            resolve({
                data: result.data,
                message: result.message,
                code: result.code
            });
        }
        catch(error)
        {
            resolve(null, error.message, 500);
        }
    }
});