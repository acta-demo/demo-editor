
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SnippetEditing from './snippetediting';

export default class Snippet extends Plugin {
	static get requires() {
		return [SnippetEditing];
	}

	static get pluginName() {
		return 'Snippet';
	}
}