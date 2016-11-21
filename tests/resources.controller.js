class ResourcesController {
	constructor() {}

	index(req, res) {
		res.send('Index');
	}

	new(req, res) {
		res.send('New');
	}

	show(req, res) {
		res.send('Show');
	}

	edit(req, res) {
		res.send('Edit');
	}
}

module.exports = ResourcesController;