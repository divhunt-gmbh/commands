// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import commands from '../addon.js';

commands.Fn('find', function(method, pathname)
{
    const normalizedPathname = pathname.toLowerCase();
    
    const items = Object.values(this.Items());
    
    for (const item of items) 
    {
        if (item.Get('method') !== method) 
        {
            continue;
        }
        
        const endpoint = item.Get('endpoint');
        
        if (endpoint === normalizedPathname) 
        {
            return item;
        }
        
        if ((endpoint + '').includes(':')) 
        {
            const endpointParts = endpoint.split('/');
            const pathParts = normalizedPathname.split('/');
            
            if (endpointParts.length !== pathParts.length) 
            {
                continue;
            }
            
            let matches = true;
            
            for (let i = 0; i < endpointParts.length; i++) 
            {
                if (!endpointParts[i].startsWith(':') && endpointParts[i] !== pathParts[i]) 
                {
                    matches = false;
                    break;
                }
            }
            
            if (matches) 
            {
                return item;
            }
        }
    }
    
    return null;
});