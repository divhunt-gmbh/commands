// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';

const commands = divhunt.Addon('commands', (addon) =>
{
    addon.Field('id', ['string|number']);
    addon.Field('type', ['string', 'JSON']);
    addon.Field('description', ['string']);
    addon.Field('in', ['object|string']);
    addon.Field('out', ['object|string']);
    addon.Field('exposed', ['boolean', false]);
    addon.Field('callback', ['function']);
    
    addon.Field('method', ['string', 'GET'], null, (value) =>
    {
        return ['GET', 'POST', 'PUT', 'DELETE'].includes(value) ? value : 'GET';
    });

    addon.Field('endpoint', ['string'], null, (value) =>
    {
        if(!value)
        {
            return null;
        }

        return '/' + value.replace(/^\/+/, '').replace(/\/+/g, '/').toLowerCase();
    });
});

export default commands;