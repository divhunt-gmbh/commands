// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';

const commands = divhunt.Addon('commands', (addon) =>
{
    addon.Field('id', ['string']);
    addon.Field('type', ['string', 'JSON']);
    addon.Field('description', ['string']);
    addon.Field('in', ['object|string']);
    addon.Field('out', ['object|string']);
    addon.Field('callback', ['function']);
});

export default commands;