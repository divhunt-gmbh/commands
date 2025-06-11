// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';
import commands from '../addon.js';

commands.Item({
    id: 'commands:get:many',
    exposed: true,
    method: 'GET',
    endpoint: '/api/commands',
    type: 'JSON',
    out: {
        commands: {
            type: 'array',
            each: {
                type: 'object',
                config: {
                    id: ['string'],
                    exposed: ['boolean'],
                    meta: {
                        type: 'object',
                        config: {
                            description: ['string']
                        }
                    },
                    data: {
                        type: 'object',
                        config: {
                            in: ['object'],
                            out: ['object'],
                        }
                    },
                    api: {
                        type: 'object',
                        config: {
                            type: ['string'],
                            method: ['string'],
                            endpoint: ['string']
                        }
                    }
                }
            }
        }
    },
    callback: async function(properties, resolve)
    {
        const list = [];

        Object.values(commands.Items()).forEach((item) => 
        {
            if(!item.Get('exposed'))
            {
                return true;
            }

            list.push({
                id: item.Get('id'),
                exposed: item.Get('exposed'),
                meta: {
                    description: item.Get('description'),
                },
                data: {
                    in: (item.Get('in') ? divhunt.DataConfig(item.Get('in')) : null),
                    out: (item.Get('out') ? divhunt.DataConfig(item.Get('out')) : null)
                },
                api: {
                    type: item.Get('type'),
                    method: item.Get('method'),
                    endpoint: item.Get('endpoint')
                }
            });
        });

        resolve({commands: list});
    }
});
