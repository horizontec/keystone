import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router';

class ListWithSingleItem extends React.Component {
  render() {
    const { hasCreatedHomePage, path, href, spinner, count } = this.props

		var opts = {
			'data-list-path': path,
    };
    // HORIZON TODO: translations
    const label = hasCreatedHomePage ? 'Edit home page' : 'Create home page'
    if(!hasCreatedHomePage) {
      return (
        <div className="dashboard-group__lists">
          <div className="dashboard-group__list" {...opts}>
            <span className="dashboard-group__list-inner">
              <div className="dashboard-group__list-tile">
                <div className="dashboard-group__list-label">{label}</div>
                <div className="dashboard-group__list-count">{spinner || count}</div>
              </div>
              <Link
                  to={href + '?create'}
                  className="dashboard-group__list-create octicon octicon-plus"
                  title="Create"
                  tabIndex="-1"
                />
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-group__lists">
        <div className="dashboard-group__list" {...opts}>
          <span className="dashboard-group__list-inner">
            <Link to={href} className="dashboard-group__list-tile" >
              <div className="dashboard-group__list-label">{label}</div>
              <div className="dashboard-group__list-count">{spinner || count}</div>
            </Link>

          </span>
        </div>
      </div>
    );

  }
}

ListWithSingleItem.propTypes = {
  count: React.PropTypes.string,
  hasCreatedHomePage: React.PropTypes.bool,
  href: React.PropTypes.string,
  label: React.PropTypes.string,
  path: React.PropTypes.string,
  spinner: React.PropTypes.object,
}

export default ListWithSingleItem