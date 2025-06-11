// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';
import commands from '../../addon.js';

commands.Fn('item.run', function(item, properties = {}, context = {})
{
    this.methods.resolve = null;
    this.methods.reject = null;

    this.methods.init = async (resolve, reject) => 
    {
        this.methods.resolve = resolve;
        this.methods.reject = reject;
        
        if(item.Get('in'))
        {
            try 
            {
                properties = divhunt.DataDefine(properties, item.Get('in'));
            }
            catch(error)
            {
                return this.methods.resolve({data: error.message, message: 'Request contains invalid parameters.', code: 400});
            }
        }

        if(item.Get('callback'))
        {
            await item.Get('callback').call(context, properties, {callback: this.methods.callback});
        }
        else
        {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: item.Get('id'),
                    in: properties
                })
            };

            try 
            {
                const response = await fetch('/api/commands/run', options);
                const result = await response.json();

                if(result.code !== 200)
                {
                    throw new Error(result.message);
                }

                return this.methods.callback(result.data.data, result.data.message, result.data.code);
            }
            catch(error)
            {
                return this.methods.callback(null, error.message, 500);
            }
        }
    };

    this.methods.callback = (data, message = "Command '{{command}}' executed successfully.", code = 200) => 
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

        this.methods.resolve({data, message: message?.replace('{{command}}', item.Get('id')), code});
    };

    return new Promise((resolve, reject) => 
    {
        try 
        {
            this.methods.init(resolve, reject);    
        }
        catch(error)
        {
            this.methods.resolve({data: error.message, message: 'Internal server error.', code: 500});
        }
    });
});