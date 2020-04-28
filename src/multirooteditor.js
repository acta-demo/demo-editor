import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import MultirootEditorUI from './multirooteditorui';
import MultirootEditorUIView from './multirooteditoruiview';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import StandardWord from './standardword/standardword';
import Snippet from './snippet/snippet';
import Variable from './variable/variable';
import ListOfSpeakers from './listofspeakers/listofspeakers';
import ViewModeChange from './viewmodechange/viewmodechange';
import MouseRightClickObserver from './mouserightclickobserver/mouserightclickobserver'

/**
 * The multi-root editor implementation. It provides inline editables and a single toolbar.
 *
 * Unlike other editors, the toolbar is not rendered automatically and needs to be attached to the DOM manually.
 *
 * This type of an editor is dedicated to integrations which require a customized UI with an open
 * structure, allowing developers to specify the exact location of the interface.
 *
 * @mixes module:core/editor/utils/dataapimixin~DataApiMixin
 * @implements module:core/editor/editorwithui~EditorWithUI
 * @extends module:core/editor/editor~Editor
 */
export default class MultirootEditor extends Editor {

	/**
     * Creates an instance of the multi-root editor.
     *
     * **Note:** Do not use the constructor to create editor instances. Use the static `MultirootEditor.create()` method instead.
     *
     * @protected
     * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
     * for the created editor (on which the editor will be initialized).
     * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
     */
	constructor(sourceElements, config) {
		super(config);

		this.data.processor = new HtmlDataProcessor(this.data.viewDocument);

		// Create root and UIView element for each editable container.
		for (const rootName of Object.keys(sourceElements)) {
			this.model.document.createRoot('$root', rootName);
		}

		this.ui = new MultirootEditorUI(this, new MultirootEditorUIView(this.locale, this.editing.view, sourceElements));
		this.editing.view.addObserver(MouseRightClickObserver);
	}

	/**
     * @inheritDoc
     */
	destroy() {
		// Cache the data and editable DOM elements, then destroy.
		// It's safe to assume that the model->view conversion will not work after super.destroy(),
		// same as `ui.getEditableElement()` method will not return editables.
		const data = {};
		const editables = {};
		const editablesNames = Array.from(this.ui.getEditableElementsNames());

		for (const rootName of editablesNames) {
			data[rootName] = this.getData({ rootName });
			editables[rootName] = this.ui.getEditableElement(rootName);
		}

		this.ui.destroy();

		return super.destroy()
			.then(() => {
				for (const rootName of editablesNames) {
					setDataInElement(editables[rootName], data[rootName]);
				}
			});
	}

	/**
     * Creates a multi-root editor instance.
     *
     * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
     * for the created editor (on which the editor will be initialized).
     * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
     * @returns {Promise} A promise resolved once the editor is ready. The promise returns the created multi-root editor instance.
     */
	static create(sourceElements, config) {
		return new Promise(resolve => {

			const editor = new this(sourceElements, config);

			resolve(
				editor.initPlugins()
					.then(() => editor.ui.init())
					.then(() => {
						const initialData = {};
						
						// Create initial data object containing data from all roots.
						for (const rootName of Object.keys(sourceElements)) {
							initialData[rootName] = getDataFromElement(sourceElements[rootName]);
						}

						return editor.data.init(initialData);
					})
					.then(() => editor.fire('ready'))
					.then(() => editor)
			);
		});
	}
}

mix(MultirootEditor, DataApiMixin);

// Plugins to include in the build.
MultirootEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CKFinder,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	StandardWord,
	Snippet,
	Variable,
	ListOfSpeakers,
	ViewModeChange
];

// Editor configuration.
MultirootEditor.defaultConfig = {
	plugins: [Essentials, Paragraph, Heading, Bold, Italic, List, Link, BlockQuote, Image, ImageCaption,
		ImageStyle, ImageToolbar, ImageUpload, Table, TableToolbar, MediaEmbed, EasyImage, StandardWord, Snippet, Variable, ViewModeChange, ListOfSpeakers],
	toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'imageUpload', 'blockQuote',
		'insertTable', 'mediaEmbed', 'undo', 'redo', 'viewmodechange', 'variable', 'lsp'],
	image: {
		toolbar: ['imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],
		styles: ['full', 'alignLeft', 'alignRight']
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	placeholder: {
		header: 'Header content goes here',
		content: 'Main content goes here',
		footer: 'Footer content goes here'
	}
};
