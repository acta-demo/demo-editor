import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DiffByWordUI from './diffbywordui';

export default class DiffByWord extends Plugin {
	static get requires() {
		return [ DiffByWordUI ];
	}
}
