import async from 'async';
import Field from '../Field';
import { listsByKey } from '../../../admin/client/utils/lists';
import React from 'react';
import Select from 'react-select';
import xhr from 'xhr';
import {
	Button,
	FormInput,
	InlineGroup as Group,
	InlineGroupSection as Section,
} from '../../../admin/client/App/elemental';
import _ from 'lodash';
import { Sortable, PANE_SIZE } from './SortablePane';
import {
	addButtonStyle,
	modalStyles,
	closeModalButton,
	closeModalButtonText,
} from './styles';
import RelationshipList from './RelationshipList';

function compareValues (current, next) {
	const currentLength = current ? current.length : 0;
	const nextLength = next ? next.length : 0;
	if (currentLength !== nextLength) return false;
	for (let i = 0; i < currentLength; i++) {
		if (current[i] !== next[i]) return false;
	}
	return true;
}

module.exports = Field.create({
	displayName: 'RelationshipField',
	statics: {
		type: 'Relationship',
	},

	getInitialState () {
		return {
			value: null,
			createIsOpen: false,
			relationshipModalOpened: false,
		};
	},

	componentDidMount () {
		this._itemsCache = {};
		this.loadValue(this.props.value);
		this.loadOptions('', (err, data) => {
			if (err || !data.complete) {
				return;
			}

			this.setState({
				options: data.options,
			});
		});
	},

	componentWillReceiveProps (nextProps) {
		if (
			nextProps.value === this.props.value
			|| (nextProps.many && compareValues(this.props.value, nextProps.value))
		) {
			return;
		}
		this.loadValue(nextProps.value);
	},

	shouldCollapse () {
		if (this.props.many) {
			// many:true relationships have an Array for a value
			return this.props.collapse && !this.props.value.length;
		}
		return this.props.collapse && !this.props.value;
	},

	buildFilters () {
		var filters = {};

		_.forEach(
			this.props.filters,
			(value, key) => {
				if (typeof value === 'string' && value[0] === ':') {
					var fieldName = value.slice(1);

					var val = this.props.values[fieldName];
					if (val) {
						filters[key] = val;
						return;
					}

					// check if filtering by id and item was already saved
					if (fieldName === '_id' && Keystone.item) {
						filters[key] = Keystone.item.id;
						return;
					}
				} else {
					filters[key] = value;
				}
			},
			this
		);

		var parts = [];

		_.forEach(filters, function (val, key) {
			parts.push('filters[' + key + '][value]=' + encodeURIComponent(val));
		});

		return parts.join('&');
	},

	cacheItem (item) {
		item.href
			= Keystone.adminPath + '/' + this.props.refList.path + '/' + item.id;
		this._itemsCache[item.id] = item;
	},

	loadValue (values) {
		if (!values) {
			return this.setState({
				loading: false,
				value: null,
			});
		}
		values = Array.isArray(values) ? values : values.split(',');
		const cachedValues = values.map(i => this._itemsCache[i]).filter(i => i);
		if (cachedValues.length === values.length) {
			this.setState({
				loading: false,
				value: this.props.many ? cachedValues : cachedValues[0],
			});
			return;
		}
		this.setState({
			loading: true,
			value: null,
		});
		async.map(
			values,
			(value, done) => {
				xhr(
					{
						url:
							Keystone.adminPath
							+ '/api/'
							+ this.props.refList.path
							+ '/'
							+ value
							+ '?basic',
						responseType: 'json',
					},
					(err, resp, data) => {
						if (err || !data) return done(err);
						this.cacheItem(data);
						done(err, data);
					}
				);
			},
			(err, expanded) => {

				if (!this.isMounted()) return;
				this.setState({
					loading: false,
					value: this.props.many ? expanded : expanded[0],
				});
			}
		);
	},

	// NOTE: this seems like the wrong way to add options to the Select
	loadOptionsCallback: {},
	loadOptions (input, callback) {
		// NOTE: this seems like the wrong way to add options to the Select
		this.loadOptionsCallback = callback;

		const filters = this.buildFilters();
		xhr(
			{
				url:
					Keystone.adminPath
					+ '/api/'
					+ this.props.refList.path
					+ '?basic&search='
					+ input
					+ '&'
					+ filters,
				responseType: 'json',
			},
			(err, resp, data) => {
				if (err) {
					console.error('Error loading items:', err);
					return callback(null, []);
				}
				data.results.forEach(this.cacheItem);
				callback(null, {
					options: data.results,
					complete: data.results.length === data.count,
				});
			}
		);
	},

	valueChanged (value) {
		this.props.onChange({
			path: this.props.path,
			value: value,
		});
	},

	openCreate () {
		this.setState({
			createIsOpen: true,
		});
	},

	closeCreate () {
		this.setState({
			createIsOpen: false,
		});
	},

	onCreate (item) {
		this.cacheItem(item);
		if (Array.isArray(this.state.value)) {
			// For many relationships, append the new item to the end
			const values = this.state.value.map(item => item.id);
			values.push(item.id);
			this.valueChanged(values.join(','));
		} else {
			this.valueChanged(item.id);
		}

		// NOTE: this seems like the wrong way to add options to the Select
		this.loadOptionsCallback(null, {
			complete: true,
			options: Object.keys(this._itemsCache).map(k => this._itemsCache[k]),
		});
		this.closeCreate();
	},

	onOrderChange (value) {
		this.valueChanged(value);
	},

	removeRelationship (id) {
		const currentValues = this.state.value.map(k => k.id);
		const index = currentValues.indexOf(id);
		if (index === -1) {
			return;
		}
		currentValues.splice(index, 1);

		this.valueChanged(currentValues);
	},

	toggleRelationshipModal (e) {
		e.preventDefault();
		e.stopPropagation();

		this.setState(state => ({
			relationshipModalOpened: !state.relationshipModalOpened,
		}));
	},

	addRelationship (id) {
		const currentValues = this.state.value.map(k => k.id);

		this.valueChanged([...currentValues, id]);
	},

	renderSelect (noedit) {
		if (!this.state.value || !this.state.options) {
			return null;
		}

		const emptyValue
			= Array.isArray(this.state.value) && !this.state.value.length;
		const allSelected = this.state.value.length === this.state.options.length;
		const selected = this.state.value.map(k => k.id);
		const options = [...this.state.options].filter(
			k => !selected.includes(k.id)
		);
		return (
			<div>
				{this.state.relationshipModalOpened && (
					<div
						className="modalWrapper"
						style={modalStyles}
						onClick={this.toggleRelationshipModal}
					>
						<div
							className="modalContent"
							style={{
								width: '50%',
								height: '50%',
								backgroundColor: '#fff',
								position: 'relative',
							}}
						>
							<button
								style={closeModalButton}
								onClick={this.toggleRelationshipModal}
							>
								<div style={closeModalButtonText}>+</div>
							</button>
							<RelationshipList
								items={options}
								onSelect={this.addRelationship}
							/>
						</div>
					</div>
				)}
				<div
					style={{
						minHeight: emptyValue ? 0 : PANE_SIZE + 40,
						display: 'flex',
						padding: '20px',
					}}
				>
					<Sortable
						items={this.state.value}
						onRemove={this.removeRelationship}
						onOrderChange={this.onOrderChange}
					/>
				</div>
				{!allSelected && (
					<button style={addButtonStyle} onClick={this.toggleRelationshipModal}>
						+
					</button>
				)}
			</div>
		);
		// return (
		// 	<div>
		// 		{/* This input ensures that an empty value is submitted when no related items are selected */}
		// 		{emptyValueInput}
		// 		{/* This input element fools Safari's autocorrect in certain situations that completely break react-select */}
		// 		<input
		// 			type="text"
		// 			style={{
		// 				position: 'absolute',
		// 				width: 1,
		// 				height: 1,
		// 				zIndex: -1,
		// 				opacity: 0,
		// 			}}
		// 			tabIndex="-1"
		// 		/>
		// 		<Select.Async
		// 			multi={this.props.many}
		// 			disabled={noedit}
		// 			loadOptions={this.loadOptions}
		// 			labelKey="name"
		// 			name={inputName}
		// 			onChange={this.valueChanged}
		// 			simpleValue
		// 			value={this.state.value}
		// 			valueKey="id"
		// 		/>
		// 	</div>
		// );
	},

	renderInputGroup () {
		// TODO: find better solution
		//   when importing the CreateForm using: import CreateForm from '../../../admin/client/App/shared/CreateForm';
		//   CreateForm was imported as a blank object. This stack overflow post suggested lazilly requiring it:
		// http://stackoverflow.com/questions/29807664/cyclic-dependency-returns-empty-object-in-react-native
		// TODO: Implement this somewhere higher in the app, it breaks the encapsulation of the RelationshipField component
		const CreateForm = require('../../../admin/client/App/shared/CreateForm');
		return (
			<Group block>
				<Section grow>{this.renderSelect()}</Section>
				<Section>
					<Button onClick={this.openCreate}>+</Button>
				</Section>
				<CreateForm
					list={listsByKey[this.props.refList.key]}
					isOpen={this.state.createIsOpen}
					onCreate={this.onCreate}
					onCancel={this.closeCreate}
				/>
			</Group>
		);
	},

	renderValue () {
		const { many } = this.props;
		const { value } = this.state;
		const props = {
			children: value ? value.name : null,
			component: value ? 'a' : 'span',
			href: value ? value.href : null,
			noedit: true,
		};

		return many ? this.renderSelect(true) : <FormInput {...props} />;
	},

	renderField () {
		if (this.props.createInline) {
			return this.renderInputGroup();
		} else {
			return this.renderSelect();
		}
	},
});
