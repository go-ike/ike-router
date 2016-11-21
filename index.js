const Express = require('express');

class IkeRouter {
	constructor(controllerPath = './controllers/') {
		this.controllerPath = controllerPath;
		this.router = Express.Router();
	}

	get(path, shorthand, options) {
		options = this._parseOptions(shorthand, options);
		console.log(options);
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

	delete() {
		options = this._parseOptions(shorthand, options);
		this.router.delete(path, this._callAction(options));
	}

	draw() {
		return this.router;
	}

	pathTo(routeName, parameters) {

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

module.exports = IkeRouter;
