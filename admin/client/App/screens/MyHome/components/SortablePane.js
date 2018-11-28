import React, { Component, PropTypes } from 'react';

import { SortablePane, Pane } from 'react-sortable-pane';

export const PANE_SIZE = 160;

class Sortable extends Component {
	constructor (props) {
		super(props);

		this.generatePanes = this.generatePanes.bind(this);
		this.handleOrderChange = this.handleOrderChange.bind(this);
	}

	handleOrderChange (e, id, target, newOrder) {
		console.log(newOrder);
	}

	generatePanes (items) {
		if (!items) {
			return null;
		}
		return items.map((item, i) => {
			return (
				<Pane
					key={item.id}
					size={{ width: PANE_SIZE, height: PANE_SIZE }}
					resizable={{ x: false, y: false, xy: false }}
					style={{
						borderRadius: 5,
						opacity: 1,
						border: '3px dotted #ccc',
						backgroundColor: 'rgb(245,245,245)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
					}}
				>
					{item.name}
				</Pane>
			);
		});
	}

	render () {
		const panes = this.generatePanes(this.props.items);
		const defaultOrder = this.props.items.map(k => k.id);
		return (
			<SortablePane
				direction="horizontal"
				margin={20}
				defaultOrder={defaultOrder}
				onDragStop={this.handleOrderChange}
			>
				{panes}
			</SortablePane>
		);
	}
}

module.exports = {
	Sortable,
	PANE_SIZE,
};
