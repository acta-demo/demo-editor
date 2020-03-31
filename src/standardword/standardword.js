
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PlaceholderEditing from './standardwordediting';

export default class StandardWord extends Plugin {
	static get requires() {
		return [PlaceholderEditing];
	}

	static get pluginName() {
		return 'StandardWord';
	}
}