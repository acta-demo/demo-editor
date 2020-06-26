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
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
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
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';

import StandardWord from './standardword/standardword';
import Snippet from './snippet/snippet';
import Variable from './variable/variable';
import ListOfSpeakers from './listofspeakers/listofspeakers';
import Title from './title/title';
import ViewModeChange from './viewmodechange/viewmodechange';
import MouseRightClickObserver from './mouserightclickobserver/mouserightclickobserver';
import DoubleClickObserver from './doubleclickobserver/doubleclickobserver';
import DiffByWord from './diffbyword/diffbyword';
import DiffByEfficiency from './diffbyefficiency/diffbyefficiency';
import ShowHeaderFooter from './showheaderfooter/showheaderfooter';
import MergeContent from './mergecontent/mergecontent';

import TrackChanges from '@ckeditor/ckeditor5-track-changes/src/trackchanges';
import Comments from '@ckeditor/ckeditor5-comments/src/comments';

import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Text from '@ckeditor/ckeditor5-engine/src/model/text';

// import SuggestionThreadView from '@ckeditor/ckeditor5-track-changes/src/ui/view/suggestionthreadview.js';
import ActaSuggestionThreadView from './suggestion/actasuggestionthreadview';
import './customcss/custom.css';

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
	constructor( sourceElements, config ) {
		super( config );

		this.data.processor = new HtmlDataProcessor( this.data.viewDocument );

		// Create root and UIView element for each editable container.
		for ( const rootName of Object.keys( sourceElements ) ) {
			this.model.document.createRoot( '$root', rootName );
		}

		this.ui = new MultirootEditorUI( this, new MultirootEditorUIView( this.locale, this.editing.view, sourceElements ) );
		this.editing.view.addObserver( MouseRightClickObserver );
		this.editing.view.addObserver( DoubleClickObserver );
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
		const editablesNames = Array.from( this.ui.getEditableElementsNames() );

		for ( const rootName of editablesNames ) {
			data[ rootName ] = this.getData( { rootName } );
			editables[ rootName ] = this.ui.getEditableElement( rootName );
		}

		this.ui.destroy();

		return super.destroy()
			.then( () => {
				for ( const rootName of editablesNames ) {
					setDataInElement( editables[ rootName ], data[ rootName ] );
				}
			} );
	}

	/**
     * Creates a multi-root editor instance.
     *
     * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
     * for the created editor (on which the editor will be initialized).
     * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
     * @returns {Promise} A promise resolved once the editor is ready. The promise returns the created multi-root editor instance.
     */
	static create( sourceElements, config ) {
		return new Promise( resolve => {

			const editor = new this( sourceElements, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init() )
					.then( () => {
						const initialData = {};

						// Create initial data object containing data from all roots.
						for ( const rootName of Object.keys( sourceElements ) ) {
							initialData[ rootName ] = getDataFromElement( sourceElements[ rootName ] );
						}

						return editor.data.init( initialData );
					} )
					.then( () => {
						const trackChangesCommand = editor.commands.get( 'trackChanges' );
						const trackChangesPlugin = editor.plugins.get( 'TrackChangesEditing' );
						if ( trackChangesCommand ) {
							console.log( '#### TRACK CHANGES trackChangesCommand:', trackChangesCommand );
							trackChangesCommand.on( 'change:value', ( evt, data ) => {
								if ( evt.source.value === true ) {
									console.log( '#### this.trackChangesPlugin:', this.trackChangesPlugin );

									/* trackChangesPlugin.enableCommand( 'viewmodechange', ( executeCommand, options ) => {
										executeCommand;
										console.log( '#### executeCommand:', executeCommand );
									} );*/
									trackChangesPlugin.enableCommand( 'viewmodechange' );
									trackChangesPlugin.enableCommand( 'variableUpdate', ( executeCommand, options ) => { // Commands work on the current selection, so track changes
										// integration also work on the current selection.
										console.log( '#### variableUpdate options:', options );
										console.log( '#### variableUpdate editor:', editor );
										const range = editor.model.document.selection.getFirstRange();
										console.log( '#### variableUpdate range:', range );
										const _variable = range.start.nodeAfter;
										console.log( '#### variableUpdate variable:', _variable );

										// Get the current value of this property for given image.
										const currentValue = _variable.hasAttribute( 'data-content' )
											? _variable.getAttribute( 'data-content' )
											: 'UNRESOLVED';
										console.log( '#### variableUpdate currentValue:', currentValue );
										// If there was no change, don't do anything.
										if ( currentValue == options.value ) {
											return;
										}
										console.log( '#### variableUpdate currentValue:', currentValue );
										editor.model.change( writer => {
											console.log( '####     MARKBLOCKFORMAT' );
											// Set suggestion on the element
											trackChangesPlugin.markInlineFormat(
												range,
												{
													// Command to be executed when the suggestion is accepted.
													commandName: 'variableUpdate',
													// Parameters for the command.
													commandParams: [ { 'value': options.value } ]
												}
											);

											/* trackChangesPlugin.markInsertion(
												range
											);*/
										} );
										editor.editing.view.change( writer => {
											const viewElement = editor.editing.view.document.selection.getSelectedElement();
											console.log( '#### variableUpdate viewElement:', viewElement );
										} );
									} );
									console.log( '#### TRACK CHANGES ENABLEd' );
								} else {
									console.log( '#### TRACK CHANGES DISABLED' );
								}
							} );
						}

					} )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);

			editor.editing.view.addObserver( DoubleClickObserver );
			editor.editing.view.addObserver( MouseRightClickObserver );
		} );
	}

	static isText( obj ) {
		if ( obj instanceof Text ) {
			return true;
		}
		return false;
	}

	static isElement( obj ) {
		if ( obj instanceof Element ) {
			return true;
		}
		return false;
	}

	static disableAllKeyboard( editor ) {
		editor.commands.get( 'input' ).forceDisabled( 'input' );
		editor.commands.get( 'delete' ).forceDisabled( 'delete' );
		editor.commands.get( 'enter' ).forceDisabled( 'enter' );
		editor.commands.get( 'forwardDelete' ).forceDisabled( 'forwardDelete' );
		editor.commands.get( 'shiftEnter' ).forceDisabled( 'shiftEnter' );
	}

	static enableAllKeyboard( editor ) {
		editor.commands.get( 'input' ).clearForceDisabled( 'input' );
		editor.commands.get( 'delete' ).clearForceDisabled( 'delete' );
		editor.commands.get( 'enter' ).clearForceDisabled( 'enter' );
		editor.commands.get( 'forwardDelete' ).clearForceDisabled( 'forwardDelete' );
		editor.commands.get( 'shiftEnter' ).clearForceDisabled( 'shiftEnter' );
	}

}

