import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DiffByEfficiencyUI from './diffbyefficiencyui';

export default class DiffByEfficiency extends Plugin {
	static get requires() {
		return [ DiffByEfficiencyUI ];
	}
}
