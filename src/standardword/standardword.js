
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import StandardWordEditing from './standardwordediting';

export default class StandardWord extends Plugin {
	static get requires() {
		return [StandardWordEditing];
	}

	static get pluginName() {
		return 'StandardWord';
	}
}