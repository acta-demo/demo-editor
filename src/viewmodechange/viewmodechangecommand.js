import Command from '@ckeditor/ckeditor5-core/src/command';
import UIElement from '@ckeditor/ckeditor5-engine/src/view/uielement';
import Element from '@ckeditor/ckeditor5-engine/src/view/element';

export default class ViewModeChangeCommand extends Command {
	execute( { value } ) {
		const editor = this.editor;

		editor.set( 'viewmode', value );
		console.log( '#### ViewModeChangeCommand value:', value );

		/*
		editor.model.change(modelWriter => {
			const doc = ['header', 'content', 'footer'];
			doc.forEach( docelement => {
				const root = editor.model.document.getRoot(docelement);
				const arrayElements = root.getChildren();//get paragraphs
				for (const paragraph_element of arrayElements) {
					const inner_elements = paragraph_element.getChildren();
					for (const inner_element of inner_elements) {
						console.log('#### ViewModeChangeCommand inner_element:', inner_element);
						if (inner_element.name == 'str') {
							modelWriter.setAttribute('data-viewmode', value, inner_element);
							console.log('#### ViewModeChangeCommand str inner_element:', inner_element);
						}
					}
				}

			});
		});
		*/
		editor.editing.view.change( viewWriter => {
			const doc = [ 'header', 'content', 'footer' ];
			doc.forEach( docelement => {
				const root = viewWriter.document.getRoot( docelement );
				const arrayElements = root.getChildren();
				for ( const paragraph_element of arrayElements ) {
					const inner_elements = paragraph_element.getChildren();
					console.log( '#### ViewModeChangeCommand inner_elements:', inner_elements );
					for ( const inner_element of inner_elements ) {
						console.log( '#### ViewModeChangeCommand inner_element:', inner_element );
						if ( inner_element.name == 'span' && inner_element.getAttribute( 'data-type' ) === 'str' ) { // Strings, References, etc.
							console.log( '#### ViewModeChangeCommand str' );
							viewWriter.setAttribute( 'data-viewmode', value, inner_element );
							// inner_element._setAttribute('data-viewmode', value);
							this.handlespanStr( inner_element, value, viewWriter );
						} else if ( inner_element.name == 'div' ) { // Snippets
							console.log( '#### ViewModeChangeCommand div' );
							viewWriter.setAttribute( 'data-viewmode', value, inner_element );
							this.handlediv( inner_element, value, viewWriter );
						} else if ( inner_element.name == 'span' && inner_element.getAttribute( 'data-type' ) === 'var_sp' ) {
							console.log( '#### ViewModeChangeCommand var_ inner_element:', inner_element );
							viewWriter.setAttribute( 'data-viewmode', value, inner_element );
							this.handlespanVarSp( inner_element, value, viewWriter );
						} else if ( inner_element.name == 'span'
							&& inner_element.getAttribute( 'data-type' )
							&& inner_element.getAttribute( 'data-type' ).startsWith( 'var_' ) ) {
							console.log( '#### ViewModeChangeCommand var_ inner_element:', inner_element );
							viewWriter.setAttribute( 'data-viewmode', value, inner_element );
							this.handlespanVar( inner_element, value, viewWriter );
						} else if ( inner_element.name == 'span' && inner_element.getAttribute( 'data-type' ) === 'title' ) {
							console.log( '#### ViewModeChangeCommand var_ inner_element:', inner_element );
							viewWriter.setAttribute( 'data-viewmode', value, inner_element );
							this.handlespanTitle( inner_element, value, viewWriter );
						} else if ( inner_element.name == 'table' ) {
							console.log( '#### ViewModeChangeCommand table inner_element:', inner_element );
							// viewWriter.setAttribute( 'data-viewmode', value, inner_element );
							this.handleTable( inner_element, value, viewWriter );
						}
					}
				}

			} );
		} );

	}

	refresh() {
		this.isEnabled = true;
	}

