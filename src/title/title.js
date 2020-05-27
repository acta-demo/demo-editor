import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TitleEditing from './titleediting';

export default class Title extends Plugin {
	static get requires() {
		return [ TitleEditing ];
	}

	static get pluginName() {
		return 'Title';
	}
}
