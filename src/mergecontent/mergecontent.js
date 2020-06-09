import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MergeContentUI from './mergecontentui';

export default class MergeContent extends Plugin {
	static get requires() {
		return [ MergeContentUI ];
	}
}
