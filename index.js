const Express = require('express');

class IkeRouter {
	/**
	 * Instantiates the main properties
	 * Creates the clasess' controllers path, router instance and
	 * a resource map
	 */
	constructor() {
		this.controllerPath = './controllers/';
		this.router = Express.Router();
		this.resources = [];
	}

	/**
	 * Creates a get route
	 * @param  {String} path      The URL path
	 * @param  {String} shorthand The shorthand controller#method notation
	 * @param  {Object} options   Routing options
	 */
	get(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		this.router.get(path, this._callAction(options));
	}
	
	/**
	 * Creates a post route
	 * @param  {String} path      The URL path
	 * @param  {String} shorthand The shorthand controller#method notation
	 * @param  {Object} options   Routing options
	 */
	post(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		this.router.post(path, this._callAction(options));
	}

	/**
	 * Creates a put route
	 * @param  {String} path      The URL path
	 * @param  {String} shorthand The shorthand controller#method notation
	 * @param  {Object} options   Routing options
	 */
	put(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		this.router.put(path, this._callAction(options));
	}

	/**
	 * Creates a delete route
	 * @param  {String} path      The URL path
	 * @param  {String} shorthand The shorthand controller#method notation
	 * @param  {Object} options   Routing options
	 */
	delete(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		this.router.delete(path, this._callAction(options));
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
			this._callAction({ controller: controller, method: 'index' }));
		resourceRouter.get('/new', 
			this._callAction({ controller: controller, method: 'new' }));
		resourceRouter.post('/', 
			this._callAction({ controller: controller, method: 'create' }));
		resourceRouter.get('/:id', 
			this._callAction({ controller: controller, method: 'show' }));
		resourceRouter.get('/:id/edit', 
			this._callAction({ controller: controller, method: 'edit' }));
		resourceRouter.put('/:id', 
			this._callAction({ controller: controller, method: 'update' }));
		resourceRouter.delete('/:id', 
			this._callAction({ controller: controller, method: 'destroy' }));

		this.router.use('/'+resourceName, resourceRouter);
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
			return '/'+path;

		else if((action === undefined && parameters && parameters.id) || (action === 'show' && parameters.id))
			return '/'+path+'/'+parameters.id;

		else if(action === 'new')
			return '/'+path+'/new';

		else if(action === 'edit' && parameters && parameters.id) 
			return '/'+path+'/'+parameters.id+'/edit';
	}

	/**
	 * Sets the routers' controllers path
	 * @param {String} path The path to find the controllers
	 */
	setControllerPath(path) {
		this.controllerPath = path;
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
		const controller = new(require(this.controllerPath + options.controller + '.controller.js'))();
		const method = controller[options.method];
		const call = (req, res) => { method.call(controller, req, res) }
		return [...options.middleware, call];
	}
}

/**
 * SINGLETON BEHAVIOUR
 * Instead of returning the class, a single instance is returned.
 * This preserves the state of the routes, and make pathTo()
 * available even outside the main routing file in the host app.
 */
const instance = new IkeRouter();
function singleton(controllerPath) {
	if(controllerPath) instance.setControllerPath(controllerPath);
	return instance;
}

module.exports = singleton;
