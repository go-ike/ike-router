const Express = require('express');

class IkeRouter {
	constructor() {
		this.controllerPath = './controllers/';
		this.router = Express.Router();
		this.resources = [];
	}

	get(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		this.router.get(path, this._callAction(options));
	}
	
	post(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		this.router.post(path, this._callAction(options));
	}

	put(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		this.router.put(path, this._callAction(options));
	}

	delete(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		this.router.delete(path, this._callAction(options));
	}

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

	setControllerPath(path) {
		this.controllerPath = path;
	}

	/* private */

	_parseOptions(shorthand, options) {
		if(typeof shorthand === 'object') options = shorthand;
		else {
			if(!options) options = {};
			let shorthandOptions = shorthand.split('#');
			options.controller = shorthandOptions[0];
			options.method = shorthandOptions[1];	
		}
		return options;
	}

	_callAction(options) {
		const controller = new(require(this.controllerPath + options.controller + '.controller.js'))();
		const method = controller[options.method];
		return (req, res) => { method.call(controller, req, res) };
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
