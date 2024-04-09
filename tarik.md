ClientError: Variable "$_locale" is never used in operation "getAccountAddresses".: {"response":{"errors":[{"message":"Variable \"$\_locale\" is never used in operation \"getAccountAddresses\".","locations":[{"line":2,"column":31}]},{"message":"Variable \"$_currency\" is never used in operation \"getAccountAddresses\".","locations":[{"line":2,"column":49}]}],"status":400,"headers":{}},"request":{"query":"\n    query getAccountAddresses($\_locale: String, $_currency: String) {\n  account {\n    addresses {\n      results {\n        name\n        address1\n        city\n        state\n        zip\n        country\n        phone\n      }\n    }\n  }\n}\n    "}}
    at /Users/client/swellHorizon/node_modules/graphql-request/dist/index.js:359:31
    at step (/Users/client/swellHorizon/node_modules/graphql-request/dist/index.js:63:23)
    at Object.next (/Users/client/swellHorizon/node_modules/graphql-request/dist/index.js:44:53)
    at fulfilled (/Users/client/swellHorizon/node_modules/graphql-request/dist/index.js:35:58)
    at processTicksAndRejections (node:internal/process/task_queues:96:5) {
  response: {
    errors: [ [Object], [Object] ],
    status: 400,
    headers: Headers { [Symbol(map)]: [Object: null prototype] }
  },
  request: {
    query: '\n' +
      '    query getAccountAddresses($\_locale: String, $\_currency: String) {\n' +
' account {\n' +
' addresses {\n' +
' results {\n' +
' name\n' +
' address1\n' +
' city\n' +
' state\n' +
' zip\n' +
' country\n' +
' phone\n' +
' }\n' +
' }\n' +
' }\n' +
'}\n' +
' ',
variables: undefined
}
}
