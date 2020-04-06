import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ViewModeChangeUI from './viewmodechangeui';

export default class ViewModeChange extends Plugin {
	static get requires() {
		return [ViewModeChangeUI];
	}

	static get pluginName() {
		return 'ViewModeChange';
	}
}