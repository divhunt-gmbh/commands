// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';
import commands from '../../../addon.js';

commands.Fn('item.run', function(item, properties = {}, context = {})
{
    return new Promise(async (resolve, reject) =>
    {
        if(!item.Get('in'))
        {
            properties = {};
        }

        const callback = (data, message = "Command '{{command}}' executed successfully.", code = 200) =>
        {
            if(message === null && code === 404)
            {
                message = 'The requested resource cannot be found.';
            }

            if(code >= 200 && code < 300 && item.Get('out'))
            {
                try 
                {
                    data = divhunt.DataDefine(data, item.Get('out'));
                }
                catch(error)
                {
                    throw new Error('Command OUT Error. ' + error.message);
                }
            }
            else if(code < 200 || code >= 300)
            {
                data = {};
            }

            resolve({data, message: message?.replace('{{command}}', item.Get('id')), code});
        };
     
        try
        {
            if(item.Get('in'))
            {
                try 
                {
                    properties = divhunt.DataDefine(properties, item.Get('in'));
                }
                catch(error)
                {
                    return resolve({data: error.message, message: 'Request contains invalid parameters.', code: 400});
                }
            }

            await item.Get('callback').call(context, properties, callback);
        }
        catch(error)
        {
            reject(error);
        }
    })
});