	handleTable( propertyName, value, viewWriter ) {
		const childsTBody = propertyName.getChildren();
		console.log( '#### handleTable childsTBody:', childsTBody );
		for ( const elementTBody of childsTBody ) {
			const childsTr = elementTBody.getChildren();
			console.log( '#### handleTable childsTr:', childsTr );
			for ( const elementTr of childsTr ) {
				const childsTd = elementTr.getChildren();
				console.log( '#### handleTable childsTd:', childsTd );
				for ( const elementTd of childsTd ) {
					const paragraphs = elementTd.getChildren();
					console.log( '#### handleTable paragraphs:', paragraphs );
					for ( const paragraph of paragraphs ) {
						const inner_elements = paragraph.getChildren();
						for ( const inner_element of inner_elements ) {
							console.log( '#### handleTable inner_element:', inner_element );
							if ( inner_element.name == 'span' && inner_element.getAttribute( 'data-type' ) === 'str' ) { // Strings, References, etc.
								console.log( '#### handleTable str' );
								viewWriter.setAttribute( 'data-viewmode', value, inner_element );
								// inner_element._setAttribute('data-viewmode', value);
								this.handlespanStr( inner_element, value, viewWriter );
							} else if ( inner_element.name == 'div' ) { // Snippets
								console.log( '#### handleTable div' );
								viewWriter.setAttribute( 'data-viewmode', value, inner_element );
								this.handlediv( inner_element, value, viewWriter );
							} else if ( inner_element.name == 'span' && inner_element.getAttribute( 'data-type' ) === 'var_sp' ) {
								console.log( '#### handleTable var_ inner_element:', inner_element );
								viewWriter.setAttribute( 'data-viewmode', value, inner_element );
								this.handlespanVarSp( inner_element, value, viewWriter );
							} else if ( inner_element.name == 'span'
								&& inner_element.getAttribute( 'data-type' )
								&& inner_element.getAttribute( 'data-type' ).startsWith( 'var_' ) ) {
								console.log( '#### handleTable var_ inner_element:', inner_element );
								viewWriter.setAttribute( 'data-viewmode', value, inner_element );
								this.handlespanVar( inner_element, value, viewWriter );
							} else if ( inner_element.name == 'span' && inner_element.getAttribute( 'data-type' )
								&& inner_element.getAttribute( 'data-type' ) === 'title' ) {
								console.log( '#### handleTable var_ inner_element:', inner_element );
								viewWriter.setAttribute( 'data-viewmode', value, inner_element );
								this.handlespanTitle( inner_element, value, viewWriter );
							}
						}
					}
				}
			}
		}
	}

	handlespanStr( propertyName, viewmode, viewWriter ) {
		const _data = propertyName.getChild( 0 )._textData;
		const _class = propertyName.getAttribute( 'class' );
		if ( viewmode ) {
			if ( viewmode === 'coloredview' ) {
				const _dataSimple = _data.replace( /(^{str:[^:]*:)|(}$)/g, '' );
				propertyName.getChild( 0 )._data = _dataSimple;
				if ( _class.includes( 'standardword_simpleview', propertyName ) ) {
					viewWriter.removeClass( 'standardword_simpleview', propertyName );
				}
			} else if ( viewmode === 'infoview' && !/(^{str:[^:]*:)|(}$)/g.test( propertyName.getChild( 0 )._data ) ) {
				const _id = propertyName.getAttribute( 'data-id' );
				propertyName.getChild( 0 )._data = '{str:' + _id + ':' + propertyName.getChild( 0 )._data + '}';
				if ( _class.includes( 'standardword_simpleview', propertyName ) ) {
					viewWriter.removeClass( 'standardword_simpleview', propertyName );
				}
			} else if ( viewmode === 'simpleview' && /standardword/g.test( propertyName.getAttribute( 'class' ) ) ) {
				const _dataSimple = _data.replace( /(^{str:[^:]*:)|(}$)/g, '' );
				propertyName.getChild( 0 )._data = _dataSimple;
				if ( !_class.includes( 'standardword_simpleview', propertyName ) ) {
					viewWriter.addClass( 'standardword_simpleview', propertyName );
				}
				// const _class = propertyName.getAttribute( 'class' ).replace( /standardword/g, '' ).replace( /\s\s+/g, ' ' ).trim();
				// propertyName._setAttribute( 'class', _class );
			}
		}

	}

