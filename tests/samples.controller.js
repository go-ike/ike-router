class SamplesController {
	constructor() {}

	index(req, res) {
		let test = this.test();
		res.send(test);
	}

	test() {
		return 'Hello world';
	}
}

module.exports = SamplesController;