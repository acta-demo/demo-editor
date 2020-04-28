import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ListOfSpeakersEditing from './listofspeakersediting';
import ListOfSpeakersUI from './listofspeakersui';

export default class ListOfSpeakers extends Plugin {
	static get requires() {
		return [ListOfSpeakersEditing, ListOfSpeakersUI];
	}
}