	handlespanVar( propertyName, viewmode, viewWriter ) {
		const _data = propertyName.getChild( 0 )._textData;
		const _class = propertyName.getAttribute( 'class' );
		const dataType = propertyName.getAttribute( 'data-type' );
		if ( viewmode ) {
			if ( viewmode === 'coloredview' ) {
				const _dataSimple = ( dataType === 'var_time' )
					? _data.replace( /(^({var_date:[^:]*:)|({var_time:[^:]*:)|({var_str:[^:]*:))|(}$)/g, '' ).replace( /['"]+/g, '' )
					: _data.replace( /(^({var_date:[^:]*:)|({var_time:[^:]*:)|({var_str:[^:]*:))|(}$)/g, '' );
				propertyName.getChild( 0 )._data = _dataSimple;
				if ( _class.includes( 'variable_simpleview' ) ) {
					viewWriter.removeClass( 'variable_simpleview', propertyName );
				}
			} else if ( viewmode === 'infoview' && !/(^({var_date:[^:]*:)|({var_time:[^:]*:)|({var_str:[^:]*:))|(}$)/g.test( propertyName.getChild( 0 )._data ) ) {
				const _id = propertyName.getAttribute( 'data-id' );
				if ( dataType === 'var_time' && propertyName.getChild( 0 )._data !== 'UNRESOLVED' ) {
					propertyName.getChild( 0 )._data = '{' + dataType + ':' + _id + ':"' + propertyName.getChild( 0 )._data + '"}';
				} else {
					propertyName.getChild( 0 )._data = '{' + dataType + ':' + _id + ':' + propertyName.getChild( 0 )._data + '}';
				}
				if ( _class.includes( 'variable_simpleview' ) ) {
					viewWriter.removeClass( 'variable_simpleview', propertyName );
				}
			} else if ( viewmode === 'simpleview' && /variable/g.test( propertyName.getAttribute( 'class' ) ) ) {
				const _dataSimple = ( dataType === 'var_time' )
					? _data.replace( /(^({var_date:[^:]*:)|({var_time:[^:]*:)|({var_str:[^:]*:))|(}$)/g, '' ).replace( /['"]+/g, '' )
					: _data.replace( /(^({var_date:[^:]*:)|({var_time:[^:]*:)|({var_str:[^:]*:))|(}$)/g, '' );
				propertyName.getChild( 0 )._data = _dataSimple;
				if ( !_class.includes( 'variable_simpleview' ) ) {
					viewWriter.addClass( 'variable_simpleview', propertyName );
				}
			}
		}

	}

	handlespanVarSp( propertyName, viewmode, viewWriter ) {
		const _data = propertyName.getChild( 0 )._textData;
		const _class = propertyName.getAttribute( 'class' );
		if ( viewmode ) {
			if ( viewmode === 'coloredview' ) {
				const _dataSimple = _data.replace( /(^{var_sp:[^:]*:)|(}$)/g, '' );
				propertyName.getChild( 0 )._data = _dataSimple;
				if ( _class.includes( 'lsp_simpleview' ) ) {
					viewWriter.removeClass( 'lsp_simpleview', propertyName );
				}
			} else if ( viewmode === 'infoview' && !/(^{var_sp:[^:]*:)|(}$)/g.test( propertyName.getChild( 0 )._data ) ) {
				const _id = propertyName.getAttribute( 'data-id' );
				propertyName.getChild( 0 )._data = '{var_sp:' + _id + ':' + propertyName.getChild( 0 )._data + '}';
				if ( _class.includes( 'lsp_simpleview' ) ) {
					viewWriter.removeClass( 'lsp_simpleview', propertyName );
				}
			} else if ( viewmode === 'simpleview' && /lsp/g.test( propertyName.getAttribute( 'class' ) ) ) {
				const _dataSimple = _data.replace( /(^{var_sp:[^:]*:)|(}$)/g, '' );
				propertyName.getChild( 0 )._data = _dataSimple;
				if ( !_class.includes( 'lsp_simpleview' ) ) {
					viewWriter.addClass( 'lsp_simpleview', propertyName );
				}
			}
		}

	}

	handlespanTitle( propertyName, viewmode, viewWriter ) {
		const _data = propertyName.getChild( 0 )._textData;
		const _class = propertyName.getAttribute( 'class' );
		if ( viewmode ) {
			if ( viewmode === 'coloredview' ) {
				const _dataSimple = _data.replace( /(^{title:[^:]*:)|(}$)/g, '' );
				propertyName.getChild( 0 )._data = _dataSimple;
				if ( _class.includes( 'title_simpleview' ) ) {
					viewWriter.removeClass( 'title_simpleview', propertyName );
				}
			} else if ( viewmode === 'infoview' && !/(^{title:[^:]*:)|(}$)/g.test( propertyName.getChild( 0 )._data ) ) {
				const _id = propertyName.getAttribute( 'data-id' );
				propertyName.getChild( 0 )._data = '{title:' + _id + ':' + propertyName.getChild( 0 )._data + '}';
				if ( _class.includes( 'title_simpleview' ) ) {
					viewWriter.removeClass( 'title_simpleview', propertyName );
				}
			} else if ( viewmode === 'simpleview' && /title/g.test( propertyName.getAttribute( 'class' ) ) ) {
				const _dataSimple = _data.replace( /(^{title:[^:]*:)|(}$)/g, '' );
				propertyName.getChild( 0 )._data = _dataSimple;
				if ( !_class.includes( 'title_simpleview' ) ) {
					viewWriter.addClass( 'title_simpleview', propertyName );
				}
			}
		}

	}

	handlediv( divelement, viewmode, viewWriter ) {
		console.log( '#### handlediv divelement:', divelement );
		console.log( '#### handlediv viewmode:', viewmode );
		const _id = divelement.getAttribute( 'data-id' );
		const _class = divelement.getAttribute( 'class' );
		if ( viewmode === 'coloredview' && divelement.getAttribute( 'data-type' ) === 'snp' ) {
			console.log( '#### handlediv COLOREDVIEW' );
			if ( _class.includes( 'snippet_simpleview' ) ) {
				viewWriter.removeClass( 'snippet_simpleview', divelement );
			}
			viewWriter.setAttribute( 'data-before', '', divelement );
			viewWriter.setAttribute( 'data-after', '', divelement );
		} else if ( viewmode === 'simpleview' && divelement.getAttribute( 'data-type' ) === 'snp' ) {
			console.log( '#### handlediv SIMPLEVIEW' );
			// _class = _class.replace( 'snippet', '' );
			if ( !_class.includes( 'snippet_simpleview' ) ) {
				viewWriter.addClass( 'snippet_simpleview', divelement );
			}
			viewWriter.setAttribute( 'data-before', '', divelement );
			viewWriter.setAttribute( 'data-after', '', divelement );
		} else if ( viewmode === 'infoview' && divelement.getAttribute( 'data-type' ) === 'snp' ) {
			console.log( '#### handlediv INFOVIEW' );
			if ( _class.includes( 'snippet_simpleview' ) ) {
				viewWriter.removeClass( 'snippet_simpleview', divelement );
			}
			viewWriter.setAttribute( 'data-before', '{snp:' + _id + ':', divelement );
			viewWriter.setAttribute( 'data-after', '', divelement );
		}

		const childs = divelement.getChildren();
		for ( const element of childs ) {
			console.log( '#### element:', element );
			if ( element instanceof UIElement && viewmode !== 'infoview' ) {
				viewWriter.setAttribute( 'style', 'display:none;', element );
			} else if ( element instanceof UIElement && viewmode === 'infoview' ) {
				console.log( '#### element inside div:', element );
				viewWriter.removeAttribute( 'style', element );
			} else if ( element instanceof Element && element.name === 'span' && element.getAttribute( 'data-type' ) === 'str' ) {
				console.log( '#### element inside div:', element );
				this.handlespanStr( element, viewmode, viewWriter );

			} else if ( element instanceof Element && element.name === 'span' && element.getAttribute( 'data-type' ) === 'var_sp' ) {
				console.log( '#### element inside div:', element );
				this.handlespanVarSp( element, viewmode, viewWriter );

			} else if ( element instanceof Element && element.name === 'span'
				&& element.getAttribute( 'data-type' )
				&& element.getAttribute( 'data-type' ).startsWith( 'var_' ) ) {
				console.log( '#### element inside div:', element );
				this.handlespanVar( element, viewmode, viewWriter );

			} else if ( element instanceof Element && element.name === 'span' && element.getAttribute( 'data-type' ) === 'title' ) {
				console.log( '#### element inside div:', element );
				this.handlespanTitle( element, viewmode, viewWriter );

			} else if ( element instanceof Element && element.name === 'span' && element.getAttribute( 'data-type' ) === 'right-bracket' ) {
				console.log( '#### element inside div:', element );
				if ( viewmode === 'infoview' ) {
					viewWriter.setAttribute( 'style', 'display:inline', element );
				} else {
					viewWriter.setAttribute( 'style', 'display:none', element );
				}

			}

			// const _datatype = spanelement.getAttribute('data-type');
		}

		/* const _data = propertyName.getChild(0)._textData;
		const _class = propertyName.getAttribute('class');
		if (viewmode) {
			if (viewmode === 'coloredview') {
				const _dataSimple = _data.replace(/(^{str:[^:]*:)|(}$)/g, '');
				propertyName.getChild(0)._data = _dataSimple;
				if (!_class.includes('standardword')) {
					propertyName._setAttribute('class', 'standardword ' + _class);
				}
			} else if (viewmode === 'infoview' && !/(^{str:[^:]*:)|(}$)/g.test(propertyName.getChild(0)._data)) {
				const _id = propertyName.getAttribute('data-id');
				propertyName.getChild(0)._data = '{str:' + _id + ':' + propertyName.getChild(0)._data + '}';
				if (!_class.includes('standardword')) {
					propertyName._setAttribute('class', 'standardword ' + _class);
				}
			} else if (viewmode === 'simpleview' && /standardword/g.test(propertyName.getAttribute('class'))) {
				const _dataSimple = _data.replace(/(^{str:[^:]*:)|(}$)/g, '');
				propertyName.getChild(0)._data = _dataSimple;
				const _class = propertyName.getAttribute('class').replace(/standardword/g, '').replace(/\s\s+/g, ' ').trim();
				propertyName._setAttribute('class', _class);
			}
		}*/

	}
}
