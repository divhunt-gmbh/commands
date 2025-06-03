// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';
import commands from '../../addon.js';

commands.Item({
    id: 'commands:get:one',
    method: 'GET',
    endpoint: '/api/commands/:id',
    type: 'JSON',
    in: {
        id: ['string']
    },
    out: {
        command: {
            type: 'object',
            config: {
                id: ['string'],
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
    },
    callback: async function(properties, resolve)
    {
        const command = commands.ItemGet(properties.id);

        if(!command)
        {
            return resolve(null, 'Command does not exist.', 404);
        }

        resolve({
            command: {
                id: command.Get('id'),
                meta: {
                    description: command.Get('description'),
                },
                data: {
                    in: command.Get('in') ? divhunt.DataConfig(command.Get('in')) : null,
                    out: command.Get('out') ? divhunt.DataConfig(command.Get('out')) : null
                },
                api: {
                    type: command.Get('type'),
                    method: command.Get('method'),
                    endpoint: command.Get('endpoint')
                }
            }
        });
    }
});