mix( MultirootEditor, DataApiMixin );

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
	TableProperties,
	TableCellProperties,
	StandardWord,
	Snippet,
	Variable,
	ListOfSpeakers,
	ViewModeChange,
	Title,
	DiffByWord,
	DiffByEfficiency,
	ShowHeaderFooter,
	MergeContent,
	Alignment,
	PageBreak,
	Indent,
	IndentBlock,
	TrackChanges,
	Comments
];

// Editor configuration.
MultirootEditor.defaultConfig = {
	plugins: [ Essentials, Paragraph, Heading, Alignment, Bold, Italic, List, Link, BlockQuote, Image, ImageCaption, PageBreak, Indent, IndentBlock,
		ImageStyle, ImageToolbar, ImageUpload, Table, TableToolbar, TableProperties, TableCellProperties, MediaEmbed, EasyImage, StandardWord,
		Snippet, Variable, ViewModeChange, ListOfSpeakers, Title, DiffByWord, DiffByEfficiency, ShowHeaderFooter, MergeContent, TrackChanges, Comments ],
	toolbar: [ 'heading', '|', 'outdent', 'indent', '|', 'bold', 'italic', 'bulletedList', '|', 'alignment:left', 'alignment:right',
		'alignment:center', 'alignment:justify', '|', 'insertTable', 'undo', 'redo', 'viewmodechange', '|', 'diffbyword', 'diffbyefficiency',
		'showheaderfooter', 'merge', '|', 'pageBreak', 'trackChanges', '|', 'comment' ],
	image: {
		toolbar: [ 'imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight', '|', 'comment' ],
		styles: [ 'full', 'alignLeft', 'alignRight' ]
	},
	indentBlock: {
		offset: 1,
		unit: 'em'
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableProperties',
			'tableCellProperties'
		]
	},
	placeholder: {
		header: 'Header content goes here',
		content: 'Main content goes here',
		footer: 'Footer content goes here'
	},
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading3', view: 'h3', title: 'Header', class: 'ck-heading_heading3' }
		]
	},
	licenseKey: 'LX875u4y61mbeXF0kt2rswfbNH8IZGEhf4QH3UQ8tAaN/zuH0+tbpqQ=',
	trackChanges: {
		'SuggestionThreadView': ActaSuggestionThreadView
	}

};

