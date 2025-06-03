## Built with the Divhunt Framework – non-commercial use only. For commercial use, contact dejan@divhunt.com.

# Commands Addon

The Commands addon provides a structured way to define and manage API endpoints with automatic validation, routing, and response formatting.

## Basic Usage

### Creating a Command

```javascript
import commands from '#commands/load.js';

commands.Item({
    id: 'users:create',
    method: 'POST',
    endpoint: '/api/users',
    type: 'JSON',
    description: 'Create a new user',
    in: {
        name: ['string', null, true],
        email: ['string', null, true],
        age: ['number']
    },
    out: {
        user: {
            type: 'object',
            config: {
                id: ['string'],
                name: ['string'],
                email: ['string']
            }
        }
    },
    callback: async function(properties, resolve) {
        // Your logic here
        const user = createUser(properties);
        resolve({user});
    }
});
```

## Command Properties

### Required Fields

- **id** - Unique identifier for the command
- **callback** - Function that executes the command logic

### Optional Fields

- **method** - HTTP method (`GET`, `POST`, `PUT`, `DELETE`). Default: `GET`
- **endpoint** - URL pattern (supports route parameters with `:param`)
- **type** - Response type (`JSON`, `HTML`, `CSS`, `JSS`). Default: `JSON`
- **description** - Human-readable description
- **in** - Input validation schema
- **out** - Output validation schema

## Route Parameters

Use `:parameter` syntax in endpoints to capture URL segments:

```javascript
commands.Item({
    id: 'users:get:one',
    method: 'GET',
    endpoint: '/api/users/:id',
    in: {
        id: ['string', null, true]
    },
    callback: async function(properties, resolve) {
        // properties.id contains the URL parameter
        const user = await findUser(properties.id);
        resolve({user});
    }
});
```

## Input Validation

Define input schemas to automatically validate request data:

```javascript
// Simple validation
in: {
    name: ['string', null, true], // required string
    age: ['number', 18],          // optional number, default 18
    active: ['boolean', true]     // optional boolean, default true
}

// Complex validation
in: {
    user: {
        type: 'object',
        config: {
            profile: {
                type: 'object',
                config: {
                    name: ['string', null, true],
                    contacts: {
                        type: 'array',
                        each: {
                            type: 'object',
                            config: {
                                type: ['string'],
                                value: ['string']
                            }
                        }
                    }
                }
            }
        }
    }
}

// Using predefined schemas
in: 'user --skip=id --skip=created_at'
```

## Output Validation

Define output schemas to validate and format responses:

```javascript
out: {
    users: {
        type: 'array',
        each: {
            type: 'object',
            config: {
                id: ['string'],
                name: ['string'],
                email: ['string']
            }
        }
    },
    total: ['number', null, true],
    page: ['number', null, true]
}
```

## Callback Function

The callback receives two parameters:

```javascript
callback: async function(properties, resolve) {
    // properties - validated input data
    // resolve(data, message, code) - response function
    
    try {
        const result = await doSomething(properties);
        resolve(result); // Success with default message and 200 code
    } catch (error) {
        resolve(null, 'Error occurred', 500);
    }
}
```

### Resolve Function

```javascript
resolve(data, message, code)
```

- **data** - Response data (will be validated against `out` schema)
- **message** - Response message (optional, has default)
- **code** - HTTP status code (optional, default: 200)

## Finding Commands

### Find by Method and Path

```javascript
const command = commands.Fn('find', 'GET', '/api/users/123');
```

## Running Commands

```javascript
const command = commands.ItemGet('users:create');
const result = await command.Fn('run', inputData, context);

// Returns:
// {
//     data: {...},      // Validated output
//     message: "...",   // Success/error message  
//     code: 200         // HTTP status code
// }
```

## Response Types

### JSON (Default)

```javascript
type: 'JSON' // Returns application/json
```

### HTML

```javascript
type: 'HTML' // Returns text/html
```

### CSS

```javascript
type: 'CSS' // Returns text/css  
```

### JavaScript

```javascript
type: 'JSS' // Returns application/javascript
```

## Built-in Commands

The addon includes two built-in commands:

### List All Commands

```
GET /api/commands
```

Returns all registered commands with their metadata.

### Get Single Command

```
GET /api/commands/:id
```

Returns details for a specific command.

## Data Type Hints

Use type hints in property names for automatic conversion:

```javascript
// URL: /api/users?age:number=25&active:boolean=true&tags:array=tag1,tag2

// Converts to:
// {
//     age: 25,           // number
//     active: true,      // boolean  
//     tags: ['tag1', 'tag2'] // array
// }
```

Available hints:
- `:number` - Convert to number
- `:string` - Convert to string
- `:boolean` - Convert to boolean (`true`, `1`, `false`, `0`)
- `:array` - Convert to array (comma-separated or JSON)
- `:object` - Convert to object (JSON)

## Error Handling

Commands automatically handle validation errors and return appropriate error responses:

```javascript
// Input validation error
{
    data: "Error message",
    message: "Request contains invalid parameters.",
    code: 400
}

// Command not found
{
    data: {},
    message: "Command does not exist.",
    code: 404
}

// Server error
{
    data: {},
    message: "Command could not be completed.",
    code: 500
}
```

## Best Practices

1. **Use descriptive IDs** - Follow pattern `resource:action` or `resource:action:modifier`
2. **Validate inputs** - Always define `in` schema for data integrity
3. **Handle errors gracefully** - Use try/catch and appropriate error codes
4. **Use route parameters** - Prefer `/users/:id` over query parameters for resources
5. **Document commands** - Add meaningful descriptions
6. **Consistent responses** - Use standard response format across commands# commands
