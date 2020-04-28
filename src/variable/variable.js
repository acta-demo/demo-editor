import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VariableEditing from './variableediting';
import VariableUI from './variableui';

export default class Variable extends Plugin {
	static get requires() {
		return [VariableEditing, VariableUI];
	}
}