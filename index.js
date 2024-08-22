const Express = require('express');

class IkeRouter {
  #controllerPath = './controllers/'
  #version = ''
  #router = Express.Router();
  #resources = []

  // getters & setters
  get version() {
    return this.#version
  }

  get controllerPath() {
    let tmp = `${this.#controllerPath}${this.#version}`    
    if (tmp == './controllers')  { return './controllers/' }

    if (tmp.charAt(tmp.length - 1) === '/') { tmp = tmp.slice(0, -1) }
    return `${tmp}/`
  }

  get router() {
    return this.#router
  }

  set version(value) {
    if (!value || (value && value.trim() === '')) { return this.#version = '' }
    this.#version = `/${value}`
  }

  set controllerPath(value) {
    if (!value || (value && value.trim() === '')) { return this.#controllerPath = './controllers' }
    this.#controllerPath = value
  }

  /**
   * Creates a get route
   * @param  {String} path      The URL path
   * @param  {String} shorthand The shorthand controller#method notation
   * @param  {Object} options   Routing options
   */
  get(path, shorthand, options) {
    options = this._parseOptions(shorthand, options);
    this.router.get(`${this.version}${path}`, this._callAction(options));
  }

  /**
   * Creates a post route
   * @param  {String} path      The URL path
   * @param  {String} shorthand The shorthand controller#method notation
   * @param  {Object} options   Routing options
   */
  post(path, shorthand, options) {
    options = this._parseOptions(shorthand, options);    
    this.router.post(`${this.version}${path}`, this._callAction(options));
  }

  /**
   * Creates a put route
   * @param  {String} path      The URL path
   * @param  {String} shorthand The shorthand controller#method notation
   * @param  {Object} options   Routing options
   */
  put(path, shorthand, options) {
    options = this._parseOptions(shorthand, options);
    this.router.put(`${this.version}${path}`, this._callAction(options));
  }

  /**
   * Creates a delete route
   * @param  {String} path      The URL path
   * @param  {String} shorthand The shorthand controller#method notation
   * @param  {Object} options   Routing options
   */
  delete(path, shorthand, options) {
    options = this._parseOptions(shorthand, options);
    this.router.delete(`${this.version}${path}`, this._callAction(options));
  }

  /**
   * Creates a routing resource
   * @param  {String} resourceName The name of the resource
   * @param  {String} controller   The name of the controller, if different from the resource
   */
  resource(resourceName, controller) {
    let resourceRouter = Express.Router();
    if(!controller) controller = resourceName;

    this.resources.push(resourceName);

    resourceRouter.get('/',
      this._callAction({ controller: controller, method: 'index', middleware: []}));
    resourceRouter.get('/new',
      this._callAction({ controller: controller, method: 'new', middleware: [] }));
    resourceRouter.post('/',
      this._callAction({ controller: controller, method: 'create', middleware: [] }));
    resourceRouter.get('/:id',
      this._callAction({ controller: controller, method: 'show', middleware: [] }));
    resourceRouter.get('/:id/edit',
      this._callAction({ controller: controller, method: 'edit', middleware: [] }));
    resourceRouter.put('/:id',
      this._callAction({ controller: controller, method: 'update', middleware: [] }));
    resourceRouter.delete('/:id',
      this._callAction({ controller: controller, method: 'destroy', middleware: [] }));

    this.router.use('/'+resourceName, resourceRouter);
  }

  /**
   * Mounts a middleware function to all routes
   * @param  {Function} middleware The express-compliant middleware
   */
  mountMiddleware(middleware) {
    this.router.use(middleware)
  }

  /**
   * Returns the express.Router() instance to be used by express
   * @return {express.Router()}
   */
  draw() {
    return this.router;
  }

  pathToResource(path, action, parameters) {
    if(typeof action === 'object') {
      parameters = action;
      action = undefined;
    }

    if(this.resources.indexOf(path) == -1) // Error if resource has not been defined
      throw new Error('RESOURCE_DOESNT_EXIST');

    if(action === undefined || (action === 'index' && parameters == undefined)) 
      return `${this.version}/${path}`

    else if((action === undefined && parameters && parameters.id) || (action === 'show' && parameters.id))
      return `${this.version}/${path}/${parameters.id}`

    else if(action === 'new') 
      return `${this.version}/${path}/new`

    else if(action === 'edit' && parameters && parameters.id) 
      return `${this.version}/${path}/${parameters.id}/edit`
  }


  /* private */

  /**
   * Parse the shorthand and route options into a standard object,
   * to be used by the routes.
   * @param  {String} shorthand The shorthand controller#method notation
   * @param  {Object} options   Routing options
   * @return {Object}
   */
  _parseOptions(shorthand, options = {}) {
    if(typeof shorthand === 'object') options = shorthand;
    else {
      let shorthandOptions = shorthand.split('#');
      options.controller = shorthandOptions[0];
      options.method = shorthandOptions[1];
    }

    if(!options.middleware)
      options.middleware = []
    if(!Array.isArray(options.middleware))
      options.middleware = [options.middleware]

    return options;
  }

  /**
   * Calls the method of the controller, on the context of the instance,
   * passing express' req and res params
   * @param  {Object}   options Routing options
   * @return {Function}
   */
  _callAction(options) {    
    try {
      const controller = new(require(this.controllerPath + options.controller + '.js'))();
      const method = controller[options.method];
      
      const call = (req, res, next) => { method.call(controller, req, res, next) }
      return [...options.middleware, call];
    } catch (err) {
      console.log(err);
      throw err
    }
  }
}

/**
 * SINGLETON BEHAVIOUR
 * Instead of returning the class, a single instance is returned.
 * This preserves the state of the routes, and make pathTo()
 * available even outside the main routing file in the host app.
 */
const instance = new IkeRouter();

module.exports = (controllerPath, version = '') => {  
  if(version && version.trim() !== '') instance.version = version;
  if(controllerPath) instance.controllerPath = controllerPath
  return instance;
};
