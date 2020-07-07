import SuggestionThreadView from '@ckeditor/ckeditor5-track-changes/src/ui/view/suggestionthreadview.js';

export default class ActaSuggestionThreadView extends SuggestionThreadView {

	constructor( ...args ) {
		super( ...args );
		console.log( '#### args:', args );
		const suggestionThreadView = this;

		/* this.discardButton.on( 'execute', ( evt, data ) => {
			console.log( '#### EXECUTE DISCARD' );
			if ( suggestionThreadView._model
				&& suggestionThreadView._model.data
				&& suggestionThreadView._model.data.commandName
				&& suggestionThreadView._model.data.commandName == 'variableUpdate' ) {
				console.log( '#### suggestionThreadView VARIABLEUPDATE DISCARD' );
				const value = suggestionThreadView._model.data.commandParams[ 0 ].value;
				const currentValue = suggestionThreadView._model.data.commandParams[ 0 ].currentValue;

			}

		} );*/
		const templateDefinition = {
			tag: 'div',

			attributes: {
				class: [
					'ck-suggestion-wrapper',
					this._bindTemplate.if( 'isActive', 'ck-suggestion-wrapper--active' ),
					this._bindTemplate.to( 'type', value => `ck-suggestion-${ value }` )
				],
				'data-suggestion-id': this._model.id,
				'data-thread-id': this._model.commentThread.id,
				'data-author-id': this._model.author.id,
				// Needed for managing focus after adding a new comment.
				tabindex: -1
			},

			children: [
				{
					tag: 'div',

					attributes: {
						class: [
							'ck-suggestion',
							'ck-annotation'
						]
					},

					children: [
						this.userView,
						{
							tag: 'div',

							attributes: {
								class: [ 'ck-suggestion__main', 'ck-annotation__main' ]
							},

							children: [
								{
									tag: 'div',

									attributes: {
										class: [ 'ck-suggestion__info', 'ck-annotation__info' ]
									},

									children: [
										{
											tag: 'span',

											children: [
												{
													text: this.userView.name
												}
											],

											attributes: {
												class: [ 'ck-suggestion__info-name', 'ck-annotation__info-name' ]
											}
										},
										{
											tag: 'time',

											attributes: {
												datetime: this._bindTemplate.to( 'createdAt' ),
												class: [ 'ck-comment__info-time', 'ck-annotation__info-time' ]
											},

											children: [
												{
													text: this._bindTemplate.to( 'createdAt', value => this._config.formatDateTime( value ) )
												}
											]
										}
									]
								},
								{
									tag: 'div',

									attributes: {
										class: [
											'ck-suggestion__actions',
											'ck-annotation__actions'
										]
									},

									children: [
										this.acceptButton,
										this.discardButton
									]
								},
								{
									tag: 'div',

									attributes: {
										class: [ 'ck-annotation__content-wrapper' ]
									},
									children: [
										{
											text: this._bindTemplate.to( 'descriptionParts', value => {
												// this._config.formatDateTime( value );
												console.log( '#### descriptionParts value:', value );
												console.log( '#### descriptionParts suggestionThreadView:', suggestionThreadView );
												if ( suggestionThreadView._model
													&& suggestionThreadView._model.data
													&& suggestionThreadView._model.data.commandName
													&& ( suggestionThreadView._model.data.commandName == 'variableUpdate'
														|| suggestionThreadView._model.data.commandName == 'titleUpdate'
														|| suggestionThreadView._model.data.commandName == 'lspUpdate' ) ) {
													console.log( '#### suggestionThreadView VARIABLEUPDATE' );
													const newValue = suggestionThreadView._model.data.commandParams[ 0 ].value;
													const currentValue = suggestionThreadView._model.data.commandParams[ 0 ].currentValue;
													suggestionThreadView.description = '<p><span class=\"ck-suggestion-type\">Value updated</span> '
														+ '<br/>New value: ' + newValue
														+ '<br/>Old value: ' + currentValue + '</p>';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Insert:* lsp' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Insert new list of speakers variable</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Insert:* variable' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Insert new variable</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Insert:* title' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Insert new title</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Insert:* str' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Insert new string</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Insert:* snp' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Insert new snippet</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Remove:* lsp' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Remove list of speakers variable</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Remove:* variable' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Remove variable</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Remove:* title' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Remove title</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Remove:* str' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Remove string</span> ';
												} else if ( value[ 0 ] && value[ 0 ].content && value[ 0 ].content == '*Remove:* snp' ) {
													suggestionThreadView.description =
															'<p><span class=\"ck-suggestion-type\">Remove snippet</span> ';
												}
											} )
										}
									]
								}
							]
						}
					]
				},
				this.commentsListView,
				this.commentThreadInputView
			]
		};

		this.setTemplate( templateDefinition );

	}
}
