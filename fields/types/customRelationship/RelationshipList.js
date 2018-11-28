import React from 'react';
import { relationshipListButton } from './styles';
class RelationshipList extends React.Component {
	constructor (props) {
		super(props);

		this.addItem = this.addItem.bind(this);
	}

	addItem (id) {
		this.props.onSelect(id);
	}

	render () {
		const { items } = this.props;

		return (
			<div>
				{items.map(item => (
					<button
						key={item.id}
						onClick={() => this.addItem(item.id)}
						style={relationshipListButton}
					>
						{item.name}
					</button>
				))}
			</div>
		);
	}
}

module.exports = RelationshipList;
