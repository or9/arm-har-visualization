# arm-har-visualization
Client-side HAR file visualization app. Visually compares JSON data.  

## Development  
The main application functionality is entirely client-side. The backend only needs to serve the correct files when requested. For this, there is a basic server `test-server.mjs` which serves static files. If running locally, either start this server, or use another server such as `python -m http.server` (does not serve `.mjs` files correctly) or the Google Chrome app `Web Server for Chrome`.  
Default test server configuration is located in package.json, and can be overridden by setting corresponding environment variables.  
```bash
npm install
npm start
```

### Testing  
A minimal `package.json` is added to `cypress/` because if running this package as a module, (type: "module" in package.json / .mjs extension for NodeJS 12+), it will cause problems when Cypress tries to load. In order to circumvent this, and have it both ways, we have `"type": "module"` in /package.json, and `"type": "commonjs"` in a package.json that has been created in the cypress directory. The additional package.json file could also be empty, or `{}`.   
```bash
npx cypress open
```
