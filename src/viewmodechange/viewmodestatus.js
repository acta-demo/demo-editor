class ViewModeStatus {
	constructor(enforcer) {
		throw new Error('Cannot construct singleton');
	}

	static singletonMethod() {
		return 'singletonMethod';
	}

	static staticMethod() {
		return 'staticMethod';
	}

	static get viewmode() {
		return (typeof this._viewmode !== 'undefined') ? this._viewmode : 'infoview';
	}

	static set viewmode(viewmode) {
		this._viewmode = viewmode;
	}
}

ViewModeStatus.type = 'SingletonNoInstance';

export default ViewModeStatus;
