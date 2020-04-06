import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import infoviewIcon from './svg/infoview.svg';
import coloredviewIcon from './svg/coloredview.svg';
import simpleviewIcon from './svg/simpleview.svg';
import ViewModeChangeCommand from './viewmodechangecommand';


const icons = new Map( [
	[ 'infoview', infoviewIcon ],
	[ 'coloredview', coloredviewIcon ],
	[ 'simpleview', simpleviewIcon ]
] );

export default class ViewModeChangeUI extends Plugin {

	static get currentval() {
		return (typeof this._currentval !== 'undefined') ? this._currentval : 'infoview';
	}

	static set currentval(currentval) {
		this._currentval = currentval;
	}

	static get pluginButtons() {
		if (!this._pluginButtons)
			this._pluginButtons = [];

		return this._pluginButtons;
	}

	get localizedOptionTitles() {
		const t = this.editor.t;

		return {
			'infoview': t('infoview'),
			'coloredview': t('coloredview'),
			'simpleview': t('simpleview')
		};
	}

	static get pluginName() {
		return 'ViewModeChangeUI';
	}

	_addButton( option ) {
		const editor = this.editor;

		editor.ui.componentFactory.add(`viewmode:${ option }`, locale => {
			const command = editor.commands.get('viewmodechange');
			const buttonView = new ButtonView(locale);

			buttonView.set({
				label: this.localizedOptionTitles[option],
				icon: icons.get(option),
				tooltip: true,
				isToggleable: true,
				_id: option
			});


			// Bind button model to command.
			buttonView.bind('isOn').to(command, 'value', value => value === option);

			// Execute command.
			this.listenTo(buttonView, 'execute', () => {
				editor.execute('viewmodechange', { value: option });
				buttonView.isOn = true;	
				buttonView.isEnabled = false;
				ViewModeChangeUI.pluginButtons.filter(obj => {
					return obj._id !== option;
				}).forEach(function (btn) {
					btn.isOn = false;
					btn.isEnabled = true;
				});
				editor.editing.view.focus();
			});

			ViewModeChangeUI.pluginButtons.push( buttonView );
			return buttonView;
		});
	}

	init() {
		this.editor.commands.add('viewmodechange', new ViewModeChangeCommand(this.editor));
		const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;
		const t = editor.t;
		const command = editor.commands.get( 'viewmodechange' );
		editor.config.define('viewchangeConfig', {
			types: ['simpleview', 'infoview', 'coloredview']
		});
		const options = editor.config.get('viewchangeConfig.types');

		options.forEach( option => this._addButton( option ) );

		componentFactory.add( 'viewmodechange', locale => {
			const dropdownView = createDropdown( locale );

			// Add existing viewmodechange buttons to dropdown's toolbar.
			const buttons = options.map( option => componentFactory.create( `viewmode:${ option }` ) );
			addToolbarToDropdown( dropdownView, buttons );

			// Configure dropdown properties an behavior.
			dropdownView.buttonView.set( {
				label: t( 'Set viewmode' ),
				tooltip: true
			} );

			dropdownView.toolbarView.isVertical = true;
			dropdownView.toolbarView.ariaLabel = t( 'View mode toolbar' );

			// Enable button if any of the buttons is enabled.
			dropdownView.bind( 'isEnabled' ).toMany( buttons, 'isEnabled', ( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled ) );

			// Change icon to reflect current selection's viewmode.
			dropdownView.buttonView.bind( 'icon' ).toMany( buttons, 'isOn', ( ...areActive ) => {
				// Get the index of an active button.
				const index = areActive.findIndex( value => value );

				// If none of the commands is active, display either defaultIcon or the first button's icon.
				if ( index < 0 ) {
					buttons.filter(obj => {
						return obj._id === 'infoview';
					}).forEach(function (btn) {
						btn.isOn = true;
						btn.isEnabled = false;
					});
					return infoviewIcon;
				}

				// Return active button's icon.
				return buttons[ index ].icon;
			} );

			return dropdownView;
		} );
	}
}
